"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@nextui-org/react";

// Only iPhones and iPads need the install steps, so only they download that popover
const IosInstallHint = dynamic(() => import("./IosInstallHint"), {
  ssr: false,
});

// Chrome's event when the site can be installed; not in TypeScript's DOM types
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Kept by the script at the top of the page (layout.tsx), which catches the event even
// when it fires before this button exists, and announces it with "installpromptready"
declare global {
  interface Window {
    __installPrompt?: BeforeInstallPromptEvent;
  }
}

// Material Icons' "install_mobile" (Apache-2.0): a phone with a down arrow
const InstallIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M17 18H7V6h7V1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-5h-2z" />
    <path d="m18 14 5-5-1.41-1.41L19 10.17V3h-2v7.17l-2.59-2.58L13 9z" />
  </svg>
);

// Installs the site as an app (a PWA: public/manifest.json and public/sw.js).
// Android and desktop Chrome, Edge, Samsung: shown once the browser reports the site as
// installable, and opens the browser's own install dialog. iPhone and iPad: always
// shown, and explains the steps, as iOS has no install dialog. Hidden when the site
// already runs as an installed app, and in browsers that cannot install (Firefox).
const InstallButton = () => {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);
    // iPadOS reports itself as a Mac, so a Mac with a touch screen is an iPad
    setIsIos(
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    );

    // An announcement that came before this button started, and any that come later
    const takePrompt = () => setInstallPrompt(window.__installPrompt ?? null);
    takePrompt();
    const markInstalled = () => {
      window.__installPrompt = undefined;
      setIsInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener("installpromptready", takePrompt);
    window.addEventListener("appinstalled", markInstalled);
    return () => {
      window.removeEventListener("installpromptready", takePrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  if (isInstalled) return null;

  if (!installPrompt && !isIos) return null;

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    // the browser's prompt can be shown only once; it sends a new event when allowed again
    window.__installPrompt = undefined;
    setInstallPrompt(null);
  };

  // title gives desktop mice the hint a tooltip would, without a tooltip's code
  const button = (
    <Button
      isIconOnly
      variant="light"
      size="sm"
      aria-label="Uygulamayı yükle"
      title="Uygulamayı yükle"
      onPress={installPrompt ? install : undefined}
    >
      <InstallIcon />
    </Button>
  );

  return installPrompt ? button : <IosInstallHint trigger={button} />;
};

export default InstallButton;

import NavBar from "./components/NavBar";
import ServiceWorker from "./components/ServiceWorker";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

// Next.js puts these links into the page as written, without the base path the site
// lives under (/marketScraper), so it is added here
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata = {
  title: "Market Karşılaştırma",
  description:
    "A101, CarrefourSA, Getir, Migros ve ŞOK fiyatlarını yan yana karşılaştırın.",
  // installable as an app: name, icons and colors are in public/manifest.json
  manifest: `${base}/manifest.json`,
  themeColor: "#16a34a",
  // iPhone: full-screen launch and the name under the home-screen icon; the icon
  // itself is app/apple-icon.png, which Next.js links with the base path by itself
  appleWebApp: {
    capable: true,
    title: "Market",
    statusBarStyle: "default",
  },
};

// Chrome announces that the site can be installed (beforeinstallprompt) early during
// page load, often before React has started and the install button listens. This runs
// first, keeps the announcement for the button (InstallButton.tsx) and tells it.
const keepInstallPrompt = `window.addEventListener("beforeinstallprompt", function (event) {
  event.preventDefault();
  window.__installPrompt = event;
  window.dispatchEvent(new Event("installpromptready"));
});`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <script dangerouslySetInnerHTML={{ __html: keepInstallPrompt }} />
      </head>
      <body className={inter.className}>
        <ServiceWorker />
        <div className="flex flex-col min-h-screen">
          <NavBar />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}

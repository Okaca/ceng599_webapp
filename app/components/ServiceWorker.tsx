"use client";

import { useEffect } from "react";

// Registers public/sw.js, which makes the site installable as an app. Only in
// production: in development it would serve cached files over the ones being edited.
const ServiceWorker = () => {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    )
      return;
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    navigator.serviceWorker
      .register(`${base}/sw.js`, { scope: `${base}/` })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });
  }, []);

  return null;
};

export default ServiceWorker;

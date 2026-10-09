// The service worker: makes the site installable as an app and opens it offline with
// the last loaded pages. Prices (/api) always come from the network, so they are never
// stale; the app's own files are cached.
//   /_next/static/, icons: cache first; their names change with every build
//   pages: network first, the cached copy when offline
//   /api: network only

const CACHE = "market-v1";
const BASE = new URL(self.registration.scope).pathname; // "/marketScraper/" or "/"

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  // drop caches of older versions of this file
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith(BASE + "api/")) return;

  if (
    url.pathname.startsWith(BASE + "_next/static/") ||
    url.pathname.startsWith(BASE + "icons/")
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        // offline: this page as last loaded, or else the start page
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match(BASE)),
        ),
    );
  }
});

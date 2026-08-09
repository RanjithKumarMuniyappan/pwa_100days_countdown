/*
 * Service worker for the Mission 2030 Countdown PWA.
 * Caches index.html and manifest.json so the app can load and run offline
 * once it has been visited/installed at least once.
 */

const CACHE_NAME = "countdown-pwa-cache-v19";
const CACHED_URLS = [
  "./index.html",
  "./manifest.json",
  "./assets/Backdrop.png",
  "./assets/mlx_logo.png",
  "./assets/Mission_2030_logo.png",
  "./assets/values-strip.jpg",
  "./assets/countdown_voice.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHED_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});

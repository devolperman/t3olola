const CACHE_NAME = "taaloola-v3";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./admin.html",
  "./firebase-config.js",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Cache images aggressively
  if (event.request.destination === "image") {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchAndCache = fetch(event.request).then((res) => {
          if (res.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res.clone()));
          }
          return res;
        }).catch(() => cached);
        return cached || fetchAndCache;
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (
          networkResponse.status === 200 &&
          (url.origin === self.location.origin ||
            event.request.destination === "image" ||
            url.hostname.includes("unpkg.com") ||
            url.hostname.includes("googleapis.com") ||
            url.hostname.includes("gstatic.com") ||
            url.hostname.includes("cdn.jsdelivr.net") ||
            url.hostname.includes("fonts.googleapis.com"))
        ) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

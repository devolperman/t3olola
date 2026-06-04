const CACHE_NAME = "taaloola-v5";
const STATIC_CACHE = [
  "./",
  "./index.html",
  "./admin.html",
  "./firebase-config.js",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Images: cache-first, update in background
  if (event.request.destination === "image") {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchAndCache = fetch(event.request, { mode: 'cors' }).then((res) => {
          if (res && res.status === 200 && res.type === 'basic' || res.type === 'cors') {
            try {
              const cloned = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
            } catch (e) {}
          }
          return res;
        }).catch(() => cached);
        return cached || fetchAndCache;
      })
    );
    return;
  }

  // Firebase: network-first
  if (url.hostname.includes("firebaseio.com") || url.hostname.includes("firebase.com")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // CDN resources: cache-first
  if (
    url.hostname.includes("unpkg.com") ||
    url.hostname.includes("gstatic.com") ||
    url.hostname.includes("cdn.jsdelivr.net") ||
    url.hostname.includes("googleapis.com")
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((res) => {
          if (res && res.status === 200) {
            try {
              const cloned = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
            } catch (e) {}
          }
          return res;
        });
      })
    );
    return;
  }

  // Own assets: cache-first for speed
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request, { mode: 'cors' }).then((res) => {
        if (res && res.status === 200) {
          try {
            const cloned = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          } catch (e) {}
        }
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

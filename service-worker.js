const CACHE_NAME = "bookkeeping-cache-v2";
const urlsToCache = [
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/style.css",       // if you separate CSS
  "/script.js"        // if you separate JS
];

// Install: cache all essential files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // activate new SW immediately
});

// Activate: clean old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    })
  );
  self.clients.claim(); // take control of all pages
});

// Fetch: serve cached files first, fallback to network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        // optional: cache new requests dynamically
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      }).catch(() => {
        // fallback if offline and resource not cached
        if (event.request.destination === "document") return caches.match("/index.html");
      });
    })
  );
});});

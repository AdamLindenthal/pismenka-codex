const CACHE_NAME = "pismenkova-hra-v1";
const ASSETS = [
  ".",
  "index.html",
  "styles.css",
  "app.js",
  "phrases.js",
  "stickers.js",
  "version.js",
  "manifest.webmanifest",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/bg-pattern.svg",
  "assets/mascot-sitting.png",
  "assets/mascot-standing.png",
  "assets/microphone.png",
  "assets/next.png",
  "assets/speaker-off.png",
  "assets/speaker-on.png",
  "assets/xp-orb.png",
  "assets/sticker-01.png",
  "assets/sticker-02.png",
  "assets/sticker-03.png",
  "assets/sticker-04.png",
  "assets/sticker-05.png",
  "assets/sticker-06.png",
  "assets/sticker-07.png",
  "assets/sticker-08.png",
  "assets/sticker-09.png",
  "assets/sticker-10.png",
  "assets/sticker-11.png",
  "assets/sticker-12.png",
  "assets/sticker-13.png",
  "assets/sticker-14.png",
  "assets/sticker-15.png",
  "assets/sticker-16.png",
  "assets/sticker-17.png",
  "assets/sticker-18.png",
  "assets/sounds/tile-click.m4a",
  "assets/sounds/success.m4a",
  "assets/sounds/try-again.m4a",
  "assets/sounds/sticker-unlocked.m4a",
  "assets/sounds/mic-on.m4a"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key === CACHE_NAME ? null : caches.delete(key))))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      });
    })
  );
});

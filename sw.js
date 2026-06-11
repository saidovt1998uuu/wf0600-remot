// Minimal service worker — primarily so Android Chrome treats this page as
// an installable PWA ("Add to Home screen"). Since this app is useless
// without a live MQTT connection, caching is just a thin fallback for the
// app shell (so it still LOADS instantly when offline, even though MQTT
// obviously won't connect until network is back).
const CACHE = 'wf0600-remote-v1';
const ASSETS = ['./index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Network-first: always try live network (this is a live-data app),
  // fall back to the cached shell only if offline.
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

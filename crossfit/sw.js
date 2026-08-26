const CACHE = 'crossfit-coach-v1';
const ASSETS = [
  './index.html',
  './style.css',
  './js/app.js',
  './js/generator.js',
  './js/storage.js',
  './js/share.js',
  './data/exercises.js',
  './icon.svg',
  './manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: vždy se pokusí o čerstvá data, cache jen při offline
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Google Fonts – cache-first (mění se zřídka)
  if (e.request.url.includes('fonts.googleapis.com') || e.request.url.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }))
    );
    return;
  }
  // Vše ostatní – network-first
  e.respondWith(
    fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});

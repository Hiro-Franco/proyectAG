const CACHE_NAME = 'facturapp-v1';
const ASSETS = [
  '/html/login.html', '/html/formulario.html', '/html/captura.html',
  '/css/base.css', '/css/login.css', '/css/formulario.css', '/css/captura.css',
  '/assets/icon-192.png', '/assets/icon-512.png',
  '/javascript/login.js', '/javascript/formulario.js', '/javascript/captura.js',
  '/json/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/auth') || url.pathname.startsWith('/ocr') || url.pathname.startsWith('/sheets')) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
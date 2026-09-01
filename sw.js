'use strict';

const CACHE = 'conta-de-casa-public-v2';
const PUBLIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './core.js',
  './finance.js',
  './render.js',
  './forms.js',
  './events.js',
  './manifest.webmanifest',
  './icon.svg'
];
const PUBLIC_ASSET_SET = new Set(PUBLIC_ASSETS);

function publicAssetKey(requestUrl) {
  const url = new URL(requestUrl);
  if (url.origin !== self.location.origin) return null;
  if (url.search || url.hash) return null;
  const scopePath = new URL('./', self.registration.scope).pathname;
  if (!url.pathname.startsWith(scopePath)) return null;
  const rel = url.pathname.slice(scopePath.length);
  return rel ? `./${rel}` : './';
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PUBLIC_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('./index.html')));
    return;
  }

  const key = publicAssetKey(event.request.url);
  if (!key || !PUBLIC_ASSET_SET.has(key)) return;
  event.respondWith(caches.match(key).then(cached => cached || fetch(event.request)));
});

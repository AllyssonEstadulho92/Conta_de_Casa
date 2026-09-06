'use strict';

const CACHE = 'conta-de-casa-public-v63-ui1';
const PUBLIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './design-system.css',
  './mobile-layout.css',
  './market-experience.css',
  './market-brand.css',
  './market-category-groups.css',
  './market-barcode.css',
  './ui-icons.css',
  './invoice-capture.css',
  './app-update.css',
  './market-image-audit.css',
  './core.js',
  './finance.js',
  './render.js',
  './forms.js',
  './sync.js',
  './sync-conflict-policy.js',
  './events.js',
  './market-experience.js',
  './market-branding.js',
  './market-category-groups.js',
  './market-barcode.js',
  './ui-icons.js',
  './invoice-capture.js',
  './app-update.js',
  './market-retailer-image-policy.js',
  './market-image-audit.js',
  './market-official-images.js',
  './release-manifest.json',
  './manifest.webmanifest',
  './icon.svg',
  './LUCIDE_LICENSE.txt'
];
const PUBLIC_ASSET_SET = new Set(PUBLIC_ASSETS);
let applyRequested = false;

function publicAssetKey(requestUrl) {
  const url = new URL(requestUrl);
  if (url.origin !== self.location.origin) return null;
  if (url.hash) return null;
  if (url.search && !(url.searchParams.size===1 && (url.searchParams.has('v')||url.searchParams.has('ts')))) return null;
  const scopePath = new URL('./', self.registration.scope).pathname;
  if (!url.pathname.startsWith(scopePath)) return null;
  const rel = url.pathname.slice(scopePath.length);
  return rel ? `./${rel}` : './';
}

async function refreshClientsAfterExplicitUpdate() {
  if(!applyRequested) return;
  const clients = await self.clients.matchAll({type:'window',includeUncontrolled:true});
  await Promise.all(clients.map(client=>{
    try{
      const url=new URL(client.url);
      if(url.origin!==self.location.origin) return Promise.resolve();
      return client.navigate(client.url).catch(()=>undefined);
    }catch(_error){return Promise.resolve();}
  }));
}

self.addEventListener('install', event => {
  // Em atualizações, o novo worker fica em waiting até o utilizador confirmar no
  // Centro de Atualização. Numa instalação inicial, o navegador ativa-o normalmente.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PUBLIC_ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
    await refreshClientsAfterExplicitUpdate();
  })());
});

self.addEventListener('message', event => {
  if(event.data?.type==='SKIP_WAITING'||event.data?.type==='APPLY_UPDATE'){
    applyRequested=true;
    self.skipWaiting();
  }
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
  event.respondWith(
    fetch(event.request,{cache:'no-store'}).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(key, copy));
      }
      return response;
    }).catch(() => caches.match(key))
  );
});

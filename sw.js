'use strict';

const CACHE = 'conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog4-pd-photo1-photo-loader3-startup2-usability1-pages1-assets1-market1-expenses1-veggie-menu2-modern-ui2-version-audit1-mobile-shell2-architecture-baseline1-ui-components1-product-pages1';
const NAVIGATION_TIMEOUT_MS = 4000;
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
  './asset-loader.css',
  './market-shopping-focus.css',
  './mobile-menu-toggle.css',
  './v76-veggie-menu.css',
  './invoice-capture.css',
  './app-update.css',
  './v76-version-about.css',
  './market-image-audit.css',
  './v74-experience.css',
  './v75-architecture.css',
  './v75-header-refinement.css',
  './v75-stability.css',
  './v75-layout-polish.css',
  './v75-market-featured.css',
  './market-visual-catalog.css',
  './pingo-doce-photo-library.css',
  './market-photo-loader.css',
  './v75-drawer-theme.css',
  './v75-pages.css',
  './v75-expenses-modern.css',
  './v75-market-flow.css',
  './v75-usability.css',
  './v76-modern-ui.css',
  './v76-product-pages.css',
  './v76-mobile-shell.css',
  './core.js',
  './finance.js',
  './render.js',
  './forms.js',
  './sync.js',
  './sync-conflict-policy.js',
  './events.js',
  './mobile-menu-toggle.js',
  './v76-veggie-menu.js',
  './market-experience.js',
  './market-branding.js',
  './market-category-groups.js',
  './market-barcode.js',
  './ui-icons.js',
  './design-asset-library.js',
  './asset-loader.js',
  './invoice-capture.js',
  './app-update.js',
  './market-image-library.js',
  './market-retailer-image-policy.js',
  './market-image-audit.js',
  './market-official-images.js',
  './market-catalog-image-resolver.js',
  './market-visual-catalog.js',
  './pingo-doce-photo-library.js',
  './market-photo-loader.js',
  './v64-runtime.js',
  './market-shopping-focus.js',
  './v74-experience.js',
  './v75-architecture.js',
  './v75-stability.js',
  './v75-startup-guard.js',
  './v75-market-featured.js',
  './v75-market-flow.js',
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

async function navigationResponse(request) {
  const cached = await caches.match('./index.html');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NAVIGATION_TIMEOUT_MS);
  try {
    const response = await fetch(request,{cache:'no-store',signal:controller.signal});
    if(response?.ok){
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put('./index.html',copy)).catch(()=>undefined);
      return response;
    }
    if(cached)return cached;
    return response;
  } catch (_error) {
    if(cached)return cached;
    return new Response('Conta de Casa indisponível temporariamente.',{
      status:503,
      headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}
    });
  } finally {
    clearTimeout(timer);
  }
}

self.addEventListener('install', event => {
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
    event.respondWith(navigationResponse(event.request));
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

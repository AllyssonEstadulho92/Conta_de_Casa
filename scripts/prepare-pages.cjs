'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const BUILD = 'v75';
const UI_REV = '74-ui1';
const CATEGORY_REV = '64-ui1';
const RUNTIME_REV = '64-runtime1';
const SHOPPING_REV = '74-shopping2';
const MENU_REV = '73-menu8';
const EXPERIENCE_REV = '74-experience2';
const ARCHITECTURE_REV = '75-architecture2';
const HEADER_REV = '75-header2';
const STABILITY_REV = '75-stability1';
const LAYOUT_REV = '75-layout1';
const DRAWER_REV = '75-drawer2';
const FEATURED_REV = '75-featured1';
const IMAGE_LIBRARY_REV = '75-image-library1';
const CATALOG_REV = '75-catalog1';
const PD_PHOTO_REV = '75-pd-photo1';
const PHOTO_LOADER_REV = '75-photo-loader1';

/* Bundle público v75: mantém a experiência v74 como base funcional de apresentação,
   aplica arquitetura, cabeçalho, estabilidade, geometria, biblioteca/destaques/catálogo
   visual do Mercado, biblioteca progressiva Pingo Doce, carregador de fotografias e
   a revisão visual do drawer petróleo/teal à direita. Camadas históricas
   ui-consistency.css e v64-runtime.css continuam fora da distribuição. */
const PUBLIC_FILES = Object.freeze([
  'index.html',
  'styles.css',
  'design-system.css',
  'mobile-layout.css',
  'market-experience.css',
  'market-brand.css',
  'market-category-groups.css',
  'market-barcode.css',
  'ui-icons.css',
  'market-shopping-focus.css',
  'mobile-menu-toggle.css',
  'invoice-capture.css',
  'app-update.css',
  'market-image-audit.css',
  'v74-experience.css',
  'v75-architecture.css',
  'v75-header-refinement.css',
  'v75-stability.css',
  'v75-layout-polish.css',
  'v75-market-featured.css',
  'market-visual-catalog.css',
  'pingo-doce-photo-library.css',
  'market-photo-loader.css',
  'v75-drawer-theme.css',
  'core.js',
  'finance.js',
  'render.js',
  'forms.js',
  'sync.js',
  'sync-conflict-policy.js',
  'events.js',
  'mobile-menu-toggle.js',
  'market-experience.js',
  'market-branding.js',
  'market-category-groups.js',
  'market-barcode.js',
  'ui-icons.js',
  'invoice-capture.js',
  'app-update.js',
  'market-image-library.js',
  'market-retailer-image-policy.js',
  'market-image-audit.js',
  'market-official-images.js',
  'market-catalog-image-resolver.js',
  'market-visual-catalog.js',
  'pingo-doce-photo-library.js',
  'market-photo-loader.js',
  'v64-runtime.js',
  'market-shopping-focus.js',
  'v74-experience.js',
  'v75-architecture.js',
  'v75-stability.js',
  'v75-market-featured.js',
  'release-manifest.json',
  'sw.js',
  'manifest.webmanifest',
  'icon.svg',
  'LUCIDE_LICENSE.txt'
]);

fs.rmSync(DIST,{recursive:true,force:true});
fs.mkdirSync(DIST,{recursive:true});

for(const name of PUBLIC_FILES){
  const source=path.join(ROOT,name);
  if(!fs.existsSync(source)||!fs.statSync(source).isFile()) throw new Error(`Public Pages asset missing: ${name}`);
  fs.copyFileSync(source,path.join(DIST,name));
}

const distIndex=path.join(DIST,'index.html');
let index=fs.readFileSync(distIndex,'utf8');
index=index.replace(/<meta name="app-build" content="[^"]+"\s*\/>/,`<meta name="app-build" content="${BUILD}" />`);
index=index.replace(/<meta name="theme-color" content="[^"]+"\s*\/>/,'<meta name="theme-color" content="#f4f8f8" />');
index=index.replaceAll('?v=53',`?v=${BUILD.slice(1)}`);
index=index.replace(/<strong id="appBuildVersion">[^<]+<\/strong>/,`<strong id="appBuildVersion">${BUILD}</strong>`);

index=index.replace(
  "img-src 'self' data: blob: https://images.openfoodfacts.org; connect-src 'self' https://api.github.com https://cesta.pt https://world.openfoodfacts.org;",
  "img-src 'self' data: blob: https://www.continente.pt https://static.pingodoce.pt https://*.openfoodfacts.org https://*.openbeautyfacts.org https://*.openproductsfacts.org https://*.openpetfoodfacts.org; connect-src 'self' https://api.github.com https://cesta.pt https://r.jina.ai https://world.openfoodfacts.org https://world.openbeautyfacts.org https://world.openproductsfacts.org https://world.openpetfoodfacts.org;"
);

if(!index.includes('app-update.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./app-update.css?v=${BUILD.slice(1)}" />\n</head>`);
if(!index.includes('market-image-audit.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./market-image-audit.css?v=${BUILD.slice(1)}" />\n</head>`);
if(!index.includes('market-brand.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./market-brand.css?v=${UI_REV}" />\n</head>`);
if(!index.includes('market-category-groups.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./market-category-groups.css?v=${CATEGORY_REV}" />\n</head>`);
if(!index.includes('market-shopping-focus.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./market-shopping-focus.css?v=${SHOPPING_REV}" />\n</head>`);
if(!index.includes('mobile-menu-toggle.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./mobile-menu-toggle.css?v=${MENU_REV}" />\n</head>`);
if(!index.includes('v74-experience.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./v74-experience.css?v=${EXPERIENCE_REV}" />\n</head>`);
if(!index.includes('v75-architecture.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./v75-architecture.css?v=${ARCHITECTURE_REV}" />\n</head>`);
if(!index.includes('v75-header-refinement.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./v75-header-refinement.css?v=${HEADER_REV}" />\n</head>`);
if(!index.includes('v75-stability.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./v75-stability.css?v=${STABILITY_REV}" />\n</head>`);
if(!index.includes('v75-layout-polish.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./v75-layout-polish.css?v=${LAYOUT_REV}" />\n</head>`);
if(!index.includes('v75-market-featured.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./v75-market-featured.css?v=${FEATURED_REV}" />\n</head>`);
if(!index.includes('market-visual-catalog.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./market-visual-catalog.css?v=${CATALOG_REV}" />\n</head>`);
if(!index.includes('pingo-doce-photo-library.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./pingo-doce-photo-library.css?v=${PD_PHOTO_REV}" />\n</head>`);
if(!index.includes('market-photo-loader.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./market-photo-loader.css?v=${PHOTO_LOADER_REV}" />\n</head>`);
if(!index.includes('v75-drawer-theme.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./v75-drawer-theme.css?v=${DRAWER_REV}" />\n</head>`);

const syncScript=`<script src="./sync.js?v=${BUILD.slice(1)}" defer></script>`;
if(!index.includes('sync-conflict-policy.js')) index=index.replace(syncScript,`${syncScript}<script src="./sync-conflict-policy.js?v=${UI_REV}" defer></script>`);

if(!index.includes('app-update.js')) index=index.replace('</body>',`  <script src="./app-update.js?v=${BUILD.slice(1)}" defer></script>\n</body>`);
if(!index.includes('market-image-library.js')) index=index.replace('</body>',`  <script src="./market-image-library.js?v=${IMAGE_LIBRARY_REV}" defer></script>\n</body>`);
if(!index.includes('market-retailer-image-policy.js')) index=index.replace('</body>',`  <script src="./market-retailer-image-policy.js?v=${BUILD.slice(1)}" defer></script>\n</body>`);
if(!index.includes('market-image-audit.js')) index=index.replace('</body>',`  <script src="./market-image-audit.js?v=${BUILD.slice(1)}" defer></script>\n</body>`);
if(!index.includes('market-official-images.js')) index=index.replace('</body>',`  <script src="./market-official-images.js?v=${BUILD.slice(1)}" defer></script>\n</body>`);
if(!index.includes('market-catalog-image-resolver.js')) index=index.replace('</body>',`  <script src="./market-catalog-image-resolver.js?v=${CATALOG_REV}" defer></script>\n</body>`);
if(!index.includes('market-visual-catalog.js')) index=index.replace('</body>',`  <script src="./market-visual-catalog.js?v=${CATALOG_REV}" defer></script>\n</body>`);
if(!index.includes('pingo-doce-photo-library.js')) index=index.replace('</body>',`  <script src="./pingo-doce-photo-library.js?v=${PD_PHOTO_REV}" defer></script>\n</body>`);
if(!index.includes('market-photo-loader.js')) index=index.replace('</body>',`  <script src="./market-photo-loader.js?v=${PHOTO_LOADER_REV}" defer></script>\n</body>`);
if(!index.includes('market-branding.js')) index=index.replace('</body>',`  <script src="./market-branding.js?v=${UI_REV}" defer></script>\n</body>`);
if(!index.includes('market-category-groups.js')) index=index.replace('</body>',`  <script src="./market-category-groups.js?v=${CATEGORY_REV}" defer></script>\n</body>`);
if(!index.includes('v64-runtime.js')) index=index.replace('</body>',`  <script src="./v64-runtime.js?v=${RUNTIME_REV}" defer></script>\n</body>`);
if(!index.includes('market-shopping-focus.js')) index=index.replace('</body>',`  <script src="./market-shopping-focus.js?v=${SHOPPING_REV}" defer></script>\n</body>`);
if(!index.includes('mobile-menu-toggle.js')) index=index.replace('</body>',`  <script src="./mobile-menu-toggle.js?v=${MENU_REV}" defer></script>\n</body>`);
if(!index.includes('v74-experience.js')) index=index.replace('</body>',`  <script src="./v74-experience.js?v=${EXPERIENCE_REV}" defer></script>\n</body>`);
if(!index.includes('v75-architecture.js')) index=index.replace('</body>',`  <script src="./v75-architecture.js?v=${ARCHITECTURE_REV}" defer></script>\n</body>`);
if(!index.includes('v75-stability.js')) index=index.replace('</body>',`  <script src="./v75-stability.js?v=${STABILITY_REV}" defer></script>\n</body>`);
if(!index.includes('v75-market-featured.js')) index=index.replace('</body>',`  <script src="./v75-market-featured.js?v=${FEATURED_REV}" defer></script>\n</body>`);
fs.writeFileSync(distIndex,index);

const distEvents=path.join(DIST,'events.js');
let events=fs.readFileSync(distEvents,'utf8');
events=events.replace(/\.\/sw\.js\?v=\d+/,`./sw.js?v=${BUILD.slice(1)}`);
fs.writeFileSync(distEvents,events);

const manifest=JSON.parse(fs.readFileSync(path.join(DIST,'release-manifest.json'),'utf8'));
if(manifest.latestVersion!==BUILD) throw new Error(`Release manifest latestVersion ${manifest.latestVersion} does not match ${BUILD}`);

const forbidden=['README.md','SECURITY.md','PRIVACY.md','SPEC.md','CHANGELOG.md','.git','.github','tests','scripts','downloads','ui-consistency.css','v64-runtime.css','v75-drawer-blue.css'];
for(const entry of forbidden){
  if(fs.existsSync(path.join(DIST,entry))) throw new Error(`Forbidden file copied into Pages bundle: ${entry}`);
}

console.log(`Prepared ${PUBLIC_FILES.length} public GitHub Pages assets in dist/ for ${BUILD} (${UI_REV}; categories ${CATEGORY_REV}; runtime ${RUNTIME_REV}; shopping ${SHOPPING_REV}; menu ${MENU_REV}; experience ${EXPERIENCE_REV}; architecture ${ARCHITECTURE_REV}; header ${HEADER_REV}; stability ${STABILITY_REV}; layout ${LAYOUT_REV}; drawer ${DRAWER_REV}; featured ${FEATURED_REV}; image-library ${IMAGE_LIBRARY_REV}; visual-catalog ${CATALOG_REV}; pingo-doce-photos ${PD_PHOTO_REV}; photo-loader ${PHOTO_LOADER_REV}).`);
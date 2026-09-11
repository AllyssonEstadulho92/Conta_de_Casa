'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PACKAGE = JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8'));
const APP_VERSION = String(PACKAGE.version||'').trim();
const BUILD = 'v76';
const APP_UPDATE_REV = '76-version-audit1';
const UI_REV = '74-ui1';
const CATEGORY_REV = '64-ui1';
const RUNTIME_REV = '64-runtime1';
const SHOPPING_REV = '74-shopping2';
const MENU_REV = '73-menu8';
const VEGGIE_MENU_REV = '76-veggie-menu2';
const MODERN_UI_REV = '76-modern-ui1';
const MOBILE_SHELL_REV = '76-mobile-shell2';
const EXPERIENCE_REV = '74-experience2';
const ARCHITECTURE_REV = '75-architecture2';
const HEADER_REV = '75-header2';
const STABILITY_REV = '75-stability1';
const STARTUP_REV = '75-startup2';
const LAYOUT_REV = '75-layout1';
const PAGES_REV = '75-pages1';
const EXPENSES_REV = '75-expenses1';
const DRAWER_REV = '75-drawer2';
const USABILITY_REV = '75-usability1';
const ASSETS_REV = '75-assets1';
const MARKET_FLOW_REV = '75-market1';
const FEATURED_REV = '75-featured1';
const IMAGE_LIBRARY_REV = '75-image-library1';
const CATALOG_REV = '75-catalog4';
const PD_PHOTO_REV = '75-pd-photo1';
const PHOTO_LOADER_REV = '75-photo-loader3';

if(!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(APP_VERSION)){
  throw new Error(`Invalid package application version: ${APP_VERSION||'(empty)'}`);
}

function resolveBuildId(){
  try{
    const value=execFileSync('git',['rev-parse','--short=7','HEAD'],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
    if(/^[0-9a-f]{7}$/i.test(value))return value.toLowerCase();
  }catch(_error){/* source archive/local fallback */}
  const envSha=String(process.env.GITHUB_SHA||'').trim();
  if(/^[0-9a-f]{7,40}$/i.test(envSha))return envSha.slice(0,7).toLowerCase();
  return 'local';
}

const BUILD_ID=resolveBuildId();
const BUILD_DATE=new Date().toISOString();

/* Bundle público v76 estável. Mantém a experiência funcional existente,
   metadados de versão/build, o Veggie Burger TypeScript v2, 76-modern-ui1,
   76-mobile-shell2 e a baseline arquitetural. A promoção de release não altera
   domínio financeiro, persistência, cifragem, sincronização, scanner, QR ou regras de Mercado. */
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
  'asset-loader.css',
  'market-shopping-focus.css',
  'mobile-menu-toggle.css',
  'v76-veggie-menu.css',
  'invoice-capture.css',
  'app-update.css',
  'v76-version-about.css',
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
  'v75-pages.css',
  'v75-expenses-modern.css',
  'v75-market-flow.css',
  'v75-usability.css',
  'v76-modern-ui.css',
  'v76-mobile-shell.css',
  'core.js',
  'finance.js',
  'render.js',
  'forms.js',
  'sync.js',
  'sync-conflict-policy.js',
  'events.js',
  'mobile-menu-toggle.js',
  'v76-veggie-menu.js',
  'market-experience.js',
  'market-branding.js',
  'market-category-groups.js',
  'market-barcode.js',
  'ui-icons.js',
  'design-asset-library.js',
  'asset-loader.js',
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
  'v75-startup-guard.js',
  'v75-market-featured.js',
  'v75-market-flow.js',
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
  if(!fs.existsSync(source)||!fs.statSync(source).isFile())throw new Error(`Public Pages asset missing: ${name}`);
  fs.copyFileSync(source,path.join(DIST,name));
}

const distIndex=path.join(DIST,'index.html');
let index=fs.readFileSync(distIndex,'utf8');
index=index.replace(/<meta name="app-build" content="[^"]+"\s*\/>/,`<meta name="app-build" content="${BUILD}" />`);
const versionMeta=`  <meta name="app-version" content="${APP_VERSION}" />\n  <meta name="app-build-id" content="${BUILD_ID}" />\n  <meta name="app-build-date" content="${BUILD_DATE}" />`;
if(!index.includes('name="app-version"')){
  index=index.replace(/(<meta name="app-build" content="[^"]+"\s*\/>)/,`$1\n${versionMeta}`);
}
index=index.replace(/<meta name="theme-color" content="[^"]+"\s*\/>/,'<meta name="theme-color" content="#f4f8f8" />');
index=index.replaceAll('?v=53',`?v=${BUILD.slice(1)}`);
index=index.replace(/<strong id="appBuildVersion">[^<]+<\/strong>/,`<strong id="appBuildVersion">${APP_VERSION} · ${BUILD}</strong>`);

index=index.replace(
  "img-src 'self' data: blob: https://images.openfoodfacts.org; connect-src 'self' https://api.github.com https://cesta.pt https://world.openfoodfacts.org;",
  "img-src 'self' data: blob: https://www.continente.pt https://static.pingodoce.pt https://*.openfoodfacts.org https://*.openbeautyfacts.org https://*.openproductsfacts.org https://*.openpetfoodfacts.org; connect-src 'self' https://api.github.com https://cesta.pt https://r.jina.ai https://world.openfoodfacts.org https://world.openbeautyfacts.org https://world.openproductsfacts.org https://world.openpetfoodfacts.org;"
);

if(!index.includes('app-update.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./app-update.css?v=${APP_UPDATE_REV}" />\n</head>`);
if(!index.includes('v76-version-about.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./v76-version-about.css?v=${APP_UPDATE_REV}" />\n</head>`);
if(!index.includes('market-image-audit.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./market-image-audit.css?v=${BUILD.slice(1)}" />\n</head>`);
if(!index.includes('market-brand.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./market-brand.css?v=${UI_REV}" />\n</head>`);
if(!index.includes('market-category-groups.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./market-category-groups.css?v=${CATEGORY_REV}" />\n</head>`);
if(!index.includes('market-shopping-focus.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./market-shopping-focus.css?v=${SHOPPING_REV}" />\n</head>`);
if(!index.includes('mobile-menu-toggle.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./mobile-menu-toggle.css?v=${MENU_REV}" />\n</head>`);
if(!index.includes('v74-experience.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./v74-experience.css?v=${EXPERIENCE_REV}" />\n</head>`);
if(!index.includes('v75-architecture.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./v75-architecture.css?v=${ARCHITECTURE_REV}" />\n</head>`);
if(!index.includes('v75-header-refinement.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./v75-header-refinement.css?v=${HEADER_REV}" />\n</head>`);
if(!index.includes('v75-stability.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./v75-stability.css?v=${STABILITY_REV}" />\n</head>`);
if(!index.includes('v75-layout-polish.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./v75-layout-polish.css?v=${LAYOUT_REV}" />\n</head>`);
if(!index.includes('v75-market-featured.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./v75-market-featured.css?v=${FEATURED_REV}" />\n</head>`);
if(!index.includes('market-visual-catalog.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./market-visual-catalog.css?v=${CATALOG_REV}" />\n</head>`);
if(!index.includes('pingo-doce-photo-library.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./pingo-doce-photo-library.css?v=${PD_PHOTO_REV}" />\n</head>`);
if(!index.includes('asset-loader.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./asset-loader.css?v=${ASSETS_REV}" />\n</head>`);
if(!index.includes('market-photo-loader.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./market-photo-loader.css?v=${PHOTO_LOADER_REV}" />\n</head>`);
if(!index.includes('v75-drawer-theme.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./v75-drawer-theme.css?v=${DRAWER_REV}" />\n</head>`);
if(!index.includes('v75-pages.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./v75-pages.css?v=${PAGES_REV}" />\n</head>`);
if(!index.includes('v75-expenses-modern.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./v75-expenses-modern.css?v=${EXPENSES_REV}" />\n</head>`);
if(!index.includes('v76-veggie-menu.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./v76-veggie-menu.css?v=${VEGGIE_MENU_REV}" />\n</head>`);
if(!index.includes('v75-market-flow.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./v75-market-flow.css?v=${MARKET_FLOW_REV}" />\n</head>`);
if(!index.includes('v75-usability.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./v75-usability.css?v=${USABILITY_REV}" />\n</head>`);
if(!index.includes('v76-modern-ui.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./v76-modern-ui.css?v=${MODERN_UI_REV}" />\n</head>`);
if(!index.includes('v76-mobile-shell.css'))index=index.replace('</head>',`  <link rel="stylesheet" href="./v76-mobile-shell.css?v=${MOBILE_SHELL_REV}" />\n</head>`);

const syncScript=`<script src="./sync.js?v=${BUILD.slice(1)}" defer></script>`;
if(!index.includes('sync-conflict-policy.js'))index=index.replace(syncScript,`${syncScript}<script src="./sync-conflict-policy.js?v=${UI_REV}" defer></script>`);

if(!index.includes('design-asset-library.js'))index=index.replace('</body>',`  <script src="./design-asset-library.js?v=${ASSETS_REV}" defer></script>\n</body>`);
if(!index.includes('asset-loader.js'))index=index.replace('</body>',`  <script src="./asset-loader.js?v=${ASSETS_REV}" defer></script>\n</body>`);
if(!index.includes('app-update.js'))index=index.replace('</body>',`  <script src="./app-update.js?v=${APP_UPDATE_REV}" defer></script>\n</body>`);
if(!index.includes('market-image-library.js'))index=index.replace('</body>',`  <script src="./market-image-library.js?v=${IMAGE_LIBRARY_REV}" defer></script>\n</body>`);
if(!index.includes('market-retailer-image-policy.js'))index=index.replace('</body>',`  <script src="./market-retailer-image-policy.js?v=${BUILD.slice(1)}" defer></script>\n</body>`);
if(!index.includes('market-image-audit.js'))index=index.replace('</body>',`  <script src="./market-image-audit.js?v=${BUILD.slice(1)}" defer></script>\n</body>`);
if(!index.includes('market-official-images.js'))index=index.replace('</body>',`  <script src="./market-official-images.js?v=${BUILD.slice(1)}" defer></script>\n</body>`);
if(!index.includes('market-catalog-image-resolver.js'))index=index.replace('</body>',`  <script src="./market-catalog-image-resolver.js?v=${CATALOG_REV}" defer></script>\n</body>`);
if(!index.includes('market-visual-catalog.js'))index=index.replace('</body>',`  <script src="./market-visual-catalog.js?v=${CATALOG_REV}" defer></script>\n</body>`);
if(!index.includes('pingo-doce-photo-library.js'))index=index.replace('</body>',`  <script src="./pingo-doce-photo-library.js?v=${PD_PHOTO_REV}" defer></script>\n</body>`);
if(!index.includes('market-photo-loader.js'))index=index.replace('</body>',`  <script src="./market-photo-loader.js?v=${PHOTO_LOADER_REV}" defer></script>\n</body>`);
if(!index.includes('market-branding.js'))index=index.replace('</body>',`  <script src="./market-branding.js?v=${UI_REV}" defer></script>\n</body>`);
if(!index.includes('market-category-groups.js'))index=index.replace('</body>',`  <script src="./market-category-groups.js?v=${CATEGORY_REV}" defer></script>\n</body>`);
if(!index.includes('v64-runtime.js'))index=index.replace('</body>',`  <script src="./v64-runtime.js?v=${RUNTIME_REV}" defer></script>\n</body>`);
if(!index.includes('market-shopping-focus.js'))index=index.replace('</body>',`  <script src="./market-shopping-focus.js?v=${SHOPPING_REV}" defer></script>\n</body>`);
if(!index.includes('mobile-menu-toggle.js'))index=index.replace('</body>',`  <script src="./mobile-menu-toggle.js?v=${MENU_REV}" defer></script>\n</body>`);
if(!index.includes('v76-veggie-menu.js'))index=index.replace('</body>',`  <script src="./v76-veggie-menu.js?v=${VEGGIE_MENU_REV}" defer></script>\n</body>`);
if(!index.includes('v74-experience.js'))index=index.replace('</body>',`  <script src="./v74-experience.js?v=${EXPERIENCE_REV}" defer></script>\n</body>`);
if(!index.includes('v75-architecture.js'))index=index.replace('</body>',`  <script src="./v75-architecture.js?v=${ARCHITECTURE_REV}" defer></script>\n</body>`);
if(!index.includes('v75-stability.js'))index=index.replace('</body>',`  <script src="./v75-stability.js?v=${STABILITY_REV}" defer></script>\n</body>`);
if(!index.includes('v75-startup-guard.js'))index=index.replace('</body>',`  <script src="./v75-startup-guard.js?v=${STARTUP_REV}" defer></script>\n</body>`);
if(!index.includes('v75-market-featured.js'))index=index.replace('</body>',`  <script src="./v75-market-featured.js?v=${FEATURED_REV}" defer></script>\n</body>`);
if(!index.includes('v75-market-flow.js'))index=index.replace('</body>',`  <script src="./v75-market-flow.js?v=${MARKET_FLOW_REV}" defer></script>\n</body>`);
fs.writeFileSync(distIndex,index);

const distEvents=path.join(DIST,'events.js');
let events=fs.readFileSync(distEvents,'utf8');
events=events.replace(/\.\/sw\.js\?v=\d+/,`./sw.js?v=${BUILD.slice(1)}`);
fs.writeFileSync(distEvents,events);

const manifest=JSON.parse(fs.readFileSync(path.join(DIST,'release-manifest.json'),'utf8'));
if(manifest.latestVersion!==BUILD)throw new Error(`Release manifest latestVersion ${manifest.latestVersion} does not match ${BUILD}`);

const forbidden=['README.md','SECURITY.md','PRIVACY.md','SPEC.md','CHANGELOG.md','.git','.github','tests','scripts','downloads','ui-consistency.css','v64-runtime.css','v75-drawer-blue.css'];
for(const entry of forbidden){
  if(fs.existsSync(path.join(DIST,entry)))throw new Error(`Forbidden file copied into Pages bundle: ${entry}`);
}

console.log(`Prepared ${PUBLIC_FILES.length} public GitHub Pages assets in dist/ for app ${APP_VERSION}, ${BUILD}, build ${BUILD_ID} (${APP_UPDATE_REV}; ${UI_REV}; categories ${CATEGORY_REV}; runtime ${RUNTIME_REV}; shopping ${SHOPPING_REV}; menu ${MENU_REV}; veggie-menu ${VEGGIE_MENU_REV}; modern-ui ${MODERN_UI_REV}; mobile-shell ${MOBILE_SHELL_REV}; experience ${EXPERIENCE_REV}; architecture ${ARCHITECTURE_REV}; header ${HEADER_REV}; stability ${STABILITY_REV}; startup ${STARTUP_REV}; layout ${LAYOUT_REV}; pages ${PAGES_REV}; expenses ${EXPENSES_REV}; drawer ${DRAWER_REV}; usability ${USABILITY_REV}; assets ${ASSETS_REV}; market-flow ${MARKET_FLOW_REV}; featured ${FEATURED_REV}; image-library ${IMAGE_LIBRARY_REV}; visual-catalog ${CATALOG_REV}; pingo-doce-photos ${PD_PHOTO_REV}; photo-loader ${PHOTO_LOADER_REV}).`);

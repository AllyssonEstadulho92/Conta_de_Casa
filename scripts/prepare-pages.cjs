'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const BUILD = 'v70';
const UI_REV = '64-ui1';
const CATEGORY_REV = '64-ui1';
const VISUAL_REV = '64-ui1';
const RUNTIME_REV = '64-runtime1';
const SHOPPING_REV = '65-shopping1';
const SHELL_REV = '66-shell1';
const MENU_REV = '70-menu4';
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
  'ui-consistency.css',
  'v64-runtime.css',
  'market-shopping-focus.css',
  'mobile-menu-toggle.css',
  'invoice-capture.css',
  'app-update.css',
  'market-image-audit.css',
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
  'market-retailer-image-policy.js',
  'market-image-audit.js',
  'market-official-images.js',
  'v64-runtime.js',
  'market-shopping-focus.js',
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

// A distribuição pública recebe um número de build coerente e as camadas progressivas.
const distIndex=path.join(DIST,'index.html');
let index=fs.readFileSync(distIndex,'utf8');
index=index.replace(/<meta name="app-build" content="[^"]+"\s*\/>/,`<meta name="app-build" content="${BUILD}" />`);
index=index.replace(/<meta name="theme-color" content="[^"]+"\s*\/>/,'<meta name="theme-color" content="#f5f7fa" />');
index=index.replaceAll('?v=53',`?v=${BUILD.slice(1)}`);
index=index.replace(/<strong id="appBuildVersion">[^<]+<\/strong>/,`<strong id="appBuildVersion">${BUILD}</strong>`);

// Compatibilidade histórica do pipeline de imagens. A experiência atual é text-first,
// mas estas allowlists permanecem enquanto os módulos legados continuarem no bundle.
index=index.replace(
  "img-src 'self' data: blob: https://images.openfoodfacts.org; connect-src 'self' https://api.github.com https://cesta.pt https://world.openfoodfacts.org;",
  "img-src 'self' data: blob: https://www.continente.pt https://static.pingodoce.pt https://*.openfoodfacts.org https://*.openbeautyfacts.org https://*.openproductsfacts.org https://*.openpetfoodfacts.org; connect-src 'self' https://api.github.com https://cesta.pt https://r.jina.ai https://world.openfoodfacts.org https://world.openbeautyfacts.org https://world.openproductsfacts.org https://world.openpetfoodfacts.org;"
);

if(!index.includes('app-update.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./app-update.css?v=${BUILD.slice(1)}" />\n</head>`);
if(!index.includes('market-image-audit.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./market-image-audit.css?v=${BUILD.slice(1)}" />\n</head>`);
if(!index.includes('market-brand.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./market-brand.css?v=${UI_REV}" />\n</head>`);
if(!index.includes('market-category-groups.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./market-category-groups.css?v=${CATEGORY_REV}" />\n</head>`);
// Consolidação visual global da v63, mantida antes dos ajustes de runtime da v64.
if(!index.includes('ui-consistency.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./ui-consistency.css?v=${VISUAL_REV}" />\n</head>`);
// Base v64 do cabeçalho/recorrências; a folha recebeu revisão v66 apenas para uniformizar o shell móvel.
if(!index.includes('v64-runtime.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./v64-runtime.css?v=${SHELL_REV}" />\n</head>`);
// Camada v65: densidade e prioridade operacional exclusivas da Lista de compras.
if(!index.includes('market-shopping-focus.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./market-shopping-focus.css?v=${SHOPPING_REV}" />\n</head>`);
// Camada v70: preserva o controlo único da v69 e força movimento visível do glifo mesmo após reparenting no Safari.
if(!index.includes('mobile-menu-toggle.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./mobile-menu-toggle.css?v=${MENU_REV}" />\n</head>`);

const syncScript=`<script src="./sync.js?v=${BUILD.slice(1)}" defer></script>`;
if(!index.includes('sync-conflict-policy.js')) index=index.replace(syncScript,`${syncScript}<script src="./sync-conflict-policy.js?v=${UI_REV}" defer></script>`);

if(!index.includes('app-update.js')) index=index.replace('</body>',`  <script src="./app-update.js?v=${BUILD.slice(1)}" defer></script>\n</body>`);
if(!index.includes('market-retailer-image-policy.js')) index=index.replace('</body>',`  <script src="./market-retailer-image-policy.js?v=${BUILD.slice(1)}" defer></script>\n</body>`);
if(!index.includes('market-image-audit.js')) index=index.replace('</body>',`  <script src="./market-image-audit.js?v=${BUILD.slice(1)}" defer></script>\n</body>`);
if(!index.includes('market-official-images.js')) index=index.replace('</body>',`  <script src="./market-official-images.js?v=${BUILD.slice(1)}" defer></script>\n</body>`);
if(!index.includes('market-branding.js')) index=index.replace('</body>',`  <script src="./market-branding.js?v=${UI_REV}" defer></script>\n</body>`);
if(!index.includes('market-category-groups.js')) index=index.replace('</body>',`  <script src="./market-category-groups.js?v=${CATEGORY_REV}" defer></script>\n</body>`);
if(!index.includes('v64-runtime.js')) index=index.replace('</body>',`  <script src="./v64-runtime.js?v=${RUNTIME_REV}" defer></script>\n</body>`);
if(!index.includes('market-shopping-focus.js')) index=index.replace('</body>',`  <script src="./market-shopping-focus.js?v=${SHOPPING_REV}" defer></script>\n</body>`);
if(!index.includes('mobile-menu-toggle.js')) index=index.replace('</body>',`  <script src="./mobile-menu-toggle.js?v=${MENU_REV}" defer></script>\n</body>`);
fs.writeFileSync(distIndex,index);

const distEvents=path.join(DIST,'events.js');
let events=fs.readFileSync(distEvents,'utf8');
events=events.replace("./sw.js?v=53",`./sw.js?v=${BUILD.slice(1)}`);
fs.writeFileSync(distEvents,events);

const manifest=JSON.parse(fs.readFileSync(path.join(DIST,'release-manifest.json'),'utf8'));
if(manifest.latestVersion!==BUILD) throw new Error(`Release manifest latestVersion ${manifest.latestVersion} does not match ${BUILD}`);

const forbidden=['README.md','SECURITY.md','PRIVACY.md','SPEC.md','CHANGELOG.md','.git','.github','tests','scripts','downloads'];
for(const entry of forbidden){
  if(fs.existsSync(path.join(DIST,entry))) throw new Error(`Forbidden file copied into Pages bundle: ${entry}`);
}

console.log(`Prepared ${PUBLIC_FILES.length} public GitHub Pages assets in dist/ for ${BUILD} (${UI_REV}; categories ${CATEGORY_REV}; visuals ${VISUAL_REV}; runtime ${RUNTIME_REV}; shopping ${SHOPPING_REV}; shell ${SHELL_REV}; menu ${MENU_REV}).`);

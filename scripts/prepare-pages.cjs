'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const BUILD = 'v59';
const PUBLIC_FILES = Object.freeze([
  'index.html',
  'styles.css',
  'design-system.css',
  'mobile-layout.css',
  'market-experience.css',
  'market-barcode.css',
  'ui-icons.css',
  'invoice-capture.css',
  'app-update.css',
  'market-image-audit.css',
  'core.js',
  'finance.js',
  'render.js',
  'forms.js',
  'sync.js',
  'events.js',
  'market-experience.js',
  'market-barcode.js',
  'ui-icons.js',
  'invoice-capture.js',
  'app-update.js',
  'market-image-audit.js',
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
// O HTML fonte permanece estável; o bundle Pages é a fonte publicada e auditada pelo CI.
const distIndex=path.join(DIST,'index.html');
let index=fs.readFileSync(distIndex,'utf8');
index=index.replace(/<meta name="app-build" content="[^"]+"\s*\/>/,`<meta name="app-build" content="${BUILD}" />`);
index=index.replaceAll('?v=53',`?v=${BUILD.slice(1)}`);
index=index.replace(/<strong id="appBuildVersion">[^<]+<\/strong>/,`<strong id="appBuildVersion">${BUILD}</strong>`);

// v59: a auditoria de imagens usa apenas bases públicas Open Facts. Nenhum dado
// financeiro, PIN, token ou conteúdo do cofre é enviado a estas origens.
index=index.replace(
  "img-src 'self' data: blob: https://images.openfoodfacts.org; connect-src 'self' https://api.github.com https://cesta.pt https://world.openfoodfacts.org;",
  "img-src 'self' data: blob: https://*.openfoodfacts.org https://*.openbeautyfacts.org https://*.openproductsfacts.org https://*.openpetfoodfacts.org; connect-src 'self' https://api.github.com https://cesta.pt https://world.openfoodfacts.org https://world.openbeautyfacts.org https://world.openproductsfacts.org https://world.openpetfoodfacts.org;"
);

if(!index.includes('app-update.css')){
  index=index.replace('</head>',`  <link rel="stylesheet" href="./app-update.css?v=${BUILD.slice(1)}" />\n</head>`);
}
if(!index.includes('market-image-audit.css')){
  index=index.replace('</head>',`  <link rel="stylesheet" href="./market-image-audit.css?v=${BUILD.slice(1)}" />\n</head>`);
}
if(!index.includes('app-update.js')){
  index=index.replace('</body>',`  <script src="./app-update.js?v=${BUILD.slice(1)}" defer></script>\n</body>`);
}
if(!index.includes('market-image-audit.js')){
  index=index.replace('</body>',`  <script src="./market-image-audit.js?v=${BUILD.slice(1)}" defer></script>\n</body>`);
}
fs.writeFileSync(distIndex,index);

const distEvents=path.join(DIST,'events.js');
let events=fs.readFileSync(distEvents,'utf8');
events=events.replace("./sw.js?v=53",`./sw.js?v=${BUILD.slice(1)}`);
fs.writeFileSync(distEvents,events);

const forbidden=['README.md','SECURITY.md','PRIVACY.md','SPEC.md','CHANGELOG.md','.git','.github','tests','scripts','downloads'];
for(const entry of forbidden){
  if(fs.existsSync(path.join(DIST,entry))) throw new Error(`Forbidden file copied into Pages bundle: ${entry}`);
}

console.log(`Prepared ${PUBLIC_FILES.length} public GitHub Pages assets in dist/ for ${BUILD}.`);

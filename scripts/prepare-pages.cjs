'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const BUILD = 'v62';
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
  'market-retailer-image-policy.js',
  'market-image-audit.js',
  'market-official-images.js',
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
index=index.replaceAll('?v=53',`?v=${BUILD.slice(1)}`);
index=index.replace(/<strong id="appBuildVersion">[^<]+<\/strong>/,`<strong id="appBuildVersion">${BUILD}</strong>`);

// v62: resultados vivos Pingo Doce/Continente são visualmente official-only.
// As allowlists Open Facts permanecem porque scanner e itens antigos ainda podem usar
// essas fontes; a política v62 impede que esses fallbacks sejam apresentados nos
// cartões vivos do retalhista e deixa o bridge v61 resolver apenas o pid exato.
index=index.replace(
  "img-src 'self' data: blob: https://images.openfoodfacts.org; connect-src 'self' https://api.github.com https://cesta.pt https://world.openfoodfacts.org;",
  "img-src 'self' data: blob: https://www.continente.pt https://static.pingodoce.pt https://*.openfoodfacts.org https://*.openbeautyfacts.org https://*.openproductsfacts.org https://*.openpetfoodfacts.org; connect-src 'self' https://api.github.com https://cesta.pt https://r.jina.ai https://world.openfoodfacts.org https://world.openbeautyfacts.org https://world.openproductsfacts.org https://world.openpetfoodfacts.org;"
);

if(!index.includes('app-update.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./app-update.css?v=${BUILD.slice(1)}" />\n</head>`);
if(!index.includes('market-image-audit.css')) index=index.replace('</head>',`  <link rel="stylesheet" href="./market-image-audit.css?v=${BUILD.slice(1)}" />\n</head>`);
if(!index.includes('app-update.js')) index=index.replace('</body>',`  <script src="./app-update.js?v=${BUILD.slice(1)}" defer></script>\n</body>`);
// Tem de executar antes do resolvedor legado para bloquear fallbacks nos cartões vivos.
if(!index.includes('market-retailer-image-policy.js')) index=index.replace('</body>',`  <script src="./market-retailer-image-policy.js?v=${BUILD.slice(1)}" defer></script>\n</body>`);
if(!index.includes('market-image-audit.js')) index=index.replace('</body>',`  <script src="./market-image-audit.js?v=${BUILD.slice(1)}" defer></script>\n</body>`);
if(!index.includes('market-official-images.js')) index=index.replace('</body>',`  <script src="./market-official-images.js?v=${BUILD.slice(1)}" defer></script>\n</body>`);
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
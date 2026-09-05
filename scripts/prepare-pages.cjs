'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC_FILES = Object.freeze([
  'index.html',
  'styles.css',
  'design-system.css',
  'mobile-layout.css',
  'market-experience.css',
  'market-barcode.css',
  'ui-icons.css',
  'invoice-capture.css',
  'core.js',
  'finance.js',
  'render.js',
  'forms.js',
  'sync.js',
  'events.js',
  'market-experience.js',
  'market-image-resolver.js',
  'market-barcode.js',
  'ui-icons.js',
  'invoice-capture.js',
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

const forbidden=['README.md','SECURITY.md','PRIVACY.md','SPEC.md','CHANGELOG.md','.git','.github','tests','scripts','downloads'];
for(const entry of forbidden){
  if(fs.existsSync(path.join(DIST,entry))) throw new Error(`Forbidden file copied into Pages bundle: ${entry}`);
}

console.log(`Prepared ${PUBLIC_FILES.length} public GitHub Pages assets in dist/.`);

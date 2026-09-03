'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC_FILES = Object.freeze([
  'index.html',
  'styles.css',
  'design-system.css',
  'core.js',
  'finance.js',
  'render.js',
  'forms.js',
  'sync.js',
  'events.js',
  'mobile-install.js',
  'sw.js',
  'manifest.webmanifest',
  'icon.svg'
]);

function copyPublicFile(name) {
  const source = path.join(ROOT, name);
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) {
    throw new Error(`Public mobile asset missing: ${name}`);
  }
  fs.copyFileSync(source, path.join(DIST, name));
}

fs.rmSync(DIST, { recursive:true, force:true });
fs.mkdirSync(DIST, { recursive:true });
for (const name of PUBLIC_FILES) copyPublicFile(name);

const forbidden = [
  'README.md','SECURITY.md','PRIVACY.md','SPEC.md','CHANGELOG.md',
  '.git','.github','tests','node_modules','android','ios'
];
for (const entry of forbidden) {
  if (fs.existsSync(path.join(DIST, entry))) {
    throw new Error(`Forbidden file copied into mobile bundle: ${entry}`);
  }
}

console.log(`Prepared ${PUBLIC_FILES.length} public assets in dist/.`);

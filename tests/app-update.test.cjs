'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');

const updateJs = read('app-update.js');
const updateCss = read('app-update.css');
const sw = read('sw.js');
const prepare = read('scripts/prepare-pages.cjs');

assert.match(updateJs, /Atualização de Software/);
assert.match(updateJs, /Atualizações Automáticas/);
assert.match(updateJs, /Atualizações Beta/);
assert.match(updateJs, /Mais detalhes/);
assert.match(updateJs, /APP_RELEASE_NOTES/);
assert.match(updateJs, /version:'v60'/);
assert.match(updateJs, /Fotografias oficiais do Continente e Pingo Doce/);
assert.match(updateJs, /version:'v59'/);
assert.match(updateJs, /navigator\.serviceWorker\.getRegistration/);
assert.match(updateJs, /registration\.update\(\)/);
assert.match(updateJs, /SKIP_WAITING/);
assert.doesNotMatch(updateJs, /https?:\/\//, 'O centro de atualização não deve contactar endpoints externos.');

assert.match(updateCss, /software-update-dialog/);
assert.match(updateCss, /100dvh/);
assert.match(updateCss, /safe-area-inset-bottom/);
assert.match(updateCss, /html\[data-theme="dark"\]/);
assert.match(updateCss, /prefers-reduced-motion/);

assert.match(sw, /conta-de-casa-public-v60-official-retailer-images/);
assert.match(sw, /\.\/app-update\.css/);
assert.match(sw, /\.\/app-update\.js/);
assert.match(sw, /\.\/market-official-images\.js/);
assert.match(sw, /SKIP_WAITING/);

assert.match(prepare, /const BUILD = 'v60'/);
assert.match(prepare, /'app-update\.css'/);
assert.match(prepare, /'app-update\.js'/);
assert.match(prepare, /'market-image-audit\.css'/);
assert.match(prepare, /'market-image-audit\.js'/);
assert.match(prepare, /'market-official-images\.js'/);

const dist = path.join(ROOT, 'dist');
try {
  execFileSync(process.execPath, ['scripts/prepare-pages.cjs'], { cwd: ROOT, stdio: 'pipe' });
  const index = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const events = fs.readFileSync(path.join(dist, 'events.js'), 'utf8');
  assert.match(index, /<meta name="app-build" content="v60"/);
  assert.match(index, /app-update\.css\?v=60/);
  assert.match(index, /app-update\.js\?v=60/);
  assert.match(index, /market-image-audit\.css\?v=60/);
  assert.match(index, /market-image-audit\.js\?v=60/);
  assert.match(index, /market-official-images\.js\?v=60/);
  assert.doesNotMatch(index, /\?v=53/);
  assert.match(index, /id="appBuildVersion">v60</);
  assert.match(events, /\.\/sw\.js\?v=60/);
  assert.ok(fs.existsSync(path.join(dist, 'app-update.css')));
  assert.ok(fs.existsSync(path.join(dist, 'app-update.js')));
  assert.ok(fs.existsSync(path.join(dist, 'market-image-audit.css')));
  assert.ok(fs.existsSync(path.join(dist, 'market-image-audit.js')));
  assert.ok(fs.existsSync(path.join(dist, 'market-official-images.js')));
  assert.ok(fs.existsSync(path.join(dist, 'retailer-images', 'index.json')));
} finally {
  fs.rmSync(dist, { recursive: true, force: true });
}

console.log('Software update center and Pages build tests: OK');

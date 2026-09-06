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
const releaseManifest = JSON.parse(read('release-manifest.json'));

assert.match(updateJs, /Centro de Atualização de Software \(v63\)/);
assert.match(updateJs, /Instalação de atualizações/);
assert.match(updateJs, /Ao confirmar/);
assert.match(updateJs, /Histórico de versões/);
assert.match(updateJs, /Mais detalhes/);
assert.match(updateJs, /release-manifest\.json/);
assert.match(updateJs, /fetch\(`\.\/release-manifest\.json\?/);
assert.match(updateJs, /cache:'no-store'/);
assert.match(updateJs, /navigator\.serviceWorker\.getRegistration/);
assert.match(updateJs, /registration\.update\(\)/);
assert.match(updateJs, /APPLY_UPDATE/);
assert.match(updateJs, /controllerchange/);
assert.match(updateJs, /location\.reload\(\)/);
assert.match(updateJs, /Atualizar agora para/);
assert.match(updateJs, /version:'v63'/);
assert.doesNotMatch(updateJs, /https?:\/\//, 'The update center must not contact external endpoints.');

assert.equal(releaseManifest.schemaVersion,1);
assert.equal(releaseManifest.channel,'stable');
assert.equal(releaseManifest.latestVersion,'v63');
assert.ok(Array.isArray(releaseManifest.releases));
assert.equal(releaseManifest.releases[0].version,'v63');
assert.ok(releaseManifest.releases[0].items.length>=5);
assert.ok(releaseManifest.releases.some(release=>release.version==='v62'));

assert.match(updateCss, /Centro de Atualização de Software v63/);
assert.match(updateCss, /software-update-dialog/);
assert.match(updateCss, /software-update-status\.available/);
assert.match(updateCss, /100dvh/);
assert.match(updateCss, /safe-area-inset-bottom/);
assert.match(updateCss, /html\[data-theme="dark"\]/);
assert.match(updateCss, /prefers-reduced-motion/);

assert.match(sw, /conta-de-casa-public-v63-ui1/);
assert.match(sw, /\.\/app-update\.css/);
assert.match(sw, /\.\/app-update\.js/);
assert.match(sw, /\.\/release-manifest\.json/);
assert.match(sw, /APPLY_UPDATE/);
assert.match(sw, /SKIP_WAITING/,'v62 clients must still be able to request activation');
assert.match(sw, /applyRequested=true/);
assert.match(sw, /client\.navigate\(client\.url\)/,'explicit update must be able to refresh legacy v62 clients');
assert.doesNotMatch(sw, /install[\s\S]{0,260}skipWaiting\(\)/,'updates must not skip waiting automatically during install');

assert.match(prepare, /const BUILD = 'v63'/);
assert.match(prepare, /const UI_REV = '63-ui1'/);
assert.match(prepare, /const CATEGORY_REV = '63-ui1'/);
assert.match(prepare, /'app-update\.css'/);
assert.match(prepare, /'app-update\.js'/);
assert.match(prepare, /'release-manifest\.json'/);
assert.match(prepare, /manifest\.latestVersion!==BUILD/,'build must fail if release manifest and public version diverge');

const dist = path.join(ROOT, 'dist');
try {
  execFileSync(process.execPath, ['scripts/prepare-pages.cjs'], { cwd: ROOT, stdio: 'pipe' });
  const index = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const events = fs.readFileSync(path.join(dist, 'events.js'), 'utf8');
  const distManifest = JSON.parse(fs.readFileSync(path.join(dist,'release-manifest.json'),'utf8'));
  assert.match(index, /<meta name="app-build" content="v63"/);
  assert.match(index, /app-update\.css\?v=63/);
  assert.match(index, /app-update\.js\?v=63/);
  assert.match(index, /market-brand\.css\?v=63-ui1/);
  assert.match(index, /market-branding\.js\?v=63-ui1/);
  assert.match(index, /sync-conflict-policy\.js\?v=63-ui1/);
  assert.match(index, /market-category-groups\.css\?v=63-ui1/);
  assert.match(index, /market-category-groups\.js\?v=63-ui1/);
  assert.doesNotMatch(index, /\?v=53/);
  assert.match(index, /id="appBuildVersion">v63</);
  assert.match(events, /\.\/sw\.js\?v=63/);
  assert.equal(distManifest.latestVersion,'v63');
  assert.ok(index.indexOf('sync.js?v=63') < index.indexOf('sync-conflict-policy.js?v=63-ui1'), 'sync conflict policy must load after the base sync engine');
  assert.ok(fs.existsSync(path.join(dist, 'app-update.css')));
  assert.ok(fs.existsSync(path.join(dist, 'app-update.js')));
  assert.ok(fs.existsSync(path.join(dist, 'release-manifest.json')));
} finally {
  fs.rmSync(dist, { recursive: true, force: true });
}

console.log('Versioned software update center, release manifest and controlled installation tests: OK');

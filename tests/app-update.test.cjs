'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');

const updateJs = read('app-update.js');
const updateCss = read('app-update.css');
const consistencyCss = read('ui-consistency.css');
const runtimeJs = read('v64-runtime.js');
const runtimeCss = read('v64-runtime.css');
const shoppingJs = read('market-shopping-focus.js');
const shoppingCss = read('market-shopping-focus.css');
const menuJs = read('mobile-menu-toggle.js');
const menuCss = read('mobile-menu-toggle.css');
const sw = read('sw.js');
const prepare = read('scripts/prepare-pages.cjs');
const releaseManifest = JSON.parse(read('release-manifest.json'));
const webManifest = JSON.parse(read('manifest.webmanifest'));

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
assert.match(updateJs, /meta\[name="app-build"\]/);
assert.doesNotMatch(updateJs, /https?:\/\//, 'The update center must not contact external endpoints.');

assert.equal(releaseManifest.schemaVersion,1);
assert.equal(releaseManifest.channel,'stable');
assert.equal(releaseManifest.latestVersion,'v73');
assert.ok(Array.isArray(releaseManifest.releases));
assert.equal(releaseManifest.releases[0].version,'v73');
assert.ok(releaseManifest.releases[0].items.length>=7);
assert.ok(releaseManifest.releases.some(release=>release.version==='v72'));
assert.ok(releaseManifest.releases.some(release=>release.version==='v71'));
assert.ok(releaseManifest.releases.some(release=>release.version==='v70'));
assert.ok(releaseManifest.releases.some(release=>release.version==='v69'));
assert.ok(releaseManifest.releases.some(release=>release.version==='v68'));
assert.ok(releaseManifest.releases.some(release=>release.version==='v67'));
assert.ok(releaseManifest.releases.some(release=>release.version==='v66'));
assert.ok(releaseManifest.releases.some(release=>release.version==='v65'));
assert.ok(releaseManifest.releases.some(release=>release.version==='v64'));
assert.ok(releaseManifest.releases[0].items.some(item=>/lado direito|direita/i.test(item)),'v73 notes must expose the right-side navigation direction');
assert.ok(releaseManifest.releases[0].items.some(item=>/swipe|gesto/i.test(item)),'v73 notes must expose the inverted horizontal gesture');
assert.ok(releaseManifest.releases[0].items.some(item=>/header.*fix|cabeçalho.*fix/i.test(item)),'v73 notes must preserve the fixed mobile header');
assert.ok(releaseManifest.releases[0].items.some(item=>/não modifica|exclusivamente|não altera/i.test(item)),'v73 notes must state that financial/private data is untouched');
assert.equal(webManifest.background_color,'#f5f7fa');
assert.equal(webManifest.theme_color,'#f5f7fa');

assert.match(updateCss, /software-update-dialog/);
assert.match(updateCss, /software-update-status\.available/);
assert.match(updateCss, /100dvh/);
assert.match(updateCss, /safe-area-inset-bottom/);
assert.match(updateCss, /html\[data-theme="dark"\]/);
assert.match(updateCss, /prefers-reduced-motion/);
assert.match(consistencyCss,/Conta de Casa v64/);
assert.match(runtimeJs,/Conta de Casa v64/);
assert.match(runtimeCss,/v66 acrescenta consistência cromática/);
assert.match(shoppingJs,/Conta de Casa v65/);
assert.match(shoppingCss,/Conta de Casa v65/);
assert.match(menuJs,/Conta de Casa v73/);
assert.match(menuCss,/Conta de Casa v73/);

assert.match(sw, /conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v73-menu8/);
for(const asset of ['./app-update.css','./app-update.js','./ui-consistency.css','./v64-runtime.css','./v64-runtime.js','./market-shopping-focus.css','./market-shopping-focus.js','./mobile-menu-toggle.css','./mobile-menu-toggle.js','./release-manifest.json'])assert.ok(sw.includes(`'${asset}'`),`${asset} must be cached`);
assert.match(sw, /APPLY_UPDATE/);
assert.match(sw, /SKIP_WAITING/,'legacy clients must still be able to request activation');
assert.match(sw, /applyRequested=true/);
assert.match(sw, /client\.navigate\(client\.url\)/,'explicit update must be able to refresh legacy clients');
assert.doesNotMatch(sw, /install[\s\S]{0,260}skipWaiting\(\)/,'updates must not skip waiting automatically during install');

assert.match(prepare, /const BUILD = 'v73'/);
assert.match(prepare, /const UI_REV = '64-ui1'/);
assert.match(prepare, /const CATEGORY_REV = '64-ui1'/);
assert.match(prepare, /const VISUAL_REV = '64-ui1'/);
assert.match(prepare, /const RUNTIME_REV = '64-runtime1'/);
assert.match(prepare, /const SHOPPING_REV = '65-shopping1'/);
assert.match(prepare, /const SHELL_REV = '66-shell1'/);
assert.match(prepare, /const MENU_REV = '73-menu8'/);
for(const asset of ['app-update.css','app-update.js','ui-consistency.css','v64-runtime.css','v64-runtime.js','market-shopping-focus.css','market-shopping-focus.js','mobile-menu-toggle.css','mobile-menu-toggle.js','release-manifest.json'])assert.ok(prepare.includes(`'${asset}'`),`${asset} must be copied to dist`);
assert.match(prepare, /manifest\.latestVersion!==BUILD/,'build must fail if release manifest and public version diverge');
assert.match(prepare, /theme-color" content="#f5f7fa"/,'public build must stamp the canonical light shell colour');

const dist = path.join(ROOT, 'dist');
try {
  execFileSync(process.execPath, ['scripts/prepare-pages.cjs'], { cwd: ROOT, stdio: 'pipe' });
  const index = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const events = fs.readFileSync(path.join(dist, 'events.js'), 'utf8');
  const distManifest = JSON.parse(fs.readFileSync(path.join(dist,'release-manifest.json'),'utf8'));
  const distWebManifest = JSON.parse(fs.readFileSync(path.join(dist,'manifest.webmanifest'),'utf8'));
  assert.match(index, /<meta name="app-build" content="v73"/);
  assert.match(index, /<meta name="theme-color" content="#f5f7fa"/);
  assert.match(index, /app-update\.css\?v=73/);
  assert.match(index, /app-update\.js\?v=73/);
  assert.match(index, /market-brand\.css\?v=64-ui1/);
  assert.match(index, /market-branding\.js\?v=64-ui1/);
  assert.match(index, /sync-conflict-policy\.js\?v=64-ui1/);
  assert.match(index, /market-category-groups\.css\?v=64-ui1/);
  assert.match(index, /market-category-groups\.js\?v=64-ui1/);
  assert.match(index, /ui-consistency\.css\?v=64-ui1/);
  assert.match(index, /v64-runtime\.css\?v=66-shell1/);
  assert.match(index, /v64-runtime\.js\?v=64-runtime1/);
  assert.match(index, /market-shopping-focus\.css\?v=65-shopping1/);
  assert.match(index, /market-shopping-focus\.js\?v=65-shopping1/);
  assert.match(index, /mobile-menu-toggle\.css\?v=73-menu8/);
  assert.match(index, /mobile-menu-toggle\.js\?v=73-menu8/);
  assert.doesNotMatch(index, /\?v=53/);
  assert.match(index, /id="appBuildVersion">v73</);
  assert.match(events, /\.\/sw\.js\?v=73/);
  assert.equal(distManifest.latestVersion,'v73');
  assert.equal(distWebManifest.background_color,'#f5f7fa');
  assert.equal(distWebManifest.theme_color,'#f5f7fa');
  assert.ok(index.indexOf('sync.js?v=73') < index.indexOf('sync-conflict-policy.js?v=64-ui1'), 'sync conflict policy must load after the base sync engine');
  assert.ok(index.indexOf('market-category-groups.css?v=64-ui1') < index.indexOf('ui-consistency.css?v=64-ui1'), 'visual normalization must load after category styling');
  assert.ok(index.indexOf('ui-consistency.css?v=64-ui1') < index.indexOf('v64-runtime.css?v=66-shell1'), 'v66 mobile shell CSS must load after prior visual normalization');
  assert.ok(index.indexOf('v64-runtime.css?v=66-shell1') < index.indexOf('market-shopping-focus.css?v=65-shopping1'), 'v65 shopping focus remains after the shell layer');
  assert.ok(index.indexOf('market-shopping-focus.css?v=65-shopping1') < index.indexOf('mobile-menu-toggle.css?v=73-menu8'), 'v73 navigation layer must load last');
  assert.ok(index.indexOf('market-category-groups.js?v=64-ui1') < index.indexOf('v64-runtime.js?v=64-runtime1'), 'v64 runtime must load after market grouping');
  assert.ok(index.indexOf('v64-runtime.js?v=64-runtime1') < index.indexOf('market-shopping-focus.js?v=65-shopping1'), 'v65 shopping focus must run after the established market/runtime layers');
  assert.ok(index.indexOf('market-shopping-focus.js?v=65-shopping1') < index.indexOf('mobile-menu-toggle.js?v=73-menu8'), 'v73 menu controller must run after the existing navigation/runtime listeners are defined');
  for(const asset of ['app-update.css','app-update.js','ui-consistency.css','v64-runtime.css','v64-runtime.js','market-shopping-focus.css','market-shopping-focus.js','mobile-menu-toggle.css','mobile-menu-toggle.js','release-manifest.json'])assert.ok(fs.existsSync(path.join(dist,asset)),`${asset} must exist in dist`);
} finally {
  fs.rmSync(dist, { recursive:true, force:true });
}

console.log('Versioned v73 right-side navigation, v66 shell, v65 shopping focus and controlled installation expectations: OK');

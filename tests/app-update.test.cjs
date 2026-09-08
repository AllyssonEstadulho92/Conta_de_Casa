'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');

const updateJs = read('app-update.js');
const updateCss = read('app-update.css');
const designCss = read('design-system.css');
const runtimeJs = read('v64-runtime.js');
const shoppingJs = read('market-shopping-focus.js');
const shoppingCss = read('market-shopping-focus.css');
const menuJs = read('mobile-menu-toggle.js');
const menuCss = read('mobile-menu-toggle.css');
const experienceJs = read('v74-experience.js');
const sw = read('sw.js');
const prepare = read('scripts/prepare-pages.cjs');
const releaseManifest = JSON.parse(read('release-manifest.json'));
const webManifest = JSON.parse(read('manifest.webmanifest'));

assert.match(updateJs, /Instalação de atualizações/);
assert.match(updateJs, /Histórico de versões/);
assert.match(updateJs, /release-manifest\.json/);
assert.match(updateJs, /cache:'no-store'/);
assert.match(updateJs, /navigator\.serviceWorker\.getRegistration/);
assert.match(updateJs, /registration\.update\(\)/);
assert.match(updateJs, /APPLY_UPDATE/);
assert.match(updateJs, /controllerchange/);
assert.match(updateJs, /location\.reload\(\)/);
assert.doesNotMatch(updateJs, /https?:\/\//, 'The update center must not contact external endpoints.');

assert.equal(releaseManifest.schemaVersion,1);
assert.equal(releaseManifest.channel,'stable');
assert.equal(releaseManifest.latestVersion,'v74');
assert.equal(releaseManifest.releases[0].version,'v74');
assert.ok(releaseManifest.releases[0].items.length>=7);
assert.ok(releaseManifest.releases.some(release=>release.version==='v73'));
assert.ok(releaseManifest.releases.some(release=>release.version==='v64'));
assert.ok(releaseManifest.releases[0].items.some(item=>/identidade|verde-petróleo|teal/i.test(item)));
assert.ok(releaseManifest.releases[0].items.some(item=>/Ler fatura|QR/i.test(item)));
assert.ok(releaseManifest.releases[0].items.some(item=>/não foram reescritos|não.*migrados/i.test(item)),'v74 notes must state preservation of financial/security data');
assert.equal(webManifest.background_color,'#f4f8f8');
assert.equal(webManifest.theme_color,'#f4f8f8');

assert.match(updateCss, /software-update-dialog/);
assert.match(updateCss, /safe-area-inset-bottom/);
assert.match(updateCss, /prefers-reduced-motion/);
assert.match(designCss,/Conta de Casa v74/);
assert.match(runtimeJs,/Conta de Casa v64/);
assert.match(shoppingJs,/Conta de Casa v65/);
assert.match(shoppingCss,/Conta de Casa v74/);
assert.match(menuJs,/Conta de Casa v73/);
assert.match(menuCss,/Conta de Casa v73/);
assert.match(experienceJs,/Conta de Casa v74/);

assert.match(sw, /conta-de-casa-public-v74-ui1-v74-shopping2-v73-menu8-v74-experience1/);
for(const asset of ['./app-update.css','./app-update.js','./design-system.css','./v64-runtime.js','./market-shopping-focus.css','./market-shopping-focus.js','./mobile-menu-toggle.css','./mobile-menu-toggle.js','./v74-experience.js','./release-manifest.json'])assert.ok(sw.includes(`'${asset}'`),`${asset} must be cached`);
assert.ok(!sw.includes("'./ui-consistency.css'"));
assert.ok(!sw.includes("'./v64-runtime.css'"));
assert.match(sw, /APPLY_UPDATE/);
assert.match(sw, /SKIP_WAITING/);
assert.match(sw, /applyRequested=true/);
assert.match(sw, /client\.navigate\(client\.url\)/);
assert.doesNotMatch(sw, /install[\s\S]{0,260}skipWaiting\(\)/,'updates must not skip waiting automatically during install');

assert.match(prepare, /const BUILD = 'v74'/);
assert.match(prepare, /const UI_REV = '74-ui1'/);
assert.match(prepare, /const CATEGORY_REV = '64-ui1'/);
assert.match(prepare, /const RUNTIME_REV = '64-runtime1'/);
assert.match(prepare, /const SHOPPING_REV = '74-shopping2'/);
assert.match(prepare, /const MENU_REV = '73-menu8'/);
assert.match(prepare, /const EXPERIENCE_REV = '74-experience1'/);
for(const asset of ['app-update.css','app-update.js','design-system.css','v64-runtime.js','market-shopping-focus.css','market-shopping-focus.js','mobile-menu-toggle.css','mobile-menu-toggle.js','v74-experience.js','release-manifest.json'])assert.ok(prepare.includes(`'${asset}'`),`${asset} must be copied to dist`);
assert.ok(!prepare.match(/PUBLIC_FILES[\s\S]*'ui-consistency\.css'/));
assert.ok(!prepare.match(/PUBLIC_FILES[\s\S]*'v64-runtime\.css'/));
assert.match(prepare, /manifest\.latestVersion!==BUILD/,'build must fail if release manifest and public version diverge');
assert.match(prepare, /theme-color" content="#f4f8f8"/);

const dist = path.join(ROOT, 'dist');
try {
  execFileSync(process.execPath, ['scripts/prepare-pages.cjs'], { cwd: ROOT, stdio: 'pipe' });
  const index = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const events = fs.readFileSync(path.join(dist, 'events.js'), 'utf8');
  const distManifest = JSON.parse(fs.readFileSync(path.join(dist,'release-manifest.json'),'utf8'));
  const distWebManifest = JSON.parse(fs.readFileSync(path.join(dist,'manifest.webmanifest'),'utf8'));
  assert.match(index, /<meta name="app-build" content="v74"/);
  assert.match(index, /<meta name="theme-color" content="#f4f8f8"/);
  assert.match(index, /design-system\.css\?v=74/);
  assert.match(index, /app-update\.css\?v=74/);
  assert.match(index, /market-brand\.css\?v=74-ui1/);
  assert.match(index, /market-shopping-focus\.css\?v=74-shopping2/);
  assert.match(index, /market-shopping-focus\.js\?v=74-shopping2/);
  assert.match(index, /mobile-menu-toggle\.css\?v=73-menu8/);
  assert.match(index, /mobile-menu-toggle\.js\?v=73-menu8/);
  assert.match(index, /v74-experience\.js\?v=74-experience1/);
  assert.doesNotMatch(index, /ui-consistency\.css/);
  assert.doesNotMatch(index, /v64-runtime\.css/);
  assert.doesNotMatch(index, /\?v=53/);
  assert.match(index, /id="appBuildVersion">v74</);
  assert.match(events, /\.\/sw\.js\?v=74/);
  assert.equal(distManifest.latestVersion,'v74');
  assert.equal(distWebManifest.background_color,'#f4f8f8');
  assert.equal(distWebManifest.theme_color,'#f4f8f8');
  assert.ok(index.indexOf('sync.js?v=74') < index.indexOf('sync-conflict-policy.js?v=74-ui1'));
  assert.ok(index.indexOf('market-shopping-focus.js?v=74-shopping2') < index.indexOf('mobile-menu-toggle.js?v=73-menu8'));
  assert.ok(index.indexOf('mobile-menu-toggle.js?v=73-menu8') < index.indexOf('v74-experience.js?v=74-experience1'));
  for(const asset of ['app-update.css','app-update.js','design-system.css','v64-runtime.js','market-shopping-focus.css','market-shopping-focus.js','mobile-menu-toggle.css','mobile-menu-toggle.js','v74-experience.js','release-manifest.json'])assert.ok(fs.existsSync(path.join(dist,asset)),`${asset} must exist in dist`);
  assert.ok(!fs.existsSync(path.join(dist,'ui-consistency.css')));
  assert.ok(!fs.existsSync(path.join(dist,'v64-runtime.css')));
} finally {
  fs.rmSync(dist, { recursive:true, force:true });
}

console.log('Versioned v74 identity, controlled installation and lean public bundle expectations: OK');

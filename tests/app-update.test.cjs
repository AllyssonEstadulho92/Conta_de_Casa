'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const pkg=JSON.parse(read('package.json'));
const index=read('index.html');
const updateCss=read('app-update.css');
const updateJs=read('app-update.js');
const versionCss=read('v76-version-about.css');
const designCss=read('design-system.css');
const runtimeJs=read('v64-runtime.js');
const shoppingJs=read('market-shopping-focus.js');
const shoppingCss=read('market-shopping-focus.css');
const menuJs=read('mobile-menu-toggle.js');
const menuCss=read('mobile-menu-toggle.css');
const experienceJs=read('v74-experience.js');
const experienceCss=read('v74-experience.css');
const architectureJs=read('v75-architecture.js');
const architectureCss=read('v75-architecture.css');
const stabilityJs=read('v75-stability.js');
const stabilityCss=read('v75-stability.css');
const layoutCss=read('v75-layout-polish.css');
const drawerCss=read('v75-drawer-theme.css');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');
const releaseManifest=JSON.parse(read('release-manifest.json'));
const webManifest=JSON.parse(read('manifest.webmanifest'));

assert.equal(pkg.version,'0.76.0-dev.1');
assert.match(pkg.description,/migração incremental TypeScript v76/i);
assert.equal(pkg.devDependencies.typescript,'6.0.3');
assert.equal(pkg.scripts.typecheck,'tsc -p tsconfig.json --noEmit');
assert.equal(pkg.scripts['build:runtime'],'node scripts/build-typescript-runtime.cjs');
assert.equal(pkg.scripts['build:pages'],'node scripts/prepare-pages.cjs');

assert.match(index,/id="appBuildVersion"/);
assert.match(index,/id="appBuildId"/);
assert.match(index,/id="appBuildDate"/);
assert.match(index,/id="appUpdateBtn"/);
assert.match(index,/id="appUpdateStatus"/);
assert.match(index,/id="appUpdateDialog"/);
assert.match(index,/id="appUpdateDialogStatus"/);
assert.match(index,/id="appUpdateReloadBtn"/);
assert.match(index,/id="appUpdateCheckBtn"/);
assert.match(index,/id="appUpdateDismissBtn"/);
assert.match(index,/id="appUpdateCloseBtn"/);

assert.match(updateJs,/APP_UPDATE_REV='76-version-audit1'/);
assert.match(updateJs,/function compareSemanticVersion/);
assert.match(updateJs,/function checkForAppUpdate/);
assert.match(updateJs,/function applyWaitingServiceWorker/);
assert.match(updateJs,/APPLY_UPDATE/);
assert.match(updateJs,/SKIP_WAITING/);
assert.match(updateJs,/registration\.update\(\)/);
assert.match(updateJs,/controllerchange/);
assert.match(updateJs,/navigator\.serviceWorker\.ready/);
assert.match(updateJs,/release-manifest\.json/);
assert.match(updateJs,/cache:'no-store'/);
assert.doesNotMatch(updateJs,/localStorage|sessionStorage|indexedDB|appState|vaultKey|saveState\(/);

assert.equal(releaseManifest.schemaVersion,1);
assert.match(releaseManifest.latest.version,/^v?\d+\.\d+\.\d+/);
assert.ok(Array.isArray(releaseManifest.releases));
assert.ok(releaseManifest.releases.some(release=>release.version==='v75'));
assert.ok(releaseManifest.releases.some(release=>release.version==='v74'));
assert.ok(releaseManifest.releases.some(release=>release.version==='v73'));
assert.ok(releaseManifest.releases.some(release=>release.version==='v64'));
assert.equal(webManifest.background_color,'#f4f8f8');
assert.equal(webManifest.theme_color,'#f4f8f8');

assert.match(updateCss,/software-update-dialog/);
assert.match(updateCss,/safe-area-inset-bottom/);
assert.match(updateCss,/prefers-reduced-motion/);
assert.match(versionCss,/software-version-hero/);
assert.match(versionCss,/software-version-facts/);
assert.match(versionCss,/forced-colors/);
assert.match(designCss,/Conta de Casa v74/);
assert.match(runtimeJs,/Conta de Casa v64/);
assert.match(shoppingJs,/Conta de Casa v65/);
assert.match(shoppingCss,/Conta de Casa v74/);
assert.match(menuJs,/Conta de Casa v73/);
assert.match(menuCss,/Conta de Casa v73/);
assert.match(experienceJs,/Conta de Casa v74/);
assert.match(experienceCss,/Conta de Casa v74/);
assert.match(architectureJs,/Conta de Casa v75/);
assert.match(architectureCss,/Conta de Casa v75/);
assert.match(stabilityJs,/revision:'75-stability1'/);
assert.match(stabilityCss,/revisão transversal de estabilidade visual/i);
assert.match(layoutCss,/revisão 75-layout1/i);
assert.match(drawerCss,/revisão 76-drawer-neutral1/i);
assert.match(drawerCss,/background:var\(--v76-drawer-surface\)!important/);
assert.doesNotMatch(drawerCss,/linear-gradient\(/,'software update gate must accept the final neutral drawer rather than preserving a removed visual contract');

assert.match(sw,/version-audit1/);
assert.match(sw,/conta-de-casa-public-v75-architecture2/);
assert.match(sw,/stability1-layout1-drawer2/);
assert.match(sw,/ui-audit1/);
for(const asset of ['./app-update.css','./app-update.js','./v76-version-about.css','./design-system.css','./v64-runtime.js','./market-shopping-focus.css','./market-shopping-focus.js','./mobile-menu-toggle.css','./mobile-menu-toggle.js','./v74-experience.css','./v74-experience.js','./v75-architecture.css','./v75-architecture.js','./v75-stability.css','./v75-stability.js','./v75-layout-polish.css','./v75-drawer-theme.css','./release-manifest.json'])assert.ok(sw.includes(`'${asset}'`),`${asset} must be cached`);
assert.ok(!sw.includes("'./v75-drawer-blue.css'"));
assert.ok(!sw.includes("'./ui-consistency.css'"));
assert.ok(!sw.includes("'./v64-runtime.css'"));
assert.match(sw,/APPLY_UPDATE/);
assert.match(sw,/SKIP_WAITING/);
assert.match(sw,/applyRequested=true/);
assert.match(sw,/client\.navigate\(client\.url\)/);
assert.doesNotMatch(sw,/install[\s\S]{0,260}skipWaiting\(\)/);

assert.match(prepare,/const APP_VERSION = String\(PACKAGE\.version/);
assert.match(prepare,/git'.*rev-parse.*--short=7.*HEAD/s);
assert.match(prepare,/const APP_UPDATE_REV = '76-version-audit1'/);
assert.match(prepare,/const BUILD = 'v75'/);
assert.match(prepare,/name="app-version"/);
assert.match(prepare,/name="app-build-id"/);
assert.match(prepare,/name="app-build-date"/);
assert.match(prepare,/app-update\.css\?v=\$\{APP_UPDATE_REV\}/);
assert.match(prepare,/v76-version-about\.css\?v=\$\{APP_UPDATE_REV\}/);
assert.match(prepare,/app-update\.js\?v=\$\{APP_UPDATE_REV\}/);

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const builtIndex=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(builtIndex,/name="app-version" content="0\.76\.0-dev\.1"/);
  assert.match(builtIndex,/name="app-build-id" content="(?:[0-9a-f]{7}|local)"/);
  assert.match(builtIndex,/name="app-build-date" content="[^"]+"/);
  assert.match(builtIndex,/app-update\.css\?v=76-version-audit1/);
  assert.match(builtIndex,/v76-version-about\.css\?v=76-version-audit1/);
  assert.match(builtIndex,/app-update\.js\?v=76-version-audit1/);
  assert.ok(fs.existsSync(path.join(dist,'release-manifest.json')));
  assert.ok(fs.existsSync(path.join(dist,'app-update.js')));
  assert.ok(fs.existsSync(path.join(dist,'app-update.css')));
  assert.ok(fs.existsSync(path.join(dist,'v76-version-about.css')));
  assert.match(fs.readFileSync(path.join(dist,'v75-drawer-theme.css'),'utf8'),/76-drawer-neutral1/);
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Software update center, version metadata, neutral drawer compatibility and explicit SW update tests: OK');
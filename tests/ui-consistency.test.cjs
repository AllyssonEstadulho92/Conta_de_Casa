'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const design=read('design-system.css');
const marketBrand=read('market-brand.css');
const shopping=read('market-shopping-focus.css');
const planningMore=read('v76-planning-more.css');
const architecture=read('v75-architecture.js');
const architectureCss=read('v75-architecture.css');
const drawerCss=read('v75-drawer-theme.css');
const headerCss=read('v75-header-refinement.css');
const menuCss=read('mobile-menu-toggle.css');
const menuJs=read('mobile-menu-toggle.js');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');
const publicFilesStart=prepare.indexOf('const PUBLIC_FILES');
const publicFilesEnd=prepare.indexOf(']);',publicFilesStart);
const publicFilesBlock=prepare.slice(publicFilesStart,publicFilesEnd+3);
const manifest=JSON.parse(read('manifest.webmanifest'));

assert.match(design,/Conta de Casa v74/);
assert.match(design,/--bg:#f4f8f8/);
assert.match(design,/--text:#0c2830/);
assert.match(design,/--primary:#075b63/);
assert.match(design,/--accent:#17b890/);
assert.match(design,/--mobile-shell-bg:#f4f8f8/);
assert.match(design,/\[data-theme="dark"\][\s\S]*--mobile-shell-bg:#071b20/);
assert.match(design,/safe-area-inset-top/);
assert.match(design,/position:fixed!important/);
assert.match(design,/\.ui-icon-svg,\.svg-icon\{[\s\S]*stroke-width:2!important/);
assert.match(design,/prefers-reduced-motion:reduce/);

for(const retiredSource of ['v74-experience.css','v74-experience.js','v75-market-featured.css','v75-market-featured.js'])assert.ok(!fs.existsSync(path.join(ROOT,retiredSource)),`${retiredSource} must be physically deleted`);

assert.match(planningMore,/Conta de Casa v76 — Planeamento e Mais, revisão 76-planning-more1/i);
for(const marker of ['.cdc-empty-note','.cdc-avatar','.cdc-category-dot','.cdc-planning-overview','.cdc-budget-ring','.cdc-plan-track','.cdc-more-menu','.cdc-preferences-details'])assert.ok(planningMore.includes(marker));
assert.match(planningMore,/@media\(max-width:820px\)/);
assert.match(planningMore,/@media\(min-width:821px\)/);
assert.match(planningMore,/\.cdc-preferences-details\{display:contents\}/);
assert.match(planningMore,/prefers-reduced-motion:reduce/);

assert.match(architectureCss,/Conta de Casa v75/);
assert.match(architectureCss,/--v75-header:#004653/);
assert.match(architectureCss,/--v75-bg:#f3f7f7/);
assert.match(architectureCss,/\.mobile-nav \.nav-btn,html\.cdc-v75 \.mobile-nav \.nav-btn:nth-child\(3\)[\s\S]*visibility:visible!important/);
assert.match(architectureCss,/\.v75-more-group/);
assert.match(architectureCss,/\.v75-budget-summary/);
assert.match(architectureCss,/\.v75-sync-hero/);
assert.match(architectureCss,/\.vault-keypad\{display:grid!important;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
assert.match(architectureCss,/#formDialog\.dialog\{width:100vw!important/);
assert.match(architectureCss,/\.invoice-scan-overlay[\s\S]*inset:0!important/);
assert.match(architectureCss,/background:var\(--v75-surface\)!important/);
assert.match(architectureCss,/prefers-reduced-motion:reduce/);

assert.match(headerCss,/cabeçalho móvel compatível com o design system atual/i);
assert.match(headerCss,/#cdcMobileGreeting[\s\S]*display:none!important/);
assert.match(headerCss,/#notificationsBtn[\s\S]*order:99!important/);
assert.match(headerCss,/--v75-header-row:60px/);
assert.match(headerCss,/background:var\(--v76-surface,#fff\)!important/);
assert.match(headerCss,/color:var\(--v76-text,#12343d\)!important/);
assert.match(headerCss,/\.mobile-menu-btn,[\s\S]*#notificationsBtn\{[\s\S]*width:44px!important/);
assert.match(headerCss,/border-bottom:1px solid var\(--v76-border,#dce7e8\)!important/);
assert.doesNotMatch(headerCss,/linear-gradient\(/,'mobile header must not use decorative gradients');
assert.doesNotMatch(headerCss,/color:#fff!important/,'mobile header controls must not force white on a light surface');
assert.match(headerCss,/prefers-reduced-motion:reduce/);
assert.match(headerCss,/forced-colors:active/);

assert.match(marketBrand,/Conta de Casa v74/);
assert.match(marketBrand,/\.market-product-photo[\s\S]*display:grid!important/);
assert.doesNotMatch(marketBrand,/\.market-product-photo[^\{]*\{[^}]*display:none!important/);
assert.match(shopping,/Conta de Casa v74/);
assert.match(shopping,/grid-template-columns:38px 54px minmax\(0,1fr\) auto!important/);

assert.doesNotMatch(architecture,/root\.CDCV74/,'v76 architecture must not depend on the retired v74 runtime');
assert.match(architecture,/Conta de Casa v76/);
assert.match(architecture,/76-architecture-consolidation1/);
assert.match(architecture,/76-drawer-hierarchy1/);
assert.match(architecture,/bills:\['Despesas','Movimentos'\]/);
assert.match(architecture,/settings:\['Definições','Aplicação'\]/);
assert.match(architecture,/DRAWER_GROUPS/);
assert.match(architecture,/label:'Principal'[\s\S]*Início[\s\S]*Despesas[\s\S]*Planeamento[\s\S]*Mercado/);
assert.match(architecture,/label:'Sistema'[\s\S]*Segurança e sincronização[\s\S]*Definições/);
assert.match(architecture,/MOBILE_NAV/);
assert.match(architecture,/MORE_GROUPS/);
assert.match(architecture,/ensureMoreShell/);
assert.match(architecture,/ensurePlanningShell/);
assert.match(architecture,/dashboardMetrics/);
assert.match(architecture,/categoryEntries/);
assert.match(architecture,/ensureBillTabs/);
assert.match(architecture,/CDCV75/);
assert.doesNotMatch(architecture,/placeDashboardGreeting/,'retired dashboard greeting must not return through architecture');
assert.doesNotMatch(architecture,/saveState\(|commit\(|estimatedCents\s*=|actualCents\s*=/);

/* Drawer: one-column hierarchy replaces the dense two-column card wall. */
assert.match(drawerCss,/76-drawer-hierarchy1/);
assert.match(drawerCss,/\.nav-drawer\[open\] \.drawer-nav \.nav-group-items\{[\s\S]*display:flex!important[\s\S]*flex-direction:column!important/);
assert.doesNotMatch(drawerCss,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
assert.match(drawerCss,/word-break:normal!important/);
assert.match(drawerCss,/\.nav-drawer\[open\] \.drawer-footer\{[\s\S]*display:flex!important[\s\S]*flex-direction:column!important/);

/* Menu móvel: o trigger global permanece no header e o X visível vive no dialog.
   A aplicação deixa de mover o mesmo botão entre duas árvores/top-layers. */
assert.match(menuCss,/Conta de Casa v76/);
assert.match(menuCss,/v76 menu-morph1/);
assert.match(menuCss,/76-menu-visible-close1/);
assert.match(menuCss,/\.mobile-menu-glyph::before,[\s\S]*\.mobile-menu-glyph::after/);
assert.match(menuCss,/\.drawer-close-glyph::before[\s\S]*rotate\(45deg\)/);
assert.match(menuCss,/\.drawer-close-glyph::after[\s\S]*rotate\(-45deg\)/);
assert.match(menuCss,/#drawerCloseBtn\.icon-btn\.drawer-close-control\{[\s\S]*display:inline-grid!important[\s\S]*visibility:visible!important[\s\S]*opacity:1!important/);
assert.match(menuJs,/closeButton\.hidden=false/);
assert.match(menuJs,/closeButton\.addEventListener\('click',[\s\S]*closeDrawer/);
assert.match(menuJs,/drawer\.close=animatedDrawerClose/);
assert.match(menuJs,/touch\.clientX>=root\.innerWidth-swipeEdgeWidth/);
assert.doesNotMatch(menuJs,/insertBefore\(button,drawerHead\.firstChild\)/,'global menu trigger must stay mounted in the shared header');
assert.match(menuCss,/@media\(min-width:821px\)[\s\S]*\.sidebar\{[\s\S]*inset:0 0 0 auto!important/);

assert.match(sw,/architecture-consolidation1-retire-v74-runtime1/);
assert.match(sw,/retire-assets1/);
assert.match(sw,/v76-version-alignment1/);
assert.match(sw,/menu-morph1/);
assert.match(sw,/menu-visible-close1/);
for(const asset of ['./design-system.css','./v75-architecture.css','./v76-planning-more.css','./v75-architecture.js','./v75-header-refinement.css'])assert.ok(sw.includes(`'${asset}'`));
for(const retired of ['./v74-experience.css','./v74-experience.js','./v75-market-featured.css','./v75-market-featured.js'])assert.ok(!sw.includes(`'${retired}'`),`${retired} must not be cached`);
assert.ok(!sw.includes("'./ui-consistency.css'"));
assert.ok(!sw.includes("'./v64-runtime.css'"));

assert.match(prepare,/const BUILD = 'v76'/);
assert.match(prepare,/const APP_UPDATE_REV = '76-version-alignment1'/);
assert.match(prepare,/const UI_REV = '74-ui1'/);
assert.match(prepare,/const SHOPPING_REV = '74-shopping2'/);
assert.match(prepare,/const ARCHITECTURE_REV = '75-architecture2'/);
assert.match(prepare,/const PLANNING_MORE_REV = '76-planning-more1'/);
assert.match(prepare,/const HEADER_REV = '75-header2'/);
assert.doesNotMatch(prepare,/const EXPERIENCE_REV/);
assert.doesNotMatch(prepare,/const FEATURED_REV/);
assert.doesNotMatch(publicFilesBlock,/'ui-consistency\.css'/);
assert.doesNotMatch(publicFilesBlock,/'v64-runtime\.css'/);
for(const retired of ['v74-experience.css','v74-experience.js','v75-market-featured.css','v75-market-featured.js'])assert.ok(!publicFilesBlock.includes(`'${retired}'`),`${retired} must not be public`);
for(const asset of ['v75-architecture.css','v76-planning-more.css','v75-architecture.js','v75-header-refinement.css'])assert.ok(publicFilesBlock.includes(`'${asset}'`));
assert.match(prepare,/forbidden=\[[^\]]*'v74-experience\.css'/s);
assert.match(prepare,/forbidden=\[[^\]]*'v75-market-featured\.css'/s);

assert.equal(manifest.background_color,'#f4f8f8');
assert.equal(manifest.theme_color,'#f4f8f8');

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/name="app-build" content="v76"/);
  assert.match(index,/design-system\.css\?v=76/);
  assert.match(index,/market-brand\.css\?v=74-ui1/);
  assert.match(index,/market-shopping-focus\.css\?v=74-shopping2/);
  assert.match(index,/mobile-menu-toggle\.css\?v=73-menu8/);
  assert.match(index,/v75-architecture\.css\?v=75-architecture2/);
  assert.match(index,/v76-planning-more\.css\?v=76-planning-more1/);
  assert.match(index,/v75-header-refinement\.css\?v=75-header2/);
  assert.match(index,/v75-architecture\.js\?v=75-architecture2/);
  assert.match(index,/<meta name="theme-color" content="#f4f8f8"/);
  assert.doesNotMatch(index,/v74-experience\.(?:css|js)/);
  assert.doesNotMatch(index,/v75-market-featured\.(?:css|js)/);
  for(const asset of ['design-system.css','v75-architecture.css','v76-planning-more.css','v75-architecture.js','v75-header-refinement.css'])assert.ok(fs.existsSync(path.join(dist,asset)));
  for(const retired of ['v74-experience.css','v74-experience.js','v75-market-featured.css','v75-market-featured.js'])assert.ok(!fs.existsSync(path.join(dist,retired)),`${retired} must not exist in dist`);
  assert.ok(!fs.existsSync(path.join(dist,'ui-consistency.css')));
  assert.ok(!fs.existsSync(path.join(dist,'v64-runtime.css')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Conta de Casa UI consistency: official v76 build keeps a stable shared header, readable drawer hierarchy and visible top-layer close control.');
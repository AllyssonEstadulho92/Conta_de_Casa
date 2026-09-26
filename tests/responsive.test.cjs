'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const legacyCss=read('styles.css');
const designCss=read('design-system.css');
const planningMore=read('v76-planning-more.css');
const architectureCss=read('v75-architecture.css');
const menuCss=read('mobile-menu-toggle.css');
const css=`${legacyCss}\n${designCss}\n${planningMore}\n${architectureCss}\n${menuCss}`;
const events=read('events.js');
const index=read('index.html');
const render=read('render.js');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');

for(const retiredSource of ['v74-experience.css','v74-experience.js','v75-market-featured.css','v75-market-featured.js'])assert.ok(!fs.existsSync(path.join(ROOT,retiredSource)),`${retiredSource} must be physically deleted`);

assert.match(designCss,/Conta de Casa v74 — sistema visual consolidado/);
assert.match(designCss,/--content-max:1480px/);
assert.match(designCss,/--sidebar-expanded:232px/);
assert.match(designCss,/--sidebar-rail:72px/);
assert.match(designCss,/html\.sidebar-collapsed\{--sidebar-current:var\(--sidebar-rail\)\}/);
assert.match(designCss,/@media\(max-width:820px\)/);
assert.match(designCss,/@media\(max-width:359px\)/);
assert.match(designCss,/--mobile-top-safe:max\(20px,calc\(env\(safe-area-inset-top,0px\) \+ 8px\)\)/);
assert.match(designCss,/--header-height:calc\(108px \+ var\(--mobile-top-safe\)\)/);
assert.match(designCss,/html\.app-active \.topbar,[\s\S]*position:fixed!important/);
assert.match(designCss,/html\.app-active \.main\{padding-top:var\(--header-height\)!important/);
assert.match(designCss,/\.mobile-menu-btn\{width:44px!important;[\s\S]*height:44px!important/);
assert.match(designCss,/\.mobile-nav\{grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/);
assert.match(designCss,/\.mobile-nav \.nav-btn\.active::before\{background:var\(--primary\)!important\}/);
assert.match(designCss,/prefers-reduced-motion:reduce/);

assert.match(planningMore,/Conta de Casa v76 — Planeamento e Mais, revisão 76-planning-more1/i);
assert.match(planningMore,/76-prototype-planning1/);
assert.match(planningMore,/@media\(max-width:820px\)/);
assert.match(planningMore,/@media\(min-width:821px\)/);
for(const marker of ['.cdc-empty-note','.cdc-avatar','.cdc-category-dot','.cdc-planning-overview','.cdc-budget-ring','.cdc-plan-track','.cdc-more-menu','.cdc-preferences-details'])assert.ok(planningMore.includes(marker));
assert.match(planningMore,/\.cdc-planning-overview,[\s\S]*\.cdc-more-menu[\s\S]*display:none!important/);
assert.match(planningMore,/\.cdc-preferences-details\{display:contents\}/);
assert.match(planningMore,/\.cdc-plan-track i[\s\S]*background:var\(--v76-primary/,'category progress should use the restrained solid prototype primary, not a decorative gradient');
assert.match(planningMore,/\.cdc-budget-ring\.is-unset/,'an undefined budget must keep a neutral responsive state');

assert.match(legacyCss,/\.mobile-nav \.nav-btn:nth-child\(3\)\{visibility:hidden\}/);
assert.match(architectureCss,/Conta de Casa v75/);
assert.match(architectureCss,/html\.cdc-v75 \.mobile-nav \.nav-btn,html\.cdc-v75 \.mobile-nav \.nav-btn:nth-child\(3\)\{visibility:visible!important;display:grid!important/);
assert.match(architectureCss,/html\.cdc-v75 \.mobile-nav\{[\s\S]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/);
assert.match(architectureCss,/\.v75-budget-summary/);
assert.match(architectureCss,/\.v75-more-group/);
assert.match(architectureCss,/\.vault-keypad\{display:grid!important;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
assert.match(architectureCss,/prefers-reduced-motion:reduce/);

assert.match(menuCss,/@media\(min-width:821px\)[\s\S]*\.sidebar\{[\s\S]*inset:0 0 0 auto!important/);
assert.match(menuCss,/\.main\{[\s\S]*margin-left:0!important;[\s\S]*margin-right:var\(--sidebar-current\)!important/);
assert.match(menuCss,/\.nav-drawer\{[\s\S]*inset:0 0 0 auto/);
assert.match(menuCss,/safe-area-inset-top/);
assert.match(menuCss,/safe-area-inset-bottom/);

assert.match(events,/function updateAdaptiveNavigation\(\)/);
assert.match(events,/function openMobileDrawer\(\)/);
assert.match(events,/function closeMobileDrawer\(\)/);
assert.match(events,/window\.visualViewport/);
assert.match(events,/keyboard-open/);
assert.match(events,/--visual-vw/);
assert.match(events,/--visual-top/);

for(const id of ['appSidebar','sidebarToggle','mobileMenuBtn','mobileDrawer','drawerNav','mobileNav','vaultPinPad','vaultKeyboardModeToggle','kpiGrid','dashboardSecondary','accountBalance','accountBalanceInfo','billsList','marketList','marketStatusFilter'])assert.match(index,new RegExp(`id="${id}"`),`missing required responsive/application anchor #${id}`);
assert.match(index,/data-pin-key="1"/);
assert.match(events,/function wireVaultPinPad\(\)/);
assert.match(events,/input\.readOnly=pinMode/);
assert.match(events,/input\.setAttribute\('inputmode',pinMode\?'none':'text'\)/);

assert.match(render,/function billTableHtml\(list\)/);
assert.match(render,/class="bill-table"/);
assert.match(render,/class="bill-mobile-list"/);
assert.match(render,/function billDueSignal\(/);
assert.match(render,/data-edit-bill=/);
assert.match(events,/dataset\.editBill/);
assert.match(render,/function marketMetrics\(items\)/);
assert.match(render,/function marketTableHtml\(list\)/);
assert.match(render,/class="market-mobile-list"/);
assert.match(render,/Enquanto faltar o preço real, os relatórios usam o valor estimado/);
assert.match(render,/\['Pago no mês',paidBills,'Pagamentos confirmados'\]/);
assert.match(render,/setHTML\('#dashboardSecondary'/);
assert.match(render,/data-update-balance/);
assert.match(events,/openAccountBalanceForm\(\)/);
assert.doesNotMatch(css,/\bzoom\s*:/i);

assert.match(index,/name="app-build" content="v53"/);
assert.match(index,/styles\.css\?v=53/);
assert.match(index,/design-system\.css\?v=53/);
assert.match(index,/manifest\.webmanifest\?v=53/);
for(const asset of ['core','finance','render','forms','sync','events'])assert.match(index,new RegExp(`${asset}\\.js\\?v=53`));
assert.match(events,/register\('\.\/sw\.js\?v=53',\{updateViaCache:'none'\}\)/);

assert.match(sw,/architecture-consolidation1-retire-v74-runtime1/);
assert.match(sw,/retire-assets1/);
assert.match(sw,/v76-version-alignment1/);
assert.match(sw,/prototype-system1/);
for(const asset of ['./design-system.css','./v76-planning-more.css','./v75-architecture.css','./market-experience.css','./market-experience.js','./v64-runtime.js','./app-update.css','./app-update.js','./mobile-menu-toggle.css','./mobile-menu-toggle.js','./v75-architecture.js'])assert.ok(sw.includes(`'${asset}'`),`${asset} must be available offline`);
for(const retired of ['./v74-experience.css','./v74-experience.js','./v75-market-featured.css','./v75-market-featured.js'])assert.ok(!sw.includes(`'${retired}'`),`${retired} must not be available offline`);
assert.ok(!sw.includes("'./ui-consistency.css'"));
assert.ok(!sw.includes("'./v64-runtime.css'"));
assert.match(sw,/url\.searchParams\.has\('v'\)/);
assert.match(sw,/url\.searchParams\.has\('ts'\)/);

assert.match(prepare,/const BUILD = 'v76'/);
assert.match(prepare,/const APP_UPDATE_REV = '76-version-alignment1'/);
assert.match(prepare,/const ARCHITECTURE_REV = '76-budget-bill-month1'/);
assert.match(prepare,/const PLANNING_MORE_REV = '76-planning-more1'/);
assert.doesNotMatch(prepare,/const EXPERIENCE_REV/);
assert.doesNotMatch(prepare,/const FEATURED_REV/);

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const builtIndex=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(builtIndex,/name="app-build" content="v76"/);
  assert.match(builtIndex,/design-system\.css\?v=76/);
  assert.match(builtIndex,/v75-architecture\.css\?v=76-budget-bill-month1/);
  assert.match(builtIndex,/v76-planning-more\.css\?v=76-planning-more1/);
  assert.match(builtIndex,/v75-architecture\.js\?v=76-budget-bill-month1/);
  assert.match(builtIndex,/mobile-menu-toggle\.css\?v=73-menu8/);
  assert.doesNotMatch(builtIndex,/v74-experience\.(?:css|js)/);
  assert.doesNotMatch(builtIndex,/v75-market-featured\.(?:css|js)/);
  assert.doesNotMatch(builtIndex,/ui-consistency\.css/);
  assert.doesNotMatch(builtIndex,/v64-runtime\.css/);
  for(const asset of ['design-system.css','v76-planning-more.css','v75-architecture.css','v75-architecture.js'])assert.ok(fs.existsSync(path.join(dist,asset)),`${asset} must exist in dist`);
  for(const retired of ['v74-experience.css','v74-experience.js','v75-market-featured.css','v75-market-featured.js'])assert.ok(!fs.existsSync(path.join(dist,retired)),`${retired} must not exist in dist`);
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Responsive official v76 build, truthful Planning state, safe areas and five-destination navigation remain intact: OK');

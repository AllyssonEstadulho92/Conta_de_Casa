'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const legacyCss=read('styles.css');
const designCss=read('design-system.css');
const experienceCss=read('v74-experience.css');
const architectureCss=read('v75-architecture.css');
const menuCss=read('mobile-menu-toggle.css');
const css=`${legacyCss}\n${designCss}\n${experienceCss}\n${architectureCss}\n${menuCss}`;
const events=read('events.js');
const index=read('index.html');
const render=read('render.js');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');

/* Shell and canonical breakpoints remain in the v74 consolidated base. */
assert.match(designCss,/Conta de Casa v74 — sistema visual consolidado/);
assert.match(designCss,/--content-max:1480px/);
assert.match(designCss,/--sidebar-expanded:232px/);
assert.match(designCss,/--sidebar-rail:72px/);
assert.match(designCss,/html\.sidebar-collapsed\{--sidebar-current:var\(--sidebar-rail\)\}/);
assert.match(designCss,/@media\(max-width:820px\)/);
assert.match(designCss,/@media\(max-width:359px\)/);
assert.match(designCss,/--mobile-top-safe:max\(20px,calc\(env\(safe-area-inset-top,0px\) \+ 8px\)\)/,'base must keep a touch-safe iPhone top inset');
assert.match(designCss,/--header-height:calc\(108px \+ var\(--mobile-top-safe\)\)/);
assert.match(designCss,/html\.app-active \.topbar,[\s\S]*position:fixed!important/,'mobile shell base must retain its historical fixed-topbar contract before the v76 final geometry layer');
assert.match(designCss,/html\.app-active \.main\{padding-top:var\(--header-height\)!important/,'base content must compensate the historical fixed topbar');
assert.match(designCss,/\.mobile-menu-btn\{width:44px!important;[\s\S]*height:44px!important/,'menu target must remain at least 44px');
assert.match(designCss,/\.mobile-nav\{grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/,'base bottom navigation must reserve five destinations');
assert.match(designCss,/\.mobile-nav \.nav-btn\.active::before\{background:var\(--primary\)!important\}/,'there must be one canonical active indicator');
assert.match(designCss,/prefers-reduced-motion:reduce/);

/* v74 prototype remains the composition base. */
assert.match(experienceCss,/Conta de Casa v74 — composição visual do protótipo móvel/);
assert.match(experienceCss,/@media\(max-width:820px\)/);
assert.match(experienceCss,/--cdc-prototype-header:#003b48/);
assert.match(experienceCss,/--cdc-screen:#f2f5f6/);
assert.match(experienceCss,/html\.app-active \.main\{padding-top:var\(--header-height\)!important;[\s\S]*padding-bottom:calc\(var\(--mobile-nav-height\) \+ env\(safe-area-inset-bottom,0px\) \+ 24px\)!important/);
assert.match(experienceCss,/html\.app-active \.topbar,\.topbar\{[\s\S]*left:0!important;[\s\S]*right:0!important;[\s\S]*width:100%!important/);
assert.match(experienceCss,/\.cdc-quick-actions\{display:grid!important;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
for(const marker of ['.cdc-mobile-greeting','.cdc-mobile-month','.cdc-expense-feed','.cdc-market-home','.cdc-planning-overview','.cdc-report-summary','.cdc-more-menu'])assert.ok(experienceCss.includes(marker));

/* v75 explicitly repairs the hidden Mercado destination and theme consistency. */
assert.match(legacyCss,/\.mobile-nav \.nav-btn:nth-child\(3\)\{visibility:hidden\}/,'legacy hidden third destination is the regression being repaired');
assert.match(architectureCss,/Conta de Casa v75/);
assert.match(architectureCss,/html\.cdc-v75 \.mobile-nav \.nav-btn,html\.cdc-v75 \.mobile-nav \.nav-btn:nth-child\(3\)\{visibility:visible!important;display:grid!important/,'Mercado must be visible');
assert.match(architectureCss,/html\.cdc-v75 \.mobile-nav\{[\s\S]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/);
assert.match(architectureCss,/\.v75-budget-summary/);
assert.match(architectureCss,/\.v75-more-group/);
assert.match(architectureCss,/\.vault-keypad\{display:grid!important;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
assert.match(architectureCss,/prefers-reduced-motion:reduce/);

/* Right-side navigation controller from v73 remains valid. */
assert.match(menuCss,/@media\(min-width:821px\)[\s\S]*\.sidebar\{[\s\S]*inset:0 0 0 auto!important/);
assert.match(menuCss,/\.main\{[\s\S]*margin-left:0!important;[\s\S]*margin-right:var\(--sidebar-current\)!important/);
assert.match(menuCss,/\.nav-drawer\{[\s\S]*inset:0 0 0 auto/);
assert.match(menuCss,/safe-area-inset-top/);
assert.match(menuCss,/safe-area-inset-bottom/);

/* Adaptive events and keyboard remain in the existing functional controller. */
assert.match(events,/function updateAdaptiveNavigation\(\)/);
assert.match(events,/function openMobileDrawer\(\)/);
assert.match(events,/function closeMobileDrawer\(\)/);
assert.match(events,/window\.visualViewport/);
assert.match(events,/keyboard-open/);
assert.match(events,/--visual-vw/);
assert.match(events,/--visual-top/);

/* DOM anchors and accessibility foundations must survive the redesign. */
for(const id of ['appSidebar','sidebarToggle','mobileMenuBtn','mobileDrawer','drawerNav','mobileNav','vaultPinPad','vaultKeyboardModeToggle','kpiGrid','dashboardSecondary','accountBalance','accountBalanceInfo','billsList','marketList','marketStatusFilter']){
  assert.match(index,new RegExp(`id="${id}"`),`missing required responsive/application anchor #${id}`);
}
assert.match(index,/data-pin-key="1"/);
assert.match(events,/function wireVaultPinPad\(\)/);
assert.match(events,/input\.readOnly=pinMode/);
assert.match(events,/input\.setAttribute\('inputmode',pinMode\?'none':'text'\)/);

/* Desktop/mobile lists continue to share the same data and handlers. */
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

assert.doesNotMatch(css,/\bzoom\s*:/i,'do not reintroduce CSS zoom as a responsive workaround');

/* Source HTML remains stable; Pages stamps the v76 release. */
assert.match(index,/name="app-build" content="v53"/);
assert.match(index,/styles\.css\?v=53/);
assert.match(index,/design-system\.css\?v=53/);
assert.match(index,/manifest\.webmanifest\?v=53/);
for(const asset of ['core','finance','render','forms','sync','events'])assert.match(index,new RegExp(`${asset}\\.js\\?v=53`));
assert.match(events,/register\('\.\/sw\.js\?v=53',\{updateViaCache:'none'\}\)/);

assert.match(sw,/conta-de-casa-public-v76-release1-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2/);
for(const asset of ['./design-system.css','./v74-experience.css','./v75-architecture.css','./market-experience.css','./market-experience.js','./v64-runtime.js','./app-update.css','./app-update.js','./mobile-menu-toggle.css','./mobile-menu-toggle.js','./v75-architecture.js'])assert.ok(sw.includes(`'${asset}'`),`${asset} must be available offline`);
assert.ok(!sw.includes("'./ui-consistency.css'"));
assert.ok(!sw.includes("'./v64-runtime.css'"));
assert.match(sw,/url\.searchParams\.has\('v'\)/);
assert.match(sw,/url\.searchParams\.has\('ts'\)/);

assert.match(prepare,/const BUILD = 'v76'/);
assert.match(prepare,/const EXPERIENCE_REV = '74-experience2'/);
assert.match(prepare,/const ARCHITECTURE_REV = '75-architecture2'/);

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const builtIndex=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(builtIndex,/name="app-build" content="v76"/);
  assert.match(builtIndex,/design-system\.css\?v=76/);
  assert.match(builtIndex,/v74-experience\.css\?v=74-experience2/);
  assert.match(builtIndex,/v74-experience\.js\?v=74-experience2/);
  assert.match(builtIndex,/v75-architecture\.css\?v=75-architecture2/);
  assert.match(builtIndex,/v75-architecture\.js\?v=75-architecture2/);
  assert.match(builtIndex,/mobile-menu-toggle\.css\?v=73-menu8/);
  assert.doesNotMatch(builtIndex,/ui-consistency\.css/);
  assert.doesNotMatch(builtIndex,/v64-runtime\.css/);
  assert.ok(fs.existsSync(path.join(dist,'design-system.css')));
  assert.ok(fs.existsSync(path.join(dist,'v74-experience.css')));
  assert.ok(fs.existsSync(path.join(dist,'v74-experience.js')));
  assert.ok(fs.existsSync(path.join(dist,'v75-architecture.css')));
  assert.ok(fs.existsSync(path.join(dist,'v75-architecture.js')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Responsive v76 release preserves v75 architecture, safe areas, five-destination navigation and Pages freshness: OK');

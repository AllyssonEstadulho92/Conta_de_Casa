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
const menuCss=read('mobile-menu-toggle.css');
const css=`${legacyCss}\n${designCss}\n${experienceCss}\n${menuCss}`;
const events=read('events.js');
const index=read('index.html');
const render=read('render.js');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');

/* Shell e breakpoints canónicos da v74. */
assert.match(designCss,/Conta de Casa v74 — sistema visual consolidado/);
assert.match(designCss,/--content-max:1480px/);
assert.match(designCss,/--sidebar-expanded:232px/);
assert.match(designCss,/--sidebar-rail:72px/);
assert.match(designCss,/html\.sidebar-collapsed\{--sidebar-current:var\(--sidebar-rail\)\}/);
assert.match(designCss,/@media\(max-width:820px\)/);
assert.match(designCss,/@media\(max-width:359px\)/);
assert.match(designCss,/--mobile-top-safe:max\(20px,calc\(env\(safe-area-inset-top,0px\) \+ 8px\)\)/,'v74 must keep a touch-safe iPhone top inset');
assert.match(designCss,/--header-height:calc\(108px \+ var\(--mobile-top-safe\)\)/);
assert.match(designCss,/html\.app-active \.topbar,[\s\S]*position:fixed!important/,'base v74 mobile shell must retain a fixed topbar');
assert.match(designCss,/html\.app-active \.main\{padding-top:var\(--header-height\)!important/,'content must compensate the fixed topbar');
assert.match(designCss,/\.mobile-menu-btn\{width:44px!important;[\s\S]*height:44px!important/,'menu target must remain at least 44px');
assert.match(designCss,/\.mobile-nav\{grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/,'v74 bottom navigation must reserve five prototype destinations');
assert.match(designCss,/\.mobile-nav \.nav-btn\.active::before\{background:var\(--primary\)!important\}/,'there must be one canonical active indicator');
assert.match(designCss,/prefers-reduced-motion:reduce/);

/* A camada do protótipo refina a geometria sem tocar no núcleo. */
assert.match(experienceCss,/Conta de Casa v74 — composição visual do protótipo móvel/);
assert.match(experienceCss,/@media\(max-width:820px\)/);
assert.match(experienceCss,/--cdc-prototype-header:#003b48/);
assert.match(experienceCss,/--cdc-screen:#f2f5f6/);
assert.match(experienceCss,/html\.app-active \.main\{padding-top:var\(--header-height\)!important;[\s\S]*padding-bottom:calc\(var\(--mobile-nav-height\) \+ env\(safe-area-inset-bottom,0px\) \+ 24px\)!important/);
assert.match(experienceCss,/html\.app-active \.topbar,\.topbar\{[\s\S]*left:0!important;[\s\S]*right:0!important;[\s\S]*width:100%!important/);
assert.match(experienceCss,/\.cdc-quick-actions\{display:grid!important;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
assert.match(experienceCss,/\.cdc-mobile-greeting\{display:flex/);
assert.match(experienceCss,/\.cdc-mobile-month\{display:grid/);
assert.match(experienceCss,/\.cdc-expense-feed/);
assert.match(experienceCss,/\.cdc-market-home/);
assert.match(experienceCss,/\.cdc-planning-overview/);
assert.match(experienceCss,/\.cdc-report-summary/);
assert.match(experienceCss,/\.cdc-more-menu/);

/* Navegação lateral à direita da v73 permanece válida dentro da v74. */
assert.match(menuCss,/@media\(min-width:821px\)[\s\S]*\.sidebar\{[\s\S]*inset:0 0 0 auto!important/);
assert.match(menuCss,/\.main\{[\s\S]*margin-left:0!important;[\s\S]*margin-right:var\(--sidebar-current\)!important/);
assert.match(menuCss,/\.nav-drawer\{[\s\S]*inset:0 0 0 auto/);
assert.match(menuCss,/safe-area-inset-top/);
assert.match(menuCss,/safe-area-inset-bottom/);

/* Eventos adaptativos e teclado continuam no controlador funcional existente. */
assert.match(events,/function updateAdaptiveNavigation\(\)/);
assert.match(events,/function openMobileDrawer\(\)/);
assert.match(events,/function closeMobileDrawer\(\)/);
assert.match(events,/window\.visualViewport/);
assert.match(events,/keyboard-open/);
assert.match(events,/--visual-vw/);
assert.match(events,/--visual-top/);

/* Estrutura DOM e acessibilidade base não podem desaparecer durante o redesign. */
for(const id of ['appSidebar','sidebarToggle','mobileMenuBtn','mobileDrawer','drawerNav','mobileNav','vaultPinPad','vaultKeyboardModeToggle','kpiGrid','dashboardSecondary','accountBalance','accountBalanceInfo','billsList','marketList','marketStatusFilter']){
  assert.match(index,new RegExp(`id="${id}"`),`missing required responsive/application anchor #${id}`);
}
assert.match(index,/data-pin-key="1"/);
assert.match(events,/function wireVaultPinPad\(\)/);
assert.match(events,/input\.readOnly=pinMode/);
assert.match(events,/input\.setAttribute\('inputmode',pinMode\?'none':'text'\)/);

/* Listas desktop/mobile continuam a partilhar os mesmos dados e handlers. */
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

/* Não reintroduzir zoom CSS como remendo de responsividade. */
assert.doesNotMatch(css,/\bzoom\s*:/i);

/* O HTML fonte mantém a revisão estável; a distribuição é carimbada como v74. */
assert.match(index,/name="app-build" content="v53"/);
assert.match(index,/styles\.css\?v=53/);
assert.match(index,/design-system\.css\?v=53/);
assert.match(index,/manifest\.webmanifest\?v=53/);
for(const asset of ['core','finance','render','forms','sync','events'])assert.match(index,new RegExp(`${asset}\\.js\\?v=53`));
assert.match(events,/register\('\.\/sw\.js\?v=53',\{updateViaCache:'none'\}\)/);

assert.match(sw,/conta-de-casa-public-v74-ui1-v74-shopping2-v73-menu8-v74-experience2/);
for(const asset of ['./design-system.css','./v74-experience.css','./market-experience.css','./market-experience.js','./v64-runtime.js','./app-update.css','./app-update.js','./mobile-menu-toggle.css','./mobile-menu-toggle.js']){
  assert.ok(sw.includes(`'${asset}'`),`${asset} must be available offline`);
}
assert.ok(!sw.includes("'./ui-consistency.css'"),'obsolete visual consistency CSS must not be cached');
assert.ok(!sw.includes("'./v64-runtime.css'"),'obsolete v64 shell CSS must not be cached');
assert.match(sw,/url\.searchParams\.has\('v'\)/);
assert.match(sw,/url\.searchParams\.has\('ts'\)/);

assert.match(prepare,/const BUILD = 'v74'/);
assert.match(prepare,/const EXPERIENCE_REV = '74-experience2'/);

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const builtIndex=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(builtIndex,/name="app-build" content="v74"/);
  assert.match(builtIndex,/design-system\.css\?v=74/);
  assert.match(builtIndex,/v74-experience\.css\?v=74-experience2/);
  assert.match(builtIndex,/v74-experience\.js\?v=74-experience2/);
  assert.match(builtIndex,/mobile-menu-toggle\.css\?v=73-menu8/);
  assert.doesNotMatch(builtIndex,/ui-consistency\.css/);
  assert.doesNotMatch(builtIndex,/v64-runtime\.css/);
  assert.ok(fs.existsSync(path.join(dist,'design-system.css')));
  assert.ok(fs.existsSync(path.join(dist,'v74-experience.css')));
  assert.ok(fs.existsSync(path.join(dist,'v74-experience.js')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Responsive v74 prototype shell, safe areas, five-destination mobile navigation and Pages freshness tests: OK');

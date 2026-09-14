const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const js = fs.readFileSync('mobile-menu-toggle.js','utf8');
const css = fs.readFileSync('mobile-menu-toggle.css','utf8');
const icons = fs.readFileSync('ui-icons.js','utf8');
const architecture = fs.readFileSync('v75-architecture.js','utf8');
const index = fs.readFileSync('index.html','utf8');
const prepare = fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const sw = fs.readFileSync('sw.js','utf8');
const manifest = JSON.parse(fs.readFileSync('release-manifest.json','utf8'));

assert.doesNotThrow(()=>new vm.Script(js), 'mobile menu runtime must parse');
assert.match(js,/Conta de Casa v76/);
assert.match(js,/const button=document\.querySelector\('#mobileMenuBtn'\)/);
assert.match(js,/const closeButton=document\.querySelector\('#drawerCloseBtn'\)/);
assert.match(js,/closeButton\.hidden=false/,'drawer close control must be explicitly visible');
assert.match(js,/closeButton\.tabIndex=0/,'drawer close control must remain keyboard reachable');
assert.match(js,/closeButton\.removeAttribute\('aria-hidden'\)/);
assert.match(js,/drawer-close-glyph/);
assert.match(js,/button\.replaceChildren\(glyph,iconSentinel\)/);
assert.doesNotMatch(js,/insertBefore\(button,drawerHead\.firstChild\)/,'the global trigger must never be moved into the dialog');
assert.doesNotMatch(js,/mobile-menu-home-placeholder/,'the stable controller no longer needs a placeholder for a moved trigger');
assert.match(js,/drawer\.showModal\(\)/);
assert.match(js,/drawer\.close=animatedDrawerClose/);
assert.match(js,/closeButton\.addEventListener\('click',[\s\S]*closeDrawer/);
assert.match(js,/drawer\.addEventListener\('cancel'/);
assert.match(js,/drawer\.addEventListener\('close',[\s\S]*focusTrigger/);
assert.match(js,/setAttribute\('aria-expanded',String\(expanded\)\)/);
assert.match(js,/button\.dataset\.menuState=state/);
assert.match(js,/drawer\.dataset\.menuState=state/);
assert.match(js,/closeButton\.dataset\.menuState=state/);

/* O header continua a ser único para todas as rotas. */
assert.equal((index.match(/id="mobileMenuBtn"/g)||[]).length,1,'there must be exactly one global mobile menu button');
assert.equal((index.match(/id="drawerCloseBtn"/g)||[]).length,1,'there must be exactly one drawer close control');
assert.ok(index.indexOf('id="mobileMenuBtn"')<index.indexOf('id="page-dashboard"'),'global trigger must remain in the shared header');
for(const page of ['page-dashboard','page-bills','page-calendar','page-market','page-planning','page-reports','page-goals','page-security','page-diagnostics','page-settings']){
  assert.ok(index.includes(`id="${page}"`),`${page} must remain under the shared shell`);
}
assert.match(index,/<header class="topbar">[\s\S]*id="mobileMenuBtn"[\s\S]*id="pageTitle"[\s\S]*<\/header>/);
assert.match(index,/<div class="drawer-head">[\s\S]*id="drawerCloseBtn"/);

assert.match(icons,/fillIcon\(document\.querySelector\('#mobileMenuBtn'\),'menu',22\)/);
assert.match(js,/mobile-menu-icon-sentinel/);
assert.match(js,/button\.dataset\.uiIconSlot='menu'/);

/* Swipe continua disponível e isolado do domínio. */
assert.match(js,/const swipeEdgeWidth=30/);
assert.match(js,/touch\.clientX>=root\.innerWidth-swipeEdgeWidth/);
assert.match(js,/gesture\.mode==='opening'&&dx>=0/);
assert.match(js,/gesture\.mode==='closing'&&dx<=0/);
assert.match(js,/velocity<=-swipeFlingVelocity/);
assert.match(js,/velocity>=swipeFlingVelocity/);
assert.match(js,/setDragVisual\(offset,progress\)/);
assert.match(js,/document\.addEventListener\('touchmove',onTouchMove,\{capture:true,passive:false\}\)/);
assert.doesNotMatch(js,/commit\(|saveState\(|estimatedCents|actualCents/,'navigation controller must not mutate financial state');

assert.match(css,/Conta de Casa v76/);
assert.match(css,/v76 menu-morph1/);
assert.match(css,/76-menu-visible-close1/);
assert.match(css,/\.mobile-menu-glyph::before,[\s\S]*\.mobile-menu-glyph::after/);
assert.match(css,/\.drawer-close-glyph::before[\s\S]*rotate\(45deg\)/);
assert.match(css,/\.drawer-close-glyph::after[\s\S]*rotate\(-45deg\)/);
assert.match(css,/cubic-bezier\(\.22,1,\.36,1\)/);
assert.match(css,/html\.cdc-v75\.app-active \.nav-drawer\[open\] \.drawer-head>#drawerCloseBtn\.icon-btn\.drawer-close-control\{[\s\S]*display:inline-grid!important[\s\S]*visibility:visible!important[\s\S]*opacity:1!important[\s\S]*pointer-events:auto!important/,'open drawer must force a visible interactive close control');
assert.match(css,/background:var\(--v76-surface,#fff\)!important/,'close control must keep contrast even over historical teal drawers');
assert.match(css,/\.nav-drawer\{[\s\S]*inset:0 0 0 auto/);
assert.match(css,/transform:translate3d\(calc\(100% \+ 8px\),0,0\)/);
assert.match(css,/\.nav-drawer-shell\{[\s\S]*safe-area-inset-top[\s\S]*safe-area-inset-bottom/);
assert.match(css,/\.drawer-nav \.nav-btn\{[\s\S]*min-height:48px/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)[\s\S]*\.drawer-close-glyph::before[\s\S]*\.drawer-close-glyph::after[\s\S]*transition:none!important/);
assert.doesNotMatch(css,/\.drawer-head>#drawerCloseBtn\{display:none!important\}/,'final menu CSS must never hide the only close control');

assert.match(prepare,/const BUILD = 'v76'/);
assert.match(prepare,/const MENU_REV = '73-menu8'/);
assert.match(sw,/v73-menu8/);
assert.match(sw,/menu-morph1/);
assert.match(sw,/menu-visible-close1/,'service worker cache must refresh the fixed mobile menu controller');
assert.ok(sw.includes("'./mobile-menu-toggle.css'"));
assert.ok(sw.includes("'./mobile-menu-toggle.js'"));
assert.match(architecture,/DRAWER_GROUPS/);
assert.doesNotMatch(architecture,/showModal\(|drawer\.close=|touchmove/,'v75 architecture must not duplicate the menu controller');
assert.equal(manifest.latestVersion,'v76');

console.log('v76 mobile menu keeps the global trigger stable and always exposes a visible X inside the open drawer: OK');

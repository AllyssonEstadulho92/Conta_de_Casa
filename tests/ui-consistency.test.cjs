'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const css=read('ui-consistency.css');
const runtimeCss=read('v64-runtime.css');
const shoppingCss=read('market-shopping-focus.css');
const menuCss=read('mobile-menu-toggle.css');
const menuJs=read('mobile-menu-toggle.js');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');

assert.match(css,/Conta de Casa v64/);
assert.match(css,/--cdc-font-family:Inter/,'visual system must expose the canonical font stack');
assert.match(css,/--cdc-font-regular:400/);
assert.match(css,/--cdc-font-medium:500/);
assert.match(css,/--cdc-font-semibold:600/);
assert.match(css,/--cdc-text-xs:12px/,'visible secondary text floor must be 12px');
assert.match(css,/--cdc-title-page:24px/);
assert.match(css,/\.ui-icon-svg,\.svg-icon\{[\s\S]*stroke-width:2!important/,'all application SVG icons must share the Lucide stroke metric');
assert.match(css,/\.mobile-nav \.nav-btn\.active::after,[\s\S]*content:none!important/,'legacy second mobile-nav indicator must be disabled');
assert.match(css,/\.mobile-nav \.nav-btn\.active::before\{background:var\(--primary\)!important\}/,'mobile navigation must have a single active indicator');
assert.match(css,/--cdc-nav-indicator-width:42px/);
assert.match(css,/#page-market \.market-summary-item\{[\s\S]*inset 0 3px 0 var\(--market-summary-accent\)/,'market summary accent must be a continuous inset instead of a pseudo-element stripe');
assert.match(css,/#page-market \.market-summary-item::before\{[\s\S]*position:static!important/,'market summary pseudo-element must be reserved for the semantic icon');
assert.match(css,/background-size:22px 22px!important/);
assert.match(css,/prefers-reduced-motion:reduce/);

assert.match(runtimeCss,/Conta de Casa v64/);
assert.match(runtimeCss,/v66 acrescenta consistência cromática/);
assert.match(runtimeCss,/--mobile-top-safe:max\(20px,calc\(env\(safe-area-inset-top,0px\) \+ 8px\)\)/,'mobile header must retain an explicit touch-safe gap above the controls');
assert.match(runtimeCss,/--mobile-shell-bg:#f5f7fa/,'v66 must define the canonical light mobile shell colour');
assert.match(runtimeCss,/html\[data-theme="dark"\][\s\S]*--mobile-shell-bg:#0f1722/,'v66 must define the canonical dark mobile shell colour');
assert.match(runtimeCss,/\.status-chip\.draft/);
assert.match(runtimeCss,/\.bill-draft-card/);
assert.match(runtimeCss,/html\.market-prototype-active \.page-heading h1::before\{[\s\S]*content:none!important/,'market-specific cart decoration must not alter the global mobile header');
assert.match(runtimeCss,/html\.market-prototype-active \.sync-header-status::after\{[\s\S]*content:none!important/,'market-specific Sync chevron must be disabled');
assert.match(shoppingCss,/Conta de Casa v65/);
assert.match(shoppingCss,/#page-market/,'v65 shopping focus must remain scoped to the market page');
assert.match(menuCss,/Conta de Casa v72/);
assert.match(menuCss,/\.mobile-menu-btn\[aria-expanded="true"\]/,'v72 menu visual state must remain driven by the accessible expanded state');
assert.match(menuCss,/data-menu-state="open"/,'v72 menu must retain an observable state fallback');
assert.match(menuCss,/\.mobile-menu-icon-sentinel\{display:none!important\}/,'Lucide compatibility sentinel must never be visible');
assert.match(menuCss,/\.mobile-menu-home-placeholder\{[\s\S]*visibility:hidden/,'v72 must preserve topbar geometry while the control is inside the drawer');
assert.match(menuJs,/button\.dataset\.uiIconSlot='menu'/,'animated button must keep the Lucide hydration slot stable');
assert.match(menuJs,/line\.animate\(frames/,'explicit line keyframes must keep hamburger/X motion visible');
assert.match(menuJs,/drawer\.close=animatedDrawerClose/,'v72 must preserve the dialog during the off-canvas exit transition');
assert.match(menuJs,/showDrawerClosedSurface/,'v72 must stage the modal before switching visual state');
assert.match(menuJs,/prefersReducedMotion/,'v72 JS motion must respect reduced-motion preference');
assert.match(menuCss,/translate3d\(calc\(-100% - 8px\),0,0\)/,'v72 drawer must begin fully off-canvas');
assert.match(menuCss,/\.nav-drawer\.open::backdrop/,'v72 backdrop must fade with the drawer');
assert.match(menuCss,/\.nav-drawer\{[\s\S]*width:min\(364px,calc\(100vw - 24px\)\)/,'v72 drawer must preserve bounded responsive sizing');
assert.match(menuCss,/\.drawer-nav \.nav-btn\{[\s\S]*min-height:48px/,'v72 drawer navigation must preserve touch target quality');

assert.match(sw,/conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v72-menu7/);
assert.ok(sw.includes("'./ui-consistency.css'"));
assert.ok(sw.includes("'./v64-runtime.css'"));
assert.ok(sw.includes("'./market-shopping-focus.css'"));
assert.ok(sw.includes("'./mobile-menu-toggle.css'"));
assert.match(prepare,/const BUILD = 'v72'/);
assert.match(prepare,/const VISUAL_REV = '64-ui1'/);
assert.match(prepare,/const RUNTIME_REV = '64-runtime1'/);
assert.match(prepare,/const SHOPPING_REV = '65-shopping1'/);
assert.match(prepare,/const SHELL_REV = '66-shell1'/);
assert.match(prepare,/const MENU_REV = '72-menu7'/);
assert.ok(prepare.includes("'ui-consistency.css'"));
assert.ok(prepare.includes("'v64-runtime.css'"));
assert.ok(prepare.includes("'market-shopping-focus.css'"));
assert.ok(prepare.includes("'mobile-menu-toggle.css'"));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/ui-consistency\.css\?v=64-ui1/);
  assert.match(index,/v64-runtime\.css\?v=66-shell1/);
  assert.match(index,/market-shopping-focus\.css\?v=65-shopping1/);
  assert.match(index,/mobile-menu-toggle\.css\?v=72-menu7/);
  assert.match(index,/<meta name="theme-color" content="#f5f7fa"/,'public HTML theme-color must match the v66 light shell');
  assert.ok(index.indexOf('market-category-groups.css')<index.indexOf('ui-consistency.css'),'visual consistency CSS must load after market/category layers');
  assert.ok(index.indexOf('ui-consistency.css')<index.indexOf('v64-runtime.css'),'v66 shell correction must follow prior visual normalization');
  assert.ok(index.indexOf('v64-runtime.css')<index.indexOf('market-shopping-focus.css'),'v65 shopping focus may override only market-page presentation after the global shell layer');
  assert.ok(index.indexOf('market-shopping-focus.css')<index.indexOf('mobile-menu-toggle.css'),'v72 global menu styling must remain the final mobile-menu layer');
  assert.ok(fs.existsSync(path.join(dist,'ui-consistency.css')));
  assert.ok(fs.existsSync(path.join(dist,'v64-runtime.css')));
  assert.ok(fs.existsSync(path.join(dist,'market-shopping-focus.css')));
  assert.ok(fs.existsSync(path.join(dist,'mobile-menu-toggle.css')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Authoritative typography, Lucide, navigation, v66 shell, v65 market focus and v72 stable mobile menu consistency expectations: OK');
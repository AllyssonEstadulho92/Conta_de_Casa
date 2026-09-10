const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const ts = fs.readFileSync('src/ui/veggie-menu-toggle.ts','utf8');
const js = fs.readFileSync('v76-veggie-menu.js','utf8');
const css = fs.readFileSync('v76-veggie-menu.css','utf8');
const legacy = fs.readFileSync('mobile-menu-toggle.js','utf8');
const prepare = fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const sw = fs.readFileSync('sw.js','utf8');

assert.doesNotThrow(()=>new vm.Script(js), 'compiled Veggie Burger runtime must parse');

assert.match(ts,/Veggie Burger em TypeScript/);
assert.match(ts,/querySelector<HTMLButtonElement>\('#mobileMenuBtn'\)/);
assert.match(ts,/querySelector<HTMLDialogElement>\('#mobileDrawer'\)/);
assert.match(ts,/upperLine\.className = 'veggie-menu-line veggie-menu-line-upper'/);
assert.match(ts,/lowerLine\.className = 'veggie-menu-line veggie-menu-line-lower'/);
assert.match(ts,/glyph\.append\(upperLine, lowerLine\)/);
assert.doesNotMatch(ts,/glyph\.append\([^\n]*,[^\n]*,[^\n]*\)/,'Veggie Burger must use exactly two visual bars');

assert.match(js,/veggie-menu-toggle/);
assert.match(js,/glyph\.append\(upperLine, lowerLine\)/);
assert.match(js,/drawer\.insertBefore\(button, drawerShell\)/,'same control must live outside the transformed drawer shell while open');
assert.match(js,/drawer-menu-overlay-control/);
assert.match(js,/MutationObserver/);
assert.match(js,/aria-expanded/);
assert.doesNotMatch(js,/commit\(|saveState\(|appState|estimatedCents|actualCents/,'visual toggle must not mutate financial state');

assert.match(css,/\.veggie-menu-line-upper\{[\s\S]*top:4px!important/);
assert.match(css,/\.veggie-menu-line-lower\{[\s\S]*top:12px!important/);
assert.match(css,/rotate\(45deg\)!important/);
assert.match(css,/rotate\(-45deg\)!important/);
assert.match(css,/\.nav-drawer>\.mobile-menu-btn\.drawer-menu-overlay-control\{[\s\S]*position:absolute!important[\s\S]*right:14px!important/);
assert.match(css,/\.nav-drawer\[data-dragging="true"\]>\.mobile-menu-btn\.drawer-menu-overlay-control[\s\S]*visibility:visible!important/);
assert.match(css,/html\.cdc-v75 \.topbar\{[\s\S]*position:sticky!important[\s\S]*top:0!important/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(css,/@media\(forced-colors:active\)/);

assert.match(legacy,/drawerHead\.insertBefore\(button,drawerHead\.firstChild\)/,'validated v73 drawer controller remains present underneath the TS enhancement');
assert.match(prepare,/const VEGGIE_MENU_REV = '76-veggie-menu1'/);
assert.ok(prepare.includes("'v76-veggie-menu.css'"));
assert.ok(prepare.includes("'v76-veggie-menu.js'"));
assert.match(prepare,/mobile-menu-toggle\.js\?v=\$\{MENU_REV\}[\s\S]*v76-veggie-menu\.js\?v=\$\{VEGGIE_MENU_REV\}/,'TypeScript-derived enhancement must load after the validated drawer controller');
assert.match(prepare,/v75-expenses-modern\.css\?v=\$\{EXPENSES_REV\}[\s\S]*v76-veggie-menu\.css\?v=\$\{VEGGIE_MENU_REV\}[\s\S]*v75-market-flow\.css/);

assert.match(sw,/veggie-menu1/);
assert.ok(sw.includes("'./v76-veggie-menu.css'"));
assert.ok(sw.includes("'./v76-veggie-menu.js'"));

console.log('v76 Veggie Burger TypeScript enhancement is isolated, swipe-stable and publishable.');

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const ts = fs.readFileSync('src/ui/veggie-menu-toggle.ts','utf8');
const js = fs.readFileSync('v76-veggie-menu.js','utf8');
const css = fs.readFileSync('v76-veggie-menu.css','utf8');
const modern = fs.readFileSync('v76-modern-ui.css','utf8');
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
assert.match(ts,/function prefersReducedMotion/);
assert.match(ts,/const animateGlyph = \(state: MenuVisualState\)/);
assert.match(ts,/lowerOpen = \{ top: '8px', transform: 'translateX\(-50%\) rotate\(-45deg\)'/);
assert.match(ts,/upperLine\.animate/);
assert.match(ts,/lowerLine\.animate/);

assert.match(js,/veggie-menu-toggle/);
assert.match(js,/glyph\.append\(upperLine, lowerLine\)/);
assert.match(js,/drawer\.insertBefore\(button, drawerShell\)/,'same control must live outside transformed drawer shell while open');
assert.match(js,/drawer-menu-overlay-control/);
assert.match(js,/upperLine\.animate/);
assert.match(js,/lowerLine\.animate/);
assert.match(js,/aria-expanded/);
assert.doesNotMatch(js,/commit\(|saveState\(|appState|estimatedCents|actualCents/,'visual toggle must not mutate financial state');

assert.match(css,/76-veggie-menu2/);
assert.match(css,/\.veggie-menu-line-upper\{top:4px!important\}/);
assert.match(css,/\.veggie-menu-line-lower\{top:12px!important\}/);
assert.match(css,/rotate\(45deg\)!important/);
assert.match(css,/rotate\(-45deg\)!important/);
assert.match(css,/\.nav-drawer>\.mobile-menu-btn\.drawer-menu-overlay-control\{[\s\S]*position:absolute!important[\s\S]*right:14px!important/);
assert.match(css,/\.nav-drawer\[data-dragging="true"\]>\.mobile-menu-btn\.drawer-menu-overlay-control[\s\S]*visibility:visible!important/);
assert.doesNotMatch(css,/\.topbar\{[\s\S]{0,120}position:sticky!important/,'Veggie layer must not force a sticky header');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(css,/@media\(forced-colors:active\)/);

assert.match(modern,/A topbar deixa de ser fixa\/sticky/);
assert.match(modern,/\.topbar,[\s\S]*position:relative!important/);
assert.match(modern,/\.main\{[\s\S]*padding:0!important/);

assert.match(legacy,/drawerHead\.insertBefore\(button,drawerHead\.firstChild\)/,'validated v73 drawer controller remains present underneath the TS enhancement');
assert.match(prepare,/const VEGGIE_MENU_REV = '76-veggie-menu2'/);
assert.match(prepare,/const MODERN_UI_REV = '76-modern-ui1'/);
assert.ok(prepare.includes("'v76-veggie-menu.css'"));
assert.ok(prepare.includes("'v76-veggie-menu.js'"));
assert.ok(prepare.includes("'v76-modern-ui.css'"));
assert.match(prepare,/mobile-menu-toggle\.js\?v=\$\{MENU_REV\}[\s\S]*v76-veggie-menu\.js\?v=\$\{VEGGIE_MENU_REV\}/,'TypeScript-derived enhancement must load after validated drawer controller');
assert.match(prepare,/v75-usability\.css\?v=\$\{USABILITY_REV\}[\s\S]*v76-modern-ui\.css\?v=\$\{MODERN_UI_REV\}/,'master UI layer must be loaded last among CSS layers');

assert.match(sw,/veggie-menu2-modern-ui1/);
assert.ok(sw.includes("'./v76-veggie-menu.css'"));
assert.ok(sw.includes("'./v76-veggie-menu.js'"));
assert.ok(sw.includes("'./v76-modern-ui.css'"));

console.log('v76 Veggie Burger is two-line, animated, swipe-stable and compatible with the non-fixed master header.');

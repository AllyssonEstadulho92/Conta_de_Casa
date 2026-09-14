const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const legacyController = fs.readFileSync('mobile-menu-toggle.js','utf8');
const legacyCss = fs.readFileSync('mobile-menu-toggle.css','utf8');
const retiredTs = fs.readFileSync('src/ui/veggie-menu-toggle.ts','utf8');
const retiredCss = fs.readFileSync('v76-veggie-menu.css','utf8');
const buildRuntime = fs.readFileSync('scripts/build-typescript-runtime.cjs','utf8');
const prepare = fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const sw = fs.readFileSync('sw.js','utf8');

assert.doesNotThrow(()=>new vm.Script(legacyController),'single mobile-menu controller must parse');
assert.match(legacyController,/installAnimatedMobileMenu/);
assert.match(legacyController,/button\.addEventListener\('click'/);
assert.match(legacyController,/drawer\.close=animatedDrawerClose/);
assert.match(legacyController,/touchmove/);
assert.match(legacyController,/aria-expanded/);
assert.doesNotMatch(legacyController,/commit\(|saveState\(|estimatedCents|actualCents/,'navigation controller must not mutate financial state');

assert.match(legacyCss,/v76 menu-morph1/,'the canonical controller CSS must own the two-line morph');
assert.match(legacyCss,/\.mobile-menu-glyph::before,[\s\S]*\.mobile-menu-glyph::after/);
assert.match(legacyCss,/rotate\(45deg\)/);
assert.match(legacyCss,/rotate\(-45deg\)/);

/* Source retained only as a retirement reference during this staged cleanup. */
assert.match(retiredTs,/Veggie Burger em TypeScript/);
assert.match(retiredCss,/76-veggie-menu2/);

assert.doesNotMatch(buildRuntime,/source:'src\/ui\/veggie-menu-toggle\.ts'/,'retired visual observer must not be generated');
assert.doesNotMatch(buildRuntime,/output:'v76-veggie-menu\.js'/,'retired visual observer must not produce browser runtime');

assert.doesNotMatch(prepare,/const VEGGIE_MENU_REV/);
assert.doesNotMatch(prepare,/GENERATED_PUBLIC_FILES[\s\S]{0,260}v76-veggie-menu\.js/);
assert.doesNotMatch(prepare,/PUBLIC_FILES[\s\S]{0,1600}'v76-veggie-menu\.css'/);
assert.doesNotMatch(prepare,/PUBLIC_FILES[\s\S]{0,2200}'v76-veggie-menu\.js'/);
assert.doesNotMatch(prepare,/v76-veggie-menu\.css\?v=/);
assert.doesNotMatch(prepare,/v76-veggie-menu\.js\?v=/);
assert.match(prepare,/forbidden=\[[^\]]*v76-veggie-menu\.js[^\]]*v76-veggie-menu\.css/,'retired duplicate menu assets must be forbidden from dist');

assert.match(sw,/single-menu-authority1/);
assert.ok(!sw.includes("'./v76-veggie-menu.css'"),'duplicate menu CSS must not be cached');
assert.ok(!sw.includes("'./v76-veggie-menu.js'"),'duplicate menu runtime must not be cached');
assert.ok(sw.includes("'./mobile-menu-toggle.css'"));
assert.ok(sw.includes("'./mobile-menu-toggle.js'"));

console.log('v76 mobile navigation has one published controller and no duplicate Veggie runtime authority.');

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const js = fs.readFileSync('mobile-menu-toggle.js','utf8');
const css = fs.readFileSync('mobile-menu-toggle.css','utf8');
const icons = fs.readFileSync('ui-icons.js','utf8');
const prepare = fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const sw = fs.readFileSync('sw.js','utf8');
const manifest = JSON.parse(fs.readFileSync('release-manifest.json','utf8'));

assert.doesNotThrow(()=>new vm.Script(js), 'mobile menu runtime must parse');
assert.match(js, /Conta de Casa v70/);
assert.match(js, /button\.addEventListener\('click',[\s\S]*stopImmediatePropagation\(\)[\s\S]*drawer\.open[\s\S]*closeDrawer\(keyboard\)[\s\S]*openDrawer\(keyboard\)[\s\S]*,true\)/);
assert.match(js, /drawerHead\.insertBefore\(button,drawerHead\.firstChild\)/, 'same menu button must move into the modal drawer');
assert.match(js, /homeAnchor\.parentNode\.insertBefore\(button,homeAnchor\.nextSibling\)/, 'same menu button must return to the topbar');
assert.match(js, /legacyClose\.hidden=true/, 'legacy duplicate X must remain visually removed until historical wiring is retired');
assert.match(js, /expanded\?'Fechar menu':'Abrir menu'/, 'accessible label must follow open state');
assert.match(js, /setAttribute\('aria-expanded',String\(expanded\)\)/);
assert.match(js, /button\.dataset\.menuState=state/);
assert.match(js, /drawer\.dataset\.menuState=state/);

// Regression v69 retained: ui-icons.js hydrates #mobileMenuBtn whenever aria-expanded/class mutates.
assert.match(icons, /fillIcon\(document\.querySelector\('#mobileMenuBtn'\),'menu',22\)/, 'Lucide hydrator interaction must stay visible to this regression test');
assert.match(js, /button\.querySelector\(':scope > svg\.ui-icon-svg'\)/);
assert.match(js, /mobile-menu-icon-sentinel/);
assert.match(js, /button\.dataset\.uiIconSlot='menu'/);
assert.match(js, /button\.replaceChildren\(glyph,iconSentinel\)/);
assert.match(js, /glyph\.append\(document\.createElement\('span'\),document\.createElement\('span'\),document\.createElement\('span'\)\)/);

// Regression v70: CSS transitions can be consumed when the same node is reparented into/out of
// the modal dialog. Explicit Web Animations keyframes must make the movement visible after that move.
assert.match(js, /const motionDuration=240/);
assert.match(js, /const motionEase='cubic-bezier\(\.22,\.8,\.2,1\)'/);
assert.match(js, /prefersReducedMotion\(\)/);
assert.match(js, /typeof glyph\.animate!=='function'/, 'Web Animations must degrade safely when unavailable');
assert.match(js, /motionAnimations\.push\(line\.animate\(frames,/,'each hamburger line must receive explicit keyframes');
assert.match(js, /const glyphMotion=glyph\.animate\(/,'the whole glyph must receive a subtle press/motion cue');
assert.match(js, /rotate\(45deg\)/);
assert.match(js, /rotate\(-45deg\)/);
assert.match(js, /scaleX\(\.18\)/);
assert.match(js, /requestAnimationFrame\(\(\)=>animateMenuGlyph\(true\)\)/,'opening motion must run after dialog reparenting');
assert.match(js, /requestAnimationFrame\(\(\)=>animateMenuGlyph\(false\)\)/,'closing motion must run after the button returns to the topbar');
assert.match(js, /button\.dataset\.menuState!=='closed'[\s\S]*cancelMenuMotion\(\)/,'external close paths must not cancel the reverse animation started by the X itself');

assert.match(css, /Conta de Casa v70/);
assert.match(css, /\.mobile-menu-icon-sentinel\{display:none!important\}/);
assert.match(css, /\.mobile-menu-glyph\{[\s\S]*transform-origin:center[\s\S]*will-change:transform/);
assert.match(css, /\.mobile-menu-glyph>span:nth-child\(1\)\{top:1px;width:22px\}/);
assert.match(css, /\.mobile-menu-glyph>span:nth-child\(2\)\{top:8px;width:18px\}/);
assert.match(css, /\.mobile-menu-glyph>span:nth-child\(3\)\{top:15px;width:14px\}/);
assert.match(css, /top \.24s cubic-bezier\(\.22,\.8,\.2,1\)/,'CSS fallback transition must remain perceptible');
assert.match(css, /data-menu-state="open"[\s\S]*rotate\(45deg\)/, 'open data state must produce the X even if another layer touches aria-expanded styling');
assert.match(css, /rotate\(-45deg\)/);
assert.match(css, /scaleX\(\.18\)/, 'middle line must collapse during the transition');
assert.match(css, /width:44px!important;[\s\S]*height:44px!important/);
assert.match(css, /data-focus-origin="pointer"[\s\S]*outline:none!important/, 'pointer/touch focus restoration must not draw the Safari focus frame');
assert.match(css, /\.nav-drawer\{[\s\S]*width:min\(364px,calc\(100vw - 24px\)\)/, 'drawer width must remain fluid and leave backdrop visible');
assert.match(css, /\.nav-drawer-shell\{[\s\S]*safe-area-inset-top[\s\S]*safe-area-inset-bottom/, 'drawer shell must respect device safe areas');
assert.match(css, /\.drawer-nav\{[\s\S]*overflow-y:auto[\s\S]*overflow-x:hidden/, 'drawer navigation must scroll vertically without lateral overflow');
assert.match(css, /\.drawer-nav \.nav-btn\{[\s\S]*min-height:48px/, 'navigation touch targets must be at least 48px in the refined drawer');
assert.match(css, /\.drawer-footer \.icon-text-btn\{[\s\S]*min-height:48px/, 'footer actions must retain adequate touch targets');
assert.match(css, /\.drawer-nav \.nav-btn\.active,[\s\S]*aria-current="page"/, 'selected page must have a synchronized visual state');
assert.match(css, /@media\(hover:hover\) and \(pointer:fine\) and \(max-width:820px\)/, 'mouse hover feedback must only apply to fine pointers');
assert.match(css, /\.mobile-menu-btn:focus-visible/);
assert.match(css, /@media\(max-width:359px\)\{[\s\S]*\.nav-drawer\{width:calc\(100vw - 20px\)\}/, 'very small smartphones must keep a 20px backdrop margin without an unnecessary 300px cap');
assert.doesNotMatch(css, /@media\(max-width:359px\)\{[\s\S]*min-height:46px/, 'small-screen density must not reduce the 48px drawer touch targets');
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
assert.doesNotMatch(css, /background:\s*(?:green|#0f0|#00ff00)/i);

assert.match(prepare, /const BUILD = 'v70'/);
assert.match(prepare, /const MENU_REV = '70-menu4'/);
assert.match(prepare, /'mobile-menu-toggle\.css'/);
assert.match(prepare, /'mobile-menu-toggle\.js'/);
assert.match(prepare, /mobile-menu-toggle\.css\?v=\$\{MENU_REV\}/);
assert.match(prepare, /mobile-menu-toggle\.js\?v=\$\{MENU_REV\}/);
assert.match(sw, /v70-menu4/);
assert.match(sw, /'\.\/mobile-menu-toggle\.css'/);
assert.match(sw, /'\.\/mobile-menu-toggle\.js'/);
assert.equal(manifest.latestVersion,'v70');
assert.equal(manifest.releases[0]?.version,'v70');
assert.ok(manifest.releases[0].items.some(item=>/Web Animations|keyframes|reparent/i.test(item)));
assert.ok(manifest.releases[0].items.some(item=>/X|hambúrguer|movimento|anima/i.test(item)));
assert.ok(manifest.releases[0].items.some(item=>/240|duração|curva/i.test(item)));
assert.ok(manifest.releases[0].items.some(item=>/reduced-motion|movimento reduzido/i.test(item)));
assert.ok(manifest.releases[0].items.some(item=>/não modifica|exclusivamente|não altera/i.test(item)));

console.log('v70 visibly moving hamburger-to-X interaction and responsive drawer tests: OK');
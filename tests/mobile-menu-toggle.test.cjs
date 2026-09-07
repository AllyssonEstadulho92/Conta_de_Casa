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
assert.match(js, /Conta de Casa v71/);
assert.match(js, /button\.addEventListener\('click',[\s\S]*stopImmediatePropagation\(\)[\s\S]*drawer\.open[\s\S]*closeDrawer\(keyboard\)[\s\S]*openDrawer\(keyboard\)[\s\S]*,true\)/);
assert.match(js, /drawerHead\.insertBefore\(button,drawerHead\.firstChild\)/, 'same menu button must move into the modal drawer');
assert.match(js, /homeAnchor\.parentNode\.insertBefore\(button,homeAnchor\.nextSibling\)/, 'same menu button must return to the topbar');
assert.match(js, /legacyClose\.hidden=true/, 'legacy duplicate X must remain visually removed until historical wiring is retired');
assert.match(js, /expanded\?'Fechar menu':'Abrir menu'/, 'accessible label must follow open state');
assert.match(js, /setAttribute\('aria-expanded',String\(expanded\)\)/);
assert.match(js, /button\.dataset\.menuState=state/);
assert.match(js, /drawer\.dataset\.menuState=state/);

// Regression v69 retained: Lucide must not replace the three animated spans.
assert.match(icons, /fillIcon\(document\.querySelector\('#mobileMenuBtn'\),'menu',22\)/, 'Lucide hydrator interaction must stay visible to this regression test');
assert.match(js, /button\.querySelector\(':scope > svg\.ui-icon-svg'\)/);
assert.match(js, /mobile-menu-icon-sentinel/);
assert.match(js, /button\.dataset\.uiIconSlot='menu'/);
assert.match(js, /button\.replaceChildren\(glyph,iconSentinel\)/);
assert.match(js, /glyph\.append\(document\.createElement\('span'\),document\.createElement\('span'\),document\.createElement\('span'\)\)/);

// Regression v70 retained: explicit Web Animations keep hamburger/X movement visible after reparenting.
assert.match(js, /const motionDuration=240/);
assert.match(js, /const motionEase='cubic-bezier\(\.22,\.8,\.2,1\)'/);
assert.match(js, /typeof glyph\.animate!=='function'/);
assert.match(js, /motionAnimations\.push\(line\.animate\(frames,/);
assert.match(js, /const glyphMotion=glyph\.animate\(/);
assert.match(js, /rotate\(45deg\)/);
assert.match(js, /rotate\(-45deg\)/);
assert.match(js, /scaleX\(\.18\)/);
assert.match(js, /requestAnimationFrame\(\(\)=>animateMenuGlyph\(true\)\)/);

// Regression v71: the dialog must stay open until the off-canvas close transition finishes.
assert.match(js, /const drawerCloseFallback=360/);
assert.match(js, /const nativeDrawerClose=drawer\.close\.bind\(drawer\)/);
assert.match(js, /function animatedDrawerClose\(returnValue\)/);
assert.match(js, /drawer\.dataset\.closing='true'/);
assert.match(js, /setButtonState\(false\)[\s\S]*drawer\.classList\.remove\('open'\)[\s\S]*animateMenuGlyph\(false\)/, 'closing must switch the glyph while keeping the same button in the drawer');
assert.match(js, /event\.propertyName==='transform'\)finishDrawerClose\(\)/, 'native dialog close must wait for the panel transform');
assert.match(js, /drawerCloseTimer=root\.setTimeout\(finishDrawerClose,drawerCloseFallback\)/, 'transition must have a safe timeout fallback');
assert.match(js, /drawer\.close=animatedDrawerClose/, 'all existing drawer.close paths must share the smooth closing behavior');
assert.match(js, /if\(returnValue===undefined\)nativeDrawerClose\(\)/);
assert.match(js, /drawer\.addEventListener\('close',[\s\S]*syncButton\(false\)/, 'button must return home only after the dialog really closes');
assert.match(js, /prefersReducedMotion\(\)\|\|!mobile[\s\S]*finishDrawerClose\(\)/, 'reduced motion and desktop must not wait on mobile transitions');

assert.match(css, /Conta de Casa v71/);
assert.match(css, /\.mobile-menu-icon-sentinel\{display:none!important\}/);
assert.match(css, /\.mobile-menu-glyph>span:nth-child\(1\)\{top:1px;width:22px\}/);
assert.match(css, /\.mobile-menu-glyph>span:nth-child\(2\)\{top:8px;width:18px\}/);
assert.match(css, /\.mobile-menu-glyph>span:nth-child\(3\)\{top:15px;width:14px\}/);
assert.match(css, /top \.24s cubic-bezier\(\.22,\.8,\.2,1\)/);
assert.match(css, /data-menu-state="open"[\s\S]*rotate\(45deg\)/);
assert.match(css, /rotate\(-45deg\)/);
assert.match(css, /scaleX\(\.18\)/);
assert.match(css, /width:44px!important;[\s\S]*height:44px!important/);
assert.match(css, /data-focus-origin="pointer"[\s\S]*outline:none!important/);
assert.match(css, /\.nav-drawer\{[\s\S]*width:min\(364px,calc\(100vw - 24px\)/);
assert.match(css, /\.nav-drawer::backdrop\{[\s\S]*background:rgba\(10,18,30,0\)[\s\S]*background-color \.22s ease/, 'backdrop must fade in from transparent');
assert.match(css, /\.nav-drawer\.open::backdrop\{[\s\S]*background:rgba\(10,18,30,\.38\)/, 'open backdrop must remain restrained');
assert.match(css, /transform:translate3d\(calc\(-100% - 8px\),0,0\)/, 'closed drawer shell must be fully off-canvas');
assert.match(css, /\.nav-drawer\.open \.nav-drawer-shell\{[\s\S]*translate3d\(0,0,0\)/, 'open drawer shell must settle at its natural position');
assert.match(css, /transform \.28s cubic-bezier\(\.22,1,\.36,1\)/, 'opening must use a clean decelerating slide');
assert.match(css, /\.nav-drawer\[data-closing="true"\] \.nav-drawer-shell\{[\s\S]*transition-duration:\.24s,\.18s,\.24s/, 'closing must be slightly faster than opening');
assert.match(css, /\.nav-drawer-shell\{[\s\S]*safe-area-inset-top[\s\S]*safe-area-inset-bottom/);
assert.match(css, /\.drawer-nav\{[\s\S]*overflow-y:auto[\s\S]*overflow-x:hidden/);
assert.match(css, /\.drawer-nav \.nav-btn\{[\s\S]*min-height:48px/);
assert.match(css, /\.drawer-footer \.icon-text-btn\{[\s\S]*min-height:48px/);
assert.match(css, /@media\(max-width:359px\)\{[\s\S]*\.nav-drawer\{width:calc\(100vw - 20px\)\}/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)[\s\S]*\.nav-drawer::backdrop[\s\S]*transition:none!important/, 'reduced motion must also disable backdrop motion');
assert.doesNotMatch(css, /background:\s*(?:green|#0f0|#00ff00)/i);

assert.match(prepare, /const BUILD = 'v71'/);
assert.match(prepare, /const MENU_REV = '71-menu5'/);
assert.match(prepare, /'mobile-menu-toggle\.css'/);
assert.match(prepare, /'mobile-menu-toggle\.js'/);
assert.match(prepare, /mobile-menu-toggle\.css\?v=\$\{MENU_REV\}/);
assert.match(prepare, /mobile-menu-toggle\.js\?v=\$\{MENU_REV\}/);
assert.match(sw, /v71-menu5/);
assert.match(sw, /'\.\/mobile-menu-toggle\.css'/);
assert.match(sw, /'\.\/mobile-menu-toggle\.js'/);
assert.equal(manifest.latestVersion,'v71');
assert.equal(manifest.releases[0]?.version,'v71');
assert.ok(manifest.releases[0].items.some(item=>/off-canvas|deslizando|esquerda/i.test(item)));
assert.ok(manifest.releases[0].items.some(item=>/backdrop|fundo|blur/i.test(item)));
assert.ok(manifest.releases[0].items.some(item=>/280|240|dura/i.test(item)));
assert.ok(manifest.releases[0].items.some(item=>/reduced-motion|movimento reduzido/i.test(item)));
assert.ok(manifest.releases[0].items.some(item=>/não modifica|exclusivamente|não altera/i.test(item)));

console.log('v71 smooth off-canvas mobile drawer and animated hamburger/X tests: OK');

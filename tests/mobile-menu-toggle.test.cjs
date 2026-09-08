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
assert.match(js, /Conta de Casa v73/);
assert.match(js, /button\.addEventListener\('click',[\s\S]*stopImmediatePropagation\(\)[\s\S]*drawer\.open[\s\S]*closeDrawer\(keyboard\)[\s\S]*openDrawer\(keyboard\)[\s\S]*,true\)/);
assert.match(js, /drawerHead\.insertBefore\(button,drawerHead\.firstChild\)/, 'same menu button must move into the modal drawer');
assert.match(js, /function ensureHomePlaceholder\(\)/, 'topbar must retain a stable 44px placeholder while the button is inside the drawer');
assert.match(js, /homeAnchor\.parentNode\.insertBefore\(placeholder,homeAnchor\.nextSibling\)/);
assert.match(js, /parent\.insertBefore\(button,reference\)/, 'same menu button must return to the topbar');
assert.match(js, /legacyClose\.hidden=true/, 'legacy duplicate X must remain visually removed until historical wiring is retired');
assert.match(js, /expanded\?'Fechar menu':'Abrir menu'/, 'accessible label must follow open state');
assert.match(js, /setAttribute\('aria-expanded',String\(expanded\)\)/);
assert.match(js, /button\.dataset\.menuState=state/);
assert.match(js, /drawer\.dataset\.menuState=state/);

assert.match(icons, /fillIcon\(document\.querySelector\('#mobileMenuBtn'\),'menu',22\)/, 'Lucide hydrator interaction must stay visible to this regression test');
assert.match(js, /button\.querySelector\(':scope > svg\.ui-icon-svg'\)/);
assert.match(js, /mobile-menu-icon-sentinel/);
assert.match(js, /button\.dataset\.uiIconSlot='menu'/);
assert.match(js, /button\.replaceChildren\(glyph,iconSentinel\)/);
assert.match(js, /glyph\.append\(document\.createElement\('span'\),document\.createElement\('span'\),document\.createElement\('span'\)\)/);

assert.match(js, /const motionDuration=240/);
assert.match(js, /const motionEase='cubic-bezier\(\.32,\.72,0,1\)'/);
assert.match(js, /typeof glyph\.animate!=='function'/);
assert.match(js, /motionAnimations\.push\(line\.animate\(frames,/);
assert.match(js, /const glyphMotion=glyph\.animate\(/);
assert.match(js, /rotate\(45deg\)/);
assert.match(js, /rotate\(-45deg\)/);
assert.match(js, /scaleX\(\.18\)/);
assert.match(js, /animateMenuGlyph\(true\)/);

assert.match(js, /const drawerCloseFallback=360/);
assert.match(js, /const nativeDrawerClose=drawer\.close\.bind\(drawer\)/);
assert.match(js, /function animatedDrawerClose\(returnValue\)/);
assert.match(js, /drawer\.dataset\.closing='true'/);
assert.match(js, /setButtonState\(false\)[\s\S]*drawer\.classList\.remove\('open'\)[\s\S]*animateMenuGlyph\(false\)/);
assert.match(js, /event\.propertyName==='transform'\)finishDrawerClose\(\)/);
assert.match(js, /drawerCloseTimer=root\.setTimeout\(finishDrawerClose,drawerCloseFallback\)/);
assert.match(js, /drawer\.close=animatedDrawerClose/);
assert.match(js, /drawer\.addEventListener\('close',[\s\S]*syncButton\(false\)/);
assert.match(js, /prefersReducedMotion\(\)\|\|!mobile[\s\S]*finishDrawerClose\(\)/);

// v73: gesture direction follows the right-side drawer.
assert.match(js, /const swipeEdgeWidth=30/);
assert.match(js, /touch\.clientX>=root\.innerWidth-swipeEdgeWidth/,'closed drawer swipe must start from the right edge');
assert.match(js, /gesture\.mode==='opening'&&dx>=0/,'opening must require a leftward gesture');
assert.match(js, /gesture\.mode==='closing'&&dx<=0/,'closing must require a rightward gesture');
assert.match(js, /clamp\(width\+Math\.min\(0,dx\),0,width\)/,'opening drag must move from positive off-canvas offset toward zero');
assert.match(js, /clamp\(Math\.max\(0,dx\),0,width\)/,'closing drag must follow the finger to the right');
assert.match(js, /const progress=clamp\(1-\(offset\/width\),0,1\)/);
assert.match(js, /velocity<=-swipeFlingVelocity/,'leftward fling must be able to confirm opening');
assert.match(js, /velocity>=swipeFlingVelocity/,'rightward fling must be able to confirm closing');
assert.match(js, /const swipeIntentThreshold=8/);
assert.match(js, /const swipeHorizontalBias=1\.08/);
assert.match(js, /setDragVisual\(offset,progress\)/);
assert.match(js, /document\.addEventListener\('touchmove',onTouchMove,\{capture:true,passive:false\}\)/);

assert.match(js, /function showDrawerClosedSurface\(\)/);
assert.match(js, /setButtonState\(false\)[\s\S]*placeButtonInDrawer\(\)[\s\S]*drawer\.classList\.remove\('open'\)[\s\S]*drawer\.showModal\(\)[\s\S]*drawerShell\(\)\?\.getBoundingClientRect\(\)/);
assert.match(js, /function openDrawer\(keyboard=false\)[\s\S]*showDrawerClosedSurface\(\)[\s\S]*requestAnimationFrame\(\(\)=>\{[\s\S]*setButtonState\(true\)[\s\S]*drawer\.classList\.add\('open'\)[\s\S]*animateMenuGlyph\(true\)/);

assert.match(css, /Conta de Casa v73/);
assert.match(css, /@media\(min-width:821px\)[\s\S]*\.sidebar\{[\s\S]*inset:0 0 0 auto!important/,'desktop sidebar must be anchored to the right');
assert.match(css, /\.main\{[\s\S]*margin-left:0!important;[\s\S]*margin-right:var\(--sidebar-current\)!important/,'desktop content must reserve the right sidebar');
assert.match(css, /\.nav-drawer\{[\s\S]*inset:0 0 0 auto/,'mobile drawer must be anchored to the right');
assert.match(css, /transform:translate3d\(calc\(100% \+ 8px\),0,0\)/,'closed drawer shell must be fully off-canvas to the right');
assert.match(css, /\.nav-drawer\.open \.nav-drawer-shell\{[\s\S]*translate3d\(0,0,0\)/);
assert.match(css, /transform \.3s cubic-bezier\(\.32,\.72,0,1\)/,'opening must remain smooth and restrained');
assert.match(css, /var\(--drawer-drag-x,100%\)/,'dragging fallback must match the right-side direction');
assert.match(css, /border-left:1px solid/);
assert.match(css, /box-shadow:-18px 0 40px/);
assert.match(css, /\.drawer-nav \.nav-btn::before\{[\s\S]*inset:10px 0 10px auto/,'active indicator must sit on the right edge');
assert.match(css, /\.mobile-menu-home-placeholder\{[\s\S]*width:44px[\s\S]*height:44px[\s\S]*visibility:hidden/);
assert.match(css, /\.mobile-menu-icon-sentinel\{display:none!important\}/);
assert.match(css, /width:44px!important;[\s\S]*height:44px!important/);
assert.match(css, /\.nav-drawer-shell\{[\s\S]*safe-area-inset-top[\s\S]*safe-area-inset-bottom/);
assert.match(css, /\.drawer-nav\{[\s\S]*overflow-y:auto[\s\S]*overflow-x:hidden/);
assert.match(css, /\.drawer-nav \.nav-btn\{[\s\S]*min-height:48px/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)[\s\S]*transition:none!important/);
assert.doesNotMatch(css, /background:\s*(?:green|#0f0|#00ff00)/i);

assert.match(prepare, /const BUILD = 'v73'/);
assert.match(prepare, /const MENU_REV = '73-menu8'/);
assert.match(sw, /v73-menu8/);
assert.equal(manifest.latestVersion,'v73');
assert.equal(manifest.releases[0]?.version,'v73');
assert.ok(manifest.releases[0].items.some(item=>/lado direito|direita/i.test(item)));
assert.ok(manifest.releases[0].items.some(item=>/swipe|gesto/i.test(item)));
assert.ok(manifest.releases[0].items.some(item=>/header|cabeçalho/i.test(item)));
assert.ok(manifest.releases[0].items.some(item=>/não modifica|exclusivamente|não altera/i.test(item)));

console.log('v73 right-side navigation expectations aligned (not manually executed by this change).');

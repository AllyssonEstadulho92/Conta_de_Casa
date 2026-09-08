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
assert.match(js, /Conta de Casa v72/);
assert.match(js, /button\.addEventListener\('click',[\s\S]*stopImmediatePropagation\(\)[\s\S]*drawer\.open[\s\S]*closeDrawer\(keyboard\)[\s\S]*openDrawer\(keyboard\)[\s\S]*,true\)/);
assert.match(js, /drawerHead\.insertBefore\(button,drawerHead\.firstChild\)/, 'same menu button must move into the modal drawer');
assert.match(js, /homeAnchor\.parentNode\.insertBefore\(button,homeAnchor\.nextSibling\)/, 'same menu button must return to the topbar');
assert.match(js, /legacyClose\.hidden=true/, 'legacy duplicate X must remain visually removed until historical wiring is retired');
assert.match(js, /expanded\?'Fechar menu':'Abrir menu'/, 'accessible label must follow open state');
assert.match(js, /setAttribute\('aria-expanded',String\(expanded\)\)/);
assert.match(js, /button\.dataset\.menuState=state/);
assert.match(js, /drawer\.dataset\.menuState=state/);

// v72 icon ownership: custom hamburger geometry must not be reconstructed by the Lucide hydrator.
assert.match(icons, /function isCustomOwned\(target\)/);
assert.match(icons, /uiIconOwner==='custom'/);
assert.match(js, /button\.dataset\.uiIconOwner='custom'/);
assert.match(js, /button\.replaceChildren\(glyph\)/);
assert.match(js, /glyph\.append\(document\.createElement\('span'\),document\.createElement\('span'\),document\.createElement\('span'\)\)/);
assert.doesNotMatch(js, /mobile-menu-icon-sentinel|iconSentinel/, 'obsolete Lucide sentinel must be removed after explicit custom ownership');
assert.doesNotMatch(css, /mobile-menu-icon-sentinel/, 'obsolete hidden sentinel CSS must be removed');

// v72 continuity: the same button must remain visually continuous while it is reparented.
assert.match(js, /const motionOpenDuration=300/);
assert.match(js, /const motionCloseDuration=240/);
assert.match(js, /const motionOpenDelay=60/);
assert.match(js, /const buttonReparentDuration=280/);
assert.match(js, /const motionEase='cubic-bezier\(\.32,\.72,0,1\)'/);
assert.match(js, /function animateButtonReparent\(fromRect\)/);
assert.match(js, /const toRect=button\.getBoundingClientRect\(\)/);
assert.match(js, /const dx=fromRect\.left-toRect\.left/);
assert.match(js, /const dy=fromRect\.top-toRect\.top/);
assert.match(js, /translate3d\(\$\{dx\}px,\$\{dy\}px,0\)/);
assert.match(js, /duration:buttonReparentDuration/);
assert.match(js, /if\(!touchGesture\)animateButtonReparent\(sourceRect\)/, 'direct swipe must not receive a second competing translation');
assert.match(js, /pendingHomeRect=button\.getBoundingClientRect\(\)/, 'closing must retain the last visible drawer-button geometry for the return home');
assert.match(css, /data-reparenting="true"/);

// Explicit Web Animations keep hamburger/X movement visible after reparenting and while the drawer enters.
assert.match(js, /typeof glyph\.animate!=='function'/);
assert.match(js, /const timing=\{duration,delay,easing:motionEase,fill:open\?'backwards':'none'\}/, 'opening must hold the hamburger first frame during the short visibility delay');
assert.match(js, /motionAnimations\.push\(line\.animate\(frames,timing\)\)/);
assert.match(js, /const glyphMotion=glyph\.animate\(/);
assert.match(js, /rotate\(45deg\)/);
assert.match(js, /rotate\(-45deg\)/);
assert.match(js, /scaleX\(\.18\)/);
assert.match(js, /requestAnimationFrame\(\(\)=>animateMenuGlyph\(true\)\)/);

// Regression v71 retained: the dialog must stay open until the off-canvas close transition finishes.
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

// v71 interactive swipe retained: drawer follows the finger and snaps by progress/velocity.
assert.match(js, /const swipeEdgeWidth=30/,'closed drawer swipe must start from a narrow left edge');
assert.match(js, /const swipeIntentThreshold=8/,'gesture must wait for deliberate movement');
assert.match(js, /const swipeHorizontalBias=1\.08/,'horizontal intent must win over vertical scroll before capture');
assert.match(js, /const swipeOpenThreshold=\.34/);
assert.match(js, /const swipeKeepOpenThreshold=\.66/);
assert.match(js, /const swipeFlingVelocity=\.45/);
assert.match(js, /function beginTouchDrag\(gesture\)/);
assert.match(js, /function settleTouchDrag\(keepOpen\)/);
assert.match(js, /function onTouchStart\(event\)/);
assert.match(js, /function onTouchMove\(event\)/);
assert.match(js, /function onTouchEnd\(event\)/);
assert.match(js, /gesture\.mode==='opening'[\s\S]*-width\+Math\.max\(0,dx\)/,'opening drag must derive panel offset directly from finger delta');
assert.match(js, /gesture\.mode==='closing'[\s\S]*Math\.min\(0,dx\)/,'closing drag must follow leftward finger delta');
assert.match(js, /setDragVisual\(offset,progress\)/,'drag must update transform/backdrop continuously');
assert.match(js, /event\.cancelable\)event\.preventDefault\(\)/,'horizontal drag must stop browser scrolling only after gesture capture');
assert.match(js, /document\.addEventListener\('touchstart',onTouchStart,\{capture:true,passive:true\}\)/);
assert.match(js, /document\.addEventListener\('touchmove',onTouchMove,\{capture:true,passive:false\}\)/);
assert.match(js, /document\.addEventListener\('touchend',onTouchEnd,\{capture:true,passive:false\}\)/);
assert.match(js, /Date\.now\(\)\+swipeClickGuardMs/,'a completed swipe must suppress the synthesized click');
assert.match(js, /settleTouchDrag\(gesture\.mode==='closing'\)/,'system touch cancel must restore the previous stable state');

assert.match(css, /Conta de Casa v72/);
assert.match(css, /\.mobile-menu-glyph>span:nth-child\(1\)\{top:1px;width:22px\}/);
assert.match(css, /\.mobile-menu-glyph>span:nth-child\(2\)\{top:8px;width:18px\}/);
assert.match(css, /\.mobile-menu-glyph>span:nth-child\(3\)\{top:15px;width:14px\}/);
assert.match(css, /top \.24s cubic-bezier\(\.32,\.72,0,1\)/);
assert.match(css, /data-menu-state="open"[\s\S]*rotate\(45deg\)/);
assert.match(css, /rotate\(-45deg\)/);
assert.match(css, /scaleX\(\.18\)/);
assert.match(css, /width:44px!important;[\s\S]*height:44px!important/);
assert.match(css, /data-focus-origin="pointer"[\s\S]*outline:none!important/);
assert.match(css, /\.nav-drawer\{[\s\S]*width:min\(364px,calc\(100vw - 24px\)/);
assert.match(css, /\.nav-drawer::backdrop\{[\s\S]*background:rgba\(10,18,30,0\)[\s\S]*background-color \.22s ease-out/, 'backdrop must fade in from transparent');
assert.match(css, /\.nav-drawer\.open::backdrop\{[\s\S]*background:rgba\(10,18,30,\.34\)[\s\S]*blur\(1px\)/, 'open backdrop must remain restrained');
assert.match(css, /transform:translate3d\(calc\(-100% - 8px\),0,0\)/, 'closed drawer shell must be fully off-canvas');
assert.match(css, /\.nav-drawer\.open \.nav-drawer-shell\{[\s\S]*translate3d\(0,0,0\)/, 'open drawer shell must settle at its natural position');
assert.match(css, /transform \.28s cubic-bezier\(\.32,\.72,0,1\)/, 'opening must use the canonical deceleration');
assert.match(css, /touch-action:pan-y/,'drawer must preserve vertical scrolling while reserving horizontal dragging');
assert.match(css, /\.nav-drawer\[data-dragging="true"\] \.nav-drawer-shell\{[\s\S]*var\(--drawer-drag-x,-100%\)[\s\S]*transition:none!important/, 'dragging shell must follow the live CSS variable without transition lag');
assert.match(css, /\.nav-drawer\[data-dragging="true"\]::backdrop\{[\s\S]*--drawer-drag-alpha[\s\S]*--drawer-drag-blur[\s\S]*transition:none!important/, 'backdrop must follow drag progress continuously');
assert.match(css, /\.nav-drawer\[data-closing="true"\] \.nav-drawer-shell\{[\s\S]*transition-duration:\.24s,\.16s,\.24s/, 'closing must be slightly faster than opening');
assert.match(css, /\.nav-drawer-shell\{[\s\S]*safe-area-inset-top[\s\S]*safe-area-inset-bottom/);
assert.match(css, /\.drawer-nav\{[\s\S]*overflow-y:auto[\s\S]*overflow-x:hidden/);
assert.match(css, /\.drawer-nav \.nav-btn\{[\s\S]*min-height:48px/);
assert.match(css, /\.drawer-footer \.icon-text-btn\{[\s\S]*min-height:48px/);
assert.match(css, /@media\(max-width:359px\)\{[\s\S]*\.nav-drawer\{width:calc\(100vw - 20px\)\}/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)[\s\S]*\.nav-drawer::backdrop[\s\S]*transition:none!important/, 'reduced motion must also disable backdrop motion');
assert.doesNotMatch(css, /background:\s*(?:green|#0f0|#00ff00)/i);

assert.match(prepare, /const BUILD = 'v72'/);
assert.match(prepare, /const MENU_REV = '71-menu5'/);
assert.match(prepare, /const ICON_REV = '72-icons1'/);
assert.match(prepare, /'mobile-menu-toggle\.css'/);
assert.match(prepare, /'mobile-menu-toggle\.js'/);
assert.match(prepare, /mobile-menu-toggle\.css\?v=\$\{MENU_REV\}/);
assert.match(prepare, /mobile-menu-toggle\.js\?v=\$\{MENU_REV\}/);
assert.match(sw, /v71-menu5-v72-icons1/);
assert.match(sw, /'\.\/mobile-menu-toggle\.css'/);
assert.match(sw, /'\.\/mobile-menu-toggle\.js'/);
assert.equal(manifest.latestVersion,'v72');
assert.equal(manifest.releases[0]?.version,'v72');
assert.ok(manifest.releases[0].items.some(item=>/ícone|Lucide|hidrata/i.test(item)));
assert.ok(manifest.releases[0].items.some(item=>/hambúrguer|custom|desenho próprio/i.test(item)));
assert.ok(manifest.releases[0].items.some(item=>/não modifica|exclusivamente|não altera/i.test(item)));

console.log('v72 icon ownership, continuous reparenting, visible hamburger/X motion and v71 drawer gesture tests: OK');

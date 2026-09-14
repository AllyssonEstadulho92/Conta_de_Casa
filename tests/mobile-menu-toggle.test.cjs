const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const js = fs.readFileSync('mobile-menu-toggle.js','utf8');
const css = fs.readFileSync('mobile-menu-toggle.css','utf8');
const icons = fs.readFileSync('ui-icons.js','utf8');
const architecture = fs.readFileSync('v75-architecture.js','utf8');
const prepare = fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const sw = fs.readFileSync('sw.js','utf8');
const manifest = JSON.parse(fs.readFileSync('release-manifest.json','utf8'));

assert.doesNotThrow(()=>new vm.Script(js), 'mobile menu runtime must parse');
assert.match(js, /Conta de Casa v73/);
assert.match(js, /button\.addEventListener\('click',[\s\S]*stopImmediatePropagation\(\)[\s\S]*drawer\.open[\s\S]*closeDrawer\(keyboard\)[\s\S]*openDrawer\(keyboard\)[\s\S]*,true\)/);
assert.match(js, /drawerHead\.insertBefore\(button,drawerHead\.firstChild\)/);
assert.match(js, /function ensureHomePlaceholder\(\)/);
assert.match(js, /homeAnchor\.parentNode\.insertBefore\(placeholder,homeAnchor\.nextSibling\)/);
assert.match(js, /parent\.insertBefore\(button,reference\)/);
assert.match(js, /legacyClose\.hidden=true/);
assert.match(js, /expanded\?'Fechar menu':'Abrir menu'/);
assert.match(js, /setAttribute\('aria-expanded',String\(expanded\)\)/);
assert.match(js, /button\.dataset\.menuState=state/);
assert.match(js, /drawer\.dataset\.menuState=state/);

assert.match(icons, /fillIcon\(document\.querySelector\('#mobileMenuBtn'\),'menu',22\)/);
assert.match(js, /button\.querySelector\(':scope > svg\.ui-icon-svg'\)/);
assert.match(js, /mobile-menu-icon-sentinel/);
assert.match(js, /button\.dataset\.uiIconSlot='menu'/);
assert.match(js, /button\.replaceChildren\(glyph,iconSentinel\)/);
assert.match(js, /glyph\.append\(document\.createElement\('span'\),document\.createElement\('span'\),document\.createElement\('span'\)\)/);

assert.match(js, /const motionDuration=240/);
assert.match(js, /const motionEase='cubic-bezier\(\.32,\.72,0,1\)'/);
assert.match(js, /motionAnimations\.push\(line\.animate\(frames,/);
assert.match(js, /rotate\(45deg\)/);
assert.match(js, /rotate\(-45deg\)/);
assert.match(js, /scaleX\(\.18\)/);
assert.match(js, /animateMenuGlyph\(true\)/);
assert.match(js, /const drawerCloseFallback=360/);
assert.match(js, /drawer\.close=animatedDrawerClose/);
assert.match(js, /drawer\.addEventListener\('close',[\s\S]*syncButton\(false\)/);
assert.match(js, /prefersReducedMotion/);

assert.match(js, /const swipeEdgeWidth=30/);
assert.match(js, /touch\.clientX>=root\.innerWidth-swipeEdgeWidth/);
assert.match(js, /gesture\.mode==='opening'&&dx>=0/);
assert.match(js, /gesture\.mode==='closing'&&dx<=0/);
assert.match(js, /velocity<=-swipeFlingVelocity/);
assert.match(js, /velocity>=swipeFlingVelocity/);
assert.match(js, /setDragVisual\(offset,progress\)/);
assert.match(js, /document\.addEventListener\('touchmove',onTouchMove,\{capture:true,passive:false\}\)/);

assert.match(css, /Conta de Casa v76/);
assert.match(css, /v76 menu-morph1/);
assert.match(css, /\.mobile-menu-glyph>span\{display:none!important\}/,'legacy three-span glyph must no longer be visible');
assert.match(css, /\.mobile-menu-glyph::before,[\s\S]*\.mobile-menu-glyph::after\{/,'two pseudo-elements must own the visible icon');
assert.match(css, /translate\(-50%,-50%\) translateY\(-4px\) rotate\(0deg\)/,'top stroke must start above center');
assert.match(css, /translate\(-50%,-50%\) translateY\(4px\) rotate\(0deg\)/,'bottom stroke must start below center');
assert.match(css, /translateY\(0\) rotate\(45deg\)/,'top stroke must morph into the positive diagonal');
assert.match(css, /translateY\(0\) rotate\(-45deg\)/,'bottom stroke must morph into the negative diagonal');
assert.match(css, /cubic-bezier\(\.22,1,\.36,1\)/,'morph must use the v76 smooth deceleration curve');
assert.match(css, /@media\(min-width:821px\)[\s\S]*\.sidebar\{[\s\S]*inset:0 0 0 auto!important/);
assert.match(css, /\.main\{[\s\S]*margin-left:0!important;[\s\S]*margin-right:var\(--sidebar-current\)!important/);
assert.match(css, /\.nav-drawer\{[\s\S]*inset:0 0 0 auto/);
assert.match(css, /transform:translate3d\(calc\(100% \+ 8px\),0,0\)/);
assert.match(css, /border-left:1px solid/);
assert.match(css, /box-shadow:-18px 0 40px/);
assert.match(css, /\.nav-drawer-shell\{[\s\S]*safe-area-inset-top[\s\S]*safe-area-inset-bottom/);
assert.match(css, /\.drawer-nav \.nav-btn\{[\s\S]*min-height:48px/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)[\s\S]*\.mobile-menu-glyph::before[\s\S]*\.mobile-menu-glyph::after[\s\S]*transition:none!important/);
assert.doesNotMatch(css, /background:\s*(?:green|#0f0|#00ff00)/i);

/* v76 mantém o controlador v73 validado e melhora apenas a apresentação do glyph. */
assert.match(prepare, /const BUILD = 'v76'/);
assert.match(prepare, /const MENU_REV = '73-menu8'/);
assert.match(prepare, /const ARCHITECTURE_REV = '75-architecture2'/);
assert.match(prepare, /const PLANNING_MORE_REV = '76-planning-more1'/);
assert.doesNotMatch(prepare, /const EXPERIENCE_REV/);
assert.doesNotMatch(prepare, /const FEATURED_REV/);
assert.match(sw, /v73-menu8/);
assert.match(sw, /menu-morph1/,'service worker cache must be invalidated for the new visible morph');
assert.match(sw, /planning-more1/);
assert.match(sw, /v75-architecture2/);
assert.match(sw, /retire-assets1/);
assert.ok(sw.includes("'./v75-architecture.css'"));
assert.ok(sw.includes("'./v76-planning-more.css'"));
for(const retired of ['./v74-experience.css','./v74-experience.js','./v75-market-featured.css','./v75-market-featured.js'])assert.ok(!sw.includes(`'${retired}'`),`${retired} must not be cached`);
assert.match(architecture,/DRAWER_GROUPS/,'v75 must simplify the existing drawer instead of replacing its controller');
assert.doesNotMatch(architecture,/showModal\(|drawer\.close=|touchmove/,'v75 architecture must not duplicate the v73 drawer controller');
assert.equal(manifest.latestVersion,'v76');
const v73=manifest.releases.find(release=>release.version==='v73');
assert.ok(v73,'v73 navigation notes must remain in release history');
assert.ok(v73.items.some(item=>/lado direito|direita/i.test(item)));
assert.ok(v73.items.some(item=>/swipe|gesto/i.test(item)));
assert.ok(v73.items.some(item=>/cabeçalho|header/i.test(item)));

console.log('v76 two-line menu morph, right-side drawer controller and retired-asset boundaries: OK');

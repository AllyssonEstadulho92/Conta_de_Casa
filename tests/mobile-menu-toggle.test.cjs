const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const js = fs.readFileSync('mobile-menu-toggle.js','utf8');
const css = fs.readFileSync('mobile-menu-toggle.css','utf8');
const prepare = fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const sw = fs.readFileSync('sw.js','utf8');
const manifest = JSON.parse(fs.readFileSync('release-manifest.json','utf8'));

assert.doesNotThrow(()=>new vm.Script(js), 'mobile menu runtime must parse');
assert.match(js, /Conta de Casa v68/);
assert.match(js, /button\.addEventListener\('click',[\s\S]*stopImmediatePropagation\(\)[\s\S]*drawer\.open[\s\S]*closeDrawer\(\)[\s\S]*openDrawer\(\)[\s\S]*,true\)/);
assert.match(js, /drawerHead\.insertBefore\(button,drawerHead\.firstChild\)/, 'same menu button must move into the modal drawer');
assert.match(js, /homeAnchor\.parentNode\.insertBefore\(button,homeAnchor\.nextSibling\)/, 'same menu button must return to the topbar');
assert.match(js, /legacyClose\.hidden=true/, 'legacy duplicate X must remain visually removed until historical wiring is retired');
assert.match(js, /expanded\?'Fechar menu':'Abrir menu'/, 'accessible label must follow open state');
assert.match(js, /setAttribute\('aria-expanded',String\(expanded\)\)/);
assert.match(js, /button\.dataset\.menuState=state/);
assert.match(js, /drawer\.dataset\.menuState=state/);

assert.match(css, /Conta de Casa v68/);
assert.match(css, /\.mobile-menu-glyph>span:nth-child\(1\)\{top:1px;width:22px\}/);
assert.match(css, /\.mobile-menu-glyph>span:nth-child\(2\)\{top:8px;width:18px\}/);
assert.match(css, /\.mobile-menu-glyph>span:nth-child\(3\)\{top:15px;width:14px\}/);
assert.match(css, /rotate\(45deg\)/);
assert.match(css, /rotate\(-45deg\)/);
assert.match(css, /width:44px!important;[\s\S]*height:44px!important/);
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

assert.match(prepare, /const BUILD = 'v68'/);
assert.match(prepare, /const MENU_REV = '68-menu2'/);
assert.match(prepare, /'mobile-menu-toggle\.css'/);
assert.match(prepare, /'mobile-menu-toggle\.js'/);
assert.match(prepare, /mobile-menu-toggle\.css\?v=\$\{MENU_REV\}/);
assert.match(prepare, /mobile-menu-toggle\.js\?v=\$\{MENU_REV\}/);
assert.match(sw, /v68-menu2/);
assert.match(sw, /'\.\/mobile-menu-toggle\.css'/);
assert.match(sw, /'\.\/mobile-menu-toggle\.js'/);
assert.equal(manifest.latestVersion,'v68');
assert.equal(manifest.releases[0]?.version,'v68');
assert.ok(manifest.releases[0].items.some(item=>/largura|responsiv|ecrã/i.test(item)));
assert.ok(manifest.releases[0].items.some(item=>/hover|active|focus|táct/i.test(item)));

console.log('v68 animated mobile menu and responsive drawer tests: OK');

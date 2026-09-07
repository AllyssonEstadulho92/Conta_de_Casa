const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const js = fs.readFileSync('mobile-menu-toggle.js','utf8');
const css = fs.readFileSync('mobile-menu-toggle.css','utf8');
const prepare = fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const sw = fs.readFileSync('sw.js','utf8');
const manifest = JSON.parse(fs.readFileSync('release-manifest.json','utf8'));

assert.doesNotThrow(()=>new vm.Script(js), 'mobile menu runtime must parse');
assert.match(js, /button\.addEventListener\('click',[\s\S]*stopImmediatePropagation\(\)[\s\S]*drawer\.open[\s\S]*closeDrawer\(\)[\s\S]*openDrawer\(\)[\s\S]*,true\)/);
assert.match(js, /drawerHead\.insertBefore\(button,drawerHead\.firstChild\)/, 'same menu button must move into the modal drawer');
assert.match(js, /homeAnchor\.parentNode\.insertBefore\(button,homeAnchor\.nextSibling\)/, 'same menu button must return to the topbar');
assert.match(js, /legacyClose\.hidden=true/, 'legacy duplicate X must be visually removed');
assert.match(js, /expanded\?'Fechar menu':'Abrir menu'/, 'accessible label must follow open state');
assert.match(js, /setAttribute\('aria-expanded',String\(expanded\)\)/);

assert.match(css, /\.mobile-menu-glyph>span:nth-child\(1\)\{top:1px;width:22px\}/);
assert.match(css, /\.mobile-menu-glyph>span:nth-child\(2\)\{top:8px;width:18px\}/);
assert.match(css, /\.mobile-menu-glyph>span:nth-child\(3\)\{top:15px;width:14px\}/);
assert.match(css, /rotate\(45deg\)/);
assert.match(css, /rotate\(-45deg\)/);
assert.match(css, /\.drawer-head>#drawerCloseBtn\{display:none!important\}/);
assert.match(css, /width:44px!important;[\s\S]*height:44px!important/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
assert.doesNotMatch(css, /background:\s*(?:green|#0f0|#00ff00)/i);

assert.match(prepare, /const BUILD = 'v67'/);
assert.match(prepare, /const MENU_REV = '67-menu1'/);
assert.match(prepare, /'mobile-menu-toggle\.css'/);
assert.match(prepare, /'mobile-menu-toggle\.js'/);
assert.match(prepare, /mobile-menu-toggle\.css\?v=\$\{MENU_REV\}/);
assert.match(prepare, /mobile-menu-toggle\.js\?v=\$\{MENU_REV\}/);
assert.match(sw, /v67-menu1/);
assert.match(sw, /'\.\/mobile-menu-toggle\.css'/);
assert.match(sw, /'\.\/mobile-menu-toggle\.js'/);
assert.equal(manifest.latestVersion,'v67');
assert.equal(manifest.releases[0]?.version,'v67');

console.log('Animated mobile menu toggle tests: OK');

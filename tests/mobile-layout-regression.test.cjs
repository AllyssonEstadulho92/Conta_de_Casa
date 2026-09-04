const assert = require('node:assert/strict');
const fs = require('node:fs');

const mobileCss = fs.readFileSync('mobile-layout.css','utf8');
const index = fs.readFileSync('index.html','utf8');
const sw = fs.readFileSync('sw.js','utf8');
const preparePages = fs.readFileSync('scripts/prepare-pages.cjs','utf8');

assert.match(mobileCss, /@media\(max-width:820px\)/);
assert.match(mobileCss, /html\.app-active \.app-shell\{[\s\S]*height:100dvh;[\s\S]*min-height:100svh;[\s\S]*max-height:100dvh;/);
assert.match(mobileCss, /html\.app-active \.main\{[\s\S]*height:100dvh;[\s\S]*overflow-y:auto;/);
assert.doesNotMatch(mobileCss, /height\s*:\s*var\(--visual-vh\)/);
assert.match(mobileCss, /\.topbar\{[\s\S]*position:sticky;[\s\S]*top:0;[\s\S]*z-index:30;/);

assert.match(mobileCss, /@media\(min-width:360px\) and \(max-width:560px\)/);
assert.match(mobileCss, /\.market-mobile-head\{[\s\S]*grid-template-columns:44px minmax\(0,1fr\) auto;/);
assert.match(mobileCss, /\.market-mobile-money\{[\s\S]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\);/);
assert.match(mobileCss, /\.market-mobile-money>div:last-child\{[\s\S]*grid-column:auto;/);

const designPosition = index.indexOf('./design-system.css?v=50');
const mobilePosition = index.indexOf('./mobile-layout.css?v=50');
assert.ok(designPosition >= 0, 'design-system.css must remain loaded');
assert.ok(mobilePosition > designPosition, 'mobile-layout.css must load after design-system.css');
assert.match(sw, /'\.\/mobile-layout\.css'/);
assert.match(preparePages, /'mobile-layout\.css'/);

console.log('Mobile viewport clipping and market-card density regression tests: OK');

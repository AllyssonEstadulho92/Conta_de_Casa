const assert = require('node:assert/strict');
const fs = require('node:fs');

const mobileCss = fs.readFileSync('mobile-layout.css','utf8');
const shellCss = fs.readFileSync('v76-mobile-shell.css','utf8');
const index = fs.readFileSync('index.html','utf8');
const sw = fs.readFileSync('sw.js','utf8');
const preparePages = fs.readFileSync('scripts/prepare-pages.cjs','utf8');

// mobile-layout.css is feature-level only; it must never recreate the application viewport.
assert.doesNotMatch(mobileCss, /html\.app-active \.app-shell\{/);
assert.doesNotMatch(mobileCss, /html\.app-active \.main\{/);
assert.doesNotMatch(mobileCss, /\.topbar\{[\s\S]*position:sticky/);
assert.doesNotMatch(mobileCss, /height\s*:\s*100dvh|height\s*:\s*var\(--visual-vh\)/);

// The final v76 shell owns viewport geometry, document scroll and safe-area handling.
assert.match(shellCss, /@media \(max-width:820px\)/);
assert.match(shellCss, /html\.cdc-v75\.app-active \.app-shell\{[\s\S]*min-height:100dvh!important;[\s\S]*max-height:none!important;/);
assert.match(shellCss, /html\.cdc-v75\.app-active body \.main\{[\s\S]*height:auto!important;[\s\S]*overflow:visible!important;/);
assert.match(shellCss, /html\.cdc-v75\.app-active \.main>\.topbar,[\s\S]*position:relative!important;/);
assert.match(shellCss, /env\(safe-area-inset-top,0px\)/);
assert.match(shellCss, /env\(safe-area-inset-bottom,0px\)/);

// Product-card density remains scoped to the Mercado feature.
assert.match(mobileCss, /@media\(min-width:360px\) and \(max-width:560px\)/);
assert.match(mobileCss, /\.market-mobile-head\{[\s\S]*grid-template-columns:44px minmax\(0,1fr\) auto;/);
assert.match(mobileCss, /\.market-mobile-money\{[\s\S]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\);/);
assert.match(mobileCss, /\.market-mobile-money>div:last-child\{[\s\S]*grid-column:auto;/);

const designPosition = index.indexOf('./design-system.css?v=53');
const mobilePosition = index.indexOf('./mobile-layout.css?v=53');
const marketPosition = index.indexOf('./market-experience.css?v=53');
assert.ok(designPosition >= 0, 'design-system.css must remain loaded');
assert.ok(mobilePosition > designPosition, 'mobile feature compatibility must load after the base design system');
assert.ok(marketPosition > mobilePosition, 'market experience must remain after mobile feature compatibility');
assert.match(sw, /'\.\/mobile-layout\.css'/);
assert.match(sw, /'\.\/v76-mobile-shell\.css'/);
assert.match(preparePages, /'mobile-layout\.css'/);
assert.match(preparePages, /'v76-mobile-shell\.css'/);

console.log('Mobile viewport ownership and market-card density regression tests: OK');

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

// 76-bills-mobile-alignment2 is the final mobile presentation contract for Search + Filters.
assert.match(mobileCss,/76-bills-mobile-alignment2/);
assert.match(mobileCss,/body #app #page-bills>\.bill-command-bar\{[\s\S]*grid-template-columns:minmax\(0,1fr\) 52px!important;[\s\S]*gap:12px!important;[\s\S]*margin:0 0 var\(--bills-mobile-section-gap\)!important;/);
assert.match(mobileCss,/body #app #page-bills>\.bill-filter-grid\{[\s\S]*display:grid!important;[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important;[\s\S]*overflow-x:hidden!important;[\s\S]*scroll-snap-type:none!important;/);
assert.match(mobileCss,/\.bill-filter-field:nth-child\(1\)\{[\s\S]*grid-column:1!important;[\s\S]*grid-row:3!important;/);
assert.match(mobileCss,/\.bill-filter-field:nth-child\(2\)\{[\s\S]*grid-column:2!important;[\s\S]*grid-row:3!important;/);
assert.match(mobileCss,/\.bill-filter-field:nth-child\(3\)\{[\s\S]*grid-column:1!important;[\s\S]*grid-row:4!important;/);
assert.match(mobileCss,/\.bill-filter-field:nth-child\(4\)\{[\s\S]*grid-column:2!important;[\s\S]*grid-row:4!important;/);
assert.match(mobileCss,/\.bill-filter-field:nth-child\(5\)\{[\s\S]*grid-column:1\/-1!important;[\s\S]*grid-row:5!important;/);
assert.match(mobileCss,/#billClearFilters\{[\s\S]*grid-column:1\/-1!important;[\s\S]*min-height:44px!important;/);
assert.match(mobileCss,/@media\(max-width:360px\)[\s\S]*grid-template-columns:minmax\(0,1fr\)!important/);
assert.doesNotMatch(mobileCss,/scroll-snap-type:x proximity/,'Despesas mobile must no longer depend on a horizontal filter rail.');
assert.match(sw,/expenses-mobile-alignment2/,'PWA cache must invalidate when the mobile Expenses layout changes.');

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

console.log('Mobile viewport ownership, market-card density and Expenses alignment regression tests: OK');

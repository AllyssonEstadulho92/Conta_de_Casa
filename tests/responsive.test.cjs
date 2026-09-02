const assert = require('node:assert/strict');
const fs = require('node:fs');

const css = fs.readFileSync('styles.css','utf8');
const events = fs.readFileSync('events.js','utf8');

assert.match(css, /Responsive system v5/);
assert.match(css, /overflow-x:hidden/);
assert.match(css, /-webkit-text-size-adjust:100%/);
assert.match(css, /@media\(max-width:820px\)/);
assert.match(css, /@media\(max-width:359px\)/);
assert.match(css, /@media\(max-width:319px\)/);
assert.match(css, /@media\(min-width:1181px\)/);
assert.match(css, /@media\(min-width:821px\) and \(max-width:1180px\)/);

assert.match(css, /\.kpi-grid\{[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(css, /@media\(max-width:359px\)[\s\S]*\.kpi-grid\{grid-template-columns:minmax\(0,1fr\)/);
assert.match(css, /\.dashboard-grid,\.two-col,\.cards-list,\.goal-grid\{[\s\S]*grid-template-columns:minmax\(0,1fr\)/);
assert.match(css, /\.panel-head\{[\s\S]*grid-template-columns:minmax\(0,1fr\)/);

assert.match(css, /--browser-bottom-offset:0px/);
assert.match(css, /Fixed mobile navigation v7/);
assert.match(css, /\.mobile-nav\{[\s\S]*position:fixed!important[\s\S]*bottom:0!important/);
assert.match(css, /\.fab\{[\s\S]*position:fixed!important/);
assert.match(css, /\.main\{[\s\S]*var\(--mobile-nav-height\)/);
assert.match(css, /\.dialog-shell\{[\s\S]*var\(--visual-vh\)/);

assert.match(events, /function installViewportMetrics\(\)/);
assert.match(events, /window\.visualViewport/);
assert.match(events, /--visual-vh/);
assert.match(events, /--browser-bottom-offset/);
assert.match(events, /keyboard-open/);

assert.doesNotMatch(css, /\bzoom\s*:/i);
assert.doesNotMatch(css, /transform\s*:\s*scale\(/i);

console.log('Responsive system v5 tests: OK');


const index = fs.readFileSync('index.html','utf8');

assert.match(css, /Mobile product polish v6/);
assert.match(css, /\.vault-screen\{[\s\S]*display:block[\s\S]*place-items:unset/);
assert.match(css, /max\(14px,env\(safe-area-inset-top\)\)/);
assert.match(css, /\.vault-action-row\{[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(css, /\.vault-disclosure/);
assert.match(css, /@media\(max-width:359px\)[\s\S]*\.vault-action-row\{grid-template-columns:minmax\(0,1fr\)/);

assert.match(index, /id="vaultTransferToggle"/);
assert.match(index, /id="vaultTransferPanel"[^>]*hidden/);
assert.match(events, /vaultTransferToggle/);
assert.match(events, /aria-expanded/);

console.log('Mobile product polish v6 tests: OK');


assert.match(css, /Bill detail modal v1/);
assert.match(css, /\.detail-dialog \.dialog-head\{[\s\S]*position:sticky/);
assert.match(css, /\.detail-actions\{[\s\S]*position:sticky/);
assert.match(css, /\.bill-detail-grid\{[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);

console.log('Bill detail modal tests: OK');


assert.match(events, /setProperty\('--browser-bottom-offset', '0px'\)/, 'navigation must not receive a positive browser toolbar offset');
assert.doesNotMatch(events, /Math\.max\(bottomOffset, 56\)/, 'Safari toolbar must not push navigation upward');

console.log('Fixed mobile navigation v7 tests: OK');


assert.match(css, /Native mobile shell v8/);
assert.match(css, /html\.app-active \.app-shell\{[\s\S]*height:var\(--visual-vh\)/);
assert.match(css, /html\.app-active \.main\{[\s\S]*overflow-y:auto/);
assert.match(css, /html\.app-active \.mobile-nav\{[\s\S]*position:fixed!important[\s\S]*bottom:0!important/);
assert.match(events, /document\.documentElement\.classList\.add\('app-active'\)/);

console.log('Native mobile shell v8 tests: OK');


assert.match(index, /name="app-build" content="v33"/);
assert.match(index, /styles\.css\?v=32/);
assert.match(index, /sync\.js\?v=32/);
assert.match(index, /events\.js\?v=32/);
assert.match(index, /id="appBuildVersion">v33</);
assert.match(events, /register\('\.\/sw\.js\?v=32',\{updateViaCache:'none'\}\)/);
assert.match(events, /controllerchange/);

const swSource=fs.readFileSync('sw.js','utf8');
assert.match(swSource, /conta-de-casa-public-v33/);
assert.match(swSource, /url\.searchParams\.has\('v'\)/);

console.log('PWA freshness v33 tests: OK');

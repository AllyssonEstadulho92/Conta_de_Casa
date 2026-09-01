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
assert.match(css, /\.mobile-nav\{[\s\S]*bottom:var\(--browser-bottom-offset\)/);
assert.match(css, /\.fab\{[\s\S]*bottom:calc\(var\(--browser-bottom-offset\) \+ 30px\)/);
assert.match(css, /\.main\{[\s\S]*var\(--browser-bottom-offset\)/);
assert.match(css, /\.dialog-shell\{[\s\S]*var\(--visual-vh\)/);

assert.match(events, /function installViewportMetrics\(\)/);
assert.match(events, /window\.visualViewport/);
assert.match(events, /--visual-vh/);
assert.match(events, /--browser-bottom-offset/);
assert.match(events, /display-mode: standalone/);
assert.match(events, /keyboard-open/);

assert.doesNotMatch(css, /\bzoom\s*:/i);
assert.doesNotMatch(css, /transform\s*:\s*scale\(/i);

console.log('Responsive system v5 tests: OK');

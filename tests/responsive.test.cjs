const assert = require('node:assert/strict');
const fs = require('node:fs');

const css = fs.readFileSync('styles.css','utf8');

assert.match(css, /html,body\{[\s\S]*overflow-x:hidden/);
assert.match(css, /-webkit-text-size-adjust:100%/);
assert.match(css, /@media\(max-width:820px\)/);
assert.match(css, /\.main\{[\s\S]*width:100%;[\s\S]*overflow-x:hidden/);
assert.match(css, /\.kpi-grid\{[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(css, /\.dashboard-grid,[\s\S]*grid-template-columns:minmax\(0,1fr\)/);
assert.match(css, /\.mobile-nav\{[\s\S]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
assert.match(css, /\.calendar-grid\{[\s\S]*repeat\(7,minmax\(0,1fr\)\)/);
assert.match(css, /@media\(max-width:360px\)[\s\S]*\.kpi-grid\{grid-template-columns:minmax\(0,1fr\)\}/);

console.log('Responsive layout tests: OK');


assert.match(css, /Responsive enclosure v3/);
assert.match(css, /@media\(max-width:359px\)/);
assert.match(css, /@media\(max-width:319px\)/);
assert.match(css, /@media\(min-width:821px\)/);
assert.match(css, /@media\(min-width:1440px\)/);
assert.match(css, /inline-size:calc\(100% - var\(--sidebar\)\)/);
assert.match(css, /max-inline-size:calc\(100vw - var\(--sidebar\)\)/);
assert.match(css, /\.calendar-day small\{[\s\S]*display:none/);
assert.match(css, /\.bill-meta\{[\s\S]*grid-template-columns:minmax\(0,1fr\)/);

console.log('Responsive enclosure v3 tests: OK');


assert.match(css, /Mobile enclosure polish v4/);
assert.match(css, /@media\(max-width:480px\)[\s\S]*\.panel-head\{[\s\S]*display:grid/);
assert.match(css, /@media\(max-width:359px\)[\s\S]*\.kpi-grid\{[\s\S]*grid-template-columns:minmax\(0,1fr\)/);
assert.match(css, /@media\(min-width:1101px\)[\s\S]*\.topbar,[\s\S]*\.page/);

console.log('Mobile enclosure polish v4 tests: OK');

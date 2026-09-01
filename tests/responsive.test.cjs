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

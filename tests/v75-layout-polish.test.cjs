'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const css=read('v75-layout-polish.css');
const prepare=read('scripts/prepare-pages.cjs');
const sw=read('sw.js');

assert.match(css,/revisão 75-layout1/i);
assert.match(css,/--v75-content-max:1280px/);
assert.match(css,/\.page\.active\{[\s\S]*display:grid!important/);
assert.match(css,/\.panel\{[\s\S]*padding:var\(--v75-panel-pad\)!important/);
assert.match(css,/#page-dashboard \.dashboard-grid/);
assert.match(css,/\.bill-filter-grid/);
assert.match(css,/\.market-filter-grid/);
assert.match(css,/\.calendar-grid/);
assert.match(css,/#page-planning>\.two-col/);
assert.match(css,/#page-reports #reportCards/);
assert.match(css,/\.goal-grid/);
assert.match(css,/#page-security>\.two-col/);
assert.match(css,/#page-diagnostics>\.two-col/);
assert.match(css,/#page-settings>\.panel\.narrow/);
assert.match(css,/@media\(max-width:820px\)/);
assert.match(css,/@media\(max-width:430px\)/);
assert.match(css,/safe-area|var\(--v75-mobile-panel-pad\)/);
assert.doesNotMatch(css,/\bappState\b|amountCents|estimatedCents|actualCents|IndexedDB|openDB\(|saveState\(|persistState\(/,'layout layer must not manipulate application or financial state');

assert.match(prepare,/const LAYOUT_REV = '75-layout1'/);
assert.ok(prepare.includes("'v75-layout-polish.css'"));
assert.match(prepare,/v75-layout-polish\.css\?v=\$\{LAYOUT_REV\}/);
assert.match(sw,/stability1-layout1/);
assert.ok(sw.includes("'./v75-layout-polish.css'"));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/v75-layout-polish\.css\?v=75-layout1/);
  assert.ok(index.indexOf('v75-layout-polish.css')>index.indexOf('v75-stability.css'),'layout polish must load after stability CSS');
  assert.ok(fs.existsSync(path.join(dist,'v75-layout-polish.css')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('v75 page geometry, proportions and alignment tests: OK');
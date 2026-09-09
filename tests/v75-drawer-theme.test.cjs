'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const css=read('v75-drawer-theme.css');
const headerCss=read('v75-header-refinement.css');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');

assert.match(css,/revisão 75-drawer2/i);
assert.match(css,/@media\(max-width:820px\)/);
assert.match(css,/\.nav-drawer\{[\s\S]*inset:0 0 0 auto!important/,'drawer must remain on the right');
assert.match(css,/width:min\(320px,calc\(100vw - 72px\)\)!important/,'drawer must leave a visible slice of the page');
assert.match(css,/--v75-drawer-petrol:#003f4c/);
assert.match(css,/--v75-drawer-mid:#005965/);
assert.match(css,/--v75-drawer-teal:#087a78/);
assert.match(css,/--v75-drawer-mint:#5be0c2/);
assert.match(css,/linear-gradient\(145deg,var\(--v75-drawer-petrol\) 0%,var\(--v75-drawer-mid\) 56%,var\(--v75-drawer-teal\) 100%\)/);
assert.match(headerCss,/linear-gradient\(112deg,#003f4c 0%,#005965 56%,#087a78 100%\)/,'drawer palette must stay aligned with header palette');
assert.match(css,/border-radius:28px 0 0 28px!important/);
assert.match(css,/\.drawer-head>\.mobile-menu-btn\{[\s\S]*order:2!important/,'same hamburger/X control must remain in drawer header');
assert.match(css,/\.drawer-nav \.nav-btn\.active/);
assert.match(css,/background:var\(--v75-drawer-active\)!important/);
assert.match(css,/\.drawer-footer/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.doesNotMatch(css,/\bappState\b|amountCents|estimatedCents|actualCents|openDB\(|saveState\(|persistState\(/,'drawer visual layer must not access application or financial state');

assert.match(prepare,/const DRAWER_REV = '75-drawer2'/);
assert.ok(prepare.includes("'v75-drawer-theme.css'"));
assert.match(prepare,/v75-drawer-theme\.css\?v=\$\{DRAWER_REV\}/);
assert.match(sw,/stability1-layout1-drawer2/);
assert.ok(sw.includes("'./v75-drawer-theme.css'"));
assert.ok(!sw.includes("'./v75-drawer-blue.css'"));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/v75-drawer-theme\.css\?v=75-drawer2/);
  assert.ok(index.indexOf('v75-drawer-theme.css?v=75-drawer2')>index.indexOf('v75-layout-polish.css?v=75-layout1'),'drawer refinement must load after layout geometry');
  assert.ok(fs.existsSync(path.join(dist,'v75-drawer-theme.css')));
  assert.ok(!fs.existsSync(path.join(dist,'v75-drawer-blue.css')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('v75 right teal drawer theme tests: OK');

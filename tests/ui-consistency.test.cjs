'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const css=read('ui-consistency.css');
const runtimeCss=read('v64-runtime.css');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');

assert.match(css,/Conta de Casa v63/);
assert.match(css,/\.ui-icon-svg,[\s\S]*\.svg-icon\{[\s\S]*stroke-width:2!important/,'all application SVG icons must share the Lucide stroke metric');
assert.match(css,/\.mobile-nav \.nav-btn\.active::after[\s\S]*content:none!important/,'legacy second mobile-nav indicator must be disabled');
assert.match(css,/\.mobile-nav \.nav-btn\.active::before[\s\S]*background:var\(--primary\)!important/,'mobile navigation must have a single active indicator');
assert.match(css,/--cdc-nav-indicator-width:42px/);
assert.match(css,/#page-market \.market-summary-item\{[\s\S]*inset 0 3px 0 var\(--market-summary-accent\)/,'market summary accent must be a continuous inset instead of a pseudo-element stripe');
assert.match(css,/#page-market \.market-summary-item::before\{[\s\S]*position:static!important/,'market summary pseudo-element must be reserved for the semantic icon');
assert.match(css,/background-size:22px 22px!important/);
assert.match(css,/prefers-reduced-motion:reduce/);

assert.match(runtimeCss,/Conta de Casa v64/);
assert.match(runtimeCss,/--mobile-top-safe:max\(20px,calc\(env\(safe-area-inset-top,0px\) \+ 8px\)\)/,'mobile header must retain an explicit touch-safe gap above the controls');
assert.match(runtimeCss,/\.status-chip\.draft/);
assert.match(runtimeCss,/\.bill-draft-card/);

assert.match(sw,/conta-de-casa-public-v64-runtime1/);
assert.ok(sw.includes("'./ui-consistency.css'"));
assert.ok(sw.includes("'./v64-runtime.css'"));
assert.match(prepare,/const BUILD = 'v64'/);
assert.match(prepare,/const VISUAL_REV = '64-ui1'/);
assert.match(prepare,/const RUNTIME_REV = '64-runtime1'/);
assert.ok(prepare.includes("'ui-consistency.css'"));
assert.ok(prepare.includes("'v64-runtime.css'"));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/ui-consistency\.css\?v=64-ui1/);
  assert.match(index,/v64-runtime\.css\?v=64-runtime1/);
  assert.ok(index.indexOf('market-category-groups.css')<index.indexOf('ui-consistency.css'),'visual consistency CSS must load after market/category layers');
  assert.ok(index.indexOf('ui-consistency.css')<index.indexOf('v64-runtime.css'),'v64 touch-safe layer must be the final visual layer');
  assert.ok(fs.existsSync(path.join(dist,'ui-consistency.css')));
  assert.ok(fs.existsSync(path.join(dist,'v64-runtime.css')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Global icon, navigation indicator, market summary and v64 safe-area consistency tests: OK');

'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const css=read('ui-consistency.css');
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

assert.match(sw,/conta-de-casa-public-v63-ui2/);
assert.ok(sw.includes("'./ui-consistency.css'"));
assert.match(prepare,/const BUILD = 'v63'/);
assert.match(prepare,/const VISUAL_REV = '63-ui2'/);
assert.ok(prepare.includes("'ui-consistency.css'"));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/ui-consistency\.css\?v=63-ui2/);
  assert.ok(index.indexOf('market-category-groups.css')<index.indexOf('ui-consistency.css'),'visual consistency CSS must load after market/category layers');
  assert.ok(fs.existsSync(path.join(dist,'ui-consistency.css')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Global icon, navigation indicator and market summary consistency tests: OK');

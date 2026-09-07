'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const js=read('market-category-groups.js');
const css=read('market-category-groups.css');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');

new Function(js);
assert.match(js,/CATEGORY_ORDER/);
assert.match(js,/market-category-group/);
assert.match(js,/market-category-summary/);
assert.match(js,/market-category-items/);
assert.match(js,/MutationObserver/,'grouping must be restored after renderMarket replaces the list');
assert.match(js,/data-market-toggle/,'grouping must reuse the real market item identifier');
assert.match(js,/details\.open=true/,'base category layer must start categories expanded before v65 shopping focus prioritizes pending items');
assert.match(js,/localeCompare\(b,'pt-PT'\)/);
assert.match(js,/category==='Mercearia \/ Despensa'\)return 'plan'/,'pantry category must use the cleaner local icon instead of the shopping cart');
assert.doesNotMatch(js,/estimatedCents|actualCents|saveState|commit\(/,'presentation layer must not mutate financial state');

assert.match(css,/@media\(max-width:820px\)/);
assert.match(css,/\.market-category-group\{/);
assert.match(css,/--market-item-indent:52px/,'mobile product content must share one explicit left indent');
assert.match(css,/grid-template-columns:38px minmax\(0,1fr\) 20px/,'category title and count must share the same left column');
assert.match(css,/\.market-category-count\{[\s\S]*justify-self:start/,'category count must align left');
assert.match(css,/\.market-category-items \.status-chip\{[\s\S]*justify-self:start/,'status chip must align with product text');
assert.match(css,/\.market-category-items \.market-mobile-actions\{[\s\S]*justify-content:flex-start/,'mobile actions must align left');
assert.match(css,/market-mobile-card:not\(\.purchased\)[\s\S]*nth-child\(2\)/,'pending rows must remove redundant duplicate finance blocks');
assert.match(css,/prefers-reduced-motion:reduce/);

assert.match(sw,/conta-de-casa-public-v64-runtime1/);
assert.match(sw,/v66-shell1/);
assert.ok(sw.includes("'./market-category-groups.css'"));
assert.ok(sw.includes("'./market-category-groups.js'"));
assert.ok(sw.includes("'./ui-consistency.css'"));
assert.ok(sw.includes("'./v64-runtime.css'"));
assert.ok(sw.includes("'./v64-runtime.js'"));
assert.ok(sw.includes("'./release-manifest.json'"));
assert.match(prepare,/const BUILD = 'v66'/);
assert.match(prepare,/const UI_REV = '64-ui1'/);
assert.match(prepare,/const CATEGORY_REV = '64-ui1'/);
assert.match(prepare,/const VISUAL_REV = '64-ui1'/);
assert.match(prepare,/const RUNTIME_REV = '64-runtime1'/);
assert.match(prepare,/const SHELL_REV = '66-shell1'/);
assert.ok(prepare.includes("'market-category-groups.css'"));
assert.ok(prepare.includes("'market-category-groups.js'"));
assert.ok(prepare.includes("'ui-consistency.css'"));
assert.ok(prepare.includes("'v64-runtime.css'"));
assert.ok(prepare.includes("'v64-runtime.js'"));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/market-brand\.css\?v=64-ui1/);
  assert.match(index,/market-branding\.js\?v=64-ui1/);
  assert.match(index,/market-category-groups\.css\?v=64-ui1/);
  assert.match(index,/market-category-groups\.js\?v=64-ui1/);
  assert.match(index,/ui-consistency\.css\?v=64-ui1/);
  assert.match(index,/v64-runtime\.css\?v=66-shell1/);
  assert.match(index,/v64-runtime\.js\?v=64-runtime1/);
  assert.ok(index.indexOf('market-brand.css')<index.indexOf('market-category-groups.css'),'category CSS must load after market branding');
  assert.ok(index.indexOf('market-category-groups.css')<index.indexOf('ui-consistency.css'),'global visual normalization must load after category styling');
  assert.ok(index.indexOf('ui-consistency.css')<index.indexOf('v64-runtime.css'),'mobile shell layer must load after prior visual normalization');
  assert.ok(index.indexOf('market-branding.js')<index.indexOf('market-category-groups.js'),'category grouping must load after market branding');
  assert.ok(index.indexOf('market-category-groups.js')<index.indexOf('v64-runtime.js'),'v64 functional runtime must execute after category grouping');
  for(const asset of ['market-category-groups.css','market-category-groups.js','ui-consistency.css','v64-runtime.css','v64-runtime.js','release-manifest.json'])assert.ok(fs.existsSync(path.join(dist,asset)),`${asset} must exist in dist`);
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Market category grouping, left alignment and v66 shell build ordering tests: OK');

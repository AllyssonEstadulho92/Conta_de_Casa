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
assert.match(js,/details\.open=true/,'categories must start expanded');
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

assert.match(sw,/conta-de-casa-public-v63-ui1/);
assert.ok(sw.includes("'./market-category-groups.css'"));
assert.ok(sw.includes("'./market-category-groups.js'"));
assert.ok(sw.includes("'./release-manifest.json'"));
assert.match(prepare,/const BUILD = 'v63'/);
assert.match(prepare,/const UI_REV = '63-ui1'/);
assert.match(prepare,/const CATEGORY_REV = '63-ui1'/);
assert.ok(prepare.includes("'market-category-groups.css'"));
assert.ok(prepare.includes("'market-category-groups.js'"));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/market-brand\.css\?v=63-ui1/);
  assert.match(index,/market-branding\.js\?v=63-ui1/);
  assert.match(index,/market-category-groups\.css\?v=63-ui1/);
  assert.match(index,/market-category-groups\.js\?v=63-ui1/);
  assert.ok(index.indexOf('market-brand.css')<index.indexOf('market-category-groups.css'),'category CSS must load after market branding');
  assert.ok(index.indexOf('market-branding.js')<index.indexOf('market-category-groups.js'),'category grouping must load after market branding');
  assert.ok(fs.existsSync(path.join(dist,'market-category-groups.css')));
  assert.ok(fs.existsSync(path.join(dist,'market-category-groups.js')));
  assert.ok(fs.existsSync(path.join(dist,'release-manifest.json')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Market category grouping, left alignment and icon tests: OK');

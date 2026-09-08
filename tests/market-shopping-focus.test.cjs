'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const js=read('market-shopping-focus.js');
const css=read('market-shopping-focus.css');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');
const manifest=JSON.parse(read('release-manifest.json'));

new Function(js);
assert.match(js,/Adicionar produto à lista de compras/);
assert.match(js,/newMarketBtn/,'header + must reuse the existing market add action');
assert.match(js,/stopImmediatePropagation\(\)/,'market header + must prevent the generic quick dialog from opening first');
assert.match(js,/market-compact-summary/);
assert.match(js,/Resumo financeiro/);
assert.match(js,/market-purchased-group/);
assert.match(js,/group\.open=false/,'purchased items must start collapsed');
assert.match(js,/group\.open=true/,'categories with pending items must stay expanded');
assert.match(js,/market-item-details/,'secondary financial/edit actions must move behind per-item details');
assert.match(js,/marketClearFilters/);
assert.match(js,/clear\.hidden=media\.matches\?!filterIsActive\(\):false/,'mobile clear filters must only appear when a filter/search/sort differs from default while desktop remains unchanged');
assert.doesNotMatch(js,/saveState|commit\(|estimatedCents\s*=|actualCents\s*=|quantity\s*=/,'shopping focus layer must not mutate financial state');

assert.match(css,/@media\(max-width:820px\)/);
assert.match(css,/#page-market #marketSummary\{display:none!important\}/,'large financial cards must leave the first mobile viewport');
assert.match(css,/#page-market \.market-new-btn\{display:none!important\}/,'duplicate page-level add button must be hidden on mobile');
assert.match(css,/\.market-filter-clear\[hidden\]\{display:none!important\}/);
assert.match(css,/\.market-mobile-quick-price/);
assert.match(css,/\.market-item-details>summary/);
assert.match(css,/min-height:44px/,'compact controls must retain the project touch-target minimum');
assert.match(css,/prefers-reduced-motion:reduce/);

assert.equal(manifest.latestVersion,'v73');
const v65=manifest.releases.find(release=>release.version==='v65');
assert.ok(v65,'v65 shopping release notes must remain in history after later releases');
assert.ok(v65.items.some(item=>/lista de compras/i.test(item)));
assert.ok(v65.items.some(item=>/por comprar/i.test(item)));
assert.ok(v65.items.some(item=>/filtro/i.test(item)));
assert.ok(v65.items.some(item=>/comprados/i.test(item)));

assert.ok(sw.includes("'./market-shopping-focus.css'"));
assert.ok(sw.includes("'./market-shopping-focus.js'"));
assert.match(sw,/v65-shopping1/);
assert.match(sw,/v66-shell1/);
assert.match(sw,/v73-menu8/);
assert.match(prepare,/const BUILD = 'v73'/);
assert.match(prepare,/const SHOPPING_REV = '65-shopping1'/);
assert.match(prepare,/const SHELL_REV = '66-shell1'/);
assert.match(prepare,/const MENU_REV = '73-menu8'/);
assert.ok(prepare.includes("'market-shopping-focus.css'"));
assert.ok(prepare.includes("'market-shopping-focus.js'"));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/v64-runtime\.css\?v=66-shell1/);
  assert.match(index,/market-shopping-focus\.css\?v=65-shopping1/);
  assert.match(index,/market-shopping-focus\.js\?v=65-shopping1/);
  assert.match(index,/mobile-menu-toggle\.css\?v=73-menu8/);
  assert.match(index,/mobile-menu-toggle\.js\?v=73-menu8/);
  assert.ok(index.indexOf('v64-runtime.css')<index.indexOf('market-shopping-focus.css'),'shopping focus CSS must remain after the v66 shell fix');
  assert.ok(index.indexOf('market-shopping-focus.css')<index.indexOf('mobile-menu-toggle.css'),'v73 global navigation CSS may load after the preserved v65 market-specific layer');
  assert.ok(index.indexOf('market-category-groups.js')<index.indexOf('market-shopping-focus.js'),'shopping focus must run after category grouping');
  assert.ok(index.indexOf('market-shopping-focus.js')<index.indexOf('mobile-menu-toggle.js'),'v73 menu controller must run after the preserved v65 shopping layer');
  assert.ok(fs.existsSync(path.join(dist,'market-shopping-focus.css')));
  assert.ok(fs.existsSync(path.join(dist,'market-shopping-focus.js')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('v65 mobile shopping focus preserved under the v73 navigation release: OK');
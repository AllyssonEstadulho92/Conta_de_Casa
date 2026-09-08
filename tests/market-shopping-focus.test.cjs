'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const js=read('market-shopping-focus.js');
const css=read('market-shopping-focus.css');
const brand=read('market-brand.css');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');
const manifest=JSON.parse(read('release-manifest.json'));

new Function(js);
assert.match(js,/Adicionar produto à lista de compras/);
assert.match(js,/newMarketBtn/,'header + must reuse the existing market add action');
assert.match(js,/stopImmediatePropagation\(\)/);
assert.match(js,/market-compact-summary/);
assert.match(js,/Resumo financeiro/);
assert.match(js,/market-purchased-group/);
assert.match(js,/group\.open=false/);
assert.match(js,/group\.open=true/);
assert.match(js,/market-item-details/);
assert.match(js,/marketClearFilters/);
assert.doesNotMatch(js,/saveState|commit\(|estimatedCents\s*=|actualCents\s*=|quantity\s*=/,'shopping focus layer must not mutate financial state');

assert.match(css,/Conta de Casa v74/);
assert.match(css,/@media\(max-width:820px\)/);
assert.match(css,/#page-market #marketSummary\{display:none!important\}/);
assert.match(css,/#page-market \.market-new-btn\{display:none!important\}/);
assert.match(css,/\.market-filter-clear\[hidden\]\{display:none!important\}/);
assert.match(css,/\.market-mobile-quick-price/);
assert.match(css,/grid-template-columns:38px 54px minmax\(0,1fr\) auto!important/,'v74 cards must reserve space for a verified product photo');
assert.match(css,/\.market-item-details>summary/);
assert.match(css,/min-height:44px/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(brand,/\.market-product-photo[\s\S]*display:grid!important/);

assert.equal(manifest.latestVersion,'v74');
const v65=manifest.releases.find(release=>release.version==='v65');
assert.ok(v65,'v65 shopping behavior must remain documented after v74');
assert.ok(v65.items.some(item=>/Lista de compras/i));
assert.ok(v65.items.some(item=>/por comprar/i));
assert.ok(v65.items.some(item=>/comprados/i));

assert.ok(sw.includes("'./market-shopping-focus.css'"));
assert.ok(sw.includes("'./market-shopping-focus.js'"));
assert.match(sw,/v74-shopping2/);
assert.match(sw,/v73-menu8/);
assert.match(sw,/v74-experience1/);
assert.match(prepare,/const BUILD = 'v74'/);
assert.match(prepare,/const SHOPPING_REV = '74-shopping2'/);
assert.match(prepare,/const MENU_REV = '73-menu8'/);
assert.match(prepare,/const EXPERIENCE_REV = '74-experience1'/);
assert.ok(prepare.includes("'market-shopping-focus.css'"));
assert.ok(prepare.includes("'market-shopping-focus.js'"));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.doesNotMatch(index,/v64-runtime\.css/);
  assert.match(index,/market-shopping-focus\.css\?v=74-shopping2/);
  assert.match(index,/market-shopping-focus\.js\?v=74-shopping2/);
  assert.match(index,/mobile-menu-toggle\.css\?v=73-menu8/);
  assert.match(index,/mobile-menu-toggle\.js\?v=73-menu8/);
  assert.match(index,/v74-experience\.js\?v=74-experience1/);
  assert.ok(index.indexOf('market-shopping-focus.css')<index.indexOf('mobile-menu-toggle.css'));
  assert.ok(index.indexOf('market-category-groups.js')<index.indexOf('market-shopping-focus.js'));
  assert.ok(index.indexOf('market-shopping-focus.js')<index.indexOf('mobile-menu-toggle.js'));
  assert.ok(index.indexOf('mobile-menu-toggle.js')<index.indexOf('v74-experience.js'));
  assert.ok(fs.existsSync(path.join(dist,'market-shopping-focus.css')));
  assert.ok(fs.existsSync(path.join(dist,'market-shopping-focus.js')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Mobile shopping focus preserved and adapted to the v74 prototype: OK');

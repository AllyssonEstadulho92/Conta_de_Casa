'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');

const js=read('v75-market-flow.js');
const css=read('v75-market-flow.css');
const market=read('market-experience.js');
const render=read('render.js');
const shopping=read('market-shopping-focus.js');
const catalog=read('market-visual-catalog.js');
const photoLoader=read('market-photo-loader.css');
const indexSource=read('index.html');
const prepare=read('scripts/prepare-pages.cjs');
const sw=read('sw.js');

new Function(js);
assert.match(js,/REVISION='75-market1'/);
assert.match(js,/Pesquisar na minha lista…/);
assert.match(js,/Pesquisar na minha lista de compras/);
assert.match(js,/Preço por confirmar/);
assert.match(js,/Estimativa provisória/);
assert.match(js,/Confirmar preço pago \/ unidade/);
assert.match(js,/card\.insertBefore\(real,details\)/,'the existing real-price field must be promoted, not reimplemented');
assert.match(js,/has-missing-real/);
assert.match(js,/if\(hasMissing&&!group\.open\)group\.open=true/,'purchased items missing real price must not stay hidden in a collapsed group');
assert.match(js,/Preço encontrado = estimativa/);
assert.match(js,/Preço pesquisado/);
assert.match(js,/market-flow-add-label/);
assert.match(js,/CDCAssetLoader\?\.prepareImage/,'generic asset loader may be reused only for live-browser images');
assert.match(js,/market-visual-product-card/);
assert.match(js,/aria-busy/);
assert.doesNotMatch(js,/\bcommit\s*\(|\bsaveState\s*\(|estimatedCents\s*=|actualCents\s*=|quantity\s*=|appState\.market\.push/,'75-market1 must stay presentation-only');
assert.doesNotMatch(js,/market-barcode|ZXing|BarcodeDetector|data-market-scan/i,'75-market1 must not alter scanner behavior');

assert.match(css,/Mercado 75-market1/);
assert.match(css,/76-market-canonical-flow1/,'Mercado must declare the canonical v76 presentation path');
assert.match(css,/76-market-search-single-surface1/,'Mercado search must declare a single-surface visual contract');
assert.match(css,/grid-template-columns:64px minmax\(0,1fr\) auto!important/,'live search card must explicitly allocate photo, content and action columns');
assert.match(css,/\.market-filter-field>span[\s\S]*position:static!important/,'mobile filter labels must be visible');
assert.match(css,/#page-market>#marketList\{[\s\S]*display:block!important[\s\S]*visibility:visible!important/,'canonical market results must cancel any legacy display:none');
assert.match(css,/#page-market>#marketSummary\{[\s\S]*display:grid!important/,'canonical market summary must remain mounted');
assert.match(css,/#page-market>\.market-results-head\{[\s\S]*display:flex!important[\s\S]*justify-content:space-between!important/,'title and result count must be separate, aligned elements');
assert.match(css,/#marketResultCount\{[\s\S]*white-space:nowrap!important/,'result count must not visually concatenate with Lista do mês');
assert.match(css,/76-market-search-single-surface1[\s\S]*#page-market>\.market-command-bar\{[\s\S]*padding:0!important;[\s\S]*border:0!important;[\s\S]*border-radius:0!important;[\s\S]*background:transparent!important;[\s\S]*box-shadow:none!important/,'outer search command bar must not draw a second rounded surface');
assert.match(css,/76-market-search-single-surface1[\s\S]*\.market-search-wrap\{[\s\S]*border:0!important;[\s\S]*background:transparent!important;[\s\S]*box-shadow:none!important/,'search wrapper must remain visually transparent around the actual input');
assert.match(css,/@media\(max-width:820px\)[\s\S]*#page-market>\.market-filter-grid\{[\s\S]*display:flex!important[\s\S]*overflow-x:auto!important/,'mobile Mercado filters must use one horizontal disclosure strip');
assert.match(css,/scroll-snap-type:x proximity/);
assert.match(css,/\.market-filter-field\{[\s\S]*flex:0 0 164px!important/,'mobile filter controls must keep a stable readable width');
assert.match(css,/\.market-filter-clear\{[\s\S]*min-height:48px!important/,'clear action must preserve a touch target');
assert.match(css,/\.market-price-confirmation/);
assert.match(css,/content:attr\(data-market-value-label\)/);
assert.match(css,/data-cdc-asset-frame="market-browser-image"/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/forced-colors:active/);

for(const canonical of ['marketSearch','newMarketBtn','marketStatusFilter','marketCategoryFilter','marketSort','marketClearFilters','marketSummary','marketResultCount','marketList']){
  assert.match(indexSource,new RegExp(`id="${canonical}"`),`canonical Mercado control missing: ${canonical}`);
}

assert.match(market,/estimatedCents:product\.priceCents,actualCents:0,purchased:false/,'searched price must remain an estimate until a real price is confirmed');
assert.match(render,/if\(!item\.purchased\) return '<span class="status-chip pending">Por comprar<\/span>'/);
assert.match(render,/Falta preço real/);
assert.match(render,/Preço real \/ unidade/);
assert.match(render,/resultCount\.textContent=`\$\{list\.length\} de \$\{all\.length\} item/,'result count remains data-only and separate from the Lista do mês title');
assert.match(shopping,/market-item-details/,'75-market1 is layered over the existing mobile disclosure instead of replacing it');
assert.match(catalog,/key:`\$\{marketId\}\|\$\{pid\}`/,'catalog identity must remain marketId|pid');
assert.match(catalog,/if\(id&&found!==id\)return ''/,'official retailer URL must continue to match the expected PID');
assert.match(photoLoader,/75-photo-loader3/,'specialized Mercado photo loader must remain in place');
assert.match(photoLoader,/market-photo-unavailable/);

assert.match(prepare,/const MARKET_FLOW_REV = '75-market1'/);
assert.ok(prepare.includes("'v75-market-flow.css'"));
assert.ok(prepare.includes("'v75-market-flow.js'"));
assert.match(prepare,/v75-market-flow\.css\?v=\$\{MARKET_FLOW_REV\}/);
assert.match(prepare,/v75-market-flow\.js\?v=\$\{MARKET_FLOW_REV\}/);
assert.ok(sw.includes("'./v75-market-flow.css'"));
assert.ok(sw.includes("'./v75-market-flow.js'"));
assert.match(sw,/assets1-market1/,'market1 must remain in the cache lineage');
assert.match(sw,/canonical-expense-market1/,'PWA must invalidate for canonical Despesas/Mercado presentation');
assert.match(sw,/single-search-surface1/,'PWA must invalidate the duplicate-search-surface cache');

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/v75-market-flow\.css\?v=75-market1/);
  assert.match(index,/v75-market-flow\.js\?v=75-market1/);
  assert.ok(index.indexOf('market-photo-loader.css')<index.indexOf('v75-market-flow.css'));
  assert.ok(index.indexOf('v75-market-flow.css')<index.indexOf('v75-usability.css'));
  for(const asset of ['v75-market-flow.css','v75-market-flow.js'])assert.ok(fs.existsSync(path.join(dist,asset)));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('v76 canonical Mercado flow, single-surface search, compact mobile filters and accounting isolation: OK');

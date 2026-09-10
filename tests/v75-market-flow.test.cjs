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
assert.match(css,/grid-template-columns:64px minmax\(0,1fr\) auto!important/,'live search card must explicitly allocate photo, content and action columns');
assert.match(css,/\.market-filter-field>span[\s\S]*position:static!important/,'mobile filter labels must be visible');
assert.match(css,/\.market-price-confirmation/);
assert.match(css,/content:attr\(data-market-value-label\)/);
assert.match(css,/data-cdc-asset-frame="market-browser-image"/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/forced-colors:active/);

assert.match(market,/estimatedCents:product\.priceCents,actualCents:0,purchased:false/,'searched price must remain an estimate until a real price is confirmed');
assert.match(render,/if\(!item\.purchased\) return '<span class="status-chip pending">Por comprar<\/span>'/);
assert.match(render,/Falta preço real/);
assert.match(render,/Preço real \/ unidade/);
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
assert.match(sw,/assets1-market1/,'market1 must be appended to the cache revision without breaking earlier revision sequences');

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/v75-market-flow\.css\?v=75-market1/);
  assert.match(index,/v75-market-flow\.js\?v=75-market1/);
  assert.ok(index.indexOf('market-photo-loader.css')<index.indexOf('v75-market-flow.css'));
  assert.ok(index.indexOf('v75-market-flow.css')<index.indexOf('v75-usability.css'));
  assert.ok(index.indexOf('v75-market-featured.js')<index.indexOf('v75-market-flow.js'));
  for(const asset of ['v75-market-flow.css','v75-market-flow.js'])assert.ok(fs.existsSync(path.join(dist,asset)));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('v75 Mercado flow, accounting isolation and asset-loading integration: OK');

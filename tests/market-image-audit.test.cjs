'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const js=read('market-image-audit.js');
const css=read('market-image-audit.css');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');

assert.match(js,/auditoria de catálogo e imagens de produto \(v60\)/);
assert.match(js,/world\.openfoodfacts\.org/);
assert.match(js,/world\.openbeautyfacts\.org/);
assert.match(js,/world\.openproductsfacts\.org/);
assert.match(js,/world\.openpetfoodfacts\.org/);
assert.match(js,/JINA_READER_ORIGIN='https:\/\/r\.jina\.ai'/);
assert.match(js,/safeRetailerProductUrl/);
assert.match(js,/safeRetailerImageUrl/);
assert.match(js,/Sites-col-master-catalog/);
assert.match(js,/Sites-pingo-doce-master/);
assert.match(js,/matchedBy:'retailer'/,'official retailer image must have a first-class exact resolution path');
assert.match(js,/matchedBy:'code'/,'barcode/EAN fallback must remain available');
assert.match(js,/candidateScore/);
assert.match(js,/MIN_MATCH_SCORE=\.74/,'Open Facts text matching must keep a confidence threshold');
assert.match(js,/MAX_CONCURRENT_RESOLUTIONS=3/,'image auditing must cap concurrent resolutions');
assert.match(js,/MAX_CATALOG_RESULTS=40/);
assert.match(js,/limit:20/,'v60 must request a broader catalogue from the live source');
assert.match(js,/X-With-Images-Summary/);
assert.match(js,/X-Retain-Images/);
assert.match(js,/IntersectionObserver/,'official image lookup must be lazy/near-viewport');
assert.match(js,/credentials:'omit'/);
assert.match(js,/referrerPolicy:'no-referrer'/);
assert.doesNotMatch(js,/microlink|allorigins|corsproxy/i,'v60 must not use generic scraping proxies or the rejected Microlink fallback');
assert.doesNotMatch(js,/Authorization|api[_-]?key/i,'image audit must not embed credentials');
assert.match(js,/data-market-image-open/);
assert.match(js,/showModal\(\)/);
assert.match(js,/marketProductImageViewer/);
assert.match(js,/schedulePersist/,'resolved images for saved items should be persisted');
assert.match(js,/item\.imageUrl=result\.imageUrl/);
assert.match(js,/stopImmediatePropagation/,'add action must wait for the official image handoff when possible');
assert.match(js,/searchCestaProducts=searchCatalogV60/,'existing Mercado search contract must be extended without restructuring events');

assert.match(css,/market-product-photo-button/);
assert.match(css,/cursor:zoom-in/);
assert.match(css,/market-product-image-viewer/);
assert.match(css,/100dvh/);
assert.match(css,/safe-area-inset-top/);
assert.match(css,/safe-area-inset-bottom/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/:focus-visible/);

const documentStub={
  readyState:'loading',
  addEventListener(){},
  querySelector(){return null;},
  querySelectorAll(){return [];},
  body:null
};
const sandbox={
  console,
  URL,
  AbortController,
  setTimeout,
  clearTimeout,
  Promise,
  document:documentStub,
  requestAnimationFrame:fn=>fn(),
  fetch:async()=>{throw new Error('network-disabled-in-test');}
};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(js,sandbox,{filename:'market-image-audit.js'});
assert.ok(sandbox.CDCMarketImages,'public market image audit API must be installed');

const continenteProduct='https://www.continente.pt/produto/compressas-gaze-20-x-20-cm-continente-8167440.html';
const continenteImage='https://www.continente.pt/dw/image/v2/BDVS_PRD/on/demandware.static/-/Sites-col-master-catalog/default/dwa5dd802e/images/col/816/8167440-frente.jpg?sw=2000&sh=2000';
const pingoProduct='https://www.pingodoce.pt/home/produtos/mercearia/arroz-massa-e-leguminosas/arroz/arroz-carolino-cigala-739490.html';
const pingoImage='https://static.pingodoce.pt/dw/image/v2/BLJJ_PRD/on/demandware.static/-/Sites-pingo-doce-master/default/dw8cff88d2/images/large/739490_93c013c8bbf2545978b1e875cb8563de.jpg';
assert.equal(sandbox.CDCMarketImages.safeRetailerProductUrl(continenteProduct),continenteProduct);
assert.equal(sandbox.CDCMarketImages.safeRetailerProductUrl(pingoProduct),pingoProduct);
assert.equal(sandbox.CDCMarketImages.safeRetailerProductUrl('https://evil.example/produto/teste-8167440.html'),'');
assert.equal(sandbox.CDCMarketImages.safeRetailerImageUrl(continenteImage,'continente','8167440'),continenteImage);
assert.equal(sandbox.CDCMarketImages.safeRetailerImageUrl(continenteImage,'continente','9999999'),'');
assert.equal(sandbox.CDCMarketImages.safeRetailerImageUrl(pingoImage,'pingo-doce','739490'),pingoImage);
assert.equal(sandbox.CDCMarketImages.safeRetailerImageUrl(pingoImage,'pingo-doce','123456'),'');
assert.equal(sandbox.CDCMarketImages.safeImageUrl(continenteImage),continenteImage);
assert.equal(sandbox.CDCMarketImages.safeImageUrl(pingoImage),pingoImage);
assert.equal(
  sandbox.CDCMarketImages.safeImageUrl('https://images.openfoodfacts.org/images/products/123/front.jpg'),
  'https://images.openfoodfacts.org/images/products/123/front.jpg'
);
assert.equal(
  sandbox.CDCMarketImages.safeImageUrl('https://world.openbeautyfacts.org/images/products/123/front.jpg'),
  'https://world.openbeautyfacts.org/images/products/123/front.jpg'
);
assert.equal(sandbox.CDCMarketImages.safeImageUrl('https://example.com/images/products/123/front.jpg'),'');
assert.equal(sandbox.CDCMarketImages.safeImageUrl('http://static.pingodoce.pt/images/large/739490_test.jpg'),'');

assert.match(sw,/conta-de-casa-public-v60-retailer-images/);
for(const asset of ['market-image-audit.css','market-image-audit.js']){
  assert.ok(sw.includes(`'./${asset}'`),`${asset} must be in the offline cache allowlist`);
  assert.ok(prepare.includes(`'${asset}'`),`${asset} must be in the Pages bundle allowlist`);
}
assert.match(prepare,/const BUILD = 'v60'/);

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/market-image-audit\.css\?v=60/);
  assert.match(index,/market-image-audit\.js\?v=60/);
  assert.match(index,/https:\/\/www\.continente\.pt/);
  assert.match(index,/https:\/\/static\.pingodoce\.pt/);
  assert.match(index,/https:\/\/r\.jina\.ai/);
  assert.match(index,/https:\/\/\*\.openbeautyfacts\.org/);
  assert.match(index,/https:\/\/world\.openproductsfacts\.org/);
  assert.ok(fs.existsSync(path.join(dist,'market-image-audit.css')));
  assert.ok(fs.existsSync(path.join(dist,'market-image-audit.js')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Market official retailer image, fallback, safe-source and zoom tests: OK');

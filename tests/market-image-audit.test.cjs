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

assert.match(js,/auditoria dinâmica de imagens de produto/);
assert.match(js,/world\.openfoodfacts\.org/);
assert.match(js,/world\.openbeautyfacts\.org/);
assert.match(js,/world\.openproductsfacts\.org/);
assert.match(js,/world\.openpetfoodfacts\.org/);
assert.match(js,/matchedBy:'code'/,'barcode/EAN must have an exact-resolution path');
assert.match(js,/candidateScore/);
assert.match(js,/MIN_MATCH_SCORE=\.74/,'text matching must keep a minimum confidence threshold');
assert.match(js,/MAX_CONCURRENT_RESOLUTIONS=3/,'image auditing must cap concurrent product resolutions');
assert.match(js,/credentials:'omit'/);
assert.match(js,/referrerPolicy:'no-referrer'/);
assert.doesNotMatch(js,/microlink|jina|allorigins|corsproxy/i,'image audit must not introduce a generic page proxy');
assert.doesNotMatch(js,/Authorization|api[_-]?key/i,'image audit must not embed credentials');
assert.match(js,/data-market-image-open/);
assert.match(js,/showModal\(\)/);
assert.match(js,/marketProductImageViewer/);
assert.match(js,/schedulePersist/,'resolved images for saved items should be persisted');
assert.match(js,/item\.imageUrl=result\.imageUrl/);

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
assert.equal(
  sandbox.CDCMarketImages.safeImageUrl('https://images.openfoodfacts.org/images/products/123/front.jpg'),
  'https://images.openfoodfacts.org/images/products/123/front.jpg'
);
assert.equal(
  sandbox.CDCMarketImages.safeImageUrl('https://world.openbeautyfacts.org/images/products/123/front.jpg'),
  'https://world.openbeautyfacts.org/images/products/123/front.jpg'
);
assert.equal(
  sandbox.CDCMarketImages.safeImageUrl('https://images.openproductsfacts.org/images/products/123/front.jpg'),
  'https://images.openproductsfacts.org/images/products/123/front.jpg'
);
assert.equal(sandbox.CDCMarketImages.safeImageUrl('https://example.com/images/products/123/front.jpg'),'');
assert.equal(sandbox.CDCMarketImages.safeImageUrl('http://images.openfoodfacts.org/images/products/123/front.jpg'),'');

assert.match(sw,/conta-de-casa-public-v59-product-images/);
for(const asset of ['market-image-audit.css','market-image-audit.js']){
  assert.ok(sw.includes(`'./${asset}'`),`${asset} must be in the offline cache allowlist`);
  assert.ok(prepare.includes(`'${asset}'`),`${asset} must be in the Pages bundle allowlist`);
}
assert.match(prepare,/const BUILD = 'v59'/);

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/market-image-audit\.css\?v=59/);
  assert.match(index,/market-image-audit\.js\?v=59/);
  assert.match(index,/https:\/\/\*\.openbeautyfacts\.org/);
  assert.match(index,/https:\/\/\*\.openproductsfacts\.org/);
  assert.match(index,/https:\/\/\*\.openpetfoodfacts\.org/);
  assert.match(index,/https:\/\/world\.openbeautyfacts\.org/);
  assert.match(index,/https:\/\/world\.openproductsfacts\.org/);
  assert.match(index,/https:\/\/world\.openpetfoodfacts\.org/);
  assert.ok(fs.existsSync(path.join(dist,'market-image-audit.css')));
  assert.ok(fs.existsSync(path.join(dist,'market-image-audit.js')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Market product image audit, safe-source and zoom tests: OK');

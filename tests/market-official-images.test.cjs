'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const refresh=read('scripts/refresh-retailer-image-index.cjs');
const runtime=read('market-official-images.js');
const prepare=read('scripts/prepare-pages.cjs');
const sw=read('sw.js');

assert.match(refresh,/https:\/\/www\.continente\.pt\/sitemap_index\.xml/);
assert.match(refresh,/sitemap-custom_sitemap_\\d\+-image/);
assert.match(refresh,/https:\/\/www\.pingodoce\.pt\/home\/sitemap_index\.xml/);
assert.match(refresh,/sitemap_\\d\+-product/);
assert.match(refresh,/8167440/);
assert.match(refresh,/739490/);
assert.match(refresh,/MIN_EXPECTED_PRODUCTS=5000/);
assert.match(refresh,/names/,'the build must generate exact-name shards for old saved items');
assert.doesNotMatch(refresh,/microlink|allorigins|jina\.ai|corsproxy|apify/i);

const indexPath=path.join(ROOT,'retailer-images','index.json');
assert.ok(fs.existsSync(indexPath),'CI must refresh the official retailer index before tests');
const meta=JSON.parse(fs.readFileSync(indexPath,'utf8'));
assert.equal(meta.version,1);
assert.ok(meta.retailers?.continente?.count>=5000,'Continente official index is unexpectedly small');
assert.ok(meta.retailers?.['pingo-doce']?.count>=5000,'Pingo Doce official index is unexpectedly small');
assert.ok(meta.retailers?.continente?.uniqueNames>1000);
assert.ok(meta.retailers?.['pingo-doce']?.uniqueNames>1000);

const continente81=JSON.parse(read('retailer-images/continente/81.json'));
const pingo73=JSON.parse(read('retailer-images/pingo-doce/73.json'));
assert.match(continente81.p['8167440'],/^https:\/\/www\.continente\.pt\/dw\/image\/v2\/BDVS_PRD\//);
assert.match(continente81.p['8167440'],/Sites-col-master-catalog/);
assert.match(pingo73.p['739490'],/^https:\/\/static\.pingodoce\.pt\/dw\/image\/v2\/BLJJ_PRD\//);
assert.match(pingo73.p['739490'],/Sites-pingo-doce-master/);

assert.match(runtime,/INDEX_BASE='\.\/retailer-images'/);
assert.match(runtime,/credentials:'same-origin'/);
assert.match(runtime,/officialImageFor/);
assert.match(runtime,/officialImageByExactName/);
assert.match(runtime,/matches\.length===1/,'ambiguous names must not be guessed');
assert.match(runtime,/www\.continente\.pt/);
assert.match(runtime,/static\.pingodoce\.pt/);
assert.match(runtime,/data-market-official-image-open/);
assert.match(runtime,/Imagem oficial do produto/);
assert.match(runtime,/safeCombinedProductImageUrl/);
assert.doesNotMatch(runtime,/fetch\(['"]https:\/\/(?:www\.)?(?:continente|pingodoce)\.pt/,'runtime must not scrape retailer HTML');
assert.doesNotMatch(runtime,/microlink|allorigins|jina\.ai|corsproxy|apify/i);

assert.match(prepare,/const BUILD = 'v60'/);
assert.match(prepare,/refresh-retailer-image-index\.cjs/);
assert.match(prepare,/market-official-images\.js/);
assert.match(prepare,/fs\.cpSync\(RETAILER_IMAGE_DIR/);
assert.match(sw,/conta-de-casa-public-v60-official-retailer-images/);
assert.match(sw,/RETAILER_IMAGE_INDEX_RE/);
assert.match(sw,/market-official-images\.js/);

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(html,/app-build" content="v60"/);
  assert.match(html,/market-official-images\.js\?v=60/);
  assert.match(html,/img-src[^;]*https:\/\/www\.continente\.pt[^;]*https:\/\/static\.pingodoce\.pt/);
  const connect=html.match(/connect-src[^;]+;/)?.[0]||'';
  assert.doesNotMatch(connect,/continente\.pt|pingodoce\.pt/,'retailer HTML/API hosts are not runtime connect sources');
  assert.ok(fs.existsSync(path.join(dist,'retailer-images','continente','81.json')));
  assert.ok(fs.existsSync(path.join(dist,'retailer-images','pingo-doce','73.json')));
  assert.ok(fs.existsSync(path.join(dist,'retailer-images','names','continente')));
  assert.ok(fs.existsSync(path.join(dist,'retailer-images','names','pingo-doce')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Official Continente/Pingo Doce product image index and runtime tests: OK');

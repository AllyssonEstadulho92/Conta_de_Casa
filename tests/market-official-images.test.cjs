'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const js=read('market-official-images.js');
const policy=read('market-retailer-image-policy.js');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');

assert.match(js,/bridge de imagens oficiais do Mercado \(v61\)/);
assert.match(js,/\[data-market-add-product\]/);
assert.match(js,/\.market-result-source/);
assert.match(js,/data-market-product-card/);
assert.match(js,/parseCardId/);
assert.match(js,/safeProductUrl/);
assert.match(js,/safeOfficialImageUrl/);
assert.match(js,/Sites-col-master-catalog/);
assert.match(js,/Sites-pingo-doce-master/);
assert.match(js,/Ver no \$\{label\}/);
assert.match(js,/headers:\{Accept:'application\/json'\}/);
assert.doesNotMatch(js,/headers:\{[^}]*['"]X-(?:With-Images-Summary|Retain-Images)/);
assert.match(js,/credentials:'omit'/);
assert.match(js,/referrerPolicy:'no-referrer'/);
assert.match(js,/MAX_CONCURRENT=3/);
assert.match(js,/canLoadImage/);
assert.match(js,/persistResolvedItem/);
assert.match(js,/imageSource=result\.source/);
assert.match(js,/saveState/);
assert.doesNotMatch(js,/Authorization|api[_-]?key/i);
assert.doesNotMatch(js,/microlink|allorigins|corsproxy/i);

assert.match(policy,/marketRetailerImagePolicy='official-only'/);
assert.match(policy,/CDCOfficialMarketImages\?\.safeOfficialImageUrl/);
assert.match(policy,/photo\.replaceWith\(emptyPhoto\(\)\)/);

const documentStub={readyState:'loading',addEventListener(){},querySelector(){return null;},querySelectorAll(){return [];},body:null};
const sandbox={console,URL,AbortController,setTimeout,clearTimeout,Promise,document:documentStub,requestAnimationFrame:fn=>fn(),fetch:async()=>{throw new Error('network-disabled-in-test');}};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(js,sandbox,{filename:'market-official-images.js'});
assert.ok(sandbox.CDCOfficialMarketImages,'official-image bridge API must be installed');

assert.deepEqual(JSON.parse(JSON.stringify(sandbox.CDCOfficialMarketImages.parseCardId('cesta-pingo-doce-739490'))),{marketId:'pingo-doce',pid:'739490'});
assert.deepEqual(JSON.parse(JSON.stringify(sandbox.CDCOfficialMarketImages.parseCardId('cesta-continente-8167440'))),{marketId:'continente',pid:'8167440'});
assert.equal(sandbox.CDCOfficialMarketImages.parseCardId('other-739490'),null);

const continenteProduct='https://www.continente.pt/produto/compressas-gaze-20-x-20-cm-continente-8167440.html';
const continenteImage='https://www.continente.pt/dw/image/v2/BDVS_PRD/on/demandware.static/-/Sites-col-master-catalog/default/dwa5dd802e/images/col/816/8167440-frente.jpg?sw=2000&sh=2000';
const pingoProduct='https://www.pingodoce.pt/home/produtos/mercearia/arroz-massa-e-leguminosas/arroz/arroz-carolino-cigala-739490.html';
const pingoImage='https://static.pingodoce.pt/dw/image/v2/BLJJ_PRD/on/demandware.static/-/Sites-pingo-doce-master/default/dw8cff88d2/images/large/739490_93c013c8bbf2545978b1e875cb8563de.jpg';

assert.equal(sandbox.CDCOfficialMarketImages.safeProductUrl(continenteProduct,'continente','8167440'),continenteProduct);
assert.equal(sandbox.CDCOfficialMarketImages.safeProductUrl(pingoProduct,'pingo-doce','739490'),pingoProduct);
assert.equal(sandbox.CDCOfficialMarketImages.safeProductUrl(pingoProduct,'pingo-doce','111111'),'');
assert.equal(sandbox.CDCOfficialMarketImages.safeProductUrl('https://evil.example/produto/x-8167440.html','continente','8167440'),'');
assert.equal(sandbox.CDCOfficialMarketImages.safeOfficialImageUrl(continenteImage,'continente','8167440'),continenteImage);
assert.equal(sandbox.CDCOfficialMarketImages.safeOfficialImageUrl(continenteImage,'continente','999999'),'');
assert.equal(sandbox.CDCOfficialMarketImages.safeOfficialImageUrl(pingoImage,'pingo-doce','739490'),pingoImage);
assert.equal(sandbox.CDCOfficialMarketImages.safeOfficialImageUrl(pingoImage,'pingo-doce','123456'),'');

const catalogue=[
  '- Pingo Doce · Arroz Carolino Cigala · 1 Kg · 1,49€ · pid 739490',pingoProduct,
  '- Continente · Compressas Gaze · 20 Un · 2,99€ · pid 8167440',continenteProduct
].join('\n');
const parsed=JSON.parse(JSON.stringify(sandbox.CDCOfficialMarketImages.parseCatalogRecords(catalogue)));
assert.equal(parsed.length,2);
assert.equal(parsed[0].pid,'739490');
assert.equal(parsed[0].sourceUrl,pingoProduct);
assert.equal(parsed[1].pid,'8167440');
assert.equal(parsed[1].sourceUrl,continenteProduct);

assert.match(sw,/conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2/);
for(const asset of ['./market-retailer-image-policy.js','./market-official-images.js','./v64-runtime.js','./market-shopping-focus.js','./mobile-menu-toggle.js','./v74-experience.css','./v74-experience.js','./v75-architecture.css','./v75-architecture.js'])assert.ok(sw.includes(`'${asset}'`));
assert.ok(!sw.includes("'./v64-runtime.css'"));
assert.match(prepare,/const BUILD = 'v75'/);
assert.match(prepare,/const RUNTIME_REV = '64-runtime1'/);
assert.match(prepare,/const SHOPPING_REV = '74-shopping2'/);
assert.match(prepare,/const MENU_REV = '73-menu8'/);
assert.match(prepare,/const EXPERIENCE_REV = '74-experience2'/);
assert.match(prepare,/const ARCHITECTURE_REV = '75-architecture2'/);

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/market-retailer-image-policy\.js\?v=75/);
  assert.match(index,/market-official-images\.js\?v=75/);
  assert.doesNotMatch(index,/v64-runtime\.css/);
  assert.match(index,/v64-runtime\.js\?v=64-runtime1/);
  assert.match(index,/market-shopping-focus\.js\?v=74-shopping2/);
  assert.match(index,/mobile-menu-toggle\.js\?v=73-menu8/);
  assert.match(index,/v74-experience\.css\?v=74-experience2/);
  assert.match(index,/v74-experience\.js\?v=74-experience2/);
  assert.match(index,/v75-architecture\.css\?v=75-architecture2/);
  assert.match(index,/v75-architecture\.js\?v=75-architecture2/);
  assert.ok(index.indexOf('market-retailer-image-policy.js')<index.indexOf('market-image-audit.js'));
  assert.ok(index.indexOf('market-official-images.js')<index.indexOf('v64-runtime.js'));
  assert.ok(index.indexOf('v64-runtime.js')<index.indexOf('market-shopping-focus.js'));
  assert.ok(index.indexOf('market-shopping-focus.js')<index.indexOf('mobile-menu-toggle.js'));
  assert.ok(index.indexOf('mobile-menu-toggle.js')<index.indexOf('v74-experience.js'));
  assert.ok(index.indexOf('v74-experience.js')<index.indexOf('v75-architecture.js'));
  for(const asset of ['market-retailer-image-policy.js','market-official-images.js','v64-runtime.js','market-shopping-focus.js','mobile-menu-toggle.js','v74-experience.css','v74-experience.js','v75-architecture.css','v75-architecture.js'])assert.ok(fs.existsSync(path.join(dist,asset)));
  assert.ok(!fs.existsSync(path.join(dist,'v64-runtime.css')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Market official-image bridge remains safe under the final v75 prototype architecture: OK');

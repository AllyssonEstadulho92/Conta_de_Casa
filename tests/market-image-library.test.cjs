'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const library=read('market-image-library.js');
const prepare=read('scripts/prepare-pages.cjs');
const sw=read('sw.js');

assert.match(library,/75-image-library1/);
assert.match(library,/conta-de-casa-market-image-library/);
assert.match(library,/indexedDB/);
assert.match(library,/45\*24\*60\*60\*1000/);
assert.match(library,/Sites-col-master-catalog/);
assert.match(library,/Sites-pingo-doce-master/);
assert.match(library,/marketImageLibrary='hit'/);
assert.match(library,/marketImageLibrary='stored'/);
assert.match(library,/MutationObserver/);
assert.match(library,/attributeFilter:\['src'\]/);
assert.doesNotMatch(library,/\bappState\b/);
assert.doesNotMatch(library,/\bsaveState\b/);
assert.doesNotMatch(library,/\bcommit\s*\(/);
assert.doesNotMatch(library,/Authorization|api[_-]?key|tokenGitHub/i);

const listeners={};
const sandbox={
  console,URL,Date,Map,Set,Promise,setTimeout,clearTimeout,
  addEventListener(type,fn){listeners[type]=fn;}
};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(library,sandbox,{filename:'market-image-library.js'});
assert.ok(sandbox.CDCMarketImageLibrary,'library API must be installed');
assert.equal(sandbox.CDCMarketImageLibrary.revision,'75-image-library1');

const continenteProduct='https://www.continente.pt/produto/compressas-gaze-20-x-20-cm-continente-8167440.html';
const continenteImage='https://www.continente.pt/dw/image/v2/BDVS_PRD/on/demandware.static/-/Sites-col-master-catalog/default/dwa5dd802e/images/col/816/8167440-frente.jpg?sw=2000&sh=2000';
const pingoProduct='https://www.pingodoce.pt/home/produtos/mercearia/arroz-massa-e-leguminosas/arroz/arroz-carolino-cigala-739490.html';
const pingoImage='https://static.pingodoce.pt/dw/image/v2/BLJJ_PRD/on/demandware.static/-/Sites-pingo-doce-master/default/dw8cff88d2/images/large/739490_93c013c8bbf2545978b1e875cb8563de.jpg';

assert.deepEqual(JSON.parse(JSON.stringify(sandbox.CDCMarketImageLibrary.identity({marketId:'continente',pid:'8167440'}))),{marketId:'continente',pid:'8167440',key:'continente|8167440'});
assert.equal(sandbox.CDCMarketImageLibrary.safeProductUrl(continenteProduct,'continente','8167440'),continenteProduct);
assert.equal(sandbox.CDCMarketImageLibrary.safeProductUrl(pingoProduct,'pingo-doce','739490'),pingoProduct);
assert.equal(sandbox.CDCMarketImageLibrary.safeProductUrl(pingoProduct,'pingo-doce','000000'),'');
assert.equal(sandbox.CDCMarketImageLibrary.safeOfficialImageUrl(continenteImage,'continente','8167440'),continenteImage);
assert.equal(sandbox.CDCMarketImageLibrary.safeOfficialImageUrl(continenteImage,'continente','111111'),'');
assert.equal(sandbox.CDCMarketImageLibrary.safeOfficialImageUrl(pingoImage,'pingo-doce','739490'),pingoImage);
assert.equal(sandbox.CDCMarketImageLibrary.safeOfficialImageUrl(pingoImage,'pingo-doce','111111'),'');

(async()=>{
  const stored=await sandbox.CDCMarketImageLibrary.remember({
    marketId:'continente',pid:'8167440',name:'Compressas Gaze',imageUrl:continenteImage,sourceUrl:continenteProduct
  });
  assert.ok(stored);
  const cached=await sandbox.CDCMarketImageLibrary.get({marketId:'continente',pid:'8167440'});
  assert.equal(cached.imageUrl,continenteImage);
  assert.equal(cached.sourceUrl,continenteProduct);
  assert.equal((await sandbox.CDCMarketImageLibrary.stats()).count,1);
  assert.equal(await sandbox.CDCMarketImageLibrary.forget({marketId:'continente',pid:'8167440'}),true);
  assert.equal(await sandbox.CDCMarketImageLibrary.get({marketId:'continente',pid:'8167440'}),null);

  assert.match(prepare,/const IMAGE_LIBRARY_REV = '75-image-library1'/);
  assert.match(prepare,/market-image-library\.js/);
  assert.match(sw,/featured1-image-library1/);
  assert.match(sw,/\.\/market-image-library\.js/);

  const dist=path.join(ROOT,'dist');
  try{
    execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
    const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
    assert.match(index,/market-image-library\.js\?v=75-image-library1/);
    assert.ok(index.indexOf('market-image-library.js')<index.indexOf('market-retailer-image-policy.js'));
    assert.ok(index.indexOf('market-image-library.js')<index.indexOf('market-official-images.js'));
    assert.ok(fs.existsSync(path.join(dist,'market-image-library.js')));
  }finally{
    fs.rmSync(dist,{recursive:true,force:true});
  }

  console.log('Persistent official market image library remains isolated, exact-SKU and distributable: OK');
})().catch(error=>{console.error(error);process.exitCode=1;});

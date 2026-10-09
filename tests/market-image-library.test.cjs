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
assert.match(sw,/const CACHE = 'conta-de-casa-public-v76-build';/,'PWA cache invalidation must follow deterministic build identity.');

assert.match(library,/76-pingo-url3/);
assert.match(library,/conta-de-casa-market-image-library/);
assert.match(library,/indexedDB/);
assert.match(library,/45\*24\*60\*60\*1000/);
assert.match(library,/Sites-col-master-catalog/);
assert.match(library,/Sites-pingo-doce-master/);
assert.match(library,/marketImageLibrary='hit'/);
assert.match(library,/marketImageLibrary='stored'/);
assert.match(library,/MutationObserver/);
assert.match(library,/marketProductName/,'persistent library must read product metadata from prototype cards');
assert.match(library,/marketProductUrl/,'persistent library must retain the exact retailer URL from prototype cards');
assert.match(library,/attributeFilter:\['src'\]/);
assert.match(library,/async function auditAll\(options=\{\}\)/,'image library must expose a full audit path');
assert.match(library,/async function listRecords\(options=\{\}\)/,'prototype library view must enumerate all stored records');
assert.match(library,/items:\[\]/,'audit report must expose per-photo status for the dedicated library view');
assert.match(library,/function probeImage\(/,'image library audit must support availability checks without fetch');
assert.match(library,/cdc:market-image-library-audit-progress/,'image audit must expose bounded UI progress');
assert.doesNotMatch(library,/\bfetch\s*\(/,'image-library validation must not add a second network fetch path');
assert.doesNotMatch(library,/\bappState\b/);
assert.doesNotMatch(library,/\bsaveState\b/);
assert.doesNotMatch(library,/\bcommit\s*\(/);
assert.doesNotMatch(library,/Authorization|api[_-]?key|tokenGitHub/i);

const listeners={};
const sandbox={console,URL,Date,Map,Set,Promise,setTimeout,clearTimeout,addEventListener(type,fn){listeners[type]=fn;}};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(library,sandbox,{filename:'market-image-library.js'});
assert.ok(sandbox.CDCMarketImageLibrary,'library API must be installed');
assert.equal(sandbox.CDCMarketImageLibrary.revision,'76-pingo-url3');

const continenteProduct='https://www.continente.pt/produto/compressas-gaze-20-x-20-cm-continente-8167440.html';
const continenteImage='https://www.continente.pt/dw/image/v2/BDVS_PRD/on/demandware.static/-/Sites-col-master-catalog/default/dwa5dd802e/images/col/816/8167440-frente.jpg?sw=2000&sh=2000';
const pingoProduct='https://www.pingodoce.pt/home/produtos/mercearia/arroz-massa-e-leguminosas/arroz/arroz-carolino-cigala-739490.html';
const pingoImage='https://static.pingodoce.pt/dw/image/v2/BLJJ_PRD/on/demandware.static/-/Sites-pingo-doce-master/default/dw8cff88d2/images/large/739490_93c013c8bbf2545978b1e875cb8563de.jpg';
const pingoCurrentImage='https://www.pingodoce.pt/dw/image/v2/BLJJ_PRD/on/demandware.static/-/Sites-pingo-doce-master/default/dwa8c02627/images/medium/544184_b35a81450dae22cf2c57f83fa6d0d563.jpg?sw=198';
assert.deepEqual(JSON.parse(JSON.stringify(sandbox.CDCMarketImageLibrary.identity({marketId:'continente',pid:'8167440'}))),{marketId:'continente',pid:'8167440',key:'continente|8167440'});
assert.equal(sandbox.CDCMarketImageLibrary.safeProductUrl(continenteProduct,'continente','8167440'),continenteProduct);
assert.equal(sandbox.CDCMarketImageLibrary.safeProductUrl(pingoProduct,'pingo-doce','739490'),pingoProduct);
assert.equal(sandbox.CDCMarketImageLibrary.safeProductUrl(pingoProduct,'pingo-doce','000000'),'');
assert.equal(sandbox.CDCMarketImageLibrary.safeOfficialImageUrl(continenteImage,'continente','8167440'),continenteImage);
assert.equal(sandbox.CDCMarketImageLibrary.safeOfficialImageUrl(continenteImage,'continente','111111'),'');
assert.equal(sandbox.CDCMarketImageLibrary.safeOfficialImageUrl(pingoImage,'pingo-doce','739490'),pingoImage);
assert.equal(sandbox.CDCMarketImageLibrary.safeOfficialImageUrl(pingoImage,'pingo-doce','111111'),'');
assert.equal(sandbox.CDCMarketImageLibrary.safeOfficialImageUrl(pingoCurrentImage,'pingo-doce','544184'),pingoCurrentImage);
assert.equal(sandbox.CDCMarketImageLibrary.safeOfficialImageUrl(pingoCurrentImage,'pingo-doce','739490'),'');
assert.equal(sandbox.CDCMarketImageLibrary.safeOfficialImageUrl(pingoCurrentImage.replace('www.pingodoce.pt','evil.example'),'pingo-doce','544184'),'');

(async()=>{
  const stored=await sandbox.CDCMarketImageLibrary.remember({marketId:'continente',pid:'8167440',name:'Compressas Gaze',imageUrl:continenteImage,sourceUrl:continenteProduct});
  assert.ok(stored);
  const cached=await sandbox.CDCMarketImageLibrary.get({marketId:'continente',pid:'8167440'});
  assert.equal(cached.imageUrl,continenteImage);
  assert.equal(cached.sourceUrl,continenteProduct);
  assert.equal((await sandbox.CDCMarketImageLibrary.stats()).count,1);
  const audit=await sandbox.CDCMarketImageLibrary.auditAll({verifyNetwork:false});
  assert.equal(audit.total,1);
  assert.equal(audit.valid,1);
  assert.equal(audit.unchecked,1);
  assert.equal(audit.rejected,0);
  assert.equal(audit.expired,0);
  assert.equal((await sandbox.CDCMarketImageLibrary.stats()).lastAudit.valid,1);
  assert.equal(await sandbox.CDCMarketImageLibrary.forget({marketId:'continente',pid:'8167440'}),true);
  assert.equal(await sandbox.CDCMarketImageLibrary.get({marketId:'continente',pid:'8167440'}),null);

  const pingoStored=await sandbox.CDCMarketImageLibrary.remember({
    marketId:'pingo-doce',pid:'544184',name:'Bife de frango',imageUrl:pingoCurrentImage,
    sourceUrl:'https://www.pingodoce.pt/home/produtos/talho/aves/frango/bife%2Fpeito-de-frango-embalado-nosso-talho-544184.html'
  });
  assert.ok(pingoStored);
  assert.equal(pingoStored.imageUrl,pingoCurrentImage);
  assert.equal((await sandbox.CDCMarketImageLibrary.get({marketId:'pingo-doce',pid:'544184'})).imageUrl,pingoCurrentImage);

  assert.match(prepare,/const IMAGE_LIBRARY_REV = '76-pingo-url3'/);
  assert.match(prepare,/market-image-library\.js/);
  assert.match(sw,/\.\/market-image-library\.js/);
  assert.doesNotMatch(sw,/\.\/v75-market-featured\.(?:css|js)/);

  const dist=path.join(ROOT,'dist');
  try{
    execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
    const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
    assert.match(index,/market-image-library\.js\?v=76-pingo-url3/);
    assert.ok(index.indexOf('market-image-library.js')<index.indexOf('market-retailer-image-policy.js'));
    assert.ok(index.indexOf('market-image-library.js')<index.indexOf('market-official-images.js'));
    assert.ok(fs.existsSync(path.join(dist,'market-image-library.js')));
    assert.ok(!fs.existsSync(path.join(dist,'v75-market-featured.js')));
    assert.ok(!fs.existsSync(path.join(dist,'v75-market-featured.css')));
  }finally{fs.rmSync(dist,{recursive:true,force:true});}

  console.log('Persistent official market image library remains exact-SKU, distributable and fully auditable: OK');
})().catch(error=>{console.error(error);process.exitCode=1;});

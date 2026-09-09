'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const source=read('pingo-doce-photo-library.js');
const css=read('pingo-doce-photo-library.css');
const prepare=read('scripts/prepare-pages.cjs');
const sw=read('sw.js');

assert.match(source,/75-pd-photo1/);
assert.match(source,/conta-de-casa-pingo-doce-photo-library/);
assert.match(source,/const MARKET_ID='pingo-doce'/);
assert.match(source,/const STORE_ID='pingodoce'/);
assert.match(source,/SESSION_QUERY_BUDGET=24/);
assert.match(source,/DAILY_QUERY_BUDGET=72/);
assert.match(source,/SESSION_IMAGE_BUDGET=30/);
assert.match(source,/DAILY_IMAGE_BUDGET=120/);
assert.match(source,/BACKGROUND_QUERY_INTERVAL_MS=20000/);
assert.match(source,/BACKGROUND_IMAGE_INTERVAL_MS=7000/);
assert.match(source,/stores:\[STORE_ID\],limit:20/);
assert.match(source,/navigator\.connection\?\.saveData/);
assert.match(source,/document\.visibilityState==='hidden'/);
assert.match(source,/CDCMarketImageLibrary/);
assert.match(source,/CDCOfficialMarketImages/);
assert.match(source,/Biblioteca Pingo Doce/);
assert.match(source,/Atualizar biblioteca/);
assert.doesNotMatch(source,/\bappState\b/);
assert.doesNotMatch(source,/\bsaveState\b/);
assert.doesNotMatch(source,/\bcommit\s*\(/);
assert.doesNotMatch(source,/estimatedCents|actualCents|amountCents/);
assert.doesNotMatch(source,/Authorization|api[_-]?key|tokenGitHub/i);

assert.match(css,/\.pingo-doce-photo-library-status/);
assert.match(css,/@media\(max-width:540px\)/);
assert.match(css,/focus-visible/);
assert.match(css,/prefers-reduced-motion/);

const sandbox={console,URL,Date,Map,Set,Promise,setTimeout,clearTimeout,AbortController};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:'pingo-doce-photo-library.js'});
assert.ok(sandbox.CDCPingoDocePhotoLibrary);
assert.equal(sandbox.CDCPingoDocePhotoLibrary.revision,'75-pd-photo1');
assert.ok(sandbox.CDCPingoDocePhotoLibrary.categories.length>=15);
assert.ok(sandbox.CDCPingoDocePhotoLibrary.seedCount>=200);

const sample=[
  '- Pingo Doce · Arroz Carolino Cigala · 1 Kg · 1,49€ · pid 739490',
  'https://www.pingodoce.pt/home/produtos/mercearia/arroz-massa-e-leguminosas/arroz/arroz-carolino-cigala-739490.html',
  '- Continente · Produto que não entra · 1 un · 1,00€ · pid 123456',
  'https://www.continente.pt/produto/produto-123456.html'
].join('\n');
const parsed=JSON.parse(JSON.stringify(sandbox.CDCPingoDocePhotoLibrary.parseSearchRecords(sample,'mercearia')));
assert.equal(parsed.length,1);
assert.equal(parsed[0].key,'pingo-doce|739490');
assert.equal(parsed[0].marketId,'pingo-doce');
assert.equal(parsed[0].pid,'739490');
assert.equal(parsed[0].name,'Arroz Carolino Cigala');
assert.equal(parsed[0].categoryId,'mercearia');
assert.ok(parsed[0].sourceUrl.includes('pingodoce.pt/home/produtos/'));
assert.equal(sandbox.CDCPingoDocePhotoLibrary.safeProductUrl('https://evil.example/home/produtos/x-739490.html','739490'),'');
assert.equal(sandbox.CDCPingoDocePhotoLibrary.safeProductUrl('https://www.pingodoce.pt/home/produtos/x-739491.html','739490'),'');
assert.equal(sandbox.CDCPingoDocePhotoLibrary.identity({pid:'739490'}).key,'pingo-doce|739490');

assert.match(prepare,/const PD_PHOTO_REV = '75-pd-photo1'/);
for(const asset of ['pingo-doce-photo-library.css','pingo-doce-photo-library.js'])assert.ok(prepare.includes(`'${asset}'`));
assert.match(sw,/catalog1-pd-photo1/);
for(const asset of ['./pingo-doce-photo-library.css','./pingo-doce-photo-library.js'])assert.ok(sw.includes(`'${asset}'`));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/pingo-doce-photo-library\.css\?v=75-pd-photo1/);
  assert.match(index,/pingo-doce-photo-library\.js\?v=75-pd-photo1/);
  assert.ok(index.indexOf('market-visual-catalog.css')<index.indexOf('pingo-doce-photo-library.css'));
  assert.ok(index.indexOf('market-visual-catalog.js')<index.indexOf('pingo-doce-photo-library.js'));
  assert.ok(index.indexOf('pingo-doce-photo-library.js')<index.indexOf('v64-runtime.js'));
  for(const asset of ['pingo-doce-photo-library.css','pingo-doce-photo-library.js'])assert.ok(fs.existsSync(path.join(dist,asset)));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Pingo Doce progressive photo library remains exact-SKU, bounded, isolated and distributable: OK');

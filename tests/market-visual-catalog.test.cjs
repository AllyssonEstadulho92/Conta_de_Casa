'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const catalog=read('market-visual-catalog.js');
const resolver=read('market-catalog-image-resolver.js');
const css=read('market-visual-catalog.css');
const prepare=read('scripts/prepare-pages.cjs');
const sw=read('sw.js');

assert.match(catalog,/75-catalog1/);
assert.match(catalog,/conta-de-casa-market-visual-catalog/);
assert.match(catalog,/SESSION_QUERY_BUDGET=18/);
assert.match(catalog,/DAILY_QUERY_BUDGET=48/);
assert.match(catalog,/SESSION_IMAGE_BUDGET=20/);
assert.match(catalog,/BACKGROUND_QUERY_INTERVAL_MS=15000/);
assert.match(catalog,/navigator\.connection\?\.saveData/);
assert.match(catalog,/document\.visibilityState==='hidden'/);
assert.match(catalog,/queryInFlight/);
assert.match(catalog,/stores:\['pingodoce','continente'\],limit:20/);
assert.match(catalog,/marketId\|\$\{pid\}/);
assert.match(catalog,/createIndex\('categories','categories',\{unique:false,multiEntry:true\}\)/);
assert.match(catalog,/Ver preço atual/);
assert.match(catalog,/dispatchEvent\(new Event\('input'/);
assert.match(catalog,/browser\.querySelector\('#marketVisualCatalog'\)\)return/);
assert.doesNotMatch(catalog,/\bappState\b/);
assert.doesNotMatch(catalog,/\bsaveState\b/);
assert.doesNotMatch(catalog,/\bcommit\s*\(/);
assert.doesNotMatch(catalog,/estimatedCents|actualCents|amountCents/);
assert.doesNotMatch(catalog,/Authorization|api[_-]?key|tokenGitHub/i);

assert.match(resolver,/JINA_READER_ORIGIN='https:\/\/r\.jina\.ai'/);
assert.match(resolver,/MAX_CONCURRENT=2/);
assert.match(resolver,/safeProductUrl/);
assert.match(resolver,/safeOfficialImageUrl/);
assert.match(resolver,/catalogDirectResolver:REVISION/);
assert.match(resolver,/credentials:'omit'/);
assert.match(resolver,/referrerPolicy:'no-referrer'/);
assert.doesNotMatch(resolver,/\bappState\b|\bsaveState\b|\bcommit\s*\(/);

assert.match(css,/\.market-visual-catalog-grid/);
assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
assert.match(css,/@media\(max-width:680px\)/);
assert.match(css,/@media\(max-width:430px\)/);
assert.match(css,/@media\(max-width:350px\)/);
assert.match(css,/object-fit:contain/);
assert.match(css,/focus-visible/);

const catalogSandbox={console,URL,Date,Map,Set,Promise,setTimeout,clearTimeout,AbortController};
catalogSandbox.globalThis=catalogSandbox;
vm.createContext(catalogSandbox);
vm.runInContext(catalog,catalogSandbox,{filename:'market-visual-catalog.js'});
assert.ok(catalogSandbox.CDCMarketVisualCatalog);
assert.equal(catalogSandbox.CDCMarketVisualCatalog.revision,'75-catalog1');
assert.equal(catalogSandbox.CDCMarketVisualCatalog.categories.length,12);
assert.ok(catalogSandbox.CDCMarketVisualCatalog.categories.some(category=>category.label==='Bebidas'));
assert.ok(catalogSandbox.CDCMarketVisualCatalog.categories.some(category=>category.label==='Lacticínios e ovos'));
assert.ok(catalogSandbox.CDCMarketVisualCatalog.categories.some(category=>category.label==='Carne e peixe'));
assert.ok(catalogSandbox.CDCMarketVisualCatalog.categories.some(category=>category.label==='Higiene pessoal'));
assert.ok(catalogSandbox.CDCMarketVisualCatalog.categories.some(category=>category.label==='Animais'));

const sample=[
  '- Continente · Leite UHT Magro Continente · 1 L · 0,86€ · pid 8504297',
  'https://www.continente.pt/produto/leite-uht-magro-continente-8504297.html',
  '- Pingo Doce · Arroz Carolino Cigala · 1 Kg · 1,49€ · pid 739490',
  'https://www.pingodoce.pt/home/produtos/mercearia/arroz-massa-e-leguminosas/arroz/arroz-carolino-cigala-739490.html'
].join('\n');
const parsed=JSON.parse(JSON.stringify(catalogSandbox.CDCMarketVisualCatalog.parseCatalogRecords(sample,'mercearia')));
assert.equal(parsed.length,2);
assert.equal(parsed[0].key,'continente|8504297');
assert.equal(parsed[0].name,'Leite UHT Magro Continente');
assert.deepEqual(parsed[0].categories,['mercearia']);
assert.equal(parsed[1].key,'pingo-doce|739490');
assert.equal(parsed[1].pid,'739490');
assert.equal(catalogSandbox.CDCMarketVisualCatalog.parseCatalogRecords('- Continente · Falso · 1 un · pid 999999\nhttps://evil.example/produto/falso-999999.html','mercearia').length,0);

const continenteProduct='https://www.continente.pt/produto/leite-uht-magro-continente-8504297.html';
const continenteImage='https://www.continente.pt/dw/image/v2/BDVS_PRD/on/demandware.static/-/Sites-col-master-catalog/default/dw123/images/col/850/8504297-frente.jpg?sw=2000&sh=2000';
let fallbackCalls=0;
let fetchedUrl='';
const safeProductUrl=(value,marketId,pid)=>{
  try{
    const url=new URL(value);
    return marketId==='continente'&&pid==='8504297'&&url.hostname==='www.continente.pt'&&url.pathname.endsWith('-8504297.html')?url.href:'';
  }catch(_error){return '';}
};
const safeOfficialImageUrl=(value,marketId,pid)=>{
  try{
    const url=new URL(value);
    return marketId==='continente'&&pid==='8504297'&&url.hostname==='www.continente.pt'&&url.pathname.includes('/Sites-col-master-catalog/')&&url.pathname.includes('8504297')?url.href:'';
  }catch(_error){return '';}
};
const resolverSandbox={
  console,URL,Date,Map,Set,Promise,setTimeout,clearTimeout,AbortController,
  CDCOfficialMarketImages:Object.freeze({
    safeProductUrl,safeOfficialImageUrl,
    resolve:async()=>{fallbackCalls+=1;return null;}
  }),
  fetch:async url=>{
    fetchedUrl=String(url);
    return {ok:true,status:200,text:async()=>`produto\n${continenteImage}\n`};
  }
};
resolverSandbox.globalThis=resolverSandbox;
vm.createContext(resolverSandbox);
vm.runInContext(resolver,resolverSandbox,{filename:'market-catalog-image-resolver.js'});
assert.ok(resolverSandbox.CDCMarketCatalogImageResolver);
assert.equal(resolverSandbox.CDCOfficialMarketImages.catalogDirectResolver,'75-catalog1');

(async()=>{
  const direct=await resolverSandbox.CDCOfficialMarketImages.resolve({marketId:'continente',pid:'8504297',name:'Leite',sourceUrl:continenteProduct});
  assert.equal(direct.imageUrl,continenteImage);
  assert.ok(fetchedUrl.startsWith('https://r.jina.ai/https://www.continente.pt/produto/'));
  assert.equal(fallbackCalls,0,'exact retailer URL should avoid a second product search');

  assert.match(prepare,/const CATALOG_REV = '75-catalog1'/);
  for(const asset of ['market-visual-catalog.css','market-catalog-image-resolver.js','market-visual-catalog.js'])assert.ok(prepare.includes(`'${asset}'`));
  assert.match(sw,/image-library1-catalog1/);
  for(const asset of ['./market-visual-catalog.css','./market-catalog-image-resolver.js','./market-visual-catalog.js'])assert.ok(sw.includes(`'${asset}'`));

  const dist=path.join(ROOT,'dist');
  try{
    execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
    const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
    assert.match(index,/market-visual-catalog\.css\?v=75-catalog1/);
    assert.match(index,/market-catalog-image-resolver\.js\?v=75-catalog1/);
    assert.match(index,/market-visual-catalog\.js\?v=75-catalog1/);
    assert.ok(index.indexOf('market-official-images.js')<index.indexOf('market-catalog-image-resolver.js'));
    assert.ok(index.indexOf('market-catalog-image-resolver.js')<index.indexOf('market-visual-catalog.js'));
    assert.ok(index.indexOf('market-visual-catalog.js')<index.indexOf('v64-runtime.js'));
    for(const asset of ['market-visual-catalog.css','market-catalog-image-resolver.js','market-visual-catalog.js'])assert.ok(fs.existsSync(path.join(dist,asset)));
  }finally{
    fs.rmSync(dist,{recursive:true,force:true});
  }

  console.log('Progressive visual market catalog remains bounded, exact-SKU, isolated and distributable: OK');
})().catch(error=>{console.error(error);process.exitCode=1;});

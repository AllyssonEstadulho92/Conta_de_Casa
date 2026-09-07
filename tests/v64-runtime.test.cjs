'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const js=fs.readFileSync('v64-runtime.js','utf8');
const css=fs.readFileSync('v64-runtime.css','utf8');

new Function(js);
assert.match(js,/AUTO_MATCH_MIN=0\.84/);
assert.match(js,/AUTO_MATCH_GAP=0\.10/);
assert.match(js,/select.*apenas um supermercado|selecione apenas um supermercado/i);
assert.match(js,/String\(item\.productCode\|\|''\)===scan\.code/,'same GTIN must be detected before adding a duplicate line');
assert.match(js,/existing\.quantity=addOneQuantity/,'same GTIN must increment quantity');
assert.match(js,/estimatedCents=candidate\.priceCents/,'live store price must refresh the estimated value');
assert.doesNotMatch(js,/actualCents\s*[:=]/,'barcode automation must not convert a store lookup into an actual paid amount');
assert.match(js,/totalCents:0,[\s\S]*reference:'',[\s\S]*notes:'',[\s\S]*draft:true/,'new recurring occurrences must start with variable invoice fields empty');
assert.match(js,/draft:false/,'saving a completed bill must leave draft state');
assert.match(js,/migrateGeneratedOccurrencesToDrafts/);
assert.match(js,/financialDiagnostics/);

assert.match(css,/safe-area-inset-top/);
assert.match(css,/--mobile-top-safe:max\(20px/);
assert.match(css,/position:fixed!important/,'mobile header must not depend on sticky inside Safari internal scrolling');
assert.match(css,/left:var\(--page-gutter\)!important/);
assert.match(css,/right:var\(--page-gutter\)!important/);
assert.match(css,/padding-top:var\(--header-height\)!important/,'main content must be offset by the fixed mobile header');

/* Regression from real iPhone screenshots: the Mercado header must not become a
   separate visual component. It uses the same title, menu, add and Sync metrics as
   Início/Faturas/Relatórios. */
assert.match(css,/\.page-heading h1,[\s\S]*html\.market-prototype-active \.page-heading h1\{[\s\S]*font-size:24px!important/,'market and global page titles must share the same mobile size');
assert.match(css,/html\.market-prototype-active \.page-heading h1::before\{[\s\S]*content:none!important[\s\S]*display:none!important/,'legacy cart icon injected before the market title must be disabled');
assert.match(css,/\.btn\.primary\.topbar-create,[\s\S]*html\.market-prototype-active \.btn\.primary\.topbar-create\{[\s\S]*width:44px!important[\s\S]*height:44px!important/,'market add action must use the global topbar button box');
assert.match(css,/html\.market-prototype-active \.sync-header-status::after\{[\s\S]*content:none!important[\s\S]*display:none!important/,'market Sync must not append a page-specific chevron');
assert.match(css,/\.sync-header-status,[\s\S]*html\.market-prototype-active \.sync-header-status\{[\s\S]*height:36px!important[\s\S]*max-width:112px!important/,'Sync control metrics must be identical across pages');
assert.match(css,/background:color-mix\(in srgb,var\(--bg,#f7f9fc\) 96%,var\(--surface,#fff\)\)!important/,'fixed topbar must mask page-specific background tint');

assert.match(css,/\.status-chip\.draft/);
assert.match(css,/\.bill-draft-card/);
assert.doesNotMatch(css,/dashed|dotted/,'v64 must not reintroduce segmented/dotted visual accents');

const context=vm.createContext({console,setTimeout,clearTimeout,setInterval,clearInterval,globalThis:null});
context.globalThis=context;
vm.runInContext(js,context,{filename:'v64-runtime.js'});
const api=context.CDCV64;
assert.ok(api,'v64 pure helpers must be available for regression testing');
assert.equal(api.VERSION,'v64');

const singleScan={detail:'Mimosa · Leite Meio Gordo · 1 L',retailerId:'continente'};
const exact={name:'Leite UHT Meio Gordo Mimosa',pack:'1 L · Continente',retailerId:'continente',priceCents:99};
const wrongStore={...exact,retailerId:'pingo-doce'};
const wrongPack={...exact,pack:'6 x 1 L · Continente'};
assert.ok(api.scoreBarcodeCandidate(singleScan,exact)>=0.84,'strong name/brand/pack match should qualify');
assert.equal(api.scoreBarcodeCandidate(singleScan,wrongStore),0,'wrong retailer must never auto-match');
assert.equal(api.scoreBarcodeCandidate(singleScan,wrongPack),0,'different multipack must never auto-match');

const selection=api.pickBarcodeCandidate(singleScan,[exact,{name:'Leite Magro Marca X',pack:'1 L · Continente',retailerId:'continente',priceCents:89}]);
assert.equal(selection.accepted,true);
assert.equal(selection.match.name,exact.name);

const ambiguousA={name:'Leite Meio Gordo Mimosa',pack:'1 L · Continente',retailerId:'continente',priceCents:98};
const ambiguousB={name:'Leite UHT Meio Gordo Mimosa',pack:'1 L · Continente',retailerId:'continente',priceCents:99};
const ambiguous=api.pickBarcodeCandidate(singleScan,[ambiguousA,ambiguousB]);
assert.equal(ambiguous.accepted,false,'near-tied results must require manual confirmation');

const parsed=api.parseBarcodeStatus('Código 5601234567890: Mimosa · Leite Meio Gordo · 1 L. A pesquisar preço no Pingo Doce e Continente…');
assert.deepEqual(JSON.parse(JSON.stringify(parsed)),{code:'5601234567890',detail:'Mimosa · Leite Meio Gordo · 1 L'});

console.log('v64 barcode confidence, recurring-bill reset and unified fixed mobile header tests: OK');

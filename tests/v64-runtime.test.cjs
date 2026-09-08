'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const js=fs.readFileSync('v64-runtime.js','utf8');
const design=fs.readFileSync('design-system.css','utf8');
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));

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

/* As correções de shell/safe-area foram consolidadas no sistema visual v74. */
assert.match(design,/safe-area-inset-top/);
assert.match(design,/--mobile-top-safe:max\(20px/);
assert.match(design,/position:fixed!important/,'mobile header must remain fixed inside Safari/PWA');
assert.match(design,/left:var\(--page-gutter\)!important/);
assert.match(design,/right:var\(--page-gutter\)!important/);
assert.match(design,/padding-top:var\(--header-height\)!important/,'main content must be offset by the fixed mobile header');
assert.match(design,/--mobile-shell-bg:#f4f8f8/);
assert.match(design,/\[data-theme="dark"\][\s\S]*--mobile-shell-bg:#071b20/);
assert.match(design,/\.status-chip\.draft/);
assert.match(design,/\.bill-draft-card/);
assert.equal(manifest.background_color,'#f4f8f8');
assert.equal(manifest.theme_color,'#f4f8f8');

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

console.log('v64 barcode confidence and recurring-bill rules under v74 shell: OK');

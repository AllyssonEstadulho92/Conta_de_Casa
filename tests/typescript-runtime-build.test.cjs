'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const GENERATED=path.join(ROOT,'.generated');
const DIST=path.join(ROOT,'dist');

const runtimes=Object.freeze([
  {
    label:'Market branding',
    source:'src/ui/market-branding.ts',
    manual:'market-branding.js',
    output:'market-branding.js',
    marker:/installMarketBranding/
  },
  {
    label:'Sync conflict policy',
    source:'src/sync/sync-conflict-policy.ts',
    manual:'sync-conflict-policy.js',
    output:'sync-conflict-policy.js',
    marker:/installSyncConflictPolicy/
  },
  {
    label:'Date calculator',
    source:'src/ui/date-calculator.ts',
    manual:'date-calculator.js',
    output:'date-calculator.js',
    marker:/installDateCalculator/
  }
]);

for(const runtime of runtimes){
  assert.ok(fs.existsSync(path.join(ROOT,runtime.source)),`${runtime.label} TypeScript source must exist`);
  assert.ok(!fs.existsSync(path.join(ROOT,runtime.manual)),`${runtime.label} manual JavaScript source must be absent`);
}

execFileSync(process.execPath,['scripts/build-typescript-runtime.cjs'],{cwd:ROOT,stdio:'pipe'});

/* O antigo Veggie Burger duplicava o controlador funcional mobile-menu-toggle.js.
   O source TS permanece temporariamente como referência de retirada, mas o build não o
   transforma nem publica enquanto a arquitetura converge para uma única autoridade. */
assert.ok(fs.existsSync(path.join(ROOT,'src/ui/veggie-menu-toggle.ts')),'retirement reference remains available during staged cleanup');
assert.ok(!fs.existsSync(path.join(GENERATED,'v76-veggie-menu.js')),'TypeScript build must not emit the retired duplicate menu observer');
assert.ok(!fs.existsSync(path.join(ROOT,'v76-veggie-menu.js')),'manual duplicate menu runtime must remain absent');

const generatedByName=new Map();
for(const runtime of runtimes){
  const generatedPath=path.join(GENERATED,runtime.output);
  assert.ok(fs.existsSync(generatedPath),`TypeScript build must emit .generated/${runtime.output}`);
  const generated=fs.readFileSync(generatedPath,'utf8');
  generatedByName.set(runtime.output,generated);
  assert.match(generated,/Runtime gerado por TypeScript/);
  assert.match(generated,runtime.marker);
  assert.doesNotMatch(generated,/commit\(|saveState\(|appState|estimatedCents|actualCents/);
  assert.doesNotThrow(()=>new vm.Script(generated),`${runtime.label} generated runtime must parse as a classic browser script`);
}

const branding=generatedByName.get('market-branding.js');
assert.match(branding,/MARKET_BRAND_NOTICE_SELECTOR/);
assert.match(branding,/marketProductImages = 'verified'/);
assert.match(branding,/new MutationObserver/);
assert.match(branding,/attributeFilter: \['data-mode'\]/);
assert.match(branding,/fotografia de produto validada/);

const syncPolicy=generatedByName.get('sync-conflict-policy.js');
assert.match(syncPolicy,/MARKET_TECHNICAL_FIELDS/);
assert.match(syncPolicy,/productCode/);
assert.match(syncPolicy,/imageUrl/);
assert.match(syncPolicy,/imageSource/);
assert.match(syncPolicy,/imageMatchedAt/);
assert.match(syncPolicy,/root\.syncBusinessView = businessView/);
assert.doesNotMatch(syncPolicy,/estimatedCents|actualCents|purchasedAt|quantity/);

const dateCalculator=generatedByName.get('date-calculator.js');
assert.match(dateCalculator,/76-date-calculator1/);
assert.match(dateCalculator,/civilDayDiff/);
assert.match(dateCalculator,/businessDays/);
assert.match(dateCalculator,/Feriados não são descontados/);
assert.doesNotMatch(dateCalculator,/\bfetch\s*\(|XMLHttpRequest|localStorage|indexedDB|saveState\s*\(|commit\s*\(/);

execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
for(const runtime of runtimes){
  const publicPath=path.join(DIST,runtime.output);
  assert.ok(fs.existsSync(publicPath),`Pages bundle must contain generated ${runtime.output}`);
  assert.ok(!fs.existsSync(path.join(ROOT,runtime.manual)),`Pages preparation must not recreate ${runtime.manual} in repository root`);
  const published=fs.readFileSync(publicPath,'utf8');
  assert.equal(published,generatedByName.get(runtime.output),`${runtime.output} must be exactly the TypeScript-generated runtime`);
}
assert.ok(fs.existsSync(path.join(DIST,'date-calculator.css')),'Pages bundle must contain date-calculator.css');
const distIndex=fs.readFileSync(path.join(DIST,'index.html'),'utf8');
assert.match(distIndex,/date-calculator\.css\?v=76-date-calculator1/);
assert.match(distIndex,/date-calculator\.js\?v=76-date-calculator1/);
assert.ok(!fs.existsSync(path.join(DIST,'v76-veggie-menu.js')),'Pages bundle must not contain retired duplicate menu runtime');
assert.ok(!fs.existsSync(path.join(DIST,'v76-veggie-menu.css')),'Pages bundle must not contain retired duplicate menu CSS');
assert.ok(fs.existsSync(path.join(DIST,'vendor','zxing-browser.min.js')),'Pages bundle must contain the local ZXing browser runtime');
assert.ok(fs.existsSync(path.join(DIST,'vendor','ZXING_LICENSE.txt')),'Pages bundle must contain the ZXing license');
assert.match(distIndex,/name="barcode-reader-src" content="\.\/vendor\/zxing-browser\.min\.js"/);
assert.doesNotMatch(distIndex,/unpkg\.com/,'generated Pages HTML must not depend on a script CDN');

fs.rmSync(DIST,{recursive:true,force:true});
console.log('TypeScript runtime build: active TS modules are generated; date calculator is published; duplicate Veggie menu stays retired.');

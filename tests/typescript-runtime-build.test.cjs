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
    label:'Veggie Burger',
    source:'src/ui/veggie-menu-toggle.ts',
    manual:'v76-veggie-menu.js',
    output:'v76-veggie-menu.js',
    marker:/installVeggieMenuToggle/
  },
  {
    label:'Market branding',
    source:'src/ui/market-branding.ts',
    manual:'market-branding.js',
    output:'market-branding.js',
    marker:/installMarketBranding/
  }
]);

for(const runtime of runtimes){
  assert.ok(fs.existsSync(path.join(ROOT,runtime.source)),`${runtime.label} TypeScript source must exist`);
  assert.ok(!fs.existsSync(path.join(ROOT,runtime.manual)),`${runtime.label} manual JavaScript source must be absent`);
}

execFileSync(process.execPath,['scripts/build-typescript-runtime.cjs'],{cwd:ROOT,stdio:'pipe'});

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

const veggie=generatedByName.get('v76-veggie-menu.js');
assert.match(veggie,/glyph\.append\(upperLine, lowerLine\)/);
assert.match(veggie,/drawer\.insertBefore\(button, drawerShell\)/);
assert.match(veggie,/upperLine\.animate/);
assert.match(veggie,/lowerLine\.animate/);

const branding=generatedByName.get('market-branding.js');
assert.match(branding,/MARKET_BRAND_NOTICE_SELECTOR/);
assert.match(branding,/marketProductImages = 'verified'/);
assert.match(branding,/new MutationObserver/);
assert.match(branding,/attributeFilter: \['data-mode'\]/);
assert.match(branding,/fotografia de produto validada/);

execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
for(const runtime of runtimes){
  const publicPath=path.join(DIST,runtime.output);
  assert.ok(fs.existsSync(publicPath),`Pages bundle must contain generated ${runtime.output}`);
  assert.ok(!fs.existsSync(path.join(ROOT,runtime.manual)),`Pages preparation must not recreate ${runtime.manual} in repository root`);
  const published=fs.readFileSync(publicPath,'utf8');
  assert.equal(published,generatedByName.get(runtime.output),`${runtime.output} must be exactly the TypeScript-generated runtime`);
}

fs.rmSync(DIST,{recursive:true,force:true});
console.log('TypeScript runtime build: multiple source-only TS modules -> generated JS artifacts -> Pages bundle, with no committed JS sources.');

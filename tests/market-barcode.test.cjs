const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const index=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('market-barcode.js','utf8');
const css=fs.readFileSync('market-barcode.css','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const pages=fs.readFileSync('scripts/prepare-pages.cjs','utf8');

assert.match(index,/market-barcode\.css\?v=53/);
assert.match(index,/market-barcode\.js\?v=53/);
assert.match(index,/script-src 'self' https:\/\/unpkg\.com;/);
assert.match(index,/connect-src 'self' https:\/\/api\.github\.com https:\/\/cesta\.pt https:\/\/world\.openfoodfacts\.org;/);
for(const asset of ['market-barcode.css','market-barcode.js']){
  assert.ok(sw.includes(`'./${asset}'`),`${asset} must be cached by the service worker`);
  assert.ok(pages.includes(`'${asset}'`),`${asset} must be included in the Pages bundle`);
}
assert.match(js,/facingMode:\{ideal:'environment'\}/);
assert.match(js,/https:\/\/world\.openfoodfacts\.org\/api\/v2\/product\//);
assert.match(js,/https:\/\/unpkg\.com\/@zxing\/browser@0\.2\.0\/umd\/zxing-browser\.min\.js/);
assert.match(js,/vídeo não é guardado nem enviado/i);
assert.match(js,/dispatchEvent\(new Event\('input',\{bubbles:true\}\)\)/);
assert.match(js,/new Set\(\[8,12,13,14\]\)/);
assert.match(js,/getTracks\(\).*track\.stop/);
assert.match(js,/credentials:'omit'/);
assert.doesNotMatch(js,/localStorage|sessionStorage|IndexedDB|idbPut|appState\.market\.push/);
assert.ok(css.includes('env(safe-area-inset-top)'));
assert.ok(css.includes('env(safe-area-inset-bottom)'));
assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
assert.ok(css.includes('44px'));

const sandbox={
  window:{addEventListener(){},isSecureContext:true},
  document:{
    readyState:'loading',
    addEventListener(){},
    querySelector(){return null;},
    head:{appendChild(){}},
  },
  navigator:{mediaDevices:{}},
  MutationObserver:function(){this.observe=()=>{};},
  URL,
  AbortController,
  setTimeout,
  clearTimeout,
  Event:function(){},
  fetch:async()=>{throw new Error('not called');},
};
sandbox.window.window=sandbox.window;
vm.runInNewContext(js,sandbox,{filename:'market-barcode.js'});
const api=sandbox.window.__marketBarcodeInternals;
assert.ok(api,'barcode test helpers must be exposed');
assert.equal(api.normalizeGtin(' 560-123 456 789 0 '),'5601234567890');
assert.equal(api.validGtinChecksum('3017620422003'),true,'known EAN-13 should pass');
assert.equal(api.validGtinChecksum('3017620422004'),false,'invalid checksum should fail');
assert.equal(api.validGtinChecksum('123'),false,'unsupported length should fail');
assert.equal(api.buildMarketQuery({brand:'Ferrero',name:'Nutella'}),'Ferrero Nutella');

console.log('Market barcode camera, GTIN validation, privacy and pricing handoff invariants: OK');
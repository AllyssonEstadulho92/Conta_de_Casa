'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const source=read('market-photo-loader.js');
const css=read('market-photo-loader.css');
const prepare=read('scripts/prepare-pages.cjs');
const sw=read('sw.js');

assert.match(source,/75-photo-loader2/);
assert.match(source,/POLL_MS=500/);
assert.match(source,/MAX_POLLS=24/);
assert.match(source,/PRIORITY_VISIBLE_LIMIT=6/);
assert.match(source,/RETRY_AFTER_MS=30000/);
assert.match(source,/LOADER_SETTLE_MS=12000/);
assert.match(source,/A carregar fotografia/);
assert.match(source,/Fotografia a validar/);
assert.match(source,/CDCPingoDocePhotoLibrary\?\.warmPending/);
assert.match(source,/CDCPingoDocePhotoLibrary\?\.syncNow/);
assert.match(source,/CDCMarketImageLibrary\?\.get/);
assert.match(source,/CDCMarketImageLibrary\?\.forget/);
assert.match(source,/CDCOfficialMarketImages/);
assert.match(source,/CDCMarketVisualCatalog/);
assert.match(source,/warmVisibleCards/);
assert.match(source,/photoRuntimeRevision/);
assert.match(source,/imagesToday:0/);
assert.match(source,/loading='eager'/);
assert.match(source,/MutationObserver/);
assert.match(source,/#page-market\.page\.active/);
assert.doesNotMatch(source,/\bappState\b|\bsaveState\b|\bcommit\s*\(/);
assert.doesNotMatch(source,/estimatedCents|actualCents|amountCents/);
assert.doesNotMatch(source,/https?:\/\//);
assert.doesNotMatch(source,/\bfetch\s*\(/);

assert.match(css,/\.market-photo-loader/);
assert.match(css,/marketPhotoShimmer/);
assert.match(css,/marketPhotoSpin/);
assert.match(css,/a carregar fotografias/);
assert.match(css,/prefers-reduced-motion/);

const sandbox={console,URL,Date,Map,Set,Promise,setTimeout,clearTimeout,AbortController};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:'market-photo-loader.js'});
assert.ok(sandbox.CDCMarketPhotoLoader);
assert.equal(sandbox.CDCMarketPhotoLoader.revision,'75-photo-loader2');
assert.equal(typeof sandbox.CDCMarketPhotoLoader.warmVisible,'function');

assert.match(prepare,/const PHOTO_LOADER_REV = '75-photo-loader2'/);
for(const asset of ['market-photo-loader.css','market-photo-loader.js'])assert.ok(prepare.includes(`'${asset}'`));
assert.match(sw,/pd-photo1-photo-loader2/);
for(const asset of ['./market-photo-loader.css','./market-photo-loader.js'])assert.ok(sw.includes(`'${asset}'`));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/market-photo-loader\.css\?v=75-photo-loader2/);
  assert.match(index,/market-photo-loader\.js\?v=75-photo-loader2/);
  assert.ok(index.indexOf('pingo-doce-photo-library.css')<index.indexOf('market-photo-loader.css'));
  assert.ok(index.indexOf('pingo-doce-photo-library.js')<index.indexOf('market-photo-loader.js'));
  assert.ok(index.indexOf('market-photo-loader.js')<index.indexOf('v64-runtime.js'));
  for(const asset of ['market-photo-loader.css','market-photo-loader.js'])assert.ok(fs.existsSync(path.join(dist,asset)));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Market photo loader prioritizes visible SKUs, recovers stale budget and remains non-financial: OK');

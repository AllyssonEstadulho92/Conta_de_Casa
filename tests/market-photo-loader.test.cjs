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
assert.match(sw,/const CACHE = 'conta-de-casa-public-v76-build';/,'PWA cache invalidation must follow deterministic build identity.');

assert.match(source,/76-photo-card3/);
assert.match(source,/POLL_MS=500/);
assert.match(source,/MAX_POLLS=28/);
assert.match(source,/PRIORITY_VISIBLE_LIMIT=8/);
assert.match(source,/RETRY_AFTER_MS=30000/);
assert.match(source,/VALIDATING_AFTER_MS=7000/);
assert.match(source,/FINAL_SETTLE_MS=12000/);
assert.match(source,/SETTLED_RETRY_MS=5\*60\*1000/);
assert.match(source,/A carregar fotografia/);
assert.match(source,/A validar fotografia/);
assert.match(source,/Sem fotografia/);
assert.match(source,/settleUnavailable/);
assert.match(source,/is-photo-unavailable/);
assert.match(source,/markPingoReady/);
assert.match(source,/PINGO_PRODUCT_STORE='products'/);
assert.match(source,/imageState:'ready'/);
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
assert.match(css,/\.market-photo-unavailable/);
assert.match(css,/marketPhotoShimmer/);
assert.match(css,/marketPhotoSpin/);
assert.match(css,/a carregar fotografias/);
assert.match(css,/prefers-reduced-motion/);

const sandbox={console,URL,Date,Map,Set,Promise,setTimeout,clearTimeout,AbortController};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:'market-photo-loader.js'});
assert.ok(sandbox.CDCMarketPhotoLoader);
assert.equal(sandbox.CDCMarketPhotoLoader.revision,'76-photo-card3');
assert.equal(typeof sandbox.CDCMarketPhotoLoader.warmVisible,'function');

assert.match(prepare,/const PHOTO_LOADER_REV = '76-photo-card3'/);
for(const asset of ['market-photo-loader.css','market-photo-loader.js'])assert.ok(prepare.includes(`'${asset}'`));
for(const asset of ['./market-photo-loader.css','./market-photo-loader.js'])assert.ok(sw.includes(`'${asset}'`));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/market-photo-loader\.css\?v=76-photo-card3/);
  assert.match(index,/market-photo-loader\.js\?v=76-photo-card3/);
  assert.ok(index.indexOf('pingo-doce-photo-library.css')<index.indexOf('market-photo-loader.css'));
  assert.ok(index.indexOf('pingo-doce-photo-library.js')<index.indexOf('market-photo-loader.js'));
  assert.ok(index.indexOf('market-photo-loader.js')<index.indexOf('v64-runtime.js'));
  for(const asset of ['market-photo-loader.css','market-photo-loader.js'])assert.ok(fs.existsSync(path.join(dist,asset)));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

assert.match(source,/document\.querySelectorAll\('\[data-visual-catalog-card\]'\)/,
  'loader must query articles with photo media, not their add buttons');
assert.match(read('market-visual-catalog.js'),/card\.dataset\.visualCatalogCard=record\.key/);
assert.match(source,/existing\.addEventListener\('load'/,'photo ready state waits for native image load');

const eventHandlers={};
const media={
  child:null,
  querySelector(selector){return selector==='img'?this.child:null;},
  replaceChildren(child){this.child=child;}
};
const photoCard={
  dataset:{visualCatalogCard:'pingo-doce|739490'},
  classList:{add(){},remove(){}},
  querySelector(selector){return selector==='.market-visual-product-media'?media:null;}
};
const dom={
  readyState:'loading',addEventListener(){},
  querySelector(selector){return selector==='#page-market.page.active'?{}:null;},
  querySelectorAll(selector){return selector==='[data-visual-catalog-card]'?[photoCard]:[];},
  createElement(tag){assert.equal(tag,'img');return {
    dataset:{},addEventListener(type,handler){eventHandlers[type]=handler;},
    set src(value){this._src=value;},get src(){return this._src;}
  };}
};
const fixture={console,URL,Date,Map,Set,Promise,setTimeout,clearTimeout,AbortController,document:dom,
  CDCMarketImageLibrary:{get:async()=>({imageUrl:'https://www.pingodoce.pt/fixture-test.jpg'})}};
fixture.globalThis=fixture;
vm.createContext(fixture);
vm.runInContext(source,fixture);
fixture.CDCMarketPhotoLoader.refresh().then(()=>{
  assert.equal(media.child?.src,'https://www.pingodoce.pt/fixture-test.jpg');
  assert.equal(typeof eventHandlers.load,'function','show only after image load');
  assert.equal(typeof eventHandlers.error,'function','handle broken images');
  console.log('Visual catalog card receives an image and load/error handlers: OK');
}).catch(error=>{console.error(error);process.exitCode=1;});

console.log('Market photo loader prioritizes both stores, settles failed cards and reconciles Pingo Doce readiness: OK');

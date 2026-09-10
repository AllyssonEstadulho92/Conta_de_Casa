'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const registrySource=read('design-asset-library.js');
const loaderSource=read('asset-loader.js');
const loaderCss=read('asset-loader.css');
const prepare=read('scripts/prepare-pages.cjs');
const sw=read('sw.js');
const index=read('index.html');
const core=read('core.js');

assert.match(registrySource,/75-assets1/);
assert.match(loaderSource,/75-assets1/);
assert.match(loaderCss,/75-assets1/);

/* O catálogo deve conter todos os fornecedores identificados pelo utilizador. */
for(const id of [
  'lottie-airbnb','google-fonts','fontshare','font-squirrel','dafont','uncut-wtf',
  'adobe-fonts','myfonts','fontpair','fontjoy','font-awesome','material-symbols',
  'type-icons-font','free-icon-font-proyectos'
]) assert.ok(registrySource.includes(`id:'${id}'`),`missing design provider ${id}`);

/* Política: uma linguagem visual principal, local-first, sem CDN automática. */
assert.match(registrySource,/primaryIconSystem:'lucide-local'/);
assert.match(registrySource,/preferredFontStrategy:'local-first'/);
assert.match(registrySource,/preferredFontFamilies:1/);
assert.match(registrySource,/maximumFontFamilies:2/);
assert.match(registrySource,/remoteRuntimeLoading:false/);
assert.match(registrySource,/remoteFontLoading:false/);
assert.match(registrySource,/requireLicenseReview:true/);
assert.match(registrySource,/requireReducedMotion:true/);
assert.match(registrySource,/id:'type-icons-font'[\s\S]*?status:'restricted'/);
assert.match(registrySource,/id:'free-icon-font-proyectos'[\s\S]*?status:'unverified'/);

/* Loader genérico: imagens diferidas, media leve e Lottie somente local/opt-in. */
assert.match(loaderSource,/IntersectionObserver/);
assert.match(loaderSource,/img\.loading=priority==='high'\?'eager':'lazy'/);
assert.match(loaderSource,/img\.decoding='async'/);
assert.match(loaderSource,/fetchPriority/);
assert.match(loaderSource,/element\.preload=options\.preload\|\|'metadata'/);
assert.match(loaderSource,/prefers-reduced-motion: reduce/);
assert.match(loaderSource,/runtime-missing/);
assert.match(loaderSource,/local-runtime-not-installed/);
assert.doesNotMatch(loaderSource,/createElement\(['"]script['"]\)|appendChild\([^)]*script|fonts\.googleapis\.com|kit\.fontawesome|use\.fontawesome/,'asset loader must not inject remote design runtimes');
assert.match(loaderCss,/prefers-reduced-motion:reduce/);
assert.match(loaderCss,/forced-colors:active/);

/* Não expandir CSP para fontes/kits externos. */
assert.match(index,/font-src 'self'/);
assert.doesNotMatch(index,/fonts\.googleapis\.com|fonts\.gstatic\.com|use\.fontawesome\.com|kit\.fontawesome\.com|use\.typekit\.net/i);

/* Isolamento financeiro/criptográfico. */
for(const source of [registrySource,loaderSource,loaderCss]){
  assert.doesNotMatch(source,/\bappState\b|STATE_VERSION|amountCents|estimatedCents|actualCents|PBKDF2|AES-GCM|saveState\(|persistState\(|openDB\(/);
}
assert.match(core,/STATE_VERSION\s*=\s*5/);

/* Contrato público e offline. */
assert.match(prepare,/const ASSETS_REV = '75-assets1'/);
for(const file of ['asset-loader.css','design-asset-library.js','asset-loader.js']) assert.ok(prepare.includes(`'${file}'`),`prepare-pages must include ${file}`);
assert.match(prepare,/asset-loader\.css\?v=\$\{ASSETS_REV\}/);
assert.match(prepare,/design-asset-library\.js\?v=\$\{ASSETS_REV\}/);
assert.match(prepare,/asset-loader\.js\?v=\$\{ASSETS_REV\}/);
assert.match(sw,/usability1-pages1-assets1/);
for(const file of ['./asset-loader.css','./design-asset-library.js','./asset-loader.js']) assert.ok(sw.includes(`'${file}'`),`service worker must cache ${file}`);

/* API do registo funciona sem DOM e bloqueia providers explicitamente não aprovados. */
delete global.CDCDesignAssetLibrary;
require(path.join(ROOT,'design-asset-library.js'));
assert.equal(global.CDCDesignAssetLibrary.revision,'75-assets1');
assert.equal(global.CDCDesignAssetLibrary.policy.primaryIconSystem,'lucide-local');
assert.equal(global.CDCDesignAssetLibrary.get('google-fonts').category,'fonts');
assert.equal(global.CDCDesignAssetLibrary.isBundlingAllowed('type-icons-font'),false);
assert.equal(global.CDCDesignAssetLibrary.isBundlingAllowed('free-icon-font-proyectos'),false);
assert.equal(global.CDCDesignAssetLibrary.get('missing-provider'),null);
delete global.CDCDesignAssetLibrary;

/* URL policy do loader: same-origin por defeito e external apenas com autorização explícita. */
const priorLocation=global.location;
global.location={href:'https://example.test/app/index.html',origin:'https://example.test'};
delete global.CDCAssetLoader;
require(path.join(ROOT,'asset-loader.js'));
assert.equal(global.CDCAssetLoader.revision,'75-assets1');
assert.equal(global.CDCAssetLoader.normalizeUrl('./assets/photo.webp'),'https://example.test/app/assets/photo.webp');
assert.equal(global.CDCAssetLoader.normalizeUrl('https://cdn.example/photo.webp'),null);
assert.equal(global.CDCAssetLoader.normalizeUrl('https://cdn.example/photo.webp',{allowExternal:true}),'https://cdn.example/photo.webp');
assert.equal(global.CDCAssetLoader.normalizeUrl('javascript:alert(1)'),null);
delete global.CDCAssetLoader;
if(priorLocation===undefined)delete global.location;else global.location=priorLocation;

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const builtIndex=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(builtIndex,/asset-loader\.css\?v=75-assets1/);
  assert.match(builtIndex,/design-asset-library\.js\?v=75-assets1/);
  assert.match(builtIndex,/asset-loader\.js\?v=75-assets1/);
  assert.ok(builtIndex.indexOf('asset-loader.css')<builtIndex.indexOf('market-photo-loader.css'),'generic asset states must load before the specialized Mercado photo states');
  assert.ok(builtIndex.indexOf('v75-usability.css')>builtIndex.indexOf('asset-loader.css'),'usability CSS remains the final transversal interaction layer');
  assert.ok(builtIndex.indexOf('design-asset-library.js')<builtIndex.indexOf('market-photo-loader.js'),'design asset registry must be available before specialized market photo runtime');
  assert.ok(builtIndex.indexOf('asset-loader.js')<builtIndex.indexOf('market-photo-loader.js'),'generic loader must initialize before specialized market photo runtime');
  for(const file of ['asset-loader.css','design-asset-library.js','asset-loader.js']) assert.ok(fs.existsSync(path.join(dist,file)),`${file} missing from dist`);
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('design asset library, licensing gate, generic loader, CSP and distribution tests: OK');

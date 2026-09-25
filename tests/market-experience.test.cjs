'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {execFileSync}=require('node:child_process');

if(!fs.existsSync('.generated/market-branding.js')){
  execFileSync(process.execPath,['scripts/build-typescript-runtime.cjs'],{stdio:'pipe'});
}

const index=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('market-experience.css','utf8');
const brandingCss=fs.readFileSync('market-brand.css','utf8');
const brandingTs=fs.readFileSync('src/ui/market-branding.ts','utf8');
const brandingJs=fs.readFileSync('.generated/market-branding.js','utf8');
const architectureCss=fs.readFileSync('v75-architecture.css','utf8');
const architectureJs=fs.readFileSync('v75-architecture.js','utf8');
const planningMore=fs.readFileSync('v76-planning-more.css','utf8');
const js=fs.readFileSync('market-experience.js','utf8');
const runtimeJs=fs.readFileSync('v64-runtime.js','utf8');
const imageAudit=fs.readFileSync('market-image-audit.js','utf8');
const officialBridge=fs.readFileSync('market-official-images.js','utf8');
const retailerPolicy=fs.readFileSync('market-retailer-image-policy.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const pages=fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const publicFilesStart=pages.indexOf('const PUBLIC_FILES');
const publicFilesEnd=pages.indexOf(']);',publicFilesStart);
const publicFilesBlock=pages.slice(publicFilesStart,publicFilesEnd+3);
const events=fs.readFileSync('events.js','utf8');

assert.ok(!fs.existsSync('market-branding.js'),'Market branding manual JS source must stay removed');
for(const retiredSource of ['v74-experience.css','v74-experience.js','v75-market-featured.css','v75-market-featured.js'])assert.ok(!fs.existsSync(retiredSource),`${retiredSource} must stay physically deleted`);
assert.match(index,/<meta name="app-build" content="v53"/);
assert.match(index,/market-experience\.css\?v=53/);
assert.match(index,/market-experience\.js\?v=53/);
assert.match(events,/register\('\.\/sw\.js\?v=53',\{updateViaCache:'none'\}\)/);

assert.match(sw,/architecture-consolidation1-retire-v74-runtime1/);
assert.match(sw,/retire-assets1/);
assert.match(sw,/v76-version-alignment1/);
assert.match(sw,/ts-runtime2-market-branding1/,'Service Worker cache must change when the generated Market branding runtime changes');
assert.match(sw,/prototype-product-browser1/,'PWA cache must refresh the prototype-aligned product browser');
for(const asset of ['market-experience.css','market-experience.js','market-brand.css','market-branding.js','market-retailer-image-policy.js','market-official-images.js','v64-runtime.js','v75-architecture.css','v76-planning-more.css','v75-architecture.js']){
  assert.ok(sw.includes(`'./${asset}'`),`${asset} must be cached by the service worker`);
  assert.ok(publicFilesBlock.includes(`'${asset}'`),`${asset} must be included in the Pages bundle`);
}
for(const retired of ['v74-experience.css','v74-experience.js','v75-market-featured.css','v75-market-featured.js']){
  assert.ok(!sw.includes(`'./${retired}'`),`${retired} must not be cached`);
  assert.ok(!publicFilesBlock.includes(`'${retired}'`),`${retired} must not be copied to Pages`);
}
assert.match(pages,/forbidden=\[[^\]]*'v74-experience\.js'/s,'retired runtime should remain explicitly forbidden in dist');
assert.match(pages,/forbidden=\[[^\]]*'v74-experience\.css'/s,'retired CSS should remain explicitly forbidden in dist');
assert.match(pages,/forbidden=\[[^\]]*'v75-market-featured\.js'/s,'retired Featured runtime should remain explicitly forbidden in dist');
assert.match(pages,/forbidden=\[[^\]]*'v75-market-featured\.css'/s,'retired Featured CSS should remain explicitly forbidden in dist');
assert.ok(!sw.includes("'./ui-consistency.css'"),'obsolete visual override must not ship');
assert.ok(!sw.includes("'./v64-runtime.css'"),'obsolete v64 visual shell must not ship');
assert.match(pages,/const BUILD = 'v76'/);
assert.match(pages,/const APP_UPDATE_REV = '76-version-alignment1'/);
assert.match(pages,/const ARCHITECTURE_REV = '76-planning-commitment1'/);
assert.match(pages,/const PLANNING_MORE_REV = '76-planning-more1'/);
assert.match(pages,/['"]market-branding\.js['"]:\s*path\.join\(GENERATED,\s*['"]market-branding\.js['"]\)/);

for(const market of ['Pingo Doce','Continente'])assert.ok(js.includes(market));
assert.doesNotMatch(js,/Mercadona|Open Prices/i);
assert.ok(js.includes('https://cesta.pt/mcp'));
assert.ok(js.includes("name:'search_products'"));
assert.ok(js.includes('data-market-price-mode="live"'));
assert.match(js,/estimatedCents:product\.priceCents/);
assert.match(js,/actualCents:0,purchased:false/);
assert.match(js,/sourceUrl=safeRetailerUrl/);
assert.match(js,/window\.open\(url,'_blank','noopener,noreferrer'\)/);
assert.doesNotMatch(js,/DEMO_PRODUCTS|valores de demonstração|Protótipo visual/);
assert.doesNotMatch(js,/Authorization\s*:\s*['"]Bearer|api[_-]?key\s*[:=]/i);

assert.match(brandingCss,/Conta de Casa v74/);
assert.match(brandingCss,/\.market-product-photo[\s\S]*display:grid!important/);
assert.doesNotMatch(brandingCss,/\.market-product-photo[^\{]*\{[^}]*display:none!important/);
assert.match(brandingTs,/document\.documentElement\.dataset\.marketProductImages = 'verified'/);
assert.match(brandingTs,/nome, embalagem, loja e preço/);
assert.match(brandingTs,/fotografia de produto validada/);
assert.match(brandingJs,/Runtime gerado por TypeScript/);
assert.match(brandingJs,/installMarketBranding/);
assert.match(brandingJs,/marketProductImages\s*=\s*'verified'/);
assert.doesNotMatch(brandingJs,/appState|estimatedCents|actualCents|saveState|commit\(/,'branding must not mutate financial state');

assert.match(planningMore,/76-planning-more1/);
assert.match(architectureCss,/\.mobile-nav \.nav-btn,html\.cdc-v75 \.mobile-nav \.nav-btn:nth-child\(3\)[\s\S]*visibility:visible!important/,'Mercado must remain visible in the primary navigation');
assert.match(architectureCss,/\.cdc-product-grid[\s\S]*repeat\(3,minmax\(0,1fr\)\)/,'current market grid must remain compact');
assert.match(architectureJs,/market:\['Mercado','Compras'\]/);
assert.doesNotMatch(architectureJs,/root\.CDCV74/,'current architecture must not call the retired v74 runtime');
assert.doesNotMatch(architectureJs,/saveState\(|commit\(|estimatedCents\s*=|actualCents\s*=/,'architecture overlay must not mutate market financial state');

assert.match(runtimeJs,/AUTO_MATCH_MIN=0\.84/);
assert.match(runtimeJs,/AUTO_MATCH_GAP=0\.10/);
assert.doesNotMatch(runtimeJs,/actualCents\s*[:=]/);

assert.match(imageAudit,/searchCatalogV60/);
assert.match(officialBridge,/persistResolvedItem/);
assert.match(officialBridge,/headers:\{Accept:'application\/json'\}/);
assert.doesNotMatch(officialBridge,/headers:\{[^}]*['"]X-(?:With-Images-Summary|Retain-Images)/);
assert.match(retailerPolicy,/marketRetailerImagePolicy='official-only'/);
assert.match(retailerPolicy,/CDCOfficialMarketImages\?\.safeOfficialImageUrl/);
assert.doesNotMatch(retailerPolicy,/fetch\s*\(/,'policy layer must not add another network source');

for(const marker of ['@media(max-width:820px)','@media(max-width:430px)','@media(max-width:359px)','@media(min-width:821px) and (max-width:1180px)','@media(min-width:1181px)'])assert.ok(css.includes(marker),`missing responsive rule ${marker}`);
assert.ok(css.includes('env(safe-area-inset-top)'));
assert.ok(css.includes('env(safe-area-inset-bottom)'));
assert.ok(css.includes('min-width:0'));

/* O browser de produto deve parecer parte da mesma aplicação: pesquisa dominante,
   refinamento discreto, fontes compactas e resultados com ação clara. */
assert.match(css,/76-prototype-product-browser1/);
assert.match(css,/#formDialog\[data-mode="market-browser"\] \.dialog-shell\{[\s\S]*border-radius:22px[\s\S]*background:var\(--v76-bg/);
assert.match(css,/\.market-browser-search:focus-within\{[\s\S]*box-shadow:0 0 0 3px/);
assert.match(css,/\.market-browser-tab\.active\{[\s\S]*background:var\(--v76-surface[\s\S]*color:var\(--v76-primary/,'selected refinement tab must be quiet instead of a heavy filled control');
assert.match(css,/\.market-source-card\.selected\{[\s\S]*background:var\(--v76-surface-accent/,'selected retailer must use the same teal surface language as the rest of v76');
assert.match(css,/\.market-source-card\{[\s\S]*grid-template-columns:56px minmax\(0,1fr\) 24px/,'retailer selection must be compact and readable');
assert.match(css,/\.market-add-product\{[\s\S]*width:44px[\s\S]*background:var\(--v76-primary/,'add action must use a standard 44px primary target');
assert.match(css,/@media\(max-width:820px\)[\s\S]*#formDialog\[data-mode="market-browser"\] \.dialog-shell\{[\s\S]*height:100dvh/,'mobile add-product flow must remain a stable full-screen surface');
assert.match(css,/@media\(forced-colors:active\)/,'product browser must keep a forced-colors fallback');

console.log('Market live sources and prototype-aligned product browser remain safe under the official v76 release: OK');

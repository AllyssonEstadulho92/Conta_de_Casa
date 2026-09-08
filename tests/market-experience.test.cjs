'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const index=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('market-experience.css','utf8');
const brandingCss=fs.readFileSync('market-brand.css','utf8');
const brandingJs=fs.readFileSync('market-branding.js','utf8');
const experienceCss=fs.readFileSync('v74-experience.css','utf8');
const experienceJs=fs.readFileSync('v74-experience.js','utf8');
const architectureCss=fs.readFileSync('v75-architecture.css','utf8');
const architectureJs=fs.readFileSync('v75-architecture.js','utf8');
const js=fs.readFileSync('market-experience.js','utf8');
const runtimeJs=fs.readFileSync('v64-runtime.js','utf8');
const imageAudit=fs.readFileSync('market-image-audit.js','utf8');
const officialBridge=fs.readFileSync('market-official-images.js','utf8');
const retailerPolicy=fs.readFileSync('market-retailer-image-policy.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const pages=fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const events=fs.readFileSync('events.js','utf8');

/* index.html remains a stable source template; prepare-pages stamps the public build. */
assert.match(index,/<meta name="app-build" content="v53"/);
assert.match(index,/market-experience\.css\?v=53/);
assert.match(index,/market-experience\.js\?v=53/);
assert.match(events,/register\('\.\/sw\.js\?v=53',\{updateViaCache:'none'\}\)/);

/* v75 keeps the v74 market/prototype layers and applies the architecture overlay last. */
assert.match(sw,/conta-de-casa-public-v75-architecture1-v74-ui1-v74-shopping2-v73-menu8-v74-experience2/);
for(const asset of ['market-experience.css','market-experience.js','market-brand.css','market-branding.js','market-retailer-image-policy.js','market-official-images.js','v64-runtime.js','v74-experience.css','v74-experience.js','v75-architecture.css','v75-architecture.js']){
  assert.ok(sw.includes(`'./${asset}'`),`${asset} must be cached by the service worker`);
  assert.ok(pages.includes(`'${asset}'`),`${asset} must be included in the Pages bundle`);
}
assert.ok(!sw.includes("'./ui-consistency.css'"),'obsolete visual override must not ship');
assert.ok(!sw.includes("'./v64-runtime.css'"),'obsolete v64 visual shell must not ship');
assert.match(pages,/const BUILD = 'v75'/);
assert.match(pages,/const ARCHITECTURE_REV = '75-architecture1'/);

/* Live price sources: only sources actually supported by the current implementation. */
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

/* Verified product photography remains optional; text/price remains primary. */
assert.match(brandingCss,/Conta de Casa v74/);
assert.match(brandingCss,/\.market-product-photo[\s\S]*display:grid!important/);
assert.doesNotMatch(brandingCss,/\.market-product-photo[^\{]*\{[^}]*display:none!important/);
assert.match(brandingJs,/marketProductImages='verified'/);
assert.match(brandingJs,/nome, embalagem, loja e preço/);
assert.match(brandingJs,/fotografia de produto validada/);
assert.doesNotMatch(brandingJs,/appState|estimatedCents|actualCents|saveState|commit\(/,'branding must not mutate financial state');

/* The prototype market home reuses the real list and exposes no unsupported stores. */
assert.match(experienceJs,/SUPPORTED_STORES=\[[\s\S]*Continente[\s\S]*Pingo Doce/);
assert.doesNotMatch(experienceJs,/Auchan|Lidl|Mercadona/);
assert.match(experienceJs,/appState\.market/);
assert.match(experienceJs,/safeProductImageUrl/);
assert.match(experienceCss,/\.cdc-market-home/);
assert.match(experienceCss,/\.cdc-product-grid/);
assert.match(experienceCss,/\.cdc-store-grid/);
assert.match(architectureCss,/\.mobile-nav \.nav-btn:nth-child\(3\)\{visibility:visible!important;display:grid!important\}/,'Mercado must remain visible in the v75 primary navigation');
assert.match(architectureJs,/market:\['Mercado','Compras'\]/);
assert.doesNotMatch(architectureJs,/saveState\(|commit\(|estimatedCents\s*=|actualCents\s*=/,'architecture overlay must not mutate market financial state');

/* Barcode automation remains conservative and never turns lookup price into paid price. */
assert.match(runtimeJs,/AUTO_MATCH_MIN=0\.84/);
assert.match(runtimeJs,/AUTO_MATCH_GAP=0\.10/);
assert.doesNotMatch(runtimeJs,/actualCents\s*[:=]/);

/* Official-image compatibility remains restricted and separated from pricing. */
assert.match(imageAudit,/searchCatalogV60/);
assert.match(officialBridge,/persistResolvedItem/);
assert.match(officialBridge,/headers:\{Accept:'application\/json'\}/);
assert.doesNotMatch(officialBridge,/headers:\{[^}]*['"]X-(?:With-Images-Summary|Retain-Images)/);
assert.match(retailerPolicy,/marketRetailerImagePolicy='official-only'/);
assert.match(retailerPolicy,/CDCOfficialMarketImages\?\.safeOfficialImageUrl/);
assert.doesNotMatch(retailerPolicy,/fetch\s*\(/,'policy layer must not add another network source');

/* Existing market responsive safety remains present. */
for(const marker of ['@media(max-width:820px)','@media(max-width:430px)','@media(max-width:359px)','@media(min-width:821px) and (max-width:1180px)','@media(min-width:1181px)']){
  assert.ok(css.includes(marker),`missing responsive rule ${marker}`);
}
assert.ok(css.includes('env(safe-area-inset-top)'));
assert.ok(css.includes('env(safe-area-inset-bottom)'));
assert.ok(css.includes('min-width:0'));

console.log('Market live sources, verified photos, v74 market base, v75 architecture overlay and financial isolation: OK');

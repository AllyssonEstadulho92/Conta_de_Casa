const assert = require('node:assert/strict');
const fs = require('node:fs');

const index = fs.readFileSync('index.html','utf8');
const css = fs.readFileSync('market-experience.css','utf8');
const brandingCss = fs.readFileSync('market-brand.css','utf8');
const js = fs.readFileSync('market-experience.js','utf8');
const brandingJs = fs.readFileSync('market-branding.js','utf8');
const imageAudit = fs.readFileSync('market-image-audit.js','utf8');
const officialBridge = fs.readFileSync('market-official-images.js','utf8');
const retailerPolicy = fs.readFileSync('market-retailer-image-policy.js','utf8');
const sw = fs.readFileSync('sw.js','utf8');
const pages = fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const events = fs.readFileSync('events.js','utf8');

assert.match(index, /<meta name="app-build" content="v53"/);
assert.match(index, /market-experience\.css\?v=53/);
assert.match(index, /market-experience\.js\?v=53/);
assert.match(index, /id="appBuildVersion">v53</);
assert.match(index, /connect-src 'self' https:\/\/api\.github\.com https:\/\/cesta\.pt https:\/\/world\.openfoodfacts\.org;/);
assert.match(events, /register\('\.\/sw\.js\?v=53',\{updateViaCache:'none'\}\)/);
assert.match(sw, /conta-de-casa-public-v63-ui1/);

for (const asset of ['market-experience.css','market-experience.js','market-brand.css','market-branding.js','market-retailer-image-policy.js','market-official-images.js']) {
  assert.ok(sw.includes(`'./${asset}'`), `${asset} must be cached by the service worker`);
  assert.ok(pages.includes(`'${asset}'`), `${asset} must be included in the Pages bundle`);
}

for (const market of ['Pingo Doce','Continente']) assert.ok(js.includes(market));
assert.doesNotMatch(js,/Mercadona|Open Prices/i);
assert.match(js,/https:\/\/world\.openfoodfacts\.org\/cgi\/search\.pl/,'Open Food Facts remains available to legacy/auxiliary image lookup');
assert.ok(js.includes("data-market-price-mode=\"live\""), 'market browser must explicitly use live/verified data mode');
assert.ok(js.includes("https://cesta.pt/mcp"), 'Continente/Pingo Doce provider must be explicit');
assert.ok(js.includes("name:'search_products'"), 'cesta MCP search tool must be used');
assert.ok(js.includes("fotografia real de referência") && js.includes("Open Food Facts"), 'legacy source disclosure remains in the stable source template until the presentation layer replaces it at runtime');
assert.match(js, /estimatedCents:product\.priceCents/);
assert.match(js, /sourceUrl=safeRetailerUrl/);
assert.match(js, /data-market-source-url=/);
assert.match(js, /window\.open\(url,'_blank','noopener,noreferrer'\)/);
assert.match(js, /actualCents:0,purchased:false/);
assert.match(js, /cleanRemoteText/);
assert.match(js, /esc\(product\.name\)/);

// A revisão visual aprovada remove a fotografia da apresentação sem destruir dados
// legados nem alterar o motor de preços/cálculos.
assert.match(brandingCss, /identidade visual do Mercado sem fotografias de produto/);
assert.match(brandingCss, /\.market-product-photo[\s\S]*display:none!important/);
assert.match(brandingCss, /\.market-mobile-head\{[\s\S]*grid-template-columns:44px minmax\(0,1fr\) auto!important/);
assert.match(brandingCss, /market-catalog-main\{[\s\S]*grid-template-columns:minmax\(0,1fr\) 52px!important/);
assert.match(brandingCss, /market-catalog-main>\.market-product-copy\{[\s\S]*grid-column:1!important/);
assert.match(brandingCss, /\.market-catalog-main>\.market-add-product\{[\s\S]*grid-column:2!important/);
assert.match(brandingCss, /\.market-result-source\{[\s\S]*white-space:nowrap/);
assert.match(brandingCss, /--cdc-brand-blue:#0b63e5/);
assert.match(brandingJs, /marketProductImages='hidden'/);
assert.match(brandingJs, /nome, embalagem, loja e preço/);
assert.match(brandingJs, /A fotografia é opcional/);
assert.doesNotMatch(brandingJs, /appState|estimatedCents|actualCents|saveState|commit\(/,'branding layer must not touch financial state');

// v60 mantém o resolvedor legado; v61 resolve o pid oficial; v62 torna os cartões vivos official-only.
assert.match(imageAudit,/searchCatalogV60/);
assert.match(imageAudit,/limit:20/);
assert.match(imageAudit,/MAX_CATALOG_RESULTS=40/);
assert.match(officialBridge,/\[data-market-add-product\]/);
assert.match(officialBridge,/\.market-result-source/);
assert.match(officialBridge,/data-market-product-card/);
assert.match(officialBridge,/persistResolvedItem/);
assert.match(officialBridge,/headers:\{Accept:'application\/json'\}/,'reader must use only the simple Accept request header');
assert.doesNotMatch(officialBridge,/headers:\{[^}]*['"]X-(?:With-Images-Summary|Retain-Images)/,'reader request must not send custom image X-* headers');
assert.match(retailerPolicy,/card\.dataset\.marketImageAudit='done'/,'live retailer cards must not be processed by the legacy fallback audit');
assert.match(retailerPolicy,/marketRetailerImagePolicy='official-only'/);
assert.match(retailerPolicy,/CDCOfficialMarketImages\?\.safeOfficialImageUrl/);
assert.match(retailerPolicy,/photo\.replaceWith\(emptyPhoto\(\)\)/);
assert.match(retailerPolicy,/Ver no \$\{target\.label\}/);

assert.doesNotMatch(js, /DEMO_PRODUCTS/);
assert.doesNotMatch(js, /Protótipo visual/);
assert.doesNotMatch(js, /valores de demonstração/);
assert.doesNotMatch(js, /cartonArt/);
assert.doesNotMatch(js, /market-art-shell/);
assert.doesNotMatch(css, /market-product-art|carton-brand|carton-label|carton-volume|market-art-shell/);
assert.doesNotMatch(js, /Authorization\s*:\s*['"]Bearer/i);
assert.doesNotMatch(js, /api[_-]?key\s*[:=]/i);

for (const marker of ['@media(max-width:820px)','@media(max-width:430px)','@media(max-width:359px)','@media(min-width:821px) and (max-width:1180px)','@media(min-width:1181px)']) {
  assert.ok(css.includes(marker), `missing responsive rule ${marker}`);
}
assert.ok(css.includes('env(safe-area-inset-top)'), 'market dialog must account for the top safe area');
assert.ok(css.includes('env(safe-area-inset-bottom)'), 'market dialog/page must account for the bottom safe area');
assert.ok(css.includes('min-width:0'), 'market layouts must allow content to shrink without horizontal overflow');
assert.ok(css.includes('overflow:visible'), 'market page must not hide content to solve layout constraints');

const remSizes = [...`${css}\n${brandingCss}`.matchAll(/font-size:\s*([0-9.]+)rem/g)].map(match => Number(match[1]));
assert.ok(remSizes.length > 0);
assert.ok(remSizes.every(size => size >= 0.75), `market live UI contains text smaller than 12px: ${Math.min(...remSizes)}rem`);
for (const target of ['44px','48px','52px']) assert.ok(`${css}\n${brandingCss}`.includes(target));

console.log('Market live-source, branding, no-image presentation, privacy and responsive invariants: OK');
assert.match(css,/market-logo-pingo/);
assert.match(css,/market-logo-continente/);
assert.match(css,/market-quantity-stepper/);

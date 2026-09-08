const assert=require('node:assert/strict');
const fs=require('node:fs');

const core=fs.readFileSync('core.js','utf8');
const market=fs.readFileSync('market-experience.js','utf8');
const barcode=fs.readFileSync('market-barcode.js','utf8');
const render=fs.readFileSync('render.js','utf8');
const css=fs.readFileSync('ui-icons.css','utf8');
const brandCss=fs.readFileSync('market-brand.css','utf8');
const experienceCss=fs.readFileSync('v74-experience.css','utf8');
const architectureCss=fs.readFileSync('v75-architecture.css','utf8');
const usabilityCss=fs.readFileSync('v76-usability.css','utf8');
const index=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const runtime=fs.readFileSync('v64-runtime.js','utf8');
const imageAudit=fs.readFileSync('market-image-audit.js','utf8');
const officialBridge=fs.readFileSync('market-official-images.js','utf8');
const retailerPolicy=fs.readFileSync('market-retailer-image-policy.js','utf8');

assert.match(core,/function safeProductImageUrl/);
assert.match(core,/url\.hostname\.toLowerCase\(\) !== 'images\.openfoodfacts\.org'/);
assert.match(core,/productCode: cleanString\(i\.productCode, 32\)/);
assert.match(core,/imageUrl: safeProductImageUrl\(i\.imageUrl\)/);
assert.match(core,/imageSource: cleanString\(i\.imageSource, 60\)/);
assert.match(core,/ALLOWED_TAGS[^\n]*'img'/);
assert.match(core,/tag === 'img' && !safeProductImageUrl/);

assert.match(market,/OFF_IMAGE_SEARCH_URL='https:\/\/world\.openfoodfacts\.org\/cgi\/search\.pl'/);
assert.match(market,/searchProductImages/);
assert.match(market,/imageCandidateScore/);
assert.match(market,/bestScore<\.72/);
assert.match(market,/productImageHtml\(product\)/);
assert.match(market,/imageUrl:safeProductImageUrl\(product\.imageUrl\)/);
assert.match(market,/credentials:'omit'/);
assert.match(market,/referrerPolicy:'no-referrer'/);

assert.match(imageAudit,/Open Food Facts/);
assert.match(imageAudit,/safeProductImageUrl=safeImageUrl/);
assert.match(imageAudit,/safeRetailerProductUrl/);
assert.match(imageAudit,/safeRetailerImageUrl/);
assert.match(imageAudit,/JINA_READER_ORIGIN='https:\/\/r\.jina\.ai'/);
assert.match(imageAudit,/matchedBy:'retailer'/);
assert.match(imageAudit,/data-market-image-open/);

assert.match(officialBridge,/safeOfficialImageUrl/);
assert.match(officialBridge,/\[data-market-add-product\]/);
assert.match(officialBridge,/persistResolvedItem/);
assert.match(officialBridge,/dataset\.marketImageOfficial='1'/);
assert.match(officialBridge,/headers:\{Accept:'application\/json'\}/);
assert.doesNotMatch(officialBridge,/headers:\{[^}]*['"]X-(?:With-Images-Summary|Retain-Images)/);

assert.match(retailerPolicy,/marketRetailerImagePolicy='official-only'/);
assert.match(retailerPolicy,/CDCOfficialMarketImages\?\.safeOfficialImageUrl/);
assert.match(retailerPolicy,/photo\.replaceWith\(emptyPhoto\(\)\)/);
assert.match(retailerPolicy,/item\.imageUrl=''/);
assert.match(retailerPolicy,/item\.productCode=''/);
assert.doesNotMatch(retailerPolicy,/fetch\s*\(/);

assert.match(barcode,/image_front_small_url,image_front_url/);
assert.match(render,/function marketProductImageHtml/);
assert.match(render,/market-identity-with-photo/);
assert.match(css,/v57 — fotografias reais de referência no Mercado/);
assert.match(css,/\.market-product-photo img/);
assert.match(css,/object-fit:contain/);
assert.match(brandCss,/fotografias[\s\S]*verificadas/);
assert.match(brandCss,/\.market-product-photo[\s\S]*display:grid!important/);
assert.match(experienceCss,/\.cdc-product-image img\{width:100%;height:100%;object-fit:contain/);
assert.match(architectureCss,/\.mobile-nav \.nav-btn,html\.cdc-v75 \.mobile-nav \.nav-btn:nth-child\(3\)[\s\S]*visibility:visible!important/);
assert.match(architectureCss,/\.cdc-product-image img[\s\S]*object-fit:contain!important/,'v75 prototype must preserve uncropped verified product photos');
assert.match(usabilityCss,/\.cdc-product-grid[\s\S]*repeat\(2, minmax\(0, 1fr\)\) !important/,'v76 must preserve photos while improving card readability');

assert.match(index,/img-src 'self' data: blob: https:\/\/images\.openfoodfacts\.org;/);
assert.match(sw,/conta-de-casa-public-v76-usability1-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2/);
for(const asset of ['./market-retailer-image-policy.js','./market-official-images.js','./v74-experience.css','./v75-architecture.css','./v76-usability.css','./v76-accessibility.css','./v64-runtime.js','./v74-experience.js','./v75-architecture.js'])assert.ok(sw.includes(`'${asset}'`),`${asset} must remain cached`);
assert.doesNotMatch(sw,/\.\/ui-consistency\.css/);
assert.doesNotMatch(sw,/\.\/v64-runtime\.css/);
assert.match(runtime,/productCode=scan\.code/);
assert.doesNotMatch(runtime,/imageUrl\s*=/);

console.log('Market real/official images remain isolated and visible under the final v76 usability architecture: OK');

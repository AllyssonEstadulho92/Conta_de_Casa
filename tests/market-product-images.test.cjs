const assert=require('node:assert/strict');
const fs=require('node:fs');

const core=fs.readFileSync('core.js','utf8');
const market=fs.readFileSync('market-experience.js','utf8');
const barcode=fs.readFileSync('market-barcode.js','utf8');
const render=fs.readFileSync('render.js','utf8');
const css=fs.readFileSync('ui-icons.css','utf8');
const index=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const imageAudit=fs.readFileSync('market-image-audit.js','utf8');
const officialBridge=fs.readFileSync('market-official-images.js','utf8');

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
assert.match(market,/Open Food Facts/);
assert.match(market,/credentials:'omit'/);
assert.match(market,/referrerPolicy:'no-referrer'/);

assert.match(imageAudit,/Open Food Facts/);
assert.match(imageAudit,/openbeautyfacts/);
assert.match(imageAudit,/openproductsfacts/);
assert.match(imageAudit,/openpetfoodfacts/);
assert.match(imageAudit,/safeProductImageUrl=safeImageUrl/,'v60 runtime must extend the image sanitizer before resolved images are persisted');
assert.match(imageAudit,/safeRetailerProductUrl/);
assert.match(imageAudit,/safeRetailerImageUrl/);
assert.match(imageAudit,/JINA_READER_ORIGIN='https:\/\/r\.jina\.ai'/);
assert.match(imageAudit,/matchedBy:'retailer'/);
assert.match(imageAudit,/data-market-image-open/,'product images must remain interactive');

assert.match(officialBridge,/safeOfficialImageUrl/);
assert.match(officialBridge,/\[data-market-add-product\]/);
assert.match(officialBridge,/persistResolvedItem/);
assert.match(officialBridge,/dataset\.marketImageOfficial='1'/);
assert.match(officialBridge,/Ver no \$\{label\}/);
assert.match(officialBridge,/headers:\{Accept:'application\/json'\}/);
assert.doesNotMatch(officialBridge,/headers:\{[^}]*['"]X-(?:With-Images-Summary|Retain-Images)/);

assert.match(barcode,/image_front_small_url,image_front_url/);
assert.match(barcode,/safeProductImageUrl\(product\.image_front_small_url\|\|product\.image_front_url/);
assert.match(render,/function marketProductImageHtml/);
assert.match(render,/market-identity-with-photo/);
assert.match(render,/marketProductImageHtml\(item\)/);
assert.match(css,/v57 — fotografias reais de referência no Mercado/);
assert.match(css,/\.market-product-photo img/);
assert.match(css,/object-fit:contain/);
assert.match(css,/market-mobile-head::before\{content:none!important/);

// index.html remains the stable source template; the Pages build expands CSP at v61.
assert.match(index,/img-src 'self' data: blob: https:\/\/images\.openfoodfacts\.org;/);
assert.match(sw,/conta-de-casa-public-v61-official-images-bridge/);
assert.match(sw,/\.\/market-official-images\.js/);

console.log('Market real and official product image tests: OK');
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
const official=fs.readFileSync('market-official-images.js','utf8');

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

assert.match(imageAudit,/openbeautyfacts/);
assert.match(imageAudit,/openproductsfacts/);
assert.match(imageAudit,/openpetfoodfacts/);
assert.match(imageAudit,/safeProductImageUrl=safeImageUrl/,'v59 fallback must extend the Open Facts sanitizer');
assert.match(imageAudit,/data-market-image-open/,'fallback product images must remain interactive');
assert.match(official,/safeProductImageUrl=safeCombinedProductImageUrl/,'v60 must extend persistence to official retailer images');
assert.match(official,/data-market-official-image-open/);

assert.match(barcode,/image_front_small_url,image_front_url/);
assert.match(barcode,/safeProductImageUrl\(product\.image_front_small_url\|\|product\.image_front_url/);
assert.match(render,/function marketProductImageHtml/);
assert.match(render,/market-identity-with-photo/);
assert.match(render,/marketProductImageHtml\(item\)/);
assert.match(css,/v57 — fotografias reais de referência no Mercado/);
assert.match(css,/\.market-product-photo img/);
assert.match(css,/object-fit:contain/);
assert.match(css,/market-mobile-head::before\{content:none!important/);

// index.html is the stable source template; the Pages build expands the CSP in v60.
assert.match(index,/img-src 'self' data: blob: https:\/\/images\.openfoodfacts\.org;/);
assert.match(sw,/conta-de-casa-public-v60-official-retailer-images/);

console.log('Market real product image tests: OK');

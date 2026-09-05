const assert=require('node:assert/strict');
const fs=require('node:fs');

const market=fs.readFileSync('market-experience.js','utf8');
const resolver=fs.readFileSync('market-image-resolver.js','utf8');
const build=fs.readFileSync('scripts/build-market-image-index.cjs','utf8');
const index=fs.readFileSync('index.html','utf8');
const pages=fs.readFileSync('.github/workflows/pages.yml','utf8');
const prepare=fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const sw=fs.readFileSync('sw.js','utf8');

assert.match(market,/const RESULTS_PER_STORE=20/);
assert.match(market,/const MAX_REMOTE_RESULTS=40/);
assert.match(market,/limit:RESULTS_PER_STORE/);
assert.match(market,/retailerPid/);
assert.match(market,/cdc:market-results/);
assert.match(market,/CDCMarketImages\?\.enrichForSave/);
assert.match(market,/CDCMarketImages\?\.sourceKey/);
assert.match(market,/function balancedResults/);

assert.match(resolver,/market-image-index\.json\?v=58/);
assert.match(resolver,/name:'get_product'/);
assert.match(resolver,/EAN:\\s\*\(\[0-9\]\{8,14\}\)/);
assert.match(resolver,/api\/v2\/product\//);
assert.match(resolver,/Open Food Facts · EAN/);
assert.match(resolver,/Imagem oficial do produto no retalhista/);
assert.match(resolver,/retailer:\(continente\|pingo-doce\)/);
assert.match(resolver,/bestIndexMatch/);
assert.match(resolver,/IntersectionObserver/);
assert.doesNotMatch(resolver,/fetch\(product\.sourceUrl/,'browser must not scrape retailer HTML directly');

assert.match(build,/OfficialImageIndex|Official market image index|image index/i);
assert.match(build,/const SEARCH_LIMIT=12/);
assert.match(build,/detergente loiça/);
assert.match(build,/farinha/);
assert.match(build,/arroz/);
assert.match(build,/static\.pingodoce\.pt/);
assert.match(build,/www\.continente\.pt/);
assert.match(build,/images\/large/);
assert.match(build,/images\/col/);
assert.match(build,/market-image-index\.json/);

assert.match(index,/market-image-resolver\.js\?v=58/);
assert.match(index,/img-src 'self' data: blob: https:\/\/images\.openfoodfacts\.org https:\/\/www\.continente\.pt https:\/\/static\.pingodoce\.pt https:\/\/www\.pingodoce\.pt;/);
assert.ok(prepare.includes("'market-image-resolver.js'"));
assert.match(sw,/conta-de-casa-public-v58-official-images/);
assert.ok(sw.includes("'./market-image-resolver.js'"));
assert.match(pages,/build-market-image-index\.cjs dist\/market-image-index\.json/);

console.log('Market official/reference image resolution and expanded-catalog tests: OK');

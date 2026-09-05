const assert = require('node:assert/strict');
const fs = require('node:fs');

const index = fs.readFileSync('index.html','utf8');
const css = fs.readFileSync('market-experience.css','utf8');
const js = fs.readFileSync('market-experience.js','utf8');
const sw = fs.readFileSync('sw.js','utf8');
const pages = fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const events = fs.readFileSync('events.js','utf8');

assert.match(index, /<meta name="app-build" content="v52"/);
assert.match(index, /market-experience\.css\?v=52/);
assert.match(index, /market-experience\.js\?v=52/);
assert.match(index, /id="appBuildVersion">v52</);
assert.match(index, /connect-src 'self' https:\/\/api\.github\.com https:\/\/cesta\.pt https:\/\/prices\.openfoodfacts\.org;/);
assert.match(events, /register\('\.\/sw\.js\?v=52',\{updateViaCache:'none'\}\)/);
assert.match(sw, /conta-de-casa-public-v52/);

for (const asset of ['market-experience.css','market-experience.js']) {
  assert.ok(sw.includes(`'./${asset}'`), `${asset} must be cached by the service worker`);
  assert.ok(pages.includes(`'${asset}'`), `${asset} must be included in the Pages bundle`);
}

for (const market of ['Pingo Doce','Continente','Mercadona']) assert.ok(js.includes(market));
assert.ok(js.includes("data-market-price-mode=\"live\""), 'market browser must explicitly use live/verified data mode');
assert.ok(js.includes("https://cesta.pt/mcp"), 'Continente/Pingo Doce provider must be explicit');
assert.ok(js.includes("https://prices.openfoodfacts.org/api/v1"), 'Mercadona verified-observation provider must be explicit');
assert.ok(js.includes("name:'search_products'"), 'cesta MCP search tool must be used');
assert.ok(js.includes("osm_name__like:'Mercadona'"), 'Mercadona location filtering must be explicit');
assert.ok(js.includes("osm_address_country__like:'Portugal'"), 'Mercadona observations must be restricted to Portugal');
assert.ok(js.includes("item?.proof_id||item?.proof?.id"), 'Mercadona results must require proof evidence');
assert.ok(js.includes("observedDate"), 'Mercadona observation date must be carried to the UI');
assert.ok(js.includes("pode já ter mudado"), 'old observations must not be presented as current');
assert.ok(js.includes("A pesquisa é enviada apenas às fontes necessárias"), 'remote-search privacy disclosure must be visible');
assert.match(js, /estimatedCents:product\.priceCents/);
assert.match(js, /sourceUrl=safeRetailerUrl/);
assert.match(js, /data-market-source-url=/);
assert.match(js, /window\.open\(url,'_blank','noopener,noreferrer'\)/);
assert.match(js, /actualCents:0,purchased:false/);
assert.match(js, /cleanRemoteText/);
assert.match(js, /esc\(product\.name\)/);

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

const remSizes = [...css.matchAll(/font-size:\s*([0-9.]+)rem/g)].map(match => Number(match[1]));
assert.ok(remSizes.length > 0);
assert.ok(remSizes.every(size => size >= 0.75), `market live UI contains text smaller than 12px: ${Math.min(...remSizes)}rem`);
for (const target of ['44px','48px','52px']) assert.ok(css.includes(target));

console.log('Market live-source, verification, privacy and responsive invariants: OK');
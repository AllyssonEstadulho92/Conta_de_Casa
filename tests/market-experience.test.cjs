const assert = require('node:assert/strict');
const fs = require('node:fs');

const index = fs.readFileSync('index.html','utf8');
const css = fs.readFileSync('market-experience.css','utf8');
const js = fs.readFileSync('market-experience.js','utf8');
const sw = fs.readFileSync('sw.js','utf8');
const pages = fs.readFileSync('scripts/prepare-pages.cjs','utf8');

assert.match(index, /<meta name="app-build" content="v51"/);
assert.match(index, /market-experience\.css\?v=51/);
assert.match(index, /market-experience\.js\?v=51/);
assert.match(index, /id="appBuildVersion">v51</);

for (const asset of ['market-experience.css','market-experience.js']) {
  assert.ok(sw.includes(`'./${asset}'`), `${asset} must be cached by the service worker`);
  assert.ok(pages.includes(`'${asset}'`), `${asset} must be included in the Pages bundle`);
}
assert.match(sw, /conta-de-casa-public-v51/);

for (const market of ['Pingo Doce','Continente','Mercadona']) assert.ok(js.includes(market));
assert.ok(js.includes("data-market-price-mode=\"demo\""), 'prototype prices must be explicitly identified as demo data');
assert.ok(js.includes('não são preços em tempo real'), 'the UI must not present prototype values as live prices');
assert.ok(js.includes('estimatedCents:0'), 'demo prices must never be persisted as financial estimates');
assert.ok(!/\bfetch\s*\(/.test(js), 'prototype market layer must not introduce unverified external network calls');
assert.ok(!js.includes('<label class="market-browser-search"'), 'search must not nest an interactive button inside a label');
assert.ok(js.includes("if(close){\n      close.textContent='×';"), 'shared dialog close control must be restored after leaving market browser');

for (const marker of ['@media(max-width:820px)','@media(max-width:430px)','@media(max-width:359px)','@media(min-width:821px) and (max-width:1180px)','@media(min-width:1181px)']) {
  assert.ok(css.includes(marker), `missing responsive rule ${marker}`);
}
assert.ok(css.includes('env(safe-area-inset-top)'), 'market dialog must account for the top safe area');
assert.ok(css.includes('env(safe-area-inset-bottom)'), 'market dialog/page must account for the bottom safe area');
assert.ok(css.includes('min-width:0'), 'market layouts must allow content to shrink without horizontal overflow');
assert.ok(css.includes('overflow:visible'), 'market page must not hide content to solve layout constraints');

const remSizes = [...css.matchAll(/font-size:\s*([0-9.]+)rem/g)].map(match => Number(match[1]));
assert.ok(remSizes.length > 0);
assert.ok(remSizes.every(size => size >= 0.75), `market prototype contains text smaller than 12px: ${Math.min(...remSizes)}rem`);

for (const target of ['44px','48px','52px']) assert.ok(css.includes(target));

console.log('Market prototype wiring, safety and responsive invariants: OK');

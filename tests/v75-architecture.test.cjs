'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const js=read('v75-architecture.js');
const css=read('v75-architecture.css');
const legacy=read('styles.css');
const prepare=read('scripts/prepare-pages.cjs');
const sw=read('sw.js');
const release=JSON.parse(read('release-manifest.json'));

assert.match(js,/Conta de Casa v75/);
assert.match(js,/bills:\['Despesas','Movimentos'\]/);
assert.match(js,/market:\['Mercado','Compras'\]/);
assert.match(js,/settings:\['Mais','Conta e aplicação'\]/);
assert.match(js,/DRAWER_GROUPS/);
assert.match(js,/Principal[\s\S]*Despesas[\s\S]*Mercado[\s\S]*Planeamento/);
assert.match(js,/MORE_GROUPS/);
assert.match(js,/Privacidade e dados/);
assert.match(js,/Aparência/);
assert.doesNotMatch(js,/MORE_GROUPS[\s\S]{0,700}As minhas listas/,'More must not duplicate the Mercado primary destination');
assert.doesNotMatch(js,/MORE_GROUPS[\s\S]{0,700}Planeamento e orçamento/,'More must not duplicate the Planeamento primary destination');
assert.doesNotMatch(js,/saveState\(|commit\(|estimatedCents\s*=|actualCents\s*=/,'architecture layer must not mutate financial state');

assert.match(legacy,/\.mobile-nav \.nav-btn:nth-child\(3\)\{visibility:hidden\}/,'historical regression must remain explicitly covered');
assert.match(css,/\.mobile-nav \.nav-btn:nth-child\(3\)\{visibility:visible!important;display:grid!important\}/,'Mercado must be visible as the third primary destination');
assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/);
assert.match(css,/\.vault-keypad\{display:grid!important;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/,'PIN keypad must use a conventional three-column layout');
assert.match(css,/#page-planning>\.section-tabs \.section-tab\.active/,'Planning tabs must have an explicit active state');
assert.match(css,/\.v75-more-group/);
assert.match(css,/background:var\(--v75-surface\)!important/,'v75 must use theme-aware surfaces instead of mixing hard-coded light/dark cards');

assert.match(prepare,/const BUILD = 'v75'/);
assert.match(prepare,/const ARCHITECTURE_REV = '75-architecture1'/);
assert.ok(prepare.includes("'v75-architecture.css'"));
assert.ok(prepare.includes("'v75-architecture.js'"));
assert.match(sw,/conta-de-casa-public-v75-architecture1/);
assert.ok(sw.includes("'./v75-architecture.css'"));
assert.ok(sw.includes("'./v75-architecture.js'"));
assert.equal(release.latestVersion,'v75');
assert.equal(release.releases[0].version,'v75');
assert.ok(release.releases[0].items.some(item=>/Mercado.*barra inferior|barra inferior.*Mercado/i.test(item)));
assert.ok(release.releases[0].items.some(item=>/PIN|cofre/i.test(item)));

console.log('v75 information architecture, navigation visibility, theme consistency and PIN layout tests: OK');

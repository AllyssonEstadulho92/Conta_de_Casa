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
assert.match(js,/Conta e dados/);
assert.match(js,/Aparência/);
assert.match(js,/ensureBillTabs/,'new expense flow must expose Manual, invoice and QR modes');
assert.match(js,/data-v75-bill-mode="manual"/);
assert.match(js,/data-v75-bill-mode="image"/);
assert.match(js,/data-v75-bill-mode="qr"/);
assert.match(js,/placeDashboardGreeting/,'dashboard greeting must become part of the mobile header composition');
assert.match(js,/v75-sync-hero/,'synchronization must expose a concise state-first composition');
assert.doesNotMatch(js,/MORE_GROUPS[\s\S]{0,900}As minhas listas/,'More must not duplicate the Mercado primary destination');
assert.doesNotMatch(js,/MORE_GROUPS[\s\S]{0,900}Planeamento e orçamento/,'More must not duplicate the Planeamento primary destination');
assert.doesNotMatch(js,/saveState\(|commit\(|estimatedCents\s*=|actualCents\s*=/,'prototype layer must not mutate financial state');

assert.match(legacy,/\.mobile-nav \.nav-btn:nth-child\(3\)\{visibility:hidden\}/,'historical regression must remain explicitly covered');
assert.match(css,/\.mobile-nav \.nav-btn,html\.cdc-v75 \.mobile-nav \.nav-btn:nth-child\(3\)[\s\S]*visibility:visible!important/,'Mercado must be visible as the third primary destination');
assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/);
assert.match(css,/--v75-header:#004653/,'prototype teal header must remain canonical');
assert.match(css,/--v75-bg:#f3f7f7/,'prototype light shell must remain canonical');
assert.match(css,/url\('\.\/icon\.svg'\)/,'the local PWA identity must be reused instead of a foreign visual asset');
assert.match(css,/#formDialog\.dialog\{width:100vw!important/,'mobile expense flow must be full screen');
assert.match(css,/\.invoice-scan-overlay[\s\S]*inset:0!important/,'invoice QR scanner must use the full-screen prototype composition');
assert.match(css,/\.vault-keypad\{display:grid!important;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/,'PIN keypad must use a conventional three-column layout');
assert.match(css,/#page-planning>\.section-tabs \.section-tab\.active/,'Planning tabs must have an explicit active state');
assert.match(css,/\.v75-more-group/);
assert.match(css,/\.v75-budget-summary/);
assert.match(css,/\.v75-sync-hero/);
assert.match(css,/background:var\(--v75-surface\)!important/,'v75 must use coherent surfaces instead of mixed hard-coded cards');
assert.match(css,/prefers-reduced-motion:reduce/);

assert.match(prepare,/const BUILD = 'v76'/);
assert.match(prepare,/const ARCHITECTURE_REV = '75-architecture2'/);
assert.ok(prepare.includes("'v75-architecture.css'"));
assert.ok(prepare.includes("'v75-architecture.js'"));
assert.match(sw,/conta-de-casa-public-v76-release1-v75-architecture2/);
assert.ok(sw.includes("'./v75-architecture.css'"));
assert.ok(sw.includes("'./v75-architecture.js'"));
assert.equal(release.latestVersion,'v76');
assert.equal(release.releases[0].version,'v76');
const v75=release.releases.find(item=>item.version==='v75');
assert.ok(v75,'v75 release history must remain available under v76');
assert.ok(v75.items.some(item=>/Mercado.*barra inferior|barra inferior.*Mercado/i.test(item)));
assert.ok(v75.items.some(item=>/PIN|cofre/i.test(item)));

console.log('v75 prototype fidelity and information architecture preserved under the v76 release: OK');

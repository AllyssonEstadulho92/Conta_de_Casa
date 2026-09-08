'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const css=read('v76-usability.css');
const prepare=read('scripts/prepare-pages.cjs');
const sw=read('sw.js');
const release=JSON.parse(read('release-manifest.json'));

assert.match(css,/Conta de Casa v76/);
assert.doesNotMatch(css,/\bzoom\s*:/i,'v76 must not use CSS zoom as a layout workaround');

/* Planeamento: o resumo tem de existir em desktop e adaptar-se em mobile. */
assert.match(css,/@media \(min-width: 821px\)[\s\S]*#page-planning > \.cdc-planning-overview[\s\S]*display: grid !important/,'desktop planning overview must override the historical mobile-only hide rule');
assert.match(css,/\.cdc-planning-categories > div[\s\S]*grid-template-areas:[\s\S]*"dot name value"[\s\S]*"dot track track"/,'planning categories must use a two-row fluid grid');
assert.match(css,/@media \(max-width: 370px\)[\s\S]*\.v75-budget-summary[\s\S]*grid-template-columns: 1fr !important/,'narrow phones must stack the budget summary');
assert.match(css,/\.cdc-planning-categories > div > b[\s\S]*white-space: nowrap !important/,'money values must remain intact');
assert.match(css,/\.cdc-planning-categories > div > strong[\s\S]*white-space: normal !important/,'category names must be allowed to wrap');

/* Leitura e interação: validar a camada final, não apenas a base v74/v75. */
for(const selector of ['#notificationsBtn','\.mobile-menu-btn','\.cdc-greeting-bell','#formDialog \.dialog-close','\.invoice-scan-close']){
  assert.match(css,new RegExp(`${selector}[\\s\\S]{0,650}min-width: 44px !important[\\s\\S]{0,220}min-height: 44px !important`),`${selector} must keep a 44px final touch target`);
}
assert.match(css,/\.mobile-nav \.nav-btn,[\s\S]*min-height: 58px !important/,'bottom navigation touch area must remain 58px');
assert.match(css,/\.page-heading h1[\s\S]*white-space: normal !important[\s\S]*text-overflow: clip !important/,'long mobile page titles must not be ellipsized');
assert.match(css,/\.v75-more-row small,[\s\S]*white-space: normal !important[\s\S]*text-overflow: clip !important/,'More descriptions must remain readable');
assert.match(css,/\.cdc-product-grid[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\) !important/,'mobile market products must use two readable columns');
assert.match(css,/\.cdc-product-card > strong[\s\S]*-webkit-line-clamp: 2 !important/,'product names may use two lines instead of single-line truncation');
assert.match(css,/prefers-reduced-motion: reduce/);

/* Distribuição: a correção precisa chegar ao Pages e ao cache offline. */
assert.match(prepare,/const BUILD = 'v76'/);
assert.match(prepare,/const USABILITY_REV = '76-usability1'/);
assert.ok(prepare.includes("'v76-usability.css'"));
assert.match(prepare,/v76-usability\.css\?v=\$\{USABILITY_REV\}/);
assert.match(sw,/conta-de-casa-public-v76-usability1/);
assert.ok(sw.includes("'./v76-usability.css'"));
assert.equal(release.latestVersion,'v76');
assert.equal(release.releases[0].version,'v76');
assert.ok(release.releases[0].items.some(item=>/Planeamento.*cortar|cortar.*Planeamento/i.test(item)));
assert.ok(release.releases[0].items.some(item=>/44 píxeis/i.test(item)));

console.log('v76 usability, planning overflow, final touch targets and distribution tests: OK');

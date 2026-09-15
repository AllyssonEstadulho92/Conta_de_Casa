const assert=require('node:assert/strict');
const fs=require('node:fs');

const css=fs.readFileSync('mobile-layout.css','utf8');
const index=fs.readFileSync('index.html','utf8');
const events=fs.readFileSync('events.js','utf8');

assert.match(css,/76-bills-mobile-filters1/,'mobile bill filters revision marker must remain explicit');
assert.match(css,/#page-bills \.bill-search-wrap::before,[\s\S]*#page-bills \.bill-search-wrap::after[\s\S]*display:none!important/,'legacy CSS magnifier must be disabled when Lucide search control is active');
assert.match(css,/#page-bills>\.bill-filter-grid[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/,'mobile filters must use the approved two-column composition');
assert.match(css,/content:"Filtros"!important/,'mobile filter card must expose a clear visual heading');
assert.match(css,/content:"Refine a sua pesquisa de despesas"!important/,'mobile filter card must expose supporting copy');
assert.match(css,/#billClearFilters[\s\S]*min-height:44px!important/,'clear action must keep a 44px touch target');
assert.match(css,/@media\(max-width:360px\)[\s\S]*grid-template-columns:minmax\(0,1fr\)!important/,'very narrow phones must stack filters instead of clipping labels');
assert.match(css,/@media\(forced-colors:active\)/,'forced-colors fallback must remain explicit');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/,'reduced-motion fallback must remain explicit');

for(const id of ['billSearch','newBillBtn','billStatusFilter','billCategoryFilter','billDateFrom','billDateTo','billSort','billClearFilters']){
  assert.match(index,new RegExp(`id="${id}"`),`${id} must remain in canonical bills markup`);
}
assert.match(events,/\['#billStatusFilter','#billCategoryFilter','#billDateFrom','#billDateTo','#billSort'\]/,'existing bill filter listeners must remain the functional authority');
assert.match(events,/\$\('#billSearch'\)\.addEventListener\('input',renderBills\)/,'bill search listener must remain unchanged');

console.log('Conta de Casa mobile bills search/filter layout preserves canonical IDs, handlers and accessibility fallbacks: OK');

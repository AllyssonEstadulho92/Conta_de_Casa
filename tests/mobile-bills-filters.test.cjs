const assert=require('node:assert/strict');
const fs=require('node:fs');

const css=fs.readFileSync('mobile-layout.css','utf8');
const index=fs.readFileSync('index.html','utf8');
const events=fs.readFileSync('events.js','utf8');

assert.match(css,/76-bills-mobile-filters1/,'mobile bill filters revision marker must remain explicit');
assert.match(css,/76-bills-mobile-spacing1/,'mobile bills spacing revision marker must remain explicit');
assert.match(css,/#page-bills \.bill-search-wrap::before,[\s\S]*#page-bills \.bill-search-wrap::after[\s\S]*display:none!important/,'legacy CSS magnifier must be disabled when Lucide search control is active');
assert.match(css,/#page-bills>\.bill-filter-grid[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/,'mobile filters must use the approved two-column composition');
assert.match(css,/--bills-mobile-section-gap:20px/,'search and filter cards must share the approved section spacing token');
assert.match(css,/\.bill-command-bar[\s\S]*margin:0 0 var\(--bills-mobile-section-gap\)!important/,'search card must keep deliberate space before filters');
assert.match(css,/content:"Filtros"!important/,'mobile filter card must expose a clear visual heading');
assert.match(css,/content:"Refine a sua pesquisa de despesas"!important/,'mobile filter card must expose supporting copy');
assert.match(css,/\.bill-filter-grid::after[\s\S]*margin:4px 0 0!important/,'filter supporting copy must use positive spacing instead of the historical negative offset');
assert.match(css,/\.bill-filter-field:nth-child\(1\)[^\n]*margin-top:22px!important/,'first filter row must have clear separation from the filter header');
assert.match(css,/#billClearFilters[\s\S]*min-height:44px!important[\s\S]*margin:12px 0 0!important/,'clear action must keep a 44px touch target and visual separation');
assert.match(css,/@media\(max-width:360px\)[\s\S]*grid-template-columns:minmax\(0,1fr\)!important/,'very narrow phones must stack filters instead of clipping labels');
assert.match(css,/@media\(max-width:360px\)[\s\S]*\.bill-filter-field\{[\s\S]*margin-top:14px!important/,'very narrow phones must retain regular vertical rhythm after stacking');
assert.match(css,/@media\(forced-colors:active\)/,'forced-colors fallback must remain explicit');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/,'reduced-motion fallback must remain explicit');

for(const id of ['billSearch','newBillBtn','billStatusFilter','billCategoryFilter','billDateFrom','billDateTo','billSort','billClearFilters']){
  assert.match(index,new RegExp(`id="${id}"`),`${id} must remain in canonical bills markup`);
}
assert.match(events,/\['#billStatusFilter','#billCategoryFilter','#billDateFrom','#billDateTo','#billSort'\]/,'existing bill filter listeners must remain the functional authority');
assert.match(events,/\$\('#billSearch'\)\.addEventListener\('input',renderBills\)/,'bill search listener must remain unchanged');

console.log('Conta de Casa mobile bills search/filter layout preserves canonical IDs, handlers, spacing and accessibility fallbacks: OK');

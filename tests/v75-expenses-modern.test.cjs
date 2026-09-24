'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {spawnSync}=require('node:child_process');

const css=fs.readFileSync('v75-expenses-modern.css','utf8');
const mobileCss=fs.readFileSync('mobile-layout.css','utf8');
const mobileShell=fs.readFileSync('v76-mobile-shell.css','utf8');
const prep=fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const index=fs.readFileSync('index.html','utf8');

assert.match(css,/html\.cdc-v75 #page-bills/,'A camada deve ficar isolada a #page-bills.');
assert.match(css,/\.bill-command-bar/,'A barra de pesquisa\/criação deve ser estilizada.');
assert.match(css,/\.bill-filter-grid/,'Os filtros canónicos devem permanecer presentes e estilizados.');
assert.match(css,/\.bill-summary-grid/,'O resumo financeiro deve permanecer presente.');
assert.match(css,/\.bill-table-shell/,'A tabela desktop deve manter uma apresentação própria.');
assert.match(css,/\.bill-mobile-card/,'Os cartões mobile devem manter uma apresentação própria.');
assert.match(css,/76-expenses-canonical-flow1/,'Despesas deve declarar a autoridade funcional canónica da v76.');
assert.match(css,/#page-bills>#billsList\{[\s\S]*display:block!important[\s\S]*visibility:visible!important/,'A lista canónica de faturas deve anular qualquer display:none legado.');
assert.match(css,/#page-bills>#billSummary\{[\s\S]*display:grid!important/,'O resumo canónico deve continuar montado.');
assert.match(css,/#page-bills>\.bill-command-bar\{[\s\S]*display:grid!important/,'Pesquisa e Nova fatura não podem desaparecer.');

// A apresentação móvel final deixou de usar uma faixa horizontal. mobile-layout.css
// neutraliza explicitamente o layout histórico sem tocar no fluxo funcional.
assert.match(mobileCss,/76-bills-mobile-alignment2/);
assert.match(mobileCss,/body #app #page-bills>\.bill-filter-grid\{[\s\S]*display:grid!important;[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important;[\s\S]*overflow-x:hidden!important;/);
assert.match(mobileCss,/body #app #page-bills>\.bill-filter-grid::before\{[\s\S]*content:"Filtros"!important/);
assert.match(mobileCss,/body #app #page-bills>\.bill-filter-grid::after\{[\s\S]*content:"Refine a sua pesquisa de despesas"!important/);
assert.match(mobileCss,/\.bill-filter-field:nth-child\(5\)\{[\s\S]*grid-column:1\/-1!important/,'Ordenar deve usar uma linha completa.');
assert.match(mobileCss,/#billClearFilters\{[\s\S]*min-height:44px!important/,'Limpar filtros mantém touch target acessível.');
assert.match(mobileCss,/@media\(max-width:360px\)/,'A revisão deve incluir ecrãs realmente estreitos.');
assert.doesNotMatch(mobileCss,/scroll-snap-type:x proximity/,'A camada final não deve regressar à faixa horizontal de filtros.');
assert.match(mobileCss,/@media\(prefers-reduced-motion:reduce\)/,'A revisão deve respeitar reduced motion.');
assert.match(mobileCss,/@media\(forced-colors:active\)/,'A revisão deve ter fallback de alto contraste.');

assert.match(mobileShell,/76-bills-filter-collapse1/,'A camada final deve recolher filtros avançados no telemóvel.');
assert.match(mobileShell,/#page-bills:not\(\.bill-filters-open\)>\.bill-filter-grid\{[\s\S]*display:none!important/,'Filtros avançados devem começar ocultos em mobile.');
assert.match(mobileShell,/#billFiltersToggle\{[\s\S]*display:inline-flex!important/,'O acesso aos filtros deve permanecer disponível através de um botão compacto.');

for(const source of [css,mobileCss,mobileShell]){
  for(const forbidden of ['commit(','saveState(','estimatedCents','actualCents','PBKDF2','AES-GCM','indexedDB']){
    assert.equal(source.includes(forbidden),false,`CSS visual não pode conter lógica/segurança: ${forbidden}`);
  }
}

for(const canonical of ['billSearch','billFiltersToggle','billFilterGrid','newBillBtn','billStatusFilter','billCategoryFilter','billDateFrom','billDateTo','billSort','billClearFilters','billSummary','billsList']){
  assert.match(index,new RegExp(`id="${canonical}"`),`Fluxo canónico de Despesas em falta: ${canonical}`);
}

assert.match(prep,/const EXPENSES_REV = '75-expenses1';/,'A revisão base de Despesas continua versionada no build.');
assert.match(prep,/'v75-expenses-modern\.css'/,'O CSS base deve entrar na allowlist pública.');
assert.match(prep,/v75-expenses-modern\.css\?v=\$\{EXPENSES_REV\}/,'O CSS base deve ser injetado com revisão própria.');
assert.match(sw,/expenses1/,'O cache deve preservar a revisão base de Despesas.');
assert.match(sw,/canonical-expense-market1/,'A PWA deve preservar a composição canónica.');
assert.match(sw,/expenses-mobile-alignment2/,'A PWA deve invalidar para a nova composição móvel.');
assert.match(sw,/\.\/v75-expenses-modern\.css/,'O Service Worker deve precachear o CSS de Despesas.');
assert.match(sw,/\.\/mobile-layout\.css/,'O Service Worker deve precachear a camada móvel final.');

const build=spawnSync(process.execPath,['scripts/prepare-pages.cjs'],{encoding:'utf8'});
assert.equal(build.status,0,build.stderr||build.stdout);
const distIndex=fs.readFileSync('dist/index.html','utf8');
assert.match(distIndex,/v75-expenses-modern\.css\?v=75-expenses1/,'Pages deve carregar a revisão base de Despesas.');
assert.match(distIndex,/mobile-layout\.css\?v=76/,'Pages deve carregar a camada móvel da release atual.');
const pagesPos=distIndex.indexOf('v75-pages.css');
const expensesPos=distIndex.indexOf('v75-expenses-modern.css');
const usabilityPos=distIndex.indexOf('v75-usability.css');
assert.ok(pagesPos>=0&&expensesPos>pagesPos,'A camada moderna deve carregar depois de v75-pages.');
assert.ok(usabilityPos>expensesPos,'A política de usabilidade deve continuar depois da base de Despesas.');

console.log('v76 canonical Expenses flow keeps one functional source with filters collapsed by default on mobile: OK');

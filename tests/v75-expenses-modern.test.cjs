'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {spawnSync}=require('node:child_process');

const css=fs.readFileSync('v75-expenses-modern.css','utf8');
const prep=fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const sw=fs.readFileSync('sw.js','utf8');

assert.match(css,/html\.cdc-v75 #page-bills/,'A camada deve ficar isolada a #page-bills.');
assert.match(css,/\.bill-command-bar/,'A barra de pesquisa/criação deve ser estilizada.');
assert.match(css,/\.bill-filter-grid/,'Os filtros canónicos devem permanecer visíveis e estilizados.');
assert.match(css,/\.bill-summary-grid/,'O resumo financeiro deve permanecer presente.');
assert.match(css,/\.bill-table-shell/,'A tabela desktop deve manter uma apresentação própria.');
assert.match(css,/\.bill-mobile-card/,'Os cartões mobile devem manter uma apresentação própria.');
assert.match(css,/@media\(max-width:820px\)/,'A revisão deve incluir mobile.');
assert.match(css,/@media\(max-width:430px\)/,'A revisão deve incluir ecrãs estreitos.');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/,'A revisão deve respeitar reduced motion.');
assert.match(css,/@media\(forced-colors:active\)/,'A revisão deve ter fallback de alto contraste.');

for(const forbidden of ['commit(','saveState(','estimatedCents','actualCents','PBKDF2','AES-GCM','indexedDB']){
  assert.equal(css.includes(forbidden),false,`CSS visual não pode conter lógica/segurança: ${forbidden}`);
}

assert.match(prep,/const EXPENSES_REV = '75-expenses1';/,'A revisão de Despesas deve estar versionada no build.');
assert.match(prep,/'v75-expenses-modern\.css'/,'O CSS deve entrar na allowlist pública.');
assert.match(prep,/v75-expenses-modern\.css\?v=\$\{EXPENSES_REV\}/,'O CSS deve ser injetado com revisão própria.');
assert.match(sw,/expenses1/,'O cache deve invalidar na revisão de Despesas.');
assert.match(sw,/\.\/v75-expenses-modern\.css/,'O Service Worker deve precachear o CSS de Despesas.');

const build=spawnSync(process.execPath,['scripts/prepare-pages.cjs'],{encoding:'utf8'});
assert.equal(build.status,0,build.stderr||build.stdout);
const distIndex=fs.readFileSync('dist/index.html','utf8');
assert.match(distIndex,/v75-expenses-modern\.css\?v=75-expenses1/,'Pages deve carregar a revisão de Despesas.');
const pagesPos=distIndex.indexOf('v75-pages.css');
const expensesPos=distIndex.indexOf('v75-expenses-modern.css');
const usabilityPos=distIndex.indexOf('v75-usability.css');
assert.ok(pagesPos>=0&&expensesPos>pagesPos,'A camada moderna deve carregar depois de v75-pages.');
assert.ok(usabilityPos>expensesPos,'A política final de usabilidade deve continuar por último.');

const render=fs.readFileSync('render.js','utf8');
for(const canonical of ['billSearch','billStatusFilter','billCategoryFilter','billDateFrom','billDateTo','billSort','billClearFilters','billSummary','billsList']){
  assert.ok(fs.readFileSync('index.html','utf8').includes(`id="${canonical}"`)||render.includes(`#${canonical}`),`Fluxo canónico de Despesas em falta: ${canonical}`);
}

console.log('v75 modern expenses UI tests: OK');

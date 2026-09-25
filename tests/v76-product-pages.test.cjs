'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');

const css=read('v76-product-pages.css');
const prepare=read('scripts/prepare-pages.cjs');
const sw=read('sw.js');
const render=read('render.js');
const finance=read('finance.js');
const forms=read('forms.js');
const market=read('market-experience.js');

assert.match(css,/76-product-pages1/);
assert.match(css,/76-prototype-dashboard1/);
assert.match(css,/#page-dashboard>#kpiGrid\{order:1\}/);
assert.match(css,/\.account-balance-kpi\{[\s\S]*grid-column:1\/-1!important/);
assert.match(css,/\.account-balance-kpi\{[\s\S]*background:var\(--v76-primary-strong,var\(--v76-primary\)\)!important[\s\S]*box-shadow:none!important/,'Saldo atual deve ser o hero teal sólido do protótipo');
assert.match(css,/\.account-balance-kpi>strong\{[\s\S]*color:#fff!important/);
assert.match(css,/\.account-balance-kpi>small\{[\s\S]*color:rgba\(255,255,255,.76\)!important/);
assert.match(css,/\.account-balance-kpi>\.kpi-action\{[\s\S]*min-height:44px!important/,'Atualizar saldo deve manter touch target acessível');
assert.match(css,/\.kpi-grid\{[\s\S]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
assert.match(css,/@media\(max-width:820px\)[\s\S]*\.kpi-grid\{[\s\S]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/,'mobile moderno mantém três indicadores compactos abaixo do hero');
assert.match(css,/@media\(max-width:359px\)[\s\S]*\.kpi-grid\{grid-template-columns:1fr!important\}/,'iPhone muito estreito deve regressar a uma coluna legível');
assert.match(css,/grid-template-areas:[\s\S]*"upcoming budget"[\s\S]*"activity category"/);
assert.match(css,/@media\(max-width:820px\)[\s\S]*grid-template-areas:[\s\S]*"upcoming"[\s\S]*"budget"[\s\S]*"category"[\s\S]*"activity"/);
assert.match(css,/\.dashboard-feature-head\{[\s\S]*grid-template-columns:44px minmax\(0,1fr\) auto!important/,'Dashboard section headers must match the visual hierarchy');
assert.match(css,/\.dashboard-priority-row\{[\s\S]*grid-template-areas:[\s\S]*"rank brand copy amount"[\s\S]*"rank brand copy due"/,'priority rows must preserve rank, identity, bill copy, amount and due state');
assert.match(css,/\.dashboard-priority-rank\{/);
assert.match(css,/\.dashboard-bill-brand\.tone-5/,'bill identity badge palette must remain local and deterministic');
assert.match(css,/\.dashboard-priority-due\{/);
assert.match(css,/\.dashboard-budget-card\{/);
assert.match(css,/\.dashboard-budget-track>span\{/);
assert.match(css,/@media\(max-width:390px\)[\s\S]*\.dashboard-feature-action span\{display:none!important\}/,'narrow iPhones must keep the header action accessible without crowding');
assert.match(css,/@media\(forced-colors:active\)/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);

// O redesign reutiliza os cálculos reais existentes; não inventa um novo modelo financeiro.
assert.match(render,/const n = dashboardNumbers\(\);/);
assert.match(render,/account-balance-kpi/);
assert.match(render,/function dashboardPriorityConfig\(index\)/,'Dashboard must expose one deterministic priority label mapper');
assert.match(render,/function dashboardUpcomingBillHtml\(bill,index,total\)/,'upcoming bills must use a dedicated Dashboard renderer');
assert.match(render,/upcoming\.map\(\(bill,index\)=>dashboardUpcomingBillHtml\(bill,index,upcoming\.length\)\)/,'upcoming bills must render their rank after canonical due-date sorting');
assert.match(render,/priority-pay/);
assert.match(render,/priority-next/);
assert.match(render,/priority-soon/);
assert.match(render,/priority-later/);
assert.match(render,/priority-relaxed/);
assert.match(render,/dashboard-budget-card/,'Dashboard budget must use the compact visual summary');
assert.match(render,/rawBudgetPct/,'budget text may show the real percentage while the progress bar stays visually bounded');
assert.match(render,/role="progressbar"/,'budget progress must expose accessible progress semantics');
assert.match(render,/\['Por pagar',n\.pending/);
assert.match(render,/\['Em atraso',n\.overdue/);
assert.match(render,/\['Saldo projetado',n\.projected/);
assert.match(finance,/function dashboardNumbers\(/);
assert.match(finance,/pendingCount:/);
assert.match(finance,/overdueCount:/);
assert.match(finance,/next7Count:/);

// O runtime v74 foi removido fisicamente. A camada v76 mantém uma proteção defensiva
// contra IDs antigos sem depender da existência do runtime que os criava.
assert.ok(!fs.existsSync(path.join(ROOT,'v74-experience.js')),'v74 runtime source must be physically deleted');
for(const legacyId of ['cdcMobileGreeting','cdcMobileMonthWrap','cdcMonthHero','cdcQuickActions','cdcDashboardCategories']){
  assert.match(css,new RegExp(`#${legacyId}`),`v76 dashboard composition keeps defensive suppression for legacy ${legacyId}`);
}
assert.match(css,/v76-dashboard-clean1/);
assert.match(css,/76-dashboard-priority1/,'dashboard priority hierarchy must remain explicit');
assert.match(css,/#cdcMobileGreeting,[\s\S]*#cdcMobileMonthWrap,[\s\S]*#cdcMonthHero,[\s\S]*#cdcQuickActions,[\s\S]*#cdcDashboardCategories[\s\S]*display:none!important/);
assert.match(css,/\.account-balance-kpi::after\{display:none!important\}/);
assert.match(css,/\.main>\.topbar\{[\s\S]*box-shadow:none!important/);
assert.match(css,/data-v75-page=\"dashboard\"[\s\S]*\.page-heading \.eyebrow[\s\S]*display:none!important/);

/* Regressão reportada: Mercado e Faturas mantêm sempre um caminho visível para
   criar registos e continuam a expor os resultados existentes. O CSS só protege
   visibilidade; handlers e domínio permanecem nos módulos funcionais. */
assert.match(css,/76-primary-actions-restore1/);
assert.match(css,/#page-bills \.bill-command-bar,[\s\S]*#page-market \.market-command-bar[\s\S]*display:grid!important[\s\S]*visibility:visible!important/);
assert.match(css,/#page-bills #newBillBtn,[\s\S]*#page-market #newMarketBtn[\s\S]*display:inline-flex!important[\s\S]*pointer-events:auto!important/);
assert.match(css,/#page-bills #billsList,[\s\S]*#page-market #marketList[\s\S]*visibility:visible!important[\s\S]*opacity:1!important/);
assert.match(css,/#formDialog #billForm \.v75-bill-tabs[\s\S]*display:flex!important/);
assert.match(css,/#formDialog\[data-mode=\"market-browser\"\] \.market-browser[\s\S]*display:block!important/);
assert.match(forms,/function openBillForm\(/);
assert.match(forms,/function openMarketForm\(/);
assert.match(market,/function openMarketBrowser\(/);
assert.match(market,/return target\?\.closest\?\.\('#newMarketBtn'\)/,'market browser must still intercept the visible add-item action');
assert.match(render,/function renderBills\(/);
assert.match(render,/function renderMarket\(/);

// A nova camada tem propriedade de composição de página, carrega antes do shell e entra no PWA.
assert.match(prepare,/const PRODUCT_PAGES_REV = '76-dashboard-priority1'/);
assert.match(prepare,/const DASHBOARD_REV = '76-dashboard-priority1'/);
assert.ok(prepare.includes('render.js?v=${DASHBOARD_REV}'),'render.js must receive a dedicated Dashboard cache-busting revision');
assert.ok(prepare.includes("'v76-product-pages.css'"));
const modern=prepare.indexOf('v76-modern-ui.css?v=${MODERN_UI_REV}');
const product=prepare.indexOf('v76-product-pages.css?v=${PRODUCT_PAGES_REV}');
const shell=prepare.indexOf('v76-mobile-shell.css?v=${MOBILE_SHELL_REV}');
assert.ok(modern>=0 && product>modern && shell>product,'product pages must load after visual tokens and before the mobile shell');
assert.match(sw,/dashboard-clean1/);
assert.match(sw,/prototype-dashboard1/,'PWA cache must refresh the prototype Dashboard');
assert.match(sw,/mobile-drawer-actions1/);
assert.ok(sw.includes("'./v76-product-pages.css'"));

// A camada de composição não pode assumir geometria global do shell.
assert.doesNotMatch(css,/\.app-shell\s*\{/);
assert.doesNotMatch(css,/body \.main\s*\{/);
assert.doesNotMatch(css,/\.mobile-nav\s*\{/);
assert.doesNotMatch(css,/safe-area-inset-/);

console.log('v76 product page hierarchy: prototype Dashboard plus visible Mercado/Faturas actions and PWA integration: OK');

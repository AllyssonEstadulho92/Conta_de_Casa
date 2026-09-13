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
const v74=read('v74-experience.js');

assert.match(css,/76-product-pages1/);
assert.match(css,/#page-dashboard>#kpiGrid\{order:1\}/);
assert.match(css,/\.account-balance-kpi\{[\s\S]*grid-column:1\/-1!important/);
assert.match(css,/\.kpi-grid\{[\s\S]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
assert.match(css,/grid-template-areas:[\s\S]*"upcoming budget"[\s\S]*"activity category"/);
assert.match(css,/@media\(max-width:820px\)[\s\S]*grid-template-areas:[\s\S]*"upcoming"[\s\S]*"budget"[\s\S]*"category"[\s\S]*"activity"/);
assert.match(css,/@media\(forced-colors:active\)/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);

// O redesign reutiliza os cálculos reais existentes; não inventa um novo modelo financeiro.
assert.match(render,/const n = dashboardNumbers\(\);/);
assert.match(render,/account-balance-kpi/);
assert.match(finance,/function dashboardNumbers\(/);
assert.match(finance,/pendingCount:/);
assert.match(finance,/overdueCount:/);
assert.match(finance,/next7Count:/);

// A camada v74 ainda existe por compatibilidade, mas a composição duplicada do Dashboard
// deixa de participar no produto v76. Cada conteúdo mantém um equivalente funcional real.
for(const legacyId of ['cdcMobileGreeting','cdcMobileMonthWrap','cdcMonthHero','cdcQuickActions','cdcDashboardCategories']){
  assert.match(v74,new RegExp(`id=\\"${legacyId}\\"`),`audit must prove legacy ${legacyId} is still injected by v74 before it is suppressed`);
  assert.match(css,new RegExp(`#${legacyId}`),`v76 dashboard composition must explicitly suppress duplicate ${legacyId}`);
}
assert.match(css,/v76-dashboard-clean1/);
assert.match(css,/#cdcMobileGreeting,[\s\S]*#cdcMobileMonthWrap,[\s\S]*#cdcMonthHero,[\s\S]*#cdcQuickActions,[\s\S]*#cdcDashboardCategories[\s\S]*display:none!important/);
assert.match(css,/\.account-balance-kpi\{[\s\S]*background:var\(--v76-surface\)!important;[\s\S]*box-shadow:none!important/);
assert.match(css,/\.account-balance-kpi::after\{display:none!important\}/);
assert.match(css,/\.main>\.topbar\{[\s\S]*box-shadow:none!important/);
assert.match(css,/data-v75-page=\"dashboard\"[\s\S]*\.page-heading \.eyebrow[\s\S]*display:none!important/);

// A nova camada tem propriedade de composição de página, carrega antes do shell e entra no PWA.
assert.match(prepare,/const PRODUCT_PAGES_REV = '76-dashboard-clean1'/);
assert.ok(prepare.includes("'v76-product-pages.css'"));
const modern=prepare.indexOf('v76-modern-ui.css?v=${MODERN_UI_REV}');
const product=prepare.indexOf('v76-product-pages.css?v=${PRODUCT_PAGES_REV}');
const shell=prepare.indexOf('v76-mobile-shell.css?v=${MOBILE_SHELL_REV}');
assert.ok(modern>=0 && product>modern && shell>product,'product pages must load after visual tokens and before the mobile shell');
assert.match(sw,/dashboard-clean1/);
assert.ok(sw.includes("'./v76-product-pages.css'"));

// A camada de composição não pode assumir geometria global do shell.
assert.doesNotMatch(css,/\.app-shell\s*\{/);
assert.doesNotMatch(css,/body \.main\s*\{/);
assert.doesNotMatch(css,/\.mobile-nav\s*\{/);
assert.doesNotMatch(css,/safe-area-inset-/);

console.log('v76 product page hierarchy: canonical Dashboard only, responsive order and PWA integration: OK');

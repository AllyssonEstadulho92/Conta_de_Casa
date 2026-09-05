const assert = require('node:assert/strict');
const fs = require('node:fs');

const legacyCss = fs.readFileSync('styles.css','utf8');
const designCss = fs.readFileSync('design-system.css','utf8');
const css = `${legacyCss}\n${designCss}`;
const events = fs.readFileSync('events.js','utf8');
const index = fs.readFileSync('index.html','utf8');
const render = fs.readFileSync('render.js','utf8');

assert.match(designCss, /Conta de Casa v50 — unified mobile action controls/);
assert.match(designCss, /--content-max:1480px/);
assert.match(designCss, /--sidebar-expanded:232px/);
assert.match(designCss, /--sidebar-rail:72px/);
assert.match(designCss, /html\.sidebar-collapsed/);
assert.match(designCss, /@media\(min-width:821px\) and \(max-width:1180px\)/);
assert.match(designCss, /@media\(max-width:820px\)/);
assert.match(designCss, /@media\(max-width:359px\)/);
assert.match(designCss, /--mobile-top-safe:max\(12px,env\(safe-area-inset-top\)\)/);
assert.match(designCss, /\.mobile-menu-btn\{[\s\S]*width:48px;[\s\S]*height:48px;[\s\S]*touch-action:manipulation/);
assert.match(designCss, /\.btn\.primary\.topbar-create\{[\s\S]*width:48px;[\s\S]*background:transparent;[\s\S]*place-items:center/);
assert.match(designCss, /\.btn\.primary\.topbar-create>span:first-child\{[\s\S]*width:36px;[\s\S]*height:36px;[\s\S]*font-size:1\.25rem/);
assert.match(designCss, /\.btn\.primary\.bill-new-btn::before,[\s\S]*\.btn\.primary\.market-new-btn::before\{[\s\S]*width:36px;[\s\S]*height:36px/);
assert.match(designCss, /\.sync-header-status\{[\s\S]*height:36px;[\s\S]*border-radius:12px;[\s\S]*box-shadow:0 1px 2px/);
assert.match(designCss, /\.sync-header-status \.sync-dot\{[\s\S]*width:7px;[\s\S]*height:7px;[\s\S]*box-shadow:none/);

assert.match(designCss, /\.main\{[\s\S]*margin-left:var\(--sidebar-current\)/);
assert.match(designCss, /\.mobile-nav\{[\s\S]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
assert.match(designCss, /\.mobile-nav \.nav-btn:nth-child\(3\)\{visibility:visible\}/);
assert.match(designCss, /\.nav-drawer\{[\s\S]*width:min\(336px,calc\(100vw - 48px\)\)/);
assert.match(designCss, /\.section-tabs\{/);
assert.match(designCss, /\.section-tab\.active\{/);

assert.match(events, /function updateAdaptiveNavigation\(\)/);
assert.match(events, /function openMobileDrawer\(\)/);
assert.match(events, /function closeMobileDrawer\(\)/);
assert.match(events, /window\.visualViewport/);
assert.match(events, /keyboard-open/);
assert.match(events, /--visual-vw/);
assert.match(events, /--visual-top/);
assert.match(designCss, /html\.keyboard-open \.dialog\[open\]/);
assert.match(designCss, /\.dialog-head\{[\s\S]*position:sticky/);
assert.match(designCss, /prefers-reduced-motion:reduce/);

assert.match(index, /id="appSidebar"/);
assert.match(index, /id="sidebarToggle"/);
assert.match(index, /id="mobileMenuBtn"/);
assert.match(index, /id="mobileDrawer"/);
assert.match(index, /id="drawerNav"/);
assert.match(index, /id="mobileNav" class="mobile-nav"/);
assert.match(index, /id="vaultPinPad"/);
assert.match(index, /data-pin-key="1"/);
assert.match(index, /id="vaultKeyboardModeToggle"/);
assert.match(events, /function wireVaultPinPad\(\)/);
assert.match(events, /input\.readOnly=pinMode/);
assert.match(events, /input\.setAttribute\('inputmode',pinMode\?'none':'text'\)/);
assert.match(designCss, /\.vault-keypad\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
assert.match(index, /id="kpiGrid" class="kpi-grid dashboard-kpis"/);
assert.match(index, /id="dashboardSecondary" class="dashboard-secondary"/);
assert.match(designCss, /#page-dashboard \.kpi-grid\{grid-template-columns:1\.45fr repeat\(3,minmax\(0,1fr\)\);gap:14px\}/);
assert.match(designCss, /\.dashboard-secondary-card\{/);
assert.match(designCss, /\.vault-card\{[\s\S]*width:min\(960px,calc\(100vw - 48px\)\)/);
assert.match(designCss, /\.topbar\{[\s\S]*grid-template-rows:56px 44px/);
assert.match(designCss, /#page-dashboard \.account-balance-kpi\{grid-column:1\/-1/);
assert.match(designCss, /\.bill-filter-grid,\.market-filter-grid\{[\s\S]*display:grid;[\s\S]*overflow:visible/);
assert.match(designCss, /\.bill-summary-grid,\.market-summary-grid\{[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\);[\s\S]*overflow:visible/);
const legacySummaryScroller=designCss.indexOf('.bill-summary-grid,.market-summary-grid{display:flex;overflow-x:auto');
const finalSummaryGrid=designCss.lastIndexOf('.bill-summary-grid,.market-summary-grid{');
assert.ok(finalSummaryGrid>legacySummaryScroller,'final mobile summary rules must override the old horizontal scroller');
assert.match(render, /\['Pago no mês',paidBills,'Pagamentos confirmados'\]/);
assert.match(render, /setHTML\('#dashboardSecondary'/);
assert.match(render, /data-update-balance/);
assert.match(render, /Diferença de conciliação/);
assert.match(events, /openAccountBalanceForm\(\)/);
assert.match(index, /id="accountBalance"/);
assert.match(index, /id="accountBalanceInfo"/);
assert.match(designCss, /\.account-balance-kpi/);
assert.match(designCss, /\.account-balance-kpi \.kpi-action\{[\s\S]*min-height:44px/);
assert.match(index, /class="bill-command-bar"/);
assert.match(index, /id="billsList" class="bill-results"/);
assert.match(index, /class="bill-filter-grid"/);
assert.match(render, /function billTableHtml\(list\)/);
assert.match(render, /class="bill-table"/);
assert.match(render, /class="bill-mobile-list"/);
assert.match(render, /function billDueSignal\(/);
assert.match(render, /data-edit-bill=/);
assert.match(events, /dataset\.editBill/);
assert.match(designCss, /\.bill-table-shell\{/);
assert.match(designCss, /\.bill-mobile-list\{display:none\}/);
assert.match(designCss, /\.bill-mobile-card\{/);
assert.match(designCss, /\.bill-table-shell\{display:none\}/);
assert.match(index, /class="market-command-bar"/);
assert.match(index, /id="marketList" class="market-results"/);
assert.match(index, /id="marketStatusFilter"/);
assert.match(render, /function marketMetrics\(items\)/);
assert.match(render, /function marketTableHtml\(list\)/);
assert.match(render, /class="market-mobile-list"/);
assert.match(render, /Enquanto faltar o preço real, os relatórios usam o valor estimado/);
assert.match(designCss, /\.market-table-shell\{/);
assert.match(designCss, /\.market-mobile-list\{display:none\}/);
assert.match(designCss, /\.market-mobile-card\{/);
assert.match(designCss, /\.market-table-shell\{display:none\}/);
assert.doesNotMatch(index, /class="fab"/);
assert.doesNotMatch(legacyCss, /\.fab\b/);
assert.doesNotMatch(legacyCss, /\.market-row\b/);
assert.doesNotMatch(legacyCss, /\.bill-card\b/);

assert.doesNotMatch(css, /\bzoom\s*:/i);
assert.doesNotMatch(css, /transform\s*:\s*scale\(/i);

assert.match(index, /name="app-build" content="v53"/);
assert.match(index, /styles\.css\?v=53/);
assert.match(index, /design-system\.css\?v=53/);
assert.match(index, /market-experience\.css\?v=53/);
assert.match(index, /manifest\.webmanifest\?v=53/);
for (const asset of ['core','finance','render','forms','sync','events']) {
  assert.match(index,new RegExp(`${asset}\\.js\\?v=53`));
}
assert.match(index, /market-experience\.js\?v=53/);
assert.match(index, /id="appBuildVersion">v53</);
// The public app build remains v53; visual-only refinements advance the
// service worker cache namespace so Safari/iOS cannot reuse the previous layer.
assert.match(events, /register\('\.\/sw\.js\?v=53',\{updateViaCache:'none'\}\)/);

const swSource=fs.readFileSync('sw.js','utf8');
assert.match(swSource, /conta-de-casa-public-v55-add-control/);
assert.match(swSource, /'\.\/design-system\.css'/);
assert.match(swSource, /'\.\/market-experience\.css'/);
assert.match(swSource, /'\.\/market-experience\.js'/);
assert.match(swSource, /url\.searchParams\.has\('v'\)/);

console.log('Responsive mobile-fit shell, PIN entry, unified action controls and GitHub Pages freshness tests: OK');

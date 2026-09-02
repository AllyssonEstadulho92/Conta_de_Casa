const assert = require('node:assert/strict');
const fs = require('node:fs');

const legacyCss = fs.readFileSync('styles.css','utf8');
const designCss = fs.readFileSync('design-system.css','utf8');
const css = `${legacyCss}\n${designCss}`;
const events = fs.readFileSync('events.js','utf8');
const index = fs.readFileSync('index.html','utf8');
const render = fs.readFileSync('render.js','utf8');

assert.match(designCss, /Conta de Casa v39 — design foundation/);
assert.match(designCss, /--content-max:1440px/);
assert.match(designCss, /--sidebar-expanded:248px/);
assert.match(designCss, /--sidebar-rail:76px/);
assert.match(designCss, /html\.sidebar-collapsed/);
assert.match(designCss, /@media\(min-width:821px\) and \(max-width:1180px\)/);
assert.match(designCss, /@media\(max-width:820px\)/);
assert.match(designCss, /@media\(max-width:359px\)/);

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
assert.match(designCss, /prefers-reduced-motion:reduce/);

assert.match(index, /id="appSidebar"/);
assert.match(index, /id="sidebarToggle"/);
assert.match(index, /id="mobileMenuBtn"/);
assert.match(index, /id="mobileDrawer"/);
assert.match(index, /id="drawerNav"/);
assert.match(index, /id="mobileNav" class="mobile-nav"/);
assert.match(index, /id="kpiGrid" class="kpi-grid dashboard-kpis"/);
assert.match(index, /id="dashboardSecondary" class="dashboard-secondary"/);
assert.match(designCss, /#page-dashboard \.kpi-grid\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\)\}/);
assert.match(designCss, /\.dashboard-secondary-card\{/);
assert.match(render, /\['Pago no mês',paidBills,'Pagamentos confirmados'\]/);
assert.match(render, /setHTML\('#dashboardSecondary'/);
assert.match(index, /class="bill-command-bar"/);
assert.match(index, /id="billsList" class="bill-results"/);
assert.match(index, /class="bill-filter-grid"/);
assert.match(render, /function billTableHtml\(list\)/);
assert.match(render, /class="bill-table"/);
assert.match(render, /class="bill-mobile-list"/);
assert.match(render, /function billDueSignal\(/);
assert.match(designCss, /\.bill-table-shell\{/);
assert.match(designCss, /\.bill-mobile-list\{display:none\}/);
assert.match(designCss, /\.bill-mobile-card\{/);
assert.match(designCss, /\.bill-table-shell\{display:none\}/);
assert.doesNotMatch(index, /class="fab"/);

assert.doesNotMatch(css, /\bzoom\s*:/i);
assert.doesNotMatch(css, /transform\s*:\s*scale\(/i);

assert.match(index, /name="app-build" content="v39"/);
assert.match(index, /styles\.css\?v=38/);
assert.match(index, /design-system\.css\?v=38/);
assert.match(index, /manifest\.webmanifest\?v=38/);
for (const asset of ['core','finance','render','forms','sync','events']) {
  assert.match(index,new RegExp(`${asset}\\.js\\?v=38`));
}
assert.match(index, /id="appBuildVersion">v39</);
assert.match(events, /register\('\.\/sw\.js\?v=38',\{updateViaCache:'none'\}\)/);

const swSource=fs.readFileSync('sw.js','utf8');
assert.match(swSource, /conta-de-casa-public-v39/);
assert.match(swSource, /'\.\/design-system\.css'/);
assert.match(swSource, /url\.searchParams\.has\('v'\)/);

console.log('Responsive shell and PWA freshness v39 tests: OK');

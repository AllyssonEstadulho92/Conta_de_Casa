const assert = require('node:assert/strict');
const fs = require('node:fs');

const css = fs.readFileSync('v76-modern-ui.css','utf8');
const index = fs.readFileSync('index.html','utf8');
const render = fs.readFileSync('render.js','utf8');
const events = fs.readFileSync('events.js','utf8');
const core = fs.readFileSync('core.js','utf8');
const prepare = fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const sw = fs.readFileSync('sw.js','utf8');
assert.match(sw,/const CACHE = 'conta-de-casa-public-v76-build';/,'PWA cache invalidation must follow deterministic build identity.');

assert.match(css,/76-modern-ui2/);
assert.match(css,/--v76-bg:/);
assert.match(css,/--v76-surface:/);
assert.match(css,/--v76-primary:/);
assert.match(css,/--v76-radius-lg:/);
assert.match(css,/--v76-shadow-md:/);
assert.match(css,/--v76-control-height:44px/);
assert.match(css,/--v76-icon-control:44px/);
assert.match(css,/--v76-grid-gap:12px/);

for (const page of [
  'page-dashboard','page-bills','page-market','page-calendar','page-planning',
  'page-reports','page-goals','page-security','page-diagnostics','page-settings'
]) {
  assert.ok(css.includes(`#${page}`), `master UI must explicitly cover ${page}`);
}

assert.match(css,/Hierarquia de ações: primary = ação principal/);
assert.match(css,/\.btn\.primary\{/);
assert.match(css,/\.btn\.secondary\{/);
assert.match(css,/\.btn\.danger\{/);
assert.match(css,/\.icon-btn\{[\s\S]*--v76-icon-control/);
assert.match(css,/\.link-btn\{/);
assert.match(css,/aria-disabled="true"/);
assert.match(css,/\.btn :is\(\.ui-icon-svg,\.svg-icon\)\{width:18px!important;height:18px!important\}/);
assert.match(css,/Grelhas partilhadas:/);
assert.match(css,/\.kpi-grid,\.dashboard-grid,\.two-col,\.goal-grid,\.bill-summary-grid,\.market-summary-grid/);
assert.match(css,/\.market-visual-product-media img\{[\s\S]*object-fit:contain!important;[\s\S]*object-position:center!important/);
assert.match(css,/\.market-visual-catalog-fallback\{/);
assert.match(css,/\.calendar-summary-grid\{/,'monthly calendar summary must use a responsive grid');
assert.match(css,/\.calendar-history\{/,'monthly spend history must remain horizontally usable on mobile');
assert.match(css,/\.calendar-day\.has-spent/,'calendar must visually distinguish days with effective spending');
assert.match(css,/@media\(max-width:520px\)[\s\S]*\.calendar-summary-grid/,'monthly spending summary must adapt to narrow phones');

assert.match(css,/\.section-tabs\{/);
assert.match(css,/\.dialog-shell\{/);
assert.match(css,/\.mobile-nav\{/);
assert.match(css,/\.nav-drawer-shell\{/);
assert.match(css,/A geometria do shell móvel pertence a v76-mobile-shell\.css/);
assert.match(css,/Bottom navigation: apenas aparência; posição, dimensão e safe area pertencem ao shell/);
assert.doesNotMatch(css,/\.main>\.page\{[\s\S]*padding:14px 14px calc\(102px/,'master UI must not reserve mobile shell/dock geometry');
assert.doesNotMatch(css,/\.mobile-nav\{[\s\S]*position:fixed!important;[\s\S]*bottom:max\(8px,env\(safe-area-inset-bottom/,'master UI must not position the persistent mobile dock');
assert.doesNotMatch(css,/\.topbar,[\s\S]*min-height:76px!important;[\s\S]*padding:12px 14px!important/,'master UI must not own mobile topbar dimensions');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(css,/@media\(forced-colors:active\)/);

/* 76-alert-center1: o sino é um centro operacional, não um atalho inerte. */
assert.match(css,/76-alert-center1/);
assert.match(css,/#notificationsBtn \.badge-dot\{[\s\S]*min-width:18px!important;[\s\S]*font-variant-numeric:tabular-nums!important/,'alert badge must render a numeric count');
assert.match(css,/\.alert-center-dialog\{[\s\S]*position:fixed!important/);
assert.match(css,/\.alert-center-list\{[\s\S]*overflow:auto!important/,'alert center must scroll independently when the list is long');
assert.match(css,/@media\(max-width:820px\)[\s\S]*\.alert-center-dialog\{[\s\S]*safe-area-inset-bottom/,'mobile alert center must respect the iPhone bottom safe area');
assert.match(index,/id="notificationsBtn"[\s\S]*aria-controls="alertCenterDialog"[\s\S]*aria-haspopup="dialog"[\s\S]*aria-expanded="false"/);
assert.match(index,/id="alertCenterDialog"[\s\S]*aria-labelledby="alertCenterTitle"[\s\S]*aria-describedby="alertCenterSummary"/);
assert.match(index,/id="alertCenterList"[\s\S]*role="list"[\s\S]*aria-live="polite"/);
assert.match(render,/function dashboardAlertItems\(n = dashboardNumbers\(\)\)/,'alert center must reuse canonical dashboard numbers');
assert.match(render,/const alerts = dashboardAlertItems\(n\);[\s\S]*alerts\.map\(dashboardAlertPanelHtml\)/,'Dashboard and alert center must share one alert model');
assert.match(render,/function renderAlertCenter\(/);
assert.match(render,/const count=items\.length;[\s\S]*badge\.textContent=count>99\?'99\+':String\(count\)/,'badge must count active alert groups');
assert.match(events,/function openAlertCenter\(\)/);
assert.match(events,/function closeAlertCenter\(\)/);
assert.match(events,/\$\('#notificationsBtn'\)\.addEventListener\('click',openAlertCenter\)/);
assert.match(core,/alertCenterDialog[\s\S]*if \(alertCenterDialog\?\.open\) alertCenterDialog\.close\(\)/,'locking the vault must close the alert center');

assert.doesNotMatch(css,/commit\(|saveState\(|appState|IndexedDB|PBKDF2|AES-GCM|estimatedCents|actualCents/,'master UI CSS must not contain application mutations or financial logic');

assert.match(prepare,/const MODERN_UI_REV = '76-modern-ui2'/);
assert.ok(prepare.includes("'v76-modern-ui.css'"));
assert.match(prepare,/v75-usability\.css\?v=\$\{USABILITY_REV\}[\s\S]*v76-modern-ui\.css\?v=\$\{MODERN_UI_REV\}/);
assert.ok(sw.includes("'./v76-modern-ui.css'"));

console.log('v76 modern-ui2 standardizes action hierarchy, grids, icons and market photo presentation while staying presentation-only and delegating shell geometry.');

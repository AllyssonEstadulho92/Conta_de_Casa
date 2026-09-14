'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const shell=read('v76-mobile-shell.css');
const prepare=read('scripts/prepare-pages.cjs');
const sw=read('sw.js');
const pkg=JSON.parse(read('package.json'));

function luminance(hex){
  const values=hex.match(/../g).map(part=>parseInt(part,16)/255).map(value=>value<=.03928?value/12.92:((value+.055)/1.055)**2.4);
  return .2126*values[0]+.7152*values[1]+.0722*values[2];
}
function contrast(a,b){
  const one=luminance(a),two=luminance(b);
  return (Math.max(one,two)+.05)/(Math.min(one,two)+.05);
}

assert.match(shell,/Conta de Casa v76 — 76-mobile-shell2/);

assert.match(shell,/76-full-page-audit1/);
assert.match(shell,/--v76-muted:#61767b/);
assert.match(shell,/--v76-danger:#c33b50/);
assert.match(shell,/--v76-warning:#a76213/);
assert.match(shell,/--v76-success:#0f7b5d/);
assert.match(shell,/html\[data-theme="dark"\][\s\S]*--v76-danger:#ef7183[\s\S]*--v76-warning:#f2b05f[\s\S]*--v76-success:#55d8a7/);
for(const [foreground,background] of [
  ['61767b','ffffff'],['c33b50','ffffff'],['a76213','ffffff'],['0f7b5d','ffffff'],
  ['9cb2b6','0d262c'],['ef7183','0d262c'],['f2b05f','0d262c'],['55d8a7','0d262c']
]){
  assert.ok(contrast(foreground,background)>=4.5,`${foreground} must meet WCAG AA against ${background}`);
}
assert.match(shell,/html\.cdc-v75 \*,[\s\S]*box-sizing:border-box/);
assert.match(shell,/html\.cdc-v75 body\{overflow-x:hidden!important\}/);
assert.match(shell,/\.main>\.page\{width:100%;min-width:0\}/);
assert.match(shell,/\.section-tabs\{[\s\S]*overflow-x:auto!important[\s\S]*scrollbar-width:none/);
assert.match(shell,/:is\(\.bill-table-shell,\.market-table-shell\)\{[\s\S]*overflow-x:auto!important/);
assert.match(shell,/\.dialog-shell\{[\s\S]*max-width:calc\(100vw - 24px\)!important;[\s\S]*max-height:calc\(100dvh - 24px\)!important;[\s\S]*overflow:auto!important/);
assert.match(shell,/@media\(max-width:560px\)[\s\S]*\.bill-filter-grid,\.market-filter-grid,\.form-grid,\.form-grid\.two,\.two-col,\.detail-grid,\.security-grid[\s\S]*grid-template-columns:minmax\(0,1fr\)!important/);
assert.match(shell,/@media\(max-width:390px\)[\s\S]*\.bill-summary-grid,\.market-summary-grid[\s\S]*grid-template-columns:minmax\(0,1fr\)!important/);
assert.match(shell,/:is\(\.section-tab,\.nav-btn,\.icon-text-btn,\.sync-header-status\):focus-visible/);

assert.match(shell,/76-page-polish1/);
for(const page of [
  'page-dashboard','page-bills','page-calendar','page-market','page-planning',
  'page-reports','page-goals','page-security','page-diagnostics','page-settings'
]){
  assert.ok(shell.includes(`#${page}`),`page polish must cover ${page}`);
}
assert.match(shell,/--v76-page-gap:16px/);
assert.match(shell,/--v76-panel-pad:18px/);
assert.match(shell,/font-variant-numeric:tabular-nums/);
assert.match(shell,/\.section-tabs \.section-tab\{[\s\S]*flex:1 1 0!important/);
assert.match(shell,/:is\(\.bill-table,\.market-table\) thead th\{[\s\S]*position:sticky/);
assert.match(shell,/#page-dashboard \.account-balance-kpi\{[\s\S]*min-height:166px!important/);
assert.match(shell,/#page-bills \.bill-summary-item\{[\s\S]*min-height:96px!important/);
assert.match(shell,/#page-calendar \.calendar-day\{[\s\S]*min-height:82px!important/);
assert.match(shell,/#page-market \.market-visual-product-media\{[\s\S]*aspect-ratio:4\/3/);
assert.match(shell,/#page-planning \.v75-budget-summary\{[\s\S]*min-height:146px!important/);
assert.match(shell,/#page-reports #reportCards\{[\s\S]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important/);
assert.match(shell,/#page-goals \.goal-grid\{[\s\S]*grid-template-columns:repeat\(auto-fit,minmax\(250px,1fr\)\)!important/);
assert.match(shell,/:is\(#page-security,#page-diagnostics\) :is\(\.detail-item,\.security-item\)\{[\s\S]*min-height:82px!important/);
assert.match(shell,/#page-settings #settingsForm\{[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
assert.match(shell,/@media\(min-width:821px\)[\s\S]*max-width:1280px!important/);
assert.match(shell,/@media\(max-width:820px\)[\s\S]*#page-reports #reportCards[\s\S]*repeat\(2,minmax\(0,1fr\)\)!important/);
assert.match(shell,/@media\(max-width:560px\)[\s\S]*#page-reports #reportCards\{grid-template-columns:minmax\(0,1fr\)!important\}/);
assert.doesNotMatch(shell,/\bzoom\s*:/i);

assert.match(shell,/76-auth-hidden1/);
assert.match(shell,/#vaultScreen\[hidden\],[\s\S]*#app\[hidden\]\{[\s\S]*display:none!important/,'hidden must remain authoritative even when auth CSS declares display:grid!important');
assert.match(shell,/76-auth-transition1/);
assert.match(shell,/#vaultScreen:not\(\[hidden\]\) \+ #app\{[\s\S]*display:none!important/,'visible vault must suppress the authenticated app shell and mobile dock');
assert.match(shell,/76-ui-audit1/);
assert.match(shell,/#vaultScreen #cdcWelcome\{[\s\S]*display:none!important/,'legacy onboarding selector must not mask the real vault create flow');
assert.match(shell,/#vaultScreen #vaultCreate\.cdc-vault-create-collapsed\{[\s\S]*display:grid!important/,'real vault create form must remain visible even if a historical class is present');
assert.match(shell,/@media \(max-width:820px\)/);
assert.match(shell,/--v76-shell-safe-top:max\(24px,env\(safe-area-inset-top,0px\)\)/);
assert.match(shell,/--v76-shell-safe-bottom:max\(8px,env\(safe-area-inset-bottom,0px\)\)/);
assert.match(shell,/--v76-shell-nav-reserve:calc\(var\(--v76-shell-nav-height\) \+ var\(--v76-shell-safe-bottom\) \+ 28px\)/);
assert.match(shell,/html\.cdc-v75\.app-active \.app-shell\{[\s\S]*height:auto!important;[\s\S]*max-height:none!important;[\s\S]*overflow:visible!important/);
assert.match(shell,/html\.cdc-v75\.app-active body \.main\{[\s\S]*height:auto!important;[\s\S]*max-height:none!important;[\s\S]*overflow:visible!important/);
assert.match(shell,/html\.cdc-v75\.app-active \.main>\.topbar,[\s\S]*position:relative!important;[\s\S]*padding:calc\(var\(--v76-shell-safe-top\) \+ 6px\) 14px 8px!important/);
assert.match(shell,/html\.cdc-v75\.app-active \.main>\.page\{[\s\S]*padding:16px 14px var\(--v76-shell-nav-reserve\)!important;[\s\S]*overflow:visible!important/);
assert.match(shell,/html\.cdc-v75\.app-active body \.mobile-nav\{[\s\S]*position:fixed!important;[\s\S]*bottom:var\(--v76-shell-safe-bottom\)!important;[\s\S]*height:var\(--v76-shell-nav-height\)!important;[\s\S]*background:color-mix/);
assert.match(shell,/\.mobile-nav \.nav-btn\.active,[\s\S]*background:var\(--v76-surface-accent/,'active destination must use one restrained selected state');
assert.match(shell,/\.mobile-nav \.nav-btn:focus-visible\{[\s\S]*outline:3px solid/,'mobile nav keyboard focus must remain visible');
assert.match(shell,/prefers-reduced-motion:reduce/);
assert.match(shell,/forced-colors:active/);

assert.equal(pkg.version,'0.76.0');
assert.match(prepare,/const BUILD = 'v76'/);
assert.match(prepare,/const APP_UPDATE_REV = '76-version-alignment1'/);
assert.match(prepare,/const MODERN_UI_REV = '76-modern-ui2'/);
assert.match(prepare,/const MOBILE_SHELL_REV = '76-mobile-shell2'/);
assert.match(prepare,/'v76-mobile-shell\.css'/);
assert.match(prepare,/v76-modern-ui\.css\?v=\$\{MODERN_UI_REV\}[\s\S]*v76-mobile-shell\.css\?v=\$\{MOBILE_SHELL_REV\}/);
assert.match(sw,/v76-version-alignment1/);
assert.match(sw,/modern-ui2/);
assert.match(sw,/mobile-shell2/);
assert.match(sw,/full-page-audit1/);
assert.match(sw,/page-polish1/);
assert.match(sw,/auth-transition1/);
assert.match(sw,/auth-hidden1/);
assert.ok(sw.includes("'./v76-mobile-shell.css'"));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const builtIndex=read('dist/index.html');
  assert.match(builtIndex,/name="app-version" content="0\.76\.0"/);
  assert.match(builtIndex,/name="app-build" content="v76"/);
  assert.match(builtIndex,/v76-modern-ui\.css\?v=76-modern-ui2/);
  assert.match(builtIndex,/v76-mobile-shell\.css\?v=76-mobile-shell2/);
  assert.ok(builtIndex.indexOf('v76-modern-ui.css')<builtIndex.indexOf('v76-mobile-shell.css'),'mobile shell must be the final mobile geometry layer');
  assert.ok(fs.existsSync(path.join(dist,'v76-mobile-shell.css')));
  const builtShell=read('dist/v76-mobile-shell.css');
  assert.match(builtShell,/76-full-page-audit1/);
  assert.match(builtShell,/76-page-polish1/);
  assert.match(builtShell,/#vaultScreen\[hidden\],[\s\S]*#app\[hidden\]/);
  assert.match(builtShell,/#vaultScreen:not\(\[hidden\]\) \+ #app/);
  assert.match(builtShell,/#vaultScreen #cdcWelcome\{[\s\S]*display:none!important/);
  assert.match(builtShell,/\.mobile-nav \.nav-btn\.active/);
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('v76 stable page polish + full-page audit + mobile shell: ten-route hierarchy, responsive density, AA contrast, overflow, safe areas and auth contracts: OK');
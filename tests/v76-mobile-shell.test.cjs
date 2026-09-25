'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const shell=read('v76-mobile-shell.css');
const architecture=read('v75-architecture.js');
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

assert.match(shell,/Conta de Casa v76 — 76-mobile-shell3/);
assert.match(shell,/76-full-page-audit1/);
assert.match(shell,/76-page-polish1/);
assert.match(shell,/76-shell-coherence1/,'final mobile shell must contain the screenshot-driven shell consolidation');

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
assert.match(shell,/@media\(max-width:560px\)[\s\S]*grid-template-columns:minmax\(0,1fr\)!important/);
assert.match(shell,/:is\(\.section-tab,\.nav-btn,\.icon-text-btn,\.sync-header-status\):focus-visible/);
assert.doesNotMatch(shell,/\bzoom\s*:/i);

for(const page of [
  'page-dashboard','page-bills','page-calendar','page-market','page-planning',
  'page-reports','page-goals','page-security','page-diagnostics','page-settings'
]){
  assert.ok(shell.includes(`#${page}`),`page polish must cover ${page}`);
}
assert.match(shell,/font-variant-numeric:tabular-nums/);
assert.match(shell,/:is\(\.bill-table,\.market-table\) thead th\{[\s\S]*position:sticky/);
assert.match(shell,/#page-dashboard \.account-balance-kpi\{/);
assert.match(shell,/#page-bills \.bill-summary-item\{/);
assert.match(shell,/#page-market \.market-visual-product-media\{/);
assert.match(shell,/#page-planning \.v75-budget-summary\{/);
assert.match(shell,/#page-goals \.goal-grid\{/);

assert.match(shell,/76-auth-hidden1/);
assert.match(shell,/#vaultScreen\[hidden\],[\s\S]*#app\[hidden\]\{[\s\S]*display:none!important/);
assert.match(shell,/76-auth-transition1/);
assert.match(shell,/#vaultScreen:not\(\[hidden\]\) \+ #app\{[\s\S]*display:none!important/);
assert.match(shell,/76-ui-audit1/);
assert.match(shell,/76-bills-filter-collapse1/,'mobile shell must own the compact filter disclosure');
assert.match(shell,/76-desktop-dock-hide1/,'desktop shell must explicitly hide the mobile dock');
assert.match(shell,/@media\(min-width:821px\)[\s\S]*\.mobile-nav\{[\s\S]*display:none!important/,'mobile dock must not coexist with the desktop sidebar');
assert.match(shell,/#page-bills:not\(\.bill-filters-open\)>\.bill-filter-grid\{[\s\S]*display:none!important/,'advanced bill filters must be collapsed by default on mobile');
assert.match(shell,/#page-bills\.bill-filters-open>\.bill-filter-grid\{[\s\S]*display:grid!important/,'filter toggle must restore the canonical controls');
assert.match(shell,/#billFiltersToggle\{[\s\S]*display:inline-flex!important/,'mobile filter disclosure must remain a visible touch target');

/* Final safe-area policy: use the browser-provided inset. A normal Safari viewport
   may legitimately report 0; adding an unconditional 24 px created the oversized
   header visible in the supplied iPhone screenshots. */
const coherence=shell.slice(shell.indexOf('76-shell-coherence1'));
assert.match(coherence,/--v76-shell-safe-top:env\(safe-area-inset-top,0px\)/);
assert.doesNotMatch(coherence,/--v76-shell-safe-top:max\(24px/,'final shell must not add artificial top safe-area padding');
assert.match(coherence,/--v76-shell-safe-bottom:max\(6px,env\(safe-area-inset-bottom,0px\)\)/);
assert.match(coherence,/--v76-shell-header-content:52px/);
assert.match(coherence,/--v76-shell-nav-height:76px/);
assert.match(coherence,/--v76-shell-nav-reserve:calc\(var\(--v76-shell-nav-height\) \+ var\(--v76-shell-safe-bottom\) \+ 20px\)/);
assert.match(coherence,/\.main>\.topbar,[\s\S]*min-height:calc\(var\(--v76-shell-safe-top\) \+ 60px\)!important;[\s\S]*padding:calc\(var\(--v76-shell-safe-top\) \+ 4px\) 12px 4px!important/);
assert.match(coherence,/\.page-heading h1\{[\s\S]*font-size:20px!important/);
assert.match(coherence,/:is\(\.mobile-menu-btn,#notificationsBtn\)\{[\s\S]*44px!important/);

/* The final layer must neutralize the older teal/gradient drawer appearance so
   the open state remains the same design system as the page underneath. */
assert.match(coherence,/\.nav-drawer-shell\{[\s\S]*background:var\(--v76-surface,#fff\)!important;[\s\S]*border-left:1px solid var\(--v76-border/);
assert.match(coherence,/\.drawer-head :is\(strong,small\)\{color:var\(--v76-text/);
assert.match(coherence,/\.drawer-nav \.nav-btn\.active,[\s\S]*background:var\(--v76-surface-accent/);
assert.match(coherence,/\.nav-drawer\.open::backdrop[\s\S]*rgba\(9,31,36,\.18\)/);

assert.match(coherence,/body \.mobile-nav\{[\s\S]*height:var\(--v76-shell-nav-height\)!important;[\s\S]*padding:6px!important/);
assert.match(coherence,/\.mobile-nav \.nav-btn span\{[\s\S]*font-size:11\.5px!important[\s\S]*overflow:visible!important/);
assert.match(architecture,/76-mobile-label-fit1/);
assert.match(architecture,/\['planning','Plano','plan'\]/,'compact dock label must avoid truncating Planeamento while preserving the planning route');
assert.match(architecture,/planning:\['Planeamento','Orçamento'\]/,'page title must remain Planeamento');
assert.match(architecture,/\['planning','Planeamento','plan'\]/,'drawer label must remain the full route name');

assert.match(shell,/prefers-reduced-motion:reduce/);
assert.match(shell,/forced-colors:active/);
assert.equal(pkg.version,'0.76.0');
assert.match(prepare,/const BUILD = 'v76'/);
assert.match(prepare,/const MODERN_UI_REV = '76-modern-ui2'/);
assert.match(prepare,/const MOBILE_SHELL_REV = '76-mobile-shell3'/);
assert.match(prepare,/v76-modern-ui\.css\?v=\$\{MODERN_UI_REV\}[\s\S]*v76-mobile-shell\.css\?v=\$\{MOBILE_SHELL_REV\}/);
assert.match(sw,/mobile-shell3/);
assert.match(sw,/shell-coherence1/,'PWA cache must invalidate the previous shell CSS');
assert.match(sw,/bills-filters-collapse1/,'PWA cache must invalidate the previous always-open mobile filters');
assert.ok(sw.includes("'./v76-mobile-shell.css'"));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const builtIndex=read('dist/index.html');
  assert.match(builtIndex,/name="app-version" content="0\.76\.0"/);
  assert.match(builtIndex,/name="app-build" content="v76"/);
  assert.match(builtIndex,/v76-modern-ui\.css\?v=76-modern-ui2/);
  assert.match(builtIndex,/v76-mobile-shell\.css\?v=76-mobile-shell3/);
  assert.ok(builtIndex.indexOf('v76-modern-ui.css')<builtIndex.indexOf('v76-mobile-shell.css'),'mobile shell must remain the final mobile shell authority');
  const builtShell=read('dist/v76-mobile-shell.css');
  assert.match(builtShell,/76-shell-coherence1/);
  assert.match(builtShell,/--v76-shell-safe-top:env\(safe-area-inset-top,0px\)/);
  assert.match(builtShell,/\.nav-drawer-shell\{[\s\S]*background:var\(--v76-surface,#fff\)!important/);
  assert.match(builtShell,/\.mobile-nav \.nav-btn\.active/);
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('v76 mobile shell: compact safe-area-aware header, neutral drawer, readable five-destination dock and ten-route responsive contracts: OK');
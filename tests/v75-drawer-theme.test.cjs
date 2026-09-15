'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const css=read('v75-drawer-theme.css');
const headerCss=read('v75-header-refinement.css');
const menuJs=read('mobile-menu-toggle.js');
const prepare=read('scripts/prepare-pages.cjs');

assert.match(css,/76-drawer-hierarchy1/i);
assert.match(css,/@media\(max-width:820px\)/);
assert.match(css,/\.nav-drawer\{[\s\S]*inset:0 0 0 auto!important/,'drawer must remain on the right while interaction geometry is unchanged');
assert.match(css,/width:min\(360px,calc\(100vw - 24px\)\)!important/,'drawer must gain enough width for readable labels');
assert.match(css,/--v76-drawer-surface:var\(--v76-surface,#fff\)/);
assert.match(css,/--v76-drawer-text:var\(--v76-text,#12343d\)/);
assert.match(css,/--v76-drawer-primary:var\(--v76-primary,#087b78\)/);
assert.match(css,/background:var\(--v76-drawer-surface\)!important/);
assert.doesNotMatch(css,/linear-gradient\(/,'drawer must not reintroduce decorative gradients');
assert.match(headerCss,/background:var\(--v76-surface,#fff\)!important/,'drawer and header must use the same neutral surface authority');
assert.doesNotMatch(headerCss,/linear-gradient\(/);
assert.match(css,/border-radius:var\(--v76-drawer-radius\) 0 0 var\(--v76-drawer-radius\)!important/);
assert.match(css,/#drawerCloseBtn\.icon-btn\.drawer-close-control[\s\S]*width:44px!important/,'drawer close control must retain a 44px target');
assert.match(css,/#drawerCloseBtn\.icon-btn\.drawer-close-control[\s\S]*border:0!important[\s\S]*border-radius:50%!important/,'close control must be a single simple circular surface');

/* Hierarchy contract: every navigation group is a vertical sequence, never a 2-column card wall. */
const groupItems=/\.nav-drawer\[open\] \.drawer-nav \.nav-group-items\{([\s\S]*?)\n  \}/.exec(css)?.[1]||'';
assert.match(groupItems,/display:flex!important/);
assert.match(groupItems,/flex-direction:column!important/);
assert.match(groupItems,/gap:2px!important/);
assert.doesNotMatch(groupItems,/repeat\(2/);

const rowRule=/\.nav-drawer\[open\] \.drawer-nav \.nav-btn\{([\s\S]*?)\n  \}/.exec(css)?.[1]||'';
assert.match(rowRule,/display:grid!important/);
assert.match(rowRule,/grid-template-columns:26px minmax\(0,1fr\)!important/);
assert.match(rowRule,/min-height:52px!important/);
assert.match(rowRule,/border-radius:14px!important/);
assert.match(rowRule,/background:transparent!important/);
assert.match(rowRule,/text-align:left!important/);

const iconRule=/\.drawer-nav \.nav-btn :is\(\.svg-icon,\.ui-icon-svg\)\{([\s\S]*?)\n  \}/.exec(css)?.[1]||'';
assert.match(iconRule,/width:24px!important/);
assert.match(iconRule,/height:24px!important/);
assert.match(iconRule,/background:transparent!important/);
assert.match(iconRule,/border:0!important/);

const labelRule=/\.nav-drawer\[open\] \.drawer-nav \.nav-label\{([\s\S]*?)\n  \}/.exec(css)?.[1]||'';
assert.match(labelRule,/white-space:normal!important/);
assert.match(labelRule,/word-break:normal!important/);
assert.doesNotMatch(labelRule,/overflow-wrap:anywhere/,'labels must not break words arbitrarily');
assert.match(css,/\[data-page="dashboard"\]\{order:1!important\}/);
assert.match(css,/\[data-page="bills"\]\{order:2!important\}/);
assert.match(css,/\[data-page="planning"\]\{order:3!important\}/);
assert.match(css,/\[data-page="market"\]\{order:4!important\}/);
assert.match(css,/\.drawer-nav \.nav-btn\.active/);
assert.match(css,/background:var\(--v76-drawer-active\)!important/);
assert.match(css,/data-v75-page="security"/,'security route must receive its own visible active treatment in the full drawer');
assert.match(css,/\.drawer-nav \.nav-btn:focus-visible\{[\s\S]*outline:3px solid/);

/* Footer actions become a readable vertical stack. */
const footerRule=/\.nav-drawer\[open\] \.drawer-footer\{([\s\S]*?)\n  \}/.exec(css)?.[1]||'';
assert.match(footerRule,/display:flex!important/);
assert.match(footerRule,/flex-direction:column!important/);
assert.match(footerRule,/gap:8px!important/);
assert.doesNotMatch(footerRule,/grid-template-columns/);
assert.match(css,/\.drawer-footer \.icon-text-btn\{[\s\S]*min-height:50px!important/);

assert.match(css,/\.nav-drawer\[open\]:not\(\[data-closing="true"\]\) \.nav-drawer-shell\{[\s\S]*transform:translate3d\(0,0,0\)!important[\s\S]*opacity:1!important/);
assert.match(css,/\.nav-drawer\[open\] \.drawer-nav \.nav-btn\{[\s\S]*visibility:visible!important[\s\S]*opacity:1!important/);
assert.match(menuJs,/closeButton\.hidden=false/,'stable v76 controller must expose the dedicated close control');
assert.doesNotMatch(menuJs,/insertBefore\(button,drawerHead\.firstChild\)/,'global menu trigger must stay in the shared header');

assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/forced-colors:active/);
assert.doesNotMatch(css,/\bappState\b|amountCents|estimatedCents|actualCents|openDB\(|saveState\(|persistState\(/,'drawer visual layer must not access application or financial state');

assert.match(prepare,/const DRAWER_REV = '75-drawer2'/);
assert.ok(prepare.includes("'v75-drawer-theme.css'"));
assert.match(prepare,/v75-drawer-theme\.css\?v=\$\{DRAWER_REV\}/);

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/v75-drawer-theme\.css\?v=75-drawer2/);
  assert.ok(index.indexOf('v75-drawer-theme.css?v=75-drawer2')>index.indexOf('v75-layout-polish.css?v=75-layout1'),'drawer refinement must load after layout geometry');
  assert.ok(fs.existsSync(path.join(dist,'v75-drawer-theme.css')));
  const built=fs.readFileSync(path.join(dist,'v75-drawer-theme.css'),'utf8');
  assert.match(built,/76-drawer-hierarchy1/);
  assert.match(built,/flex-direction:column!important/);
  assert.doesNotMatch(built,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('v76 drawer uses a readable one-column hierarchy, simple close control, vertical session actions and isolated presentation: OK');
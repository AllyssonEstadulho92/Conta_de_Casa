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
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');

assert.match(css,/76-drawer-neutral1/i);
assert.match(css,/76-drawer-grid1/i);
assert.match(css,/@media\(max-width:820px\)/);
assert.match(css,/\.nav-drawer\{[\s\S]*inset:0 0 0 auto!important/,'drawer must remain on the right');
assert.match(css,/width:min\(320px,calc\(100vw - 72px\)\)!important/,'drawer must keep context visible');
assert.match(css,/--v76-drawer-surface:var\(--v76-surface,#fff\)/);
assert.match(css,/--v76-drawer-text:var\(--v76-text,#12343d\)/);
assert.match(css,/--v76-drawer-primary:var\(--v76-primary,#087b78\)/);
assert.match(css,/background:var\(--v76-drawer-surface\)!important/);
assert.doesNotMatch(css,/linear-gradient\(/,'drawer must not reintroduce decorative gradients');
assert.match(headerCss,/background:var\(--v76-surface,#fff\)!important/,'drawer and header must use the same neutral surface authority');
assert.doesNotMatch(headerCss,/linear-gradient\(/);
assert.match(css,/border-radius:24px 0 0 24px!important/);
assert.match(css,/\.drawer-head>:is\(\.mobile-menu-btn,#drawerCloseBtn,\.icon-btn\)\{[\s\S]*width:44px!important/,'drawer close control must retain a 44px target');

/* Grid contract: every navigation group becomes a two-column card grid. */
const groupGrid=/\.nav-drawer\[open\] \.drawer-nav \.nav-group-items\{([\s\S]*?)\n  \}/.exec(css)?.[1]||'';
assert.match(groupGrid,/display:grid!important/);
assert.match(groupGrid,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
assert.match(groupGrid,/gap:8px!important/);

const cardRule=/\.nav-drawer\[open\] \.drawer-nav \.nav-btn\{([\s\S]*?)\n  \}/.exec(css)?.[1]||'';
assert.match(cardRule,/display:grid!important/);
assert.match(cardRule,/grid-template-columns:32px minmax\(0,1fr\)!important/);
assert.match(cardRule,/min-height:70px!important/);
assert.match(cardRule,/border-radius:var\(--v76-drawer-card-radius\)!important/);
assert.match(cardRule,/text-align:left!important/);

const iconRule=/\.drawer-nav \.nav-btn :is\(\.svg-icon,\.ui-icon-svg\)\{([\s\S]*?)\n  \}/.exec(css)?.[1]||'';
assert.match(iconRule,/width:32px!important/);
assert.match(iconRule,/height:32px!important/);
assert.match(iconRule,/border-radius:10px!important/);

const labelRule=/\.nav-drawer\[open\] \.drawer-nav \.nav-label\{([\s\S]*?)\n  \}/.exec(css)?.[1]||'';
assert.match(labelRule,/white-space:normal!important/);
assert.match(labelRule,/overflow-wrap:anywhere!important/);
assert.match(css,/\.drawer-nav \.nav-btn\.active/);
assert.match(css,/background:var\(--v76-drawer-active\)!important/);
assert.match(css,/active :is\(\.svg-icon,\.ui-icon-svg\)[\s\S]*background:var\(--v76-drawer-primary\)!important/);
assert.match(css,/\.drawer-nav \.nav-btn:focus-visible\{[\s\S]*outline:3px solid/);

/* Footer follows the same grid system and an odd last action spans both columns. */
const footerRule=/\.nav-drawer\[open\] \.drawer-footer\{([\s\S]*?)\n  \}/.exec(css)?.[1]||'';
assert.match(footerRule,/display:grid!important/);
assert.match(footerRule,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
assert.match(css,/\.drawer-footer \.icon-text-btn:last-child:nth-child\(odd\)\{[\s\S]*grid-column:1 \/ -1!important/);

assert.match(css,/76-drawer-open-guard1/);
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
assert.match(sw,/stability1-layout1-drawer2/);
assert.match(sw,/mobile-drawer-actions1/);
assert.match(sw,/menu-visible-close1/);
assert.match(sw,/drawer-grid1/,'PWA cache must invalidate for the new grid presentation');
assert.ok(sw.includes("'./v75-drawer-theme.css'"));
assert.ok(!sw.includes("'./v75-drawer-blue.css'"));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/v75-drawer-theme\.css\?v=75-drawer2/);
  assert.ok(index.indexOf('v75-drawer-theme.css?v=75-drawer2')>index.indexOf('v75-layout-polish.css?v=75-layout1'),'drawer refinement must load after layout geometry');
  assert.ok(fs.existsSync(path.join(dist,'v75-drawer-theme.css')));
  const built=fs.readFileSync(path.join(dist,'v75-drawer-theme.css'),'utf8');
  assert.match(built,/76-drawer-neutral1/);
  assert.match(built,/76-drawer-grid1/);
  assert.match(built,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
  assert.match(built,/76-drawer-open-guard1/);
  assert.ok(!fs.existsSync(path.join(dist,'v75-drawer-blue.css')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('v76 drawer uses a modern two-column grid with stable close control, adaptive footer and isolated presentation: OK');
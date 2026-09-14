'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const css=read('v75-drawer-theme.css');
const headerCss=read('v75-header-refinement.css');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');

assert.match(css,/revisão 76-drawer-neutral1/i);
assert.match(css,/@media\(max-width:820px\)/);
assert.match(css,/\.nav-drawer\{[\s\S]*inset:0 0 0 auto!important/,'drawer must remain on the right');
assert.match(css,/width:min\(320px,calc\(100vw - 72px\)\)!important/,'drawer must leave a visible slice of the page');
assert.match(css,/--v76-drawer-surface:var\(--v76-surface,#fff\)/);
assert.match(css,/--v76-drawer-text:var\(--v76-text,#12343d\)/);
assert.match(css,/--v76-drawer-primary:var\(--v76-primary,#087b78\)/);
assert.match(css,/background:var\(--v76-drawer-surface\)!important/);
assert.doesNotMatch(css,/linear-gradient\(/,'drawer must not reintroduce the legacy teal gradient');
assert.match(headerCss,/background:var\(--v76-surface,#fff\)!important/,'drawer and header must use the same neutral surface authority');
assert.doesNotMatch(headerCss,/linear-gradient\(/,'header and drawer must not rely on decorative gradients');
assert.match(css,/border-radius:24px 0 0 24px!important/);
assert.match(css,/\.drawer-head>:is\(\.mobile-menu-btn,#drawerCloseBtn,\.icon-btn\)\{[\s\S]*width:44px!important/,'drawer close/menu control must retain a 44px target');
assert.match(css,/\.drawer-nav \.nav-btn\.active/);
assert.match(css,/background:var\(--v76-drawer-active\)!important/);
assert.match(css,/\.drawer-nav \.nav-btn:focus-visible\{[\s\S]*outline:3px solid/);
assert.match(css,/\.drawer-footer/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/forced-colors:active/);
assert.doesNotMatch(css,/\bappState\b|amountCents|estimatedCents|actualCents|openDB\(|saveState\(|persistState\(/,'drawer visual layer must not access application or financial state');

/* Regressão reportada no mobile: o controlo fica à esquerda e o estado nativo
   [open] nunca pode renderizar apenas um painel vazio enquanto a classe .open
   aguarda um frame do Safari/PWA. */
assert.match(headerCss,/76-mobile-menu-left1/);
assert.match(headerCss,/\.topbar-leading>\.mobile-menu-btn[\s\S]*order:-1!important[\s\S]*margin-left:0!important/);
assert.match(css,/76-drawer-open-guard1/);
assert.match(css,/\.nav-drawer\[open\]:not\(\[data-closing="true"\]\) \.nav-drawer-shell\{[\s\S]*transform:translate3d\(0,0,0\)!important[\s\S]*opacity:1!important/);
assert.match(css,/\.nav-drawer\[open\] \.drawer-nav\{[\s\S]*display:flex!important[\s\S]*flex:1 1 auto!important/);
assert.match(css,/\.nav-drawer\[open\] \.drawer-nav \.nav-btn\{[\s\S]*display:flex!important[\s\S]*visibility:visible!important[\s\S]*opacity:1!important/);
assert.match(css,/\.drawer-head>\.mobile-menu-btn\{[\s\S]*order:0!important[\s\S]*margin-left:0!important/);
assert.match(css,/\.nav-drawer\[open\]:not\(\[data-closing="true"\]\) \.mobile-menu-btn \.mobile-menu-glyph::before[\s\S]*rotate\(45deg\)!important/);
assert.match(css,/\.nav-drawer\[open\]:not\(\[data-closing="true"\]\) \.mobile-menu-btn \.mobile-menu-glyph::after[\s\S]*rotate\(-45deg\)!important/);

assert.match(prepare,/const DRAWER_REV = '75-drawer2'/);
assert.ok(prepare.includes("'v75-drawer-theme.css'"));
assert.match(prepare,/v75-drawer-theme\.css\?v=\$\{DRAWER_REV\}/);
assert.match(sw,/stability1-layout1-drawer2/);
assert.match(sw,/ui-audit1/);
assert.match(sw,/mobile-drawer-actions1/,'PWA cache must invalidate the reported mobile drawer/action regression');
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
  assert.match(built,/76-drawer-open-guard1/);
  assert.match(built,/background:var\(--v76-drawer-surface\)!important/);
  assert.ok(!fs.existsSync(path.join(dist,'v75-drawer-blue.css')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('v76 neutral right drawer theme, left menu control, native-open guard and distribution tests: OK');
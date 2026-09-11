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

assert.match(shell,/Conta de Casa v76 — 76-mobile-shell4/);
assert.match(shell,/@media \(max-width:820px\)/);
assert.match(shell,/--v76-shell-safe-top:max\(24px,env\(safe-area-inset-top,0px\)\)/);
assert.match(shell,/--v76-shell-safe-bottom:max\(8px,env\(safe-area-inset-bottom,0px\)\)/);
assert.match(shell,/--v76-shell-header-height:calc\(var\(--v76-shell-safe-top\) \+ var\(--v76-shell-header-content\) \+ 14px\)/);
assert.match(shell,/--v76-shell-nav-reserve:calc\(var\(--v76-shell-nav-height\) \+ var\(--v76-shell-safe-bottom\) \+ 28px\)/);
assert.match(shell,/html\.cdc-v75\.app-active \.app-shell\{[\s\S]*display:block!important;[\s\S]*grid-template-columns:none!important;[\s\S]*min-width:0!important;[\s\S]*max-width:100%!important/,'mobile shell must collapse the desktop grid to one real column');
assert.match(shell,/html\.cdc-v75\.app-active \.app-shell>\.sidebar\{[\s\S]*display:none!important;[\s\S]*max-width:0!important/,'desktop sidebar must leave the mobile layout flow');
assert.match(shell,/html\.cdc-v75\.app-active body \.main\{[\s\S]*min-width:0!important;[\s\S]*max-width:100%!important;[\s\S]*height:auto!important;[\s\S]*overflow:visible!important;[\s\S]*scroll-padding-top:var\(--v76-shell-header-height\)!important/);
assert.match(shell,/html\.cdc-v75\.app-active body \.main>\*\{[\s\S]*min-width:0!important;[\s\S]*max-width:100%!important/);
const topbarBlock=shell.match(/html\.cdc-v75\.app-active \.main>\.topbar,[\s\S]*?\n  \}/)?.[0]||'';
assert.ok(topbarBlock,'mobile topbar block must exist');
assert.match(topbarBlock,/position:sticky!important/,'mobile topbar must remain visible while the document scrolls');
assert.match(topbarBlock,/top:0!important/);
assert.match(topbarBlock,/z-index:70!important/);
assert.match(topbarBlock,/min-height:var\(--v76-shell-header-height\)!important/);
assert.match(topbarBlock,/padding:calc\(var\(--v76-shell-safe-top\) \+ 6px\) 14px 8px!important/);
assert.match(shell,/html\.cdc-v75\.app-active \.main>\.page\{[\s\S]*padding:16px 14px var\(--v76-shell-nav-reserve\)!important;[\s\S]*overflow:visible!important/);
const navBlock=shell.match(/html\.cdc-v75\.app-active body \.mobile-nav\{[\s\S]*?\n  \}/)?.[0]||'';
assert.ok(navBlock,'mobile dock block must exist');
assert.match(navBlock,/position:fixed!important/);
assert.match(navBlock,/bottom:var\(--v76-shell-safe-bottom\)!important/);
assert.match(navBlock,/min-width:0!important/);
assert.match(navBlock,/max-width:calc\(100% - 20px\)!important/);
assert.match(navBlock,/height:var\(--v76-shell-nav-height\)!important/);
assert.doesNotMatch(shell,/\bzoom\s*:/i);

assert.equal(pkg.version,'0.76.0');
/* A revisão pública permanece em shell2 até o shell4 passar o browser-smoke. O bundle copia o CSS fonte atual. */
assert.match(prepare,/const MOBILE_SHELL_REV = '76-mobile-shell2'/);
assert.match(prepare,/'v76-mobile-shell\.css'/);
assert.match(prepare,/v76-modern-ui\.css\?v=\$\{MODERN_UI_REV\}[\s\S]*v76-mobile-shell\.css\?v=\$\{MOBILE_SHELL_REV\}/);
assert.match(sw,/mobile-shell2/);
assert.ok(sw.includes("'./v76-mobile-shell.css'"));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const builtIndex=read('dist/index.html');
  const builtShell=read('dist/v76-mobile-shell.css');
  assert.match(builtIndex,/name="app-version" content="0\.76\.0"/);
  assert.match(builtIndex,/v76-modern-ui\.css\?v=76-modern-ui1/);
  assert.match(builtIndex,/v76-mobile-shell\.css\?v=76-mobile-shell2/);
  assert.match(builtShell,/Conta de Casa v76 — 76-mobile-shell4/,'release bundle must contain the current sticky-header shell source');
  assert.match(builtShell,/position:sticky!important/);
  assert.ok(builtIndex.indexOf('v76-modern-ui.css')<builtIndex.indexOf('v76-mobile-shell.css'),'mobile shell must be the final mobile geometry layer');
  assert.ok(fs.existsSync(path.join(dist,'v76-mobile-shell.css')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('v76 mobile shell4 sticky-header, single-column, safe-area, document-scroll and dock-reserve tests: OK');

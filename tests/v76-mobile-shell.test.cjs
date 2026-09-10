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

assert.match(shell,/Conta de Casa v76 — 76-mobile-shell2/);
assert.match(shell,/@media \(max-width:820px\)/);
assert.match(shell,/--v76-shell-safe-top:max\(24px,env\(safe-area-inset-top,0px\)\)/);
assert.match(shell,/--v76-shell-safe-bottom:max\(8px,env\(safe-area-inset-bottom,0px\)\)/);
assert.match(shell,/--v76-shell-nav-reserve:calc\(var\(--v76-shell-nav-height\) \+ var\(--v76-shell-safe-bottom\) \+ 28px\)/);
assert.match(shell,/html\.cdc-v75\.app-active \.app-shell\{[\s\S]*height:auto!important;[\s\S]*max-height:none!important;[\s\S]*overflow:visible!important/);
assert.match(shell,/html\.cdc-v75\.app-active body \.main\{[\s\S]*height:auto!important;[\s\S]*max-height:none!important;[\s\S]*overflow:visible!important/);
assert.match(shell,/html\.cdc-v75\.app-active \.main>\.topbar,[\s\S]*position:relative!important;[\s\S]*padding:calc\(var\(--v76-shell-safe-top\) \+ 6px\) 14px 8px!important/);
assert.match(shell,/html\.cdc-v75\.app-active \.main>\.page\{[\s\S]*padding:16px 14px var\(--v76-shell-nav-reserve\)!important;[\s\S]*overflow:visible!important/);
assert.match(shell,/html\.cdc-v75\.app-active body \.mobile-nav\{[\s\S]*position:fixed!important;[\s\S]*bottom:var\(--v76-shell-safe-bottom\)!important;[\s\S]*height:var\(--v76-shell-nav-height\)!important/);
assert.doesNotMatch(shell,/\bzoom\s*:/i);

assert.equal(pkg.version,'0.76.0-dev.2');
assert.match(prepare,/const MOBILE_SHELL_REV = '76-mobile-shell2'/);
assert.match(prepare,/'v76-mobile-shell\.css'/);
assert.match(prepare,/v76-modern-ui\.css\?v=\$\{MODERN_UI_REV\}[\s\S]*v76-mobile-shell\.css\?v=\$\{MOBILE_SHELL_REV\}/);
assert.match(sw,/mobile-shell2/);
assert.ok(sw.includes("'./v76-mobile-shell.css'"));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const builtIndex=read('dist/index.html');
  assert.match(builtIndex,/name="app-version" content="0\.76\.0-dev\.2"/);
  assert.match(builtIndex,/v76-modern-ui\.css\?v=76-modern-ui1/);
  assert.match(builtIndex,/v76-mobile-shell\.css\?v=76-mobile-shell2/);
  assert.ok(builtIndex.indexOf('v76-modern-ui.css')<builtIndex.indexOf('v76-mobile-shell.css'),'mobile shell must be the final mobile geometry layer');
  assert.ok(fs.existsSync(path.join(dist,'v76-mobile-shell.css')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('v76 mobile shell safe-area, document-scroll and dock-reserve tests: OK');

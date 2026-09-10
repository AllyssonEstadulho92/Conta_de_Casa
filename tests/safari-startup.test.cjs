'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const guard=read('v75-startup-guard.js');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');

assert.match(guard,/75-startup1/);
assert.match(guard,/appActive&&vault\.hidden&&app\.hidden/);
assert.match(guard,/vault\.hidden=false/);
assert.match(guard,/aria-busy/);
assert.match(guard,/A preparar a aplicação com segurança…/);
assert.match(guard,/active&&!app\.hidden/);
assert.match(guard,/MutationObserver/);
assert.doesNotMatch(guard,/\bappState\b|amountCents|estimatedCents|actualCents|saveState\(|persistState\(|openDb\(|idbGet\(|syncNow\(/,'startup guard must remain presentation-only');

assert.match(sw,/photo-loader2-startup1/);
assert.match(sw,/const NAVIGATION_TIMEOUT_MS = 4000/);
assert.match(sw,/async function navigationResponse\(request\)/);
assert.match(sw,/new AbortController\(\)/);
assert.match(sw,/controller\.abort\(\)/);
assert.match(sw,/caches\.match\('\.\/index\.html'\)/);
assert.match(sw,/fetch\(request,\{cache:'no-store',signal:controller\.signal\}\)/);
assert.match(sw,/event\.respondWith\(navigationResponse\(event\.request\)\)/);
assert.doesNotMatch(sw,/event\.respondWith\(fetch\(event\.request\)\.catch/);
assert.match(sw,/status:503/);
assert.ok(sw.includes("'./v75-startup-guard.js'"));

assert.match(prepare,/const STARTUP_REV = '75-startup1'/);
assert.ok(prepare.includes("'v75-startup-guard.js'"));
assert.match(prepare,/v75-startup-guard\.js\?v=\$\{STARTUP_REV\}/);

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/v75-startup-guard\.js\?v=75-startup1/);
  assert.ok(index.indexOf('v75-startup-guard.js')>index.indexOf('v75-stability.js'),'startup guard must load after stability');
  assert.ok(fs.existsSync(path.join(dist,'v75-startup-guard.js')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Safari/PWA startup keeps a secure visible state and bounded navigation fallback: OK');

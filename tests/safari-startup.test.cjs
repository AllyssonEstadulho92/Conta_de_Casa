'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const guard=read('v75-startup-guard.js');
const events=read('events.js');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');
const core=read('core.js');

// 76-auth-canonical2: o runtime canónico abre a aplicação local imediatamente.
assert.match(guard,/76-auth-canonical2/);
assert.match(guard,/function syncAuthVisibility\(\)/);
assert.match(guard,/if\(!appActive\)[\s\S]*app\.hidden=true[\s\S]*vault\.hidden=false/);
assert.match(guard,/if\(!app\.hidden&&!vault\.hidden\)vault\.hidden=true/);
assert.doesNotMatch(guard,/root\.enterApp\s*=/,'startup guard must not monkey-patch enterApp');
assert.doesNotMatch(guard,/root\.syncStartupGate\s*=/,'startup guard must not monkey-patch syncStartupGate');

assert.match(events,/let startupSyncPromise=null/);
assert.match(events,/let controllerEstablished=Boolean\(navigator\.serviceWorker\.controller\)/,'initial worker control must be distinguished from a real update');
assert.match(events,/if\(!controllerEstablished\)\{[\s\S]{0,120}controllerEstablished=true;[\s\S]{0,120}return;/,'first service-worker claim must not force a reload');
assert.match(events,/startupSyncPromise=Promise\.resolve\(\)[\s\S]*\.then\(\(\)=>syncStartupGate\(\)\)/);
assert.match(events,/\$\('#app'\)\.hidden=false;[\s\S]*showPage\(currentPage\(\)\);[\s\S]*if\(startupSyncPromise\)void startupSyncPromise/,'local UI must become visible without awaiting remote sync');
assert.doesNotMatch(events,/mayShowFinancialData/,'sync state must not gate visibility of already-unlocked local data');
assert.match(core,/PBKDF2_ITERATIONS = 250000/,'PIN KDF strength must remain unchanged');

// Nova revisão invalida PWA antiga; estratégia network-first/fallback permanece intacta.
assert.match(sw,/auth-canonical2/);
assert.match(sw,/runtime-efficiency1/);
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

assert.match(prepare,/const STARTUP_REV = '76-startup-canonical3'/);
assert.ok(prepare.includes("'v75-startup-guard.js'"));
assert.match(prepare,/v75-startup-guard\.js\?v=\$\{STARTUP_REV\}/);
assert.match(prepare,/const SERVICE_WORKER_REV = '76-invoice-hierarchy-ocr7'/);

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  const builtEvents=fs.readFileSync(path.join(dist,'events.js'),'utf8');
  assert.match(index,/v75-startup-guard\.js\?v=76-startup-canonical3/);
  assert.ok(index.indexOf('v75-startup-guard.js')>index.indexOf('v75-stability.js'),'startup guard must load after stability');
  assert.ok(fs.existsSync(path.join(dist,'v75-startup-guard.js')));
  assert.match(fs.readFileSync(path.join(dist,'v75-startup-guard.js'),'utf8'),/76-auth-canonical2/);
  assert.match(builtEvents,/\.\/sw\.js\?v=76-invoice-hierarchy-ocr7/);
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Safari/PWA startup is canonical, local-first, visually exclusive and remote sync remains background-only: OK');

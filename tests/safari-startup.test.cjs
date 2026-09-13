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
const core=read('core.js');

// 76-auth-transition1: PIN local válido abre a aplicação sem depender do sync remoto.
assert.match(guard,/76-auth-transition1/);
assert.match(guard,/function syncAuthVisibility\(\)/);
assert.match(guard,/if\(!appActive\)[\s\S]*app\.hidden=true[\s\S]*vault\.hidden=false/);
assert.match(guard,/if\(!app\.hidden&&!vault\.hidden\)vault\.hidden=true/);
assert.match(guard,/function installNonBlockingEnterApp\(\)/);
assert.match(guard,/root\.syncStartupGate=async\(\)=> 'synced'/);
assert.match(guard,/await originalEnterApp\(\)/);
assert.match(guard,/root\.showPage\('dashboard'\)/);
assert.match(guard,/Promise\.resolve\(realGate\(\)\)\.catch/);
assert.match(guard,/classList\.remove\('app-active'\)/);
assert.match(guard,/if\(app\)app\.hidden=true/);
assert.match(guard,/if\(vault\)vault\.hidden=false/);

// A otimização de sync emparelhado continua disponível, mas em background.
assert.match(guard,/installFastPairedSyncGate/);
assert.match(guard,/meta\?\.pairedAt&&meta\?\.lastRemoteSha/);
assert.match(guard,/loadSyncToken\(\)/);
assert.match(guard,/syncNow\('startup-background'\)/);
assert.match(guard,/return 'offline-paired'/);
assert.doesNotMatch(guard,/amountCents|estimatedCents|actualCents|saveState\(|persistState\(|commit\s*\(/,'auth transition must not manipulate financial state');
assert.match(core,/PBKDF2_ITERATIONS = 250000/,'PIN KDF strength must remain unchanged');

// Nova revisão invalida PWA antiga; estratégia network-first/fallback permanece intacta.
assert.match(sw,/auth-transition1/);
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

// O nome do asset permanece estável; a revisão de cache é a autoridade desta correção.
assert.match(prepare,/const STARTUP_REV = '75-startup2'/);
assert.ok(prepare.includes("'v75-startup-guard.js'"));
assert.match(prepare,/v75-startup-guard\.js\?v=\$\{STARTUP_REV\}/);

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/v75-startup-guard\.js\?v=75-startup2/);
  assert.ok(index.indexOf('v75-startup-guard.js')>index.indexOf('v75-stability.js'),'startup guard must load after stability');
  assert.ok(fs.existsSync(path.join(dist,'v75-startup-guard.js')));
  assert.match(fs.readFileSync(path.join(dist,'v75-startup-guard.js'),'utf8'),/76-auth-transition1/);
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Safari/PWA PIN transition is local-first, mutually exclusive and sync remains non-blocking: OK');

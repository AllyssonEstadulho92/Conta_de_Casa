'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const css=read('v75-stability.css');
const usability=read('v75-usability.css');
const js=read('v75-stability.js');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');
const index=read('index.html');
const core=read('core.js');
const finance=read('finance.js');

assert.match(css,/revisão transversal de estabilidade visual/i);
assert.match(css,/--v75-ui-font:-apple-system,BlinkMacSystemFont/);
assert.match(css,/overflow-x:clip/);
assert.match(css,/@media\(max-width:820px\)/);
assert.match(css,/font-size:16px!important/,'mobile form controls must avoid Safari focus zoom');
assert.match(css,/safe-area-inset-left/);
assert.match(css,/safe-area-inset-right/);
assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/);
assert.match(css,/Imagem indisponível/);
assert.match(css,/\.market-product-photo\.is-loading::before/);
assert.match(css,/\.market-product-photo-button:disabled/);
assert.match(css,/@media\(max-width:430px\)[\s\S]*\.cdc-product-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/,'compact phones must use two product columns');
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/forced-colors:active/);

/* Critério anti-zoom acidental: não bloqueia pinch-to-zoom e usa a correção recomendada para iOS. */
assert.match(usability,/fundação de usabilidade 75-usability1/i);
assert.match(usability,/touch-action:manipulation/,'interactive controls must suppress accidental double-tap zoom');
assert.match(usability,/font-size:16px!important/,'focused mobile form controls must remain at least 16px');
assert.match(usability,/100dvh/,'vault must follow the dynamic mobile viewport');
assert.match(usability,/safe-area-inset-top/);
assert.match(usability,/--v75-usability-tap-target:44px/);
assert.doesNotMatch(index,/maximum-scale\s*=|user-scalable\s*=\s*no/i,'manual browser zoom must remain available for accessibility');

assert.match(js,/revision:'75-stability1'/);
assert.match(js,/meta\[name="theme-color"\]/);
assert.match(js,/\.market-product-photo/);
assert.match(js,/addEventListener\('load'/);
assert.match(js,/addEventListener\('error'/);
assert.match(js,/Imagem indisponível/);
assert.match(js,/aria-disabled/);
assert.match(js,/photo instanceof HTMLButtonElement/);
assert.match(js,/MutationObserver/);
assert.doesNotMatch(js,/\bappState\b|amountCents|estimatedCents|actualCents|saveState\(|persistState\(|openDB\(/,'stability layer must not manipulate application/financial state');
assert.doesNotMatch(usability,/STATE_VERSION|amountCents|estimatedCents|actualCents|PBKDF2|AES-GCM/,'usability CSS must stay isolated from financial/security state');

/* O núcleo financeiro não é substituído pela revisão visual. */
assert.match(core,/STATE_VERSION\s*=\s*5/);
assert.match(finance,/function sumCents/);

assert.match(prepare,/const STABILITY_REV = '75-stability1'/);
assert.match(prepare,/const USABILITY_REV = '75-usability1'/);
assert.ok(prepare.includes("'v75-stability.css'"));
assert.ok(prepare.includes("'v75-stability.js'"));
assert.ok(prepare.includes("'v75-usability.css'"));
assert.match(prepare,/v75-stability\.css\?v=\$\{STABILITY_REV\}/);
assert.match(prepare,/v75-stability\.js\?v=\$\{STABILITY_REV\}/);
assert.match(prepare,/v75-usability\.css\?v=\$\{USABILITY_REV\}/);
assert.match(sw,/stability1/);
assert.match(sw,/usability1/);
assert.ok(sw.includes("'./v75-stability.css'"));
assert.ok(sw.includes("'./v75-stability.js'"));
assert.ok(sw.includes("'./v75-usability.css'"));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const builtIndex=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(builtIndex,/v75-header-refinement\.css\?v=75-header2/);
  assert.match(builtIndex,/v75-stability\.css\?v=75-stability1/);
  assert.match(builtIndex,/v75-usability\.css\?v=75-usability1/);
  assert.match(builtIndex,/v75-architecture\.js\?v=75-architecture2/);
  assert.match(builtIndex,/v75-stability\.js\?v=75-stability1/);
  assert.ok(builtIndex.indexOf('v75-stability.css')>builtIndex.indexOf('v75-header-refinement.css'),'stability CSS must load after header refinement');
  assert.ok(builtIndex.indexOf('v75-usability.css')>builtIndex.indexOf('v75-drawer-theme.css'),'usability CSS must load last among the transversal visual layers');
  assert.ok(builtIndex.indexOf('v75-stability.js')>builtIndex.indexOf('v75-architecture.js'),'stability JS must load after architecture JS');
  assert.ok(fs.existsSync(path.join(dist,'v75-stability.css')));
  assert.ok(fs.existsSync(path.join(dist,'v75-stability.js')));
  assert.ok(fs.existsSync(path.join(dist,'v75-usability.css')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('v75 cross-application stability, usability, image fallback and distribution tests: OK');

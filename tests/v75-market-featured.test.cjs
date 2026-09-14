'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');

const css=read('v75-market-featured.css');
const legacyCss=read('v74-experience.css');
const js=read('v75-market-featured.js');
const prepare=read('scripts/prepare-pages.cjs');
const sw=read('sw.js');

/* O runtime Featured continua retirado. */
assert.match(js,/compatibilidade de retirada do antigo Featured 75-featured1/i);
assert.match(js,/revision:'75-featured1'/);
assert.match(js,/retired:true/);
assert.match(js,/function upgrade\(\)\{return false;\}/);
assert.doesNotMatch(js,/MutationObserver|addEventListener|requestAnimationFrame|scrollTo\(/);
assert.doesNotMatch(js,/\bfetch\s*\(|world\.openfoodfacts|continente\.pt|pingodoce\.pt/i);
assert.doesNotMatch(js,/\bappState\b|\bcommit\s*\(|\bsaveState\s*\(|estimatedCents|actualCents|quantity\s*=/);

/* 75-featured1 é agora a ponte temporária para as estruturas v76 ainda vivas. */
assert.match(css,/Conta de Casa v76 — ponte de retirada 75-featured1/i);
for(const selector of ['.cdc-empty-note','.cdc-avatar','.cdc-category-dot','.cdc-planning-overview','.cdc-budget-ring','.cdc-plan-track','.cdc-more-menu','.cdc-preferences-details']){
  assert.ok(css.includes(selector),`migration bridge must own ${selector}`);
}
assert.match(css,/@media\(max-width:820px\)/);
assert.match(css,/@media\(min-width:821px\)/);
assert.match(css,/\.cdc-preferences-details\{display:contents\}/);
assert.match(css,/\.cdc-planning-overview,[\s\S]*\.cdc-more-menu[\s\S]*display:none!important/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.doesNotMatch(css,/cdc-featured-carousel|cdc-featured-card|scroll-snap-type/,'retired Featured visual behavior must not remain');

/* v74 CSS deixa de exercer qualquer autoridade visual. */
assert.match(legacyCss,/76-retire-v74-css-behavior1/);
assert.doesNotMatch(legacyCss,/\{[^}]*\}/,'retired v74 stylesheet must contain no CSS rule blocks');

/* Distribuição permanece compatível até à remoção física dos nomes legados. */
assert.match(prepare,/const FEATURED_REV = '75-featured1'/);
assert.match(prepare,/'v75-market-featured\.css'/);
assert.match(prepare,/'v75-market-featured\.js'/);
assert.match(prepare,/'v74-experience\.css'/);
assert.match(sw,/'\.\/v75-market-featured\.css'/);
assert.match(sw,/'\.\/v75-market-featured\.js'/);
assert.match(sw,/'\.\/v74-experience\.css'/);

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=read('dist/index.html');
  assert.match(index,/v74-experience\.css\?v=74-experience2/);
  assert.match(index,/v75-market-featured\.css\?v=75-featured1/);
  assert.match(index,/v75-market-featured\.js\?v=75-featured1/);
  const builtLegacy=read('dist/v74-experience.css');
  const builtBridge=read('dist/v75-market-featured.css');
  const builtJs=read('dist/v75-market-featured.js');
  assert.match(builtLegacy,/76-retire-v74-css-behavior1/);
  assert.doesNotMatch(builtLegacy,/\{[^}]*\}/);
  assert.match(builtBridge,/\.cdc-preferences-details\{display:contents\}/);
  assert.match(builtJs,/retired:true/);
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('v74 CSS authority retired; live Planning/More structures are owned by the v76 migration bridge: OK');

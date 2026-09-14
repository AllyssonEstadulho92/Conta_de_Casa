'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');

const css=read('v75-market-featured.css');
const js=read('v75-market-featured.js');
const prepare=read('scripts/prepare-pages.cjs');
const sw=read('sw.js');

/* O CSS permanece temporariamente no bundle até à remoção física conjunta. */
assert.match(css,/revisão 75-featured1/i);
assert.match(css,/scroll-snap-type:x mandatory/);
assert.match(css,/cdc-featured-fallback/);

/* O runtime legado torna-se um stub sem custo operacional. */
assert.match(js,/compatibilidade de retirada do antigo Featured 75-featured1/i);
assert.match(js,/revision:'75-featured1'/);
assert.match(js,/retired:true/);
assert.match(js,/function upgrade\(\)\{return false;\}/);
assert.doesNotMatch(js,/MutationObserver|addEventListener|requestAnimationFrame|scrollTo\(/,'retired Featured must not install observers or UI listeners');
assert.doesNotMatch(js,/\bfetch\s*\(|world\.openfoodfacts|continente\.pt|pingodoce\.pt/i,'retired Featured must not perform network work');
assert.doesNotMatch(js,/\bappState\b|\bcommit\s*\(|\bsaveState\s*\(|estimatedCents|actualCents|quantity\s*=/,'retired Featured must not touch application or financial state');

/* Compatibilidade de distribuição é preservada nesta etapa. */
assert.match(prepare,/const FEATURED_REV = '75-featured1'/);
assert.match(prepare,/'v75-market-featured\.css'/);
assert.match(prepare,/'v75-market-featured\.js'/);
assert.match(prepare,/v75-market-featured\.css\?v=\$\{FEATURED_REV\}/);
assert.match(prepare,/v75-market-featured\.js\?v=\$\{FEATURED_REV\}/);
assert.match(sw,/featured1/);
assert.match(sw,/'\.\/v75-market-featured\.css'/);
assert.match(sw,/'\.\/v75-market-featured\.js'/);

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=read('dist/index.html');
  assert.match(index,/v75-market-featured\.css\?v=75-featured1/);
  assert.match(index,/v75-market-featured\.js\?v=75-featured1/);
  assert.ok(fs.existsSync(path.join(dist,'v75-market-featured.css')));
  assert.ok(fs.existsSync(path.join(dist,'v75-market-featured.js')));
  const builtJs=read('dist/v75-market-featured.js');
  assert.match(builtJs,/retired:true/);
  assert.doesNotMatch(builtJs,/MutationObserver|\bfetch\s*\(/);
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Retired Featured compatibility stub ships with no observers, listeners, network or financial-state access: OK');

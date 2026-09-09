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

assert.match(css,/revisão 75-featured1/i);
assert.match(css,/grid-auto-flow:column/);
assert.match(css,/grid-auto-columns:var\(--featured-card-width\)/);
assert.match(css,/scroll-snap-type:x mandatory/);
assert.match(css,/--featured-image-height:154px/);
assert.match(css,/-webkit-line-clamp:2/);
assert.match(css,/cdc-featured-fallback/);
assert.match(css,/Imagem indisponível|fallback/i);
assert.match(css,/cdc-featured-controls/);
assert.match(css,/prefers-reduced-motion/);

assert.match(js,/revision:'75-featured1'/);
assert.match(js,/Produtos em destaque/);
assert.match(js,/Seleção da sua lista de compras/);
assert.match(js,/Imagem indisponível/);
assert.match(js,/Na sua lista/);
assert.match(js,/world\.openfoodfacts\.org\/api\/v2\/product\//);
assert.match(js,/productCode/);
assert.match(js,/safeImageUrl/);
assert.match(js,/images\.openfoodfacts\.org/);
assert.match(js,/www\.continente\.pt/);
assert.match(js,/static\.pingodoce\.pt/);
assert.match(js,/MutationObserver/);
assert.match(js,/scrollTo\(/);
assert.doesNotMatch(js,/\bcommit\s*\(/,'featured layer must not persist state');
assert.doesNotMatch(js,/\bsaveState\s*\(/,'featured layer must not save state');
assert.doesNotMatch(js,/appState\s*\.[A-Za-z0-9_$]+\s*=/,'featured layer must not mutate appState properties');
assert.doesNotMatch(js,/appState\s*=\s*/,'featured layer must not replace appState');

assert.match(prepare,/const FEATURED_REV = '75-featured1'/);
assert.match(prepare,/'v75-market-featured\.css'/);
assert.match(prepare,/'v75-market-featured\.js'/);
assert.match(prepare,/v75-market-featured\.css\?v=\$\{FEATURED_REV\}/);
assert.match(prepare,/v75-market-featured\.js\?v=\$\{FEATURED_REV\}/);
assert.match(sw,/drawer2-featured1/);
assert.match(sw,/'\.\/v75-market-featured\.css'/);
assert.match(sw,/'\.\/v75-market-featured\.js'/);

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=read('dist/index.html');
  assert.match(index,/v75-market-featured\.css\?v=75-featured1/);
  assert.match(index,/v75-market-featured\.js\?v=75-featured1/);
  assert.ok(index.indexOf('v75-layout-polish.css?v=75-layout1')<index.indexOf('v75-market-featured.css?v=75-featured1'));
  assert.ok(index.indexOf('v75-market-featured.css?v=75-featured1')<index.indexOf('v75-drawer-theme.css?v=75-drawer2'));
  assert.ok(index.indexOf('v75-stability.js?v=75-stability1')<index.indexOf('v75-market-featured.js?v=75-featured1'));
  assert.ok(fs.existsSync(path.join(dist,'v75-market-featured.css')));
  assert.ok(fs.existsSync(path.join(dist,'v75-market-featured.js')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('v75 featured Mercado prototype, image fallback and distribution expectations: OK');

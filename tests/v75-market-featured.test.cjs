'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');

const planningMore=read('v76-planning-more.css');
const historicalCss=read('v75-market-featured.css');
const legacyCss=read('v74-experience.css');
const historicalJs=read('v75-market-featured.js');
const prepare=read('scripts/prepare-pages.cjs');
const sw=read('sw.js');
const publicFilesStart=prepare.indexOf('const PUBLIC_FILES');
const publicFilesEnd=prepare.indexOf(']);',publicFilesStart);
const publicFilesBlock=prepare.slice(publicFilesStart,publicFilesEnd+3);

/* Fontes históricas permanecem auditáveis no repositório, mas não são executadas. */
assert.match(historicalJs,/compatibilidade de retirada do antigo Featured 75-featured1/i);
assert.match(historicalJs,/revision:'75-featured1'/);
assert.match(historicalJs,/retired:true/);
assert.match(historicalJs,/function upgrade\(\)\{return false;\}/);
assert.doesNotMatch(historicalJs,/MutationObserver|addEventListener|requestAnimationFrame|scrollTo\(/);
assert.doesNotMatch(historicalJs,/\bfetch\s*\(|world\.openfoodfacts|continente\.pt|pingodoce\.pt/i);
assert.doesNotMatch(historicalJs,/\bappState\b|\bcommit\s*\(|\bsaveState\s*\(|estimatedCents|actualCents|quantity\s*=/);
assert.match(historicalCss,/Conta de Casa v76 — ponte de retirada 75-featured1/i);
assert.match(legacyCss,/76-retire-v74-css-behavior1/);
assert.doesNotMatch(legacyCss,/\{[^}]*\}/,'retired v74 stylesheet source must contain no CSS rule blocks');

/* Planeamento/Mais têm agora uma camada canónica v76. */
assert.match(planningMore,/Conta de Casa v76 — Planeamento e Mais, revisão 76-planning-more1/i);
for(const selector of ['.cdc-empty-note','.cdc-avatar','.cdc-category-dot','.cdc-planning-overview','.cdc-budget-ring','.cdc-plan-track','.cdc-more-menu','.cdc-preferences-details']){
  assert.ok(planningMore.includes(selector),`v76 Planning/More layer must own ${selector}`);
}
assert.match(planningMore,/@media\(max-width:820px\)/);
assert.match(planningMore,/@media\(min-width:821px\)/);
assert.match(planningMore,/\.cdc-preferences-details\{display:contents\}/);
assert.match(planningMore,/\.cdc-planning-overview,[\s\S]*\.cdc-more-menu[\s\S]*display:none!important/);
assert.match(planningMore,/prefers-reduced-motion:reduce/);
assert.doesNotMatch(planningMore,/cdc-featured-carousel|cdc-featured-card|scroll-snap-type/,'retired Featured visual behavior must not return');

/* Distribuição: só a camada v76 entra em Pages/cache. */
assert.match(prepare,/const PLANNING_MORE_REV = '76-planning-more1'/);
assert.doesNotMatch(prepare,/const FEATURED_REV/);
assert.doesNotMatch(prepare,/const EXPERIENCE_REV/);
assert.ok(publicFilesBlock.includes("'v76-planning-more.css'"));
for(const retired of ['v74-experience.css','v75-market-featured.css','v75-market-featured.js'])assert.ok(!publicFilesBlock.includes(`'${retired}'`),`${retired} must not be public`);
assert.match(sw,/'\.\/v76-planning-more\.css'/);
assert.match(sw,/retire-assets1/);
for(const retired of ['./v74-experience.css','./v75-market-featured.css','./v75-market-featured.js'])assert.doesNotMatch(sw,new RegExp(retired.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=read('dist/index.html');
  assert.match(index,/v76-planning-more\.css\?v=76-planning-more1/);
  assert.doesNotMatch(index,/v74-experience\.css/);
  assert.doesNotMatch(index,/v75-market-featured\.(?:css|js)/);
  const built=read('dist/v76-planning-more.css');
  assert.match(built,/\.cdc-preferences-details\{display:contents\}/);
  for(const retired of ['v74-experience.css','v75-market-featured.css','v75-market-featured.js'])assert.ok(!fs.existsSync(path.join(dist,retired)),`${retired} must not exist in dist`);
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Planning/More are owned by v76 and retired v74/Featured assets are excluded from Pages: OK');

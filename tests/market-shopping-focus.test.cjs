'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const js=read('market-shopping-focus.js');
const css=read('market-shopping-focus.css');
const brand=read('market-brand.css');
const architecture=read('v75-architecture.css');
const planningMore=read('v76-planning-more.css');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');
const manifest=JSON.parse(read('release-manifest.json'));

new Function(js);
assert.match(js,/Adicionar produto à lista de compras/);
assert.match(js,/newMarketBtn/,'header + must reuse the existing market add action');
assert.match(js,/stopImmediatePropagation\(\)/);
assert.match(js,/market-compact-summary/);
assert.match(js,/Resumo financeiro/);
assert.match(js,/market-purchased-group/);
assert.match(js,/group\.open=false/);
assert.match(js,/group\.open=true/);
assert.match(js,/market-item-details/);
assert.match(js,/marketClearFilters/);
assert.doesNotMatch(js,/saveState|commit\(|estimatedCents\s*=|actualCents\s*=|quantity\s*=/,'shopping focus layer must not mutate financial state');

assert.match(css,/Conta de Casa v74/);
assert.match(css,/@media\(max-width:820px\)/);
assert.match(css,/#page-market #marketSummary\{display:none!important\}/);
assert.match(css,/#page-market \.market-new-btn\{display:none!important\}/);
assert.match(css,/\.market-filter-clear\[hidden\]\{display:none!important\}/);
assert.match(css,/\.market-mobile-quick-price/);
assert.match(css,/grid-template-columns:38px 54px minmax\(0,1fr\) auto!important/);
assert.match(css,/\.market-item-details>summary/);
assert.match(css,/min-height:44px/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(brand,/\.market-product-photo[\s\S]*display:grid!important/);
assert.ok(!fs.existsSync(path.join(ROOT,'v74-experience.css')),'retired v74 CSS source must be deleted from repository');
assert.match(architecture,/\.mobile-nav \.nav-btn,html\.cdc-v75 \.mobile-nav \.nav-btn:nth-child\(3\)[\s\S]*visibility:visible!important/,'v75 must keep Mercado visible in primary navigation');
assert.match(architecture,/\.cdc-product-grid[\s\S]*repeat\(3,minmax\(0,1fr\)\)/,'v76 architecture must keep compact product cards where that component is used');
assert.match(planningMore,/76-planning-more1/);

assert.equal(manifest.latestVersion,'v76');
assert.equal(manifest.releases[0]?.version,'v76');
const v65=manifest.releases.find(release=>release.version==='v65');
assert.ok(v65,'v65 shopping behavior must remain documented after v76');
assert.ok(v65.items.some(item=>/Lista de compras/i));
assert.ok(v65.items.some(item=>/por comprar/i));
assert.ok(v65.items.some(item=>/comprados/i));

assert.ok(sw.includes("'./market-shopping-focus.css'"));
assert.ok(sw.includes("'./market-shopping-focus.js'"));
assert.ok(sw.includes("'./v75-architecture.css'"));
assert.ok(sw.includes("'./v76-planning-more.css'"));
for(const retired of ['./v74-experience.css','./v74-experience.js','./v75-market-featured.css','./v75-market-featured.js'])assert.ok(!sw.includes(`'${retired}'`),`${retired} must not be cached`);
assert.match(sw,/v74-shopping2/);
assert.match(sw,/v73-menu8/);
assert.match(sw,/planning-more1/);
assert.match(sw,/76-architecture-efficiency7/);
assert.match(sw,/v76-version-alignment1/);
assert.match(sw,/retire-v74-runtime1/);
assert.match(sw,/retire-assets1/);
assert.match(prepare,/const BUILD = 'v76'/);
assert.match(prepare,/const APP_UPDATE_REV = '76-version-alignment1'/);
assert.match(prepare,/const SHOPPING_REV = '74-shopping2'/);
assert.match(prepare,/const MENU_REV = '73-menu8'/);
assert.match(prepare,/const ARCHITECTURE_REV = '76-planning-commitment1'/);
assert.match(prepare,/const PLANNING_MORE_REV = '76-planning-more1'/);
assert.doesNotMatch(prepare,/const EXPERIENCE_REV/);
assert.doesNotMatch(prepare,/const FEATURED_REV/);

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/name="app-build" content="v76"/);
  assert.doesNotMatch(index,/v64-runtime\.css/);
  assert.match(index,/market-shopping-focus\.css\?v=74-shopping2/);
  assert.match(index,/market-shopping-focus\.js\?v=74-shopping2/);
  assert.match(index,/mobile-menu-toggle\.css\?v=73-menu8/);
  assert.match(index,/mobile-menu-toggle\.js\?v=73-menu8/);
  assert.match(index,/v75-architecture\.css\?v=76-planning-commitment1/);
  assert.match(index,/v76-planning-more\.css\?v=76-planning-more1/);
  assert.match(index,/v75-architecture\.js\?v=76-planning-commitment1/);
  assert.doesNotMatch(index,/v74-experience\.(?:css|js)/);
  assert.doesNotMatch(index,/v75-market-featured\.(?:css|js)/);
  assert.ok(index.indexOf('market-shopping-focus.css')<index.indexOf('mobile-menu-toggle.css'));
  assert.ok(index.indexOf('mobile-menu-toggle.css')<index.indexOf('v75-architecture.css'));
  assert.ok(index.indexOf('v75-architecture.css')<index.indexOf('v76-planning-more.css'));
  assert.ok(index.indexOf('market-category-groups.js')<index.indexOf('market-shopping-focus.js'));
  assert.ok(index.indexOf('market-shopping-focus.js')<index.indexOf('mobile-menu-toggle.js'));
  assert.ok(index.indexOf('mobile-menu-toggle.js')<index.indexOf('v75-architecture.js'));
  for(const asset of ['market-shopping-focus.css','market-shopping-focus.js','v75-architecture.css','v76-planning-more.css','v75-architecture.js'])assert.ok(fs.existsSync(path.join(dist,asset)));
  for(const retired of ['v74-experience.css','v74-experience.js','v75-market-featured.css','v75-market-featured.js'])assert.ok(!fs.existsSync(path.join(dist,retired)),`${retired} must stay out of dist`);
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Mobile shopping focus preserved with official v76 release and retired v74/Featured sources removed from repository/distribution: OK');

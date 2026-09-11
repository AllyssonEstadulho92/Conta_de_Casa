'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const js=read('market-category-groups.js');
const css=read('market-category-groups.css');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');
const publicFilesStart=prepare.indexOf('const PUBLIC_FILES');
const publicFilesEnd=prepare.indexOf(']);',publicFilesStart);
const publicFilesBlock=prepare.slice(publicFilesStart,publicFilesEnd+3);

new Function(js);
assert.match(js,/CATEGORY_ORDER/);
assert.match(js,/market-category-group/);
assert.match(js,/market-category-summary/);
assert.match(js,/market-category-items/);
assert.match(js,/MutationObserver/);
assert.match(js,/data-market-toggle/);
assert.match(js,/details\.open=true/);
assert.match(js,/localeCompare\(b,'pt-PT'\)/);
assert.match(js,/category==='Mercearia \/ Despensa'\)return 'plan'/);
assert.doesNotMatch(js,/estimatedCents|actualCents|saveState|commit\(/);

assert.match(css,/@media\(max-width:820px\)/);
assert.match(css,/\.market-category-group\{/);
assert.match(css,/--market-item-indent:52px/);
assert.match(css,/grid-template-columns:38px minmax\(0,1fr\) 20px/);
assert.match(css,/\.market-category-count\{[\s\S]*justify-self:start/);
assert.match(css,/\.market-category-items \.status-chip\{[\s\S]*justify-self:start/);
assert.match(css,/\.market-category-items \.market-mobile-actions\{[\s\S]*justify-content:flex-start/);
assert.match(css,/prefers-reduced-motion:reduce/);

assert.match(sw,/conta-de-casa-public-v76-release1/);
assert.match(sw,/architecture-baseline1/);
assert.ok(sw.includes("'./market-category-groups.css'"));
assert.ok(sw.includes("'./market-category-groups.js'"));
assert.ok(sw.includes("'./design-system.css'"));
assert.ok(sw.includes("'./v74-experience.css'"));
assert.ok(sw.includes("'./v75-architecture.css'"));
assert.ok(sw.includes("'./v75-header-refinement.css'"));
assert.ok(!sw.includes("'./ui-consistency.css'"));
assert.ok(!sw.includes("'./v64-runtime.css'"));
assert.ok(sw.includes("'./v64-runtime.js'"));
assert.ok(sw.includes("'./v74-experience.js'"));
assert.ok(sw.includes("'./v75-architecture.js'"));
assert.match(prepare,/const BUILD = 'v76'/);
assert.match(prepare,/const UI_REV = '74-ui1'/);
assert.match(prepare,/const CATEGORY_REV = '64-ui1'/);
assert.match(prepare,/const RUNTIME_REV = '64-runtime1'/);
assert.match(prepare,/const MENU_REV = '73-menu8'/);
assert.match(prepare,/const EXPERIENCE_REV = '74-experience2'/);
assert.match(prepare,/const ARCHITECTURE_REV = '75-architecture2'/);
assert.match(prepare,/const HEADER_REV = '75-header2'/);
assert.doesNotMatch(publicFilesBlock,/'ui-consistency\.css'/);
assert.doesNotMatch(publicFilesBlock,/'v64-runtime\.css'/);
assert.ok(publicFilesBlock.includes("'v64-runtime.js'"));
assert.ok(publicFilesBlock.includes("'v74-experience.css'"));
assert.ok(publicFilesBlock.includes("'v75-architecture.css'"));
assert.ok(publicFilesBlock.includes("'v75-header-refinement.css'"));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/market-brand\.css\?v=74-ui1/);
  assert.match(index,/market-branding\.js\?v=74-ui1/);
  assert.match(index,/market-category-groups\.css\?v=64-ui1/);
  assert.match(index,/market-category-groups\.js\?v=64-ui1/);
  assert.doesNotMatch(index,/ui-consistency\.css/);
  assert.doesNotMatch(index,/v64-runtime\.css/);
  assert.match(index,/v64-runtime\.js\?v=64-runtime1/);
  assert.match(index,/market-shopping-focus\.css\?v=74-shopping2/);
  assert.match(index,/mobile-menu-toggle\.css\?v=73-menu8/);
  assert.match(index,/v74-experience\.css\?v=74-experience2/);
  assert.match(index,/v74-experience\.js\?v=74-experience2/);
  assert.match(index,/v75-architecture\.css\?v=75-architecture2/);
  assert.match(index,/v75-architecture\.js\?v=75-architecture2/);
  assert.match(index,/v75-header-refinement\.css\?v=75-header2/);
  assert.ok(index.indexOf('market-brand.css')<index.indexOf('market-category-groups.css'));
  assert.ok(index.indexOf('market-category-groups.css')<index.indexOf('market-shopping-focus.css'));
  assert.ok(index.indexOf('mobile-menu-toggle.css')<index.indexOf('v74-experience.css'));
  assert.ok(index.indexOf('v74-experience.css')<index.indexOf('v75-architecture.css'));
  assert.ok(index.indexOf('v75-architecture.css')<index.indexOf('v75-header-refinement.css'));
  assert.ok(index.indexOf('market-branding.js')<index.indexOf('market-category-groups.js'));
  assert.ok(index.indexOf('market-category-groups.js')<index.indexOf('v64-runtime.js'));
  assert.ok(index.indexOf('market-shopping-focus.js')<index.indexOf('mobile-menu-toggle.js'));
  assert.ok(index.indexOf('mobile-menu-toggle.js')<index.indexOf('v74-experience.js'));
  assert.ok(index.indexOf('v74-experience.js')<index.indexOf('v75-architecture.js'));
  for(const asset of ['market-category-groups.css','market-category-groups.js','design-system.css','v64-runtime.js','v74-experience.css','v74-experience.js','v75-architecture.css','v75-architecture.js','v75-header-refinement.css','release-manifest.json'])assert.ok(fs.existsSync(path.join(dist,asset)),`${asset} must exist in dist`);
  assert.ok(!fs.existsSync(path.join(dist,'ui-consistency.css')));
  assert.ok(!fs.existsSync(path.join(dist,'v64-runtime.css')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Market category grouping preserved under the v76 release architecture: OK');

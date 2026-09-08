'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const design=read('design-system.css');
const marketBrand=read('market-brand.css');
const shopping=read('market-shopping-focus.css');
const experience=read('v74-experience.js');
const menuCss=read('mobile-menu-toggle.css');
const menuJs=read('mobile-menu-toggle.js');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');
const publicFilesStart=prepare.indexOf('const PUBLIC_FILES');
const publicFilesEnd=prepare.indexOf(']);',publicFilesStart);
const publicFilesBlock=prepare.slice(publicFilesStart,publicFilesEnd+3);
const manifest=JSON.parse(read('manifest.webmanifest'));

assert.match(design,/Conta de Casa v74/);
assert.match(design,/--bg:#f4f8f8/,'v74 must expose the canonical light shell');
assert.match(design,/--text:#0c2830/,'v74 must expose the canonical ink');
assert.match(design,/--primary:#075b63/,'v74 must expose the primary deep teal');
assert.match(design,/--accent:#17b890/,'v74 must expose the mint accent');
assert.match(design,/--mobile-shell-bg:#f4f8f8/);
assert.match(design,/\[data-theme="dark"\][\s\S]*--mobile-shell-bg:#071b20/);
assert.match(design,/\.cdc-month-hero/,'dashboard must expose the prototype monthly summary');
assert.match(design,/\.cdc-quick-actions/,'dashboard must expose prototype quick actions');
assert.match(design,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/,'mobile navigation must reserve five prototype destinations');
assert.match(design,/safe-area-inset-top/,'mobile header must retain safe-area handling');
assert.match(design,/position:fixed!important/,'mobile header must stay fixed');
assert.match(design,/\.ui-icon-svg,\.svg-icon\{[\s\S]*stroke-width:2!important/,'application SVG icons must share a canonical stroke');
assert.match(design,/prefers-reduced-motion:reduce/);

assert.match(marketBrand,/Conta de Casa v74/);
assert.match(marketBrand,/\.market-product-photo[\s\S]*display:grid!important/,'verified product photographs must be allowed in the v74 market');
assert.doesNotMatch(marketBrand,/\.market-product-photo[^\{]*\{[^}]*display:none!important/,'v74 must not globally hide product photographs');
assert.match(shopping,/Conta de Casa v74/);
assert.match(shopping,/grid-template-columns:38px 54px minmax\(0,1fr\) auto!important/,'mobile shopping cards must reserve a verified-photo column');

assert.match(experience,/Conta de Casa v74/);
assert.match(experience,/\['dashboard','Início','home'\]/);
assert.match(experience,/\['bills','Despesas','bill'\]/);
assert.match(experience,/\['planning','Planeamento','plan'\]/);
assert.match(experience,/\['settings','Mais','more'\]/);
assert.match(experience,/data-v74-action="expense"/);
assert.match(experience,/data-v74-action="invoice"/);
assert.match(experience,/data-v74-action="market"/);
assert.match(experience,/openBillForm/,'expense and invoice actions must reuse the existing bill flow');
assert.match(experience,/data-invoice-capture/,'invoice quick action must target the existing assisted QR/image capture');
assert.match(experience,/CDCV74/);

/* v73 menu behavior is intentionally preserved. */
assert.match(menuCss,/Conta de Casa v73/);
assert.match(menuCss,/\.mobile-menu-btn\[aria-expanded="true"\]/);
assert.match(menuCss,/data-menu-state="open"/);
assert.match(menuJs,/line\.animate\(frames/);
assert.match(menuJs,/drawer\.close=animatedDrawerClose/);
assert.match(menuJs,/prefersReducedMotion/);
assert.match(menuJs,/touch\.clientX>=root\.innerWidth-swipeEdgeWidth/,'swipe opening must remain on the right edge');
assert.match(menuCss,/@media\(min-width:821px\)[\s\S]*\.sidebar\{[\s\S]*inset:0 0 0 auto!important/,'desktop sidebar must remain right-anchored');

assert.match(sw,/conta-de-casa-public-v74-ui1-v74-shopping2-v73-menu8-v74-experience1/);
assert.ok(sw.includes("'./design-system.css'"));
assert.ok(sw.includes("'./v74-experience.js'"));
assert.ok(!sw.includes("'./ui-consistency.css'"),'obsolete visual override must not ship in public cache');
assert.ok(!sw.includes("'./v64-runtime.css'"),'v64 shell CSS must no longer ship after consolidation');

assert.match(prepare,/const BUILD = 'v74'/);
assert.match(prepare,/const UI_REV = '74-ui1'/);
assert.match(prepare,/const SHOPPING_REV = '74-shopping2'/);
assert.match(prepare,/const EXPERIENCE_REV = '74-experience1'/);
assert.doesNotMatch(publicFilesBlock,/'ui-consistency\.css'/);
assert.doesNotMatch(publicFilesBlock,/'v64-runtime\.css'/);
assert.ok(publicFilesBlock.includes("'v74-experience.js'"));

assert.equal(manifest.background_color,'#f4f8f8');
assert.equal(manifest.theme_color,'#f4f8f8');

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/design-system\.css\?v=74/);
  assert.match(index,/market-brand\.css\?v=74-ui1/);
  assert.match(index,/market-shopping-focus\.css\?v=74-shopping2/);
  assert.match(index,/mobile-menu-toggle\.css\?v=73-menu8/);
  assert.match(index,/v74-experience\.js\?v=74-experience1/);
  assert.match(index,/<meta name="theme-color" content="#f4f8f8"/);
  assert.ok(fs.existsSync(path.join(dist,'design-system.css')));
  assert.ok(fs.existsSync(path.join(dist,'v74-experience.js')));
  assert.ok(!fs.existsSync(path.join(dist,'ui-consistency.css')));
  assert.ok(!fs.existsSync(path.join(dist,'v64-runtime.css')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Conta de Casa v74 visual identity, prototype composition and lean public bundle: OK');

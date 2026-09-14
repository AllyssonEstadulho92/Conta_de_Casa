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
const experienceCss=read('v74-experience.css');
const migrationCss=read('v75-market-featured.css');
const architecture=read('v75-architecture.js');
const architectureCss=read('v75-architecture.css');
const headerCss=read('v75-header-refinement.css');
const menuCss=read('mobile-menu-toggle.css');
const menuJs=read('mobile-menu-toggle.js');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');
const publicFilesStart=prepare.indexOf('const PUBLIC_FILES');
const publicFilesEnd=prepare.indexOf(']);',publicFilesStart);
const publicFilesBlock=prepare.slice(publicFilesStart,publicFilesEnd+3);
const manifest=JSON.parse(read('manifest.webmanifest'));

assert.match(design,/Conta de Casa v74/);
assert.match(design,/--bg:#f4f8f8/);
assert.match(design,/--text:#0c2830/);
assert.match(design,/--primary:#075b63/);
assert.match(design,/--accent:#17b890/);
assert.match(design,/--mobile-shell-bg:#f4f8f8/);
assert.match(design,/\[data-theme="dark"\][\s\S]*--mobile-shell-bg:#071b20/);
assert.match(design,/safe-area-inset-top/);
assert.match(design,/position:fixed!important/);
assert.match(design,/\.ui-icon-svg,\.svg-icon\{[\s\S]*stroke-width:2!important/);
assert.match(design,/prefers-reduced-motion:reduce/);

/* v74-experience.css fica apenas como asset transitório sem regras. */
assert.match(experienceCss,/76-retire-v74-css-behavior1/);
assert.doesNotMatch(experienceCss,/\{[^}]*\}/,'v74 experience stylesheet must no longer own presentation');

/* Estruturas ainda vivas passam para a ponte v76, não para o stylesheet v74. */
assert.match(migrationCss,/Conta de Casa v76 — ponte de retirada 75-featured1/i);
for(const marker of ['.cdc-empty-note','.cdc-avatar','.cdc-category-dot','.cdc-planning-overview','.cdc-budget-ring','.cdc-plan-track','.cdc-more-menu','.cdc-preferences-details'])assert.ok(migrationCss.includes(marker));
assert.match(migrationCss,/@media\(max-width:820px\)/);
assert.match(migrationCss,/@media\(min-width:821px\)/);
assert.match(migrationCss,/\.cdc-preferences-details\{display:contents\}/);
assert.match(migrationCss,/prefers-reduced-motion:reduce/);

assert.match(architectureCss,/Conta de Casa v75/);
assert.match(architectureCss,/--v75-header:#004653/);
assert.match(architectureCss,/--v75-bg:#f3f7f7/);
assert.match(architectureCss,/\.mobile-nav \.nav-btn,html\.cdc-v75 \.mobile-nav \.nav-btn:nth-child\(3\)[\s\S]*visibility:visible!important/);
assert.match(architectureCss,/\.v75-more-group/);
assert.match(architectureCss,/\.v75-budget-summary/);
assert.match(architectureCss,/\.v75-sync-hero/);
assert.match(architectureCss,/\.vault-keypad\{display:grid!important;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
assert.match(architectureCss,/#formDialog\.dialog\{width:100vw!important/);
assert.match(architectureCss,/\.invoice-scan-overlay[\s\S]*inset:0!important/);
assert.match(architectureCss,/background:var\(--v75-surface\)!important/);
assert.match(architectureCss,/prefers-reduced-motion:reduce/);

assert.match(headerCss,/cabeçalho móvel compatível com o design system atual/i);
assert.match(headerCss,/#cdcMobileGreeting[\s\S]*display:none!important/);
assert.match(headerCss,/#notificationsBtn[\s\S]*order:99!important/);
assert.match(headerCss,/--v75-header-row:60px/);
assert.match(headerCss,/background:var\(--v76-surface,#fff\)!important/);
assert.match(headerCss,/color:var\(--v76-text,#12343d\)!important/);
assert.match(headerCss,/\.mobile-menu-btn,[\s\S]*#notificationsBtn\{[\s\S]*width:44px!important/);
assert.match(headerCss,/border-bottom:1px solid var\(--v76-border,#dce7e8\)!important/);
assert.doesNotMatch(headerCss,/linear-gradient\(/,'mobile header must not use decorative gradients');
assert.doesNotMatch(headerCss,/color:#fff!important/,'mobile header controls must not force white on a light surface');
assert.match(headerCss,/prefers-reduced-motion:reduce/);
assert.match(headerCss,/forced-colors:active/);

assert.match(marketBrand,/Conta de Casa v74/);
assert.match(marketBrand,/\.market-product-photo[\s\S]*display:grid!important/);
assert.doesNotMatch(marketBrand,/\.market-product-photo[^\{]*\{[^}]*display:none!important/);
assert.match(shopping,/Conta de Casa v74/);
assert.match(shopping,/grid-template-columns:38px 54px minmax\(0,1fr\) auto!important/);

/* O ficheiro v74-experience.js fica apenas como fonte histórica nesta etapa.
   A aplicação publicada já não o carrega, copia nem guarda em cache. */
assert.match(experience,/Conta de Casa v74/);
assert.match(experience,/CDCV74/);
assert.doesNotMatch(architecture,/root\.CDCV74/,'v76 architecture must not depend on the historical v74 runtime');

assert.match(architecture,/Conta de Casa v76/);
assert.match(architecture,/76-architecture-consolidation1/);
assert.match(architecture,/bills:\['Despesas','Movimentos'\]/);
assert.match(architecture,/settings:\['Mais','Conta e aplicação'\]/);
assert.match(architecture,/DRAWER_GROUPS/);
assert.match(architecture,/MOBILE_NAV/);
assert.match(architecture,/MORE_GROUPS/);
assert.match(architecture,/ensureMoreShell/);
assert.match(architecture,/ensurePlanningShell/);
assert.match(architecture,/dashboardMetrics/);
assert.match(architecture,/categoryEntries/);
assert.match(architecture,/ensureBillTabs/);
assert.match(architecture,/CDCV75/);
assert.doesNotMatch(architecture,/placeDashboardGreeting/,'retired dashboard greeting must not return through architecture');
assert.doesNotMatch(architecture,/saveState\(|commit\(|estimatedCents\s*=|actualCents\s*=/);

assert.match(menuCss,/Conta de Casa v73/);
assert.match(menuCss,/\.mobile-menu-btn\[aria-expanded="true"\]/);
assert.match(menuJs,/line\.animate\(frames/);
assert.match(menuJs,/drawer\.close=animatedDrawerClose/);
assert.match(menuJs,/touch\.clientX>=root\.innerWidth-swipeEdgeWidth/);
assert.match(menuCss,/@media\(min-width:821px\)[\s\S]*\.sidebar\{[\s\S]*inset:0 0 0 auto!important/);

assert.match(sw,/architecture-consolidation1-retire-v74-runtime1/);
for(const asset of ['./design-system.css','./v74-experience.css','./v75-market-featured.css','./v75-architecture.css','./v75-architecture.js','./v75-header-refinement.css'])assert.ok(sw.includes(`'${asset}'`));
assert.ok(!sw.includes("'./v74-experience.js'"),'retired v74 runtime must not be cached');
assert.ok(!sw.includes("'./ui-consistency.css'"));
assert.ok(!sw.includes("'./v64-runtime.css'"));

assert.match(prepare,/const BUILD = 'v75'/);
assert.match(prepare,/const UI_REV = '74-ui1'/);
assert.match(prepare,/const SHOPPING_REV = '74-shopping2'/);
assert.match(prepare,/const EXPERIENCE_REV = '74-experience2'/);
assert.match(prepare,/const ARCHITECTURE_REV = '75-architecture2'/);
assert.match(prepare,/const HEADER_REV = '75-header2'/);
assert.doesNotMatch(publicFilesBlock,/'ui-consistency\.css'/);
assert.doesNotMatch(publicFilesBlock,/'v64-runtime\.css'/);
assert.doesNotMatch(publicFilesBlock,/'v74-experience\.js'/,'retired v74 runtime must not be copied to dist');
for(const asset of ['v74-experience.css','v75-market-featured.css','v75-architecture.css','v75-architecture.js','v75-header-refinement.css'])assert.ok(publicFilesBlock.includes(`'${asset}'`));
assert.match(prepare,/forbidden=\[[^\]]*'v74-experience\.js'/s,'dist build must explicitly forbid the retired runtime');

assert.equal(manifest.background_color,'#f4f8f8');
assert.equal(manifest.theme_color,'#f4f8f8');

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/design-system\.css\?v=75/);
  assert.match(index,/market-brand\.css\?v=74-ui1/);
  assert.match(index,/market-shopping-focus\.css\?v=74-shopping2/);
  assert.match(index,/mobile-menu-toggle\.css\?v=73-menu8/);
  assert.match(index,/v74-experience\.css\?v=74-experience2/);
  assert.match(index,/v75-market-featured\.css\?v=75-featured1/);
  assert.match(index,/v75-architecture\.css\?v=75-architecture2/);
  assert.match(index,/v75-header-refinement\.css\?v=75-header2/);
  assert.doesNotMatch(index,/v74-experience\.js/,'built Pages HTML must not load the retired v74 runtime');
  assert.match(index,/v75-architecture\.js\?v=75-architecture2/);
  assert.match(index,/<meta name="theme-color" content="#f4f8f8"/);
  for(const asset of ['design-system.css','v74-experience.css','v75-market-featured.css','v75-architecture.css','v75-architecture.js','v75-header-refinement.css'])assert.ok(fs.existsSync(path.join(dist,asset)));
  assert.match(fs.readFileSync(path.join(dist,'v74-experience.css'),'utf8'),/76-retire-v74-css-behavior1/);
  assert.ok(!fs.existsSync(path.join(dist,'v74-experience.js')),'retired v74 runtime must not exist in dist');
  assert.ok(!fs.existsSync(path.join(dist,'ui-consistency.css')));
  assert.ok(!fs.existsSync(path.join(dist,'v64-runtime.css')));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Conta de Casa UI consistency: v76 owns presentation/runtime composition; v74 experience CSS/JS are retired authorities.');

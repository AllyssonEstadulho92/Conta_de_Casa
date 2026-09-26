'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const css=read('v75-stability.css');
const pages=read('v75-pages.css');
const usability=read('v75-usability.css');
const js=read('v75-stability.js');
const architecture=read('v75-architecture.js');
const sw=read('sw.js');
const prepare=read('scripts/prepare-pages.cjs');
const index=read('index.html');
const core=read('core.js');
const finance=read('finance.js');

/* A camada visual continua a proteger geometria, formulários e imagens. */
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
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/forced-colors:active/);

/* Usabilidade: pinch-to-zoom permanece disponível e controlos evitam zoom acidental. */
assert.match(usability,/76-auth-prototype-final1/i);
assert.match(usability,/touch-action:manipulation/);
assert.match(usability,/font-size:16px!important/);
assert.match(usability,/100dvh/);
assert.match(usability,/safe-area-inset-top/);
assert.match(usability,/--v75-usability-tap-target:44px/);
assert.doesNotMatch(index,/maximum-scale\s*=|user-scalable\s*=\s*no/i);
assert.match(usability,/#vaultScreen\.vault-screen/);
assert.match(usability,/\.vault-key\{[\s\S]*border-radius:50%!important/);
assert.match(usability,/\.vault-enter-btn\{[\s\S]*background:var\(--v76-primary/);
assert.match(usability,/\.vault-keyboard-toggle\{[\s\S]*background:transparent!important/);
assert.doesNotMatch(usability,/Face ID|Touch ID|biometric/i);

/* Páginas funcionais continuam visíveis e não são substituídas por feeds simplificados. */
assert.match(pages,/auditoria de páginas 75-pages1/i);
assert.match(pages,/#page-dashboard/);
assert.match(pages,/#page-bills/);
assert.match(pages,/#page-planning/);
assert.match(pages,/#page-bills>\.section-tabs[\s\S]*display:grid!important/);
assert.match(pages,/#cdcExpenseTabs,[\s\S]*#cdcExpenseFeed[\s\S]*display:none!important/);
assert.match(pages,/#page-bills \.bill-filter-grid[\s\S]*display:grid!important/);
assert.match(pages,/#billSummary[\s\S]*display:grid!important/);
assert.match(pages,/#billsList[\s\S]*display:block!important/);
assert.match(pages,/#page-planning \.two-col[\s\S]*grid-template-columns:1fr!important/);
assert.match(pages,/forced-colors:active/);
assert.match(pages,/prefers-reduced-motion:reduce/);

/* 76-stability-authority1: estabilidade trata tema/imagens; arquitetura trata composição/nav. */
assert.match(js,/Conta de Casa v76 — estabilidade transversal de apresentação/);
assert.match(js,/76-stability-authority1/);
assert.match(js,/revision:REVISION/);
assert.match(js,/const REVISION='75-stability1'/);
assert.match(js,/meta\[name="theme-color"\]/);
assert.match(js,/\.market-product-photo/);
assert.match(js,/addEventListener\('load'/);
assert.match(js,/addEventListener\('error'/);
assert.match(js,/Imagem indisponível/);
assert.match(js,/aria-disabled/);
assert.match(js,/photo instanceof HTMLButtonElement/);
assert.match(js,/MutationObserver/);
assert.doesNotMatch(js,/PRIMARY_MOBILE_NAV|canonicalMobileNavMarkup|syncMobileNavigation|LEGACY_DASHBOARD_IDS|pruneLegacyDashboardNodes|v74Nav|v76NavAuthority|navObserver|hashchange/,'stability must not be a second navigation or legacy-DOM authority');

assert.match(architecture,/Conta de Casa v76/);
assert.match(architecture,/76-architecture-consolidation1/);
assert.match(architecture,/const MOBILE_NAV=Object\.freeze/);
for(const marker of [
  "['dashboard','Início','home']",
  "['bills','Despesas','bill']",
  "['market','Mercado','market']",
  "['planning','Planeamento','plan']",
  "['settings','Mais','more']"
])assert.ok(architecture.includes(marker),`architecture must own mobile destination ${marker}`);
assert.match(architecture,/function syncNavigationArchitecture\(\)/);
assert.match(architecture,/data-v76-primary="1"/);

/* A camada permanece isolada do domínio e da segurança dos dados. */
assert.doesNotMatch(js,/\bappState\b|amountCents|estimatedCents|actualCents|saveState\(|persistState\(|openDB\(/);
assert.doesNotMatch(usability,/STATE_VERSION|amountCents|estimatedCents|actualCents|PBKDF2|AES-GCM/);
assert.doesNotMatch(pages,/\bappState\b|STATE_VERSION|amountCents|estimatedCents|actualCents|PBKDF2|AES-GCM|saveState\(|persistState\(|openDB\(/);
assert.match(core,/STATE_VERSION\s*=\s*5/);
assert.match(finance,/function sumCents/);

/* Distribuição mantém a revisão pública atual; o conteúdo passa a ter autoridade única. */
assert.match(prepare,/const STABILITY_REV = '75-stability1'/);
assert.match(prepare,/const PAGES_REV = '75-pages1'/);
assert.match(prepare,/const USABILITY_REV = '76-auth1'/);
for(const asset of ['v75-stability.css','v75-stability.js','v75-pages.css','v75-usability.css'])assert.ok(prepare.includes(`'${asset}'`));
assert.match(prepare,/v75-stability\.css\?v=\$\{STABILITY_REV\}/);
assert.match(prepare,/v75-stability\.js\?v=\$\{STABILITY_REV\}/);
assert.match(sw,/stability1/);
assert.ok(sw.includes("'./v75-stability.css'"));
assert.ok(sw.includes("'./v75-stability.js'"));
assert.ok(sw.includes("'./v75-pages.css'"));
assert.ok(sw.includes("'./v75-usability.css'"));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const builtIndex=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(builtIndex,/v75-header-refinement\.css\?v=75-header2/);
  assert.match(builtIndex,/v75-stability\.css\?v=75-stability1/);
  assert.match(builtIndex,/v75-pages\.css\?v=75-pages1/);
  assert.match(builtIndex,/v75-usability\.css\?v=76-auth1/);
  assert.match(builtIndex,/v75-architecture\.js\?v=76-budget-bill-month1/);
  assert.match(builtIndex,/v75-stability\.js\?v=75-stability1/);
  assert.ok(builtIndex.indexOf('v75-stability.css')>builtIndex.indexOf('v75-header-refinement.css'));
  assert.ok(builtIndex.indexOf('v75-pages.css')>builtIndex.indexOf('v75-drawer-theme.css'));
  assert.ok(builtIndex.indexOf('v75-usability.css')>builtIndex.indexOf('v75-pages.css'));
  assert.ok(builtIndex.indexOf('v75-stability.js')>builtIndex.indexOf('v75-architecture.js'));
  for(const asset of ['v75-stability.css','v75-stability.js','v75-pages.css','v75-usability.css'])assert.ok(fs.existsSync(path.join(dist,asset)));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('v76 stability: theme/image safety preserved, PIN visual authority consolidated and navigation has one architecture authority: OK');

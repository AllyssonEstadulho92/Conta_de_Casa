'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const design=fs.readFileSync('design-system.css','utf8');
const base=fs.readFileSync('styles.css','utf8');
const architecture=fs.readFileSync('v75-architecture.css','utf8');
const planningMore=fs.readFileSync('v76-planning-more.css','utf8');
const menu=fs.readFileSync('mobile-menu-toggle.css','utf8');
const usability=fs.readFileSync('v75-usability.css','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const css=`${base}\n${design}\n${architecture}\n${planningMore}\n${menu}\n${usability}`;
const render=fs.readFileSync('render.js','utf8');
const events=fs.readFileSync('events.js','utf8');
const index=fs.readFileSync('index.html','utf8');

for(const retiredSource of ['v74-experience.css','v75-market-featured.css','v75-market-featured.js'])assert.ok(!fs.existsSync(path.join(ROOT,retiredSource)),`${retiredSource} must be physically deleted`);

function tokens(block){return Object.fromEntries([...block.matchAll(/--([a-z0-9-]+):#([0-9a-f]{6})/gi)].map(match=>[match[1],match[2]]));}
function luminance(hex){const values=hex.match(/../g).map(part=>parseInt(part,16)/255).map(value=>value<=.03928?value/12.92:((value+.055)/1.055)**2.4);return .2126*values[0]+.7152*values[1]+.0722*values[2];}
function contrast(a,b){const one=luminance(a),two=luminance(b);return (Math.max(one,two)+.05)/(Math.min(one,two)+.05);}

const light=tokens(design.match(/:root\{([\s\S]*?)\}/)[1]);
const dark=tokens(design.match(/\[data-theme="dark"\]\{([\s\S]*?)\}/)[1]);
for(const palette of [light,dark]){
  for(const [foreground,background] of [['primary','primary-2'],['success','success-bg'],['warning','warning-bg'],['danger','danger-bg']])assert.ok(contrast(palette[foreground],palette[background])>=4.5,`${foreground} text must meet WCAG AA contrast`);
  assert.ok(contrast(palette.muted,palette.surface)>=4.5,'secondary text must meet WCAG AA contrast');
  assert.ok(contrast(palette.text,palette.surface)>=4.5,'primary text must meet WCAG AA contrast');
}

assert.match(design,/--cdc-font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif/);
assert.match(design,/html\{font-family:var\(--cdc-font-family\);font-size:16px;line-height:1\.5/);
assert.match(design,/body\{[\s\S]*line-height:1\.55/);
assert.match(design,/font-synthesis:none/);
assert.match(design,/:focus-visible\{outline:3px solid var\(--focus-ring\);outline-offset:2px\}/);
assert.match(design,/input,select,textarea\{[\s\S]*min-height:46px/);
assert.match(design,/\.btn\{min-height:44px/);
assert.match(design,/\.icon-btn\{width:44px;height:44px;min-width:44px;min-height:44px/);
assert.match(design,/\.mobile-menu-btn\{width:44px!important;[\s\S]*height:44px!important/);
assert.match(design,/\.btn\.primary\.topbar-create\{width:44px!important;[\s\S]*height:44px!important/);
assert.match(design,/\.section-tab\{min-height:38px/);
assert.match(design,/\.sync-header-status\{height:40px;min-width:44px/);
assert.match(design,/\.mobile-nav \.nav-btn\{[\s\S]*min-height:58px!important/);
assert.match(menu,/\.drawer-nav \.nav-btn\{[\s\S]*min-height:48px/);

assert.match(design,/safe-area-inset-top/);
assert.match(design,/safe-area-inset-bottom/);
assert.match(menu,/safe-area-inset-top/);
assert.match(menu,/safe-area-inset-bottom/);
assert.match(events,/window\.visualViewport/);
assert.match(events,/keyboard-open/);
assert.match(events,/function keepFocusedDialogFieldVisible\(delay=80\)/);
assert.match(events,/shell\.scrollBy\(\{top:delta,behavior:'auto'\}\)/);
assert.doesNotMatch(events,/scrollIntoView\(\{block:'center'/);
assert.doesNotMatch(index,/maximum-scale\s*=\s*1|user-scalable\s*=\s*no/i,'pinch zoom must remain available');

assert.match(design,/\.sr-only\{position:absolute!important/);
assert.match(design,/\.status-chip\{min-height:24px;[\s\S]*font-size:\.75rem/);
assert.match(design,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(menu,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(render,/setAttribute\('aria-current','page'\)/);
assert.match(index,/aria-labelledby="drawerTitle"/);
assert.match(index,/id="mobileMenuBtn"[\s\S]*aria-controls="mobileDrawer" aria-expanded="false"/);
assert.match(index,/aria-label="Teclado numérico do PIN"/);
assert.match(index,/aria-label="Apagar último dígito"/);
assert.match(index,/id="monthPicker" type="month" aria-label="Mês em análise"/);
assert.match(index,/id="syncHeaderStatus"[\s\S]*aria-label="Estado da sincronização"/);
assert.match(index,/id="quickAddBtn"[\s\S]*aria-label="Adicionar registo"/);
assert.match(index,/id="notificationsBtn"[\s\S]*aria-label="Ver alertas no Início"/);
assert.match(index,/id="billSummary"[\s\S]*aria-live="polite"/);
assert.match(index,/id="billsList"[\s\S]*aria-live="polite"/);
assert.match(index,/id="accountBalanceInfo"[\s\S]*aria-live="polite"/);
assert.match(index,/id="toast"[\s\S]*role="status" aria-live="polite"/);

assert.match(planningMore,/76-planning-more1/);
assert.match(planningMore,/\.cdc-planning-overview/);
assert.match(planningMore,/\.cdc-more-menu/);
assert.match(planningMore,/\.cdc-preferences-details/);
assert.match(architecture,/\.v75-more-group/);
assert.match(architecture,/\.v75-budget-summary/);
assert.doesNotMatch(css,/pointer-events:none!important;[^}]*\.cdc-quick-action/);

/* 76-auth-prototype-final1 + 76-auth-exclusive-state1: uma única autoridade
   visual substitui as camadas históricas, e `hidden` continua a ser a
   autoridade de estado para impedir criação/desbloqueio simultâneos. */
assert.match(usability,/76-auth-prototype-final1/);
assert.match(usability,/76-auth-exclusive-state1/);
assert.doesNotMatch(usability,/\/\* 76-vault-short-height1/,'legacy short-height auth section must be removed');
assert.doesNotMatch(usability,/\/\* 76-auth-ios-spacing2/,'legacy iOS spacing section must be removed');
assert.match(usability,/#vaultScreen\.vault-screen\[hidden\],[\s\S]*#vaultCreate\[hidden\],[\s\S]*#vaultUnlock\[hidden\][\s\S]*display:none!important/,'hidden auth states must override author display rules');
assert.match(events,/const meta=await idbGet\('meta','vault'\); \$\('#vaultCreate'\)\.hidden=!!meta; \$\('#vaultUnlock'\)\.hidden=!meta;/,'runtime must choose exactly one auth state from local vault metadata');
assert.match(usability,/min-height:100svh!important/,'mobile auth must use the small viewport height so Safari chrome is part of the layout contract');
assert.match(usability,/max\(18px,env\(safe-area-inset-top,0px\)\)/,'mobile auth must preserve a real safe-area top floor');
assert.match(usability,/\.vault-card\{[\s\S]*margin:0 auto!important/,'mobile auth must not vertically recenter the whole card');
assert.match(usability,/\.vault-keypad\{[\s\S]*grid-template-columns:repeat\(3,56px\)!important;[\s\S]*column-gap:30px!important;[\s\S]*row-gap:16px!important/,'approved PIN keypad must keep the wider horizontal rhythm');
assert.match(usability,/:is\(\.vault-key,\.vault-key-spacer\)\{[\s\S]*width:56px!important;[\s\S]*height:56px!important/);
assert.match(usability,/\.vault-enter-btn\{[\s\S]*min-height:52px!important;[\s\S]*margin-top:27px!important/);
assert.match(usability,/\.vault-keyboard-toggle\{[\s\S]*min-height:44px!important/);
assert.match(usability,/\.vault-disclosure\{[\s\S]*min-height:70px!important/,'device-transfer action must remain a clear full-width card');
assert.match(usability,/@media\(max-width:820px\) and \(max-height:720px\)[\s\S]*grid-template-columns:repeat\(3,50px\)!important/,'short viewports may compact but must keep touch targets above 44 px');
const authCss=usability.slice(usability.indexOf('76-auth-prototype-final1'));
const keypadSizes=[...authCss.matchAll(/grid-template-columns:repeat\(3,(\d+)px\)!important/g)].map(match=>Number(match[1]));
assert.deepEqual(keypadSizes,[64,56,52,50],'auth keypad sizes must remain ordered from desktop/base to mobile/compact contracts');
assert.ok(keypadSizes.every(size=>size>=44),`PIN targets must remain >=44 px; got ${keypadSizes.join(', ')}`);
assert.match(sw,/auth-prototype-final1/,'PWA cache must invalidate the previous auth layout');

console.log('Accessibility contrast, focus, touch targets, semantic state, safe areas and exclusive PIN layout contracts for v76: OK');

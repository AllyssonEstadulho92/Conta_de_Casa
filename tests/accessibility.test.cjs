'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const design=fs.readFileSync('design-system.css','utf8');
const base=fs.readFileSync('styles.css','utf8');
const experience=fs.readFileSync('v74-experience.css','utf8');
const menu=fs.readFileSync('mobile-menu-toggle.css','utf8');
const css=`${base}\n${design}\n${experience}\n${menu}`;
const render=fs.readFileSync('render.js','utf8');
const events=fs.readFileSync('events.js','utf8');
const index=fs.readFileSync('index.html','utf8');

function tokens(block){
  return Object.fromEntries([...block.matchAll(/--([a-z0-9-]+):#([0-9a-f]{6})/gi)].map(match=>[match[1],match[2]]));
}
function luminance(hex){
  const values=hex.match(/../g).map(part=>parseInt(part,16)/255).map(value=>value<=.03928?value/12.92:((value+.055)/1.055)**2.4);
  return .2126*values[0]+.7152*values[1]+.0722*values[2];
}
function contrast(a,b){
  const one=luminance(a),two=luminance(b);
  return (Math.max(one,two)+.05)/(Math.min(one,two)+.05);
}

const light=tokens(design.match(/:root\{([\s\S]*?)\}/)[1]);
const dark=tokens(design.match(/\[data-theme="dark"\]\{([\s\S]*?)\}/)[1]);
for(const palette of [light,dark]){
  for(const [foreground,background] of [['primary','primary-2'],['success','success-bg'],['warning','warning-bg'],['danger','danger-bg']]){
    assert.ok(contrast(palette[foreground],palette[background])>=4.5,`${foreground} text must meet WCAG AA contrast`);
  }
  assert.ok(contrast(palette.muted,palette.surface)>=4.5,'secondary text must meet WCAG AA contrast');
  assert.ok(contrast(palette.text,palette.surface)>=4.5,'primary text must meet WCAG AA contrast');
}

/* Tipografia e legibilidade: Inter com fallbacks nativos, sem depender de fontes remotas. */
assert.match(design,/--cdc-font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif/);
assert.match(design,/html\{font-family:var\(--cdc-font-family\);font-size:16px;line-height:1\.5/);
assert.match(design,/body\{[\s\S]*line-height:1\.55/);
assert.match(design,/font-synthesis:none/);

/* Foco e alvos interativos. Os controlos principais permanecem >=44 px;
   os controlos compactos do protótipo continuam acima do mínimo WCAG 2.2 de 24 px. */
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

/* Acessibilidade móvel e teclado. */
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

/* Semântica, estados e leitores de ecrã. */
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

/* O modelo v74 usa conteúdo textual real e não substitui informação por decoração. */
assert.match(experience,/\.cdc-mobile-greeting/);
assert.match(experience,/\.cdc-mobile-month/);
assert.match(experience,/\.cdc-expense-feed/);
assert.match(experience,/\.cdc-more-menu/);
assert.doesNotMatch(experience,/pointer-events:none!important;[^}]*\.cdc-quick-action/,'quick actions must remain interactive');

console.log('Accessibility contrast, focus, touch targets, semantic state and mobile safe-area tests for v74: OK');

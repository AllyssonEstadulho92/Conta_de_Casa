'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const read=p=>fs.readFileSync(p,'utf8');
const html=read('index.html');
const render=read('render.js');
const events=read('events.js');
const finance=read('finance.js');
const shell=read('v76-mobile-shell.css');
const menu=read('mobile-menu-toggle.js');
const architecture=read('v75-architecture.js');
const build=read('scripts/prepare-pages.cjs');

// A página deve ajudar a distinguir dinheiro real de projeções.
const plan=html.slice(html.indexOf('<section id="page-planning"'),html.indexOf('<section id="page-market"'));
assert.ok(plan.indexOf('id="planningProjection"')<plan.indexOf('id="planningKpis"'));
assert.ok(plan.indexOf('id="planningBudgetSnapshot"')<plan.indexOf('id="planningUpcomingList"'));
assert.ok(plan.indexOf('id="planningUpcomingList"')<plan.indexOf('id="planningProjection"'));
assert.ok(plan.indexOf('id="planningUpcomingList"')<plan.indexOf('id="monthPlanForm"'));
assert.equal((plan.match(/id="monthPlanForm"/g)||[]).length,1);
assert.match(render,/\['Recebido',n\.incomes/);
assert.match(render,/\['Gasto',n\.cashSpent/);
assert.match(render,/\['Por pagar',n\.outstanding/);
assert.match(render,/n\.projected/);
assert.match(render,/Não é o saldo bancário/);
assert.match(architecture,/\(summary\|\|tabs\)\.insertAdjacentElement\('afterend',rootNode\)/);
assert.match(finance,/const projected = sumCents\(\[current,-outstanding\]\)/);
assert.match(finance,/const cashSpent = sumCents\(\[paymentTotal,marketSpent\]\)/);

// Alertas: prazos futuros não devem incluir os vencimentos de hoje.
assert.match(render,/days>=1&&days<=7/);
assert.match(render,/const upcomingBills=activeUnpaidBills\(\)/);
assert.match(render,/sumCents\(upcomingBills\.map\(remainingForBill\)\)/);
assert.match(render,/\['urgentes','Prioritários'/);
assert.match(render,/\['vencimentos','A vencer'/);
assert.match(render,/\['verificar','A verificar'/);
assert.match(render,/upcoming-week/);
assert.match(render,/dashboardAlertItems\(n\)/);

// PIN: o indicador não é persistido nem assume uma credencial de 4 dígitos.
assert.equal((html.match(/id="vaultPinVisual"/g)||[]).length,1);
assert.equal((html.match(/id="unlockPassphrase"/g)||[]).length,1);
assert.equal((html.match(/class="cdc-pin-pips"/g)||[]).length,1);
assert.equal((html.slice(html.indexOf('id="vaultPinVisual"'),html.indexOf('id="vaultPinPad"')).match(/<i><\/i>/g)||[]).length,8);
assert.match(events,/function updateVaultPinVisual\(\)/);
assert.match(events,/Math\.min\(8,input\.value\.length\)/);
assert.match(events,/input\.addEventListener\('input',updateVaultPinVisual\)/);
assert.match(events,/updateVaultPinVisual\(\);/);
assert.doesNotMatch(events,/localStorage\.setItem\([^\n]*pinDigits/);
assert.match(shell,/#vaultUnlock \.cdc-pin-pips i\.is-filled/);

// Menu: o controlo existente continua único, focável e animado.
assert.equal((html.match(/id="mobileMenuBtn"/g)||[]).length,1);
assert.equal((html.match(/id="drawerCloseBtn"/g)||[]).length,1);
assert.match(menu,/drawer\.close=animatedDrawerClose/);
assert.match(shell,/\.mobile-menu-btn\[data-menu-state="open"\] \.mobile-menu-glyph::before/);
assert.match(shell,/\.mobile-menu-btn\[data-menu-state="open"\] \.mobile-menu-glyph::after/);
assert.match(shell,/@media\(prefers-reduced-motion:reduce\)/);

// PWA e segurança: versões atualizadas, sem migrações nem credenciais reais.
assert.match(build,/const DASHBOARD_REV = '77-walli-unified1'/);
assert.match(build,/const MOBILE_SHELL_REV = '76-approved-vault-nav4'/);
assert.match(build,/const SERVICE_WORKER_REV = '77-walli-unified1'/);
assert.match(build,/const ARCHITECTURE_REV = '77-walli-unified1'/);
assert.match(build,/events\.js\?v=\$\{SERVICE_WORKER_REV\}/);
assert.doesNotThrow(()=>new vm.Script(render));
assert.doesNotThrow(()=>new vm.Script(events));
assert.doesNotThrow(()=>new vm.Script(menu));
assert.doesNotThrow(()=>new vm.Script(architecture));
console.log('UX financeira, notificações, PIN e menu: contratos aprovados');

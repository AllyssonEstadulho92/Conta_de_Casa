'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');

const ctx=vm.createContext({
  console,crypto:webcrypto,TextEncoder,TextDecoder,Intl,Date,Math,Number,String,
  BigInt,Map,Set,Uint8Array,Array,Object,JSON,RegExp,Error,Promise,atob,btoa
});
for(const file of ['core.js','finance.js','render.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
}
// Os montantes não dependem do saldo introduzido manualmente.
assert.equal(vm.runInContext('planningMonthlyResult({incomes:130000,cashSpent:34404,current:999999,outstanding:0})',ctx),95596);
assert.equal(vm.runInContext('planningMonthlyResult({incomes:130000,cashSpent:34404,current:0,outstanding:8000})',ctx),95596);
assert.equal(vm.runInContext('planningMonthlyResult({incomes:0,cashSpent:5000,current:95596,outstanding:0})',ctx),-5000);
assert.equal(vm.runInContext('planningMonthlyResult({incomes:0,cashSpent:0,current:95596,outstanding:0})',ctx),0);
assert.equal(vm.runInContext('planningMonthlyResult({incomes:1,cashSpent:0,current:95596,outstanding:0})',ctx),1);

// Verificar que a UI não confunde fluxo mensal com saldo bancário,
// nem apresenta uma projeção igual quando todas as faturas estão liquidadas.
vm.runInContext(`
  var capturedUi={};
  setHTML=(selector,markup)=>{capturedUi[selector]=markup};
  renderPlanningOverview({
    incomes:140000,cashSpent:50000,current:95596,ledgerCurrent:90000,
    hasAccountBalance:true,marketEstimatedCount:0,outstanding:0,projected:95596
  });
`,ctx);
const a=vm.runInContext('capturedUi',ctx);
assert.match(a['#planningProjection'],/RESULTADO AUTOMÁTICO DO MÊS/);
assert.match(a['#planningProjection'],/Recebido menos gasto/);
assert.match(a['#planningProjection'],/Sem faturas pendentes neste mês/);
assert.doesNotMatch(a['#planningProjection'],/Saldo estimado após liquidar/);
assert.match(a['#planningKpis'],/Saldo informado/);
assert.match(a['#planningKpis'],/Referência atualizada por ti/);
assert.match(a['#planningKpis'],/Gasto/);
assert.match(a['#planningKpis'],/Por pagar/);

vm.runInContext(`
 renderPlanningOverview({
  incomes:140000,cashSpent:50000,current:95596,ledgerCurrent:90000,
  hasAccountBalance:true,marketEstimatedCount:1,outstanding:10000,projected:85596
 });
`,ctx);
const b=vm.runInContext('capturedUi',ctx);
assert.match(b['#planningProjection'],/Saldo estimado após liquidar/);
assert.match(b['#planningProjection'],/preço estimado/);
assert.match(b['#planningKpis'],/preço estimado/);
assert.match(b['#planningProjection'],/data-money/);

const shell=fs.readFileSync('v76-mobile-shell.css','utf8');
assert.match(shell,/html:has\(#mobileDrawer\[open\]\) #mobileMenuBtn/);
assert.match(shell,/visibility:hidden!important/);
assert.match(shell,/pointer-events:none!important/);
const menuJs=fs.readFileSync('mobile-menu-toggle.js','utf8');
assert.match(menuJs,/function focusTrigger\(/);
assert.match(menuJs,/function focusClose\(/);
assert.match(menuJs,/closeButton\.addEventListener\('click'/);

assert.match(shell,/76-monthly-result-and-menu-fix1/);
assert.match(shell,/cdc-plan-projection-next/);
const prepare=fs.readFileSync('scripts/prepare-pages.cjs','utf8');
assert.match(prepare,/const MENU_REV = '73-menu8'/);
assert.match(prepare,/const DASHBOARD_REV = '78-invoice-statement1'/);
assert.match(prepare,/const MOBILE_SHELL_REV = '76-approved-vault-nav4'/);
assert.match(prepare,/const SERVICE_WORKER_REV = '78-invoice-statement1'/);
console.log('Saldo mensal automático e X único no menu: OK');

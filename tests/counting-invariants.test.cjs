const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

const context = vm.createContext({
  console, crypto:webcrypto, TextEncoder, TextDecoder, Intl, Date, Math, Number, String,
  Map, Set, Uint8Array, Array, Object, JSON, RegExp, Error, Promise, BigInt, atob, btoa
});
vm.runInContext(fs.readFileSync('core.js','utf8'),context);
vm.runInContext(fs.readFileSync('finance.js','utf8'),context);

vm.runInContext(`
selectedMonth='2026-09';
const dt=(d,t='12:00')=>composeLocalDateTimeIso(d,t);
appState={
  version:5,
  settings:{currency:'EUR'},
  months:{'2026-09':{
    openingBalanceCents:100000,
    budgetCents:100000,
    accountBalanceCents:120000,
    accountBalanceUpdatedAt:dt('2026-09-10','08:00'),
    updatedAt:dt('2026-09-10','08:00')
  }},
  bills:[
    {id:'b-paid',title:'Paga',category:'Casa',totalCents:10000,dueDate:'2026-09-01',dueTime:'23:59',dueAt:dt('2026-09-01','23:59'),recurrence:'none',cancelled:false,archived:false},
    {id:'b-partial',title:'Parcial',category:'Telecomunicações',totalCents:10000,dueDate:'2026-09-12',dueTime:'23:59',dueAt:dt('2026-09-12','23:59'),recurrence:'none',cancelled:false,archived:false},
    {id:'b-overdue',title:'Atrasada',category:'Casa',totalCents:5000,dueDate:'2026-09-05',dueTime:'23:59',dueAt:dt('2026-09-05','23:59'),recurrence:'none',cancelled:false,archived:false},
    {id:'b-overdue-partial',title:'Atrasada parcial',category:'Casa',totalCents:7000,dueDate:'2026-09-07',dueTime:'23:59',dueAt:dt('2026-09-07','23:59'),recurrence:'none',cancelled:false,archived:false},
    {id:'b-today',title:'Hoje',category:'Casa',totalCents:3000,dueDate:'2026-09-10',dueTime:'23:59',dueAt:dt('2026-09-10','23:59'),recurrence:'none',cancelled:false,archived:false},
    {id:'b-pending',title:'Próxima',category:'Casa',totalCents:4000,dueDate:'2026-09-13',dueTime:'23:59',dueAt:dt('2026-09-13','23:59'),recurrence:'none',cancelled:false,archived:false},
    {id:'b-cancelled',title:'Cancelada',category:'Casa',totalCents:9000,dueDate:'2026-09-11',dueTime:'23:59',dueAt:dt('2026-09-11','23:59'),recurrence:'none',cancelled:true,archived:false},
    {id:'b-archived',title:'Arquivada',category:'Casa',totalCents:8000,dueDate:'2026-09-11',dueTime:'23:59',dueAt:dt('2026-09-11','23:59'),recurrence:'none',cancelled:false,archived:true}
  ],
  payments:[
    {id:'p-paid',billId:'b-paid',amountCents:10000,paidAt:dt('2026-09-02'),method:'Transferência'},
    {id:'p-partial',billId:'b-partial',amountCents:2500,paidAt:dt('2026-09-03'),method:'Cartão'},
    {id:'p-overdue-partial',billId:'b-overdue-partial',amountCents:2000,paidAt:dt('2026-09-04'),method:'Cartão'}
  ],
  incomes:[{id:'i1',description:'Rendimento',amountCents:50000,receivedAt:dt('2026-09-01')}],
  market:[
    {id:'m1',name:'Compra real',category:'Alimentação',estimatedCents:4500,actualCents:5000,purchased:true,createdAt:dt('2026-09-01'),purchasedAt:dt('2026-09-06'),updatedAt:dt('2026-09-06')},
    {id:'m2',name:'Compra estimada',category:'Alimentação',estimatedCents:2000,actualCents:0,purchased:true,createdAt:dt('2026-09-01'),purchasedAt:dt('2026-09-08'),updatedAt:dt('2026-09-08')},
    {id:'m3',name:'Por comprar',category:'Casa',estimatedCents:3000,actualCents:0,purchased:false,createdAt:dt('2026-09-01'),purchasedAt:null,updatedAt:dt('2026-09-01')}
  ],
  goals:[],activity:[],auditTrail:[],security:{},tombstones:{}
};
`,context);

const now="new Date(2026,8,10,12,0,0,0)";
const n=vm.runInContext(`monthNumbers('2026-09',${now})`,context);
assert.equal(n.incomes,50000);
assert.equal(n.paymentTotal,14500);
assert.equal(n.marketSpent,7000);
assert.equal(n.pending,14500);
assert.equal(n.overdue,10000);
assert.equal(n.outstanding,24500);
assert.equal(n.ledgerCurrent,128500);
assert.equal(n.hasAccountBalance,true);
assert.equal(n.current,120000);
assert.equal(n.reconciliationDiff,-8500);
assert.equal(n.projected,95500);
assert.equal(n.budgetUsed,21500);

const d=vm.runInContext(`dashboardNumbers('2026-09',${now})`,context);
assert.equal(d.pendingCount,3);
assert.equal(d.overdueCount,2);
assert.equal(d.next7Count,3);
assert.equal(d.next7,14500);
assert.equal(d.criticalCount,1);

assert.equal(vm.runInContext(`billStatus(appState.bills.find(b=>b.id==='b-paid'),${now})`,context),'paid');
assert.equal(vm.runInContext(`billStatus(appState.bills.find(b=>b.id==='b-partial'),${now})`,context),'partial');
assert.equal(vm.runInContext(`billStatus(appState.bills.find(b=>b.id==='b-overdue'),${now})`,context),'overdue');
assert.equal(vm.runInContext(`billStatus(appState.bills.find(b=>b.id==='b-overdue-partial'),${now})`,context),'overdue');
assert.equal(vm.runInContext(`billStatus(appState.bills.find(b=>b.id==='b-today'),${now})`,context),'due-today');
assert.equal(vm.runInContext(`billStatus(appState.bills.find(b=>b.id==='b-pending'),${now})`,context),'pending');
assert.equal(vm.runInContext(`billStatus(appState.bills.find(b=>b.id==='b-cancelled'),${now})`,context),'cancelled');
assert.equal(vm.runInContext(`billStatus(appState.bills.find(b=>b.id==='b-archived'),${now})`,context),'archived');

const categories=JSON.parse(JSON.stringify(vm.runInContext("categoryTotals('2026-09')",context)));
assert.equal(categories.reduce((total,[,value])=>total+value,0),21500);
assert.equal(Object.fromEntries(categories)['Casa'],12000);
assert.equal(Object.fromEntries(categories)['Telecomunicações'],2500);
assert.equal(Object.fromEntries(categories)['Mercado · Alimentação'],7000);

const diagnostics=vm.runInContext(`financialDiagnostics('2026-09',${now})`,context);
assert.equal(diagnostics.ok,true);
assert.deepEqual(JSON.parse(JSON.stringify(diagnostics.issues)),[]);
assert.equal(diagnostics.counts.pending,3);
assert.equal(diagnostics.counts.overdue,2);
assert.equal(diagnostics.totals.pending,14500);
assert.equal(diagnostics.totals.overdue,10000);
assert.equal(diagnostics.totals.outstanding,24500);
assert.equal(diagnostics.totals.projected,95500);

// A payment that fully settles one pending bill must immediately update both amount and count.
vm.runInContext("appState.payments.push({id:'p-pending',billId:'b-pending',amountCents:4000,paidAt:composeLocalDateTimeIso('2026-09-10','13:00'),method:'Transferência'})",context);
const afterPay=vm.runInContext(`dashboardNumbers('2026-09',${now})`,context);
assert.equal(afterPay.pendingCount,2);
assert.equal(afterPay.pending,10500);
assert.equal(afterPay.next7Count,2);
assert.equal(afterPay.next7,10500);

// Removing the payment from an old paid bill must make that bill overdue again, exactly once.
vm.runInContext("appState.payments=appState.payments.filter(p=>p.id!=='p-paid')",context);
const afterUndo=vm.runInContext(`dashboardNumbers('2026-09',${now})`,context);
assert.equal(afterUndo.overdueCount,3);
assert.equal(afterUndo.overdue,20000);

console.log('Exact financial totals and counting invariants: OK');

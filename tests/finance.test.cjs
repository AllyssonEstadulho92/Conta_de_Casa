const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

const context = vm.createContext({
  console, crypto: webcrypto, TextEncoder, TextDecoder, Intl, Date, Math, Number, String,
  Map, Set, Uint8Array, Array, Object, JSON, RegExp, Error, Promise, BigInt, atob, btoa
});
vm.runInContext(fs.readFileSync('core.js','utf8'), context);
vm.runInContext(fs.readFileSync('finance.js','utf8'), context);

assert.equal(vm.runInContext("parseCents('1.234,56')", context), 123456);
assert.equal(vm.runInContext("parseCents('0,01')", context), 1);
assert.equal(vm.runInContext("parseCents('0,29')", context), 29);
assert.equal(vm.runInContext("parseCents('5')", context), 500);
assert.equal(vm.runInContext("parseCents('-12,34')", context), -1234);
assert.equal(Number.isNaN(vm.runInContext("parseCents('1,234')", context)), true);
assert.equal(Number.isNaN(vm.runInContext("parseCents('abc')", context)), true);

assert.equal(vm.runInContext("civilDayDiff('2026-09-02','2026-09-12')", context), 10);
assert.equal(vm.runInContext("civilDayDiff('2026-09-02','2026-09-27')", context), 25);
assert.equal(vm.runInContext("addCivilMonthsClamped('2024-01-31',1)", context), '2024-02-29');
assert.equal(vm.runInContext("addCivilMonthsClamped('2025-01-31',1)", context), '2025-02-28');
assert.equal(vm.runInContext("addCivilMonthsClamped('2024-02-29',12)", context), '2025-02-28');
assert.equal(vm.runInContext("addCivilDays('2026-12-31',1)", context), '2027-01-01');

vm.runInContext(`
selectedMonth='2026-09';
appState={
 version:3,settings:{currency:'EUR'},months:{'2026-09':{openingBalanceCents:100000,budgetCents:80000}},
 bills:[
 {id:'b1',title:'Luz',category:'Energia',totalCents:20000,dueDate:'2026-09-20',dueTime:'12:00',dueAt:composeLocalDateTimeIso('2026-09-20','12:00'),recurrence:'none',cancelled:false,archived:false},
 {id:'b2',title:'Internet',category:'Internet',totalCents:5000,dueDate:'2026-09-22',dueTime:'12:00',dueAt:composeLocalDateTimeIso('2026-09-22','12:00'),recurrence:'none',cancelled:false,archived:false},
 {id:'b3',title:'Antiga',category:'Casa',totalCents:3000,dueDate:'2026-09-01',dueTime:'23:59',dueAt:composeLocalDateTimeIso('2026-09-01','23:59'),recurrence:'none',cancelled:false,archived:false},
 {id:'b4',title:'Hoje',category:'Casa',totalCents:4000,dueDate:'2026-09-02',dueTime:'23:59',dueAt:composeLocalDateTimeIso('2026-09-02','23:59'),recurrence:'none',cancelled:false,archived:false},
 {id:'b5',title:'Daqui 7',category:'Casa',totalCents:700,dueDate:'2026-09-09',dueTime:'00:01',dueAt:composeLocalDateTimeIso('2026-09-09','00:01'),recurrence:'none',cancelled:false,archived:false},
 {id:'b6',title:'Daqui 8',category:'Casa',totalCents:800,dueDate:'2026-09-10',dueTime:'00:01',dueAt:composeLocalDateTimeIso('2026-09-10','00:01'),recurrence:'none',cancelled:false,archived:false}
 ],
 payments:[
 {id:'p1',billId:'b1',amountCents:5000,paidAt:'2026-09-05T12:00:00.000Z',method:'Transferência'},
 {id:'p2',billId:'b6',amountCents:800,paidAt:'2026-09-02T12:00:00.000Z',method:'Transferência'}
 ],
 incomes:[{id:'i1',description:'Salário',amountCents:50000,receivedAt:'2026-09-01T12:00:00.000Z'}],
 market:[{id:'m1',name:'Compras',purchased:true,actualCents:10000,estimatedCents:9000,purchasedAt:'2026-09-06T12:00:00.000Z'}],
 goals:[],activity:[]
};`,context);

assert.equal(vm.runInContext("remainingForBill(appState.bills[0])",context),15000);
const now="new Date(2026,8,2,12,0,0,0)";
assert.equal(vm.runInContext(`billStatus(appState.bills.find(b=>b.id==='b3'),${now})`,context),'overdue');
assert.equal(vm.runInContext(`billStatus(appState.bills.find(b=>b.id==='b4'),${now})`,context),'due-today');
assert.equal(vm.runInContext(`dueText(appState.bills.find(b=>b.id==='b4'),${now})`,context),'Vence hoje');

const n=vm.runInContext(`monthNumbers('2026-09',${now})`,context);
assert.equal(n.incomes,50000);
assert.equal(n.paymentTotal,5800);
assert.equal(n.marketSpent,10000);
assert.equal(n.pending,24700);
assert.equal(n.overdue,3000);
assert.equal(n.outstanding,27700);
assert.equal(n.current,134200);
assert.equal(n.projected,106500);
assert.equal(n.budgetUsed,15800);
const d=vm.runInContext(`dashboardNumbers('2026-09',${now})`,context);
assert.equal(d.overdueCount,1);
assert.equal(d.pendingCount,4);
assert.equal(d.next7,4700);
assert.equal(d.next7Count,2);

assert.equal(vm.runInContext("dateKeyFromValue(nextDueAt(composeLocalDateTimeIso('2024-01-31','12:00'),'monthly','2024-01-31','12:00'))",context),'2024-02-29');
assert.equal(vm.runInContext("dateKeyFromValue(nextDueAt(composeLocalDateTimeIso('2024-02-29','12:00'),'annual','2024-02-29','12:00'))",context),'2025-02-28');
console.log('Finance and civil-date tests: OK');

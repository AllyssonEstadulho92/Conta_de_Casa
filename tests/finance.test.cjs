const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

const context = vm.createContext({
  console, crypto: webcrypto, TextEncoder, TextDecoder, Intl, Date, Math, Number, String,
  Map, Set, Uint8Array, Array, Object, JSON, RegExp, Error, Promise, atob, btoa
});

vm.runInContext(fs.readFileSync('core.js','utf8'), context);
vm.runInContext(fs.readFileSync('finance.js','utf8'), context);

assert.equal(vm.runInContext("parseCents('1.234,56')", context), 123456);
assert.equal(vm.runInContext("parseCents('0,01')", context), 1);
assert.equal(vm.runInContext("parseCents('5')", context), 500);

vm.runInContext(`
  selectedMonth = '2026-09';
  appState = {
    version:1,
    settings:{currency:'EUR'},
    months:{'2026-09':{openingBalanceCents:100000,budgetCents:80000}},
    bills:[
      {id:'b1',title:'Luz',category:'Energia',totalCents:20000,dueAt:'2026-09-20T12:00:00.000Z',recurrence:'none',cancelled:false,archived:false},
      {id:'b2',title:'Internet',category:'Internet',totalCents:5000,dueAt:'2026-09-22T12:00:00.000Z',recurrence:'none',cancelled:false,archived:false}
    ],
    payments:[{id:'p1',billId:'b1',amountCents:5000,paidAt:'2026-09-05T12:00:00.000Z',method:'Transferência'}],
    incomes:[{id:'i1',description:'Salário',amountCents:50000,receivedAt:'2026-09-01T12:00:00.000Z'}],
    market:[{id:'m1',name:'Compras',purchased:true,actualCents:10000,estimatedCents:9000,purchasedAt:'2026-09-06T12:00:00.000Z'}],
    goals:[],activity:[]
  };
`, context);

assert.equal(vm.runInContext("remainingForBill(appState.bills[0])", context), 15000);
assert.equal(vm.runInContext("remainingForBill(appState.bills[1])", context), 5000);

const numbers = vm.runInContext("monthNumbers('2026-09')", context);
assert.equal(numbers.incomes, 50000);
assert.equal(numbers.paymentTotal, 5000);
assert.equal(numbers.marketSpent, 10000);
assert.equal(numbers.pending, 20000);
assert.equal(numbers.current, 135000);
assert.equal(numbers.projected, 115000);
assert.equal(numbers.budgetUsed, 15000);

const cats = vm.runInContext("categoryTotals('2026-09')", context);
assert.deepEqual(JSON.parse(JSON.stringify(cats)), [['Mercado',10000],['Energia',5000]]);

assert.match(vm.runInContext("nextDueAt('2026-09-20T12:00:00.000Z','monthly')", context), /^2026-10-20/);

console.log('Finance tests: OK');
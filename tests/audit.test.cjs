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

assert.equal(vm.runInContext('sumCents([10,20,-5])',context),25);
assert.equal(Number.isNaN(vm.runInContext('sumCents([Number.MAX_SAFE_INTEGER,1])',context)),true);
assert.equal(Number.isNaN(vm.runInContext('sumCents([100,1.5])',context)),true);
assert.equal(vm.runInContext('validCents(1000000000000,0)',context),true);
assert.equal(vm.runInContext('validCents(1000000000001,0)',context),false);

vm.runInContext(`
  selectedMonth='2026-09';
  appState={
    version:4,settings:{currency:'EUR'},months:{},
    bills:[{id:'b1',title:'Luz',provider:'Energia',category:'Casa',totalCents:10000,dueDate:'2026-09-20',dueTime:'23:59',method:'Transferência',recurrence:'none',cancelled:false,archived:false}],
    payments:[{id:'p1',billId:'b1',amountCents:2500,paidAt:'2026-09-02T12:00:00.000Z',method:'Transferência'}],
    incomes:[],market:[],goals:[],activity:[],auditTrail:[]
  };
`,context);

const ledger=vm.runInContext("billLedger(appState.bills[0])",context);
assert.equal(ledger.totalCents,10000);
assert.equal(ledger.paidCents,2500);
assert.equal(ledger.remainingCents,7500);
assert.equal(vm.runInContext("billStatus(appState.bills[0],new Date(2026,8,2,12))",context),'partial');

vm.runInContext(`
  const before=billAuditSnapshot(appState.bills[0],new Date(2026,8,2,12));
  appState.bills[0].totalCents=12000;
  const after=billAuditSnapshot(appState.bills[0],new Date(2026,8,2,12));
  recordBillAudit('b1','bill-updated',before,after);
`,context);
const audit=vm.runInContext("appState.auditTrail[0]",context);
assert.equal(audit.billId,'b1');
assert.equal(audit.action,'bill-updated');
assert.equal(audit.changes.some(x=>x.field==='totalCents'&&x.before===10000&&x.after===12000),true);
assert.equal(audit.changes.some(x=>x.field==='remainingCents'&&x.before===7500&&x.after===9500),true);

const migrated=vm.runInContext("ensureStateShape({version:3,bills:appState.bills,payments:appState.payments,auditTrail:appState.auditTrail})",context);
assert.equal(migrated.version,5);
assert.equal(migrated.auditTrail.length,1);

console.log('Deterministic finance and audit trail tests: OK');

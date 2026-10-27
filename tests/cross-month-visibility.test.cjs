'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');

const context=vm.createContext({
  console,crypto:webcrypto,TextEncoder,TextDecoder,Intl,Date,Math,Number,String,
  Map,Set,Uint8Array,Array,Object,JSON,RegExp,Error,Promise,BigInt,atob,btoa
});
vm.runInContext(fs.readFileSync('core.js','utf8'),context);
vm.runInContext(fs.readFileSync('finance.js','utf8'),context);

vm.runInContext(`
selectedMonth='2026-10';
const makeBill=(id,dueDate,totalCents,options={})=>({
  id,title:id,category:'Casa',totalCents,dueDate,dueTime:'23:59',
  cancelled:false,archived:false,recurrence:'none',...options
});
appState={
  version:5,settings:{currency:'EUR'},months:{'2026-10':{openingBalanceCents:0,budgetCents:100000,accountBalanceCents:0}},
  bills:[
    makeBill('set-antiga','2026-09-15',6000),
    makeBill('out-antiga','2026-10-20',3000),
    makeBill('out-amanha','2026-10-31',4000),
    makeBill('nov-seguinte','2026-11-03',10000),
    makeBill('nov-parcial','2026-11-05',2000),
    makeBill('nov-limite','2026-11-07',9000),
    makeBill('nov-paga','2026-11-01',15000),
    makeBill('nov-cancelada','2026-11-02',7000,{cancelled:true})
  ],
  payments:[
    {id:'p-parcial',billId:'nov-parcial',amountCents:500,paidAt:'2026-10-25T12:00:00Z',method:'Transferência'},
    {id:'p-paga',billId:'nov-paga',amountCents:15000,paidAt:'2026-10-25T12:00:00Z',method:'Transferência'}
  ],incomes:[],market:[],goals:[],activity:[],auditTrail:[]
};
`,context);

const now='new Date(2026,9,30,12)';
const numbers=vm.runInContext(`dashboardNumbers('2026-10',${now})`,context);
assert.equal(numbers.pending,4000,'os totais do mês não podem absorver a dívida de novembro');
assert.equal(numbers.overdue,3000);
assert.equal(numbers.outstanding,7000);
assert.equal(numbers.projected,-7000);
assert.equal(numbers.otherOverdue,6000,'o atraso de setembro tem de ficar visível');
assert.equal(numbers.otherOverdueCount,1);
assert.equal(numbers.otherOverdueFirstMonth,'2026-09');
assert.equal(numbers.next7,15500,'os próximos 7 dias incluem novembro, mas não vencimentos ao oitavo dia');
assert.equal(numbers.next7Count,3);
assert.equal(numbers.next7FirstMonth,'2026-10');
assert.equal(numbers.criticalCount,0);

const ordered=vm.runInContext(`dashboardPriorityBills('2026-10',${now}).map(b=>b.id)`,context);
assert.deepEqual(Array.from(ordered),['set-antiga','out-antiga','out-amanha','nov-seguinte','nov-parcial']);
assert.equal(vm.runInContext(`financialDiagnostics('2026-10',${now}).ok`,context),true);

const today=vm.runInContext('dashboardNumbers(\'2026-10\',new Date(2026,9,31,12))',context);
assert.equal(today.criticalCount,1);
assert.equal(today.criticalFirstMonth,'2026-10');

const render=fs.readFileSync('render.js','utf8');
const events=fs.readFileSync('events.js','utf8');
assert.match(render,/overdue-other-months/,'o aviso de dívidas antigas deve aparecer no centro de alertas');
assert.match(render,/data-month-target/,'os avisos têm de identificar o mês que o utilizador vai abrir');
assert.match(events,/selectMonthContext\(go\.dataset\.monthTarget,\{render:false\}\)/,'a ação deve selecionar o mês antes de abrir a lista');

console.log('Cross-month actionable bill visibility, financial separation and diagnostics: OK');

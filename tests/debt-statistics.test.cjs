const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');

const ctx=vm.createContext({
  crypto:webcrypto,TextEncoder,TextDecoder,Intl,Date,Math,Number,String,Boolean,
  BigInt,Map,Set,Uint8Array,Array,Object,JSON,RegExp,Error,Promise,atob,btoa
});
vm.runInContext(fs.readFileSync('core.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('finance.js','utf8'),ctx);

vm.runInContext(`
selectedMonth='2026-10';
appState={
  version:5,
  settings:{currency:'EUR'},
  months:{
    '2026-10':{openingBalanceCents:0,budgetCents:100000,accountBalanceCents:90000,accountBalanceUpdatedAt:'2026-10-30T12:00:00.000Z'},
    '2026-11':{openingBalanceCents:0,budgetCents:100000,accountBalanceCents:null}
  },
  bills:[
    {id:'b1',totalCents:20000,dueDate:'2026-10-10'},
    {id:'b2',totalCents:10000,dueDate:'2026-10-25'},
    {id:'b3',totalCents:5000,dueDate:'2026-10-31'},
    {id:'b4',totalCents:8000,dueDate:'2026-11-03'},
    {id:'b5',totalCents:12000,dueDate:'2026-11-12'},
    {id:'b6',totalCents:7000,dueDate:'2026-09-30'},
    {id:'b7',totalCents:2000,dueDate:''},
    {id:'b8',totalCents:9000,dueDate:'2026-10-31',cancelled:true},
    {id:'b9',totalCents:1000,dueDate:'2026-10-31',archived:true},
    {id:'b10',totalCents:-1000,dueDate:'2026-10-31'},
    {id:'b11',totalCents:600,dueDate:'2026-10-12'}
  ],
  payments:[
    {id:'p1',billId:'b1',amountCents:20000,paidAt:'2026-09-05T12:00:00.000Z'},
    {id:'p2',billId:'b2',amountCents:3000,paidAt:'2026-10-20T12:00:00.000Z'},
    {id:'p5',billId:'b5',amountCents:4000,paidAt:'2026-10-15T12:00:00.000Z'},
    {id:'p11',billId:'b11',amountCents:800,paidAt:'2026-10-25T12:00:00.000Z'}
  ],
  incomes:[],market:[],goals:[],activity:[]
};`,ctx);

const now='new Date(2026,9,31,12)';
const all=vm.runInContext(`billPortfolioStatistics(null,${now})`,ctx);
assert.equal(all.billCount,8);
assert.equal(all.fullyPaidCount,2);
assert.equal(all.partlyPaidCount,2);
assert.equal(all.unpaidCount,4);
assert.equal(all.outstandingCount,6);
assert.equal(all.totalCents,64600);
assert.equal(all.paidAllocatedCents,27600);
assert.equal(all.outstandingCents,37000);
assert.equal(all.overdueCents,14000);
assert.equal(all.dueTodayCents,5000);
assert.equal(all.futureCents,16000);
assert.equal(all.next7Cents,8000);
assert.equal(all.unknownDueCents,2000);
assert.equal(all.invalidCount,1);
assert.equal(all.overpaidCount,1);
assert.equal(all.overpaidCents,200);
assert.equal(all.outstandingCents,all.overdueCents+all.dueTodayCents+all.futureCents+all.unknownDueCents);
assert.equal(all.paidAllocatedCents+all.outstandingCents,all.totalCents);

const month=vm.runInContext(`billPortfolioStatistics('2026-10',${now})`,ctx);
assert.equal(month.billCount,4);
assert.equal(month.fullyPaidCount,2);
assert.equal(month.partlyPaidCount,1);
assert.equal(month.unpaidCount,1);
assert.equal(month.totalCents,35600);
assert.equal(month.paidAllocatedCents,23600);
assert.equal(month.outstandingCents,12000);
assert.equal(month.overdueCents,7000);
assert.equal(month.dueTodayCents,5000);
assert.equal(month.invalidCount,1);

const report=vm.runInContext(`debtBalanceStatistics('2026-10',${now})`,ctx);
assert.equal(report.hasAccountBalance,true);
assert.equal(report.currentBalanceCents,90000);
assert.equal(report.projectedMonthCents,78000);
assert.equal(report.projectedAllCents,53000);
assert.equal(report.paymentInMonthCents,7800);
assert.equal(report.canProjectAll,true);
assert.equal(report.projectedAllIsEstimate,false);

const nov=vm.runInContext(`debtBalanceStatistics('2026-11',${now})`,ctx);
assert.equal(nov.period.outstandingCents,16000);
assert.equal(nov.canProjectAll,false);
assert.equal(nov.projectedAllCents,null);

vm.runInContext("appState.months['2026-10'].accountBalanceCents=null",ctx);
const estimated=vm.runInContext(`debtBalanceStatistics('2026-10',${now})`,ctx);
assert.equal(estimated.projectedAllIsEstimate,true);
assert.equal(estimated.hasAccountBalance,false);

// O relatório só lê dados: não altera faturas, pagamentos, saldo, segurança ou sync.
assert.equal(vm.runInContext('appState.bills.length',ctx),11);
assert.equal(vm.runInContext('appState.payments.length',ctx),4);

const render=fs.readFileSync('render.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');
assert.match(render,/function renderDebtStatistics\(/);
assert.match(render,/renderDebtStatistics\(\);/);
assert.match(render,/data-money/);
for(const id of ['debtMonthSummary','debtAllSummary','debtBalanceSummary']){
  assert.match(html,new RegExp('id="'+id+'"'));
}
assert.match(css,/\.debt-stats-grid/);
assert.match(css,/@media\(max-width:600px\)/);
console.log('Estatísticas de dívidas e saldo: OK');

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
const bill=(id,due,total)=>({id,title:id,provider:'Fornecedor '+id,category:'Casa',totalCents:total,dueDate:due,dueTime:'23:59',cancelled:false,archived:false});
appState={
  version:5,settings:{currency:'EUR'},
  months:{'2026-10':{openingBalanceCents:0,budgetCents:100000,accountBalanceCents:null}},
  bills:[
    bill('renda-out','2026-10-05',90000),
    bill('agua-out','2026-10-19',3000),
    bill('internet-set','2026-09-26',4000),
    bill('luz-nov','2026-11-04',5000),
    {...bill('cancelada','2026-10-12',7000),cancelled:true}
  ],
  payments:[
    {id:'renda-set',billId:'renda-out',amountCents:40000,paidAt:'2026-09-30T12:00:00Z',method:'Transferência'},
    {id:'renda-out',billId:'renda-out',amountCents:50000,paidAt:'2026-10-01T12:00:00Z',method:'Transferência'},
    {id:'agua-parcial',billId:'agua-out',amountCents:1000,paidAt:'2026-10-16T12:00:00Z',method:'Débito direto'},
    {id:'set-paga-out',billId:'internet-set',amountCents:4000,paidAt:'2026-10-07T12:00:00Z',method:'MB Way'},
    {id:'nov-paga-out',billId:'luz-nov',amountCents:5000,paidAt:'2026-10-25T12:00:00Z',method:'Transferência'}
  ],
  market:[
    {id:'arroz',name:'Arroz',purchased:true,purchasedAt:'2026-10-08T12:00:00Z',actualCents:250,estimatedCents:300,quantity:2,category:'Alimentação'},
    {id:'leite',name:'Leite',purchased:true,purchasedAt:'2026-10-09T12:00:00Z',actualCents:0,estimatedCents:125,quantity:2,category:'Alimentação'},
    {id:'futuro',name:'Futuro',purchased:false,purchasedAt:'2026-10-12T12:00:00Z',estimatedCents:999,quantity:1},
    {id:'setembro',name:'Setembro',purchased:true,purchasedAt:'2026-09-09T12:00:00Z',actualCents:100,quantity:1}
  ],
  incomes:[],goals:[],activity:[],auditTrail:[]
};
`,context);

const report=vm.runInContext("monthlyPlanningRegister('2026-10')",context);
const money=vm.runInContext("monthNumbers('2026-10')",context);
assert.equal(report.movements.length,6,'cada pagamento e compra é apresentado uma única vez');
assert.equal(report.movements.filter(x=>x.kind==='payment').length,4);
assert.equal(report.movements.filter(x=>x.kind==='market').length,2);
assert.equal(report.movements.reduce((sum,x)=>sum+x.amountCents,0),money.cashSpent,'o relatório não pode divergir do caixa do mês');
assert.equal(money.paymentTotal,60000,'o pagamento de setembro não entra em outubro');
assert.equal(money.marketSpent,750,'preço real tem precedência sobre a estimativa');
assert.deepEqual(Array.from(report.unpaidBills.map(x=>x.id)),['agua-out'],'só faturas vencidas no mês e ainda por pagar');
assert.equal(report.unpaidBills[0].remainingCents,2000);
assert.equal(report.unpaidBills[0].paidCents,1000);
assert.equal(report.movements.find(x=>x.id==='leite').estimated,true);
assert.equal(report.movements.find(x=>x.id==='arroz').estimated,false);
assert.equal(report.movements.find(x=>x.id==='set-paga-out').title,'internet-set','pagamentos de contas antigas aparecem no mês real da saída');
assert.equal(report.movements.some(x=>x.id==='renda-set'),false);
assert.equal(report.movements.some(x=>x.id==='futuro'),false);
assert.equal(report.movements[0].id,'nov-paga-out','o histórico deve ser cronológico, com o mais recente primeiro');

const september=vm.runInContext("monthlyPlanningRegister('2026-09')",context);
assert.equal(september.movements.some(x=>x.id==='renda-set'),true,'histórico de meses anteriores preservado');
assert.equal(september.movements.some(x=>x.id==='set-paga-out'),false,'pagamentos futuros não alteram o registo cronológico anterior');
const empty=vm.runInContext("monthlyPlanningRegister('2026-08')",context);
assert.equal(empty.movements.length,0);
assert.equal(empty.unpaidBills.length,0);

const index=fs.readFileSync('index.html','utf8');
const render=fs.readFileSync('render.js','utf8');
const events=fs.readFileSync('events.js','utf8');
for(const id of ['planningReportTotals','planningPaidHistory','planningPendingBills','planningReportExplanation'])
  assert.ok(index.includes(`id="${id}"`),`o plano deve conter ${id}`);
assert.match(render,/renderPlanningMonthReport\(n\)/,'o Plano tem de atualizar o relatório com o mês');
assert.match(events,/openPaymentForm\(pay\.dataset\.planPay\)/,'o registo do Plano deve usar o formulário de pagamento existente');
assert.match(events,/openBillDetail\(bill\.dataset\.planBill\)/,'cada pagamento deve poder abrir a fatura original');

console.log('Plano mensal: movimentos reais, valores em falta, estimativas e histórico: OK');

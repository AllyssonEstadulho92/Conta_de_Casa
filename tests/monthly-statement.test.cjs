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
vm.runInContext(`
  selectedMonth='2026-11';
  appState={
    bills:[{id:'b1',title:'=IMPORTXML("x")',provider:' +SUM(1)',category:'Água',reference:'FT-123'}],
    incomes:[{id:'i1',description:'Salário',amountCents:192000,receivedAt:'2026-11-01'}],
    payments:[
      {id:'p1',billId:'b1',amountCents:3250,paidAt:'2026-11-06T10:00:00',method:'Cartão'},
      {id:'p2',billId:'missing',amountCents:975,paidAt:'2026-11-07',method:'Dinheiro'},
      {id:'p3',billId:'b1',amountCents:2000,paidAt:'2026-10-29'}
    ],
    market:[
      {id:'m1',purchased:true,name:'Arroz',category:'Alimentação',actualCents:1399,estimatedCents:1500,quantity:2,purchasedAt:'2026-11-08'},
      {id:'m2',purchased:true,name:'Leite',category:'Alimentação',actualCents:0,estimatedCents:120,quantity:3,purchasedAt:'2026-11-05'},
      {id:'m3',purchased:false,name:'Pão',estimatedCents:200,quantity:1,purchasedAt:'2026-11-04'}
    ]
  };
`,ctx);

const data=vm.runInContext(`({rows:monthlyStatementRows('2026-11'),csv:monthlyStatementCsv('2026-11'),total:sumCents(monthlyStatementRows('2026-11').map(row=>row.amountCents))})`,ctx);
assert.equal(data.rows.length,5,'include received income, registered payments and purchased products, but not unpaid ones or previous months');
assert.equal(data.total,199383,'sum must reconcile the exact cent values, including quantities and estimated market purchases');
assert.equal(data.rows.filter(row=>row.estimated).length,1,'estimated market costs must be marked');
assert.equal(data.rows.find(row=>row.id==='m1').amountCents,2798,'quantity must count in market line');
assert.equal(data.rows.find(row=>row.id==='p2').description,'Pagamento de fatura sem descrição','orphan payments must not disappear from the statement');
assert.ok(data.csv.startsWith('\ufeff'),'Excel-compatible UTF-8 BOM');
assert.match(data.csv,/"'\=IMPORTXML\(""x""\)"/,'CSV injection in names must be neutralized');
assert.match(data.csv,/"' \+SUM\(1\)"/,'CSV injection after whitespace must be neutralized');
assert.match(data.csv,/"-32,50"/,'expenses use safe signed decimal numeric cells');
assert.match(data.csv,/"-73,83"/,'money must be decimal commas in EUR with signed outgoing totals');
assert.match(data.csv,/"TOTAL DE ENTRADAS"/);
assert.match(data.csv,/"TOTAL DE SAÍDAS"/);
assert.match(data.csv,/"RESULTADO DO MÊS"/);
assert.match(data.csv,/"1846,17"/,'income minus spending must reconcile');
assert.equal(vm.runInContext("monthlyStatementRows('invalid').length",ctx),0);
assert.equal(vm.runInContext("monthlyStatementRows('2026-12').length",ctx),0);

vm.runInContext(`
  var statementHtml={};
  setHTML=(selector,markup)=>{statementHtml[selector]=markup};
  renderMonthlyStatement();
`,ctx);
const html=vm.runInContext('statementHtml',ctx);
assert.match(html['#monthlyStatementSummary'],/Resultado do mês/);
assert.match(html['#monthlyStatementList'],/Valor estimado/);
assert.ok(!html['#monthlyStatementList'].includes('=IMPORTXML("x")'),'render must HTML-escape user-authored descriptions');

const index=fs.readFileSync('index.html','utf8');
const events=fs.readFileSync('events.js','utf8');
const css=fs.readFileSync('v76-finance-screens.css','utf8');
assert.match(index,/id="exportMonthlyStatementBtn"/);
assert.match(events,/monthlyStatementCsv\(selectedMonth\)/);
assert.match(events,/URL\.revokeObjectURL\(objectUrl\)/);
assert.match(css,/\.cdc-monthly-statement/);
console.log('Monthly statement: reconciled cents, CSV safety, rendering and export: OK');

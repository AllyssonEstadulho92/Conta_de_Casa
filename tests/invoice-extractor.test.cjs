'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('invoice-extractor.js','utf8');
const rules=JSON.parse(fs.readFileSync('invoice-extraction-rules.json','utf8'));
const context={console};
context.globalThis=context;
vm.createContext(context);
vm.runInContext(source,context,{filename:'invoice-extractor.js'});

const extractor=context.CDCInvoiceExtractor;
assert.ok(extractor,'invoice extractor must install');

const goldenergyText=`
GOLDENERGY
PAGUE COM MB WAY
MULTIBANCO
Entidade 12345
Referência 111 222 333
Montante 139,53€
Data Limite 21/10/2026
DATA EMISSÃO 10/09/2026
CLIENTE N° C0000000
SALDO ATUAL 139,53€
TOTAL FATURADO NO PERÍODO 139,53€
`;

const result=JSON.parse(JSON.stringify(extractor.extract(goldenergyText,rules)));
assert.equal(result.provider,'Goldenergy');
assert.equal(result.title,'Fatura Goldenergy');
assert.equal(result.category,'Energia');
assert.equal(result.amountCents,13953);
assert.equal(result.dueDate,'2026-10-21');
assert.equal(result.issueDate,'2026-09-10');
assert.equal(result.entity,'12345');
assert.equal(result.paymentReference,'111222333');
assert.equal(result.reference,'Entidade 12345 · Referência 111 222 333');
assert.equal(result.clientNumber,'C0000000');
assert.equal(result.method,'Referência Multibanco');
assert.equal(result.hasUsefulData,true);
assert.match(result.notes,/12\/09\/2026/);
assert.match(result.notes,/C0000000/);

assert.equal(extractor.parseMoneyCents('1.234,56 €'),123456);
assert.equal(extractor.parseMoneyCents('139,53€'),13953);
assert.equal(extractor.parseDate('Data Limite 21/10/2026'),'2026-10-21');
assert.equal(extractor.parseDate('2026-09-10'),'2026-09-10');
assert.equal(extractor.parseDate('31/02/2026'),'');
assert.equal(extractor.normalize('Referência MULTIBANCO'),'referencia multibanco');

const generic=JSON.parse(JSON.stringify(extractor.extract(`
Fornecedor Exemplo
Data de vencimento 30/11/2026
Total a pagar 87,20 €
Referência 123 456 789
Entidade 12345
MULTIBANCO
`,rules)));
assert.equal(generic.amountCents,8720);
assert.equal(generic.dueDate,'2026-11-30');
assert.equal(generic.reference,'Entidade 12345 · Referência 123 456 789');
assert.equal(generic.method,'Referência Multibanco');
assert.equal(generic.hasUsefulData,true);

console.log('Invoice extraction rules recognize labeled generic invoices and the Goldenergy control sample: OK');

const assert = require('node:assert/strict');
const fs = require('node:fs');

const forms = fs.readFileSync('forms.js', 'utf8');

assert.match(forms, /function openDialog\(title, html, mode='form'\)/, 'dialog helper must exist');
assert.match(forms, /setHTML\('#dialogBody', html\)/, 'dialog body must pass through the sanitizer');
assert.match(forms, /f\.addEventListener\('submit',handleBillSubmit\)/, 'invoice submit handler must be wired');
assert.match(forms, /event\.preventDefault\(\)/, 'submission lock must prevent native form navigation before financial writes');
assert.match(forms, /await commit\('created','bill'\)/, 'new invoice save must use the encrypted commit path');
assert.match(forms, /await commit\('updated','bill'\)/, 'invoice edit must use the encrypted commit path');
assert.match(forms, /toast\('Fatura guardada\.'\)/, 'successful save must provide visible confirmation');
assert.match(forms, /cleanString\(fd\.get\('title'\),80\)/, 'invoice title must be normalized before saving');
assert.match(forms, /cleanMultiline\(fd\.get\('notes'\),1200\)/, 'invoice notes must be normalized before saving');
assert.doesNotMatch(forms, /commit\(`Fatura/, 'commit history must not include sensitive invoice text');

console.log('Invoice form regression tests: OK');


const index = fs.readFileSync('index.html','utf8');
const events = fs.readFileSync('events.js','utf8');

assert.match(index, /id="formDialog"[\s\S]*data-close-dialog[\s\S]*aria-label="Fechar janela"/, 'main dialog must expose an explicit close button');
assert.doesNotMatch(index, /id="formDialog"[^>]*>[\s\S]{0,80}<form method="dialog"/, 'main dialog shell must not rely on nested/native form-dialog behavior');
assert.match(events, /formDialog\.addEventListener\('cancel'[\s\S]*closeDialog\(\)/, 'Escape/cancel must close the main dialog');
assert.match(events, /e\.target===formDialog\)closeDialog\(\)/, 'backdrop tap must close the main dialog');
assert.match(forms, /if \(!dialog\.open\) dialog\.showModal\(\)/, 'opening a new view inside an existing modal must not throw');
assert.match(forms, /data-close-dialog>Fechar<\/button>/, 'bill details must include a redundant close action');

console.log('Modal close regression tests: OK');


assert.match(forms, /<div class="bill-detail">/, 'bill detail must preserve semantic layout through sanitizer');
assert.doesNotMatch(forms, /<section class="bill-detail">/, 'bill detail must not use a dynamic tag stripped by the HTML sanitizer');
assert.match(forms, /recurrenceLabel\(b\.recurrence\)/, 'bill detail must localize recurrence labels');
assert.match(forms, /dueText\(b\)/, 'bill detail must show a human-readable due countdown');

console.log('Bill detail structure regression tests: OK');


assert.match(forms, /data-detail-delete/);
assert.match(events, /function billDeletionScope\(rootId\)/);
assert.match(events, /Não é possível excluir uma fatura com pagamentos/);
assert.match(events, /recordSyncDeletion\('bill',billId\)/);
assert.match(events, /appState\.bills=appState\.bills\.filter/);
assert.match(events, /await commit\('deleted','bill'\)/);

console.log('Delete invoice safety tests: OK');


const render = fs.readFileSync('render.js','utf8');

assert.match(render, /const canDelete=b\.cancelled && paid===0/);
assert.match(render, /data-delete-bill/);
assert.match(events, /dataset\.deleteBill/);
assert.match(events, /await deleteBillEnteredByMistake/);

console.log('Bill card delete action tests: OK');


assert.match(forms, /const BILL_CATEGORIES = Object\.freeze/);
assert.match(forms, /Renda \/ Condomínio/);
assert.match(forms, /Internet \/ Telecomunicações/);
assert.match(forms, /Alimentação \/ Supermercado/);
assert.match(forms, /Ginásio \/ Desporto/);
assert.match(forms, /function billCategoryOptions\(selected='Casa'\)/);
assert.match(forms, /appState\?\.bills/);
assert.match(forms, /<select name="category" required>/);
assert.doesNotMatch(forms, /list="categoryList"/);

console.log('Invoice category taxonomy tests: OK');


assert.match(forms, /billDueDateKey\(bill\)/);
assert.match(forms, /billDueTimeKey\(bill\)/);
assert.match(forms, /const dueDate=cleanDateKey\(fd\.get\('dueDate'\)\)/);
assert.match(forms, /composeLocalDateTimeIso\(dueDate,dueTime\)/);
assert.match(forms, /if\(!title\)\{toast\('Indique uma descrição para a fatura\.'/);
assert.doesNotMatch(forms, /due\.toISOString\(\)\.slice\(0,10\)/);

console.log('Civil due-date form regression tests: OK');


assert.match(forms, /async function withFormSubmissionLock\(event, task\)/);
assert.match(forms, /form\.dataset\.submitting==='true'/);
assert.match(forms, /duplicatePaymentExists\(payment,existing\?\.id\|\|''\)/);
assert.match(forms, /Este pagamento já está registado/);
assert.match(forms, /total<paidForBill\(id\)/);
assert.match(forms, /data-delete-payment=/);
assert.match(forms, /data-detail-duplicate=/);
assert.match(events, /recordSyncDeletion\('payment',payment\.id\)/);
assert.match(events, /Pagamento eliminado/);
assert.match(events, /Não é possível cancelar uma fatura com pagamentos/);
assert.match(forms, /await idbPutVaultPair\(normalized\.meta,normalized\.secure\)/);
assert.match(forms, /Restaurar este backup substitui o cofre local/);

console.log('Financial mutation safety regression tests: OK');


assert.match(forms, /data-edit-payment=/);
assert.match(forms, /data-delete-payment=/);
assert.match(forms, /data-remove-excess-payment=/);
assert.match(forms, /Pagamento excedente detetado/);
assert.match(forms, /Histórico financeiro/);
assert.match(forms, /recordBillAudit\(b\.id,'bill-updated'/);
assert.match(forms, /recordBillAudit\(bill\.id,'bill-created'/);
assert.match(forms, /recordBillAudit\(b\.id,existing\?'payment-updated':'payment-created'/);
assert.match(forms, /function openPaymentForm\(id,paymentId=''\)/);
assert.match(forms, /existing\?'Editar pagamento':'Registar pagamento'/);
assert.match(forms, /updatedAt:now/);
assert.match(events, /function deletePaymentRecord\(/);
assert.match(events, /data-edit-payment/);
assert.match(events, /data-remove-excess-payment/);
assert.match(events, /Remover o pagamento mais recente para corrigir o valor excedente/);
assert.match(events, /recordBillAudit\(bill\.id,'payment-deleted'/);
assert.match(events, /recordBillAudit\(b\.id,'bill-cancelled'/);

console.log('Payment edit and overpayment repair tests: OK');

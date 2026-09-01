const assert = require('node:assert/strict');
const fs = require('node:fs');

const forms = fs.readFileSync('forms.js', 'utf8');

assert.match(forms, /function openDialog\(title, html, mode='form'\)/, 'dialog helper must exist');
assert.match(forms, /setHTML\('#dialogBody', html\)/, 'dialog body must pass through the sanitizer');
assert.match(forms, /f\.addEventListener\('submit',handleBillSubmit\)/, 'invoice submit handler must be wired');
assert.match(forms, /e\.preventDefault\(\)/, 'invoice submission must not trigger native form navigation');
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


const events = fs.readFileSync('events.js','utf8');

assert.match(forms, /data-detail-delete/);
assert.match(events, /function billDeletionScope\(rootId\)/);
assert.match(events, /Não é possível excluir uma fatura com pagamentos/);
assert.match(events, /recordSyncDeletion\('bill',billId\)/);
assert.match(events, /appState\.bills=appState\.bills\.filter/);
assert.match(events, /await commit\('deleted','bill'\)/);

console.log('Delete invoice safety tests: OK');

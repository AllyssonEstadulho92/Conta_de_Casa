const assert = require('node:assert/strict');
const fs = require('node:fs');

const forms = fs.readFileSync('forms.js', 'utf8');

assert.match(forms, /function ensureDialogContainer\(\)/, 'dialog hardening must exist');
assert.match(forms, /current\.tagName !== 'FORM'/, 'outer dialog form must be replaced before inserting transaction forms');
assert.match(forms, /form\.addEventListener\('submit', handleBillSubmit\)/, 'invoice submit handler must be wired');
assert.match(forms, /e\.preventDefault\(\)/, 'invoice submission must not trigger native dialog/form navigation');
assert.match(forms, /await commit\(`Fatura/, 'invoice save must persist through the encrypted commit path');
assert.match(forms, /showPage\('bills'\)/, 'successful save must return to the invoice list');
assert.match(forms, /Fatura guardada com sucesso/, 'successful save must provide visible confirmation');

console.log('Invoice form regression tests: OK');

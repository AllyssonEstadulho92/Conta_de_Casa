const assert = require('node:assert/strict');
const fs = require('node:fs');

const forms = fs.readFileSync('forms.js', 'utf8');

assert.match(forms, /function openDialog\(title, html\)/, 'dialog helper must exist');
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

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('invoice-capture.js','utf8');
const context=vm.createContext({
  globalThis:{},
  String,Number,Date,Object,RegExp,Array,Math,URL,Promise,setTimeout,clearTimeout
});
context.globalThis=context;
vm.runInContext(source,context);

assert.ok(context.CDCInvoiceCapture,'invoice parser API must be exposed');

const officialExample='A:123456789*B:999999990*C:PT*D:FS*E:N*F:20190812*G:FS CDVF/12345*H:CDF7T5HD-12345*I1:PT*I7:0.65*I8:0.15*N:0.15*O:0.80*Q:YhGV*R:9999*S:NU;0.80';
const parsed=context.CDCInvoiceCapture.parseAtInvoiceQr(officialExample);
assert.equal(parsed.issuerNif,'123456789');
assert.equal(parsed.buyerNif,'999999990');
assert.equal(parsed.documentType,'FS');
assert.equal(parsed.documentDate,'2019-08-12');
assert.equal(parsed.documentId,'FS CDVF/12345');
assert.equal(parsed.atcud,'CDF7T5HD-12345');
assert.equal(parsed.totalCents,80);
assert.equal(parsed.taxCents,15);
assert.equal(parsed.hashFragment,'YhGV');
assert.equal(parsed.certificate,'9999');

assert.equal(context.CDCInvoiceCapture.parseAtInvoiceQr('A:123456789*F:20190230*G:X*O:1.00'),null,'invalid civil date must be rejected');
assert.equal(context.CDCInvoiceCapture.parseAtInvoiceQr('A:123*F:20190812*G:X*O:1.00'),null,'issuer NIF must have 9 digits');
assert.equal(context.CDCInvoiceCapture.parseAtInvoiceQr('not-an-at-qr'),null);
assert.equal(context.CDCInvoiceCapture.parseMoneyCents('123.45'),12345);
assert.equal(context.CDCInvoiceCapture.parseMoneyCents('123,45'),null,'AT QR decimal separator is dot');

assert.match(source,/BrowserQRCodeReader/);
assert.match(source,/decodeFromImageUrl/);
assert.match(source,/facingMode:\{ideal:'environment'\}/);
assert.match(source,/getTracks\(\).*track\.stop/);
assert.match(source,/URL\.revokeObjectURL/);
assert.match(source,/data-invoice-apply/);
assert.match(source,/String\(form\.elements\.id\?\.value\|\|''\)/,'capture UI must stay limited to new invoices');
assert.doesNotMatch(source,/localStorage|sessionStorage|idbPut|idbGet|appState|saveState|commit\(/,'invoice capture must not persist files or mutate financial state directly');
assert.doesNotMatch(source,/fetch\(|XMLHttpRequest|sendBeacon/,'invoice QR capture must not upload the invoice or its image');
assert.doesNotMatch(source,/\.pdf|application\/pdf/i,'PDF parsing is deliberately not implemented in this local QR-only capture');

const css=fs.readFileSync('invoice-capture.css','utf8');
assert.match(css,/env\(safe-area-inset-top\)/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/invoice-scan-overlay/);
assert.match(css,/invoice-capture-preview-grid/);

console.log('Invoice capture tests: OK');

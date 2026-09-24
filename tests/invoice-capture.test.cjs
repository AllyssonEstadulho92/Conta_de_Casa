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

assert.match(source,/76-expense-mode-stability1/);
assert.match(source,/76-expense-mode-action1/,'invoice registration modes must remain directly actionable');
assert.match(source,/76-invoice-capture-warmup1/,'invoice reader warmup revision must remain explicit');
assert.match(source,/MODE_COPY=Object\.freeze/);
assert.match(source,/Ler fatura por imagem/);
assert.match(source,/Fotografia com QR da Autoridade Tributária/);
assert.match(source,/não faz OCR do texto completo/,'image mode must describe the real QR-in-image capability instead of promising OCR');
assert.match(source,/Ler QR da fatura/);
assert.match(source,/Abrir câmara/);
assert.match(source,/Selecionar imagem/);
assert.match(source,/cdc:bill-mode-change/,'capture surface must react to the selected registration mode');
assert.match(source,/function activateMode\(mode\)/,'mode selection must have one canonical activation path');
assert.match(source,/function prewarmZxing\(\)/,'invoice form may prewarm the QR reader where safe');
assert.match(source,/function isTouchInvoiceDevice\(\)/,'invoice capture must detect touch/iOS before prewarming');
assert.match(source,/function prewarmZxing\(\)\{[\s\S]{0,120}if\(isTouchInvoiceDevice\(\)\)return/,'touch/iOS must not preload ZXing before the native picker opens');
assert.match(source,/loadZxing\(\)\.catch\(\(\)=>undefined\)/,'reader warmup must stay non-blocking and silent');
assert.match(source,/mode==='image'[\s\S]{0,500}input\.click\(\)/,'the secondary image action may still open its local picker programmatically outside the native top-tab path');
assert.match(source,/mode==='qr'[\s\S]{0,260}openCamera\(\)/,'QR Code must start the camera flow from the mode tap');
assert.match(source,/mode==='manual'[\s\S]{0,120}focusManualField\(\)/,'Manual must return focus to the manual entry flow');
assert.match(source,/currentCaptureMode\(\)!=='qr'/,'camera must only start from explicit QR mode');
assert.match(source,/requestedMode==='qr'\?'qr':'image'/,'image decoding must explicitly support both invoice-photo and native QR-camera sources');
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

/* 76-expense-form-professional1: the expense dialog is a single coherent flow,
   without changing the financial form contract. */
assert.match(css,/76-expense-form-professional1/);
assert.match(css,/#formDialog\[data-v75-kind="expense"\][\s\S]*width:min\(720px,calc\(100vw - 32px\)\)!important/);
assert.match(css,/#formDialog\[data-v75-kind="expense"\] \.dialog-shell[\s\S]*grid-template-rows:auto minmax\(0,1fr\)!important/);
assert.match(css,/#formDialog\[data-v75-kind="expense"\] #billForm[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
assert.match(css,/data-v75-bill-mode="manual"\] \[data-invoice-capture\]\{display:none!important\}/,'manual mode must not show an irrelevant capture card');
assert.match(css,/data-v75-bill-mode="image"\] \[data-invoice-camera\]\{display:none!important\}/,'image mode must only expose the image action');
assert.match(css,/data-v75-bill-mode="qr"\] \.invoice-image-button\{display:none!important\}/,'QR mode must only expose the camera action');
assert.match(css,/#billForm>label:nth-of-type\(1\)\{order:10!important\}/,'description must remain in the essential section');
assert.match(css,/#billForm>label:nth-of-type\(4\)\{order:11!important\}/,'amount must remain in the essential section');
assert.match(css,/#billForm::after[\s\S]*content:"Detalhes adicionais"/,'secondary invoice metadata must be visually separated');
assert.match(css,/safe-area-inset-bottom/,'mobile expense flow must reserve the bottom safe area');
assert.match(css,/forced-colors:active/,'expense flow must retain forced-colors accessibility');
assert.doesNotMatch(css,/amountCents|totalCents|appState|commit\(|saveState\(|idbPut/,'expense visual layer must not touch financial or persistence state');

/* 76-expense-ios-touch1: Safari must have one and only one scroll owner in the
   full-screen expense flow. Nested 100dvh scroll containers caused the rendered
   modal to stop receiving reliable taps on iOS. */
assert.match(css,/76-expense-ios-touch1/);
const mobileTouchBlock=css.match(/\/\* --------------------------------------------------------------------------\n   76-expense-ios-touch1[\s\S]*?(?=\n@media\(max-width:430px\))/)?.[0]||'';
assert.ok(mobileTouchBlock,'iOS touch stability block must exist');
assert.match(mobileTouchBlock,/#formDialog\[data-v75-kind="expense"\]\{[\s\S]*overflow-y:auto!important/,'native dialog must own vertical scrolling on mobile');
assert.match(mobileTouchBlock,/\.dialog-shell\{[\s\S]*height:auto!important[\s\S]*max-height:none!important[\s\S]*overflow:visible!important/,'dialog shell must not create a nested mobile scroll port');
assert.match(mobileTouchBlock,/#dialogBody\{[\s\S]*overflow:visible!important/,'dialog body must not create a second mobile scroll port');
assert.match(mobileTouchBlock,/\.v75-bill-tabs \[data-v75-bill-mode\]\{[\s\S]*pointer-events:auto!important[\s\S]*touch-action:manipulation!important/,'expense mode tabs must remain tappable on iOS');
assert.match(source,/76-expense-native-input4/,'native invoice capture revision must remain explicit');
assert.match(source,/76-expense-picker-unblock6/,'native picker unblock revision must remain explicit');
assert.match(source,/76-invoice-autofill7/,'invoice autofill revision must remain explicit');
assert.match(source,/function setBlankField\(field,value\)/,'autofill must use one non-destructive field writer');
assert.match(source,/function requiredInvoiceFieldsReady\(form\)/,'autofill must verify required invoice fields after applying QR data');
assert.match(source,/applyInvoiceToForm\(\{announce:false,focus:false\}\)/,'a valid QR must autofill the form without requiring a second button press');
assert.match(source,/form\.elements\.title[\s\S]{0,500}form\.elements\.amount[\s\S]{0,500}form\.elements\.reference/,'autofill must cover description, total and reference');
assert.match(source,/invoiceReviewFields='provider,category,dueDate,method'/,'fields not supplied authoritatively by the AT QR must remain marked for review');
assert.match(source,/Categoria, vencimento e método não constam do QR da AT/,'UI must explain which required/business fields cannot be extracted from the QR');
assert.match(source,/function decodeQrFromImage\(file,objectUrl\)/,'image decoding must have a single resilient path');
assert.match(source,/BarcodeDetector/,'native QR decoding must be attempted when the browser provides it');
assert.match(source,/event\.detail\?\.native/,'native file/camera selection must not recursively invoke programmatic pickers');
assert.match(css,/#billForm :is\(input,select,textarea\):not\(\[data-v75-native-invoice\]\)\{[\s\S]*pointer-events:auto!important[\s\S]*touch-action:manipulation!important/,'expense fields must remain interactive without resizing the native capture overlay');
assert.match(mobileTouchBlock,/\.dialog-close\{[\s\S]*text-indent:-9999px!important[\s\S]*color:transparent!important/,'original multiplication glyph must be visually removed on mobile');
assert.match(mobileTouchBlock,/\.dialog-close::before\{[\s\S]*mask:url\([^\n]*m15 18-6-6 6-6/,'mobile close control must render only the back chevron');
assert.doesNotMatch(mobileTouchBlock,/\.dialog-shell\{[\s\S]{0,260}overflow:auto!important/,'dialog shell must never become the mobile scroll owner again');

const sw=fs.readFileSync('sw.js','utf8');
assert.match(sw,/expense-form-professional1-expense-ios-touch1/,'PWA cache must invalidate the frozen iOS expense dialog revision');
assert.match(sw,/invoice-mode-action1/,'PWA cache must invalidate the previous inert invoice-mode runtime');
assert.match(sw,/invoice-capture-warmup1/,'PWA cache must invalidate the slower first-use reader runtime');
assert.match(sw,/invoice-autofill7/,'PWA cache must invalidate the previous manual-apply invoice runtime');

console.log('Invoice capture tests: exact AT QR parser plus deterministic modes, professional expense UI and iOS touch stability: OK');

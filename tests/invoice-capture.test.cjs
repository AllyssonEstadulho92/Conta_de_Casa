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
assert.match(source,/OCR local \+ QR · sem enviar a fatura/);
assert.match(source,/lê o texto localmente/,'image mode must disclose the local OCR capability');
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
assert.match(source,/function readerSource\(\)/);
assert.match(source,/new URL\(value,document\.baseURI\)/,'reader path must resolve against the current app origin');
assert.match(source,/url\.origin!==location\.origin/,'reader source must reject cross-origin scripts');
assert.match(source,/\/vendor\\\/zxing-browser\\\.min\\\.js\$/,'reader source must be pinned to the local ZXing asset');
assert.doesNotMatch(source,/unpkg\.com/,'invoice capture must not depend on an external script CDN');
assert.match(source,/decodeFromImageUrl/);
assert.match(source,/facingMode:\{ideal:'environment'\}/);
assert.match(source,/getTracks\(\).*track\.stop/);
assert.match(source,/URL\.revokeObjectURL/);
assert.match(source,/data-invoice-apply/);
assert.match(source,/String\(form\.elements\.id\?\.value\|\|''\)/,'capture UI must stay limited to new invoices');
assert.doesNotMatch(source,/localStorage|sessionStorage|idbPut|idbGet|appState|saveState|commit\(/,'invoice capture must not persist files or mutate financial state directly');
assert.doesNotMatch(source,/fetch\(|XMLHttpRequest|sendBeacon/,'invoice QR capture must not upload the invoice or its image');
assert.doesNotMatch(source,/\.pdf|application\/pdf/i,'PDF parsing is deliberately not implemented in this image-based local capture');

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
assert.match(source,/76-invoice-hierarchy8/,'generic invoice hierarchy revision must remain explicit');
assert.match(source,/FIELD_AUTHORITY_RANK=Object\.freeze/,'invoice fields must use one authority hierarchy');
assert.match(source,/manual:500/,'manual user edits must remain the highest authority');
assert.match(source,/'structured-qr':400/,'structured QR data must outrank OCR');
assert.match(source,/'ocr-labeled':350/,'labeled OCR must outrank defaults');
assert.match(source,/function initInvoiceFieldHierarchy\(form\)/);
assert.match(source,/if\(!event\.isTrusted\)return/,'only trusted user edits may become manual authority');
assert.match(source,/currentAuthority==='manual'/,'automatic sources must never overwrite manual edits');
assert.match(source,/function resetAutomaticInvoiceFields\(form\)/,'a new scan may reset only previous automatic values');
assert.match(source,/function setBlankField\(field,value\)/,'legacy structured autofill must remain non-destructive');
assert.match(source,/function requiredInvoiceFieldsReady\(form\)/,'autofill must verify required invoice fields after applying QR data');
assert.match(source,/applyInvoiceToForm\(\{announce:false,focus:false\}\)/,'a valid QR must autofill the form without requiring a second button press');
assert.match(source,/form\.elements\.title[\s\S]{0,500}form\.elements\.amount[\s\S]{0,500}form\.elements\.reference/,'autofill must cover description, total and reference');
assert.match(source,/function syncReviewFields\(form\)/,'review state must be derived from field authority');
assert.match(source,/data-invoice-review/,'fields without authoritative data must remain visibly reviewable');
assert.match(source,/function applyExtractedInvoiceToForm\(data,options=\{\}\)/,'generic OCR data must use the same canonical bill form');
assert.match(source,/function applyPendingInvoice\(options=\{\}\)/,'QR and OCR must converge before user confirmation');
assert.match(source,/CDCInvoiceExtractor\?\.loadRules\?\.\(\{fresh:true\}\)/,'invoice rules must refresh independently for each read');
assert.match(source,/CDCInvoiceOcr\.recognize\(file/,'invoice image mode must use local OCR');
assert.match(source,/Promise\.all\(\[qrPromise,ocrPromise,rulesPromise/,'QR, OCR and rule loading should proceed together without serial waits');
assert.match(source,/const QR_IMAGE_DECODE_TIMEOUT_MS=6000/,'invoice image decoding must have a hard upper bound');
assert.match(source,/function withDecodeTimeout\(promise,timeoutMs=QR_IMAGE_DECODE_TIMEOUT_MS\)/,'all asynchronous QR image decoders must share the timeout guard');
assert.match(source,/withDecodeTimeout\(detector\.detect\(bitmap\)\)/,'native BarcodeDetector must be bounded');
assert.match(source,/withDecodeTimeout\(reader\.decodeFromImageUrl\(objectUrl\)\)/,'ZXing image decoding must be bounded');
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
assert.match(sw,/invoice-hierarchy1-local-ocr1/,'PWA cache must invalidate the pre-OCR invoice runtime');
assert.match(sw,/OCR_CACHE = 'conta-de-casa-ocr-tesseract-7\.0\.0-por-1\.0\.0'/,'OCR vendor assets must use a separate versioned cache');

console.log('Invoice capture tests: AT QR + local OCR hierarchy, manual precedence, generic invoice filling and iOS touch stability: OK');

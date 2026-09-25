'use strict';

/* Conta de Casa — captura assistida de faturas portuguesas.
 * Lê o Código QR definido pela AT a partir da câmara ou de uma imagem local.
 * O ficheiro/imagem nunca é guardado; os dados só preenchem o formulário após confirmação.
 * 76-expense-mode-stability1 mantém imagem e câmara separadas, sem OCR fictício.
 * 76-expense-mode-action1 torna Manual / Ler fatura / QR Code ações diretas: foco, ficheiro e câmara.
 * 76-invoice-capture-warmup1 prepara o leitor QR em background quando o formulário abre, reduzindo a espera no primeiro uso.
 * 76-expense-native-input4 usa controlos file/capture nativos no iOS para evitar bloqueios de input.click()/getUserMedia.
 * 76-expense-picker-unblock6 não pré-carrega ZXing em touch/iOS antes da escolha nativa.
 * 76-invoice-autofill7 preenche automaticamente os campos seguros logo após um QR AT válido.
 * 76-invoice-hierarchy8 combina QR estruturado + OCR local com prioridade manual > estruturado > OCR > regra > default.
 */
(function installInvoiceCapture(root){
  const MAX_IMAGE_BYTES=15*1024*1024;
  const QR_IMAGE_DECODE_TIMEOUT_MS=6000;
  const ZXING_LOAD_TIMEOUT_MS=12000;
  const MODE_COPY=Object.freeze({
    image:Object.freeze({
      title:'Ler fatura por imagem',
      subtitle:'OCR local + QR · sem enviar a fatura',
      description:'Selecione uma fotografia da fatura. A aplicação tenta primeiro dados estruturados do QR e depois lê o texto localmente para completar montante, vencimento, fornecedor, referência e outros campos reconhecíveis. A imagem não é guardada nem enviada.',
      icon:'image',
      action:'Selecionar imagem'
    }),
    qr:Object.freeze({
      title:'Ler QR da fatura',
      subtitle:'Câmara · Código QR da Autoridade Tributária',
      description:'Abra a câmara e aponte para o código QR impresso na fatura. A leitura acontece neste dispositivo e nenhum fotograma é guardado ou enviado.',
      icon:'qr',
      action:'Abrir câmara'
    })
  });
  let observer=null;
  let scannerControls=null;
  let scannerSession=0;
  let scannerBusy=false;
  let pendingInvoice=null;
  let zxingPromise=null;
  let readerWarmupScheduled=false;

  const clean=(value,max=180)=>String(value??'')
    .replace(/[\u0000-\u001f\u007f]/g,' ')
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,max);

  function escapeHtml(value){
    return String(value??'').replace(/[&<>"']/g,char=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[char]);
  }

  function parseMoneyCents(raw){
    const text=String(raw??'').trim();
    if(!/^-?\d{1,12}(?:\.\d{1,2})?$/.test(text))return null;
    const negative=text.startsWith('-');
    const unsigned=negative?text.slice(1):text;
    const [whole,fraction='']=unsigned.split('.');
    const cents=Number(whole)*100+Number((fraction+'00').slice(0,2));
    if(!Number.isSafeInteger(cents))return null;
    return negative?-cents:cents;
  }

  function parseAtDate(raw){
    const match=/^(\d{4})(\d{2})(\d{2})$/.exec(String(raw||''));
    if(!match)return '';
    const year=Number(match[1]),month=Number(match[2]),day=Number(match[3]);
    const date=new Date(Date.UTC(year,month-1,day));
    if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)return '';
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  function parseAtInvoiceQr(payload){
    const raw=String(payload??'').trim();
    if(raw.length<20||raw.length>3500||!raw.includes('*'))return null;
    const fields=Object.create(null);
    for(const segment of raw.split('*')){
      const index=segment.indexOf(':');
      if(index<1)continue;
      const key=segment.slice(0,index).trim().toUpperCase();
      if(!/^[A-Z][A-Z0-9]{0,2}$/.test(key))continue;
      fields[key]=clean(segment.slice(index+1),240);
    }
    const issuerNif=/^\d{9}$/.test(fields.A||'')?fields.A:'';
    const buyerNif=/^\d{9}$/.test(fields.B||'')?fields.B:'';
    const documentDate=parseAtDate(fields.F);
    const documentId=clean(fields.G,120);
    const atcud=clean(fields.H,120);
    const totalCents=parseMoneyCents(fields.O);
    const taxCents=parseMoneyCents(fields.N);
    const documentType=clean(fields.D,8);
    const documentStatus=clean(fields.E,8);
    if(!issuerNif||!documentDate||!documentId||totalCents===null)return null;
    return Object.freeze({
      issuerNif,buyerNif,documentType,documentStatus,documentDate,documentId,atcud,
      totalCents,taxCents:taxCents===null?0:taxCents,
      certificate:clean(fields.R,40),hashFragment:clean(fields.Q,12)
    });
  }

  function centsText(cents){
    const value=Number(cents);
    if(!Number.isSafeInteger(value))return '';
    return `${(value/100).toFixed(2).replace('.',',')} €`;
  }

  function icon(name,size=20){
    return root.CDCIcons?.markup?.(name,size)||'';
  }

  function currentCaptureMode(){
    const mode=document.querySelector('#formDialog')?.dataset?.v75BillMode||'manual';
    return mode==='image'||mode==='qr'?mode:'manual';
  }

  function setNodeText(selector,value){
    const node=document.querySelector(selector);
    if(node&&node.textContent!==value)node.textContent=value;
  }

  function syncCaptureMode(requestedMode=currentCaptureMode()){
    const section=document.querySelector('[data-invoice-capture]');
    if(!section)return;
    const mode=requestedMode==='image'||requestedMode==='qr'?requestedMode:'manual';
    section.dataset.invoiceMode=mode;
    if(mode==='manual')return;
    const copy=MODE_COPY[mode];
    setNodeText('[data-invoice-mode-title]',copy.title);
    setNodeText('[data-invoice-mode-subtitle]',copy.subtitle);
    setNodeText('[data-invoice-mode-description]',copy.description);
    const mark=section.querySelector('[data-invoice-mode-mark]');
    const markup=icon(copy.icon,22);
    if(mark&&mark.innerHTML!==markup)mark.innerHTML=markup;
    if(mode==='image')setNodeText('[data-invoice-image-label]',copy.action);
    if(mode==='qr')setNodeText('[data-invoice-camera-label]',copy.action);
  }

  function readerSource(){
    const value=document.querySelector('meta[name="barcode-reader-src"]')?.content?.trim()||'';
    if(!value)return '';
    try{
      const url=new URL(value,document.baseURI);
      if(url.origin!==location.origin)return '';
      if(!/\/vendor\/zxing-browser\.min\.js$/.test(url.pathname))return '';
      return url.href;
    }catch(_error){return '';}
  }

  function isTouchInvoiceDevice(){
    const coarse=Boolean(root.matchMedia?.('(hover: none) and (pointer: coarse)')?.matches);
    const ios=/iPad|iPhone|iPod/.test(String(root.navigator?.userAgent||''))||root.navigator?.platform==='MacIntel'&&Number(root.navigator?.maxTouchPoints||0)>1;
    return coarse||ios;
  }

  function prewarmZxing(){
    if(isTouchInvoiceDevice())return;
    if(readerWarmupScheduled||root.ZXingBrowser?.BrowserQRCodeReader)return;
    readerWarmupScheduled=true;
    setTimeout(()=>{
      readerWarmupScheduled=false;
      if(document.hidden||!document.querySelector('#billForm'))return;
      loadZxing().catch(()=>undefined);
    },0);
  }

  function loadZxing(){
    if(root.ZXingBrowser?.BrowserQRCodeReader)return Promise.resolve(root.ZXingBrowser);
    if(zxingPromise)return zxingPromise;
    zxingPromise=new Promise((resolve,reject)=>{
      const existing=document.querySelector('script[data-market-zxing],script[data-invoice-zxing]');
      const finish=()=>root.ZXingBrowser?.BrowserQRCodeReader?resolve(root.ZXingBrowser):reject(new Error('zxing-unavailable'));
      if(existing){
        existing.addEventListener('load',finish,{once:true});
        existing.addEventListener('error',()=>reject(new Error('zxing-load-failed')),{once:true});
        setTimeout(finish,250);
        return;
      }
      const src=readerSource();
      if(!src){reject(new Error('zxing-source-invalid'));return;}
      const script=document.createElement('script');
      script.src=src;
      script.async=true;
      script.dataset.invoiceZxing='';
      script.referrerPolicy='no-referrer';
      const timer=setTimeout(()=>reject(new Error('zxing-timeout')),ZXING_LOAD_TIMEOUT_MS);
      script.addEventListener('load',()=>{clearTimeout(timer);finish();},{once:true});
      script.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('zxing-load-failed'));},{once:true});
      document.head.appendChild(script);
    }).catch(error=>{zxingPromise=null;throw error;});
    return zxingPromise;
  }

  function status(message,tone='normal'){
    const node=document.querySelector('#invoiceCaptureStatus');
    if(!node)return;
    node.textContent=clean(message,300);
    node.className=`invoice-capture-status ${tone}`;
    node.hidden=!node.textContent;
  }

  function previewHtml(data){
    const atcud=data.atcud?`<span><small>ATCUD</small><strong>${escapeHtml(data.atcud)}</strong></span>`:'';
    const tax=Number.isSafeInteger(data.taxCents)?`<span><small>Impostos</small><strong>${escapeHtml(centsText(data.taxCents))}</strong></span>`:'';
    return `<div class="invoice-capture-preview-head"><div>${icon('check',18)}<strong>QR de fatura reconhecido</strong></div><button class="btn secondary" type="button" data-invoice-apply>Reaplicar dados</button></div>
      <div class="invoice-capture-preview-grid">
        <span><small>NIF emitente</small><strong>${escapeHtml(data.issuerNif)}</strong></span>
        <span><small>Documento</small><strong>${escapeHtml(data.documentId)}</strong></span>
        <span><small>Data do documento</small><strong>${escapeHtml(data.documentDate.split('-').reverse().join('/'))}</strong></span>
        <span><small>Total</small><strong>${escapeHtml(centsText(data.totalCents))}</strong></span>
        ${atcud}${tax}
      </div>
      <small class="invoice-capture-review-note">Descrição, valor, NIF do emitente e referência são preenchidos automaticamente quando estiverem vazios. Categoria, vencimento e método não constam do QR da AT e devem ser confirmados antes de guardar.</small>`;
  }

  const FIELD_AUTHORITY_RANK=Object.freeze({
    empty:0,
    'form-default':100,
    'structured-placeholder':250,
    'provider-rule':320,
    'ocr-labeled':350,
    'structured-qr':400,
    manual:500
  });
  const MANAGED_FIELDS=Object.freeze(['title','provider','category','amount','dueDate','method','reference','notes']);

  function initInvoiceFieldHierarchy(form){
    if(!form||form.dataset.invoiceHierarchyBound==='true')return;
    form.dataset.invoiceHierarchyBound='true';
    for(const name of MANAGED_FIELDS){
      const field=form.elements?.[name];
      if(!field)continue;
      const value=String(field.value||'');
      field.dataset.invoiceDefault=value;
      field.dataset.invoiceAuthority=value?'form-default':'empty';
    }
    const markManual=event=>{
      if(!event.isTrusted)return;
      const field=event.target;
      if(!field?.name||!MANAGED_FIELDS.includes(field.name))return;
      field.dataset.invoiceAuthority='manual';
      field.dataset.invoiceUserEdited='true';
      field.removeAttribute('data-invoice-review');
      syncReviewFields(form);
    };
    form.addEventListener('input',markManual,true);
    form.addEventListener('change',markManual,true);
    syncReviewFields(form);
  }

  function fieldAuthority(field){
    if(!field)return 'empty';
    if(field.dataset.invoiceAuthority)return field.dataset.invoiceAuthority;
    return String(field.value||'').trim()?'form-default':'empty';
  }

  function authorityRank(value){
    return FIELD_AUTHORITY_RANK[value]??0;
  }

  function setFieldByAuthority(field,value,authority,options={}){
    if(!field||value===null||value===undefined||value==='')return false;
    const next=String(value);
    const currentAuthority=fieldAuthority(field);
    if(currentAuthority==='manual')return false;
    if(options.onlyIfEmpty&&String(field.value||'').trim())return false;
    if(authorityRank(currentAuthority)>authorityRank(authority))return false;
    if(String(field.value||'')===next&&currentAuthority===authority)return false;
    field.value=next;
    field.dataset.invoiceAuthority=authority;
    field.dataset.invoiceAutoFilled='true';
    field.dispatchEvent(new Event('input',{bubbles:true}));
    field.dispatchEvent(new Event('change',{bubbles:true}));
    return true;
  }

  function setBlankField(field,value){
    return setFieldByAuthority(field,value,'structured-qr',{onlyIfEmpty:true});
  }

  function resetAutomaticInvoiceFields(form){
    if(!form)return;
    for(const name of MANAGED_FIELDS){
      const field=form.elements?.[name];
      if(!field||fieldAuthority(field)==='manual')continue;
      const defaultValue=String(field.dataset.invoiceDefault??'');
      if(String(field.value||'')!==defaultValue){
        field.value=defaultValue;
        field.dispatchEvent(new Event('input',{bubbles:true}));
        field.dispatchEvent(new Event('change',{bubbles:true}));
      }
      field.dataset.invoiceAuthority=defaultValue?'form-default':'empty';
      delete field.dataset.invoiceAutoFilled;
      field.removeAttribute('data-invoice-review');
    }
    delete form.dataset.invoiceQrVerified;
    delete form.dataset.invoiceOcrRules;
    syncReviewFields(form);
  }

  function reviewFieldNames(form){
    if(!form)return [];
    return ['provider','category','dueDate','method'].filter(name=>{
      const field=form.elements?.[name];
      if(!field)return false;
      return ['empty','form-default','structured-placeholder'].includes(fieldAuthority(field));
    });
  }

  function syncReviewFields(form){
    if(!form)return [];
    const review=reviewFieldNames(form);
    form.dataset.invoiceReviewFields=review.join(',');
    for(const name of ['provider','category','dueDate','method']){
      const field=form.elements?.[name];
      if(!field)continue;
      if(review.includes(name))field.dataset.invoiceReview='true';
      else field.removeAttribute('data-invoice-review');
    }
    return review;
  }

  function requiredInvoiceFieldsReady(form){
    const title=String(form?.elements?.title?.value||'').trim();
    const amount=String(form?.elements?.amount?.value||'').trim();
    const category=String(form?.elements?.category?.value||'').trim();
    const dueDate=String(form?.elements?.dueDate?.value||'').trim();
    return Boolean(title&&amount&&category&&dueDate);
  }

  function applyInvoiceToForm(options={}){
    const form=document.querySelector('#billForm');
    const data=pendingInvoice;
    if(!form||!data||String(form.elements.id?.value||''))return {applied:false,ready:false,changed:[]};

    const changed=[];
    if(setBlankField(form.elements.title,clean(`Fatura ${data.documentId}`,80)))changed.push('Descrição');
    if(setBlankField(form.elements.provider,`NIF ${data.issuerNif}`))changed.push('Fornecedor');
    if(data.totalCents>0&&setBlankField(form.elements.amount,(data.totalCents/100).toFixed(2).replace('.',',')))changed.push('Valor total');
    if(setBlankField(form.elements.reference,clean([data.documentId,data.atcud?`ATCUD ${data.atcud}`:''].filter(Boolean).join(' · '),160)))changed.push('Referência');

    form.dataset.invoiceQrVerified='true';
    form.dataset.invoiceReviewFields='provider,category,dueDate,method';
    const ready=requiredInvoiceFieldsReady(form);

    if(options.announce!==false){
      const changedText=changed.length?changed.join(', '):'os campos compatíveis';
      status(ready
        ?`${changedText} preenchidos a partir do QR. Os campos obrigatórios estão preenchidos; confirme categoria, vencimento, método e o nome do fornecedor antes de guardar.`
        :`${changedText} preenchidos a partir do QR. Ainda existem campos obrigatórios por completar antes de guardar.`,
        ready?'success':'warning');
    }

    if(options.focus!==false)form.elements.title?.focus?.({preventScroll:true});
    return {applied:true,ready,changed};
  }

  function showPreview(data){
    pendingInvoice=data;
    const applied=applyInvoiceToForm({announce:false,focus:false});
    const node=document.querySelector('#invoiceCapturePreview');
    if(!node)return;
    node.innerHTML=previewHtml(data);
    node.hidden=false;
    status(applied.ready
      ?'QR reconhecido. Descrição, valor e restantes dados compatíveis foram preenchidos automaticamente. Confirme categoria, vencimento, método e fornecedor.'
      :'QR reconhecido e dados compatíveis preenchidos. Complete os campos obrigatórios em falta antes de guardar.',
      applied.ready?'success':'warning');
  }

  function captureUiHtml(){
    return `<section class="invoice-capture full-row" data-invoice-capture data-invoice-mode="manual" aria-labelledby="invoiceCaptureTitle">
      <div class="invoice-capture-head">
        <span class="invoice-capture-mark" data-invoice-mode-mark aria-hidden="true">${icon('receipt',22)}</span>
        <div><strong id="invoiceCaptureTitle" data-invoice-mode-title>Ler dados da fatura</strong><small data-invoice-mode-subtitle>Código QR da Autoridade Tributária</small></div>
      </div>
      <p data-invoice-mode-description>Escolha “Ler fatura” para selecionar uma fotografia ou “QR Code” para utilizar a câmara.</p>
      <div class="invoice-capture-actions">
        <button class="btn secondary" type="button" data-invoice-camera>${icon('qr',19)}<span data-invoice-camera-label>Abrir câmara</span></button>
        <label class="btn secondary file-btn invoice-image-button">${icon('image',19)}<span data-invoice-image-label>Selecionar imagem</span><input id="invoiceImageInput" type="file" accept="image/*" hidden></label>
      </div>
      <p id="invoiceCaptureStatus" class="invoice-capture-status" role="status" aria-live="polite" hidden></p>
      <div id="invoiceCapturePreview" class="invoice-capture-preview" hidden></div>
    </section>`;
  }

  function ensureCaptureUi(){
    const form=document.querySelector('#billForm');
    if(!form)return;
    const existing=form.querySelector('[data-invoice-capture]');
    if(existing){syncCaptureMode();prewarmZxing();return;}
    if(String(form.elements.id?.value||''))return;
    const wrapper=document.createElement('div');
    wrapper.innerHTML=captureUiHtml();
    const section=wrapper.firstElementChild;
    const first=form.querySelector('label');
    form.insertBefore(section,first||form.firstChild);
    syncCaptureMode();
    prewarmZxing();
  }

  function stopScanner(){
    scannerSession+=1;
    scannerBusy=false;
    try{scannerControls?.stop?.();}catch(_error){}
    scannerControls=null;
    const video=document.querySelector('#invoiceQrVideo');
    const stream=video?.srcObject;
    if(stream&&typeof stream.getTracks==='function')stream.getTracks().forEach(track=>{try{track.stop();}catch(_error){}});
    if(video)video.srcObject=null;
  }

  function closeScanner(restoreFocus=true){
    stopScanner();
    document.querySelector('[data-invoice-scanner-overlay]')?.remove();
    if(restoreFocus)document.querySelector('[data-invoice-camera]')?.focus({preventScroll:true});
  }

  function scannerHtml(){
    return `<div class="invoice-scan-overlay" data-invoice-scanner-overlay role="region" aria-label="Leitor QR da fatura">
      <div class="invoice-scan-panel">
        <div class="invoice-scan-head"><div><strong>Ler QR da fatura</strong><small>Fatura portuguesa · AT</small></div><button class="invoice-scan-close" type="button" data-invoice-scanner-close aria-label="Fechar leitor">${icon('close',21)}</button></div>
        <div class="invoice-scan-camera"><video id="invoiceQrVideo" autoplay muted playsinline aria-label="Pré-visualização da câmara"></video><div class="invoice-scan-guide" aria-hidden="true"><span></span></div><div id="invoiceScanState" class="invoice-scan-state" role="status">A preparar a câmara…</div></div>
        <p>Aponte para o código QR impresso na fatura. Nenhum fotograma é guardado ou transmitido.</p>
        <div class="invoice-scan-actions"><button class="btn secondary invoice-scan-torch" type="button" data-invoice-torch hidden aria-pressed="false">${icon('flash',18)}<span>Lanterna</span></button><button class="btn secondary" type="button" data-invoice-scanner-close>Cancelar</button></div>
      </div>
    </div>`;
  }

  function handleDecodedPayload(text,session){
    if(scannerBusy||session!==scannerSession)return false;
    const data=parseAtInvoiceQr(text);
    if(!data)return false;
    scannerBusy=true;
    closeScanner(false);
    showPreview(data);
    return true;
  }

  async function openCamera(){
    ensureCaptureUi();
    if(currentCaptureMode()!=='qr')return;
    if(!root.isSecureContext||!navigator.mediaDevices?.getUserMedia){
      status('A leitura pela câmara exige HTTPS e um navegador com acesso à câmara.','warning');
      return;
    }
    closeScanner(false);
    document.querySelector('#formDialog .dialog-shell')?.insertAdjacentHTML('beforeend',scannerHtml());
    const session=scannerSession;
    const video=document.querySelector('#invoiceQrVideo');
    const state=document.querySelector('#invoiceScanState');
    try{
      const zxing=await loadZxing();
      if(session!==scannerSession)return;
      const reader=new zxing.BrowserQRCodeReader(undefined,{delayBetweenScanAttempts:120,delayBetweenScanSuccess:800});
      const controls=await reader.decodeFromConstraints({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}}},video,(result)=>{
        const text=result?.getText?.()||result?.text||'';
        if(text&&handleDecodedPayload(text,session))try{controls.stop?.();}catch(_error){}
      });
      if(session!==scannerSession){controls.stop?.();return;}
      scannerControls=controls;
      const torch=document.querySelector('[data-invoice-torch]');
      if(torch&&typeof controls.switchTorch==='function')torch.hidden=false;
      if(state)state.textContent='Aponte para o QR da fatura';
    }catch(error){
      if(session!==scannerSession)return;
      closeScanner(false);
      const name=String(error?.name||'');
      const message=name==='NotAllowedError'||name==='SecurityError'
        ?'A câmara não foi autorizada. Permita o acesso nas definições do navegador e tente novamente.'
        :name==='NotFoundError'||name==='DevicesNotFoundError'
          ?'Não foi encontrada uma câmara neste dispositivo.'
          :'Não foi possível iniciar o leitor QR da fatura.';
      status(message,'warning');
    }
  }

  function withDecodeTimeout(promise,timeoutMs=QR_IMAGE_DECODE_TIMEOUT_MS){
    let timer=0;
    const timeout=new Promise((_,reject)=>{
      timer=setTimeout(()=>reject(new Error('QR_IMAGE_DECODE_TIMEOUT')),timeoutMs);
    });
    return Promise.race([Promise.resolve(promise),timeout]).finally(()=>clearTimeout(timer));
  }

  async function decodeQrFromImage(file,objectUrl){
    if(typeof root.BarcodeDetector==='function'&&typeof root.createImageBitmap==='function'){
      let bitmap=null;
      try{
        const detector=new root.BarcodeDetector({formats:['qr_code']});
        bitmap=await root.createImageBitmap(file);
        const detected=await withDecodeTimeout(detector.detect(bitmap));
        const raw=detected?.find?.(item=>String(item?.rawValue||'').trim())?.rawValue||detected?.[0]?.rawValue||'';
        if(raw)return String(raw);
      }catch(_error){
        /* Fallback ZXing abaixo. */
      }finally{
        try{bitmap?.close?.();}catch(_error){}
      }
    }

    const zxing=await loadZxing();
    const reader=new zxing.BrowserQRCodeReader();
    const result=await withDecodeTimeout(reader.decodeFromImageUrl(objectUrl));
    return result?.getText?.()||result?.text||'';
  }

  async function scanImage(file,requestedMode=currentCaptureMode()){
    if(!file)return;
    const mode=requestedMode==='qr'?'qr':'image';
    if(!String(file.type||'').startsWith('image/')){
      status(mode==='qr'?'Capture uma fotografia do QR da fatura.':'Selecione uma imagem da fatura. PDFs não são processados nesta versão.','warning');
      return;
    }
    if(file.size<=0||file.size>MAX_IMAGE_BYTES){
      status('A imagem deve ter no máximo 15 MB.','warning');
      return;
    }

    ensureCaptureUi();
    syncCaptureMode(mode);
    status(mode==='qr'?'A ler o QR captado pela câmara…':'A procurar o QR da AT na imagem local…');

    const objectUrl=URL.createObjectURL(file);
    try{
      const text=await decodeQrFromImage(file,objectUrl);
      const data=parseAtInvoiceQr(text);
      if(!data){
        status(mode==='qr'
          ?'A fotografia não contém um QR de faturação AT legível. Aproxime a câmara do código e tente novamente.'
          :'Foi encontrado um código, mas não corresponde ao formato QR de faturação da AT.','warning');
        return;
      }
      showPreview(data);
    }catch(_error){
      status(mode==='qr'
        ?'Não foi possível ler o QR nesta fotografia. Tente novamente com o código mais próximo e bem iluminado.'
        :'Não foi possível encontrar um QR de faturação legível nesta imagem. Tente uma fotografia mais nítida.','warning');
    }finally{
      URL.revokeObjectURL(objectUrl);
    }
  }

  function toggleTorch(){
    if(typeof scannerControls?.switchTorch!=='function')return;
    const button=document.querySelector('[data-invoice-torch]');
    const next=button?.getAttribute('aria-pressed')!=='true';
    Promise.resolve(scannerControls.switchTorch()).then(()=>button?.setAttribute('aria-pressed',String(next))).catch(()=>status('A lanterna não está disponível nesta câmara.','warning'));
  }

  function handleClick(event){
    if(event.target.closest?.('[data-invoice-camera]')){
      event.preventDefault();
      if(currentCaptureMode()==='qr')openCamera().catch(()=>status('Não foi possível abrir a câmara.','warning'));
      return;
    }
    if(event.target.closest?.('[data-invoice-scanner-close]')){event.preventDefault();closeScanner();return;}
    if(event.target.closest?.('[data-invoice-torch]')){event.preventDefault();toggleTorch();return;}
    if(event.target.closest?.('[data-invoice-apply]')){event.preventDefault();applyInvoiceToForm();}
  }

  function handleChange(event){
    const input=event.target;
    if(!(input instanceof HTMLInputElement)||input.type!=='file')return;

    let mode='';
    if(input.id==='invoiceImageInput')mode='image';
    else if(input.matches('[data-v75-native-invoice]'))mode=input.dataset.v75NativeInvoice||'';
    else return;

    if(!['image','qr'].includes(mode)){input.value='';return;}
    const file=input.files?.[0]||null;
    if(!file){input.value='';return;}

    scanImage(file,mode).finally(()=>{input.value='';});
  }

  function focusManualField(){
    const form=document.querySelector('#billForm');
    const title=form?.elements?.title;
    if(!title||typeof title.focus!=='function')return;
    requestAnimationFrame(()=>title.focus({preventScroll:true}));
  }

  function activateMode(mode){
    ensureCaptureUi();
    closeScanner(false);
    syncCaptureMode(mode);
    if(document.querySelector('#invoiceCapturePreview')?.hidden!==false)status('');
    if(mode==='manual'){focusManualField();return;}
    if(mode==='image'){
      const input=document.querySelector('#invoiceImageInput');
      if(!input){status('Não foi possível abrir o seletor da fatura.','warning');return;}
      input.value='';
      input.click();
      return;
    }
    if(mode==='qr')openCamera().catch(()=>status('Não foi possível abrir a câmara.','warning'));
  }

  function handleModeChange(event){
    const mode=event.detail?.mode||currentCaptureMode();
    const normalized=mode==='image'||mode==='qr'?mode:'manual';
    if(event.detail?.native){
      ensureCaptureUi();
      closeScanner(false);
      syncCaptureMode(normalized);
      if(document.querySelector('#invoiceCapturePreview')?.hidden!==false)status('');
      return;
    }
    activateMode(normalized);
  }

  function installDom(){
    document.addEventListener('click',handleClick);
    document.addEventListener('change',handleChange);
    document.addEventListener('cdc:bill-mode-change',handleModeChange);
    observer=new MutationObserver(()=>{ensureCaptureUi();syncCaptureMode();});
    const body=document.body;
    if(body)observer.observe(body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-v75-bill-mode','open']});
    ensureCaptureUi();
    document.addEventListener('visibilitychange',()=>{if(document.hidden)closeScanner(false);});
    root.addEventListener('pagehide',()=>closeScanner(false));
  }

  root.CDCInvoiceCapture=Object.freeze({parseAtInvoiceQr,parseMoneyCents,parseAtDate,syncCaptureMode,currentCaptureMode,scanImage});
  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installDom,{once:true});
    else installDom();
  }
})(typeof window!=='undefined'?window:globalThis);

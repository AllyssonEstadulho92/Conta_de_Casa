'use strict';

/* Conta de Casa — captura assistida de faturas portuguesas.
 * Lê o Código QR definido pela AT a partir da câmara ou de uma imagem local.
 * O ficheiro/imagem nunca é guardado; os dados só preenchem o formulário após confirmação.
 */
(function installInvoiceCapture(root){
  const MAX_IMAGE_BYTES=15*1024*1024;
  const ZXING_LOAD_TIMEOUT_MS=12000;
  let observer=null;
  let scannerControls=null;
  let scannerSession=0;
  let scannerBusy=false;
  let pendingInvoice=null;
  let zxingPromise=null;

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

  function readerSource(){
    const value=document.querySelector('meta[name="barcode-reader-src"]')?.content?.trim()||'';
    try{
      const url=new URL(value,location.href);
      if(url.protocol!=='https:'||url.hostname!=='unpkg.com')return '';
      if(!/@zxing\/browser@0\.2\.0\/umd\/zxing-browser\.min\.js$/.test(url.pathname))return '';
      return url.href;
    }catch(_error){return '';}
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
    return `<div class="invoice-capture-preview-head"><div>${icon('check',18)}<strong>QR de fatura reconhecido</strong></div><button class="btn primary" type="button" data-invoice-apply>Preencher campos</button></div>
      <div class="invoice-capture-preview-grid">
        <span><small>NIF emitente</small><strong>${escapeHtml(data.issuerNif)}</strong></span>
        <span><small>Documento</small><strong>${escapeHtml(data.documentId)}</strong></span>
        <span><small>Data do documento</small><strong>${escapeHtml(data.documentDate.split('-').reverse().join('/'))}</strong></span>
        <span><small>Total</small><strong>${escapeHtml(centsText(data.totalCents))}</strong></span>
        ${atcud}${tax}
      </div>
      <small class="invoice-capture-review-note">Confirme o fornecedor e o vencimento antes de guardar. O QR identifica o documento e o total, mas não contém o nome comercial do fornecedor nem a data limite de pagamento.</small>`;
  }

  function showPreview(data){
    pendingInvoice=data;
    const node=document.querySelector('#invoiceCapturePreview');
    if(!node)return;
    node.innerHTML=previewHtml(data);
    node.hidden=false;
    status('Dados lidos localmente. Reveja a pré-visualização e escolha “Preencher campos”.','success');
  }

  function applyInvoiceToForm(){
    const form=document.querySelector('#billForm');
    const data=pendingInvoice;
    if(!form||!data||String(form.elements.id?.value||''))return;
    const title=form.elements.title;
    const provider=form.elements.provider;
    const amount=form.elements.amount;
    const reference=form.elements.reference;
    if(title&&!title.value.trim())title.value=clean(`Fatura ${data.documentId}`,80);
    if(provider&&!provider.value.trim())provider.value=`NIF ${data.issuerNif}`;
    if(amount&&!amount.value.trim()&&data.totalCents>0)amount.value=(data.totalCents/100).toFixed(2).replace('.',',');
    if(reference&&!reference.value.trim()){
      reference.value=clean([data.documentId,data.atcud?`ATCUD ${data.atcud}`:''].filter(Boolean).join(' · '),160);
    }
    form.dataset.invoiceQrVerified='true';
    status('Campos compatíveis preenchidos. Confirme o nome do fornecedor, categoria, vencimento e método antes de guardar.','success');
    title?.focus({preventScroll:true});
  }

  function captureUiHtml(){
    return `<section class="invoice-capture full-row" data-invoice-capture aria-labelledby="invoiceCaptureTitle">
      <div class="invoice-capture-head">
        <span class="invoice-capture-mark" aria-hidden="true">${icon('receipt',22)}</span>
        <div><strong id="invoiceCaptureTitle">Ler dados da fatura</strong><small>Código QR da Autoridade Tributária</small></div>
      </div>
      <p>Use a câmara ou selecione uma imagem da fatura. A leitura acontece neste dispositivo; a imagem não é guardada nem enviada.</p>
      <div class="invoice-capture-actions">
        <button class="btn secondary" type="button" data-invoice-camera>${icon('qr',19)}<span>Ler QR com câmara</span></button>
        <label class="btn secondary file-btn invoice-image-button">${icon('image',19)}<span>Ler imagem da fatura</span><input id="invoiceImageInput" type="file" accept="image/*" hidden></label>
      </div>
      <p id="invoiceCaptureStatus" class="invoice-capture-status" role="status" aria-live="polite" hidden></p>
      <div id="invoiceCapturePreview" class="invoice-capture-preview" hidden></div>
    </section>`;
  }

  function ensureCaptureUi(){
    const form=document.querySelector('#billForm');
    if(!form||form.querySelector('[data-invoice-capture]'))return;
    if(String(form.elements.id?.value||''))return;
    const wrapper=document.createElement('div');
    wrapper.innerHTML=captureUiHtml();
    const section=wrapper.firstElementChild;
    const first=form.querySelector('label');
    form.insertBefore(section,first||form.firstChild);
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

  function closeScanner(){
    stopScanner();
    document.querySelector('[data-invoice-scanner-overlay]')?.remove();
    document.querySelector('[data-invoice-camera]')?.focus({preventScroll:true});
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
    closeScanner();
    showPreview(data);
    return true;
  }

  async function openCamera(){
    ensureCaptureUi();
    if(!root.isSecureContext||!navigator.mediaDevices?.getUserMedia){
      status('A leitura pela câmara exige HTTPS e um navegador com acesso à câmara.','warning');
      return;
    }
    closeScanner();
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
      closeScanner();
      const name=String(error?.name||'');
      const message=name==='NotAllowedError'||name==='SecurityError'
        ?'A câmara não foi autorizada. Permita o acesso nas definições do navegador e tente novamente.'
        :name==='NotFoundError'||name==='DevicesNotFoundError'
          ?'Não foi encontrada uma câmara neste dispositivo.'
          :'Não foi possível iniciar o leitor QR da fatura.';
      status(message,'warning');
    }
  }

  async function scanImage(file){
    if(!file)return;
    if(!String(file.type||'').startsWith('image/')){status('Selecione uma imagem da fatura. PDFs não são processados nesta versão.','warning');return;}
    if(file.size<=0||file.size>MAX_IMAGE_BYTES){status('A imagem deve ter no máximo 15 MB.','warning');return;}
    status('A analisar o QR da imagem local…');
    const objectUrl=URL.createObjectURL(file);
    try{
      const zxing=await loadZxing();
      const reader=new zxing.BrowserQRCodeReader();
      const result=await reader.decodeFromImageUrl(objectUrl);
      const text=result?.getText?.()||result?.text||'';
      const data=parseAtInvoiceQr(text);
      if(!data){status('Foi encontrado um código, mas não corresponde ao formato QR de faturação da AT.','warning');return;}
      showPreview(data);
    }catch(_error){
      status('Não foi possível encontrar um QR de faturação legível nesta imagem. Tente uma fotografia mais nítida.','warning');
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
    if(event.target.closest?.('[data-invoice-camera]')){event.preventDefault();openCamera().catch(()=>status('Não foi possível abrir a câmara.','warning'));return;}
    if(event.target.closest?.('[data-invoice-scanner-close]')){event.preventDefault();closeScanner();return;}
    if(event.target.closest?.('[data-invoice-torch]')){event.preventDefault();toggleTorch();return;}
    if(event.target.closest?.('[data-invoice-apply]')){event.preventDefault();applyInvoiceToForm();}
  }

  function handleChange(event){
    if(event.target?.id!=='invoiceImageInput')return;
    const file=event.target.files?.[0]||null;
    scanImage(file).finally(()=>{event.target.value='';});
  }

  function installDom(){
    document.addEventListener('click',handleClick);
    document.addEventListener('change',handleChange);
    observer=new MutationObserver(()=>ensureCaptureUi());
    const body=document.body;
    if(body)observer.observe(body,{childList:true,subtree:true});
    ensureCaptureUi();
    document.addEventListener('visibilitychange',()=>{if(document.hidden)closeScanner();});
    root.addEventListener('pagehide',closeScanner);
  }

  root.CDCInvoiceCapture=Object.freeze({parseAtInvoiceQr,parseMoneyCents,parseAtDate});
  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installDom,{once:true});
    else installDom();
  }
})(typeof window!=='undefined'?window:globalThis);

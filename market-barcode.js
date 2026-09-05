'use strict';

/* Conta de Casa — leitura de códigos de barras para identificação de produtos.
 * A câmara é processada localmente. O código lido é enviado ao Open Food Facts
 * apenas para identificar o produto; os preços continuam a ser obtidos pelo
 * fluxo de pesquisa do Mercado através de cesta.pt.
 */
(function marketBarcodeScanner(){
  const DIALOG_SELECTOR='#formDialog[data-mode="market-browser"]';
  const ZXING_URL='https://unpkg.com/@zxing/browser@0.2.0/umd/zxing-browser.min.js';
  const OFF_PRODUCT_URL='https://world.openfoodfacts.org/api/v2/product/';
  const LOOKUP_TIMEOUT_MS=9000;
  const LIBRARY_TIMEOUT_MS=12000;
  const ACCEPTED_LENGTHS=new Set([8,12,13,14]);

  let observer=null;
  let scannerControls=null;
  let lookupController=null;
  let scannerSession=0;
  let processingResult=false;
  let zxingPromise=null;

  const cleanText=(value,max=120)=>String(value??'')
    .replace(/[\u0000-\u001f\u007f]/g,' ')
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,max);

  function cameraIcon(){
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5 7.5 7H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2.5L15 5H9Z"/><circle cx="12" cy="13" r="3.5"/></svg>';
  }

  function closeIcon(){
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  }

  function flashIcon(){
    return '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 5 14h6l-1 8 9-13h-6V2Z"/></svg>';
  }

  function statusHtml(){
    return '<div id="marketBarcodeStatus" class="market-barcode-status" role="status" aria-live="polite" hidden></div>';
  }

  function ensureBarcodeUi(){
    const dialog=document.querySelector(DIALOG_SELECTOR);
    if(!dialog)return;
    const search=dialog.querySelector('.market-browser-search');
    if(!search)return;

    if(!search.querySelector('[data-market-barcode-open]')){
      const clear=search.querySelector('[data-market-search-clear]');
      const button=document.createElement('button');
      button.type='button';
      button.className='market-barcode-open';
      button.dataset.marketBarcodeOpen='';
      button.setAttribute('aria-label','Ler código de barras com a câmara');
      button.setAttribute('title','Ler código de barras');
      button.innerHTML=cameraIcon();
      if(clear)search.insertBefore(button,clear);
      else search.appendChild(button);
      search.classList.add('has-barcode-action');
    }

    const row=dialog.querySelector('.market-browser-search-row');
    if(row&&!dialog.querySelector('#marketBarcodeStatus'))row.insertAdjacentHTML('afterend',statusHtml());
  }

  function setBarcodeStatus(message,tone='normal'){
    const root=document.querySelector(`${DIALOG_SELECTOR} #marketBarcodeStatus`);
    if(!root)return;
    const text=cleanText(message,240);
    root.hidden=!text;
    root.className=`market-barcode-status ${tone}`;
    root.textContent=text;
  }

  function normalizeGtin(raw){
    return String(raw??'').replace(/\D/g,'').slice(0,14);
  }

  function validGtinChecksum(code){
    const value=normalizeGtin(code);
    if(!ACCEPTED_LENGTHS.has(value.length))return false;
    let sum=0;
    let weight=3;
    for(let index=value.length-2;index>=0;index-=1){
      sum+=Number(value[index])*weight;
      weight=weight===3?1:3;
    }
    const expected=(10-(sum%10))%10;
    return expected===Number(value[value.length-1]);
  }

  function cameraErrorMessage(error){
    const name=String(error?.name||'');
    if(name==='NotAllowedError'||name==='SecurityError')return 'A câmara não foi autorizada. Permita o acesso à câmara nas definições do navegador e tente novamente.';
    if(name==='NotFoundError'||name==='DevicesNotFoundError')return 'Não foi encontrada uma câmara disponível neste dispositivo.';
    if(name==='NotReadableError'||name==='TrackStartError')return 'A câmara está ocupada por outra aplicação ou não pôde ser iniciada.';
    if(name==='OverconstrainedError')return 'A câmara deste dispositivo não suporta a configuração pedida.';
    return 'Não foi possível iniciar a leitura pela câmara.';
  }

  function scannerOverlayHtml(){
    return `<div class="market-barcode-overlay" data-market-barcode-overlay role="region" aria-label="Leitor de código de barras">
      <div class="market-barcode-panel">
        <div class="market-barcode-head">
          <div><strong>Ler código de barras</strong><span>EAN / UPC / GTIN</span></div>
          <button class="market-barcode-close" type="button" data-market-barcode-close aria-label="Fechar leitor">${closeIcon()}</button>
        </div>
        <div class="market-barcode-camera">
          <video id="marketBarcodeVideo" autoplay muted playsinline aria-label="Pré-visualização da câmara"></video>
          <div class="market-barcode-guide" aria-hidden="true"><span></span></div>
          <div class="market-barcode-camera-state" id="marketBarcodeCameraState" role="status">A preparar a câmara…</div>
        </div>
        <p class="market-barcode-help">Aponte a câmara para as barras e mantenha o código dentro da moldura. O vídeo não é guardado nem enviado.</p>
        <div class="market-barcode-actions">
          <button class="btn secondary market-barcode-torch" type="button" data-market-barcode-torch hidden aria-pressed="false">${flashIcon()}<span>Lanterna</span></button>
          <button class="btn secondary" type="button" data-market-barcode-close>Cancelar</button>
        </div>
      </div>
    </div>`;
  }

  function renderScanner(){
    const dialog=document.querySelector(DIALOG_SELECTOR);
    if(!dialog)return null;
    stopScanner();
    dialog.querySelector('[data-market-barcode-overlay]')?.remove();
    dialog.querySelector('.dialog-shell')?.insertAdjacentHTML('beforeend',scannerOverlayHtml());
    return dialog.querySelector('#marketBarcodeVideo');
  }

  function stopScanner(){
    scannerSession+=1;
    processingResult=false;
    lookupController?.abort();
    lookupController=null;
    try{scannerControls?.stop?.();}catch(_error){}
    scannerControls=null;
    const video=document.querySelector('#marketBarcodeVideo');
    const stream=video?.srcObject;
    if(stream&&typeof stream.getTracks==='function')stream.getTracks().forEach(track=>{try{track.stop();}catch(_error){}});
    if(video)video.srcObject=null;
  }

  function closeScanner({keepStatus=true}={}){
    stopScanner();
    document.querySelector(`${DIALOG_SELECTOR} [data-market-barcode-overlay]`)?.remove();
    if(!keepStatus)setBarcodeStatus('');
    document.querySelector(`${DIALOG_SELECTOR} #marketCatalogSearch`)?.focus({preventScroll:true});
  }

  function loadZxing(){
    if(window.ZXingBrowser?.BrowserMultiFormatReader)return Promise.resolve(window.ZXingBrowser);
    if(zxingPromise)return zxingPromise;
    zxingPromise=new Promise((resolve,reject)=>{
      const existing=document.querySelector('script[data-market-zxing]');
      if(existing){
        const finish=()=>window.ZXingBrowser?.BrowserMultiFormatReader?resolve(window.ZXingBrowser):reject(new Error('zxing-unavailable'));
        existing.addEventListener('load',finish,{once:true});
        existing.addEventListener('error',()=>reject(new Error('zxing-load-failed')),{once:true});
        setTimeout(finish,250);
        return;
      }
      const script=document.createElement('script');
      script.src=ZXING_URL;
      script.async=true;
      script.dataset.marketZxing='';
      script.referrerPolicy='no-referrer';
      const timer=setTimeout(()=>reject(new Error('zxing-timeout')),LIBRARY_TIMEOUT_MS);
      script.addEventListener('load',()=>{
        clearTimeout(timer);
        if(window.ZXingBrowser?.BrowserMultiFormatReader)resolve(window.ZXingBrowser);
        else reject(new Error('zxing-unavailable'));
      },{once:true});
      script.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('zxing-load-failed'));},{once:true});
      document.head.appendChild(script);
    }).catch(error=>{zxingPromise=null;throw error;});
    return zxingPromise;
  }

  async function lookupBarcodeProduct(code,signal){
    const url=new URL(`${OFF_PRODUCT_URL}${encodeURIComponent(code)}.json`);
    url.searchParams.set('fields','code,product_name,product_name_pt,brands,quantity');
    const controller=new AbortController();
    const abort=()=>controller.abort();
    if(signal){
      if(signal.aborted)controller.abort();
      else signal.addEventListener('abort',abort,{once:true});
    }
    const timer=setTimeout(()=>controller.abort(),LOOKUP_TIMEOUT_MS);
    try{
      const response=await fetch(url.href,{method:'GET',headers:{Accept:'application/json'},cache:'no-store',signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});
      if(response.status===404)return null;
      if(!response.ok)throw new Error(`off-http-${response.status}`);
      const payload=await response.json();
      if(Number(payload?.status)!==1||!payload?.product)return null;
      const product=payload.product;
      const name=cleanText(product.product_name_pt||product.product_name,100);
      const brand=cleanText(product.brands,70).split(',')[0].trim();
      const quantity=cleanText(product.quantity,40);
      if(!name&&!brand)return null;
      return {code,name,brand,quantity};
    }finally{
      clearTimeout(timer);
      signal?.removeEventListener?.('abort',abort);
    }
  }

  function buildMarketQuery(product){
    const parts=[];
    if(product?.brand)parts.push(product.brand);
    if(product?.name&&!parts.some(part=>part.toLocaleLowerCase('pt-PT')===product.name.toLocaleLowerCase('pt-PT')))parts.push(product.name);
    return cleanText(parts.join(' '),80);
  }

  function triggerMarketSearch(product,code){
    const input=document.querySelector(`${DIALOG_SELECTOR} #marketCatalogSearch`);
    if(!input)return false;
    const term=buildMarketQuery(product);
    input.value=term||code;
    input.dispatchEvent(new Event('input',{bubbles:true}));
    return true;
  }

  async function resolveScan(rawCode,session){
    if(processingResult||session!==scannerSession)return;
    const code=normalizeGtin(rawCode);
    if(!validGtinChecksum(code))return;
    processingResult=true;
    const state=document.querySelector('#marketBarcodeCameraState');
    if(state)state.textContent=`Código ${code} lido. A identificar o produto…`;
    try{scannerControls?.stop?.();}catch(_error){}
    scannerControls=null;

    lookupController?.abort();
    lookupController=new AbortController();
    try{
      const product=await lookupBarcodeProduct(code,lookupController.signal);
      if(session!==scannerSession)return;
      closeScanner();
      if(!product){
        setBarcodeStatus(`Código ${code} lido, mas o produto não foi identificado na base de produtos. Pode pesquisar pelo nome manualmente.`,'warning');
        return;
      }
      const detail=[product.brand,product.name,product.quantity].filter(Boolean).join(' · ');
      setBarcodeStatus(`Código ${code}: ${detail}. A pesquisar preço no Pingo Doce e Continente…`,'success');
      if(!triggerMarketSearch(product,code))setBarcodeStatus('Produto identificado, mas a pesquisa do Mercado não está disponível neste momento.','warning');
    }catch(error){
      if(error?.name==='AbortError')return;
      if(session!==scannerSession)return;
      closeScanner();
      setBarcodeStatus(`Código ${code} lido, mas não foi possível identificar o produto agora. Verifique a ligação e tente novamente.`,'warning');
    }finally{
      processingResult=false;
      lookupController=null;
    }
  }

  function setupTorch(controls){
    const button=document.querySelector('[data-market-barcode-torch]');
    if(!button||typeof controls?.switchTorch!=='function')return;
    button.hidden=false;
  }

  async function openScanner(){
    ensureBarcodeUi();
    if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){
      setBarcodeStatus('A leitura pela câmara exige uma ligação HTTPS e um navegador com acesso à câmara.','warning');
      return;
    }
    setBarcodeStatus('');
    const video=renderScanner();
    if(!video)return;
    const session=scannerSession;
    const state=document.querySelector('#marketBarcodeCameraState');
    try{
      const zxing=await loadZxing();
      if(session!==scannerSession)return;
      const reader=new zxing.BrowserMultiFormatReader(undefined,{delayBetweenScanAttempts:120,delayBetweenScanSuccess:800});
      const controls=await reader.decodeFromConstraints({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}}},video,(result)=>{
        const text=result?.getText?.()||result?.text||'';
        if(text)resolveScan(text,session).catch(()=>{});
      });
      if(session!==scannerSession){controls.stop?.();return;}
      scannerControls=controls;
      setupTorch(controls);
      if(state)state.textContent='Aponte para o código de barras';
    }catch(error){
      if(session!==scannerSession)return;
      closeScanner();
      const loadFailure=String(error?.message||'').startsWith('zxing-');
      setBarcodeStatus(loadFailure?'O leitor de código de barras não pôde ser carregado. Verifique a ligação e tente novamente.':cameraErrorMessage(error),'warning');
    }
  }

  function toggleTorch(){
    if(typeof scannerControls?.switchTorch!=='function')return;
    const button=document.querySelector('[data-market-barcode-torch]');
    const next=button?.getAttribute('aria-pressed')!=='true';
    try{
      const result=scannerControls.switchTorch();
      Promise.resolve(result).then(()=>{
        if(button)button.setAttribute('aria-pressed',String(next));
      }).catch(()=>setBarcodeStatus('A lanterna não está disponível nesta câmara.','warning'));
    }catch(_error){setBarcodeStatus('A lanterna não está disponível nesta câmara.','warning');}
  }

  function handleClick(event){
    if(event.target.closest?.('[data-market-barcode-open]')){event.preventDefault();openScanner().catch(()=>setBarcodeStatus('Não foi possível abrir o leitor de código de barras.','warning'));return;}
    if(event.target.closest?.('[data-market-barcode-close]')){event.preventDefault();closeScanner({keepStatus:true});return;}
    if(event.target.closest?.('[data-market-barcode-torch]')){event.preventDefault();toggleTorch();}
  }

  function observeMarketDialog(){
    const dialog=document.querySelector('#formDialog');
    if(!dialog||observer)return;
    observer=new MutationObserver(()=>ensureBarcodeUi());
    observer.observe(dialog,{subtree:true,childList:true,attributes:true,attributeFilter:['data-mode']});
    dialog.addEventListener('close',()=>{stopScanner();dialog.querySelector('[data-market-barcode-overlay]')?.remove();});
    ensureBarcodeUi();
  }

  document.addEventListener('click',handleClick);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&document.querySelector('[data-market-barcode-overlay]'))closeScanner({keepStatus:true});});
  window.addEventListener('pagehide',stopScanner);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observeMarketDialog,{once:true});
  else observeMarketDialog();

  // Exposto apenas para testes de invariantes; não contém dados do utilizador.
  window.__marketBarcodeInternals=Object.freeze({normalizeGtin,validGtinChecksum,buildMarketQuery});
})();

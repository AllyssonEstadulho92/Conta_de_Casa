'use strict';

/* Conta de Casa v75 — Mercado 75-market1.
 * Camada exclusivamente de apresentação/UX sobre a lógica existente.
 * Não altera preços, quantidades, persistência, PID, scanner, sincronização ou cálculos.
 */
(function installV75MarketFlow(root){
  const REVISION='75-market1';
  const MOBILE_QUERY='(max-width: 820px)';
  const mobile=root.matchMedia?.(MOBILE_QUERY)||{matches:false,addEventListener:null};
  let observer=null;
  let scheduled=false;

  function appItem(id){
    try{
      if(typeof appState==='undefined'||!Array.isArray(appState?.market))return null;
      return appState.market.find(item=>String(item?.id)===String(id))||null;
    }catch(_error){return null;}
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    const run=()=>{scheduled=false;apply();};
    if(typeof root.requestAnimationFrame==='function')root.requestAnimationFrame(run);
    else setTimeout(run,0);
  }

  function clarifyListSearch(){
    const input=document.querySelector('#marketSearch');
    if(!input)return;
    input.placeholder='Pesquisar na minha lista…';
    input.setAttribute('aria-label','Pesquisar na minha lista de compras');
    input.dataset.marketFlowSearch='list';
  }

  function itemState(item){
    if(!item?.purchased)return {key:'pending',label:'Por comprar',valueLabel:'Estimativa total'};
    if(!(Number(item.actualCents)>0))return {key:'missing-real',label:'Preço por confirmar',valueLabel:'Estimativa provisória'};
    return {key:'purchased',label:'Comprado',valueLabel:'Total contabilizado'};
  }

  function ensureStatus(headCopy,state){
    if(!headCopy)return;
    let badge=headCopy.querySelector(':scope > .market-flow-status');
    if(!badge){
      badge=document.createElement('span');
      badge.className='market-flow-status';
      headCopy.appendChild(badge);
    }
    const className=`market-flow-status ${state.key}`;
    if(badge.className!==className)badge.className=className;
    if(badge.textContent!==state.label)badge.textContent=state.label;
  }

  function promoteRealPrice(card,state){
    const details=card.querySelector(':scope > .market-item-details');
    const real=card.querySelector('.market-mobile-real');
    if(!real||!details)return;

    real.classList.toggle('market-price-confirmation',state.key==='missing-real');
    if(state.key==='missing-real'){
      const label=real.querySelector(':scope > span');
      if(label&&label.textContent!=='Confirmar preço pago / unidade')label.textContent='Confirmar preço pago / unidade';
      const hint=real.querySelector(':scope > small');
      const hintText='Necessário para substituir a estimativa pelo valor efetivamente pago.';
      if(hint&&hint.textContent!==hintText)hint.textContent=hintText;
      if(real.parentElement===details.querySelector('.market-item-details-body'))card.insertBefore(real,details);
    }
  }

  function enhanceMobileCards(){
    if(!mobile.matches)return;
    const list=document.querySelector('#marketList');
    if(!list)return;

    list.querySelectorAll('.market-mobile-card').forEach(card=>{
      const toggle=card.querySelector('[data-market-toggle]');
      const item=appItem(toggle?.dataset?.marketToggle);
      if(!item)return;
      const state=itemState(item);
      card.dataset.marketFlowState=state.key;

      const quick=card.querySelector('.market-mobile-quick-price');
      if(quick)quick.dataset.marketValueLabel=state.valueLabel;

      const headCopy=card.querySelector('.market-mobile-head > div');
      ensureStatus(headCopy,state);
      promoteRealPrice(card,state);
    });

    list.querySelectorAll('.market-purchased-group').forEach(group=>{
      const hasMissing=Boolean(group.querySelector('.market-mobile-card[data-market-flow-state="missing-real"]'));
      group.classList.toggle('has-missing-real',hasMissing);
      if(hasMissing&&!group.open)group.open=true;
    });
  }

  function enhanceBrowser(){
    const browser=document.querySelector('.market-browser');
    if(!browser)return;

    let note=browser.querySelector('.market-flow-estimate-note');
    if(!note){
      note=document.createElement('p');
      note.className='market-flow-estimate-note';
      note.setAttribute('role','note');
      note.textContent='Preço encontrado = estimativa. Depois de comprar, confirme o preço pago na sua lista.';
      const head=browser.querySelector('.market-browser-results-head');
      if(head)head.before(note);
      else browser.appendChild(note);
    }

    browser.querySelectorAll('.market-catalog-card').forEach(card=>{
      const priceRow=card.querySelector('.market-result-price-row');
      if(priceRow&&!priceRow.querySelector('.market-flow-price-label')){
        const label=document.createElement('span');
        label.className='market-flow-price-label';
        label.textContent='Preço pesquisado';
        priceRow.prepend(label);
      }

      const add=card.querySelector('.market-add-product');
      if(add&&!add.querySelector('.market-flow-add-label')){
        const text=document.createElement('span');
        text.className='market-flow-add-label';
        text.textContent='Adicionar';
        add.appendChild(text);
        add.classList.add('market-flow-add');
      }

      const frame=card.querySelector('.market-product-photo');
      const image=frame?.querySelector('img');
      if(frame&&image&&frame.dataset.marketFlowAsset!=='1'){
        frame.dataset.marketFlowAsset='1';
        frame.dataset.cdcAssetFrame='market-browser-image';
        frame.dataset.cdcAssetErrorLabel='Sem fotografia';
        image.dataset.cdcAsset='market-browser-product';
        try{root.CDCAssetLoader?.prepareImage?.(image,{frame});}catch(_error){}
      }
    });
  }

  function mirrorCatalogBusyState(){
    document.querySelectorAll('.market-visual-product-card').forEach(card=>{
      const busy=String(card.classList.contains('is-photo-loading'));
      if(card.getAttribute('aria-busy')!==busy)card.setAttribute('aria-busy',busy);
    });
  }

  function apply(){
    clarifyListSearch();
    enhanceMobileCards();
    enhanceBrowser();
    mirrorCatalogBusyState();
  }

  function start(){
    apply();
    if(document.body&&!observer){
      observer=new MutationObserver(records=>{
        if(records.some(record=>record.type==='childList'||(record.type==='attributes'&&record.attributeName==='class')))schedule();
      });
      observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    }
    mobile.addEventListener?.('change',schedule);
    root.addEventListener?.('pageshow',schedule);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  root.CDCV75MarketFlow=Object.freeze({revision:REVISION,apply});
})(typeof window!=='undefined'?window:globalThis);

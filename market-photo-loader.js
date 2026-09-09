'use strict';

/* Conta de Casa — carregamento visual rápido das fotografias do Mercado (75-photo-loader1). */
(function installMarketPhotoLoader(root){
  const REVISION='75-photo-loader1';
  const POLL_MS=850;
  const MAX_POLLS=18;
  let observer=null;
  let pollTimer=0;
  let polls=0;
  let enteredMarket=false;

  const clean=(value,max=140)=>String(value??'').replace(/\s+/g,' ').trim().slice(0,max);

  function cardIdentity(card){
    const key=clean(card?.dataset?.visualCatalogProduct||'',80);
    const match=/^(continente|pingo-doce)\|(\d{4,32})$/i.exec(key);
    return match?{marketId:match[1].toLowerCase(),pid:match[2],key:`${match[1].toLowerCase()}|${match[2]}`} : null;
  }

  function ensureLoadingUi(card){
    const id=cardIdentity(card);if(!id)return;
    const media=card.querySelector('.market-visual-product-media');if(!media)return;
    if(media.querySelector('img')){card.classList.remove('is-photo-loading');return;}
    card.classList.add('is-photo-loading');
    let loader=media.querySelector('.market-photo-loader');
    if(!loader){
      loader=document.createElement('span');
      loader.className='market-photo-loader';
      loader.setAttribute('aria-hidden','true');
      loader.innerHTML='<span class="market-photo-loader-spinner"></span><span class="market-photo-loader-label">A carregar fotografia…</span>';
      media.replaceChildren(loader);
    }
  }

  async function hydrateCard(card){
    const id=cardIdentity(card);if(!id)return false;
    const media=card.querySelector('.market-visual-product-media');if(!media)return false;
    if(media.querySelector('img')){card.classList.remove('is-photo-loading');return true;}
    let record=null;
    try{record=await root.CDCMarketImageLibrary?.get?.(id);}catch(_error){}
    if(!record?.imageUrl){ensureLoadingUi(card);return false;}
    const image=document.createElement('img');
    image.alt='';image.loading='eager';image.decoding='async';image.referrerPolicy='no-referrer';
    image.addEventListener('load',()=>card.classList.remove('is-photo-loading'),{once:true});
    image.addEventListener('error',()=>{card.classList.remove('is-photo-loading');media.replaceChildren();ensureLoadingUi(card);},{once:true});
    image.src=record.imageUrl;
    media.replaceChildren(image);
    return true;
  }

  async function refreshVisibleCards(){
    if(typeof document==='undefined')return;
    const cards=[...document.querySelectorAll('[data-visual-catalog-product]')];
    if(!cards.length)return;
    await Promise.all(cards.slice(0,18).map(hydrateCard));
  }

  async function warmOnMarketEntry(){
    if(enteredMarket)return;
    const market=document.querySelector('#pageMarket, [data-page="market"], .market-browser');
    if(!market)return;
    enteredMarket=true;
    document.documentElement.classList.add('market-photos-warming');
    try{
      await root.CDCPingoDocePhotoLibrary?.warmPending?.();
      await root.CDCPingoDocePhotoLibrary?.syncNow?.({seeds:2});
    }catch(_error){}
    finally{
      document.documentElement.classList.remove('market-photos-warming');
      void refreshVisibleCards();
      startPoll();
    }
  }

  function startPoll(){
    if(pollTimer||polls>=MAX_POLLS)return;
    pollTimer=setTimeout(async()=>{
      pollTimer=0;polls+=1;
      await refreshVisibleCards();
      if(polls<MAX_POLLS)startPoll();
    },POLL_MS);
  }

  function scan(){
    document.querySelectorAll('[data-visual-catalog-product]').forEach(ensureLoadingUi);
    void refreshVisibleCards();
    void warmOnMarketEntry();
    startPoll();
  }

  function scheduleScan(){
    if(typeof root.requestAnimationFrame==='function')root.requestAnimationFrame(scan);else setTimeout(scan,0);
  }

  function install(){
    scan();
    if(document.body&&!observer){
      observer=new MutationObserver(mutations=>{
        if(mutations.some(mutation=>mutation.type==='childList'&&mutation.addedNodes.length))scheduleScan();
      });
      observer.observe(document.body,{subtree:true,childList:true});
    }
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){polls=0;scan();}});
  }

  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  }

  root.CDCMarketPhotoLoader=Object.freeze({revision:REVISION,refresh:refreshVisibleCards});
})(globalThis);

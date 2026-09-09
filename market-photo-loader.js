'use strict';

/* Conta de Casa — carregamento visual prioritário das fotografias do Mercado (75-photo-loader2). */
(function installMarketPhotoLoader(root){
  const REVISION='75-photo-loader2';
  const POLL_MS=500;
  const MAX_POLLS=24;
  const PRIORITY_VISIBLE_LIMIT=6;
  const RETRY_AFTER_MS=30000;
  const LOADER_SETTLE_MS=12000;
  const PINGO_DB_NAME='conta-de-casa-pingo-doce-photo-library';
  const PINGO_META_STORE='meta';
  let observer=null;
  let pollTimer=0;
  let polls=0;
  let enteredMarket=false;
  const warming=new Map();
  const attemptedAt=new Map();

  const clean=(value,max=140)=>String(value??'').replace(/\s+/g,' ').trim().slice(0,max);

  function cardIdentity(card){
    const key=clean(card?.dataset?.visualCatalogProduct||'',80);
    const match=/^(continente|pingo-doce)\|(\d{4,32})$/i.exec(key);
    return match?{marketId:match[1].toLowerCase(),pid:match[2],key:`${match[1].toLowerCase()}|${match[2]}`} : null;
  }

  function marketIsActive(){
    return Boolean(document.querySelector('#page-market.page.active'));
  }

  function loaderAge(card){
    const started=Number(card?.dataset?.photoLoaderStartedAt)||0;
    return started?Date.now()-started:0;
  }

  function ensureLoadingUi(card){
    const id=cardIdentity(card);if(!id)return;
    const media=card.querySelector('.market-visual-product-media');if(!media)return;
    if(media.querySelector('img')){
      card.classList.remove('is-photo-loading','is-photo-waiting');
      delete card.dataset.photoLoaderStartedAt;
      return;
    }
    if(!card.dataset.photoLoaderStartedAt)card.dataset.photoLoaderStartedAt=String(Date.now());
    card.classList.add('is-photo-loading');
    let loader=media.querySelector('.market-photo-loader');
    if(!loader){
      loader=document.createElement('span');
      loader.className='market-photo-loader';
      loader.setAttribute('aria-hidden','true');
      loader.innerHTML='<span class="market-photo-loader-spinner"></span><span class="market-photo-loader-label">A carregar fotografia…</span>';
      media.replaceChildren(loader);
    }
    if(loaderAge(card)>=LOADER_SETTLE_MS){
      card.classList.add('is-photo-waiting');
      const spinner=loader.querySelector('.market-photo-loader-spinner');
      const label=loader.querySelector('.market-photo-loader-label');
      if(spinner)spinner.hidden=true;
      if(label)label.textContent='Fotografia a validar…';
    }
  }

  async function hydrateCard(card){
    const id=cardIdentity(card);if(!id)return false;
    const media=card.querySelector('.market-visual-product-media');if(!media)return false;
    if(media.querySelector('img')){
      card.classList.remove('is-photo-loading','is-photo-waiting');
      delete card.dataset.photoLoaderStartedAt;
      return true;
    }
    let record=null;
    try{record=await root.CDCMarketImageLibrary?.get?.(id);}catch(_error){}
    if(!record?.imageUrl){ensureLoadingUi(card);return false;}
    const image=document.createElement('img');
    image.alt='';image.loading='eager';image.decoding='async';image.referrerPolicy='no-referrer';
    image.addEventListener('load',()=>{
      card.classList.remove('is-photo-loading','is-photo-waiting');
      delete card.dataset.photoLoaderStartedAt;
    },{once:true});
    image.addEventListener('error',()=>{
      void root.CDCMarketImageLibrary?.forget?.(id);
      card.classList.remove('is-photo-loading');
      card.classList.add('is-photo-waiting');
      media.replaceChildren();
      card.dataset.photoLoaderStartedAt=String(Date.now()-LOADER_SETTLE_MS);
      ensureLoadingUi(card);
    },{once:true});
    image.src=record.imageUrl;
    media.replaceChildren(image);
    return true;
  }

  async function refreshVisibleCards(){
    if(typeof document==='undefined'||!marketIsActive())return;
    const cards=[...document.querySelectorAll('[data-visual-catalog-product]')];
    if(!cards.length)return;
    await Promise.all(cards.slice(0,18).map(hydrateCard));
  }

  async function visibleCatalogRecords(){
    const catalog=root.CDCMarketVisualCatalog;
    if(!catalog?.listCategory)return new Map();
    const category=document.querySelector('[data-visual-catalog-category].active,[data-visual-catalog-category][aria-pressed="true"]')?.dataset?.visualCatalogCategory||catalog.categories?.[0]?.id||'';
    const store=document.querySelector('[data-visual-catalog-store].active,[data-visual-catalog-store][aria-pressed="true"]')?.dataset?.visualCatalogStore||'all';
    if(!category)return new Map();
    try{
      const records=await catalog.listCategory(category,store,18);
      return new Map((Array.isArray(records)?records:[]).map(record=>[record.key,record]));
    }catch(_error){return new Map();}
  }

  async function warmRecord(record){
    const id=cardIdentity({dataset:{visualCatalogProduct:record?.key||''}});if(!id)return null;
    let cached=null;
    try{cached=await root.CDCMarketImageLibrary?.get?.(id);}catch(_error){}
    if(cached?.imageUrl)return cached;
    const recent=Number(attemptedAt.get(id.key))||0;
    if(recent&&Date.now()-recent<RETRY_AFTER_MS)return null;
    if(warming.has(id.key))return warming.get(id.key);
    const official=root.CDCOfficialMarketImages;
    const library=root.CDCMarketImageLibrary;
    if(!official?.resolve||!library?.remember)return null;
    attemptedAt.set(id.key,Date.now());
    const promise=(async()=>{
      const result=await official.resolve({
        marketId:id.marketId,pid:id.pid,name:record.name,pack:record.pack,sourceUrl:record.sourceUrl
      }).catch(()=>null);
      if(!result?.imageUrl)return null;
      const stored=await library.remember({...result,marketId:id.marketId,pid:id.pid,name:record.name,pack:record.pack},record).catch(()=>null);
      if(stored&&typeof root.CustomEvent==='function'&&root.dispatchEvent){
        root.dispatchEvent(new CustomEvent('cdc:market-photo-ready',{detail:{key:id.key,marketId:id.marketId,pid:id.pid}}));
      }
      return stored;
    })().finally(()=>warming.delete(id.key));
    warming.set(id.key,promise);
    return promise;
  }

  async function warmVisibleCards(){
    if(!marketIsActive())return;
    const cards=[...document.querySelectorAll('[data-visual-catalog-product]')].slice(0,PRIORITY_VISIBLE_LIMIT);
    if(!cards.length)return;
    const records=await visibleCatalogRecords();
    await Promise.all(cards.map(async card=>{
      const id=cardIdentity(card);if(!id)return;
      const record=records.get(id.key);if(!record)return;
      await warmRecord(record);
      await hydrateCard(card);
    }));
  }

  async function resetPingoImageBudgetOnce(){
    if(!root.indexedDB)return false;
    return new Promise(resolve=>{
      let request;
      try{request=root.indexedDB.open(PINGO_DB_NAME);}catch(_error){resolve(false);return;}
      request.onerror=()=>resolve(false);
      request.onupgradeneeded=()=>{try{request.transaction.abort();}catch(_error){}resolve(false);};
      request.onsuccess=()=>{
        const db=request.result;
        if(!db.objectStoreNames.contains(PINGO_META_STORE)){db.close();resolve(false);return;}
        let tx;try{tx=db.transaction(PINGO_META_STORE,'readwrite');}catch(_error){db.close();resolve(false);return;}
        const store=tx.objectStore(PINGO_META_STORE);
        const get=store.get('scheduler');
        get.onerror=()=>{};
        get.onsuccess=()=>{
          const current=get.result||{key:'scheduler'};
          if(current.photoRuntimeRevision===REVISION)return;
          store.put({...current,key:'scheduler',imagesToday:0,lastImageAt:0,photoRuntimeRevision:REVISION});
        };
        tx.oncomplete=()=>{db.close();resolve(true);};
        tx.onerror=()=>{db.close();resolve(false);};
        tx.onabort=()=>{db.close();resolve(false);};
      };
    });
  }

  async function warmOnMarketEntry(){
    if(enteredMarket||!marketIsActive())return;
    enteredMarket=true;
    document.documentElement.classList.add('market-photos-warming');
    try{
      await Promise.resolve(root.CDCPingoDocePhotoLibrary?.warmPending?.());
      await resetPingoImageBudgetOnce();
      const sync=root.CDCPingoDocePhotoLibrary?.syncNow?.({seeds:2});
      await Promise.allSettled([Promise.resolve(sync),warmVisibleCards()]);
    }catch(_error){}
    finally{
      document.documentElement.classList.remove('market-photos-warming');
      void refreshVisibleCards();
      startPoll();
    }
  }

  function startPoll(){
    if(pollTimer||polls>=MAX_POLLS||!marketIsActive())return;
    pollTimer=setTimeout(async()=>{
      pollTimer=0;polls+=1;
      await refreshVisibleCards();
      void warmVisibleCards();
      if(polls<MAX_POLLS)startPoll();
    },POLL_MS);
  }

  function scan(){
    if(!marketIsActive())return;
    document.querySelectorAll('[data-visual-catalog-product]').forEach(ensureLoadingUi);
    void refreshVisibleCards();
    void warmVisibleCards();
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
        const relevant=mutations.some(mutation=>
          (mutation.type==='childList'&&mutation.addedNodes.length)||
          (mutation.type==='attributes'&&mutation.target?.id==='page-market')
        );
        if(relevant)scheduleScan();
      });
      observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    }
    document.addEventListener('click',event=>{
      if(event.target.closest?.('[data-page="market"],[data-go="market"],[data-visual-catalog-category],[data-visual-catalog-store],[data-visual-catalog-refresh]')){
        polls=0;setTimeout(scheduleScan,40);
      }
    });
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){polls=0;scan();}});
    if(root.addEventListener)root.addEventListener('cdc:market-photo-ready',()=>{void refreshVisibleCards();});
  }

  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  }

  root.CDCMarketPhotoLoader=Object.freeze({revision:REVISION,refresh:refreshVisibleCards,warmVisible:warmVisibleCards});
})(globalThis);

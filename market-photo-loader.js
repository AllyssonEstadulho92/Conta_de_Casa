'use strict';

/* Conta de Casa — carregamento visual prioritário das fotografias do Mercado (75-photo-loader3). */
(function installMarketPhotoLoader(root){
  const REVISION='75-photo-loader3';
  const POLL_MS=500;
  const MAX_POLLS=28;
  const PRIORITY_VISIBLE_LIMIT=8;
  const RETRY_AFTER_MS=30000;
  const VALIDATING_AFTER_MS=7000;
  const FINAL_SETTLE_MS=12000;
  const SETTLED_RETRY_MS=5*60*1000;
  const PINGO_DB_NAME='conta-de-casa-pingo-doce-photo-library';
  const PINGO_META_STORE='meta';
  const PINGO_PRODUCT_STORE='products';
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

  function settledRecently(card){
    const settled=Number(card?.dataset?.photoLoaderSettledAt)||0;
    return Boolean(settled&&Date.now()-settled<SETTLED_RETRY_MS);
  }

  function clearSettled(card){
    delete card.dataset.photoLoaderStartedAt;
    delete card.dataset.photoLoaderSettledAt;
    card.classList.remove('is-photo-loading','is-photo-waiting','is-photo-unavailable');
  }

  function unavailableUi(media){
    let fallback=media.querySelector('.market-photo-unavailable');
    if(fallback)return fallback;
    fallback=document.createElement('span');
    fallback.className='market-photo-unavailable';
    fallback.setAttribute('aria-hidden','true');
    fallback.innerHTML='<span class="market-photo-unavailable-mark">⌁</span><span>Sem fotografia</span>';
    media.replaceChildren(fallback);
    return fallback;
  }

  function settleUnavailable(card){
    const media=card?.querySelector('.market-visual-product-media');
    if(!media||media.querySelector('img'))return;
    delete card.dataset.photoLoaderStartedAt;
    card.dataset.photoLoaderSettledAt=String(Date.now());
    card.classList.remove('is-photo-loading','is-photo-waiting');
    card.classList.add('is-photo-unavailable');
    unavailableUi(media);
  }

  function ensureLoadingUi(card){
    const id=cardIdentity(card);if(!id)return;
    const media=card.querySelector('.market-visual-product-media');if(!media)return;
    if(media.querySelector('img')){
      clearSettled(card);
      return;
    }
    if(settledRecently(card)){
      settleUnavailable(card);
      return;
    }
    if(card.dataset.photoLoaderSettledAt)delete card.dataset.photoLoaderSettledAt;
    if(!card.dataset.photoLoaderStartedAt)card.dataset.photoLoaderStartedAt=String(Date.now());
    if(loaderAge(card)>=FINAL_SETTLE_MS){
      settleUnavailable(card);
      return;
    }
    card.classList.remove('is-photo-unavailable');
    card.classList.add('is-photo-loading');
    let loader=media.querySelector('.market-photo-loader');
    if(!loader){
      loader=document.createElement('span');
      loader.className='market-photo-loader';
      loader.setAttribute('aria-hidden','true');
      loader.innerHTML='<span class="market-photo-loader-spinner"></span><span class="market-photo-loader-label">A carregar fotografia…</span>';
      media.replaceChildren(loader);
    }
    if(loaderAge(card)>=VALIDATING_AFTER_MS){
      card.classList.add('is-photo-waiting');
      const spinner=loader.querySelector('.market-photo-loader-spinner');
      const label=loader.querySelector('.market-photo-loader-label');
      if(spinner)spinner.hidden=true;
      if(label)label.textContent='A validar fotografia…';
    }
  }

  async function refreshPingoMetrics(){
    const target=document.querySelector('#pingoDocePhotoLibraryMetrics');
    const stats=root.CDCPingoDocePhotoLibrary?.stats;
    if(!target||typeof stats!=='function')return;
    try{
      const data=await stats();
      target.textContent=`${Number(data?.products)||0} SKUs indexados · ${Number(data?.photos)||0} fotografias oficiais`;
    }catch(_error){}
  }

  async function markPingoReady(id){
    if(id?.marketId!=='pingo-doce'||!root.indexedDB)return false;
    return new Promise(resolve=>{
      let request;
      try{request=root.indexedDB.open(PINGO_DB_NAME);}catch(_error){resolve(false);return;}
      request.onerror=()=>resolve(false);
      request.onupgradeneeded=()=>{try{request.transaction.abort();}catch(_error){}resolve(false);};
      request.onsuccess=()=>{
        const db=request.result;
        if(!db.objectStoreNames.contains(PINGO_PRODUCT_STORE)){db.close();resolve(false);return;}
        let tx;try{tx=db.transaction(PINGO_PRODUCT_STORE,'readwrite');}catch(_error){db.close();resolve(false);return;}
        const store=tx.objectStore(PINGO_PRODUCT_STORE);
        const get=store.get(id.key);
        get.onerror=()=>{};
        get.onsuccess=()=>{
          const current=get.result;
          if(current)store.put({...current,imageState:'ready',imageCheckedAt:Date.now(),lastSeenAt:Date.now()});
        };
        tx.oncomplete=()=>{db.close();void refreshPingoMetrics();resolve(true);};
        tx.onerror=()=>{db.close();resolve(false);};
        tx.onabort=()=>{db.close();resolve(false);};
      };
    });
  }

  async function hydrateCard(card){
    const id=cardIdentity(card);if(!id)return false;
    const media=card.querySelector('.market-visual-product-media');if(!media)return false;
    if(media.querySelector('img')){
      clearSettled(card);
      if(id.marketId==='pingo-doce')void markPingoReady(id);
      return true;
    }
    let record=null;
    try{record=await root.CDCMarketImageLibrary?.get?.(id);}catch(_error){}
    if(!record?.imageUrl){ensureLoadingUi(card);return false;}
    const image=document.createElement('img');
    image.alt='';image.loading='eager';image.decoding='async';image.referrerPolicy='no-referrer';
    image.addEventListener('load',()=>{
      clearSettled(card);
      if(id.marketId==='pingo-doce')void markPingoReady(id);
    },{once:true});
    image.addEventListener('error',()=>{
      void root.CDCMarketImageLibrary?.forget?.(id);
      settleUnavailable(card);
    },{once:true});
    image.src=record.imageUrl;
    media.replaceChildren(image);
    if(id.marketId==='pingo-doce')void markPingoReady(id);
    return true;
  }

  async function refreshVisibleCards(){
    if(typeof document==='undefined'||!marketIsActive())return;
    const cards=[...document.querySelectorAll('[data-visual-catalog-product]')];
    if(!cards.length)return;
    await Promise.all(cards.slice(0,18).map(hydrateCard));
    cards.slice(0,18).forEach(ensureLoadingUi);
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
    if(cached?.imageUrl){if(id.marketId==='pingo-doce')void markPingoReady(id);return cached;}
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
      if(stored&&id.marketId==='pingo-doce')await markPingoReady(id);
      if(stored&&typeof root.CustomEvent==='function'&&root.dispatchEvent){
        root.dispatchEvent(new CustomEvent('cdc:market-photo-ready',{detail:{key:id.key,marketId:id.marketId,pid:id.pid}}));
      }
      return stored;
    })().finally(()=>warming.delete(id.key));
    warming.set(id.key,promise);
    return promise;
  }

  function priorityCards(){
    const candidates=[...document.querySelectorAll('[data-visual-catalog-product]')].slice(0,16);
    if(candidates.length<=PRIORITY_VISIBLE_LIMIT)return candidates;
    const selected=[];
    for(const marketId of ['pingo-doce','continente']){
      for(const card of candidates){
        if(selected.length>=PRIORITY_VISIBLE_LIMIT)break;
        if(cardIdentity(card)?.marketId===marketId&&!selected.includes(card))selected.push(card);
        if(selected.filter(item=>cardIdentity(item)?.marketId===marketId).length>=Math.ceil(PRIORITY_VISIBLE_LIMIT/2))break;
      }
    }
    for(const card of candidates){
      if(selected.length>=PRIORITY_VISIBLE_LIMIT)break;
      if(!selected.includes(card))selected.push(card);
    }
    return selected;
  }

  async function warmVisibleCards(){
    if(!marketIsActive())return;
    const cards=priorityCards().filter(card=>!settledRecently(card));
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

  function resetSettledCards(){
    document.querySelectorAll('[data-visual-catalog-product]').forEach(card=>{
      const id=cardIdentity(card);
      delete card.dataset.photoLoaderSettledAt;
      delete card.dataset.photoLoaderStartedAt;
      card.classList.remove('is-photo-unavailable','is-photo-waiting');
      if(id)attemptedAt.delete(id.key);
    });
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
      if(event.target.closest?.('[data-visual-catalog-refresh]'))resetSettledCards();
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

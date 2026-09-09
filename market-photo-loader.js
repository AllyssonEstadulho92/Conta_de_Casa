'use strict';

/* Conta de Casa — carregamento visual prioritário e limitado das fotografias do Mercado (75-photo-loader3). */
(function installMarketPhotoLoader(root){
  const REVISION='75-photo-loader3';
  const POLL_MS=1000;
  const MAX_POLLS=12;
  const PRIORITY_VISIBLE_LIMIT=4;
  const HYDRATE_LIMIT=8;
  const RETRY_AFTER_MS=30000;
  const LOADER_SETTLE_MS=12000;
  const DEFERRED_SYNC_MS=5000;
  const PINGO_DB_NAME='conta-de-casa-pingo-doce-photo-library';
  const PINGO_META_STORE='meta';

  let observer=null;
  let pollTimer=0;
  let polls=0;
  let enteredMarket=false;
  let scanQueued=false;
  let scanRunning=false;
  let scanPending=false;
  let refreshPromise=null;
  let warmPromise=null;
  let entryPromise=null;
  let deferredSyncTimer=0;

  const warming=new Map();
  const attemptedAt=new Map();

  const clean=(value,max=140)=>String(value??'').replace(/\s+/g,' ').trim().slice(0,max);

  function cardIdentity(card){
    const key=clean(card?.dataset?.visualCatalogProduct||'',80);
    const match=/^(continente|pingo-doce)\|(\d{4,32})$/i.exec(key);
    return match?{marketId:match[1].toLowerCase(),pid:match[2],key:`${match[1].toLowerCase()}|${match[2]}`} : null;
  }

  function marketPage(){return document.querySelector('#page-market');}
  function marketIsActive(){return Boolean(document.querySelector('#page-market.page.active'));}
  function notePingo(id,state){if(id?.marketId==='pingo-doce')void root.CDCPingoDocePhotoLibrary?.noteImageResult?.(id,state);}

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
      notePingo(id,'ready');
      return true;
    }

    let record=null;
    try{record=await root.CDCMarketImageLibrary?.get?.(id);}catch(_error){}
    if(!record?.imageUrl){ensureLoadingUi(card);return false;}
    notePingo(id,'ready');

    const image=document.createElement('img');
    image.alt='';
    image.loading='eager';
    image.decoding='async';
    image.referrerPolicy='no-referrer';
    image.addEventListener('load',()=>{
      card.classList.remove('is-photo-loading','is-photo-waiting');
      delete card.dataset.photoLoaderStartedAt;
      notePingo(id,'ready');
    },{once:true});
    image.addEventListener('error',()=>{
      void root.CDCMarketImageLibrary?.forget?.(id);
      notePingo(id,'pending');
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

  function catalogCards(limit=HYDRATE_LIMIT){
    return [...document.querySelectorAll('[data-visual-catalog-product]')].slice(0,Math.max(1,limit));
  }

  function refreshVisibleCards(){
    if(refreshPromise)return refreshPromise;
    refreshPromise=(async()=>{
      if(typeof document==='undefined'||!marketIsActive())return;
      const cards=catalogCards(HYDRATE_LIMIT);
      if(!cards.length)return;
      await Promise.all(cards.map(hydrateCard));
    })().finally(()=>{refreshPromise=null;});
    return refreshPromise;
  }

  async function visibleCatalogRecords(){
    const catalog=root.CDCMarketVisualCatalog;
    if(!catalog?.listCategory)return new Map();
    const category=document.querySelector('[data-visual-catalog-category].active,[data-visual-catalog-category][aria-pressed="true"]')?.dataset?.visualCatalogCategory||catalog.categories?.[0]?.id||'';
    const store=document.querySelector('[data-visual-catalog-store].active,[data-visual-catalog-store][aria-pressed="true"]')?.dataset?.visualCatalogStore||'all';
    if(!category)return new Map();
    try{
      const records=await catalog.listCategory(category,store,HYDRATE_LIMIT);
      return new Map((Array.isArray(records)?records:[]).map(record=>[record.key,record]));
    }catch(_error){return new Map();}
  }

  async function warmRecord(record){
    const id=cardIdentity({dataset:{visualCatalogProduct:record?.key||''}});if(!id)return null;
    let cached=null;
    try{cached=await root.CDCMarketImageLibrary?.get?.(id);}catch(_error){}
    if(cached?.imageUrl){notePingo(id,'ready');return cached;}

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
      if(stored){
        notePingo(id,'ready');
        if(typeof root.CustomEvent==='function'&&root.dispatchEvent){
          root.dispatchEvent(new CustomEvent('cdc:market-photo-ready',{detail:{key:id.key,marketId:id.marketId,pid:id.pid}}));
        }
      }
      return stored;
    })().finally(()=>warming.delete(id.key));
    warming.set(id.key,promise);
    return promise;
  }

  function warmVisibleCards(){
    if(warmPromise)return warmPromise;
    warmPromise=(async()=>{
      if(!marketIsActive())return;
      const cards=catalogCards(PRIORITY_VISIBLE_LIMIT);
      if(!cards.length)return;
      const records=await visibleCatalogRecords();
      for(const card of cards){
        if(!marketIsActive())break;
        const id=cardIdentity(card);if(!id)continue;
        const record=records.get(id.key);if(!record)continue;
        await warmRecord(record);
        await hydrateCard(card);
      }
    })().finally(()=>{warmPromise=null;});
    return warmPromise;
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

  function scheduleDeferredPingoSync(){
    if(deferredSyncTimer||!root.CDCPingoDocePhotoLibrary?.syncNow)return;
    deferredSyncTimer=setTimeout(()=>{
      deferredSyncTimer=0;
      if(!marketIsActive())return;
      const run=()=>{if(marketIsActive())void root.CDCPingoDocePhotoLibrary.syncNow({seeds:1}).then(()=>scheduleScan()).catch(()=>{});};
      if(typeof root.requestIdleCallback==='function')root.requestIdleCallback(run,{timeout:2500});
      else run();
    },DEFERRED_SYNC_MS);
  }

  function warmOnMarketEntry(){
    if(entryPromise)return entryPromise;
    if(enteredMarket||!marketIsActive())return Promise.resolve();
    enteredMarket=true;
    entryPromise=(async()=>{
      document.documentElement.classList.add('market-photos-warming');
      try{
        await resetPingoImageBudgetOnce();
        await root.CDCPingoDocePhotoLibrary?.reconcileCachedImages?.(8);
        await warmVisibleCards();
        scheduleDeferredPingoSync();
      }catch(_error){}
      finally{
        document.documentElement.classList.remove('market-photos-warming');
        await refreshVisibleCards();
        startPoll();
      }
    })().finally(()=>{entryPromise=null;});
    return entryPromise;
  }

  function startPoll(){
    if(pollTimer||polls>=MAX_POLLS||!marketIsActive())return;
    pollTimer=setTimeout(async()=>{
      pollTimer=0;
      if(!marketIsActive())return;
      polls+=1;
      await refreshVisibleCards();
      await warmVisibleCards();
      if(polls<MAX_POLLS)startPoll();
    },POLL_MS);
  }

  async function scan(){
    if(!marketIsActive())return;
    catalogCards(HYDRATE_LIMIT).forEach(ensureLoadingUi);
    await refreshVisibleCards();
    void warmOnMarketEntry();
    startPoll();
  }

  function scheduleScan(){
    if(typeof document==='undefined')return;
    if(scanRunning){scanPending=true;return;}
    if(scanQueued)return;
    scanQueued=true;
    const run=async()=>{
      scanQueued=false;
      if(scanRunning){scanPending=true;return;}
      scanRunning=true;
      try{await scan();}
      finally{
        scanRunning=false;
        if(scanPending){scanPending=false;scheduleScan();}
      }
    };
    if(typeof root.requestAnimationFrame==='function')root.requestAnimationFrame(()=>{void run();});
    else setTimeout(()=>{void run();},0);
  }

  function mutationTouchesLoader(mutation){
    const target=mutation?.target;
    return Boolean(target?.closest?.('.market-visual-product-media,#pingoDocePhotoLibraryStatus,.pingo-doce-photo-library-status,.pingo-doce-photo-library-panel'));
  }

  function relevantMutation(mutation){
    if(mutation.type==='attributes')return mutation.target?.id==='page-market';
    if(mutation.type!=='childList'||!mutation.addedNodes.length||mutationTouchesLoader(mutation))return false;
    return [...mutation.addedNodes].some(node=>{
      if(node?.nodeType!==1)return false;
      if(node.matches?.('[data-visual-catalog-product],#marketVisualCatalog,.market-visual-product-grid'))return true;
      return Boolean(node.querySelector?.('[data-visual-catalog-product],#marketVisualCatalog,.market-visual-product-grid'));
    });
  }

  function install(){
    scheduleScan();
    const page=marketPage();
    if(page&&!observer){
      observer=new MutationObserver(mutations=>{
        if(mutations.some(relevantMutation))scheduleScan();
      });
      observer.observe(page,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    }

    document.addEventListener('click',event=>{
      if(event.target.closest?.('[data-page="market"],[data-go="market"],[data-visual-catalog-category],[data-visual-catalog-store],[data-visual-catalog-refresh]')){
        polls=0;
        setTimeout(scheduleScan,60);
      }
    });

    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible'){
        polls=0;
        scheduleScan();
      }
    });

    if(root.addEventListener)root.addEventListener('cdc:market-photo-ready',scheduleScan);
  }

  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
    else install();
  }

  root.CDCMarketPhotoLoader=Object.freeze({revision:REVISION,refresh:refreshVisibleCards,warmVisible:warmVisibleCards});
})(globalThis);

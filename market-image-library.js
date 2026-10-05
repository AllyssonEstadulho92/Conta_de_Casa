'use strict';

/*
 * Conta de Casa — biblioteca persistente e auditável de imagens oficiais do Mercado (76-image-library-audit1)
 *
 * Guarda apenas metadados de fotografias oficiais já validadas para o SKU exato
 * de Continente/Pingo Doce. Não copia binários dos retalhistas para o repositório,
 * não lê/escreve o estado financeiro e não altera preços.
 */
(function installMarketImageLibrary(root){
  const REVISION='76-pingo-images2';
  const DB_NAME='conta-de-casa-market-image-library';
  const DB_VERSION=1;
  const STORE='images';
  const POSITIVE_TTL_MS=45*24*60*60*1000;
  const CARD_SELECTOR='#marketCatalogResults [data-market-product-card]';
  const memory=new Map();
  let dbPromise=null;
  let observer=null;
  let scanQueued=false;
  let lastAuditReport=null;

  const clean=(value,max=180)=>String(value??'')
    .replace(/[\u0000-\u001f\u007f]/g,' ')
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,max);

  function identity(target={}){
    const marketId=clean(target.marketId,24).toLowerCase();
    const pid=String(target.pid??'').replace(/\D/g,'').slice(0,32);
    if(!pid||!['continente','pingo-doce'].includes(marketId))return null;
    return {marketId,pid,key:`${marketId}|${pid}`};
  }

  function identityFromCard(card){
    const match=/^cesta-(continente|pingo-doce)-(\d{4,32})$/i.exec(clean(card?.dataset?.marketProductCard||'',100));
    return match?identity({marketId:match[1].toLowerCase(),pid:match[2]}):null;
  }

  function safeProductUrl(value,marketId='',pid=''){
    if(!value)return '';
    try{
      const url=new URL(String(value));
      if(url.protocol!=='https:')return '';
      const host=url.hostname.toLowerCase();
      const path=decodeURIComponent(url.pathname);
      const id=String(pid||'').replace(/\D/g,'');
      if(marketId==='continente'){
        if(!['continente.pt','www.continente.pt'].includes(host)||!path.startsWith('/produto/'))return '';
        const found=path.match(/-(\d{4,32})\.html$/i)?.[1]||'';
        if(id&&found!==id)return '';
      }else if(marketId==='pingo-doce'){
        if(!['pingodoce.pt','www.pingodoce.pt'].includes(host)||!path.includes('/home/produtos/'))return '';
        const found=path.match(/-(\d{4,32})\.html$/i)?.[1]||'';
        if(id&&found!==id)return '';
      }else return '';
      return url.href.slice(0,900);
    }catch(_error){return '';}
  }

  function safeOfficialImageUrl(value,marketId='',pid=''){
    if(!value)return '';
    try{
      const url=new URL(String(value).replace(/&amp;/g,'&'));
      if(url.protocol!=='https:')return '';
      const host=url.hostname.toLowerCase();
      const path=decodeURIComponent(url.pathname);
      const id=String(pid||'').replace(/\D/g,'');
      if(marketId==='continente'){
        if(host!=='www.continente.pt'||!path.includes('/Sites-col-master-catalog/'))return '';
        if(!/\.(?:jpe?g|png|webp)$/i.test(path)||/noimage|fallback/i.test(path))return '';
        if(id&&!new RegExp(`(?:/|_)${id}(?:[-_.]|$)`).test(path))return '';
        return url.href.slice(0,1100);
      }
      if(marketId==='pingo-doce'){
        if(!['pingodoce.pt','www.pingodoce.pt','static.pingodoce.pt'].includes(host))return '';
        if(!path.includes('/Sites-pingo-doce-master/'))return '';
        if(!/\/images\/(?:large|medium|small)\//i.test(path))return '';
        if(!/\.(?:jpe?g|png|webp)$/i.test(path)||/noimage|fallback/i.test(path))return '';
        if((host==='pingodoce.pt'||host==='www.pingodoce.pt')&&!path.includes('/dw/image/v2/BLJJ_PRD/on/demandware.static/-/'))return '';
        if(id&&!path.split('/').some(segment=>segment.startsWith(`${id}_`)||segment.startsWith(`${id}-`)||segment.startsWith(`${id}.`)))return '';
        return url.href.slice(0,1100);
      }
      return '';
    }catch(_error){return '';}
  }

  function normalizeRecord(value,target={}){
    const id=identity({...target,marketId:value?.marketId??target.marketId,pid:value?.pid??target.pid});
    if(!id)return null;
    const imageUrl=safeOfficialImageUrl(value?.imageUrl,id.marketId,id.pid);
    if(!imageUrl)return null;
    const sourceUrl=safeProductUrl(value?.sourceUrl,id.marketId,id.pid);
    const storedAt=Number(value?.storedAt)||Date.now();
    const expiresAt=Number(value?.expiresAt)||storedAt+POSITIVE_TTL_MS;
    return {
      key:id.key,marketId:id.marketId,pid:id.pid,
      name:clean(value?.name??target.name,140),pack:clean(value?.pack??target.pack,100),
      imageUrl,sourceUrl,
      source:clean(value?.source||`${id.marketId==='continente'?'Continente':'Pingo Doce'} · imagem oficial`,100),
      storedAt,expiresAt
    };
  }

  function openDb(){
    if(dbPromise)return dbPromise;
    if(!root.indexedDB)return Promise.resolve(null);
    dbPromise=new Promise(resolve=>{
      let request;
      try{request=root.indexedDB.open(DB_NAME,DB_VERSION);}catch(_error){resolve(null);return;}
      request.onupgradeneeded=()=>{
        const db=request.result;
        if(!db.objectStoreNames.contains(STORE)){
          const store=db.createObjectStore(STORE,{keyPath:'key'});
          store.createIndex('marketId','marketId',{unique:false});
          store.createIndex('expiresAt','expiresAt',{unique:false});
        }
      };
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>resolve(null);
      request.onblocked=()=>resolve(null);
    });
    return dbPromise;
  }

  async function idbGet(key){
    const db=await openDb();if(!db)return null;
    return new Promise(resolve=>{
      let tx;try{tx=db.transaction(STORE,'readonly');}catch(_error){resolve(null);return;}
      const request=tx.objectStore(STORE).get(key);
      request.onsuccess=()=>resolve(request.result||null);
      request.onerror=()=>resolve(null);
    });
  }

  async function idbPut(record){
    const db=await openDb();if(!db)return false;
    return new Promise(resolve=>{
      let tx;try{tx=db.transaction(STORE,'readwrite');}catch(_error){resolve(false);return;}
      tx.objectStore(STORE).put(record);
      tx.oncomplete=()=>resolve(true);
      tx.onerror=()=>resolve(false);
      tx.onabort=()=>resolve(false);
    });
  }

  async function idbDelete(key){
    const db=await openDb();if(!db)return false;
    return new Promise(resolve=>{
      let tx;try{tx=db.transaction(STORE,'readwrite');}catch(_error){resolve(false);return;}
      tx.objectStore(STORE).delete(key);
      tx.oncomplete=()=>resolve(true);
      tx.onerror=()=>resolve(false);
      tx.onabort=()=>resolve(false);
    });
  }

  async function idbGetAll(){
    const db=await openDb();
    if(!db)return [...memory.values()];
    return new Promise(resolve=>{
      let tx;try{tx=db.transaction(STORE,'readonly');}catch(_error){resolve([...memory.values()]);return;}
      const request=tx.objectStore(STORE).getAll();
      request.onsuccess=()=>resolve(Array.isArray(request.result)?request.result:[]);
      request.onerror=()=>resolve([...memory.values()]);
    });
  }

  function emitAuditProgress(detail){
    if(typeof root.dispatchEvent!=='function'||typeof root.CustomEvent!=='function')return;
    try{root.dispatchEvent(new root.CustomEvent('cdc:market-image-library-audit-progress',{detail}));}catch(_error){}
  }

  function probeImage(url,timeoutMs=6500){
    if(typeof root.Image!=='function')return Promise.resolve(null);
    return new Promise(resolve=>{
      const image=new root.Image();
      let settled=false;
      const finish=value=>{
        if(settled)return;
        settled=true;
        clearTimeout(timer);
        image.onload=null;
        image.onerror=null;
        resolve(value);
      };
      const timer=setTimeout(()=>finish(false),Math.max(1500,Number(timeoutMs)||6500));
      image.referrerPolicy='no-referrer';
      image.decoding='async';
      image.onload=()=>finish(true);
      image.onerror=()=>finish(false);
      image.src=url;
    });
  }

  async function auditAll(options={}){
    const verifyNetwork=options.verifyNetwork!==false;
    const pruneInvalid=options.pruneInvalid!==false;
    const concurrency=Math.max(1,Math.min(Number(options.concurrency)||4,6));
    const timeoutMs=Math.max(1500,Math.min(Number(options.timeoutMs)||6500,15000));
    const rawRecords=await idbGetAll();
    const now=Date.now();
    const report={
      revision:REVISION,total:rawRecords.length,valid:0,available:0,unavailable:0,
      unchecked:0,expired:0,rejected:0,removed:0,persistent:Boolean(await openDb()),
      checkedAt:new Date(now).toISOString(),items:[]
    };
    const networkQueue=[];

    for(const raw of rawRecords){
      const id=identity(raw||{});
      const key=clean(raw?.key,80);
      if(!id){
        report.rejected+=1;
        report.items.push({key,status:'rejected',name:clean(raw?.name,140),marketId:clean(raw?.marketId,24),pid:clean(raw?.pid,48),imageUrl:''});
        if(pruneInvalid&&key){memory.delete(key);if(await idbDelete(key))report.removed+=1;}
        continue;
      }
      const normalized=normalizeRecord(raw,id);
      if(!normalized){
        report.rejected+=1;
        report.items.push({key:id.key,status:'rejected',name:clean(raw?.name,140),marketId:id.marketId,pid:id.pid,imageUrl:''});
        if(pruneInvalid){memory.delete(id.key);if(await idbDelete(id.key))report.removed+=1;}
        continue;
      }
      if(normalized.expiresAt<=now){
        report.expired+=1;
        report.items.push({...normalized,status:'expired'});
        memory.delete(id.key);
        if(pruneInvalid&&await idbDelete(id.key))report.removed+=1;
        continue;
      }
      report.valid+=1;
      memory.set(id.key,normalized);
      const item={...normalized,status:verifyNetwork&&typeof root.Image==='function'?'checking':'valid'};
      report.items.push(item);
      if(verifyNetwork&&typeof root.Image==='function')networkQueue.push({id,record:normalized,item});
      else report.unchecked+=1;
    }

    let cursor=0;
    let completed=0;
    const worker=async()=>{
      while(cursor<networkQueue.length){
        const current=networkQueue[cursor++];
        const ok=await probeImage(current.record.imageUrl,timeoutMs);
        if(ok===true){report.available+=1;current.item.status='available';}
        else if(ok===false){report.unavailable+=1;current.item.status='unavailable';}
        else {report.unchecked+=1;current.item.status='valid';}
        completed+=1;
        emitAuditProgress({
          completed,total:networkQueue.length,
          available:report.available,unavailable:report.unavailable,valid:report.valid
        });
      }
    };
    await Promise.all(Array.from({length:Math.min(concurrency,networkQueue.length||1)},()=>worker()));
    lastAuditReport=Object.freeze({...report,items:Object.freeze(report.items.map(item=>Object.freeze({...item})))});
    return {...report,items:report.items.map(item=>({...item}))};
  }

  async function listRecords(options={}){
    const includeExpired=options.includeExpired!==false;
    const rawRecords=await idbGetAll();
    const now=Date.now();
    const records=[];
    for(const raw of rawRecords){
      const id=identity(raw||{});
      if(!id)continue;
      const normalized=normalizeRecord(raw,id);
      if(!normalized)continue;
      const expired=normalized.expiresAt<=now;
      if(expired&&!includeExpired)continue;
      records.push({...normalized,status:expired?'expired':'valid'});
    }
    records.sort((a,b)=>Number(b.storedAt||0)-Number(a.storedAt||0)||String(a.name||'').localeCompare(String(b.name||''),'pt-PT'));
    return records;
  }

  async function get(target={}){
    const id=identity(target);if(!id)return null;
    let record=memory.get(id.key)||null;
    if(!record){record=await idbGet(id.key);if(record)memory.set(id.key,record);}
    const normalized=normalizeRecord(record||{},id);
    if(!normalized||normalized.expiresAt<=Date.now()){
      memory.delete(id.key);
      if(record)void idbDelete(id.key);
      return null;
    }
    return normalized;
  }

  async function remember(value,target={}){
    const record=normalizeRecord(value,target);if(!record)return null;
    record.storedAt=Date.now();
    record.expiresAt=record.storedAt+POSITIVE_TTL_MS;
    memory.set(record.key,record);
    await idbPut(record);
    return record;
  }

  async function forget(target={}){
    const id=identity(target);if(!id)return false;
    memory.delete(id.key);
    await idbDelete(id.key);
    return true;
  }

  async function stats(){
    const db=await openDb();
    if(!db)return {revision:REVISION,count:memory.size,persistent:false,lastAudit:lastAuditReport};
    return new Promise(resolve=>{
      let tx;try{tx=db.transaction(STORE,'readonly');}catch(_error){resolve({revision:REVISION,count:memory.size,persistent:false,lastAudit:lastAuditReport});return;}
      const request=tx.objectStore(STORE).count();
      request.onsuccess=()=>resolve({revision:REVISION,count:Number(request.result)||0,persistent:true,lastAudit:lastAuditReport});
      request.onerror=()=>resolve({revision:REVISION,count:memory.size,persistent:false,lastAudit:lastAuditReport});
    });
  }

  async function prune(){
    const db=await openDb();if(!db)return 0;
    const now=Date.now();
    return new Promise(resolve=>{
      let removed=0;
      let tx;try{tx=db.transaction(STORE,'readwrite');}catch(_error){resolve(0);return;}
      const store=tx.objectStore(STORE);
      const request=store.openCursor();
      request.onsuccess=()=>{
        const cursor=request.result;
        if(!cursor)return;
        if(Number(cursor.value?.expiresAt)<=now){memory.delete(String(cursor.key));cursor.delete();removed+=1;}
        cursor.continue();
      };
      tx.oncomplete=()=>resolve(removed);
      tx.onerror=()=>resolve(removed);
      tx.onabort=()=>resolve(removed);
    });
  }

  function targetFromCard(card){
    const id=identityFromCard(card);if(!id)return null;
    const prototypeCopy=card.querySelector('.market-prototype-result-copy');
    const name=clean(
      card?.dataset?.marketProductName||
      prototypeCopy?.querySelector('strong')?.textContent||
      card.querySelector('.market-product-copy h3')?.textContent||'',140
    );
    const rawPack=clean(
      card?.dataset?.marketProductPack||
      prototypeCopy?.querySelector('small')?.textContent||
      card.querySelector('.market-product-copy>p')?.textContent||'',100
    );
    const pack=rawPack.replace(/\s*·\s*(Pingo Doce|Continente)\s*$/i,'').trim();
    const sourceLink=card.querySelector('.market-result-source[href]');
    const sourceUrl=safeProductUrl(card?.dataset?.marketProductUrl||sourceLink?.href||'',id.marketId,id.pid);
    return {...id,name,pack,sourceUrl,label:id.marketId==='continente'?'Continente':'Pingo Doce'};
  }

  function applyRecordToCard(card,target,record){
    if(!card?.isConnected||!record?.imageUrl)return false;
    let photo=card.querySelector('.market-product-photo');
    if(!photo)return false;
    let button=photo.matches?.('button.market-product-photo')?photo:null;
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.className=`${photo.className||'market-product-photo'} market-product-photo-button`.replace(/\bis-empty\b/g,'').replace(/\s+/g,' ').trim();
      photo.replaceWith(button);
      photo=button;
    }
    button.classList.remove('is-empty');
    button.dataset.marketImageOpen=record.imageUrl;
    button.dataset.marketImageTitle=clean(target.name||record.name,140);
    button.dataset.marketImageSource=record.source;
    button.dataset.marketImageOfficial='1';
    button.setAttribute('aria-label',`Ampliar imagem oficial de ${clean(target.name||record.name,110)||'produto'}`);
    let image=button.querySelector('img');
    if(!image){image=document.createElement('img');button.replaceChildren(image);}
    image.src=record.imageUrl;
    image.alt='';
    image.loading='lazy';
    image.decoding='async';
    image.referrerPolicy='no-referrer';
    card.dataset.marketOfficialImage='done';
    card.dataset.marketImageLibrary='hit';
    return true;
  }

  async function captureCard(card,target){
    const image=card.querySelector('.market-product-photo img');
    if(!image)return null;
    const imageUrl=safeOfficialImageUrl(image.currentSrc||image.src,target.marketId,target.pid);
    if(!imageUrl)return null;
    const sourceLink=card.querySelector('.market-result-source[href]');
    const sourceUrl=safeProductUrl(sourceLink?.href||target.sourceUrl,target.marketId,target.pid);
    const stored=await remember({
      marketId:target.marketId,pid:target.pid,name:target.name,pack:target.pack,
      imageUrl,sourceUrl,source:`${target.label} · imagem oficial`
    },target);
    if(stored)card.dataset.marketImageLibrary='stored';
    return stored;
  }

  async function auditCard(card){
    const target=targetFromCard(card);if(!target)return;
    const current=card.querySelector('.market-product-photo img');
    const official=safeOfficialImageUrl(current?.currentSrc||current?.src||'',target.marketId,target.pid);
    if(official){await captureCard(card,target);return;}
    const cached=await get(target);
    if(cached)applyRecordToCard(card,target,cached);
  }

  function scan(){
    document.querySelectorAll(CARD_SELECTOR).forEach(card=>{void auditCard(card);});
  }

  function scheduleScan(){
    if(scanQueued)return;
    scanQueued=true;
    requestAnimationFrame(()=>{scanQueued=false;scan();});
  }

  function install(){
    void prune();
    scan();
    if(document.body&&!observer){
      observer=new MutationObserver(mutations=>{
        let needsScan=false;
        for(const mutation of mutations){
          if(mutation.type==='attributes'){
            const card=mutation.target?.closest?.('[data-market-product-card]');
            if(card){void auditCard(card);continue;}
          }
          if(mutation.type==='childList'&&mutation.addedNodes.length)needsScan=true;
        }
        if(needsScan)scheduleScan();
      });
      observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
    }
  }

  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
    else install();
  }
  if(root.addEventListener)root.addEventListener('pageshow',()=>{void prune();});

  root.CDCMarketImageLibrary=Object.freeze({
    revision:REVISION,get,remember,forget,stats,prune,listRecords,auditAll,identity,safeProductUrl,safeOfficialImageUrl,audit:scheduleScan
  });
})(globalThis);

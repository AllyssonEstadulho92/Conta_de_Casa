'use strict';

/*
 * Conta de Casa — biblioteca persistente de imagens oficiais do Mercado (75-image-library1)
 *
 * Guarda apenas metadados de fotografias oficiais já validadas para o SKU exato
 * de Continente/Pingo Doce. Não copia binários dos retalhistas para o repositório,
 * não lê/escreve o estado financeiro e não altera preços.
 */
(function installMarketImageLibrary(root){
  const REVISION='75-image-library1';
  const DB_NAME='conta-de-casa-market-image-library';
  const DB_VERSION=1;
  const STORE='images';
  const POSITIVE_TTL_MS=45*24*60*60*1000;
  const memory=new Map();
  let dbPromise=null;

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
        if(host!=='static.pingodoce.pt'||!path.includes('/Sites-pingo-doce-master/'))return '';
        if(!/\/images\/(?:large|medium|small)\//i.test(path)||!/\.(?:jpe?g|png|webp)$/i.test(path))return '';
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
    if(!db)return {revision:REVISION,count:memory.size,persistent:false};
    return new Promise(resolve=>{
      let tx;try{tx=db.transaction(STORE,'readonly');}catch(_error){resolve({revision:REVISION,count:memory.size,persistent:false});return;}
      const request=tx.objectStore(STORE).count();
      request.onsuccess=()=>resolve({revision:REVISION,count:Number(request.result)||0,persistent:true});
      request.onerror=()=>resolve({revision:REVISION,count:memory.size,persistent:false});
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

  if(root.addEventListener)root.addEventListener('pageshow',()=>{void prune();},{once:true});

  root.CDCMarketImageLibrary=Object.freeze({
    revision:REVISION,get,remember,forget,stats,prune,identity,safeProductUrl,safeOfficialImageUrl
  });
})(globalThis);

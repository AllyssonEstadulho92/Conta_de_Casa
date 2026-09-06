'use strict';

/*
 * Conta de Casa — bridge de imagens oficiais do Mercado (v61)
 *
 * Motivo desta camada:
 * market-experience.js mantém o catálogo/resultById dentro de um IIFE. A camada v60
 * tentava reatribuir funções e ler estruturas que não são globais, pelo que esses
 * pontos de integração não existiam no browser real. Este bridge usa apenas o
 * contrato que existe de facto: DOM do catálogo, pid presente em data-market-product-card,
 * cesta.pt e a API pública CDCMarketImages para o visualizador.
 *
 * Segurança:
 * - o reader recebe apenas URLs oficiais devolvidas por cesta.pt e validadas por pid;
 * - a resposta só pode fornecer imagens dos catálogos oficiais com o pid exato;
 * - a chamada a r.jina.ai é um GET CORS simples: sem cabeçalhos X-* que provoquem
 *   preflight no Safari;
 * - não são enviados PIN, chaves, token GitHub, faturas ou valores do cofre.
 */
(function installOfficialMarketImageBridge(root){
  const CESTA_MCP_URL='https://cesta.pt/mcp';
  const JINA_READER_ORIGIN='https://r.jina.ai';
  const REQUEST_TIMEOUT_MS=12000;
  const IMAGE_TIMEOUT_MS=10000;
  const MAX_CONCURRENT=3;
  const STORE_IDS=Object.freeze({'pingo-doce':'pingodoce',continente:'continente'});

  const catalogCache=new Map();
  const resolvedCache=new Map();
  const inFlight=new Map();
  const queue=[];
  let active=0;
  let cestaReadyPromise=null;
  let mutationObserver=null;
  let visibilityObserver=null;
  let scanQueued=false;

  const clean=(value,max=180)=>String(value??'')
    .replace(/[\u0000-\u001f\u007f]/g,' ')
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,max);
  const norm=value=>clean(value,260)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLocaleLowerCase('pt-PT');

  function parseCardId(value){
    const match=/^cesta-(continente|pingo-doce)-(\d{4,32})$/i.exec(clean(value,100));
    return match?{marketId:match[1].toLowerCase(),pid:match[2]}:null;
  }

  function retailerDescriptor(value){
    if(!value)return null;
    try{
      const url=new URL(String(value));
      if(url.protocol!=='https:')return null;
      const host=url.hostname.toLowerCase();
      const path=decodeURIComponent(url.pathname);
      if((host==='continente.pt'||host==='www.continente.pt')&&path.startsWith('/produto/')){
        const pid=path.match(/-(\d{4,32})\.html$/i)?.[1]||'';
        return pid?{marketId:'continente',pid,url:url.href.slice(0,900),label:'Continente'}:null;
      }
      if((host==='pingodoce.pt'||host==='www.pingodoce.pt')&&path.includes('/home/produtos/')){
        const pid=path.match(/-(\d{4,32})\.html$/i)?.[1]||'';
        return pid?{marketId:'pingo-doce',pid,url:url.href.slice(0,900),label:'Pingo Doce'}:null;
      }
      return null;
    }catch(_error){return null;}
  }

  function safeProductUrl(value,marketId='',pid=''){
    const descriptor=retailerDescriptor(value);
    if(!descriptor)return '';
    if(marketId&&descriptor.marketId!==marketId)return '';
    if(pid&&descriptor.pid!==String(pid))return '';
    return descriptor.url;
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
        if(host!=='www.continente.pt')return '';
        if(!path.includes('/Sites-col-master-catalog/'))return '';
        if(!/\.(?:jpe?g|png|webp)$/i.test(path))return '';
        if(/noimage|fallback/i.test(path))return '';
        if(id&&!new RegExp(`(?:/|_)${id}(?:[-_.]|$)`).test(path))return '';
        return url.href.slice(0,1100);
      }
      if(marketId==='pingo-doce'){
        if(host!=='static.pingodoce.pt')return '';
        if(!path.includes('/Sites-pingo-doce-master/'))return '';
        if(!/\/images\/(?:large|medium|small)\//i.test(path))return '';
        if(!/\.(?:jpe?g|png|webp)$/i.test(path))return '';
        if(id&&!path.split('/').some(segment=>segment.startsWith(`${id}_`)||segment.startsWith(`${id}-`)||segment.startsWith(`${id}.`)))return '';
        return url.href.slice(0,1100);
      }
      return '';
    }catch(_error){return '';}
  }

  function extractUrls(value){
    const source=String(value||'').replace(/\\\//g,'/').replace(/&amp;/g,'&');
    const found=source.match(/https?:\/\/[^\s"'<>\\)]+/g)||[];
    return [...new Set(found.map(item=>item.replace(/[},\]]+$/g,'')))].slice(0,240);
  }

  function selectOfficialImage(body,target){
    const candidates=[];
    for(const raw of extractUrls(body)){
      const safe=safeOfficialImageUrl(raw,target.marketId,target.pid);
      if(!safe)continue;
      let priority=0;
      if(target.marketId==='continente'){
        if(/-frente\./i.test(safe))priority+=8;
        if(/[?&]sw=2000\b/i.test(safe))priority+=3;
        if(/\/dw\/image\/v2\//i.test(safe))priority+=2;
      }else{
        if(/\/images\/large\//i.test(safe))priority+=8;
        if(/\/images\/medium\//i.test(safe))priority+=3;
      }
      candidates.push({url:safe,priority});
    }
    candidates.sort((a,b)=>b.priority-a.priority||a.url.length-b.url.length);
    return candidates[0]?.url||'';
  }

  async function timedFetch(url,options={}){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
    try{
      return await fetch(url,{...options,signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
    }finally{clearTimeout(timer);}
  }

  function parseSse(text){
    const events=[];
    for(const block of String(text||'').split(/\n\n+/)){
      const data=block.split('\n').filter(line=>line.startsWith('data:')).map(line=>line.slice(5).trim()).join('\n');
      if(!data)continue;
      try{events.push(JSON.parse(data));}catch(_error){}
    }
    return events;
  }

  async function cestaRpc(payload){
    const response=await timedFetch(CESTA_MCP_URL,{
      method:'POST',
      headers:{Accept:'application/json, text/event-stream','Content-Type':'application/json','MCP-Protocol-Version':'2025-06-18'},
      body:JSON.stringify(payload)
    });
    if(!response.ok)throw new Error(`official-image-cesta-${response.status}`);
    const text=await response.text();
    const event=parseSse(text)[0]||null;
    if(event?.error)throw new Error('official-image-cesta-rpc');
    return event;
  }

  function ensureCestaReady(){
    if(cestaReadyPromise)return cestaReadyPromise;
    cestaReadyPromise=(async()=>{
      await cestaRpc({jsonrpc:'2.0',id:6101,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'Conta de Casa official image bridge',version:'61'}}});
      await cestaRpc({jsonrpc:'2.0',method:'notifications/initialized'}).catch(()=>null);
      return true;
    })().catch(error=>{cestaReadyPromise=null;throw error;});
    return cestaReadyPromise;
  }

  function parseCatalogRecords(text){
    const lines=String(text||'').split('\n');
    const records=[];
    for(let index=0;index<lines.length;index+=1){
      const line=lines[index].trim();
      const match=/^-\s*(Pingo Doce|Continente)\s*·.*?\s*·\s*pid\s+(\d{4,32})\s*$/i.exec(line);
      if(!match)continue;
      const marketId=/continente/i.test(match[1])?'continente':'pingo-doce';
      const pid=match[2];
      const sourceUrl=safeProductUrl(clean(lines[index+1]||'',900),marketId,pid);
      if(!sourceUrl)continue;
      records.push({marketId,pid,sourceUrl,label:marketId==='continente'?'Continente':'Pingo Doce'});
      index+=1;
    }
    return records;
  }

  async function searchCatalog(query,marketIds=['pingo-doce','continente']){
    const q=clean(query,100);
    if(q.length<2)return [];
    await ensureCestaReady();
    const stores=marketIds.map(id=>STORE_IDS[id]).filter(Boolean);
    const event=await cestaRpc({
      jsonrpc:'2.0',id:6102,method:'tools/call',
      params:{name:'search_products',arguments:{query:q,stores,limit:20}}
    });
    const text=event?.result?.content?.find(item=>item?.type==='text')?.text||'';
    return parseCatalogRecords(text);
  }

  function queryKey(){return norm(document.querySelector('#marketCatalogSearch')?.value||'');}

  function catalogForCurrentQuery(){
    const key=queryKey();
    if(!key)return Promise.resolve(new Map());
    if(catalogCache.has(key))return catalogCache.get(key);
    const promise=searchCatalog(key).then(records=>new Map(records.map(record=>[`${record.marketId}|${record.pid}`,record])))
      .catch(()=>new Map());
    catalogCache.set(key,promise);
    return promise;
  }

  async function findRecord(target){
    const bulk=await catalogForCurrentQuery();
    const exact=bulk.get(`${target.marketId}|${target.pid}`);
    if(exact)return exact;
    const records=await searchCatalog(target.name,[target.marketId]).catch(()=>[]);
    return records.find(record=>record.marketId===target.marketId&&record.pid===target.pid)||null;
  }

  async function readRetailerPage(sourceUrl){
    // Accept é um cabeçalho CORS safelisted. Não usar X-Retain-Images/X-With-Images-Summary:
    // esses cabeçalhos personalizados obrigam a preflight e foram o ponto frágil no Safari.
    const response=await timedFetch(`${JINA_READER_ORIGIN}/${sourceUrl}`,{method:'GET',headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error(`official-image-reader-${response.status}`);
    return response.text();
  }

  function canLoadImage(url){
    if(typeof Image!=='function')return Promise.resolve(true);
    return new Promise(resolve=>{
      const image=new Image();
      let done=false;
      const finish=value=>{if(done)return;done=true;clearTimeout(timer);image.onload=null;image.onerror=null;resolve(value);};
      const timer=setTimeout(()=>finish(false),IMAGE_TIMEOUT_MS);
      image.referrerPolicy='no-referrer';
      image.decoding='async';
      image.onload=()=>finish(true);
      image.onerror=()=>finish(false);
      image.src=url;
    });
  }

  function targetFromCard(card){
    const identity=parseCardId(card?.dataset?.marketProductCard||'');
    if(!identity)return null;
    const name=clean(card.querySelector('.market-product-copy h3')?.textContent||'',130);
    const rawPack=clean(card.querySelector('.market-product-copy>p')?.textContent||'',100);
    const pack=rawPack.replace(/\s*·\s*(Pingo Doce|Continente)\s*$/i,'').trim();
    if(!name)return null;
    return {...identity,name,pack,label:identity.marketId==='continente'?'Continente':'Pingo Doce',cardId:clean(card.dataset.marketProductCard,100)};
  }

  function queued(task){return new Promise((resolve,reject)=>{queue.push({task,resolve,reject});runQueue();});}
  function runQueue(){
    while(active<MAX_CONCURRENT&&queue.length){
      const entry=queue.shift();active+=1;
      Promise.resolve().then(entry.task).then(entry.resolve,entry.reject).finally(()=>{active-=1;runQueue();});
    }
  }

  async function resolveOfficialUnqueued(target){
    const record=await findRecord(target);
    if(!record)return null;
    const sourceUrl=safeProductUrl(record.sourceUrl,target.marketId,target.pid);
    if(!sourceUrl)return null;
    const body=await readRetailerPage(sourceUrl);
    const imageUrl=selectOfficialImage(body,target);
    if(!imageUrl)return null;
    if(!(await canLoadImage(imageUrl)))return null;
    return {imageUrl,sourceUrl,source:`${target.label} · imagem oficial`,marketId:target.marketId,pid:target.pid,name:target.name};
  }

  function resolveOfficial(target){
    const key=`${target.marketId}|${target.pid}`;
    if(resolvedCache.has(key))return Promise.resolve(resolvedCache.get(key));
    if(inFlight.has(key))return inFlight.get(key);
    const promise=queued(()=>resolveOfficialUnqueued(target)).then(result=>{
      if(result)resolvedCache.set(key,result);
      return result||null;
    }).finally(()=>inFlight.delete(key));
    inFlight.set(key,promise);
    return promise;
  }

  function updateStoreAction(card,target){
    const control=card?.querySelector('.market-result-source');
    if(!control)return;
    const label=target?.label||'loja';
    const span=control.querySelector('span');
    if(span)span.textContent=`Ver no ${label}`;
    control.setAttribute('aria-label',`Abrir página do produto no ${label}`);
    control.dataset.marketSourceMeaning='retailer-page';
  }

  function applyImageToPhoto(photo,{imageUrl,name,source}){
    if(!photo||!imageUrl)return null;
    const imageSource=safeOfficialImageUrl(imageUrl,
      source?.startsWith('Continente')?'continente':source?.startsWith('Pingo Doce')?'pingo-doce':'',
      parseCardId(photo.closest?.('[data-market-product-card]')?.dataset?.marketProductCard||'')?.pid||'');
    const safe=imageSource||imageUrl;
    let button=photo.matches?.('button.market-product-photo')?photo:null;
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.className=`${photo.className||'market-product-photo'} market-product-photo-button`.replace(/\bis-empty\b/g,'').replace(/\s+/g,' ').trim();
      photo.replaceWith(button);
    }
    button.classList.remove('is-empty');
    button.dataset.marketImageOpen=safe;
    button.dataset.marketImageTitle=clean(name,140);
    button.dataset.marketImageSource=clean(source,100);
    button.dataset.marketImageOfficial='1';
    button.setAttribute('aria-label',`Ampliar imagem oficial de ${clean(name,110)||'produto'}`);
    let image=button.querySelector('img');
    if(!image){image=document.createElement('img');button.replaceChildren(image);}
    image.src=safe;image.alt='';image.loading='lazy';image.decoding='async';image.referrerPolicy='no-referrer';
    return button;
  }

  function applyToCard(card,target,result){
    if(!card?.isConnected||!result?.imageUrl)return;
    const photo=card.querySelector('.market-product-photo');
    if(!photo)return;
    applyImageToPhoto(photo,{imageUrl:result.imageUrl,name:target.name,source:result.source});
    card.dataset.marketOfficialImage='done';
  }

  function ensureCard(card){
    const target=targetFromCard(card);
    if(!target)return Promise.resolve(null);
    updateStoreAction(card,target);
    if(card.dataset.marketOfficialImage==='done')return Promise.resolve(resolvedCache.get(`${target.marketId}|${target.pid}`)||null);
    if(card.dataset.marketOfficialImage==='resolving')return inFlight.get(`${target.marketId}|${target.pid}`)||Promise.resolve(null);
    card.dataset.marketOfficialImage='resolving';
    return resolveOfficial(target).then(result=>{
      if(result)applyToCard(card,target,result);
      else card.dataset.marketOfficialImage='';
      return result;
    }).catch(()=>{card.dataset.marketOfficialImage='';return null;});
  }

  function currentMarketItems(){
    try{return typeof appState!=='undefined'&&Array.isArray(appState?.market)?appState.market:[];}catch(_error){return [];}
  }

  function waitForAddedItem(beforeLength,name,timeoutMs=4500){
    const started=Date.now();
    return new Promise(resolve=>{
      const check=()=>{
        const items=currentMarketItems();
        const added=items.slice(beforeLength).find(item=>norm(item?.name)===norm(name));
        if(added){resolve(added);return;}
        if(Date.now()-started>=timeoutMs){resolve(null);return;}
        setTimeout(check,60);
      };
      check();
    });
  }

  function persistResolvedItem(item,result){
    if(!item||!result?.imageUrl)return;
    item.imageUrl=result.imageUrl;
    item.imageSource=result.source;
    item.imageMatchedAt=new Date().toISOString();
    try{if(typeof saveState==='function')Promise.resolve(saveState()).catch(()=>{});}catch(_error){}
    setTimeout(()=>refreshSavedRows(item),0);
  }

  function refreshSavedRows(item){
    if(!item?.id||!item.imageUrl)return;
    document.querySelectorAll('#marketList .market-mobile-card,#marketList .market-table-row').forEach(row=>{
      const id=row.querySelector('[data-market-toggle]')?.dataset?.marketToggle||'';
      if(String(id)!==String(item.id))return;
      const photo=row.querySelector('.market-product-photo');
      if(photo)applyImageToPhoto(photo,{imageUrl:item.imageUrl,name:item.name,source:item.imageSource||'Imagem oficial'});
    });
  }

  function onAddCapture(event){
    const button=event.target.closest?.('[data-market-add-product]');
    if(!button)return;
    const card=button.closest('[data-market-product-card]');
    const target=targetFromCard(card);
    if(!card||!target)return;
    const beforeLength=currentMarketItems().length;
    const resolution=ensureCard(card);
    Promise.resolve(resolution).then(async result=>{
      if(!result)return;
      const item=await waitForAddedItem(beforeLength,target.name);
      if(item)persistResolvedItem(item,result);
    }).catch(()=>{});
  }

  function auditVisible(card){
    if(card.dataset.marketOfficialImageObserved==='1')return;
    card.dataset.marketOfficialImageObserved='1';
    const target=targetFromCard(card);if(target)updateStoreAction(card,target);
    if(typeof IntersectionObserver!=='function'){ensureCard(card);return;}
    if(!visibilityObserver){
      visibilityObserver=new IntersectionObserver(entries=>{
        for(const entry of entries){
          if(!entry.isIntersecting)continue;
          visibilityObserver.unobserve(entry.target);
          ensureCard(entry.target);
        }
      },{root:null,rootMargin:'900px 0px',threshold:.01});
    }
    visibilityObserver.observe(card);
  }

  function scan(){
    document.querySelectorAll('#marketCatalogResults [data-market-product-card]').forEach(auditVisible);
  }

  function scheduleScan(){
    if(scanQueued)return;scanQueued=true;
    requestAnimationFrame(()=>{scanQueued=false;scan();});
  }

  function install(){
    document.addEventListener('click',onAddCapture,true);
    scan();
    if(document.body&&!mutationObserver){
      mutationObserver=new MutationObserver(mutations=>{
        if(mutations.some(mutation=>mutation.type==='childList'&&mutation.addedNodes.length))scheduleScan();
      });
      mutationObserver.observe(document.body,{subtree:true,childList:true});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();

  root.CDCOfficialMarketImages=Object.freeze({
    parseCardId,
    safeProductUrl,
    safeOfficialImageUrl,
    parseCatalogRecords,
    resolve:target=>resolveOfficial({
      marketId:clean(target?.marketId||'',20),pid:clean(target?.pid||'',32),name:clean(target?.name||'',130),pack:clean(target?.pack||'',80),
      label:target?.marketId==='continente'?'Continente':'Pingo Doce'
    }),
    audit:scheduleScan
  });
})(globalThis);

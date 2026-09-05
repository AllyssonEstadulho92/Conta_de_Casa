'use strict';

/*
 * Conta de Casa — auditoria dinâmica de imagens de produto (v59)
 *
 * Objetivos:
 * - tornar todas as fotografias existentes ampliáveis;
 * - tentar resolver automaticamente miniaturas em falta por produto, nunca por uma
 *   imagem genérica inventada;
 * - priorizar correspondência por código de barras quando o item já o possui;
 * - para resultados Continente, tentar obter o EAN exato através do mesmo serviço
 *   cesta.pt já usado pelo Mercado antes de recorrer à correspondência textual;
 * - usar apenas bases públicas da família Open Facts, sem proxy de páginas de lojas,
 *   sem cookies, credenciais ou dados financeiros.
 *
 * Os preços e as ligações oficiais continuam a vir do fluxo cesta.pt. Esta camada
 * trata somente a fotografia de referência.
 */
(function installMarketImageAudit(root){
  const REQUEST_TIMEOUT_MS=9000;
  const MAX_RESULTS=14;
  const MAX_CONCURRENT_RESOLUTIONS=3;
  const MIN_MATCH_SCORE=.74;
  const CESTA_MCP_URL='https://cesta.pt/mcp';
  const IMAGE_HOST_SUFFIXES=Object.freeze([
    '.openfoodfacts.org',
    '.openbeautyfacts.org',
    '.openproductsfacts.org',
    '.openpetfoodfacts.org'
  ]);
  const SOURCES=Object.freeze({
    food:Object.freeze({id:'food',label:'Open Food Facts',base:'https://world.openfoodfacts.org'}),
    beauty:Object.freeze({id:'beauty',label:'Open Beauty Facts',base:'https://world.openbeautyfacts.org'}),
    products:Object.freeze({id:'products',label:'Open Products Facts',base:'https://world.openproductsfacts.org'}),
    pet:Object.freeze({id:'pet',label:'Open Pet Food Facts',base:'https://world.openpetfoodfacts.org'})
  });

  const resolutionCache=new Map();
  const resolutionByName=new Map();
  const inFlight=new Map();
  const queue=[];
  let activeResolvers=0;
  let auditQueued=false;
  let observer=null;
  let persistTimer=0;
  let cestaReadyPromise=null;

  const clean=(value,max=180)=>String(value??'')
    .replace(/[\u0000-\u001f\u007f]/g,' ')
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,max);
  const normalized=value=>clean(value,240)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLocaleLowerCase('pt-PT');

  function safeImageUrl(value){
    if(!value)return '';
    try{
      const url=new URL(String(value));
      const host=url.hostname.toLowerCase();
      const allowed=url.protocol==='https:'&&IMAGE_HOST_SUFFIXES.some(suffix=>host===suffix.slice(1)||host.endsWith(suffix));
      if(!allowed||!url.pathname.includes('/images/'))return '';
      return url.href.slice(0,900);
    }catch(_error){return '';}
  }

  // Alarga o sanitizador já usado pelo Mercado às restantes bases Open Facts.
  try{safeProductImageUrl=safeImageUrl;}catch(_error){}
  try{root.safeProductImageUrl=safeImageUrl;}catch(_error){}

  function fetchJson(url){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
    return fetch(url,{
      method:'GET',
      headers:{Accept:'application/json'},
      credentials:'omit',
      referrerPolicy:'no-referrer',
      cache:'no-store',
      signal:controller.signal
    }).then(response=>{
      if(!response.ok)throw new Error(`image-audit-http-${response.status}`);
      return response.json();
    }).finally(()=>clearTimeout(timer));
  }

  function parseSseEvents(text){
    const events=[];
    for(const block of String(text||'').split(/\n\n+/)){
      const data=block.split('\n').filter(line=>line.startsWith('data:')).map(line=>line.slice(5).trim()).join('\n');
      if(!data)continue;
      try{events.push(JSON.parse(data));}catch(_error){}
    }
    return events;
  }

  async function cestaRpc(payload){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
    try{
      const response=await fetch(CESTA_MCP_URL,{
        method:'POST',
        headers:{'Accept':'application/json, text/event-stream','Content-Type':'application/json','MCP-Protocol-Version':'2025-06-18'},
        credentials:'omit',
        referrerPolicy:'no-referrer',
        cache:'no-store',
        body:JSON.stringify(payload),
        signal:controller.signal
      });
      if(!response.ok)throw new Error(`cesta-image-http-${response.status}`);
      const text=await response.text();
      if(!text.trim())return null;
      const event=parseSseEvents(text)[0]||null;
      if(event?.error)throw new Error('cesta-image-rpc-error');
      return event;
    }finally{clearTimeout(timer);}
  }

  function ensureCestaReady(){
    if(cestaReadyPromise)return cestaReadyPromise;
    cestaReadyPromise=(async()=>{
      await cestaRpc({jsonrpc:'2.0',id:901,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'Conta de Casa image audit',version:'59'}}});
      await cestaRpc({jsonrpc:'2.0',method:'notifications/initialized'}).catch(()=>null);
      return true;
    })().catch(error=>{cestaReadyPromise=null;throw error;});
    return cestaReadyPromise;
  }

  function extractProductCode(text){
    const raw=String(text||'');
    const labelled=raw.match(/\b(?:EAN|GTIN|c[oó]digo\s+de\s+barras)\D{0,18}(\d{8,14})\b/i);
    if(labelled)return labelled[1];
    const standalone=raw.match(/\b(\d{13})\b/);
    return standalone?.[1]||'';
  }

  async function retailerProductCode(target){
    if(target.marketId!=='continente'||!/^\d{4,32}$/.test(String(target.retailerProductId||'')))return '';
    try{
      await ensureCestaReady();
      const event=await cestaRpc({
        jsonrpc:'2.0',id:902,method:'tools/call',
        params:{name:'get_product',arguments:{store:'continente',pid:String(target.retailerProductId)}}
      });
      const text=event?.result?.content?.find(item=>item?.type==='text')?.text||'';
      return clean(extractProductCode(text),32);
    }catch(_error){return '';}
  }

  function tokenSet(value){
    const stop=new Set(['de','da','do','das','dos','e','a','o','com','sem','em','para','pack','emb','embalagem','un','unid','unidade','kg','g','gr','ml','cl','lt','l']);
    return new Set(normalized(value).split(/[^a-z0-9]+/).filter(token=>token.length>1&&!stop.has(token)));
  }

  function numericTokens(value){
    return new Set((normalized(value).match(/\d+(?:[.,]\d+)?/g)||[]).map(token=>token.replace(',','.')));
  }

  function candidateScore(target,candidate){
    const wanted=tokenSet(target.name);
    const offered=tokenSet(`${candidate.name} ${candidate.brands||''}`);
    if(!wanted.size||!offered.size)return 0;
    let common=0;
    wanted.forEach(token=>{if(offered.has(token))common+=1;});
    const coverage=common/wanted.size;
    const precision=common/offered.size;
    let score=coverage*.72+precision*.28;

    const a=normalized(target.name),b=normalized(candidate.name);
    if(a&&b&&a===b)score=Math.max(score,.99);
    else if(a&&b&&(a.includes(b)||b.includes(a)))score=Math.max(score,.88);

    const wantedNumbers=numericTokens(`${target.name} ${target.pack||''}`);
    const offeredNumbers=numericTokens(`${candidate.name} ${candidate.quantity||''}`);
    if(wantedNumbers.size&&offeredNumbers.size){
      const numberMatch=[...wantedNumbers].some(value=>offeredNumbers.has(value));
      score+=numberMatch ? .08 : -.28;
    }

    const brandTokens=tokenSet(candidate.brands||'');
    if(brandTokens.size){
      const brandMatch=[...brandTokens].some(token=>wanted.has(token));
      score+=brandMatch ? .08 : -.08;
    }
    return Math.max(0,Math.min(1,score));
  }

  function sourceOrder(target){
    const text=normalized(`${target.name} ${target.category||''}`);
    if(/\b(cao|gato|racao|animal|pet)\b/.test(text))return [SOURCES.pet,SOURCES.food,SOURCES.products];
    if(/\b(champo|shampoo|dentifrico|pasta de dentes|desodorizante|sabonete|gel de banho|creme corporal|higiene pessoal|cosmet)\b/.test(text))return [SOURCES.beauty,SOURCES.products,SOURCES.food];
    if(/\b(detergente|limpeza|compressa|penso|algodao|papel higienico|saco|esponja|fita adesiva|guardanapo|cozinha|casa)\b/.test(text))return [SOURCES.products,SOURCES.food,SOURCES.beauty];
    return [SOURCES.food,SOURCES.products,SOURCES.beauty];
  }

  function candidateFromProduct(product,source){
    if(!product||typeof product!=='object')return null;
    const imageUrl=safeImageUrl(product.image_front_small_url||product.image_front_url||product.image_small_url||product.image_url||'');
    const name=clean(product.product_name_pt||product.product_name||product.generic_name||'',130);
    if(!imageUrl||!name)return null;
    return {
      code:clean(product.code||'',32),
      name,
      brands:clean(product.brands||'',100),
      quantity:clean(product.quantity||'',60),
      imageUrl,
      source:source.label
    };
  }

  async function exactByCode(source,code){
    if(!/^\d{8,14}$/.test(String(code||'')))return null;
    const fields='code,product_name,product_name_pt,generic_name,brands,quantity,image_front_small_url,image_front_url,image_small_url,image_url';
    const url=`${source.base}/api/v2/product/${encodeURIComponent(code)}.json?fields=${encodeURIComponent(fields)}`;
    try{
      const payload=await fetchJson(url);
      return candidateFromProduct(payload?.product,source);
    }catch(_error){return null;}
  }

  async function searchSource(source,target){
    const url=new URL(`${source.base}/cgi/search.pl`);
    url.searchParams.set('search_terms',clean(`${target.name} ${target.pack||''}`,150));
    url.searchParams.set('search_simple','1');
    url.searchParams.set('action','process');
    url.searchParams.set('json','1');
    url.searchParams.set('page_size',String(MAX_RESULTS));
    url.searchParams.set('fields','code,product_name,product_name_pt,generic_name,brands,quantity,image_front_small_url,image_front_url,image_small_url,image_url');
    try{
      const payload=await fetchJson(url.href);
      const products=Array.isArray(payload?.products)?payload.products:[];
      return products.map(product=>candidateFromProduct(product,source)).filter(Boolean);
    }catch(_error){return [];}
  }

  function queued(task){
    return new Promise((resolve,reject)=>{
      queue.push({task,resolve,reject});
      runQueue();
    });
  }

  function runQueue(){
    while(activeResolvers<MAX_CONCURRENT_RESOLUTIONS&&queue.length){
      const entry=queue.shift();
      activeResolvers+=1;
      Promise.resolve().then(entry.task).then(entry.resolve,entry.reject).finally(()=>{
        activeResolvers-=1;
        runQueue();
      });
    }
  }

  function resolutionKey(target){
    return normalized([target.code||'',target.marketId||'',target.retailerProductId||'',target.name||'',target.pack||'',target.category||''].join('|'));
  }

  function nameKey(target){return normalized(target.name||'');}

  async function resolveImageUnqueued(target){
    const ordered=sourceOrder(target);
    let code=clean(target.code||'',32);
    if(!/^\d{8,14}$/.test(code))code=await retailerProductCode(target);
    if(/^\d{8,14}$/.test(code)){
      for(const source of ordered){
        const exact=await exactByCode(source,code);
        if(exact?.imageUrl)return {...exact,score:1,matchedBy:'code'};
      }
    }

    let best=null;
    for(const source of ordered){
      const candidates=await searchSource(source,target);
      for(const candidate of candidates){
        const score=candidateScore(target,candidate);
        if(!best||score>best.score)best={...candidate,score,matchedBy:'text'};
      }
      if(best&&best.score>=.9)break;
    }
    return best&&best.score>=MIN_MATCH_SCORE?best:null;
  }

  function resolveImage(target){
    const key=resolutionKey(target);
    const nKey=nameKey(target);
    if(resolutionCache.has(key))return Promise.resolve(resolutionCache.get(key));
    if(nKey&&resolutionByName.has(nKey))return Promise.resolve(resolutionByName.get(nKey));
    if(inFlight.has(key))return inFlight.get(key);
    const promise=queued(()=>resolveImageUnqueued(target)).then(result=>{
      const safeResult=result||null;
      resolutionCache.set(key,safeResult);
      if(nKey&&safeResult)resolutionByName.set(nKey,safeResult);
      return safeResult;
    }).finally(()=>inFlight.delete(key));
    inFlight.set(key,promise);
    return promise;
  }

  function icon(name,size=22){
    if(root.CDCIcons?.markup)return root.CDCIcons.markup(name,size);
    if(name==='close')return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 6-12 12M6 6l12 12"/></svg>`;
    return '';
  }

  function viewer(){
    let dialog=document.querySelector('#marketProductImageViewer');
    if(dialog)return dialog;
    dialog=document.createElement('dialog');
    dialog.id='marketProductImageViewer';
    dialog.className='market-product-image-viewer';
    dialog.setAttribute('aria-labelledby','marketProductImageViewerTitle');
    dialog.innerHTML=`<div class="market-product-image-viewer-shell">
      <header><div><small>Imagem do produto</small><strong id="marketProductImageViewerTitle"></strong></div><button type="button" class="market-product-image-viewer-close" data-market-image-close aria-label="Fechar imagem">${icon('close',22)}</button></header>
      <div class="market-product-image-viewer-stage"><img alt="" referrerpolicy="no-referrer"></div>
      <footer><span data-market-image-source></span><small>Toque fora da imagem ou use Esc para fechar.</small></footer>
    </div>`;
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
    dialog.addEventListener('cancel',event=>{event.preventDefault();dialog.close();});
    dialog.addEventListener('click',event=>{if(event.target.closest('[data-market-image-close]'))dialog.close();});
    document.body.appendChild(dialog);
    return dialog;
  }

  function openViewer(button){
    const url=safeImageUrl(button?.dataset?.marketImageOpen||'');
    if(!url)return;
    const dialog=viewer();
    const title=clean(button.dataset.marketImageTitle||'Produto',140);
    const source=clean(button.dataset.marketImageSource||'Imagem de referência verificada',100);
    const image=dialog.querySelector('img');
    dialog.querySelector('#marketProductImageViewerTitle').textContent=title;
    dialog.querySelector('[data-market-image-source]').textContent=source;
    image.src=url;
    image.alt=title?`Imagem ampliada de ${title}`:'Imagem ampliada do produto';
    if(!dialog.open)dialog.showModal();
  }

  function makePhotoButton(photo,{url,name,source}){
    const safe=safeImageUrl(url);
    if(!photo||!safe)return null;
    if(photo.matches?.('button[data-market-image-open]')){
      photo.dataset.marketImageOpen=safe;
      photo.dataset.marketImageTitle=clean(name,140);
      photo.dataset.marketImageSource=clean(source,100);
      return photo;
    }
    const button=document.createElement('button');
    button.type='button';
    button.className=`${photo.className||'market-product-photo'} market-product-photo-button`.replace(/\bis-empty\b/g,'').replace(/\s+/g,' ').trim();
    button.dataset.marketImageOpen=safe;
    button.dataset.marketImageTitle=clean(name,140);
    button.dataset.marketImageSource=clean(source,100);
    button.setAttribute('aria-label',`Ampliar imagem de ${clean(name,110)||'produto'}`);
    const image=photo.querySelector?.('img')||document.createElement('img');
    image.src=safe;
    image.alt='';
    image.loading='lazy';
    image.decoding='async';
    image.referrerPolicy='no-referrer';
    button.appendChild(image);
    photo.replaceWith(button);
    return button;
  }

  function markResolvedPhoto(photo,target,result){
    if(!photo?.isConnected||!result?.imageUrl)return;
    makePhotoButton(photo,{url:result.imageUrl,name:target.name,source:result.source});
  }

  function browserCardTarget(card){
    const name=clean(card.querySelector('.market-product-copy h3')?.textContent||'',130);
    const rawPack=clean(card.querySelector('.market-product-copy>p')?.textContent||'',100);
    const pack=rawPack.replace(/\s*·\s*(Pingo Doce|Continente)\s*$/i,'').trim();
    const id=clean(card.dataset.marketProductCard||'',100);
    const idMatch=/^cesta-(continente|pingo-doce)-(.+)$/.exec(id);
    return {
      name,pack,category:'',code:'',
      marketId:idMatch?.[1]||'',
      retailerProductId:clean(idMatch?.[2]||'',32)
    };
  }

  function auditBrowserCards(){
    document.querySelectorAll('#marketCatalogResults [data-market-product-card]').forEach(card=>{
      if(card.dataset.marketImageAudit==='done'||card.dataset.marketImageAudit==='resolving')return;
      const photo=card.querySelector('.market-product-photo');
      const target=browserCardTarget(card);
      if(!photo||!target.name)return;
      const existing=safeImageUrl(photo.querySelector('img')?.src||'');
      if(existing){
        makePhotoButton(photo,{url:existing,name:target.name,source:'Imagem de referência do produto'});
        card.dataset.marketImageAudit='done';
        return;
      }
      card.dataset.marketImageAudit='resolving';
      resolveImage(target).then(result=>{
        if(result)markResolvedPhoto(photo,target,result);
        card.dataset.marketImageAudit='done';
      }).catch(()=>{card.dataset.marketImageAudit='done';});
    });
  }

  function marketItemFromRow(row){
    const id=row.querySelector('[data-market-toggle]')?.dataset?.marketToggle||'';
    if(!id)return null;
    try{return (typeof appState!=='undefined'&&Array.isArray(appState?.market))?appState.market.find(item=>String(item.id)===String(id))||null:null;}
    catch(_error){return null;}
  }

  function schedulePersist(){
    clearTimeout(persistTimer);
    persistTimer=setTimeout(()=>{
      if(typeof saveState==='function')Promise.resolve(saveState()).catch(()=>{});
    },650);
  }

  function auditSavedRows(){
    document.querySelectorAll('#marketList .market-mobile-card,#marketList .market-table-row').forEach(row=>{
      if(row.dataset.marketImageAudit==='done'||row.dataset.marketImageAudit==='resolving')return;
      const photo=row.querySelector('.market-product-photo');
      const item=marketItemFromRow(row);
      if(!photo||!item?.name)return;
      const target={
        name:clean(item.name,130),
        pack:clean(`${item.quantity||''} ${item.unit||''}`,60),
        category:clean(item.category||'',80),
        code:clean(item.productCode||'',32),
        marketId:'',retailerProductId:''
      };
      const existing=safeImageUrl(item.imageUrl||photo.querySelector('img')?.src||'');
      if(existing){
        makePhotoButton(photo,{url:existing,name:target.name,source:clean(item.imageSource||'Imagem de referência do produto',100)});
        row.dataset.marketImageAudit='done';
        return;
      }
      row.dataset.marketImageAudit='resolving';
      resolveImage(target).then(result=>{
        if(result){
          markResolvedPhoto(photo,target,result);
          if(!safeImageUrl(item.imageUrl)||item.imageUrl!==result.imageUrl){
            item.imageUrl=result.imageUrl;
            item.imageSource=result.source;
            item.imageMatchedAt=new Date().toISOString();
            if(result.code&&!item.productCode)item.productCode=clean(result.code,32);
            schedulePersist();
          }
        }
        row.dataset.marketImageAudit='done';
      }).catch(()=>{row.dataset.marketImageAudit='done';});
    });
  }

  function scheduleAudit(){
    if(auditQueued)return;
    auditQueued=true;
    requestAnimationFrame(()=>{
      auditQueued=false;
      auditBrowserCards();
      auditSavedRows();
    });
  }

  function installObserver(){
    if(observer||!document.body)return;
    observer=new MutationObserver(mutations=>{
      if(mutations.some(mutation=>mutation.type==='childList'&&mutation.addedNodes.length))scheduleAudit();
    });
    observer.observe(document.body,{subtree:true,childList:true});
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-market-image-open]');
    if(!button)return;
    event.preventDefault();
    event.stopPropagation();
    openViewer(button);
  },true);

  const start=()=>{installObserver();scheduleAudit();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  root.CDCMarketImages=Object.freeze({
    safeImageUrl,
    resolveImage:target=>resolveImage({
      name:clean(target?.name||'',130),
      pack:clean(target?.pack||'',70),
      category:clean(target?.category||'',80),
      code:clean(target?.code||'',32),
      marketId:clean(target?.marketId||'',20),
      retailerProductId:clean(target?.retailerProductId||'',32)
    }),
    audit:scheduleAudit
  });
})(globalThis);

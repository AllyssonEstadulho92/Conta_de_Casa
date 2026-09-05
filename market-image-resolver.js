'use strict';

/* Conta de Casa v58 — resolução progressiva de fotografias de produto.
 * Prioridade visual:
 * 1) imagem oficial indexada a partir da página pública do retalhista;
 * 2) imagem exata por EAN/GTIN no Open Food Facts;
 * 3) correspondência textual forte no Open Food Facts.
 *
 * O browser não tenta ler HTML do Continente/Pingo Doce: essas páginas não
 * expõem CORS para a app. O índice oficial é produzido no deploy por GitHub
 * Actions e contém apenas URLs públicas das imagens, nunca binários.
 */
(function installMarketImageResolver(){
  const INDEX_URL='./market-image-index.json?v=58';
  const CESTA_URL='https://cesta.pt/mcp';
  const OFF_PRODUCT_URL='https://world.openfoodfacts.org/api/v2/product/';
  const OFF_SEARCH_URL='https://world.openfoodfacts.org/cgi/search.pl';
  const TIMEOUT_MS=10000;
  const EXACT_OFF_FIELDS='code,product_name,product_name_pt,brands,quantity,image_front_small_url,image_front_url';
  const retailerSourcePattern=/^retailer:(continente|pingo-doce):([A-Za-z0-9._-]{1,32})$/;

  let indexPromise=null;
  let cestaReadyPromise=null;
  let resultObserver=null;
  let listObserver=null;
  let saveTimer=0;
  const resultProducts=new Map();
  const resolving=new Map();

  const clean=(value,max=160)=>String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
  const normalized=value=>clean(value,240).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-PT');
  const tokens=value=>new Set(normalized(value).split(/[^a-z0-9]+/).filter(token=>token.length>1));

  function safeOfficialImageUrl(value){
    if(!value)return '';
    try{
      const url=new URL(String(value),location.href);
      if(url.protocol!=='https:')return '';
      const host=url.hostname.toLowerCase();
      const path=url.pathname.toLowerCase();
      if(['www.continente.pt','continente.pt'].includes(host)){
        if(!path.includes('/on/demandware.static/')&&!path.includes('/dw/image/'))return '';
        return url.href.slice(0,900);
      }
      if(['static.pingodoce.pt','www.pingodoce.pt','pingodoce.pt'].includes(host)){
        if(!path.includes('/on/demandware.static/')&&!path.includes('/dw/image/'))return '';
        return url.href.slice(0,900);
      }
      return '';
    }catch{return '';}
  }

  function safeReferenceImageUrl(value){
    return typeof safeProductImageUrl==='function'?safeProductImageUrl(value):'';
  }

  function safeDisplayImageUrl(value){return safeOfficialImageUrl(value)||safeReferenceImageUrl(value);}
  function sourceKey(product){
    const market=clean(product?.marketId,20);
    const pid=clean(product?.retailerPid,32);
    return ['continente','pingo-doce'].includes(market)&&pid?`retailer:${market}:${pid}`:'';
  }
  function indexKey(marketId,pid){return `${clean(marketId,20)}:${clean(pid,32)}`;}

  async function fetchJson(url,options={}){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);
    try{
      const response=await fetch(url,{...options,signal:controller.signal,cache:'no-store'});
      if(!response.ok)throw new Error(`http-${response.status}`);
      return await response.json();
    }finally{clearTimeout(timer);}
  }

  function normalizeIndex(payload){
    const map=new Map();
    const entries=Array.isArray(payload?.entries)?payload.entries:[];
    for(const entry of entries){
      const marketId=clean(entry?.marketId,20);
      const pid=clean(entry?.pid,32);
      const imageUrl=safeOfficialImageUrl(entry?.imageUrl);
      if(!['continente','pingo-doce'].includes(marketId)||!pid||!imageUrl)continue;
      map.set(indexKey(marketId,pid),{
        key:indexKey(marketId,pid),marketId,pid,imageUrl,
        name:clean(entry?.name,120),pack:clean(entry?.pack,80),sourceUrl:clean(entry?.sourceUrl,600)
      });
    }
    return map;
  }

  function loadIndex(){
    if(indexPromise)return indexPromise;
    indexPromise=fetchJson(INDEX_URL,{credentials:'same-origin'}).then(normalizeIndex).catch(()=>new Map());
    return indexPromise;
  }

  function parseSse(text){
    for(const block of String(text||'').split(/\n\n+/)){
      const raw=block.split('\n').filter(line=>line.startsWith('data:')).map(line=>line.slice(5).trim()).join('\n');
      if(!raw)continue;
      try{return JSON.parse(raw);}catch{}
    }
    return null;
  }

  async function cestaRpc(payload){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);
    try{
      const response=await fetch(CESTA_URL,{method:'POST',headers:{Accept:'application/json, text/event-stream','Content-Type':'application/json','MCP-Protocol-Version':'2025-06-18'},body:JSON.stringify(payload),signal:controller.signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
      if(!response.ok)throw new Error(`cesta-http-${response.status}`);
      const event=parseSse(await response.text());
      if(event?.error)throw new Error('cesta-rpc-error');
      return event;
    }finally{clearTimeout(timer);}
  }

  function ensureCestaReady(){
    if(cestaReadyPromise)return cestaReadyPromise;
    cestaReadyPromise=(async()=>{
      await cestaRpc({jsonrpc:'2.0',id:'image-init',method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'Conta de Casa images',version:'58'}}});
      await cestaRpc({jsonrpc:'2.0',method:'notifications/initialized'});
      return true;
    })().catch(error=>{cestaReadyPromise=null;throw error;});
    return cestaReadyPromise;
  }

  async function getCestaDetail(product){
    const pid=clean(product?.retailerPid,32);
    const market=product?.marketId==='pingo-doce'?'pingodoce':product?.marketId==='continente'?'continente':'';
    if(!pid||!market)return null;
    await ensureCestaReady();
    const event=await cestaRpc({jsonrpc:'2.0',id:`detail-${market}-${pid}`,method:'tools/call',params:{name:'get_product',arguments:{store:market,pid}}});
    const text=event?.result?.content?.find(item=>item?.type==='text')?.text||'';
    const ean=clean(text.match(/\bEAN:\s*([0-9]{8,14})/i)?.[1]||'',14);
    const brand=clean(text.match(/^Marca:\s*(.+)$/im)?.[1]||'',80);
    return {ean,brand};
  }

  async function exactOffImage(code){
    const gtin=String(code||'').replace(/\D/g,'').slice(0,14);
    if(![8,12,13,14].includes(gtin.length))return null;
    try{
      const url=new URL(`${OFF_PRODUCT_URL}${encodeURIComponent(gtin)}.json`);
      url.searchParams.set('fields',EXACT_OFF_FIELDS);
      const payload=await fetchJson(url.href,{headers:{Accept:'application/json'},credentials:'omit',referrerPolicy:'no-referrer'});
      if(Number(payload?.status)!==1||!payload?.product)return null;
      const product=payload.product;
      const imageUrl=safeReferenceImageUrl(product.image_front_small_url||product.image_front_url||'');
      if(!imageUrl)return null;
      return {productCode:gtin,imageUrl,imageSource:'Open Food Facts · EAN'};
    }catch{return null;}
  }

  function candidateScore(product,candidate){
    const wanted=tokens(`${product?.name||''} ${product?.pack||''}`);
    const offered=tokens(`${candidate?.name||''} ${candidate?.brands||''} ${candidate?.quantity||''}`);
    if(!wanted.size||!offered.size)return 0;
    let common=0;wanted.forEach(token=>{if(offered.has(token))common+=1;});
    let score=common/Math.max(wanted.size,offered.size);
    const a=normalized(product?.name),b=normalized(candidate?.name);
    if(a&&b&&a===b)score=Math.max(score,.96);
    else if(a&&b&&(a.includes(b)||b.includes(a)))score=Math.max(score,.86);
    const pack=normalized(product?.pack),quantity=normalized(candidate?.quantity);
    if(pack&&quantity&&(pack===quantity||pack.includes(quantity)||quantity.includes(pack)))score=Math.min(1,score+.08);
    return score;
  }

  async function targetedOffImage(product){
    const term=clean(`${product?.name||''} ${product?.pack||''}`,120);
    if(term.length<3)return null;
    try{
      const url=new URL(OFF_SEARCH_URL);
      url.searchParams.set('search_terms',term);
      url.searchParams.set('search_simple','1');
      url.searchParams.set('action','process');
      url.searchParams.set('json','1');
      url.searchParams.set('page_size','10');
      url.searchParams.set('fields',EXACT_OFF_FIELDS);
      const payload=await fetchJson(url.href,{headers:{Accept:'application/json'},credentials:'omit',referrerPolicy:'no-referrer'});
      const candidates=(Array.isArray(payload?.products)?payload.products:[]).map(item=>({
        code:clean(item?.code,32),name:clean(item?.product_name_pt||item?.product_name,120),brands:clean(item?.brands,90),quantity:clean(item?.quantity,60),imageUrl:safeReferenceImageUrl(item?.image_front_small_url||item?.image_front_url||'')
      })).filter(item=>item.name&&item.imageUrl);
      let best=null,bestScore=0;
      for(const candidate of candidates){const score=candidateScore(product,candidate);if(score>bestScore){best=candidate;bestScore=score;}}
      if(!best||bestScore<.86)return null;
      return {productCode:best.code,imageUrl:best.imageUrl,imageSource:'Open Food Facts · correspondência forte'};
    }catch{return null;}
  }

  function productCardById(id){
    return [...document.querySelectorAll('[data-market-product-card]')].find(card=>card.dataset.marketProductCard===String(id))||null;
  }
  function setPhoto(root,url,sourceLabel='Imagem real do produto'){
    const photo=root?.querySelector?.('.market-product-photo');
    const safe=safeDisplayImageUrl(url);
    if(!photo||!safe)return false;
    photo.classList.remove('is-empty');
    photo.innerHTML='';
    const img=document.createElement('img');
    img.src=safe;img.alt='';img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.title=sourceLabel;
    photo.appendChild(img);
    return true;
  }
  function updateSearchCard(product){
    const root=productCardById(product?.id);
    if(!root)return;
    if(product.officialImageUrl)setPhoto(root,product.officialImageUrl,'Imagem oficial do produto no retalhista');
    else if(product.imageUrl)setPhoto(root,product.imageUrl,product.imageSource||'Imagem real de referência');
  }

  async function resolveProduct(product){
    if(!product||!product.id)return product;
    const key=String(product.id);
    if(resolving.has(key))return resolving.get(key);
    const promise=(async()=>{
      const index=await loadIndex();
      const official=index.get(indexKey(product.marketId,product.retailerPid));
      if(official){product.officialImageUrl=official.imageUrl;updateSearchCard(product);}

      let reference=null;
      if(product.marketId==='continente'&&product.retailerPid){
        try{
          const detail=await getCestaDetail(product);
          if(detail?.ean)reference=await exactOffImage(detail.ean);
        }catch{}
      }
      if(!reference&&!safeReferenceImageUrl(product.imageUrl))reference=await targetedOffImage(product);
      if(reference){
        product.productCode=reference.productCode||product.productCode||'';
        product.imageUrl=reference.imageUrl;
        product.imageSource=reference.imageSource;
      }
      updateSearchCard(product);
      return product;
    })().finally(()=>resolving.delete(key));
    resolving.set(key,promise);
    return promise;
  }

  async function enrichForSave(product){
    if(!product)return product;
    try{
      await Promise.race([resolveProduct(product),new Promise(resolve=>setTimeout(resolve,3200))]);
    }catch{}
    return product;
  }

  function scheduleStateSave(){
    clearTimeout(saveTimer);
    saveTimer=setTimeout(()=>{
      if(typeof saveState==='function'&&typeof appState==='object'&&appState)saveState().catch(()=>{});
    },500);
  }

  function savedMatchScore(item,entry){
    const a=normalized(item?.name),b=normalized(entry?.name);
    if(!a||!b)return 0;
    if(a===b)return 1;
    if(a.includes(b)||b.includes(a))return .9;
    const aa=tokens(a),bb=tokens(b);let common=0;aa.forEach(token=>{if(bb.has(token))common+=1;});
    return common/Math.max(aa.size,bb.size);
  }

  function bestIndexMatch(item,index){
    let best=null,bestScore=0;
    for(const entry of index.values()){
      const score=savedMatchScore(item,entry);
      if(score>bestScore){best=entry;bestScore=score;}
    }
    return bestScore>=.9?best:null;
  }

  function rootsForSavedItem(id){
    const roots=[];
    document.querySelectorAll(`[data-edit-market="${String(id).replace(/["\\]/g,'')}"]`).forEach(button=>{
      const root=button.closest('.market-mobile-card, .market-table-row');
      if(root&&!roots.includes(root))roots.push(root);
    });
    return roots;
  }

  async function applySavedImages(){
    if(!appState?.market?.length)return;
    const index=await loadIndex();
    let changed=false;
    for(const item of appState.market){
      let entry=null;
      const source=retailerSourcePattern.exec(clean(item?.imageSource,80));
      if(source)entry=index.get(indexKey(source[1],source[2]))||null;
      if(!entry&&!safeReferenceImageUrl(item?.imageUrl)){
        entry=bestIndexMatch(item,index);
        if(entry){
          item.imageSource=`retailer:${entry.marketId}:${entry.pid}`;
          item.imageMatchedAt=new Date().toISOString();
          changed=true;
        }
      }
      if(entry)rootsForSavedItem(item.id).forEach(root=>setPhoto(root,entry.imageUrl,'Imagem oficial do produto no retalhista'));
    }
    if(changed)scheduleStateSave();
  }

  function observeSearchResults(results){
    resultProducts.clear();
    (Array.isArray(results)?results:[]).forEach(product=>resultProducts.set(String(product.id),product));
    resultObserver?.disconnect();
    if(!('IntersectionObserver' in window)){
      [...resultProducts.values()].slice(0,16).forEach(product=>resolveProduct(product));
      return;
    }
    resultObserver=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        resultObserver.unobserve(entry.target);
        const product=resultProducts.get(String(entry.target.dataset.marketProductCard));
        if(product)resolveProduct(product);
      }
    },{rootMargin:'280px 0px'});
    document.querySelectorAll('[data-market-product-card]').forEach(card=>resultObserver.observe(card));
  }

  function installListObserver(){
    const root=document.querySelector('#marketList');
    if(!root||listObserver)return;
    let timer=0;
    listObserver=new MutationObserver(()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>applySavedImages().catch(()=>{}),60);
    });
    listObserver.observe(root,{childList:true,subtree:true});
    applySavedImages().catch(()=>{});
  }

  window.addEventListener('cdc:market-results',event=>observeSearchResults(event.detail?.results));
  window.CDCMarketImages=Object.freeze({
    enrichForSave,
    sourceKey,
    safeOfficialImageUrl,
    safeDisplayImageUrl,
    applySavedImages
  });
  loadIndex().then(()=>applySavedImages()).catch(()=>{});
  installListObserver();
})();

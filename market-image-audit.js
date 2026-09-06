'use strict';

/*
 * Conta de Casa — auditoria de catálogo e imagens de produto (v60)
 *
 * Prioridade visual:
 * 1) imagem oficial do SKU no Continente/Pingo Doce, resolvida a partir da ligação
 *    oficial devolvida pelo cesta.pt;
 * 2) correspondência exata por GTIN/EAN nas bases Open Facts;
 * 3) correspondência textual forte nas bases Open Facts;
 * 4) placeholder, nunca uma imagem aproximada sem confiança suficiente.
 *
 * As páginas dos retalhistas não expõem CORS ao browser. Para ler apenas a página
 * pública do produto, esta camada usa Jina Reader como leitor restrito: a entrada é
 * validada para os dois domínios oficiais e a saída só é aceite quando a imagem
 * pertence ao CDN/catálogo oficial e contém o pid exato do SKU.
 */
(function installMarketImageAudit(root){
  const REQUEST_TIMEOUT_MS=10000;
  const MAX_RESULTS=14;
  const MAX_CONCURRENT_RESOLUTIONS=3;
  const MIN_MATCH_SCORE=.74;
  const MAX_CATALOG_RESULTS=40;
  const CESTA_MCP_URL='https://cesta.pt/mcp';
  const JINA_READER_ORIGIN='https://r.jina.ai';
  const OPEN_FACTS_SUFFIXES=Object.freeze([
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
  let visibilityObserver=null;
  let persistTimer=0;
  let cestaReadyPromise=null;

  const clean=(value,max=180)=>String(value??'')
    .replace(/[\u0000-\u001f\u007f]/g,' ')
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,max);
  const normalized=value=>clean(value,260)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLocaleLowerCase('pt-PT');

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

  function safeRetailerProductUrl(value){return retailerDescriptor(value)?.url||'';}

  function safeRetailerImageUrl(value,marketId='',pid=''){
    if(!value)return '';
    try{
      const url=new URL(String(value).replace(/&amp;/g,'&'));
      if(url.protocol!=='https:')return '';
      const host=url.hostname.toLowerCase();
      const path=decodeURIComponent(url.pathname);
      const id=String(pid||'').replace(/\D/g,'');
      if(marketId==='continente'||(!marketId&&host==='www.continente.pt')){
        if(host!=='www.continente.pt')return '';
        if(!path.includes('/Sites-col-master-catalog/'))return '';
        if(!/\.(?:jpe?g|png|webp)$/i.test(path))return '';
        if(/noimage|fallback/i.test(path))return '';
        if(id&&!new RegExp(`(?:/|_)${id}(?:[-_.]|$)`).test(path))return '';
        return url.href.slice(0,1000);
      }
      if(marketId==='pingo-doce'||(!marketId&&host==='static.pingodoce.pt')){
        if(host!=='static.pingodoce.pt')return '';
        if(!path.includes('/Sites-pingo-doce-master/'))return '';
        if(!/\/images\/(?:large|medium|small)\//i.test(path))return '';
        if(!/\.(?:jpe?g|png|webp)$/i.test(path))return '';
        if(id&&!new RegExp(`/${id}[_\-.]`).test(path))return '';
        return url.href.slice(0,1000);
      }
      return '';
    }catch(_error){return '';}
  }

  function safeImageUrl(value){
    if(!value)return '';
    const official=safeRetailerImageUrl(value);
    if(official)return official;
    try{
      const url=new URL(String(value));
      const host=url.hostname.toLowerCase();
      const allowed=url.protocol==='https:'&&OPEN_FACTS_SUFFIXES.some(suffix=>host===suffix.slice(1)||host.endsWith(suffix));
      if(!allowed||!url.pathname.includes('/images/'))return '';
      return url.href.slice(0,1000);
    }catch(_error){return '';}
  }

  // Mantém o contrato já usado por render/core, agora com os dois CDNs oficiais.
  try{safeProductImageUrl=safeImageUrl;}catch(_error){}
  try{root.safeProductImageUrl=safeImageUrl;}catch(_error){}

  function fetchJson(url,headers={Accept:'application/json'}){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
    return fetch(url,{
      method:'GET',
      headers,
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

  async function cestaRpc(payload,signal){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
    const onAbort=()=>controller.abort();
    signal?.addEventListener?.('abort',onAbort,{once:true});
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
    }finally{
      clearTimeout(timer);
      signal?.removeEventListener?.('abort',onAbort);
    }
  }

  function ensureCestaReady(){
    if(cestaReadyPromise)return cestaReadyPromise;
    cestaReadyPromise=(async()=>{
      await cestaRpc({jsonrpc:'2.0',id:9601,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'Conta de Casa retailer images',version:'60'}}});
      await cestaRpc({jsonrpc:'2.0',method:'notifications/initialized'}).catch(()=>null);
      return true;
    })().catch(error=>{cestaReadyPromise=null;throw error;});
    return cestaReadyPromise;
  }

  function euroCents(token){
    const normalizedToken=String(token||'').replace(/\s/g,'').replace('€','').replace(',','.');
    const value=Number(normalizedToken);
    return Number.isFinite(value)&&value>=0?Math.round(value*100):0;
  }

  function parseCatalogTextV60(text,markets=[]){
    const lines=String(text||'').split('\n');
    const out=[];
    const allowed=new Set(markets||[]);
    for(let i=0;i<lines.length;i+=1){
      const line=lines[i].trim();
      const m=/^-\s*(Pingo Doce|Continente)\s*·\s*(.*?)\s*·\s*(.*?)\s*·\s*([0-9]+(?:[.,][0-9]{1,2})?)€(.*?)·\s*pid\s+([^\s]+)\s*$/i.exec(line);
      if(!m)continue;
      const marketId=/continente/i.test(m[1])?'continente':'pingo-doce';
      if(allowed.size&&!allowed.has(marketId))continue;
      const name=clean(m[2],130),pack=clean(m[3],80),tail=m[5]||'',pid=clean(m[6],48);
      const currentCents=euroCents(m[4]);
      if(!name||!currentCents)continue;
      const next=clean(lines[i+1]||'',900);
      const sourceUrl=safeRetailerProductUrl(next);
      if(!sourceUrl)continue;
      const previousToken=tail.match(/antes\s+([0-9]+(?:[.,][0-9]{1,2})?)€/i)?.[1];
      const previousCents=previousToken?euroCents(previousToken):0;
      const discountRaw=tail.match(/-\s*(\d{1,2})%/)?.[1];
      const discount=discountRaw?Math.min(99,Math.max(0,Number(discountRaw)||0)):0;
      const promoUntil=tail.match(/promo\s+até\s+(\d{4}-\d{2}-\d{2})/i)?.[1]||'';
      const unitPrice=clean(tail.match(/·\s*([^·]+\/(?:kg|lt|l|un|100g|100ml))\s*/i)?.[1]||'',60);
      const checkedAt=new Date().toISOString();
      const desc=retailerDescriptor(sourceUrl);
      out.push({
        id:`cesta-${marketId}-${pid||`${normalized(name)}-${normalized(pack)}`}`,
        marketId,
        market:desc?.label||m[1],
        name,pack,currentCents,previousCents,discount,promoUntil,unitPrice,
        sourceUrl,
        sourceLabel:'Produto oficial',
        sourceCheckedAt:checkedAt,
        sourceEvidence:promoUntil?`Preço consultado agora · promoção até ${promoUntil}`:'Preço consultado agora',
        retailerProductId:desc?.pid||pid
      });
      i+=1;
      if(out.length>=MAX_CATALOG_RESULTS)break;
    }
    return out;
  }

  async function searchCatalogV60(query,markets,signal){
    await ensureCestaReady();
    const event=await cestaRpc({
      jsonrpc:'2.0',id:9602,method:'tools/call',
      params:{name:'search_products',arguments:{query:clean(query,120),stores:Array.isArray(markets)?markets:[],limit:20}}
    },signal);
    const text=event?.result?.content?.find(item=>item?.type==='text')?.text||'';
    return parseCatalogTextV60(text,markets).slice(0,MAX_CATALOG_RESULTS);
  }

  function installCatalogExpansion(){
    try{
      if(typeof searchCestaProducts==='function') searchCestaProducts=searchCatalogV60;
    }catch(_error){}
  }

  function extractProductCode(text){
    const raw=String(text||'');
    const labelled=raw.match(/\b(?:EAN|GTIN|c[oó]digo\s+de\s+barras)\D{0,18}(\d{8,14})\b/i);
    if(labelled)return labelled[1];
    return raw.match(/\b(\d{13})\b/)?.[1]||'';
  }

  async function retailerProductCode(target){
    if(target.marketId!=='continente'||!/^\d{4,32}$/.test(String(target.retailerProductId||'')))return '';
    try{
      await ensureCestaReady();
      const event=await cestaRpc({jsonrpc:'2.0',id:9603,method:'tools/call',params:{name:'get_product',arguments:{store:'continente',pid:String(target.retailerProductId)}}});
      const text=event?.result?.content?.find(item=>item?.type==='text')?.text||'';
      return clean(extractProductCode(text),32);
    }catch(_error){return '';}
  }

  function extractUrls(value){
    const source=String(value||'').replace(/\\\//g,'/').replace(/&amp;/g,'&');
    const found=source.match(/https?:\/\/[^\s"'<>\\)]+/g)||[];
    return [...new Set(found.map(item=>item.replace(/[},\]]+$/g,'')))].slice(0,180);
  }

  function selectRetailerImage(urls,descriptor){
    const candidates=[];
    for(const raw of urls){
      const safe=safeRetailerImageUrl(raw,descriptor.marketId,descriptor.pid);
      if(!safe)continue;
      let priority=0;
      if(descriptor.marketId==='continente'){
        if(/-frente\./i.test(safe))priority+=5;
        if(/[?&]sw=2000\b/i.test(safe))priority+=3;
        if(/\/dw\/image\/v2\//i.test(safe))priority+=2;
      }else{
        if(/\/images\/large\//i.test(safe))priority+=5;
        if(/\/images\/medium\//i.test(safe))priority+=2;
      }
      candidates.push({url:safe,priority});
    }
    candidates.sort((a,b)=>b.priority-a.priority||a.url.length-b.url.length);
    return candidates[0]?.url||'';
  }

  async function retailerImage(target){
    const descriptor=retailerDescriptor(target.retailerUrl||target.sourceUrl||'');
    if(!descriptor)return null;
    try{
      const payload=await fetchJson(`${JINA_READER_ORIGIN}/${descriptor.url}`,{
        Accept:'application/json',
        'X-With-Images-Summary':'true',
        'X-Retain-Images':'true'
      });
      const canonical=safeRetailerProductUrl(payload?.data?.url||descriptor.url);
      const canonicalDesc=retailerDescriptor(canonical);
      if(!canonicalDesc||canonicalDesc.marketId!==descriptor.marketId||canonicalDesc.pid!==descriptor.pid)return null;
      const imageUrl=selectRetailerImage(extractUrls(JSON.stringify(payload)),descriptor);
      if(!imageUrl)return null;
      return {
        code:'',name:clean(target.name,130),brands:'',quantity:clean(target.pack||'',60),
        imageUrl,
        source:`${descriptor.label} · imagem oficial`,
        score:1,
        matchedBy:'retailer',
        marketId:descriptor.marketId,
        retailerProductId:descriptor.pid,
        retailerUrl:descriptor.url
      };
    }catch(_error){return null;}
  }

  function tokenSet(value){
    const stop=new Set(['de','da','do','das','dos','e','a','o','com','sem','em','para','pack','emb','embalagem','un','unid','unidade','kg','g','gr','ml','cl','lt','l']);
    return new Set(normalized(value).split(/[^a-z0-9]+/).filter(token=>token.length>1&&!stop.has(token)));
  }
  function numericTokens(value){return new Set((normalized(value).match(/\d+(?:[.,]\d+)?/g)||[]).map(token=>token.replace(',','.')));}

  function candidateScore(target,candidate){
    const wanted=tokenSet(target.name),offered=tokenSet(`${candidate.name} ${candidate.brands||''}`);
    if(!wanted.size||!offered.size)return 0;
    let common=0;wanted.forEach(token=>{if(offered.has(token))common+=1;});
    const coverage=common/wanted.size,precision=common/offered.size;
    let score=coverage*.72+precision*.28;
    const a=normalized(target.name),b=normalized(candidate.name);
    if(a&&b&&a===b)score=Math.max(score,.99);
    else if(a&&b&&(a.includes(b)||b.includes(a)))score=Math.max(score,.88);
    const wantedNumbers=numericTokens(`${target.name} ${target.pack||''}`),offeredNumbers=numericTokens(`${candidate.name} ${candidate.quantity||''}`);
    if(wantedNumbers.size&&offeredNumbers.size)score+=[...wantedNumbers].some(value=>offeredNumbers.has(value))?.08:-.28;
    const brandTokens=tokenSet(candidate.brands||'');
    if(brandTokens.size)score+=[...brandTokens].some(token=>wanted.has(token))?.08:-.08;
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
    return {code:clean(product.code||'',32),name,brands:clean(product.brands||'',100),quantity:clean(product.quantity||'',60),imageUrl,source:source.label};
  }

  async function exactByCode(source,code){
    if(!/^\d{8,14}$/.test(String(code||'')))return null;
    const fields='code,product_name,product_name_pt,generic_name,brands,quantity,image_front_small_url,image_front_url,image_small_url,image_url';
    try{
      const payload=await fetchJson(`${source.base}/api/v2/product/${encodeURIComponent(code)}.json?fields=${encodeURIComponent(fields)}`);
      return candidateFromProduct(payload?.product,source);
    }catch(_error){return null;}
  }

  async function searchSource(source,target){
    const url=new URL(`${source.base}/cgi/search.pl`);
    url.searchParams.set('search_terms',clean(`${target.name} ${target.pack||''}`,150));
    url.searchParams.set('search_simple','1');url.searchParams.set('action','process');url.searchParams.set('json','1');
    url.searchParams.set('page_size',String(MAX_RESULTS));
    url.searchParams.set('fields','code,product_name,product_name_pt,generic_name,brands,quantity,image_front_small_url,image_front_url,image_small_url,image_url');
    try{
      const payload=await fetchJson(url.href);
      return (Array.isArray(payload?.products)?payload.products:[]).map(product=>candidateFromProduct(product,source)).filter(Boolean);
    }catch(_error){return [];}
  }

  function queued(task){return new Promise((resolve,reject)=>{queue.push({task,resolve,reject});runQueue();});}
  function runQueue(){
    while(activeResolvers<MAX_CONCURRENT_RESOLUTIONS&&queue.length){
      const entry=queue.shift();activeResolvers+=1;
      Promise.resolve().then(entry.task).then(entry.resolve,entry.reject).finally(()=>{activeResolvers-=1;runQueue();});
    }
  }

  function resolutionKey(target){return normalized([target.code||'',target.marketId||'',target.retailerProductId||'',target.retailerUrl||target.sourceUrl||'',target.name||'',target.pack||'',target.category||''].join('|'));}
  function nameKey(target){return normalized(target.name||'');}

  function catalogMatchScore(target,product){
    const a=normalized(target.name),b=normalized(product.name);
    if(!a||!b)return 0;
    if(a===b)return 1;
    const wanted=tokenSet(a),offered=tokenSet(b);
    if(!wanted.size||!offered.size)return 0;
    let common=0;wanted.forEach(token=>{if(offered.has(token))common+=1;});
    return (common/wanted.size)*.75+(common/offered.size)*.25;
  }

  async function findRetailerTarget(target){
    if(safeRetailerProductUrl(target.retailerUrl||target.sourceUrl||''))return target;
    if(!target.name)return target;
    try{
      const products=await searchCatalogV60(target.name,['continente','pingo-doce']);
      const ranked=products.map(product=>({product,score:catalogMatchScore(target,product)})).sort((a,b)=>b.score-a.score);
      if(!ranked[0]||ranked[0].score<.96)return target;
      if(ranked[1]&&ranked[1].score>=ranked[0].score-.015&&normalized(ranked[1].product.name)===normalized(ranked[0].product.name))return target;
      const picked=ranked[0].product;
      return {...target,marketId:picked.marketId,retailerProductId:picked.retailerProductId,retailerUrl:picked.sourceUrl,sourceUrl:picked.sourceUrl};
    }catch(_error){return target;}
  }

  async function resolveImageUnqueued(target){
    const withRetailer=await findRetailerTarget(target);
    const official=await retailerImage(withRetailer);
    if(official?.imageUrl)return official;

    const ordered=sourceOrder(withRetailer);
    let code=clean(withRetailer.code||'',32);
    if(!/^\d{8,14}$/.test(code))code=await retailerProductCode(withRetailer);
    if(/^\d{8,14}$/.test(code)){
      for(const source of ordered){
        const exact=await exactByCode(source,code);
        if(exact?.imageUrl)return {...exact,score:1,matchedBy:'code'};
      }
    }
    let best=null;
    for(const source of ordered){
      const candidates=await searchSource(source,withRetailer);
      for(const candidate of candidates){
        const score=candidateScore(withRetailer,candidate);
        if(!best||score>best.score)best={...candidate,score,matchedBy:'text'};
      }
      if(best&&best.score>=.9)break;
    }
    return best&&best.score>=MIN_MATCH_SCORE?best:null;
  }

  function resolveImage(target){
    const key=resolutionKey(target),nKey=nameKey(target);
    if(resolutionCache.has(key))return Promise.resolve(resolutionCache.get(key));
    if(nKey&&resolutionByName.has(nKey))return Promise.resolve(resolutionByName.get(nKey));
    if(inFlight.has(key))return inFlight.get(key);
    const promise=queued(()=>resolveImageUnqueued(target)).then(result=>{
      const safeResult=result||null;resolutionCache.set(key,safeResult);
      if(nKey&&safeResult)resolutionByName.set(nKey,safeResult);
      return safeResult;
    }).finally(()=>inFlight.delete(key));
    inFlight.set(key,promise);return promise;
  }

  function icon(name,size=22){
    if(root.CDCIcons?.markup)return root.CDCIcons.markup(name,size);
    if(name==='close')return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 6-12 12M6 6l12 12"/></svg>`;
    return '';
  }

  function viewer(){
    let dialog=document.querySelector('#marketProductImageViewer');
    if(dialog)return dialog;
    dialog=document.createElement('dialog');dialog.id='marketProductImageViewer';dialog.className='market-product-image-viewer';
    dialog.setAttribute('aria-labelledby','marketProductImageViewerTitle');
    dialog.innerHTML=`<div class="market-product-image-viewer-shell"><header><div><small>Imagem do produto</small><strong id="marketProductImageViewerTitle"></strong></div><button type="button" class="market-product-image-viewer-close" data-market-image-close aria-label="Fechar imagem">${icon('close',22)}</button></header><div class="market-product-image-viewer-stage"><img alt="" referrerpolicy="no-referrer"></div><footer><span data-market-image-source></span><small>Toque fora da imagem ou use Esc para fechar.</small></footer></div>`;
    dialog.addEventListener('click',event=>{if(event.target===dialog||event.target.closest('[data-market-image-close]'))dialog.close();});
    dialog.addEventListener('cancel',event=>{event.preventDefault();dialog.close();});document.body.appendChild(dialog);return dialog;
  }

  function openViewer(button){
    const url=safeImageUrl(button?.dataset?.marketImageOpen||'');if(!url)return;
    const dialog=viewer(),title=clean(button.dataset.marketImageTitle||'Produto',140),source=clean(button.dataset.marketImageSource||'Imagem do produto',100),image=dialog.querySelector('img');
    dialog.querySelector('#marketProductImageViewerTitle').textContent=title;dialog.querySelector('[data-market-image-source]').textContent=source;
    image.src=url;image.alt=title?`Imagem ampliada de ${title}`:'Imagem ampliada do produto';if(!dialog.open)dialog.showModal();
  }

  function makePhotoButton(photo,{url,name,source}){
    const safe=safeImageUrl(url);if(!photo||!safe)return null;
    if(photo.matches?.('button[data-market-image-open]')){
      photo.dataset.marketImageOpen=safe;photo.dataset.marketImageTitle=clean(name,140);photo.dataset.marketImageSource=clean(source,100);
      const img=photo.querySelector('img');if(img)img.src=safe;return photo;
    }
    const button=document.createElement('button');button.type='button';
    button.className=`${photo.className||'market-product-photo'} market-product-photo-button`.replace(/\bis-empty\b/g,'').replace(/\s+/g,' ').trim();
    button.dataset.marketImageOpen=safe;button.dataset.marketImageTitle=clean(name,140);button.dataset.marketImageSource=clean(source,100);
    button.setAttribute('aria-label',`Ampliar imagem de ${clean(name,110)||'produto'}`);
    const image=photo.querySelector?.('img')||document.createElement('img');image.src=safe;image.alt='';image.loading='lazy';image.decoding='async';image.referrerPolicy='no-referrer';
    button.appendChild(image);photo.replaceWith(button);return button;
  }

  function markResolvedPhoto(photo,target,result){if(photo?.isConnected&&result?.imageUrl)makePhotoButton(photo,{url:result.imageUrl,name:target.name,source:result.source});}

  function browserCardTarget(card){
    const name=clean(card.querySelector('.market-product-copy h3')?.textContent||'',130);
    const rawPack=clean(card.querySelector('.market-product-copy>p')?.textContent||'',100);
    const pack=rawPack.replace(/\s*·\s*(Pingo Doce|Continente)\s*$/i,'').trim();
    const id=clean(card.dataset.marketProductCard||'',100),idMatch=/^cesta-(continente|pingo-doce)-(.+)$/.exec(id);
    const sourceUrl=safeRetailerProductUrl(card.querySelector('.market-product-source[href]')?.href||'');
    const desc=retailerDescriptor(sourceUrl);
    return {name,pack,category:'',code:'',marketId:desc?.marketId||idMatch?.[1]||'',retailerProductId:desc?.pid||clean(idMatch?.[2]||'',32),retailerUrl:sourceUrl,sourceUrl};
  }

  function updateLiveProduct(card,result){
    if(!result?.imageUrl)return;
    try{
      if(typeof LIVE_PRODUCTS==='undefined'||!Array.isArray(LIVE_PRODUCTS))return;
      const item=LIVE_PRODUCTS.find(product=>String(product.id)===String(card.dataset.marketProductCard||''));
      if(!item)return;
      item.imageUrl=result.imageUrl;item.imageSource=result.source;item.imageMatchedAt=new Date().toISOString();
      if(result.code&&!item.productCode)item.productCode=clean(result.code,32);
    }catch(_error){}
  }

  function marketItemFromRow(row){
    const id=row.querySelector('[data-market-toggle]')?.dataset?.marketToggle||'';if(!id)return null;
    try{return (typeof appState!=='undefined'&&Array.isArray(appState?.market))?appState.market.find(item=>String(item.id)===String(id))||null:null;}catch(_error){return null;}
  }

  function schedulePersist(){clearTimeout(persistTimer);persistTimer=setTimeout(()=>{if(typeof saveState==='function')Promise.resolve(saveState()).catch(()=>{});},650);}

  async function auditBrowserCard(card){
    if(!card?.isConnected||card.dataset.marketImageAudit==='done'||card.dataset.marketImageAudit==='resolving')return;
    const photo=card.querySelector('.market-product-photo'),target=browserCardTarget(card);if(!photo||!target.name)return;
    const existing=safeImageUrl(photo.querySelector('img')?.src||'');if(existing)makePhotoButton(photo,{url:existing,name:target.name,source:'Imagem de referência do produto'});
    card.dataset.marketImageAudit='resolving';
    try{const result=await resolveImage(target);if(result){markResolvedPhoto(card.querySelector('.market-product-photo'),target,result);updateLiveProduct(card,result);}}finally{card.dataset.marketImageAudit='done';}
  }

  async function auditSavedRow(row){
    if(!row?.isConnected||row.dataset.marketImageAudit==='done'||row.dataset.marketImageAudit==='resolving')return;
    const photo=row.querySelector('.market-product-photo'),item=marketItemFromRow(row);if(!photo||!item?.name)return;
    const target={name:clean(item.name,130),pack:'',category:clean(item.category||'',80),code:clean(item.productCode||'',32),marketId:'',retailerProductId:'',retailerUrl:'',sourceUrl:''};
    const existing=safeImageUrl(item.imageUrl||photo.querySelector('img')?.src||'');
    if(existing)makePhotoButton(photo,{url:existing,name:target.name,source:clean(item.imageSource||'Imagem de referência do produto',100)});
    if(existing&&safeRetailerImageUrl(existing)){row.dataset.marketImageAudit='done';return;}
    row.dataset.marketImageAudit='resolving';
    try{
      const result=await resolveImage(target);
      if(result){
        markResolvedPhoto(row.querySelector('.market-product-photo'),target,result);
        if(item.imageUrl!==result.imageUrl){item.imageUrl=result.imageUrl;item.imageSource=result.source;item.imageMatchedAt=new Date().toISOString();if(result.code&&!item.productCode)item.productCode=clean(result.code,32);schedulePersist();}
      }
    }finally{row.dataset.marketImageAudit='done';}
  }

  function auditObservedNode(node){
    if(node.matches?.('[data-market-product-card]'))auditBrowserCard(node).catch(()=>{});
    else if(node.matches?.('.market-mobile-card,.market-table-row'))auditSavedRow(node).catch(()=>{});
  }

  function ensureVisibilityObserver(){
    if(visibilityObserver||typeof IntersectionObserver!=='function')return visibilityObserver;
    visibilityObserver=new IntersectionObserver(entries=>{
      for(const entry of entries){if(entry.isIntersecting){visibilityObserver.unobserve(entry.target);auditObservedNode(entry.target);}}
    },{root:null,rootMargin:'800px 0px',threshold:.01});
    return visibilityObserver;
  }

  function observeForAudit(node){
    if(node.dataset.marketImageAuditObserved==='1')return;
    node.dataset.marketImageAuditObserved='1';
    const io=ensureVisibilityObserver();if(io)io.observe(node);else auditObservedNode(node);
  }

  function auditBrowserCards(){document.querySelectorAll('#marketCatalogResults [data-market-product-card]').forEach(observeForAudit);}
  function auditSavedRows(){document.querySelectorAll('#marketList .market-mobile-card,#marketList .market-table-row').forEach(observeForAudit);}

  function scheduleAudit(){
    if(auditQueued)return;auditQueued=true;
    requestAnimationFrame(()=>{auditQueued=false;auditBrowserCards();auditSavedRows();});
  }

  function installObserver(){
    if(observer||!document.body)return;
    observer=new MutationObserver(mutations=>{if(mutations.some(mutation=>mutation.type==='childList'&&mutation.addedNodes.length))scheduleAudit();});
    observer.observe(document.body,{subtree:true,childList:true});
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-market-image-open]');if(!button)return;
    event.preventDefault();event.stopPropagation();openViewer(button);
  },true);

  // Garante que tocar em + não grava antes de a imagem oficial ter oportunidade de ser resolvida.
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-market-add]');if(!button||button.dataset.marketImageHandoff==='1')return;
    let product=null;
    try{product=typeof LIVE_PRODUCTS!=='undefined'&&Array.isArray(LIVE_PRODUCTS)?LIVE_PRODUCTS.find(item=>String(item.id)===String(button.dataset.marketAdd||'')):null;}catch(_error){}
    if(!product||!safeRetailerProductUrl(product.sourceUrl||'')||safeRetailerImageUrl(product.imageUrl||''))return;
    event.preventDefault();event.stopImmediatePropagation();button.dataset.marketImageHandoff='1';button.setAttribute('aria-busy','true');button.disabled=true;
    const desc=retailerDescriptor(product.sourceUrl);
    resolveImage({name:product.name,pack:product.pack,category:'',code:product.productCode||'',marketId:desc?.marketId||product.marketId,retailerProductId:desc?.pid||product.retailerProductId,retailerUrl:product.sourceUrl,sourceUrl:product.sourceUrl})
      .then(result=>{if(result){product.imageUrl=result.imageUrl;product.imageSource=result.source;product.imageMatchedAt=new Date().toISOString();if(result.code&&!product.productCode)product.productCode=result.code;}return typeof addProduct==='function'?addProduct(product.id):null;})
      .catch(()=>typeof addProduct==='function'?addProduct(product.id):null)
      .finally(()=>{if(button.isConnected){button.disabled=false;button.removeAttribute('aria-busy');button.dataset.marketImageHandoff='';}});
  },true);

  const start=()=>{installCatalogExpansion();installObserver();scheduleAudit();};
  installCatalogExpansion();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  root.CDCMarketImages=Object.freeze({
    safeImageUrl,
    safeRetailerProductUrl,
    safeRetailerImageUrl,
    parseCatalogTextV60,
    resolveImage:target=>resolveImage({
      name:clean(target?.name||'',130),pack:clean(target?.pack||'',70),category:clean(target?.category||'',80),code:clean(target?.code||'',32),
      marketId:clean(target?.marketId||'',20),retailerProductId:clean(target?.retailerProductId||'',32),
      retailerUrl:safeRetailerProductUrl(target?.retailerUrl||target?.sourceUrl||''),sourceUrl:safeRetailerProductUrl(target?.sourceUrl||target?.retailerUrl||'')
    }),
    audit:scheduleAudit
  });
})(globalThis);

'use strict';

/*
 * Conta de Casa — imagens oficiais dos retalhistas (v60)
 *
 * O browser nunca faz scraping das páginas do Continente/Pingo Doce. O build público
 * gera um índice same-origin a partir dos sitemaps oficiais publicados pelos próprios
 * retalhistas. Em runtime é descarregado apenas o pequeno shard correspondente ao PID
 * ou, para itens antigos sem PID, ao nome exato e não ambíguo do produto.
 * Open Facts continua disponível como fallback através da camada v59.
 */
(function installOfficialRetailerImages(root){
  const BUILD='60';
  const INDEX_BASE='./retailer-images';
  const shardCache=new Map();
  const inFlight=new Map();
  let observer=null;
  let auditQueued=false;
  let persistTimer=0;

  const clean=(value,max=180)=>String(value??'')
    .replace(/[\u0000-\u001f\u007f]/g,' ')
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,max);

  const normalizedName=value=>clean(value,180)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLocaleLowerCase('pt-PT')
    .replace(/[^a-z0-9]+/g,' ')
    .replace(/\s+/g,' ')
    .trim();

  function safeOfficialImageUrl(value){
    if(!value)return '';
    try{
      const url=new URL(String(value));
      const host=url.hostname.toLowerCase();
      if(url.protocol!=='https:')return '';
      if(host==='www.continente.pt'){
        if(!url.pathname.includes('/Sites-col-master-catalog/')||!url.pathname.includes('/images/col/'))return '';
        return url.href.slice(0,1000);
      }
      if(host==='static.pingodoce.pt'){
        if(!url.pathname.includes('/Sites-pingo-doce-master/')||!url.pathname.includes('/images/'))return '';
        return url.href.slice(0,1000);
      }
      return '';
    }catch(_error){return '';}
  }

  function safeCombinedProductImageUrl(value){
    const official=safeOfficialImageUrl(value);
    if(official)return official;
    if(!value)return '';
    try{
      const url=new URL(String(value));
      if(url.protocol!=='https:')return '';
      const host=url.hostname.toLowerCase();
      const openFacts=['.openfoodfacts.org','.openbeautyfacts.org','.openproductsfacts.org','.openpetfoodfacts.org'];
      if(!openFacts.some(suffix=>host===suffix.slice(1)||host.endsWith(suffix)))return '';
      if(!url.pathname.includes('/images/'))return '';
      return url.href.slice(0,1000);
    }catch(_error){return '';}
  }

  // A v59 alarga o sanitizador a Open Facts; a v60 acrescenta apenas os dois hosts
  // oficiais validados, mantendo essa mesma função para gravação no cofre.
  try{safeProductImageUrl=safeCombinedProductImageUrl;}catch(_error){}
  try{root.safeProductImageUrl=safeCombinedProductImageUrl;}catch(_error){}

  function normalizedMarketId(value){
    const id=clean(value,20).toLowerCase();
    return id==='continente'||id==='pingo-doce'?id:'';
  }

  function normalizedPid(value){
    const pid=clean(value,32);
    return /^\d{2,32}$/.test(pid)?pid:'';
  }

  function shardPrefix(pid){return String(pid).padStart(2,'0').slice(0,2);}
  function namePrefix(name){return (normalizedName(name).replace(/\s/g,'').slice(0,2)||'__').padEnd(2,'_');}

  async function loadJsonShard(cacheKey,url,market,field){
    if(shardCache.has(cacheKey))return shardCache.get(cacheKey);
    if(inFlight.has(cacheKey))return inFlight.get(cacheKey);
    const promise=fetch(url,{method:'GET',credentials:'same-origin',cache:'force-cache',headers:{Accept:'application/json'}})
      .then(async response=>{
        if(response.status===404)return null;
        if(!response.ok)throw new Error(`official-image-index-${response.status}`);
        const payload=await response.json();
        if(payload?.v!==1||payload?.r!==market||!payload?.[field]||typeof payload[field]!=='object')throw new Error('official-image-index-invalid');
        return payload[field];
      })
      .catch(()=>null)
      .then(data=>{shardCache.set(cacheKey,data);return data;})
      .finally(()=>inFlight.delete(cacheKey));
    inFlight.set(cacheKey,promise);
    return promise;
  }

  async function loadPidShard(marketId,pid){
    const market=normalizedMarketId(marketId);
    const productId=normalizedPid(pid);
    if(!market||!productId)return null;
    const prefix=shardPrefix(productId);
    return loadJsonShard(`pid:${market}:${prefix}`,`${INDEX_BASE}/${market}/${prefix}.json?v=${BUILD}`,market,'p');
  }

  async function loadNameShard(marketId,name){
    const market=normalizedMarketId(marketId);
    const key=normalizedName(name);
    if(!market||!key)return null;
    const prefix=namePrefix(key);
    return loadJsonShard(`name:${market}:${prefix}`,`${INDEX_BASE}/names/${market}/${prefix}.json?v=${BUILD}`,market,'n');
  }

  function officialResult(market,pid,image){
    const safe=safeOfficialImageUrl(image);
    if(!safe)return null;
    return {
      imageUrl:safe,
      imageSource:market==='continente'?'Continente — imagem oficial':'Pingo Doce — imagem oficial',
      marketId:market,
      retailerProductId:pid
    };
  }

  async function officialImageFor(marketId,pid){
    const market=normalizedMarketId(marketId);
    const productId=normalizedPid(pid);
    if(!market||!productId)return null;
    const products=await loadPidShard(market,productId);
    return officialResult(market,productId,products?.[productId]||'');
  }

  async function officialImageByExactName(name){
    const key=normalizedName(name);
    if(key.length<2)return null;
    const markets=['continente','pingo-doce'];
    const matches=[];
    const shards=await Promise.all(markets.map(market=>loadNameShard(market,key)));
    shards.forEach((names,index)=>{
      const entry=Array.isArray(names?.[key])?names[key]:null;
      if(!entry)return;
      const result=officialResult(markets[index],normalizedPid(entry[0]),entry[1]);
      if(result)matches.push(result);
    });
    // Não adivinhar quando o mesmo nome exato existe nos dois retalhistas.
    return matches.length===1?matches[0]:null;
  }

  function iconClose(size=22){
    if(root.CDCIcons?.markup)return root.CDCIcons.markup('close',size);
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 6-12 12M6 6l12 12"/></svg>`;
  }

  function viewer(){
    let dialog=document.querySelector('#marketOfficialImageViewer');
    if(dialog)return dialog;
    dialog=document.createElement('dialog');
    dialog.id='marketOfficialImageViewer';
    dialog.className='market-product-image-viewer';
    dialog.setAttribute('aria-labelledby','marketOfficialImageViewerTitle');
    dialog.innerHTML=`<div class="market-product-image-viewer-shell">
      <header><div><small>Imagem oficial do produto</small><strong id="marketOfficialImageViewerTitle"></strong></div><button type="button" class="market-product-image-viewer-close" data-official-image-close aria-label="Fechar imagem">${iconClose()}</button></header>
      <div class="market-product-image-viewer-stage"><img alt="" referrerpolicy="no-referrer"></div>
      <footer><span data-official-image-source></span><small>Imagem publicada pelo retalhista. Toque fora da imagem ou use Esc para fechar.</small></footer>
    </div>`;
    dialog.addEventListener('click',event=>{if(event.target===dialog||event.target.closest('[data-official-image-close]'))dialog.close();});
    dialog.addEventListener('cancel',event=>{event.preventDefault();dialog.close();});
    document.body.appendChild(dialog);
    return dialog;
  }

  function openViewer(button){
    const imageUrl=safeOfficialImageUrl(button?.dataset?.marketOfficialImageOpen||'');
    if(!imageUrl)return;
    const dialog=viewer();
    const title=clean(button.dataset.marketOfficialImageTitle||'Produto',140);
    const source=clean(button.dataset.marketOfficialImageSource||'Imagem oficial do retalhista',100);
    const image=dialog.querySelector('img');
    dialog.querySelector('#marketOfficialImageViewerTitle').textContent=title;
    dialog.querySelector('[data-official-image-source]').textContent=source;
    image.src=imageUrl;
    image.alt=title?`Imagem oficial ampliada de ${title}`:'Imagem oficial ampliada do produto';
    if(!dialog.open)dialog.showModal();
  }

  function makeOfficialPhoto(photo,{imageUrl,name,imageSource}){
    const safe=safeOfficialImageUrl(imageUrl);
    if(!photo||!safe)return null;
    let button=photo;
    if(!button.matches?.('button')){
      button=document.createElement('button');
      button.type='button';
      button.className=`${photo.className||'market-product-photo'} market-product-photo-button`.replace(/\bis-empty\b/g,'').replace(/\s+/g,' ').trim();
      photo.replaceWith(button);
    }else{
      button.type='button';
      button.classList.remove('is-empty');
      button.classList.add('market-product-photo-button');
    }
    delete button.dataset.marketImageOpen;
    delete button.dataset.marketImageTitle;
    delete button.dataset.marketImageSource;
    button.dataset.marketOfficialImageOpen=safe;
    button.dataset.marketOfficialImageTitle=clean(name,140);
    button.dataset.marketOfficialImageSource=clean(imageSource,100);
    button.setAttribute('aria-label',`Ampliar imagem oficial de ${clean(name,110)||'produto'}`);
    let image=button.querySelector('img');
    if(!image){image=document.createElement('img');button.replaceChildren(image);}
    image.src=safe;
    image.alt='';
    image.loading='lazy';
    image.decoding='async';
    image.referrerPolicy='no-referrer';
    return button;
  }

  function browserTarget(card){
    const raw=clean(card?.dataset?.marketProductCard||'',100);
    const match=/^cesta-(continente|pingo-doce)-(\d{2,32})$/.exec(raw);
    if(!match)return null;
    return {marketId:match[1],retailerProductId:match[2],name:clean(card.querySelector('.market-product-copy h3')?.textContent||'',130)};
  }

  function fallbackToV59(node){
    if(!node)return;
    delete node.dataset.marketImageAudit;
    root.CDCMarketImages?.audit?.();
  }

  function auditBrowserCards(){
    document.querySelectorAll('#marketCatalogResults [data-market-product-card]').forEach(card=>{
      if(['done','resolving','none'].includes(card.dataset.marketOfficialImage))return;
      const target=browserTarget(card);
      const photo=card.querySelector('.market-product-photo');
      if(!target||!photo)return;
      card.dataset.marketOfficialImage='resolving';
      card.dataset.marketImageAudit='done';
      officialImageFor(target.marketId,target.retailerProductId).then(result=>{
        if(result&&card.isConnected){
          makeOfficialPhoto(card.querySelector('.market-product-photo'),{...result,name:target.name});
          card.dataset.marketOfficialImage='done';
          card.dataset.marketOfficialImageUrl=result.imageUrl;
          card.dataset.marketOfficialImageSource=result.imageSource;
        }else{
          card.dataset.marketOfficialImage='none';
          fallbackToV59(card);
        }
      }).catch(()=>{card.dataset.marketOfficialImage='none';fallbackToV59(card);});
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
    persistTimer=setTimeout(()=>{if(typeof saveState==='function')Promise.resolve(saveState()).catch(()=>{});},500);
  }

  function applyResultToItem(item,row,result){
    if(!result||!item)return false;
    if(row?.isConnected)makeOfficialPhoto(row.querySelector('.market-product-photo'),{...result,name:item.name});
    item.imageUrl=result.imageUrl;
    item.imageSource=result.imageSource;
    item.imageMatchedAt=new Date().toISOString();
    schedulePersist();
    return true;
  }

  function auditSavedRows(){
    document.querySelectorAll('#marketList .market-mobile-card,#marketList .market-table-row').forEach(row=>{
      if(['done','resolving','none'].includes(row.dataset.marketOfficialImage))return;
      const item=marketItemFromRow(row);
      const photo=row.querySelector('.market-product-photo');
      if(!item||!photo)return;
      const existingOfficial=safeOfficialImageUrl(item.imageUrl||photo.querySelector('img')?.src||'');
      if(existingOfficial){
        makeOfficialPhoto(photo,{imageUrl:existingOfficial,name:item.name,imageSource:item.imageSource||'Imagem oficial do retalhista'});
        row.dataset.marketOfficialImage='done';
        return;
      }
      row.dataset.marketOfficialImage='resolving';
      row.dataset.marketImageAudit='done';
      const marketId=normalizedMarketId(item.retailerMarketId||'');
      const retailerProductId=normalizedPid(item.retailerProductId||'');
      const resolution=marketId&&retailerProductId?officialImageFor(marketId,retailerProductId):officialImageByExactName(item.name);
      resolution.then(result=>{
        if(result&&row.isConnected){
          applyResultToItem(item,row,result);
          row.dataset.marketOfficialImage='done';
        }else{
          row.dataset.marketOfficialImage='none';
          fallbackToV59(row);
        }
      }).catch(()=>{row.dataset.marketOfficialImage='none';fallbackToV59(row);});
    });
  }

  function waitForNewMarketItem(name,startedAt,result,attempt=0){
    if(!result||attempt>24)return;
    let items=[];
    try{items=(typeof appState!=='undefined'&&Array.isArray(appState?.market))?appState.market:[];}catch(_error){}
    const wanted=normalizedName(name);
    const candidates=items.filter(item=>normalizedName(item?.name)===wanted&&Date.parse(item?.createdAt||0)>=startedAt-1500)
      .sort((a,b)=>Date.parse(b.createdAt||0)-Date.parse(a.createdAt||0));
    const item=candidates[0];
    if(item){
      item.imageUrl=result.imageUrl;
      item.imageSource=result.imageSource;
      item.imageMatchedAt=new Date().toISOString();
      Promise.resolve(typeof saveState==='function'?saveState():null).catch(()=>{}).finally(()=>{
        if(typeof renderCurrentPage==='function')renderCurrentPage();
        scheduleAudit();
      });
      return;
    }
    setTimeout(()=>waitForNewMarketItem(name,startedAt,result,attempt+1),100);
  }

  function captureAddedProduct(addButton){
    const card=addButton?.closest?.('[data-market-product-card]');
    const target=browserTarget(card);
    if(!target)return;
    const startedAt=Date.now();
    const existing=safeOfficialImageUrl(card.dataset.marketOfficialImageUrl||'');
    const promised=existing?Promise.resolve({
      imageUrl:existing,
      imageSource:clean(card.dataset.marketOfficialImageSource||'',100)||(target.marketId==='continente'?'Continente — imagem oficial':'Pingo Doce — imagem oficial'),
      marketId:target.marketId,
      retailerProductId:target.retailerProductId
    }):officialImageFor(target.marketId,target.retailerProductId);
    promised.then(result=>{if(result)waitForNewMarketItem(target.name,startedAt,result);}).catch(()=>{});
  }

  function scheduleAudit(){
    if(auditQueued)return;
    auditQueued=true;
    requestAnimationFrame(()=>{auditQueued=false;auditBrowserCards();auditSavedRows();});
  }

  function installObserver(){
    if(observer||!document.body)return;
    observer=new MutationObserver(mutations=>{
      if(mutations.some(mutation=>mutation.type==='childList'&&mutation.addedNodes.length))scheduleAudit();
    });
    observer.observe(document.body,{subtree:true,childList:true});
  }

  document.addEventListener('click',event=>{
    const officialButton=event.target.closest?.('[data-market-official-image-open]');
    if(officialButton){
      event.preventDefault();
      event.stopPropagation();
      openViewer(officialButton);
      return;
    }
    const add=event.target.closest?.('[data-market-add-product]');
    if(add)captureAddedProduct(add);
  },true);

  const start=()=>{installObserver();scheduleAudit();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  root.CDCOfficialImages=Object.freeze({
    safeImageUrl:safeOfficialImageUrl,
    safeProductImageUrl:safeCombinedProductImageUrl,
    resolve:officialImageFor,
    resolveExactName:officialImageByExactName,
    audit:scheduleAudit,
    version:'v60'
  });
})(globalThis);

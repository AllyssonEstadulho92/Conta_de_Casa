'use strict';

/*
 * Conta de Casa — imagens oficiais dos retalhistas (v60)
 *
 * O browser nunca faz scraping das páginas do Continente/Pingo Doce. O build público
 * gera um índice same-origin a partir dos sitemaps oficiais publicados pelos próprios
 * retalhistas. Em runtime é descarregado apenas o pequeno shard correspondente ao PID.
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

  // Mantém a normalização do cofre coerente depois de a camada v59 ter sido carregada.
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
  function shardKey(marketId,pid){return `${marketId}:${shardPrefix(pid)}`;}

  async function loadShard(marketId,pid){
    const market=normalizedMarketId(marketId);
    const productId=normalizedPid(pid);
    if(!market||!productId)return null;
    const key=shardKey(market,productId);
    if(shardCache.has(key))return shardCache.get(key);
    if(inFlight.has(key))return inFlight.get(key);
    const prefix=shardPrefix(productId);
    const promise=fetch(`${INDEX_BASE}/${market}/${prefix}.json?v=${BUILD}`,{
      method:'GET',credentials:'same-origin',cache:'force-cache',headers:{Accept:'application/json'}
    }).then(async response=>{
      if(response.status===404)return null;
      if(!response.ok)throw new Error(`official-image-index-${response.status}`);
      const payload=await response.json();
      if(payload?.v!==1||payload?.r!==market||!payload?.p||typeof payload.p!=='object')throw new Error('official-image-index-invalid');
      return payload.p;
    }).catch(()=>null).then(products=>{
      shardCache.set(key,products);
      return products;
    }).finally(()=>inFlight.delete(key));
    inFlight.set(key,promise);
    return promise;
  }

  async function officialImageFor(marketId,pid){
    const market=normalizedMarketId(marketId);
    const productId=normalizedPid(pid);
    if(!market||!productId)return null;
    const products=await loadShard(market,productId);
    const image=safeOfficialImageUrl(products?.[productId]||'');
    if(!image)return null;
    return {
      imageUrl:image,
      imageSource:market==='continente'?'Continente — imagem oficial':'Pingo Doce — imagem oficial',
      marketId:market,
      retailerProductId:productId
    };
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
    return {
      marketId:match[1],retailerProductId:match[2],
      name:clean(card.querySelector('.market-product-copy h3')?.textContent||'',130)
    };
  }

  function fallbackToV59(node){
    if(!node)return;
    delete node.dataset.marketImageAudit;
    root.CDCMarketImages?.audit?.();
  }

  function auditBrowserCards(){
    document.querySelectorAll('#marketCatalogResults [data-market-product-card]').forEach(card=>{
      if(card.dataset.marketOfficialImage==='done'||card.dataset.marketOfficialImage==='resolving'||card.dataset.marketOfficialImage==='none')return;
      const target=browserTarget(card);
      if(!target)return;
      const photo=card.querySelector('.market-product-photo');
      if(!photo)return;
      card.dataset.marketOfficialImage='resolving';
      // Reserva a resolução por PID para impedir que o fallback textual ganhe a corrida.
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
      }).catch(()=>{
        card.dataset.marketOfficialImage='none';
        fallbackToV59(card);
      });
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
    },500);
  }

  function auditSavedRows(){
    document.querySelectorAll('#marketList .market-mobile-card,#marketList .market-table-row').forEach(row=>{
      if(row.dataset.marketOfficialImage==='done'||row.dataset.marketOfficialImage==='resolving'||row.dataset.marketOfficialImage==='none')return;
      const item=marketItemFromRow(row);
      const photo=row.querySelector('.market-product-photo');
      if(!item||!photo)return;
      const existingOfficial=safeOfficialImageUrl(item.imageUrl||photo.querySelector('img')?.src||'');
      if(existingOfficial){
        makeOfficialPhoto(photo,{imageUrl:existingOfficial,name:item.name,imageSource:item.imageSource||'Imagem oficial do retalhista'});
        row.dataset.marketOfficialImage='done';
        return;
      }
      const marketId=normalizedMarketId(item.retailerMarketId||'');
      const retailerProductId=normalizedPid(item.retailerProductId||'');
      if(!marketId||!retailerProductId){row.dataset.marketOfficialImage='none';return;}
      row.dataset.marketOfficialImage='resolving';
      row.dataset.marketImageAudit='done';
      officialImageFor(marketId,retailerProductId).then(result=>{
        if(result&&row.isConnected){
          makeOfficialPhoto(row.querySelector('.market-product-photo'),{...result,name:item.name});
          row.dataset.marketOfficialImage='done';
          if(item.imageUrl!==result.imageUrl||item.imageSource!==result.imageSource){
            item.imageUrl=result.imageUrl;
            item.imageSource=result.imageSource;
            item.imageMatchedAt=new Date().toISOString();
            schedulePersist();
          }
        }else{
          row.dataset.marketOfficialImage='none';
          fallbackToV59(row);
        }
      }).catch(()=>{
        row.dataset.marketOfficialImage='none';
        fallbackToV59(row);
      });
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
    const button=event.target.closest?.('[data-market-official-image-open]');
    if(!button)return;
    event.preventDefault();
    event.stopPropagation();
    openViewer(button);
  },true);

  const start=()=>{installObserver();scheduleAudit();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  root.CDCOfficialImages=Object.freeze({
    safeImageUrl:safeOfficialImageUrl,
    safeProductImageUrl:safeCombinedProductImageUrl,
    resolve:officialImageFor,
    audit:scheduleAudit,
    version:'v60'
  });
})(globalThis);

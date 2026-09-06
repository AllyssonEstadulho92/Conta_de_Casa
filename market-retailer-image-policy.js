'use strict';

/*
 * Conta de Casa — política de imagem do retalhista (v62)
 *
 * Regra: resultados vivos do Pingo Doce/Continente só podem mostrar e persistir
 * a fotografia oficial do mesmo SKU/pid. Imagens aproximadas de Open Facts ou de
 * qualquer outra origem podem continuar a existir noutros fluxos (ex.: leitura
 * de código de barras), mas não são apresentadas como fotografia destes cartões.
 */
(function installRetailerImagePolicy(root){
  const CARD_SELECTOR='#marketCatalogResults [data-market-product-card]';
  let observer=null;
  let scanQueued=false;

  const clean=(value,max=180)=>String(value??'')
    .replace(/[\u0000-\u001f\u007f]/g,' ')
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,max);
  const norm=value=>clean(value,240)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLocaleLowerCase('pt-PT');

  function targetFromCard(card){
    const id=clean(card?.dataset?.marketProductCard||'',100);
    const match=/^cesta-(continente|pingo-doce)-(\d{4,32})$/i.exec(id);
    if(!match)return null;
    const marketId=match[1].toLowerCase();
    const name=clean(card.querySelector('.market-product-copy h3')?.textContent||'',130);
    const rawPack=clean(card.querySelector('.market-product-copy>p')?.textContent||'',100);
    const pack=rawPack.replace(/\s*·\s*(Pingo Doce|Continente)\s*$/i,'').trim();
    return {
      marketId,
      pid:match[2],
      name,
      pack,
      label:marketId==='continente'?'Continente':'Pingo Doce'
    };
  }

  function officialUrl(value,target){
    if(!value||!target)return '';
    try{return root.CDCOfficialMarketImages?.safeOfficialImageUrl?.(value,target.marketId,target.pid)||'';}
    catch(_error){return '';}
  }

  function emptyPhoto(){
    const node=document.createElement('span');
    node.className='market-product-photo is-empty';
    node.setAttribute('aria-hidden','true');
    return node;
  }

  function enforceCard(card){
    const target=targetFromCard(card);
    if(!target)return;

    // Impede o resolvedor legado v59/v60 de aplicar fallbacks Open Facts nestes cartões.
    card.dataset.marketImageAudit='done';
    card.dataset.marketRetailerImagePolicy='official-only';

    const source=card.querySelector('.market-result-source');
    if(source){
      const text=source.querySelector('span');
      if(text)text.textContent=`Ver no ${target.label}`;
      source.setAttribute('aria-label',`Abrir página do produto no ${target.label}`);
      source.dataset.marketSourceMeaning='retailer-page';
    }

    const photo=card.querySelector('.market-product-photo');
    if(!photo)return;
    const image=photo.querySelector('img');
    if(!image)return;
    const safe=officialUrl(image.currentSrc||image.src,target);
    if(safe){
      photo.dataset.marketImageOfficial='1';
      return;
    }

    // Qualquer imagem não comprovada pelo pid exato volta a placeholder antes do paint.
    photo.replaceWith(emptyPhoto());
  }

  function updateNotice(){
    const notice=document.querySelector('.market-browser .market-source-notice p');
    if(!notice||notice.dataset.retailerImagePolicy==='1')return;
    notice.dataset.retailerImagePolicy='1';
    notice.innerHTML='<strong>Pesquisa em dois mercados.</strong> Pingo Doce e Continente são consultados no momento através de cesta.pt. Nestes resultados, a fotografia só é apresentada quando pertence ao produto oficial e ao mesmo SKU da loja. Se não for possível validar a fotografia exata, mantém-se o placeholder em vez de usar uma imagem aproximada de outra fonte.';
  }

  function scan(){
    updateNotice();
    document.querySelectorAll(CARD_SELECTOR).forEach(enforceCard);
  }

  function scheduleScan(){
    if(scanQueued)return;
    scanQueued=true;
    requestAnimationFrame(()=>{scanQueued=false;scan();});
  }

  function currentItems(){
    try{return typeof appState!=='undefined'&&Array.isArray(appState?.market)?appState.market:[];}
    catch(_error){return [];}
  }

  function waitForAddedItem(beforeLength,name,timeoutMs=5000){
    const started=Date.now();
    return new Promise(resolve=>{
      const check=()=>{
        const items=currentItems();
        const item=items.slice(beforeLength).find(candidate=>norm(candidate?.name)===norm(name));
        if(item){resolve(item);return;}
        if(Date.now()-started>=timeoutMs){resolve(null);return;}
        setTimeout(check,60);
      };
      check();
    });
  }

  function clearSavedRow(item){
    if(!item?.id)return;
    document.querySelectorAll('#marketList .market-mobile-card,#marketList .market-table-row').forEach(row=>{
      const id=row.querySelector('[data-market-toggle]')?.dataset?.marketToggle||'';
      if(String(id)!==String(item.id))return;
      const photo=row.querySelector('.market-product-photo');
      if(photo)photo.replaceWith(emptyPhoto());
    });
  }

  async function persistPolicyResult(item,target,result){
    if(!item)return;
    if(result?.imageUrl&&officialUrl(result.imageUrl,target)){
      item.imageUrl=result.imageUrl;
      item.imageSource=result.source||`${target.label} · imagem oficial`;
      item.imageMatchedAt=new Date().toISOString();
    }else{
      const existing=clean(item.imageUrl||'',1100);
      if(existing&&!officialUrl(existing,target)){
        item.imageUrl='';
        item.imageSource='';
        item.imageMatchedAt=null;
        // Nos resultados vivos este código vinha do mesmo matching textual auxiliar.
        item.productCode='';
        clearSavedRow(item);
      }
    }
    try{if(typeof saveState==='function')await saveState();}catch(_error){}
  }

  function onAddCapture(event){
    const button=event.target.closest?.('[data-market-add-product]');
    if(!button)return;
    const card=button.closest('[data-market-product-card]');
    const target=targetFromCard(card);
    if(!target)return;
    const beforeLength=currentItems().length;
    const resolution=Promise.resolve(root.CDCOfficialMarketImages?.resolve?.(target)).catch(()=>null);
    resolution.then(async result=>{
      const item=await waitForAddedItem(beforeLength,target.name);
      if(item)await persistPolicyResult(item,target,result);
    }).catch(()=>{});
  }

  function install(){
    document.addEventListener('click',onAddCapture,true);
    scan();
    if(document.body&&!observer){
      observer=new MutationObserver(mutations=>{
        for(const mutation of mutations){
          if(mutation.type==='attributes'){
            const card=mutation.target?.closest?.('[data-market-product-card]');
            if(card)enforceCard(card);
          }
        }
        if(mutations.some(mutation=>mutation.type==='childList'&&mutation.addedNodes.length))scheduleScan();
      });
      observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();

  root.CDCRetailerImagePolicy=Object.freeze({audit:scheduleScan,targetFromCard});
})(globalThis);

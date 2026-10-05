'use strict';

/*
 * Conta de Casa — Adicionar produto segundo o protótipo UX aprovado (76-add-product-prototype1)
 * Continente/Pingo Doce: consulta atual através de cesta.pt, com URL oficial do produto.
 * Mercados ativos: Pingo Doce e Continente.
 * Nenhum preço fictício é usado; fotografias reais de referência são opcionais e validadas separadamente.
 */
(function marketLiveExperience(){
  const MARKET_BROWSER_MODE='market-browser';
  const CESTA_MCP_URL='https://cesta.pt/mcp';
  const OFF_IMAGE_SEARCH_URL='https://world.openfoodfacts.org/cgi/search.pl';
  const SEARCH_DEBOUNCE_MS=450;
  const SEARCH_TIMEOUT_MS=12000;
  const MAX_REMOTE_RESULTS=20;
  const MARKET_IDS=['pingo-doce','continente'];
  const MARKET_DEFINITIONS=Object.freeze([
    {id:'pingo-doce',name:'Pingo Doce',short:'PD',tone:'green',provider:'cesta',providerId:'pingodoce'},
    {id:'continente',name:'Continente',short:'C',tone:'red',provider:'cesta',providerId:'continente'}
  ]);
  const PRODUCT_SUGGESTIONS=Object.freeze(['Leite meio gordo','Ovos','Arroz','Azeite','Café','Detergente','Papel higiénico','Água']);
  const CATEGORY_SUGGESTIONS=Object.freeze([
    ['Lacticínios e ovos','leite'],['Mercearia / Despensa','arroz'],['Bebidas','água'],['Limpeza','detergente'],
    ['Higiene pessoal','champô'],['Frutas e legumes','banana'],['Carne e peixe','frango'],['Snacks e doces','chocolate']
  ]);
  const UI_CATEGORIES=Object.freeze([
    {id:'all',label:'Todas'},
    {id:'Bebidas',label:'Bebidas'},
    {id:'Lacticínios e ovos',label:'Lacticínios e ovos'},
    {id:'Frutas e legumes',label:'Frutas e legumes'},
    {id:'Carne e peixe',label:'Carnes e peixes'},
    {id:'Mercearia / Despensa',label:'Mercearia'},
    {id:'Congelados',label:'Congelados'},
    {id:'Higiene pessoal',label:'Higiene e limpeza'},
    {id:'Limpeza',label:'Beleza e cuidados'},
    {id:'Animais',label:'Animais'}
  ]);

  let selectedMarkets=new Set(MARKET_IDS);
  let query='';
  let observer=null;
  let searchTimer=0;
  let searchGeneration=0;
  let activeSearchController=null;
  let resultById=new Map();
  let lastResults=[];
  let lastWarnings=[];
  let selectedCategory='all';
  let categoryOpen=false;
  let resultSort='relevance';
  let detailQuantity=1;
  let libraryFilter='all';
  let currentLibraryAudit=null;

  const marketById=id=>MARKET_DEFINITIONS.find(m=>m.id===id)||MARKET_DEFINITIONS[0];
  const normalized=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-PT').trim();
  const cleanRemoteText=(value,max=180)=>String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);

  function svgIcon(name,size=24){
    const paths={
      search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
      close:'<path d="m6 6 12 12M18 6 6 18"/>',
      back:'<path d="m15 18-6-6 6-6"/>',
      info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
      plus:'<path d="M12 5v14M5 12h14"/>',
      check:'<path d="m5 12 4 4L19 6"/>',
      external:'<path d="M14 5h5v5M19 5l-8 8"/><path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
      refresh:'<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>',
      image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 20"/>',
      basket:'<path d="M4 9h16l-1.4 11H5.4L4 9Z"/><path d="m8 9 4-6 4 6M9 13v3m6-3v3"/>',
      chevron:'<path d="m9 18 6-6-6-6"/>',
      down:'<path d="m6 9 6 6 6-6"/>',
      more:'<circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>',
      minus:'<path d="M5 12h14"/>',
      cart:'<circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M3 4h2l2.4 10.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6"/>'
    };
    return `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.search}</svg>`;
  }

  function marketMark(market,size='large'){
    const m=typeof market==='string'?marketById(market):market;
    const logo=m.id==='pingo-doce'
      ? '<span class="market-logo-pingo"><strong>Pingo</strong><strong>Doce</strong></span>'
      : '<span class="market-logo-continente"><span aria-hidden="true">C</span><strong>CONTINENTE</strong></span>';
    return `<span class="market-brand-mark ${attr(m.tone)} ${attr(size)} market-brand-logo" aria-hidden="true">${logo}</span>`;
  }

  function parseEuroCents(value){
    const match=String(value||'').match(/(\d{1,7}(?:[.,]\d{1,2})?)\s*€/);
    if(!match)return 0;
    const amount=Number(match[1].replace(',','.'));
    const cents=Math.round(amount*100);
    return Number.isSafeInteger(cents)&&cents>0&&cents<=100000000?cents:0;
  }

  function safeRetailerUrl(value,marketId){
    if(!value)return '';
    try{
      const url=new URL(String(value));
      if(url.protocol!=='https:')return '';
      const allowed=marketId==='continente'?new Set(['continente.pt','www.continente.pt']):
        marketId==='pingo-doce'?new Set(['pingodoce.pt','www.pingodoce.pt']):new Set();
      return allowed.has(url.hostname.toLowerCase())?url.href:'';
    }catch(_error){return '';}
  }

  function formatObservedDate(value){
    const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value||''));
    return match?`${match[3]}/${match[2]}/${match[1]}`:'';
  }

  function inferCategory(name){
    const value=normalized(name);
    const rules=[
      [['leite','queijo','iogurte','manteiga','natas','ovo'],'Lacticínios e ovos'],
      [['banana','maca','maçã','laranja','tomate','alface','batata','cebola'],'Frutas e legumes'],
      [['frango','peru','porco','vaca','carne','peixe','pescada','salmao','salmão','atum'],'Carne e peixe'],
      [['pao','pão','croissant','bolo','pastel'],'Padaria e pastelaria'],
      [['arroz','massa','azeite','oleo','óleo','farinha','acucar','açúcar','cafe','café','feijao','feijão'],'Mercearia / Despensa'],
      [['congelado','gelado','pizza'],'Congelados'],
      [['agua','água','sumo','refrigerante','cerveja','vinho'],'Bebidas'],
      [['chocolate','bolacha','biscoito','snack','doce'],'Snacks e doces'],
      [['champô','shampoo','gel','sabonete','dentifrico','dentífrico','desodorizante'],'Higiene pessoal'],
      [['detergente','lixivia','lixívia','limpa','amaciante'],'Limpeza'],
      [['fralda','bebe','bebé'],'Bebé'],
      [['cao','cão','gato','ração','racao'],'Animais']
    ];
    for(const [terms,category] of rules){if(terms.some(term=>value.includes(normalized(term))))return category;}
    return 'Outros';
  }

  function activeMarketScope(){
    if(selectedMarkets.size===MARKET_IDS.length)return 'all';
    return selectedMarkets.has('pingo-doce')?'pingo-doce':'continente';
  }

  function marketScopeHtml(){
    const active=activeMarketScope();
    return `<div class="market-prototype-store-tabs" role="group" aria-label="Mercado">
      ${[['all','Todos'],['pingo-doce','Pingo Doce'],['continente','Continente']].map(([id,label])=>`<button type="button" class="${active===id?'active':''}" data-market-scope="${id}" aria-pressed="${active===id}">${label}</button>`).join('')}
    </div>`;
  }

  function categoryLabel(){
    return UI_CATEGORIES.find(category=>category.id===selectedCategory)?.label||'Categoria (opcional)';
  }

  function categoryIcon(name,size=20){
    const paths={
      all:'<circle cx="12" cy="12" r="8"/><path d="M8 12h8M12 8v8"/>',
      Bebidas:'<path d="M8 3h8l-1 18H9L8 3Z"/><path d="M9 7h6"/>',
      'Lacticínios e ovos':'<path d="M9 3h6l2 4v14H7V7l2-4Z"/><path d="M8 9h8"/>',
      'Frutas e legumes':'<path d="M12 7c-5-4-9 1-7 6 2 6 6 8 7 8s5-2 7-8c2-5-2-10-7-6Z"/><path d="M12 7c0-3 2-5 5-5"/>',
      'Carne e peixe':'<path d="M5 12c3-5 7-7 14-4-2 5-5 8-10 8l-4 3 1-5-1-2Z"/>',
      'Mercearia / Despensa':'<path d="M6 7h12l-1 14H7L6 7Z"/><path d="M9 7V4h6v3"/>',
      Congelados:'<path d="M12 2v20M4 6l16 12M20 6 4 18"/>',
      'Higiene pessoal':'<path d="M10 3h4v4h-4z"/><path d="M8 7h8l1 14H7L8 7Z"/>',
      Limpeza:'<path d="M9 3h6v4h2l2 4v10H5V11l2-4h2V3Z"/>',
      Animais:'<circle cx="7" cy="8" r="2"/><circle cx="17" cy="8" r="2"/><circle cx="10" cy="5" r="2"/><circle cx="14" cy="5" r="2"/><path d="M12 11c-4 0-7 3-7 6 0 2 2 4 4 3l3-1 3 1c2 1 4-1 4-3 0-3-3-6-7-6Z"/>'
    };
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.all}</svg>`;
  }

  function categoryPanelHtml(){
    return `<div id="marketPrototypeCategoryPanel" class="market-prototype-category-panel"${categoryOpen?'':' hidden'}>
      <div class="market-prototype-category-search">${svgIcon('search',18)}<input id="marketCategorySearch" type="search" placeholder="Pesquisar categoria..." autocomplete="off" aria-label="Pesquisar categoria"></div>
      <div id="marketCategoryOptions" class="market-prototype-category-options">
        ${UI_CATEGORIES.map(category=>`<button type="button" class="${selectedCategory===category.id?'selected':''}" data-market-category="${attr(category.id)}">${categoryIcon(category.id)}<span>${esc(category.label)}</span>${svgIcon('chevron',17)}</button>`).join('')}
      </div>
    </div>`;
  }

  function browserShellHtml(){
    return `<div class="market-browser market-prototype-browser" data-market-price-mode="live">
      <div id="marketPrototypeSearchView" class="market-prototype-view" data-market-prototype-view="search">
        <div class="market-browser-search-row">
          <div class="market-browser-search">${svgIcon('search',22)}<input id="marketCatalogSearch" type="search" value="" placeholder="Pesquisar produto..." autocomplete="off" aria-label="Pesquisar produto"><button class="market-search-clear" type="button" data-market-search-clear aria-label="Limpar pesquisa" hidden>${svgIcon('close',19)}</button></div>
        </div>
        <div id="marketPrototypeStoreTabs">${marketScopeHtml()}</div>
        <div class="market-prototype-category-wrap">
          <button class="market-prototype-category-trigger" type="button" data-market-category-toggle aria-expanded="false" aria-controls="marketPrototypeCategoryPanel">
            <span class="market-prototype-category-trigger-copy">${categoryIcon(selectedCategory==='all'?'all':selectedCategory)}<span id="marketPrototypeCategoryLabel">${esc(selectedCategory==='all'?'Categoria (opcional)':categoryLabel())}</span></span>
            <span class="market-prototype-category-trigger-chevron">${svgIcon('down',18)}</span>
          </button>
          ${categoryPanelHtml()}
        </div>
        <div id="marketBarcodeStatus" class="market-barcode-status" role="status" aria-live="polite" hidden></div>
        <div id="marketPrototypeResultsHead" class="market-prototype-results-head" hidden>
          <strong id="marketResultsMeta">0 resultados</strong>
          <label class="market-prototype-sort"><span class="sr-only">Ordenar resultados</span><select id="marketResultSort" aria-label="Ordenar resultados"><option value="relevance">↕ Mais relevantes</option><option value="price-asc">Preço menor</option><option value="price-desc">Preço maior</option></select></label>
        </div>
        <div id="marketCatalogResults" class="market-catalog-results" aria-live="polite"></div>
      </div>
      <div id="marketPrototypeSubview" class="market-prototype-view market-prototype-subview" data-market-prototype-view="subview" hidden></div>
    </div>`;
  }

  function refreshSearchControls(){
    const tabs=document.querySelector('#marketPrototypeStoreTabs');
    if(tabs)setHTML(tabs,marketScopeHtml());
    const label=document.querySelector('#marketPrototypeCategoryLabel');
    if(label)label.textContent=selectedCategory==='all'?'Categoria (opcional)':categoryLabel();
    const trigger=document.querySelector('[data-market-category-toggle]');
    if(trigger)trigger.setAttribute('aria-expanded',String(categoryOpen));
    const panel=document.querySelector('#marketPrototypeCategoryPanel');
    if(panel)panel.hidden=!categoryOpen;
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

  async function fetchWithTimeout(url,options,externalSignal){
    const controller=new AbortController();
    const onAbort=()=>controller.abort();
    if(externalSignal){
      if(externalSignal.aborted)controller.abort();
      else externalSignal.addEventListener('abort',onAbort,{once:true});
    }
    const timer=setTimeout(()=>controller.abort(),SEARCH_TIMEOUT_MS);
    try{return await fetch(url,{...options,signal:controller.signal,cache:'no-store'});}
    finally{
      clearTimeout(timer);
      externalSignal?.removeEventListener?.('abort',onAbort);
    }
  }

  async function cestaRpc(payload,signal){
    const response=await fetchWithTimeout(CESTA_MCP_URL,{
      method:'POST',
      headers:{'Accept':'application/json, text/event-stream','Content-Type':'application/json','MCP-Protocol-Version':'2025-06-18'},
      body:JSON.stringify(payload)
    },signal);
    if(!response.ok)throw new Error(`cesta-http-${response.status}`);
    const text=await response.text();
    if(!text.trim())return null;
    const event=parseSseEvents(text)[0]||null;
    if(event?.error)throw new Error('cesta-rpc-error');
    return event;
  }

  function parseCestaResults(text){
    const lines=String(text||'').split('\n');
    const results=[];
    for(let index=0;index<lines.length;index+=1){
      const line=lines[index].trim();
      if(!line.startsWith('- '))continue;
      const parts=line.slice(2).split(' · ').map(part=>part.trim()).filter(Boolean);
      if(parts.length<4)continue;
      const marketName=parts[0];
      const marketId=marketName==='Continente'?'continente':marketName==='Pingo Doce'?'pingo-doce':'';
      if(!marketId)continue;
      const name=cleanRemoteText(parts[1],120);
      const pack=cleanRemoteText(parts[2],100);
      const pricePart=parts[3]||'';
      const priceCents=parseEuroCents(pricePart);
      if(!name||!priceCents)continue;
      const oldMatch=pricePart.match(/antes\s+(\d{1,7}(?:[.,]\d{1,2})?)\s*€/i);
      const oldPriceCents=oldMatch?parseEuroCents(`${oldMatch[1]}€`):0;
      const discountMatch=pricePart.match(/(-\d{1,3}%)/);
      const promoMatch=line.match(/promo\s+até\s+(\d{4}-\d{2}-\d{2})/i);
      const pidMatch=line.match(/\bpid\s+([^·\s]+)/i);
      const unitPrice=cleanRemoteText(parts.find((part,partIndex)=>partIndex>3&&/€\s*\//.test(part))||'',60);
      const possibleUrl=(lines[index+1]||'').trim();
      const sourceUrl=safeRetailerUrl(possibleUrl,marketId);
      if(sourceUrl)index+=1;
      const pid=cleanRemoteText(pidMatch?.[1]||'',40);
      results.push({
        id:`cesta-${marketId}-${pid||results.length}`,
        provider:'cesta',marketId,pid,name,pack,priceCents,oldPriceCents,
        discount:cleanRemoteText(discountMatch?.[1]||'',12),promotionUntil:promoMatch?.[1]||'',unitPrice,
        sourceUrl,sourceLabel:'Produto oficial',freshness:'current',observedDate:''
      });
    }
    return results;
  }

  async function searchCestaProducts(term,marketIds,signal){
    const stores=marketIds.map(id=>marketById(id).providerId).filter(Boolean);
    if(!stores.length)return [];
    await cestaRpc({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'Conta de Casa',version:'53'}}},signal);
    await cestaRpc({jsonrpc:'2.0',method:'notifications/initialized'},signal);
    const event=await cestaRpc({jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'search_products',arguments:{query:term,stores,limit:8}}},signal);
    const text=event?.result?.content?.find(item=>item?.type==='text')?.text||'';
    return parseCestaResults(text).filter(result=>marketIds.includes(result.marketId));
  }

  function tokenSet(value){
    return new Set(normalized(value).split(/[^a-z0-9]+/).filter(token=>token.length>1));
  }

  function imageCandidateScore(product,candidate){
    const wanted=tokenSet(`${product.name} ${product.pack||''}`);
    const offered=tokenSet(`${candidate.name} ${candidate.brands||''} ${candidate.quantity||''}`);
    if(!wanted.size||!offered.size)return 0;
    let common=0;
    wanted.forEach(token=>{if(offered.has(token))common+=1;});
    let score=common/Math.max(1,Math.min(wanted.size,offered.size));
    const a=normalized(product.name),b=normalized(candidate.name);
    if(a&&b&&(a===b||a.includes(b)||b.includes(a)))score=Math.max(score,.82);
    if(product.pack&&candidate.quantity&&normalized(product.pack)===normalized(candidate.quantity))score=Math.min(1,score+.12);
    return score;
  }

  async function searchProductImages(term,signal){
    const url=new URL(OFF_IMAGE_SEARCH_URL);
    url.searchParams.set('search_terms',term);
    url.searchParams.set('search_simple','1');
    url.searchParams.set('action','process');
    url.searchParams.set('json','1');
    url.searchParams.set('page_size','12');
    url.searchParams.set('fields','code,product_name,product_name_pt,brands,quantity,image_front_small_url,image_front_url');
    const response=await fetchWithTimeout(url.href,{method:'GET',headers:{Accept:'application/json'},credentials:'omit',referrerPolicy:'no-referrer'},signal);
    if(!response.ok)throw new Error(`off-image-http-${response.status}`);
    const payload=await response.json();
    const products=Array.isArray(payload?.products)?payload.products:[];
    return products.map(item=>({
      code:cleanRemoteText(item?.code||'',32),
      name:cleanRemoteText(item?.product_name_pt||item?.product_name||'',120),
      brands:cleanRemoteText(item?.brands||'',90),
      quantity:cleanRemoteText(item?.quantity||'',50),
      imageUrl:safeProductImageUrl(item?.image_front_small_url||item?.image_front_url||'')
    })).filter(item=>item.name&&item.imageUrl);
  }

  function enrichResultsWithImages(results,candidates){
    return results.map(product=>{
      let best=null,bestScore=0;
      for(const candidate of candidates){
        const score=imageCandidateScore(product,candidate);
        if(score>bestScore){best=candidate;bestScore=score;}
      }
      if(!best||bestScore<.72)return product;
      return {...product,productCode:best.code,imageUrl:best.imageUrl,imageSource:'Open Food Facts',imageMatchedAt:new Date().toISOString()};
    });
  }

  function productImageHtml(product){
    const image=safeProductImageUrl(product?.imageUrl);
    if(!image)return '<span class="market-product-photo is-empty" aria-hidden="true"></span>';
    return `<span class="market-product-photo"><img src="${attr(image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></span>`;
  }

  function resultStatusHtml(product){
    if(product.discount||product.promotionUntil){
      const detail=[product.discount,product.promotionUntil?`até ${formatObservedDate(product.promotionUntil)}`:''].filter(Boolean).join(' · ');
      return `<span class="market-result-chip promo">Promoção${detail?` · ${esc(detail)}`:''}</span>`;
    }
    return '<span class="market-result-chip current">Consultado agora</span>';
  }

  function productCardHtml(product){
    const market=marketById(product.marketId);
    return `<article class="market-prototype-result-card" data-market-product-card="${attr(product.id)}">
      <button class="market-prototype-result-open" type="button" data-market-detail-product="${attr(product.id)}" aria-label="Ver detalhes de ${attr(product.name)}">
        ${productImageHtml(product)}
        <span class="market-prototype-result-copy">
          <strong>${esc(product.name)}</strong>
          <small>${esc(product.pack||'')}</small>
          <strong class="market-prototype-result-price" data-money>${money(product.priceCents)}</strong>
          <span class="market-prototype-result-store">${marketMark(market,'tiny')}<span>${esc(market.name)}</span></span>
        </span>
      </button>
      <button class="market-add-product market-prototype-result-add" type="button" data-market-add-product="${attr(product.id)}" aria-label="Adicionar ${attr(product.name)} à lista">${svgIcon('plus',22)}</button>
    </article>`;
  }

  function prototypeInitialHtml(){
    return `<div class="market-prototype-empty">
      <span class="market-prototype-empty-icon">${svgIcon('basket',34)}</span>
      <strong>Pesquise um produto</strong>
      <p>Digite o nome, marca ou utilize a câmara para adicionar pelo código de barras.</p>
    </div>
    <div class="market-prototype-entry-list">
      <button type="button" class="market-prototype-entry" data-market-open-catalog>
        <span class="market-prototype-entry-icon">${svgIcon('basket',21)}</span>
        <span><strong>Explorar catálogo</strong><small>Veja produtos por categoria e mercado.</small></span>
        ${svgIcon('chevron',19)}
      </button>
      <button type="button" class="market-prototype-entry" data-market-open-library>
        <span class="market-prototype-entry-icon">${svgIcon('image',21)}</span>
        <span><strong>Biblioteca de fotografias</strong><small>Consulte e valide as fotografias dos produtos.</small></span>
        ${svgIcon('chevron',19)}
      </button>
    </div>`;
  }

  function renderSearchIntro(){
    lastResults=[];
    lastWarnings=[];
    resultById=new Map();
    const head=$('#marketPrototypeResultsHead');
    if(head)head.hidden=true;
    const clear=$('[data-market-search-clear]');
    if(clear)clear.hidden=true;
    const root=$('#marketCatalogResults');
    if(root)setHTML(root,prototypeInitialHtml());
  }

  function renderLoading(){
    const head=$('#marketPrototypeResultsHead');
    if(head)head.hidden=false;
    const meta=$('#marketResultsMeta');
    if(meta)meta.textContent='A pesquisar…';
    const root=$('#marketCatalogResults');
    if(root)setHTML(root,`<div class="market-browser-loading" role="status"><span class="market-loading-spinner" aria-hidden="true"></span><div><strong>A pesquisar produtos</strong><p>A consultar Pingo Doce e Continente.</p></div></div>`);
  }

  function visibleResults(results){
    let filtered=[...results];
    if(selectedCategory!=='all')filtered=filtered.filter(product=>inferCategory(product.name)===selectedCategory);
    if(resultSort==='price-asc')filtered.sort((a,b)=>a.priceCents-b.priceCents);
    else if(resultSort==='price-desc')filtered.sort((a,b)=>b.priceCents-a.priceCents);
    return filtered.slice(0,MAX_REMOTE_RESULTS);
  }

  function renderRemoteResults(results=lastResults,warnings=lastWarnings){
    const root=$('#marketCatalogResults');if(!root)return;
    lastResults=[...results];
    lastWarnings=[...warnings];
    const visible=visibleResults(lastResults);
    resultById=new Map(lastResults.map(item=>[item.id,item]));
    const head=$('#marketPrototypeResultsHead');
    if(head)head.hidden=false;
    const meta=$('#marketResultsMeta');
    if(meta)meta.textContent=`${visible.length} resultado${visible.length===1?'':'s'}`;
    const warningHtml=warnings.length?`<div class="market-provider-warning" role="status">${svgIcon('info',18)}<p>${warnings.map(esc).join(' ')}</p></div>`:'';
    if(!visible.length){
      setHTML(root,`${warningHtml}<div class="market-browser-empty"><span class="market-browser-empty-icon">${svgIcon('search',25)}</span><strong>Sem resultados</strong><p>Altere a pesquisa, o mercado ou a categoria.</p><button class="btn secondary" type="button" data-market-manual>Adicionar manualmente</button></div>`);
      return;
    }
    setHTML(root,`${warningHtml}${visible.map(productCardHtml).join('')}`);
  }

  async function executeSearch(){
    const term=cleanRemoteText(query,80);
    if(term.length<2){activeSearchController?.abort();renderSearchIntro();return;}
    const generation=++searchGeneration;
    activeSearchController?.abort();
    const controller=new AbortController();
    activeSearchController=controller;
    renderLoading();
    const cestaMarkets=['pingo-doce','continente'].filter(id=>selectedMarkets.has(id));
    const tasks=[];
    if(cestaMarkets.length)tasks.push({label:'Pingo Doce/Continente',promise:searchCestaProducts(term,cestaMarkets,controller.signal)});
    const imagePromise=searchProductImages(term,controller.signal);
    const settled=await Promise.allSettled(tasks.map(task=>task.promise));
    const imageSettled=await Promise.allSettled([imagePromise]);
    if(controller.signal.aborted||generation!==searchGeneration)return;
    const results=[];
    const warnings=[];
    settled.forEach((entry,index)=>{
      if(entry.status==='fulfilled')results.push(...entry.value);
      else if(entry.reason?.name!=='AbortError')warnings.push(`${tasks[index].label}: fonte temporariamente indisponível.`);
    });
    const imageCandidates=imageSettled[0]?.status==='fulfilled'?imageSettled[0].value:[];
    const enriched=enrichResultsWithImages(results,imageCandidates);
    const order=new Map(MARKET_IDS.map((id,index)=>[id,index]));
    enriched.sort((a,b)=>(order.get(a.marketId)??9)-(order.get(b.marketId)??9)||a.priceCents-b.priceCents);
    renderRemoteResults(enriched,warnings);
  }

  function scheduleSearch(delay=SEARCH_DEBOUNCE_MS){
    clearTimeout(searchTimer);
    searchTimer=setTimeout(()=>executeSearch().catch(error=>{
      if(error?.name==='AbortError')return;
      renderRemoteResults([],['Não foi possível concluir a pesquisa neste momento.']);
    }),delay);
  }

  function ensureHeaderAction(){
    const dialog=$('#formDialog');
    const head=dialog?.querySelector('.dialog-head');
    if(!head)return null;
    let action=head.querySelector('.market-prototype-header-action');
    if(!action){
      action=document.createElement('button');
      action.type='button';
      action.className='icon-btn market-prototype-header-action';
      head.appendChild(action);
    }
    return action;
  }

  function setBrowserHeader(view='search'){
    const dialog=$('#formDialog');if(!dialog)return;
    const head=dialog.querySelector('.dialog-head');
    const title=$('#dialogTitle');
    const close=head?.querySelector('.dialog-close');
    const action=ensureHeaderAction();
    head?.classList.toggle('market-prototype-detail-head-hidden',view==='detail');
    if(view==='detail')return;
    const titles={search:'Adicionar produto',catalog:'Explorar catálogo',library:'Biblioteca de fotografias'};
    if(title)title.textContent=titles[view]||titles.search;
    const eyebrow=head?.querySelector('.eyebrow');if(eyebrow)eyebrow.hidden=true;
    if(close){
      close.removeAttribute('data-close-dialog');
      close.removeAttribute('data-market-view-back');
      close.innerHTML=svgIcon('back',23);
      close.setAttribute('aria-label','Voltar');
      if(view==='search')close.setAttribute('data-close-dialog','');
      else close.setAttribute('data-market-view-back','');
    }
    if(action){
      action.hidden=false;
      action.removeAttribute('data-market-open-library');
      action.removeAttribute('data-market-library-more');
      if(view==='search'){
        action.innerHTML=svgIcon('image',20);
        action.setAttribute('data-market-open-library','');
        action.setAttribute('aria-label','Abrir biblioteca de fotografias');
      }else if(view==='library'){
        action.innerHTML=svgIcon('more',21);
        action.setAttribute('data-market-library-more','');
        action.setAttribute('aria-label','Mais opções da biblioteca');
      }else action.hidden=true;
    }
  }

  function showSearchView({focus=false}={}){
    const search=$('#marketPrototypeSearchView');
    const sub=$('#marketPrototypeSubview');
    if(search)search.hidden=false;
    if(sub){sub.hidden=true;setHTML(sub,'');}
    setBrowserHeader('search');
    refreshSearchControls();
    if(query.length>=2&&lastResults.length)renderRemoteResults(lastResults,lastWarnings);
    else if(query.length<2)renderSearchIntro();
    const input=$('#marketCatalogSearch');
    if(input){
      input.value=query;
      const clear=$('[data-market-search-clear]');if(clear)clear.hidden=!query;
      if(focus)requestAnimationFrame(()=>input.focus({preventScroll:true}));
    }
  }

  async function showCatalogView(){
    const search=$('#marketPrototypeSearchView');
    const sub=$('#marketPrototypeSubview');
    if(search)search.hidden=true;
    if(!sub)return;
    sub.hidden=false;
    setHTML(sub,'<div id="marketCatalogViewHost" class="market-prototype-catalog-host"></div>');
    setBrowserHeader('catalog');
    await globalThis.CDCMarketVisualCatalog?.mount?.();
  }

  function formatAuditDate(value){
    const date=new Date(value);
    if(!value||Number.isNaN(date.getTime()))return 'Ainda não validada';
    return date.toLocaleString('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  }

  function libraryStatusMeta(status){
    if(status==='unavailable')return {label:'Fotografia indisponível',tone:'problem',symbol:'!'};
    if(status==='expired')return {label:'Fotografia expirada',tone:'expired',symbol:'○'};
    if(status==='rejected')return {label:'Fotografia rejeitada',tone:'problem',symbol:'!'};
    return {label:'Fotografia válida',tone:'valid',symbol:'✓'};
  }

  async function renderLibraryView(report=currentLibraryAudit){
    const root=$('#marketPrototypeSubview');if(!root)return;
    const library=globalThis.CDCMarketImageLibrary;
    let records=[];
    let stats={count:0,lastAudit:null};
    try{
      records=await library?.listRecords?.({includeExpired:true})||[];
      stats=await library?.stats?.()||stats;
    }catch(_error){}
    const effective=report||stats.lastAudit||null;
    currentLibraryAudit=effective;
    const statusByKey=new Map((effective?.items||[]).map(item=>[item.key,item.status]));
    const items=records.map(record=>({...record,status:statusByKey.get(record.key)||record.status||'valid'}));
    const validCount=effective?(Number(effective.available)||Number(effective.valid)||0):items.filter(item=>item.status==='valid'||item.status==='available').length;
    const problemCount=effective?Number(effective.unavailable||0)+Number(effective.rejected||0):items.filter(item=>item.status==='unavailable'||item.status==='rejected').length;
    const expiredCount=effective?Number(effective.expired||0):items.filter(item=>item.status==='expired').length;
    const filtered=items.filter(item=>{
      if(libraryFilter==='problem')return item.status==='unavailable'||item.status==='rejected';
      if(libraryFilter==='expired')return item.status==='expired';
      return true;
    });
    const listHtml=filtered.length?filtered.map(item=>{
      const meta=libraryStatusMeta(item.status);
      const market=marketById(item.marketId);
      const image=item.imageUrl?`<img src="${attr(item.imageUrl)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">`:`<span>${svgIcon('image',19)}</span>`;
      return `<article class="market-library-row">
        <span class="market-library-thumb">${image}</span>
        <span class="market-library-copy"><strong>${esc(item.name||'Produto')}</strong><small>${esc(market.name)} · PID ${esc(item.pid||'—')}</small><span class="market-library-status ${meta.tone}"><strong>${meta.symbol}</strong>${meta.label}</span></span>
        ${svgIcon('chevron',18)}
      </article>`;
    }).join(''):`<div class="market-library-empty"><strong>Sem fotografias nesta vista</strong><p>A biblioteca não tem registos com este estado.</p></div>`;

    setHTML(root,`<div class="market-library-view">
      <div class="market-library-summary">
        <div class="market-library-summary-title"><span class="market-library-summary-icon">${svgIcon('image',23)}</span><span><strong>${Number(stats.count)||records.length} fotografias guardadas</strong><small>Última validação: ${esc(formatAuditDate(effective?.checkedAt))}</small></span></div>
        <div class="market-library-metrics">
          <article class="valid"><strong>${validCount}</strong><span>válidas</span></article>
          <article class="problem"><strong>${problemCount}</strong><span>com problema</span></article>
          <article class="expired"><strong>${expiredCount}</strong><span>expiradas</span></article>
        </div>
        <button class="market-library-validate" type="button" data-market-library-audit>${svgIcon('refresh',19)}<span>Validar todas</span></button>
      </div>
      <div class="market-library-filters" role="group" aria-label="Filtrar biblioteca">
        ${[['all','Todas'],['problem','Com problema'],['expired','Expiradas']].map(([id,label])=>`<button type="button" class="${libraryFilter===id?'active':''}" data-market-library-filter="${id}" aria-pressed="${libraryFilter===id}">${label}</button>`).join('')}
      </div>
      <div id="marketLibraryList" class="market-library-list">${listHtml}</div>
      <div id="marketImageRetailerStatus" hidden></div>
    </div>`);
  }

  async function showLibraryView(){
    const search=$('#marketPrototypeSearchView');
    const sub=$('#marketPrototypeSubview');
    if(search)search.hidden=true;
    if(!sub)return;
    sub.hidden=false;
    libraryFilter='all';
    setBrowserHeader('library');
    setHTML(sub,'<div class="market-library-loading" role="status">A preparar biblioteca…</div>');
    await renderLibraryView();
  }

  async function auditLibraryView(){
    const library=globalThis.CDCMarketImageLibrary;
    const button=$('[data-market-library-audit]');
    if(typeof library?.auditAll!=='function')return;
    if(button){button.disabled=true;button.setAttribute('aria-busy','true');button.querySelector('span')?.replaceChildren('A validar…');}
    try{
      currentLibraryAudit=await library.auditAll({verifyNetwork:true,pruneInvalid:true,concurrency:4,timeoutMs:6500});
      await renderLibraryView(currentLibraryAudit);
    }catch(_error){
      toast('Não foi possível concluir a validação da biblioteca.');
      await renderLibraryView(currentLibraryAudit);
    }
  }

  function detailViewHtml(product){
    const market=marketById(product.marketId);
    const category=inferCategory(product.name);
    const image=productImageHtml(product);
    const imageOrigin=product.imageUrl?(product.imageSource||'Fotografia validada'):'Sem fotografia validada';
    return `<div class="market-product-detail">
      <button class="market-product-detail-close" type="button" data-market-detail-close aria-label="Fechar detalhe">${svgIcon('close',20)}</button>
      <div class="market-product-detail-media">${image}</div>
      <div class="market-product-detail-copy">
        <h3>${esc(product.name)}</h3>
        <p>${esc(product.pack||'')} · ${esc(market.name)}</p>
        <strong class="market-product-detail-price" data-money>${money(product.priceCents)}</strong>
      </div>
      <div class="market-product-detail-quantity">
        <span>Quantidade</span>
        <div class="market-product-stepper"><button type="button" data-market-detail-quantity="-1" aria-label="Diminuir quantidade">${svgIcon('minus',18)}</button><strong id="marketDetailQuantity">${detailQuantity}</strong><button type="button" data-market-detail-quantity="1" aria-label="Aumentar quantidade">${svgIcon('plus',18)}</button></div>
      </div>
      <button class="market-product-detail-add" type="button" data-market-detail-add="${attr(product.id)}">${svgIcon('cart',19)}<span>Adicionar à lista</span></button>
      <div class="market-product-detail-info">
        <h3>Informações</h3>
        <div class="market-product-detail-data">
          <div><span class="market-product-detail-label">Mercado</span><span class="market-product-detail-value">${esc(market.name)}</span></div>
          <div><span class="market-product-detail-label">Categoria</span><span class="market-product-detail-value">${esc(category)}</span></div>
          <div><span class="market-product-detail-label">Origem da imagem</span><span class="market-product-detail-value ${product.imageUrl?'valid':''}">${product.imageUrl?'✓ ':''}${esc(imageOrigin)}</span></div>
          <div><span class="market-product-detail-label">PID</span><span class="market-product-detail-value">${esc(product.pid||product.productCode||'—')}</span></div>
        </div>
      </div>
    </div>`;
  }

  function showProductDetail(resultId){
    const product=resultById.get(resultId);if(!product)return;
    const search=$('#marketPrototypeSearchView');
    const sub=$('#marketPrototypeSubview');
    if(search)search.hidden=true;
    if(!sub)return;
    detailQuantity=1;
    sub.hidden=false;
    setHTML(sub,detailViewHtml(product));
    setBrowserHeader('detail');
  }

  function openMarketBrowser(){
    selectedMarkets=new Set(MARKET_IDS);
    query='';
    lastResults=[];
    lastWarnings=[];
    resultById=new Map();
    selectedCategory='all';
    categoryOpen=false;
    resultSort='relevance';
    currentLibraryAudit=null;
    openDialog('Adicionar produto',browserShellHtml(),MARKET_BROWSER_MODE);
    const dialog=$('#formDialog');
    dialog?.classList.add('market-browser-dialog','market-add-product-prototype');
    setBrowserHeader('search');
    renderSearchIntro();
    requestAnimationFrame(()=>$('#marketCatalogSearch')?.focus({preventScroll:true}));
  }

  async function addProduct(resultId,quantity=1){
    const product=resultById.get(resultId);
    if(!product||!appState)return;
    const safeQuantity=Math.max(1,Math.min(Number(quantity)||1,99));
    const now=new Date().toISOString();
    appState.market.push({
      id:uid(),name:cleanRemoteText(product.name,80),category:inferCategory(product.name),quantity:String(safeQuantity),unit:'un',
      estimatedCents:product.priceCents,actualCents:0,purchased:false,
      productCode:cleanRemoteText(product.productCode||'',32),imageUrl:safeProductImageUrl(product.imageUrl),
      imageSource:product.imageUrl?(product.imageSource||'Open Food Facts'):'',imageMatchedAt:product.imageUrl?(product.imageMatchedAt||now):null,
      createdAt:now,updatedAt:now,purchasedAt:null
    });
    await commit('created','market');
    closeDialog();
    showPage('market');
    toast(`${product.name} adicionado à lista.`);
  }

  function restoreDialogHeader(){
    activeSearchController?.abort();
    clearTimeout(searchTimer);
    const dialog=$('#formDialog');
    if(!dialog)return;
    dialog.classList.remove('market-browser-dialog','market-add-product-prototype');
    const head=dialog.querySelector('.dialog-head');
    head?.classList.remove('market-prototype-detail-head-hidden');
    head?.querySelector('.market-prototype-header-action')?.remove();
    const eyebrow=head?.querySelector('.eyebrow');if(eyebrow)eyebrow.hidden=false;
    const close=head?.querySelector('.dialog-close');
    if(close){
      close.removeAttribute('data-market-view-back');
      close.setAttribute('data-close-dialog','');
      close.textContent='×';
      close.setAttribute('aria-label','Fechar janela');
    }
  }

  function isMarketEntryTarget(target){
    return target?.closest?.('#newMarketBtn')||target?.closest?.('[data-quick="market"]');
  }

  function interceptMarketEntry(event){
    if(!isMarketEntryTarget(event.target))return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const quick=$('#quickDialog');
    if(quick?.open)quick.close();
    openMarketBrowser();
  }

  function applyQuery(value){
    query=cleanRemoteText(value,80);
    const input=$('#marketCatalogSearch');
    if(input&&input.value!==query)input.value=query;
    const clear=$('[data-market-search-clear]');if(clear)clear.hidden=!query;
    scheduleSearch(0);
  }

  function handleBrowserClick(event){
    const dialog=event.target.closest?.('#formDialog[data-mode="market-browser"]');
    if(!dialog)return;

    const scope=event.target.closest('[data-market-scope]');
    if(scope){
      const id=scope.dataset.marketScope;
      selectedMarkets=id==='all'?new Set(MARKET_IDS):new Set([id]);
      refreshSearchControls();
      if(query.length>=2)scheduleSearch(0);
      return;
    }

    const categoryToggle=event.target.closest('[data-market-category-toggle]');
    if(categoryToggle){
      categoryOpen=!categoryOpen;
      refreshSearchControls();
      return;
    }

    const category=event.target.closest('[data-market-category]');
    if(category){
      selectedCategory=category.dataset.marketCategory||'all';
      categoryOpen=false;
      refreshSearchControls();
      if(lastResults.length)renderRemoteResults(lastResults,lastWarnings);
      return;
    }

    const clear=event.target.closest('[data-market-search-clear]');
    if(clear){applyQuery('');$('#marketCatalogSearch')?.focus();return;}

    if(event.target.closest('[data-market-open-catalog]')){void showCatalogView();return;}
    if(event.target.closest('[data-market-open-library]')){void showLibraryView();return;}
    if(event.target.closest('[data-market-view-back]')){showSearchView();return;}
    if(event.target.closest('[data-market-detail-close]')){showSearchView();return;}
    if(event.target.closest('[data-market-library-more]')){toast('A biblioteca é atualizada e validada a partir deste ecrã.');return;}

    const detail=event.target.closest('[data-market-detail-product]');
    if(detail){showProductDetail(detail.dataset.marketDetailProduct);return;}

    const add=event.target.closest('[data-market-add-product]');
    if(add){addProduct(add.dataset.marketAddProduct,1).catch(()=>toast('Não foi possível adicionar o produto.'));return;}

    const qty=event.target.closest('[data-market-detail-quantity]');
    if(qty){
      detailQuantity=Math.max(1,Math.min(99,detailQuantity+Number(qty.dataset.marketDetailQuantity||0)));
      const out=$('#marketDetailQuantity');if(out)out.textContent=String(detailQuantity);
      return;
    }

    const detailAdd=event.target.closest('[data-market-detail-add]');
    if(detailAdd){addProduct(detailAdd.dataset.marketDetailAdd,detailQuantity).catch(()=>toast('Não foi possível adicionar o produto.'));return;}

    if(event.target.closest('[data-market-library-audit]')){void auditLibraryView();return;}

    const libraryFilterButton=event.target.closest('[data-market-library-filter]');
    if(libraryFilterButton){
      libraryFilter=['all','problem','expired'].includes(libraryFilterButton.dataset.marketLibraryFilter)?libraryFilterButton.dataset.marketLibraryFilter:'all';
      void renderLibraryView(currentLibraryAudit);
      return;
    }

    const manual=event.target.closest('[data-market-manual]');
    if(manual){closeDialog();requestAnimationFrame(()=>openMarketForm());}
  }

  function handleBrowserInput(event){
    if(event.target.matches?.('#formDialog[data-mode="market-browser"] #marketCatalogSearch')){
      query=cleanRemoteText(event.target.value,80);
      const clear=$('[data-market-search-clear]');if(clear)clear.hidden=!query;
      scheduleSearch();
      return;
    }
    if(event.target.matches?.('#marketCategorySearch')){
      const needle=normalized(event.target.value);
      document.querySelectorAll('#marketCategoryOptions [data-market-category]').forEach(button=>{
        button.hidden=Boolean(needle)&&!normalized(button.textContent).includes(needle);
      });
    }
  }

  function handleBrowserChange(event){
    if(!event.target.matches?.('#marketResultSort'))return;
    resultSort=['relevance','price-asc','price-desc'].includes(event.target.value)?event.target.value:'relevance';
    if(lastResults.length)renderRemoteResults(lastResults,lastWarnings);
  }

  globalThis.addEventListener?.('cdc:market-catalog-picked',()=>showSearchView({focus:false}));
  globalThis.addEventListener?.('cdc:market-image-library-audit-progress',event=>{
    const button=$('[data-market-library-audit]');
    if(!button)return;
    const completed=Number(event?.detail?.completed)||0;
    const total=Number(event?.detail?.total)||0;
    const label=button.querySelector('span');
    if(label)label.textContent=`A validar ${completed}/${total}`;
  });

  function syncMarketShellClass(){
    const active=$('#page-market')?.classList.contains('active');
    document.documentElement.classList.toggle('market-prototype-active',Boolean(active));
  }

  function installShellObserver(){
    const page=$('#page-market');
    if(!page||observer)return;
    observer=new MutationObserver(syncMarketShellClass);
    observer.observe(page,{attributes:true,attributeFilter:['class']});
    syncMarketShellClass();
  }

  window.addEventListener('click',interceptMarketEntry,true);
  document.addEventListener('click',handleBrowserClick);
  document.addEventListener('input',handleBrowserInput);
  document.addEventListener('change',handleBrowserChange);
  $('#formDialog')?.addEventListener('close',restoreDialogHeader);
  installShellObserver();
})();

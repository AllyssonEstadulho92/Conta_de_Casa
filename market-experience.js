'use strict';

/*
 * Conta de Casa — pesquisa de preços reais (v52)
 * Continente/Pingo Doce: consulta atual através de cesta.pt, com URL oficial do produto.
 * Mercadona Portugal: observações públicas com comprovativo através de Open Prices.
 * Nenhum preço fictício ou imagem de produto é usado nesta camada.
 */
(function marketLiveExperience(){
  const MARKET_BROWSER_MODE='market-browser';
  const CESTA_MCP_URL='https://cesta.pt/mcp';
  const OPEN_PRICES_API='https://prices.openfoodfacts.org/api/v1';
  const SEARCH_DEBOUNCE_MS=450;
  const SEARCH_TIMEOUT_MS=12000;
  const MAX_REMOTE_RESULTS=20;
  const MARKET_IDS=['pingo-doce','continente','mercadona'];
  const MARKET_DEFINITIONS=Object.freeze([
    {id:'pingo-doce',name:'Pingo Doce',short:'PD',tone:'green',provider:'cesta',providerId:'pingodoce'},
    {id:'continente',name:'Continente',short:'C',tone:'red',provider:'cesta',providerId:'continente'},
    {id:'mercadona',name:'Mercadona',short:'M',tone:'orange',provider:'open-prices',providerId:'mercadona'}
  ]);
  const PRODUCT_SUGGESTIONS=Object.freeze(['Leite meio gordo','Ovos','Arroz','Azeite','Café','Detergente','Papel higiénico','Água']);
  const CATEGORY_SUGGESTIONS=Object.freeze([
    ['Lacticínios e ovos','leite'],['Mercearia / Despensa','arroz'],['Bebidas','água'],['Limpeza','detergente'],
    ['Higiene pessoal','champô'],['Frutas e legumes','banana'],['Carne e peixe','frango'],['Snacks e doces','chocolate']
  ]);

  let selectedMarkets=new Set(MARKET_IDS);
  let activeTab='markets';
  let query='';
  let observer=null;
  let searchTimer=0;
  let searchGeneration=0;
  let activeSearchController=null;
  let resultById=new Map();
  let mercadonaLocationIds=null;

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
      refresh:'<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>'
    };
    return `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.search}</svg>`;
  }

  function marketMark(market,size='large'){
    const m=typeof market==='string'?marketById(market):market;
    return `<span class="market-brand-mark ${attr(m.tone)} ${attr(size)}" aria-hidden="true"><span>${esc(m.short)}</span></span>`;
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

  function observationAgeDays(value){
    const date=Date.parse(`${value}T00:00:00Z`);
    if(!Number.isFinite(date))return Infinity;
    return Math.max(0,Math.floor((Date.now()-date)/86400000));
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

  function marketSelectorHtml(){
    return `<div class="market-source-grid" role="group" aria-label="Mercados a pesquisar">${MARKET_DEFINITIONS.map(m=>{
      const selected=selectedMarkets.has(m.id);
      return `<button class="market-source-card${selected?' selected':''}" type="button" data-market-source="${attr(m.id)}" aria-pressed="${selected}">
        ${marketMark(m)}
        <span class="market-source-name">${esc(m.name)}</span>
        <span class="market-source-check" aria-hidden="true">${selected?svgIcon('check',14):''}</span>
      </button>`;
    }).join('')}</div>`;
  }

  function tabsHtml(){
    return `<div class="market-browser-tabs" role="tablist" aria-label="Pesquisa do mercado">
      ${[['markets','Mercados'],['products','Produtos'],['categories','Categorias']].map(([id,label])=>`<button class="market-browser-tab${activeTab===id?' active':''}" type="button" role="tab" aria-selected="${activeTab===id}" data-market-browser-tab="${id}">${label}</button>`).join('')}
    </div>`;
  }

  function browserShellHtml(){
    return `<div class="market-browser" data-market-price-mode="live">
      <div class="market-browser-search-row">
        <div class="market-browser-search">${svgIcon('search',24)}<input id="marketCatalogSearch" type="search" value="" placeholder="Pesquisar produto real" autocomplete="off" aria-label="Pesquisar produto nos mercados"><button class="market-search-clear" type="button" data-market-search-clear aria-label="Limpar pesquisa">${svgIcon('close',22)}</button></div>
      </div>
      ${tabsHtml()}
      <div id="marketBrowserTabPanel" class="market-browser-tab-panel" role="tabpanel"></div>
      <div class="market-source-notice" role="note">${svgIcon('info',21)}<p><strong>Fontes verificáveis.</strong> Continente e Pingo Doce são consultados no momento através de cesta.pt e os resultados incluem ligação ao produto oficial. Mercadona usa observações de lojas em Portugal com comprovativo no Open Prices; a data é sempre indicada. Não são usados preços fictícios. A pesquisa é enviada apenas às fontes necessárias.</p></div>
      <div class="market-browser-results-head"><h3>Resultados</h3><span id="marketResultsMeta">Escreva pelo menos 2 caracteres</span></div>
      <div id="marketCatalogResults" class="market-catalog-results" aria-live="polite"></div>
    </div>`;
  }

  function updateTabPanel(){
    const root=$('#marketBrowserTabPanel');
    if(!root)return;
    if(activeTab==='markets'){
      setHTML(root,marketSelectorHtml());
      return;
    }
    if(activeTab==='products'){
      setHTML(root,`<div class="market-browser-chip-grid" aria-label="Sugestões de pesquisa">${PRODUCT_SUGGESTIONS.map(name=>`<button type="button" class="market-browser-chip" data-market-chip-query="${attr(name)}"><span>${esc(name)}</span></button>`).join('')}</div>`);
      return;
    }
    setHTML(root,`<div class="market-browser-chip-grid" aria-label="Categorias de pesquisa">${CATEGORY_SUGGESTIONS.map(([label,term])=>`<button type="button" class="market-browser-chip" data-market-chip-query="${attr(term)}"><span>${esc(label)}</span></button>`).join('')}</div>`);
  }

  function updateTabs(){
    $$('.market-browser-tab').forEach(button=>{
      const selected=button.dataset.marketBrowserTab===activeTab;
      button.classList.toggle('active',selected);
      button.setAttribute('aria-selected',String(selected));
    });
    updateTabPanel();
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
        provider:'cesta',marketId,name,pack,priceCents,oldPriceCents,
        discount:cleanRemoteText(discountMatch?.[1]||'',12),promotionUntil:promoMatch?.[1]||'',unitPrice,
        sourceUrl,sourceLabel:'Produto oficial',freshness:'current',observedDate:''
      });
    }
    return results;
  }

  async function searchCestaProducts(term,marketIds,signal){
    const stores=marketIds.map(id=>marketById(id).providerId).filter(Boolean);
    if(!stores.length)return [];
    await cestaRpc({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'Conta de Casa',version:'52'}}},signal);
    await cestaRpc({jsonrpc:'2.0',method:'notifications/initialized'},signal);
    const event=await cestaRpc({jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'search_products',arguments:{query:term,stores,limit:8}}},signal);
    const text=event?.result?.content?.find(item=>item?.type==='text')?.text||'';
    return parseCestaResults(text).filter(result=>marketIds.includes(result.marketId));
  }

  async function fetchOpenPricesJson(path,signal){
    const response=await fetchWithTimeout(`${OPEN_PRICES_API}${path}`,{headers:{'Accept':'application/json'}},signal);
    if(!response.ok)throw new Error(`open-prices-http-${response.status}`);
    const data=await response.json();
    return data&&typeof data==='object'?data:{};
  }

  async function getMercadonaLocationIds(signal){
    if(Array.isArray(mercadonaLocationIds)&&mercadonaLocationIds.length)return mercadonaLocationIds;
    const params=new URLSearchParams({osm_name__like:'Mercadona',osm_address_country__like:'Portugal',price_count__gte:'1',size:'100'});
    const data=await fetchOpenPricesJson(`/locations?${params}`,signal);
    mercadonaLocationIds=(Array.isArray(data.items)?data.items:[])
      .filter(item=>normalized(item?.osm_name||item?.osm_brand).includes('mercadona')&&(item?.osm_address_country_code==='PT'||normalized(item?.osm_address_country)==='portugal'))
      .map(item=>Number(item.id)).filter(Number.isSafeInteger);
    return mercadonaLocationIds;
  }

  function matchesSearchTerms(product,term){
    const words=normalized(term).split(/\s+/).filter(word=>word.length>=2);
    const haystack=normalized([product?.product_name,product?.brands,product?.quantity].filter(Boolean).join(' '));
    return words.length?words.every(word=>haystack.includes(word)):false;
  }

  function openPriceToResult(item){
    const product=item?.product||{};
    const location=item?.location||{};
    const observedDate=String(item?.date||item?.proof?.date||'');
    const ageDays=observationAgeDays(observedDate);
    const priceCents=Math.round(Number(item?.price)*100);
    const productName=cleanRemoteText(product?.product_name||item?.product_name||`Produto ${product?.code||item?.product_code||''}`,120);
    const brand=cleanRemoteText(product?.brands||'',70);
    const quantity=cleanRemoteText(product?.quantity||[product?.product_quantity,product?.product_quantity_unit].filter(Boolean).join(' '),70);
    const city=cleanRemoteText(location?.osm_address_city||'',70);
    return {
      id:`open-prices-mercadona-${item?.id||product?.id||product?.code||'unknown'}`,
      provider:'open-prices',marketId:'mercadona',name:productName,pack:[quantity,brand].filter(Boolean).join(' · '),
      priceCents:Number.isSafeInteger(priceCents)&&priceCents>0?priceCents:0,oldPriceCents:0,discount:'',promotionUntil:'',unitPrice:'',
      sourceUrl:'',sourceLabel:item?.proof_id||item?.proof?.id?'Open Prices · com comprovativo':'Open Prices',
      freshness:ageDays<=30?'recent':ageDays<=90?'dated':'old',observedDate,ageDays,city
    };
  }

  async function searchMercadonaProducts(term,signal){
    const locationIds=await getMercadonaLocationIds(signal);
    if(!locationIds.length)return [];
    const productParams=new URLSearchParams({product_name__like:term,price_count__gte:'1',size:'50'});
    const productData=await fetchOpenPricesJson(`/products?${productParams}`,signal);
    const products=(Array.isArray(productData.items)?productData.items:[]).filter(product=>matchesSearchTerms(product,term));
    const productIds=products.map(product=>Number(product.id)).filter(Number.isSafeInteger);
    if(!productIds.length)return [];
    const priceParams=new URLSearchParams({
      location_id__in:locationIds.join(','),product_id__in:productIds.join(','),currency:'EUR',order_by:'-date',size:'100'
    });
    const priceData=await fetchOpenPricesJson(`/prices?${priceParams}`,signal);
    const raw=(Array.isArray(priceData.items)?priceData.items:[])
      .filter(item=>Number(item?.price)>0&&(item?.proof_id||item?.proof?.id))
      .filter(item=>normalized(item?.location?.osm_name||item?.location?.osm_brand).includes('mercadona'))
      .map(openPriceToResult).filter(item=>item.priceCents>0&&item.name);
    raw.sort((a,b)=>String(b.observedDate).localeCompare(String(a.observedDate))||a.priceCents-b.priceCents);
    const unique=[];
    const seen=new Set();
    for(const item of raw){
      const key=normalized(`${item.name}|${item.pack}`);
      if(seen.has(key))continue;
      seen.add(key);unique.push(item);
      if(unique.length>=8)break;
    }
    return unique;
  }

  function resultStatusHtml(product){
    if(product.provider==='cesta'){
      if(product.discount||product.promotionUntil){
        const detail=[product.discount,product.promotionUntil?`até ${formatObservedDate(product.promotionUntil)}`:''].filter(Boolean).join(' · ');
        return `<span class="market-result-chip promo">Promoção${detail?` · ${esc(detail)}`:''}</span>`;
      }
      return '<span class="market-result-chip current">Consultado agora</span>';
    }
    const date=formatObservedDate(product.observedDate);
    if(product.freshness==='recent')return `<span class="market-result-chip current">Observado ${esc(date)} · recente</span>`;
    if(product.freshness==='dated')return `<span class="market-result-chip dated">Observado ${esc(date)}</span>`;
    return `<span class="market-result-chip old">Observado ${esc(date)} · pode já ter mudado</span>`;
  }

  function productCardHtml(product){
    const market=marketById(product.marketId);
    const subtitle=[product.pack,market.name,product.city,product.provider==='open-prices'&&product.observedDate?`observado ${formatObservedDate(product.observedDate)}`:''].filter(Boolean).join(' · ');
    const oldPrice=product.oldPriceCents>product.priceCents?`<span class="market-result-old-price">antes ${money(product.oldPriceCents)}</span>`:'';
    const sourceLink=product.sourceUrl?`<button class="market-result-source" type="button" data-market-source-url="${attr(product.id)}" aria-label="Abrir produto oficial">${svgIcon('external',15)}<span>${esc(product.sourceLabel)}</span></button>`:`<span class="market-result-source text-only">${esc(product.sourceLabel)}</span>`;
    return `<article class="market-catalog-card" data-market-product-card="${attr(product.id)}">
      <div class="market-catalog-main">
        <div class="market-product-copy">
          <h3>${esc(product.name)}</h3>
          <p>${esc(subtitle||market.name)}</p>
          <div class="market-result-meta">${resultStatusHtml(product)}${sourceLink}</div>
          <div class="market-result-price-row"><strong class="market-product-price" data-money>${money(product.priceCents)}</strong>${oldPrice}${product.unitPrice?`<small>${esc(product.unitPrice)}</small>`:''}</div>
        </div>
        <button class="market-add-product" type="button" data-market-add-product="${attr(product.id)}" aria-label="Adicionar ${attr(product.name)} à lista">${svgIcon('plus',24)}</button>
      </div>
    </article>`;
  }

  function renderSearchIntro(){
    resultById=new Map();
    const meta=$('#marketResultsMeta');
    if(meta)meta.textContent='Escreva pelo menos 2 caracteres';
    const root=$('#marketCatalogResults');
    if(root)setHTML(root,`<div class="market-browser-empty"><span class="market-browser-empty-icon">${svgIcon('search',26)}</span><strong>Pesquise um produto</strong><p>A pesquisa consulta produtos reais nas fontes selecionadas. Pode escrever, por exemplo, “leite meio gordo”, “arroz” ou “detergente”.</p></div>`);
  }

  function renderLoading(){
    const meta=$('#marketResultsMeta');
    if(meta)meta.textContent='A consultar fontes…';
    const root=$('#marketCatalogResults');
    if(root)setHTML(root,`<div class="market-browser-loading" role="status"><span class="market-loading-spinner" aria-hidden="true"></span><div><strong>A pesquisar preços</strong><p>A consultar apenas as fontes selecionadas.</p></div></div>`);
  }

  function renderRemoteResults(results,warnings=[]){
    const root=$('#marketCatalogResults');
    if(!root)return;
    resultById=new Map(results.map(item=>[item.id,item]));
    const meta=$('#marketResultsMeta');
    if(meta)meta.textContent=`${results.length} resultado${results.length===1?'':'s'}`;
    const warningHtml=warnings.length?`<div class="market-provider-warning" role="status">${svgIcon('info',19)}<p>${warnings.map(esc).join(' ')}</p></div>`:'';
    if(!results.length){
      setHTML(root,`${warningHtml}<div class="market-browser-empty"><span class="market-browser-empty-icon">${svgIcon('search',26)}</span><strong>Sem preço verificado para esta pesquisa</strong><p>Não foi encontrado um resultado verificável nas fontes selecionadas. Pode alterar a pesquisa ou adicionar o produto manualmente.</p><button class="btn secondary" type="button" data-market-manual>Adicionar manualmente</button></div>`);
      return;
    }
    setHTML(root,`${warningHtml}${results.map(productCardHtml).join('')}`);
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
    if(cestaMarkets.length)tasks.push({label:'Continente/Pingo Doce',promise:searchCestaProducts(term,cestaMarkets,controller.signal)});
    if(selectedMarkets.has('mercadona'))tasks.push({label:'Mercadona',promise:searchMercadonaProducts(term,controller.signal)});
    const settled=await Promise.allSettled(tasks.map(task=>task.promise));
    if(controller.signal.aborted||generation!==searchGeneration)return;
    const results=[];
    const warnings=[];
    settled.forEach((entry,index)=>{
      if(entry.status==='fulfilled')results.push(...entry.value);
      else if(entry.reason?.name!=='AbortError')warnings.push(`${tasks[index].label}: fonte temporariamente indisponível.`);
    });
    const order=new Map(MARKET_IDS.map((id,index)=>[id,index]));
    results.sort((a,b)=>(order.get(a.marketId)??9)-(order.get(b.marketId)??9)||(a.provider==='open-prices'?String(b.observedDate).localeCompare(String(a.observedDate)):a.priceCents-b.priceCents));
    renderRemoteResults(results.slice(0,MAX_REMOTE_RESULTS),warnings);
  }

  function scheduleSearch(delay=SEARCH_DEBOUNCE_MS){
    clearTimeout(searchTimer);
    searchTimer=setTimeout(()=>executeSearch().catch(error=>{
      if(error?.name==='AbortError')return;
      renderRemoteResults([],['Não foi possível concluir a pesquisa neste momento.']);
    }),delay);
  }

  function openMarketBrowser(){
    selectedMarkets=new Set(MARKET_IDS);
    activeTab='markets';
    query='';
    resultById=new Map();
    openDialog('Adicionar produto',browserShellHtml(),MARKET_BROWSER_MODE);
    const dialog=$('#formDialog');
    dialog?.classList.add('market-browser-dialog');
    const title=$('#dialogTitle');
    if(title)title.textContent='Adicionar produto';
    const eyebrow=dialog?.querySelector('.dialog-head .eyebrow');
    if(eyebrow)eyebrow.hidden=true;
    const close=dialog?.querySelector('[data-close-dialog]');
    if(close){close.innerHTML=svgIcon('back',25);close.setAttribute('aria-label','Voltar');}
    updateTabPanel();
    renderSearchIntro();
    requestAnimationFrame(()=>$('#marketCatalogSearch')?.focus({preventScroll:true}));
  }

  async function addProduct(resultId){
    const product=resultById.get(resultId);
    if(!product||!appState)return;
    const now=new Date().toISOString();
    appState.market.push({
      id:uid(),name:cleanRemoteText(product.name,80),category:inferCategory(product.name),quantity:'1',unit:'un',
      estimatedCents:product.priceCents,actualCents:0,purchased:false,
      createdAt:now,updatedAt:now,purchasedAt:null
    });
    await commit('created','market');
    closeDialog();
    showPage('market');
    const sourceText=product.provider==='open-prices'&&product.observedDate?` observado em ${formatObservedDate(product.observedDate)}`:' consultado agora';
    toast(`${product.name} adicionado com ${money(product.priceCents)} como preço estimado (${marketById(product.marketId).name},${sourceText}).`);
  }

  function restoreDialogHeader(){
    activeSearchController?.abort();
    clearTimeout(searchTimer);
    const dialog=$('#formDialog');
    if(!dialog)return;
    dialog.classList.remove('market-browser-dialog');
    const eyebrow=dialog.querySelector('.dialog-head .eyebrow');
    if(eyebrow)eyebrow.hidden=false;
    const close=dialog.querySelector('[data-close-dialog]');
    if(close){close.textContent='×';close.setAttribute('aria-label','Fechar janela');}
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
    scheduleSearch(0);
  }

  function handleBrowserClick(event){
    const dialog=event.target.closest?.('#formDialog[data-mode="market-browser"]');
    if(!dialog)return;
    const source=event.target.closest('[data-market-source]');
    if(source){
      const id=source.dataset.marketSource;
      if(selectedMarkets.has(id)){
        if(selectedMarkets.size===1){toast('Mantenha pelo menos um mercado selecionado.');return;}
        selectedMarkets.delete(id);
      }else selectedMarkets.add(id);
      updateTabPanel();scheduleSearch(0);return;
    }
    const tab=event.target.closest('[data-market-browser-tab]');
    if(tab){activeTab=tab.dataset.marketBrowserTab;updateTabs();return;}
    const clear=event.target.closest('[data-market-search-clear]');
    if(clear){applyQuery('');$('#marketCatalogSearch')?.focus();return;}
    const chip=event.target.closest('[data-market-chip-query]');
    if(chip){applyQuery(chip.dataset.marketChipQuery||'');$('#marketCatalogSearch')?.focus();return;}
    const sourceButton=event.target.closest('[data-market-source-url]');
    if(sourceButton){
      const product=resultById.get(sourceButton.dataset.marketSourceUrl);
      const url=product?.sourceUrl?safeRetailerUrl(product.sourceUrl,product.marketId):'';
      if(url)window.open(url,'_blank','noopener,noreferrer');
      return;
    }
    const add=event.target.closest('[data-market-add-product]');
    if(add){addProduct(add.dataset.marketAddProduct).catch(()=>toast('Não foi possível adicionar o produto.'));return;}
    const manual=event.target.closest('[data-market-manual]');
    if(manual){closeDialog();requestAnimationFrame(()=>openMarketForm());}
  }

  function handleBrowserInput(event){
    if(!event.target.matches?.('#formDialog[data-mode="market-browser"] #marketCatalogSearch'))return;
    query=cleanRemoteText(event.target.value,80);
    scheduleSearch();
  }

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
  $('#formDialog')?.addEventListener('close',restoreDialogHeader);
  installShellObserver();
})();

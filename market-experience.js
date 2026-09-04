'use strict';

/*
 * Conta de Casa — Market prototype experience (v51)
 * Visual prototype layer only. Product/store prices below are demonstration values,
 * not live retailer data. The existing encrypted market data model is preserved.
 */
(function marketPrototypeExperience(){
  const MARKET_BROWSER_MODE='market-browser';
  const MARKET_IDS=['pingo-doce','continente','mercadona'];
  const MARKET_DEFINITIONS=Object.freeze([
    {id:'pingo-doce',name:'Pingo Doce',short:'PD',tone:'green'},
    {id:'continente',name:'Continente',short:'C',tone:'red'},
    {id:'mercadona',name:'Mercadona',short:'M',tone:'orange'}
  ]);
  const DEMO_PRODUCTS=Object.freeze([
    {
      id:'demo-milk-pingo',name:'Leite Meio Gordo',pack:'1 L',category:'Laticínios',unit:'un',primaryMarket:'pingo-doce',promotion:true,
      offers:{'pingo-doce':76,'continente':79,'mercadona':75}
    },
    {
      id:'demo-milk-continente',name:'Leite Meio Gordo',pack:'1 L',category:'Laticínios',unit:'un',primaryMarket:'continente',promotion:false,
      offers:{'pingo-doce':76,'continente':79,'mercadona':75}
    },
    {
      id:'demo-milk-mercadona',name:'Leite Meio Gordo',pack:'1 L · Hacendado',category:'Laticínios',unit:'un',primaryMarket:'mercadona',promotion:false,
      offers:{'pingo-doce':76,'continente':79,'mercadona':75}
    },
    {
      id:'demo-eggs',name:'Ovos Classe M/L',pack:'12 un',category:'Mercearia',unit:'un',primaryMarket:'pingo-doce',promotion:false,
      offers:{'pingo-doce':239,'continente':249,'mercadona':235}
    },
    {
      id:'demo-rice',name:'Arroz Agulha',pack:'1 kg',category:'Mercearia',unit:'un',primaryMarket:'continente',promotion:true,
      offers:{'pingo-doce':139,'continente':129,'mercadona':135}
    },
    {
      id:'demo-olive-oil',name:'Azeite Virgem Extra',pack:'750 ml',category:'Mercearia',unit:'un',primaryMarket:'mercadona',promotion:false,
      offers:{'pingo-doce':699,'continente':719,'mercadona':689}
    }
  ]);

  let selectedMarkets=new Set(MARKET_IDS);
  let activeTab='markets';
  let query='Leite meio gordo';
  let observer=null;

  const marketById=id=>MARKET_DEFINITIONS.find(m=>m.id===id)||MARKET_DEFINITIONS[0];
  const productById=id=>DEMO_PRODUCTS.find(p=>p.id===id)||null;
  const normalized=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-PT').trim();

  function svgIcon(name,size=24){
    const paths={
      search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
      close:'<path d="m6 6 12 12M18 6 6 18"/>',
      back:'<path d="m15 18-6-6 6-6"/>',
      info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
      plus:'<path d="M12 5v14M5 12h14"/>',
      check:'<path d="m5 12 4 4L19 6"/>',
      package:'<path d="M5 7.5 12 4l7 3.5v9L12 20l-7-3.5z"/><path d="M5 7.5 12 11l7-3.5M12 11v9"/>',
      chevron:'<path d="m9 18 6-6-6-6"/>'
    };
    return `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.package}</svg>`;
  }

  function marketMark(market,size='large'){
    const m=typeof market==='string'?marketById(market):market;
    return `<span class="market-brand-mark ${attr(m.tone)} ${attr(size)}" aria-hidden="true"><span>${esc(m.short)}</span></span>`;
  }

  function cartonArt(marketId){
    const market=marketById(marketId);
    return `<span class="market-product-art ${attr(market.tone)}" aria-hidden="true">
      <span class="carton-cap"></span><span class="carton-brand">${esc(market.short)}</span><span class="carton-label">LEITE</span><span class="carton-volume">1 L</span>
    </span>`;
  }

  function offerEntries(product){
    return MARKET_DEFINITIONS.map(m=>({market:m,priceCents:Number(product.offers?.[m.id]||0)})).filter(entry=>entry.priceCents>0);
  }

  function selectedOffer(product){
    const entries=offerEntries(product).filter(entry=>selectedMarkets.has(entry.market.id));
    const candidates=entries.length?entries:offerEntries(product);
    return candidates.sort((a,b)=>a.priceCents-b.priceCents)[0]||null;
  }

  function marketSelectorHtml(){
    return `<div class="market-source-grid" role="group" aria-label="Mercados a comparar">${MARKET_DEFINITIONS.map(m=>{
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
    return `<div class="market-browser" data-market-price-mode="demo">
      <div class="market-browser-search-row">
        <div class="market-browser-search">${svgIcon('search',24)}<input id="marketCatalogSearch" type="search" value="${attr(query)}" placeholder="Pesquisar produto" autocomplete="off" aria-label="Pesquisar produto no comparador"><button class="market-search-clear" type="button" data-market-search-clear aria-label="Limpar pesquisa">${svgIcon('close',22)}</button></div>
      </div>
      ${tabsHtml()}
      <div id="marketBrowserTabPanel" class="market-browser-tab-panel" role="tabpanel"></div>
      <div class="market-price-notice" role="note">${svgIcon('info',22)}<p><strong>Protótipo visual.</strong> Os preços apresentados são valores de demonstração e não são preços em tempo real. Uma integração automática só deve ser ativada quando existir uma fonte verificada para cada mercado.</p></div>
      <div class="market-browser-results-head"><h3>Resultados encontrados</h3><button type="button" class="link-btn" data-market-see-all>Ver todos</button></div>
      <div id="marketCatalogResults" class="market-catalog-results" aria-live="polite"></div>
      <button class="market-more-results" type="button" data-market-see-all>${svgIcon('search',21)}<span>Ver mais resultados</span>${svgIcon('chevron',20)}</button>
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
      const products=[...new Set(DEMO_PRODUCTS.map(p=>p.name))].sort((a,b)=>a.localeCompare(b,'pt-PT'));
      setHTML(root,`<div class="market-browser-chip-grid" aria-label="Produtos de demonstração">${products.map(name=>`<button type="button" class="market-browser-chip" data-market-chip-query="${attr(name)}">${svgIcon('package',18)}<span>${esc(name)}</span></button>`).join('')}</div>`);
      return;
    }
    const categories=[...new Set(DEMO_PRODUCTS.map(p=>p.category))].sort((a,b)=>a.localeCompare(b,'pt-PT'));
    setHTML(root,`<div class="market-browser-chip-grid" aria-label="Categorias de demonstração">${categories.map(name=>`<button type="button" class="market-browser-chip" data-market-chip-query="${attr(name)}"><span>${esc(name)}</span></button>`).join('')}</div>`);
  }

  function comparisonHtml(product){
    return `<div class="market-comparison-row" aria-label="Comparação de preços de demonstração">${MARKET_DEFINITIONS.map(m=>{
      const value=Number(product.offers?.[m.id]||0);
      return `<div class="market-comparison-cell">${marketMark(m,'small')}<span>${esc(m.name)}</span><strong data-money>${value>0?money(value):'—'}</strong></div>`;
    }).join('')}</div>`;
  }

  function productCardHtml(product){
    const primary=marketById(product.primaryMarket);
    const primaryPrice=Number(product.offers?.[primary.id]||0);
    const choice=selectedOffer(product);
    return `<article class="market-catalog-card" data-market-product-card="${attr(product.id)}">
      <div class="market-catalog-main">
        <div class="market-art-shell">${cartonArt(product.primaryMarket)}</div>
        <div class="market-product-copy">
          <h4>${esc(product.name)}</h4>
          <p>${esc(product.pack)} · ${esc(primary.name)}</p>
          ${product.promotion?'<span class="market-promo-chip">Em promoção</span>':''}
          <strong class="market-product-price" data-money>${money(primaryPrice)}</strong>
          ${choice&&choice.market.id!==primary.id?`<small>Melhor valor selecionado: ${esc(choice.market.name)} · <span data-money>${money(choice.priceCents)}</span></small>`:''}
        </div>
        <button class="market-add-product" type="button" data-market-add-product="${attr(product.id)}" aria-label="Adicionar ${attr(product.name)} à lista">${svgIcon('plus',24)}</button>
      </div>
      ${comparisonHtml(product)}
    </article>`;
  }

  function renderResults(){
    const root=$('#marketCatalogResults');
    if(!root)return;
    const needle=normalized(query);
    const list=DEMO_PRODUCTS.filter(product=>{
      if(!needle)return true;
      return normalized([product.name,product.pack,product.category,marketById(product.primaryMarket).name].join(' ')).includes(needle);
    });
    if(!list.length){
      setHTML(root,`<div class="market-browser-empty"><span class="market-browser-empty-icon">${svgIcon('search',26)}</span><strong>Sem resultados de demonstração</strong><p>Não existe um produto de exemplo correspondente a “${esc(query)}”. Pode continuar a usar o formulário normal da aplicação.</p><button class="btn secondary" type="button" data-market-manual>Adicionar manualmente</button></div>`);
      return;
    }
    setHTML(root,list.map(productCardHtml).join(''));
  }

  function updateTabs(){
    $$('.market-browser-tab').forEach(button=>{
      const selected=button.dataset.marketBrowserTab===activeTab;
      button.classList.toggle('active',selected);
      button.setAttribute('aria-selected',String(selected));
    });
    updateTabPanel();
  }

  function openMarketBrowser(){
    selectedMarkets=new Set(MARKET_IDS);
    activeTab='markets';
    query='Leite meio gordo';
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
    renderResults();
    requestAnimationFrame(()=>$('#marketCatalogSearch')?.focus({preventScroll:true}));
  }

  async function addProduct(productId){
    const product=productById(productId);
    if(!product||!appState)return;
    const offer=selectedOffer(product);
    if(!offer){toast('Selecione pelo menos um mercado com preço disponível.');return;}
    const now=new Date().toISOString();
    const quantityMatch=/^(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|un)?/i.exec(product.pack||'');
    const quantity=quantityMatch?.[1]||'1';
    const detectedUnit=(quantityMatch?.[2]||product.unit||'un').toLowerCase();
    const unit=detectedUnit==='l'?'L':detectedUnit;
    appState.market.push({
      id:uid(),name:product.name,category:product.category,quantity,unit,
      estimatedCents:0,actualCents:0,purchased:false,
      createdAt:now,updatedAt:now,purchasedAt:null
    });
    await commit('created','market');
    closeDialog();
    showPage('market');
    toast(`${product.name} adicionado. Os preços de demonstração não foram guardados.`);
  }

  function restoreDialogHeader(){
    const dialog=$('#formDialog');
    if(!dialog)return;
    dialog.classList.remove('market-browser-dialog');
    const eyebrow=dialog.querySelector('.dialog-head .eyebrow');
    if(eyebrow)eyebrow.hidden=false;
    const close=dialog.querySelector('[data-close-dialog]');
    if(close){
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
      updateTabPanel();renderResults();return;
    }
    const tab=event.target.closest('[data-market-browser-tab]');
    if(tab){activeTab=tab.dataset.marketBrowserTab;updateTabs();return;}
    const clear=event.target.closest('[data-market-search-clear]');
    if(clear){query='';const input=$('#marketCatalogSearch');if(input)input.value='';renderResults();input?.focus();return;}
    const seeAll=event.target.closest('[data-market-see-all]');
    if(seeAll){query='';const input=$('#marketCatalogSearch');if(input)input.value='';renderResults();input?.focus();return;}
    const chip=event.target.closest('[data-market-chip-query]');
    if(chip){query=chip.dataset.marketChipQuery||'';const input=$('#marketCatalogSearch');if(input)input.value=query;renderResults();return;}
    const add=event.target.closest('[data-market-add-product]');
    if(add){addProduct(add.dataset.marketAddProduct);return;}
    const manual=event.target.closest('[data-market-manual]');
    if(manual){closeDialog();requestAnimationFrame(()=>openMarketForm());}
  }

  function handleBrowserInput(event){
    if(!event.target.matches?.('#formDialog[data-mode="market-browser"] #marketCatalogSearch'))return;
    query=event.target.value||'';
    renderResults();
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

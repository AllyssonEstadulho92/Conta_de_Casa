'use strict';

/*
 * Conta de Casa — catálogo visual progressivo do Mercado (75-catalog1)
 *
 * Objetivo:
 * - apresentar categorias úteis antes de existir uma pesquisa manual;
 * - acumular, de forma lenta e limitada, SKUs reais devolvidos por cesta.pt;
 * - reutilizar apenas fotografias oficiais validadas pela biblioteca existente;
 * - nunca escrever preços, quantidades, faturas ou estado financeiro.
 */
(function installMarketVisualCatalog(root){
  const REVISION='75-catalog1';
  const DB_NAME='conta-de-casa-market-visual-catalog';
  const DB_VERSION=1;
  const PRODUCT_STORE='products';
  const META_STORE='meta';
  const CESTA_MCP_URL='https://cesta.pt/mcp';
  const REQUEST_TIMEOUT_MS=12000;
  const BACKGROUND_QUERY_INTERVAL_MS=15000;
  const BACKGROUND_IMAGE_INTERVAL_MS=8000;
  const SESSION_QUERY_BUDGET=18;
  const DAILY_QUERY_BUDGET=48;
  const SESSION_IMAGE_BUDGET=20;
  const CATEGORY_RENDER_LIMIT=18;
  const STORE_IDS=Object.freeze({'pingo-doce':'pingodoce',continente:'continente'});
  const STORE_LABELS=Object.freeze({'pingo-doce':'Pingo Doce',continente:'Continente'});

  const CATEGORIES=Object.freeze([
    {id:'bebidas',label:'Bebidas',seeds:['água','refrigerante','sumo','chá frio','água com gás','néctar']},
    {id:'lacticinios-ovos',label:'Lacticínios e ovos',seeds:['leite','iogurte','queijo','ovos','manteiga','natas']},
    {id:'frutas-legumes',label:'Frutas e legumes',seeds:['banana','maçã','laranja','tomate','batata','cebola','alface']},
    {id:'carne-peixe',label:'Carne e peixe',seeds:['frango','peru','porco','carne de vaca','salmão','pescada','atum']},
    {id:'padaria',label:'Padaria e pastelaria',seeds:['pão','croissant','bolo','tostas','bolachas de água e sal']},
    {id:'mercearia',label:'Mercearia / Despensa',seeds:['arroz','massa','azeite','farinha','açúcar','feijão','cereais','café']},
    {id:'congelados',label:'Congelados',seeds:['pizza congelada','legumes congelados','gelado','peixe congelado','batata congelada']},
    {id:'snacks-doces',label:'Snacks e doces',seeds:['chocolate','bolachas','batatas fritas','snacks','gomas','barras']},
    {id:'higiene',label:'Higiene pessoal',seeds:['champô','gel de banho','dentífrico','desodorizante','sabonete','papel higiénico']},
    {id:'limpeza',label:'Limpeza',seeds:['detergente roupa','detergente loiça','lixívia','amaciador','limpa tudo','sacos do lixo']},
    {id:'bebe',label:'Bebé',seeds:['fraldas','toalhitas bebé','papas bebé','leite bebé','boião bebé']},
    {id:'animais',label:'Animais',seeds:['ração cão','ração gato','areia gato','snacks cão','snacks gato']}
  ]);

  const categoryById=id=>CATEGORIES.find(category=>category.id===id)||CATEGORIES[0];
  const clean=(value,max=180)=>String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
  const memoryProducts=new Map();
  const memoryMeta=new Map();
  const imageQueue=[];
  const imageQueued=new Set();
  const seedPlan=CATEGORIES.flatMap(category=>category.seeds.map(term=>({categoryId:category.id,term})));

  let dbPromise=null;
  let cestaReadyPromise=null;
  let mutationObserver=null;
  let activeCategory=CATEGORIES[0].id;
  let activeStore='all';
  let sessionQueries=0;
  let sessionImages=0;
  let backgroundTimer=0;
  let imageTimer=0;
  let mounting=false;
  let queryInFlight=false;

  function identity(value={}){
    const marketId=clean(value.marketId,24).toLowerCase();
    const pid=String(value.pid??'').replace(/\D/g,'').slice(0,32);
    if(!pid||!STORE_IDS[marketId])return null;
    return {marketId,pid,key:`${marketId}|${pid}`};
  }

  function safeProductUrl(value,marketId='',pid=''){
    const official=root.CDCOfficialMarketImages?.safeProductUrl;
    if(typeof official==='function')return official(value,marketId,pid);
    if(!value)return '';
    try{
      const url=new URL(String(value));
      if(url.protocol!=='https:')return '';
      const host=url.hostname.toLowerCase();
      const path=decodeURIComponent(url.pathname);
      const id=String(pid||'').replace(/\D/g,'');
      if(marketId==='continente'){
        if(!['continente.pt','www.continente.pt'].includes(host)||!path.startsWith('/produto/'))return '';
      }else if(marketId==='pingo-doce'){
        if(!['pingodoce.pt','www.pingodoce.pt'].includes(host)||!path.includes('/home/produtos/'))return '';
      }else return '';
      const found=path.match(/-(\d{4,32})\.html$/i)?.[1]||'';
      if(id&&found!==id)return '';
      return url.href.slice(0,900);
    }catch(_error){return '';}
  }

  function parseCatalogRecords(text,categoryId=''){
    const category=categoryById(categoryId).id;
    const lines=String(text||'').split('\n');
    const records=[];
    for(let index=0;index<lines.length;index+=1){
      const line=lines[index].trim();
      const match=/^-\s*(Pingo Doce|Continente)\s*·\s*(.*?)\s*·\s*(.*?)\s*·.*?\bpid\s+(\d{4,32})\s*$/i.exec(line);
      if(!match)continue;
      const marketId=/continente/i.test(match[1])?'continente':'pingo-doce';
      const pid=match[4];
      const sourceUrl=safeProductUrl(clean(lines[index+1]||'',900),marketId,pid);
      if(!sourceUrl)continue;
      records.push({
        key:`${marketId}|${pid}`,marketId,pid,
        name:clean(match[2],140),pack:clean(match[3],100),
        categories:[category],sourceUrl,lastSeenAt:Date.now()
      });
      index+=1;
    }
    return records.filter(record=>record.name);
  }

  function openDb(){
    if(dbPromise)return dbPromise;
    if(!root.indexedDB)return Promise.resolve(null);
    dbPromise=new Promise(resolve=>{
      let request;
      try{request=root.indexedDB.open(DB_NAME,DB_VERSION);}catch(_error){resolve(null);return;}
      request.onupgradeneeded=()=>{
        const db=request.result;
        if(!db.objectStoreNames.contains(PRODUCT_STORE)){
          const products=db.createObjectStore(PRODUCT_STORE,{keyPath:'key'});
          products.createIndex('categories','categories',{unique:false,multiEntry:true});
          products.createIndex('marketId','marketId',{unique:false});
          products.createIndex('lastSeenAt','lastSeenAt',{unique:false});
        }
        if(!db.objectStoreNames.contains(META_STORE))db.createObjectStore(META_STORE,{keyPath:'key'});
      };
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>resolve(null);
      request.onblocked=()=>resolve(null);
    });
    return dbPromise;
  }

  async function idbGet(storeName,key){
    const db=await openDb();if(!db)return null;
    return new Promise(resolve=>{
      let tx;try{tx=db.transaction(storeName,'readonly');}catch(_error){resolve(null);return;}
      const request=tx.objectStore(storeName).get(key);
      request.onsuccess=()=>resolve(request.result||null);
      request.onerror=()=>resolve(null);
    });
  }

  async function idbPut(storeName,value){
    const db=await openDb();if(!db)return false;
    return new Promise(resolve=>{
      let tx;try{tx=db.transaction(storeName,'readwrite');}catch(_error){resolve(false);return;}
      tx.objectStore(storeName).put(value);
      tx.oncomplete=()=>resolve(true);
      tx.onerror=()=>resolve(false);
      tx.onabort=()=>resolve(false);
    });
  }

  async function getMeta(key){
    if(memoryMeta.has(key))return memoryMeta.get(key);
    const stored=await idbGet(META_STORE,key);
    if(stored)memoryMeta.set(key,stored);
    return stored||null;
  }

  async function putMeta(value){
    if(!value?.key)return false;
    memoryMeta.set(value.key,value);
    await idbPut(META_STORE,value);
    return true;
  }

  async function getProduct(key){
    if(memoryProducts.has(key))return memoryProducts.get(key);
    const stored=await idbGet(PRODUCT_STORE,key);
    if(stored)memoryProducts.set(key,stored);
    return stored||null;
  }

  async function putProduct(value){
    const id=identity(value);if(!id)return null;
    const previous=await getProduct(id.key);
    const categories=[...new Set([...(Array.isArray(previous?.categories)?previous.categories:[]),...(Array.isArray(value.categories)?value.categories:[])])]
      .filter(categoryId=>CATEGORIES.some(category=>category.id===categoryId));
    const record={
      key:id.key,marketId:id.marketId,pid:id.pid,
      name:clean(value.name||previous?.name,140),
      pack:clean(value.pack||previous?.pack,100),
      categories,
      sourceUrl:safeProductUrl(value.sourceUrl||previous?.sourceUrl,id.marketId,id.pid),
      firstSeenAt:Number(previous?.firstSeenAt)||Date.now(),
      lastSeenAt:Date.now()
    };
    if(!record.name||!record.sourceUrl)return null;
    memoryProducts.set(id.key,record);
    await idbPut(PRODUCT_STORE,record);
    return record;
  }

  async function ingest(records=[]){
    const stored=[];
    for(const record of records){
      const saved=await putProduct(record);
      if(saved)stored.push(saved);
    }
    return stored;
  }

  async function listCategory(categoryId,marketId='all',limit=CATEGORY_RENDER_LIMIT){
    const category=categoryById(categoryId).id;
    const max=Math.max(1,Math.min(Number(limit)||CATEGORY_RENDER_LIMIT,120));
    const db=await openDb();
    let records=[];
    if(db){
      records=await new Promise(resolve=>{
        let tx;try{tx=db.transaction(PRODUCT_STORE,'readonly');}catch(_error){resolve([]);return;}
        const request=tx.objectStore(PRODUCT_STORE).index('categories').getAll(category,160);
        request.onsuccess=()=>resolve(Array.isArray(request.result)?request.result:[]);
        request.onerror=()=>resolve([]);
      });
    }else{
      records=[...memoryProducts.values()].filter(record=>record.categories?.includes(category));
    }
    if(marketId!=='all')records=records.filter(record=>record.marketId===marketId);
    records.sort((a,b)=>Number(b.lastSeenAt)-Number(a.lastSeenAt)||a.name.localeCompare(b.name,'pt-PT'));
    return records.slice(0,max);
  }

  async function stats(){
    const db=await openDb();
    let count=memoryProducts.size;
    if(db){
      count=await new Promise(resolve=>{
        let tx;try{tx=db.transaction(PRODUCT_STORE,'readonly');}catch(_error){resolve(memoryProducts.size);return;}
        const request=tx.objectStore(PRODUCT_STORE).count();
        request.onsuccess=()=>resolve(Number(request.result)||0);
        request.onerror=()=>resolve(memoryProducts.size);
      });
    }
    let images=0;
    try{images=Number((await root.CDCMarketImageLibrary?.stats?.())?.count)||0;}catch(_error){}
    return {revision:REVISION,count,images,persistent:Boolean(db)};
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

  async function timedFetch(url,options={}){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
    try{
      return await fetch(url,{...options,signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
    }finally{clearTimeout(timer);}
  }

  async function cestaRpc(payload){
    const response=await timedFetch(CESTA_MCP_URL,{
      method:'POST',
      headers:{Accept:'application/json, text/event-stream','Content-Type':'application/json','MCP-Protocol-Version':'2025-06-18'},
      body:JSON.stringify(payload)
    });
    if(!response.ok)throw new Error(`visual-catalog-cesta-${response.status}`);
    const event=parseSse(await response.text())[0]||null;
    if(event?.error)throw new Error('visual-catalog-cesta-rpc');
    return event;
  }

  function ensureCestaReady(){
    if(cestaReadyPromise)return cestaReadyPromise;
    cestaReadyPromise=(async()=>{
      await cestaRpc({jsonrpc:'2.0',id:7501,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'Conta de Casa visual catalog',version:'75-catalog1'}}});
      await cestaRpc({jsonrpc:'2.0',method:'notifications/initialized'}).catch(()=>null);
      return true;
    })().catch(error=>{cestaReadyPromise=null;throw error;});
    return cestaReadyPromise;
  }

  async function searchSeed(term,categoryId){
    const query=clean(term,100);if(query.length<2)return [];
    await ensureCestaReady();
    const event=await cestaRpc({
      jsonrpc:'2.0',id:7502,method:'tools/call',
      params:{name:'search_products',arguments:{query,stores:['pingodoce','continente'],limit:20}}
    });
    const text=event?.result?.content?.find(item=>item?.type==='text')?.text||'';
    return parseCatalogRecords(text,categoryId);
  }

  function dayKey(){return new Date().toISOString().slice(0,10);}

  async function schedulerState(){
    const previous=await getMeta('scheduler');
    if(previous?.day===dayKey())return previous;
    return {key:'scheduler',day:dayKey(),queriesToday:0,cursor:Number(previous?.cursor)||0,lastQueryAt:0};
  }

  function backgroundAllowed(){
    if(typeof navigator!=='undefined'){
      if(navigator.onLine===false)return false;
      if(navigator.connection?.saveData)return false;
    }
    if(typeof document!=='undefined'&&document.visibilityState==='hidden')return false;
    return true;
  }

  async function runSeed(entry,{interactive=false}={}){
    if(!entry||queryInFlight||sessionQueries>=SESSION_QUERY_BUDGET)return [];
    const state=await schedulerState();
    if(Number(state.queriesToday)>=DAILY_QUERY_BUDGET)return [];
    if(!interactive&&Date.now()-Number(state.lastQueryAt||0)<BACKGROUND_QUERY_INTERVAL_MS)return [];
    queryInFlight=true;
    try{
      const records=await searchSeed(entry.term,entry.categoryId);
      sessionQueries+=1;
      state.queriesToday=Number(state.queriesToday||0)+1;
      state.lastQueryAt=Date.now();
      await putMeta(state);
      const stored=await ingest(records);
      enqueueImages(stored.slice(0,6));
      return stored;
    }finally{queryInFlight=false;}
  }

  async function refreshCategory(categoryId=activeCategory,{seeds=2}={}){
    const category=categoryById(categoryId);
    const amount=Math.max(1,Math.min(Number(seeds)||2,category.seeds.length));
    for(let index=0;index<amount;index+=1){
      if(sessionQueries>=SESSION_QUERY_BUDGET)break;
      try{await runSeed({categoryId:category.id,term:category.seeds[index]},{interactive:true});}catch(_error){}
    }
    await renderProducts();
    await renderStats();
    return listCategory(category.id,activeStore);
  }

  function enqueueImages(records=[]){
    for(const record of records){
      const id=identity(record);if(!id||imageQueued.has(id.key))continue;
      imageQueued.add(id.key);imageQueue.push(record);
    }
    scheduleImageWarm(1200);
  }

  async function warmOneImage(record){
    if(sessionImages>=SESSION_IMAGE_BUDGET)return null;
    const library=root.CDCMarketImageLibrary;
    const official=root.CDCOfficialMarketImages;
    if(!library?.get||!library?.remember||!official?.resolve)return null;
    const cached=await library.get(record).catch(()=>null);
    if(cached)return cached;
    const result=await official.resolve({
      marketId:record.marketId,pid:record.pid,name:record.name,pack:record.pack,sourceUrl:record.sourceUrl
    }).catch(()=>null);
    sessionImages+=1;
    if(!result?.imageUrl)return null;
    return library.remember({...result,pack:record.pack},record).catch(()=>null);
  }

  function scheduleImageWarm(delay=BACKGROUND_IMAGE_INTERVAL_MS){
    if(imageTimer||!imageQueue.length||sessionImages>=SESSION_IMAGE_BUDGET)return;
    imageTimer=setTimeout(async()=>{
      imageTimer=0;
      if(!backgroundAllowed()){scheduleImageWarm(BACKGROUND_IMAGE_INTERVAL_MS);return;}
      const record=imageQueue.shift();
      if(record){imageQueued.delete(record.key);await warmOneImage(record);}
      await renderProducts();
      await renderStats();
      scheduleImageWarm(BACKGROUND_IMAGE_INTERVAL_MS);
    },Math.max(500,delay));
  }

  async function backgroundStep(){
    backgroundTimer=0;
    if(sessionQueries>=SESSION_QUERY_BUDGET)return;
    if(!backgroundAllowed()){scheduleBackground(30000);return;}
    const state=await schedulerState();
    if(Number(state.queriesToday)>=DAILY_QUERY_BUDGET)return;
    const cursor=Math.abs(Number(state.cursor)||0)%seedPlan.length;
    const entry=seedPlan[cursor];
    state.cursor=(cursor+1)%seedPlan.length;
    await putMeta(state);
    try{
      const stored=await runSeed(entry,{interactive:false});
      if(stored.length&&entry.categoryId===activeCategory){await renderProducts();await renderStats();}
    }catch(_error){}
    scheduleBackground(BACKGROUND_QUERY_INTERVAL_MS);
  }

  function scheduleBackground(delay=2500){
    if(backgroundTimer||sessionQueries>=SESSION_QUERY_BUDGET)return;
    backgroundTimer=setTimeout(()=>{
      if(typeof root.requestIdleCallback==='function')root.requestIdleCallback(()=>{void backgroundStep();},{timeout:4000});
      else void backgroundStep();
    },Math.max(1000,delay));
  }

  function el(tag,className='',text=''){
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text)node.textContent=text;
    return node;
  }

  function imageFallback(card,category){
    const fallback=el('span','market-visual-catalog-fallback');
    fallback.setAttribute('aria-hidden','true');
    const mark=el('span','market-visual-catalog-fallback-mark',category.label.slice(0,1));
    fallback.append(mark);
    card.append(fallback);
  }

  async function productCard(record,category){
    const button=el('button','market-visual-product-card');
    button.type='button';
    button.dataset.visualCatalogProduct=record.key;
    button.setAttribute('aria-label',`Pesquisar preço atual de ${record.name}`);

    const media=el('span','market-visual-product-media');
    let cached=null;
    try{cached=await root.CDCMarketImageLibrary?.get?.(record);}catch(_error){}
    if(cached?.imageUrl){
      const image=document.createElement('img');
      image.src=cached.imageUrl;image.alt='';image.loading='lazy';image.decoding='async';image.referrerPolicy='no-referrer';
      image.addEventListener('error',()=>{media.replaceChildren();imageFallback(media,category);},{once:true});
      media.append(image);
    }else imageFallback(media,category);

    const copy=el('span','market-visual-product-copy');
    copy.append(el('span','market-visual-product-store',STORE_LABELS[record.marketId]||record.marketId));
    copy.append(el('strong','market-visual-product-name',record.name));
    if(record.pack)copy.append(el('small','market-visual-product-pack',record.pack));
    copy.append(el('span','market-visual-product-action','Ver preço atual'));
    button.append(media,copy);
    return button;
  }

  async function renderProducts(){
    if(typeof document==='undefined')return;
    const grid=document.querySelector('#marketVisualCatalogGrid');if(!grid)return;
    const category=categoryById(activeCategory);
    const records=await listCategory(category.id,activeStore,CATEGORY_RENDER_LIMIT);
    grid.replaceChildren();
    if(!records.length){
      const empty=el('div','market-visual-catalog-empty');
      empty.append(el('strong','',`A preparar ${category.label}`));
      empty.append(el('span','','Os produtos reais desta categoria serão adicionados progressivamente.'));
      grid.append(empty);
      return;
    }
    const fragment=document.createDocumentFragment();
    for(const record of records)fragment.append(await productCard(record,category));
    grid.append(fragment);
    enqueueImages(records.filter(record=>!imageQueued.has(record.key)).slice(0,4));
  }

  async function renderStats(){
    if(typeof document==='undefined')return;
    const target=document.querySelector('#marketVisualCatalogStats');if(!target)return;
    const data=await stats();
    target.textContent=`${data.count} produtos indexados · ${data.images} imagens validadas`;
  }

  function updateSelection(){
    document.querySelectorAll('[data-visual-catalog-category]').forEach(button=>{
      const selected=button.dataset.visualCatalogCategory===activeCategory;
      button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));
    });
    document.querySelectorAll('[data-visual-catalog-store]').forEach(button=>{
      const selected=button.dataset.visualCatalogStore===activeStore;
      button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));
    });
  }

  function activateLiveSearch(record){
    const input=document.querySelector('#marketCatalogSearch');if(!input)return;
    input.value=record.name;
    input.dispatchEvent(new Event('input',{bubbles:true}));
    input.focus({preventScroll:true});
    setTimeout(()=>document.querySelector('#marketCatalogResults')?.scrollIntoView?.({behavior:'smooth',block:'start'}),650);
  }

  function buildSection(browser){
    const section=el('section','market-visual-catalog');section.id='marketVisualCatalog';
    const head=el('div','market-visual-catalog-head');
    const copy=el('div','market-visual-catalog-heading');
    copy.append(el('span','market-visual-catalog-eyebrow','Catálogo visual'));
    const title=el('h3','market-visual-catalog-title','Produtos por categoria');title.id='marketVisualCatalogTitle';copy.append(title);
    copy.append(el('p','market-visual-catalog-subtitle','SKUs reais do Continente e Pingo Doce. Toque num produto para consultar o preço atual.'));
    const refresh=el('button','market-visual-catalog-refresh','Atualizar');refresh.type='button';refresh.dataset.visualCatalogRefresh='1';
    head.append(copy,refresh);

    const categories=el('div','market-visual-category-strip');categories.setAttribute('aria-label','Categorias do catálogo visual');
    for(const category of CATEGORIES){
      const button=el('button','market-visual-category',category.label);button.type='button';button.dataset.visualCatalogCategory=category.id;button.setAttribute('aria-pressed','false');categories.append(button);
    }

    const controls=el('div','market-visual-catalog-controls');
    const stores=el('div','market-visual-store-filter');stores.setAttribute('aria-label','Filtrar catálogo por mercado');
    for(const [id,label] of [['all','Todos'],['continente','Continente'],['pingo-doce','Pingo Doce']]){
      const button=el('button','market-visual-store',label);button.type='button';button.dataset.visualCatalogStore=id;button.setAttribute('aria-pressed','false');stores.append(button);
    }
    const statsNode=el('span','market-visual-catalog-stats','A preparar catálogo…');statsNode.id='marketVisualCatalogStats';
    controls.append(stores,statsNode);
    const grid=el('div','market-visual-catalog-grid');grid.id='marketVisualCatalogGrid';grid.setAttribute('aria-live','polite');
    section.append(head,categories,controls,grid);
    section.setAttribute('aria-labelledby','marketVisualCatalogTitle');

    const before=browser.querySelector('.market-browser-results-head');
    if(before)browser.insertBefore(section,before);else browser.append(section);
    updateSelection();
    return section;
  }

  async function mount(){
    if(typeof document==='undefined'||mounting)return;
    const browser=document.querySelector('.market-browser');if(!browser||browser.querySelector('#marketVisualCatalog'))return;
    mounting=true;
    try{
      buildSection(browser);
      updateSelection();
      await renderProducts();
      await renderStats();
      const current=await listCategory(activeCategory,activeStore,4);
      if(current.length<4)void refreshCategory(activeCategory,{seeds:2});
      scheduleBackground(3000);
    }finally{mounting=false;}
  }

  function onClick(event){
    const categoryButton=event.target.closest?.('[data-visual-catalog-category]');
    if(categoryButton){activeCategory=categoryById(categoryButton.dataset.visualCatalogCategory).id;updateSelection();void renderProducts();void refreshCategory(activeCategory,{seeds:1});return;}
    const storeButton=event.target.closest?.('[data-visual-catalog-store]');
    if(storeButton){activeStore=['all','continente','pingo-doce'].includes(storeButton.dataset.visualCatalogStore)?storeButton.dataset.visualCatalogStore:'all';updateSelection();void renderProducts();return;}
    if(event.target.closest?.('[data-visual-catalog-refresh]')){void refreshCategory(activeCategory,{seeds:3});return;}
    const productButton=event.target.closest?.('[data-visual-catalog-product]');
    if(productButton){void getProduct(productButton.dataset.visualCatalogProduct).then(record=>{if(record)activateLiveSearch(record);});}
  }

  function install(){
    document.addEventListener('click',onClick);
    void mount();
    if(document.body&&!mutationObserver){
      mutationObserver=new MutationObserver(mutations=>{
        if(document.querySelector('.market-browser #marketVisualCatalog'))return;
        if(mutations.some(mutation=>mutation.type==='childList'&&mutation.addedNodes.length)&&document.querySelector('.market-browser'))void mount();
      });
      mutationObserver.observe(document.body,{subtree:true,childList:true});
    }
    scheduleBackground(3500);
  }

  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  }

  root.CDCMarketVisualCatalog=Object.freeze({
    revision:REVISION,categories:CATEGORIES,identity,parseCatalogRecords,listCategory,stats,
    refreshCategory,warmNow:()=>backgroundStep()
  });
})(globalThis);

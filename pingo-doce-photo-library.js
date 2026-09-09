'use strict';

/*
 * Conta de Casa — biblioteca progressiva de fotografias oficiais Pingo Doce (75-pd-photo1)
 *
 * Objetivos:
 * - descobrir SKUs reais Pingo Doce através da fonte de pesquisa já usada pelo Mercado;
 * - guardar apenas inventário técnico do SKU e alimentar a biblioteca oficial marketId|pid;
 * - resolver fotografias apenas pela página oficial exata do produto;
 * - crescer progressivamente para centenas/milhares de SKUs sem copiar binários para o GitHub;
 * - não ler/escrever preços, quantidades, faturas, cofre ou estado financeiro.
 */
(function installPingoDocePhotoLibrary(root){
  const REVISION='75-pd-photo1';
  const DB_NAME='conta-de-casa-pingo-doce-photo-library';
  const DB_VERSION=1;
  const PRODUCT_STORE='products';
  const META_STORE='meta';
  const MARKET_ID='pingo-doce';
  const STORE_ID='pingodoce';
  const CESTA_MCP_URL='https://cesta.pt/mcp';
  const REQUEST_TIMEOUT_MS=12000;
  const BACKGROUND_QUERY_INTERVAL_MS=20000;
  const BACKGROUND_IMAGE_INTERVAL_MS=7000;
  const SESSION_QUERY_BUDGET=24;
  const DAILY_QUERY_BUDGET=72;
  const SESSION_IMAGE_BUDGET=30;
  const DAILY_IMAGE_BUDGET=120;
  const PENDING_QUEUE_LIMIT=120;

  const CATEGORIES=Object.freeze([
    {id:'bebidas',label:'Bebidas',terms:['água','água com gás','refrigerante','cola','sumo','néctar','chá frio','bebida energética','cerveja sem álcool','tónica','bebida vegetal','café solúvel','café cápsulas','chá','achocolatado']},
    {id:'lacticinios-ovos',label:'Lacticínios e ovos',terms:['leite','leite sem lactose','iogurte','iogurte grego','queijo','queijo fatiado','queijo fresco','manteiga','margarina','natas','ovos','sobremesa láctea','kefir']},
    {id:'fruta-legumes',label:'Fruta e legumes',terms:['banana','maçã','pera','laranja','tangerina','limão','uva','morangos','abacate','tomate','batata','cebola','alho','cenoura','courgette','brócolos','couve','alface','cogumelos','ervas aromáticas']},
    {id:'carne-charcutaria',label:'Carne e charcutaria',terms:['frango','peru','porco','carne de vaca','hambúrguer carne','carne picada','salsichas frescas','bife','entrecosto','presunto','fiambre','chouriço','salame','mortadela','bacon']},
    {id:'peixe-marisco',label:'Peixe e marisco',terms:['salmão','pescada','atum fresco','bacalhau','dourada','robalo','camarão','marisco','polvo','lulas','filetes peixe','peixe congelado']},
    {id:'padaria-pastelaria',label:'Padaria e pastelaria',terms:['pão','pão de forma','pão integral','broa','baguete','croissant','bolo','pastelaria','tostas','bolachas água e sal','wraps','tortilhas']},
    {id:'mercearia',label:'Mercearia',terms:['arroz','massa','esparguete','azeite','óleo','vinagre','farinha','açúcar','sal','feijão','grão','lentilhas','tomate pelado','molho tomate','maionese','ketchup','mostarda','cereais','muesli','aveia','mel','compota','conservas','atum lata','sardinha lata','azeitonas','pickles','caldo culinário','especiarias']},
    {id:'congelados',label:'Congelados',terms:['pizza congelada','legumes congelados','batatas congeladas','gelado','hambúrguer congelado','peixe congelado','marisco congelado','refeição congelada','pão congelado','fruta congelada']},
    {id:'snacks-doces',label:'Snacks e doces',terms:['chocolate','bombons','bolachas','wafer','batatas fritas','snacks milho','frutos secos','pipocas','gomas','rebuçados','barras cereais','sobremesa','gelatina','pudim']},
    {id:'refeicoes',label:'Refeições e cozinha rápida',terms:['sopa','salada pronta','massa fresca','lasanha','pizza fresca','sanduíche','refeição pronta','molho fresco','húmus','guacamole']},
    {id:'higiene',label:'Higiene pessoal',terms:['champô','amaciador cabelo','gel banho','sabonete','dentífrico','escova dentes','desodorizante','papel higiénico','pensos higiénicos','tampões','lâminas barbear','espuma barbear','creme corpo','creme mãos','toalhitas']},
    {id:'limpeza',label:'Limpeza da casa',terms:['detergente roupa','cápsulas roupa','amaciador roupa','detergente loiça','pastilhas máquina loiça','lixívia','desinfetante','limpa tudo','limpa vidros','papel cozinha','guardanapos','sacos lixo','esponjas','panos limpeza','ambientador']},
    {id:'bebe',label:'Bebé',terms:['fraldas','toalhitas bebé','papas bebé','leite bebé','boião bebé','snacks bebé','champô bebé','gel banho bebé','creme muda fralda']},
    {id:'animais',label:'Animais',terms:['ração cão','ração gato','comida húmida cão','comida húmida gato','snacks cão','snacks gato','areia gato','higiene animal']},
    {id:'casa',label:'Casa e utilidades',terms:['película aderente','folha alumínio','papel vegetal','sacos congelação','pilhas','lâmpadas','velas','descartáveis','recipientes comida']}
  ]);

  const clean=(value,max=180)=>String(value??'')
    .replace(/[\u0000-\u001f\u007f]/g,' ')
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,max);
  const categoryById=id=>CATEGORIES.find(category=>category.id===id)||CATEGORIES[0];
  const seedPlan=Object.freeze(CATEGORIES.flatMap(category=>category.terms.map(term=>({categoryId:category.id,term}))));
  const memoryProducts=new Map();
  const memoryMeta=new Map();
  const imageQueue=[];
  const imageQueued=new Set();

  let dbPromise=null;
  let cestaReadyPromise=null;
  let sessionQueries=0;
  let sessionImages=0;
  let queryInFlight=false;
  let imageInFlight=false;
  let backgroundTimer=0;
  let imageTimer=0;
  let observer=null;
  let uiQueued=false;

  function identity(value={}){
    const pid=String(value.pid??'').replace(/\D/g,'').slice(0,32);
    if(!pid)return null;
    return {marketId:MARKET_ID,pid,key:`${MARKET_ID}|${pid}`};
  }

  function safeProductUrl(value,pid=''){
    if(!value)return '';
    try{
      const url=new URL(String(value));
      if(url.protocol!=='https:')return '';
      const host=url.hostname.toLowerCase();
      const path=decodeURIComponent(url.pathname);
      if(!['pingodoce.pt','www.pingodoce.pt'].includes(host)||!path.includes('/home/produtos/'))return '';
      const found=path.match(/-(\d{4,32})\.html$/i)?.[1]||'';
      const id=String(pid||'').replace(/\D/g,'');
      if(!found||(id&&found!==id))return '';
      return url.href.slice(0,900);
    }catch(_error){return '';}
  }

  function parseSearchRecords(text,categoryId=''){
    const category=categoryById(categoryId).id;
    const lines=String(text||'').split('\n');
    const records=[];
    for(let index=0;index<lines.length;index+=1){
      const line=lines[index].trim();
      const match=/^-\s*Pingo Doce\s*·\s*(.*?)\s*·\s*(.*?)\s*·.*?\bpid\s+(\d{4,32})\s*$/i.exec(line);
      if(!match)continue;
      const pid=match[3];
      const sourceUrl=safeProductUrl(clean(lines[index+1]||'',900),pid);
      if(!sourceUrl)continue;
      records.push({
        key:`${MARKET_ID}|${pid}`,marketId:MARKET_ID,pid,
        name:clean(match[1],140),pack:clean(match[2],100),
        categoryId:category,sourceUrl,imageState:'pending',
        firstSeenAt:Date.now(),lastSeenAt:Date.now()
      });
      index+=1;
    }
    return records.filter(record=>record.name&&record.sourceUrl);
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
          const store=db.createObjectStore(PRODUCT_STORE,{keyPath:'key'});
          store.createIndex('categoryId','categoryId',{unique:false});
          store.createIndex('imageState','imageState',{unique:false});
          store.createIndex('lastSeenAt','lastSeenAt',{unique:false});
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

  async function putProduct(value={}){
    const id=identity(value);if(!id)return null;
    const previous=await getProduct(id.key);
    const record={
      key:id.key,marketId:MARKET_ID,pid:id.pid,
      name:clean(value.name||previous?.name,140),
      pack:clean(value.pack||previous?.pack,100),
      categoryId:categoryById(value.categoryId||previous?.categoryId).id,
      sourceUrl:safeProductUrl(value.sourceUrl||previous?.sourceUrl,id.pid),
      imageState:['ready','pending','missing'].includes(value.imageState)?value.imageState:(previous?.imageState||'pending'),
      firstSeenAt:Number(previous?.firstSeenAt)||Number(value.firstSeenAt)||Date.now(),
      lastSeenAt:Date.now(),
      imageCheckedAt:Number(value.imageCheckedAt)||Number(previous?.imageCheckedAt)||0
    };
    if(!record.name||!record.sourceUrl)return null;
    memoryProducts.set(record.key,record);
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
    if(!response.ok)throw new Error(`pd-photo-cesta-${response.status}`);
    const event=parseSse(await response.text())[0]||null;
    if(event?.error)throw new Error('pd-photo-cesta-rpc');
    return event;
  }

  function ensureCestaReady(){
    if(cestaReadyPromise)return cestaReadyPromise;
    cestaReadyPromise=(async()=>{
      await cestaRpc({jsonrpc:'2.0',id:7511,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'Conta de Casa Pingo Doce photo library',version:REVISION}}});
      await cestaRpc({jsonrpc:'2.0',method:'notifications/initialized'}).catch(()=>null);
      return true;
    })().catch(error=>{cestaReadyPromise=null;throw error;});
    return cestaReadyPromise;
  }

  async function searchSeed(entry){
    const term=clean(entry?.term,100);if(term.length<2)return [];
    await ensureCestaReady();
    const event=await cestaRpc({
      jsonrpc:'2.0',id:7512,method:'tools/call',
      params:{name:'search_products',arguments:{query:term,stores:[STORE_ID],limit:20}}
    });
    const text=event?.result?.content?.find(item=>item?.type==='text')?.text||'';
    return parseSearchRecords(text,entry.categoryId);
  }

  function dayKey(){return new Date().toISOString().slice(0,10);}

  async function schedulerState(){
    const previous=await getMeta('scheduler');
    if(previous?.day===dayKey())return previous;
    return {
      key:'scheduler',day:dayKey(),queriesToday:0,imagesToday:0,
      cursor:Number(previous?.cursor)||0,lastQueryAt:0,lastImageAt:0
    };
  }

  function backgroundAllowed(){
    if(typeof navigator!=='undefined'){
      if(navigator.onLine===false)return false;
      if(navigator.connection?.saveData)return false;
    }
    if(typeof document!=='undefined'&&document.visibilityState==='hidden')return false;
    return true;
  }

  async function nextSeed(){
    const state=await schedulerState();
    const cursor=Math.abs(Number(state.cursor)||0)%seedPlan.length;
    state.cursor=(cursor+1)%seedPlan.length;
    await putMeta(state);
    return seedPlan[cursor];
  }

  async function runSeed(entry,{interactive=false}={}){
    if(!entry||queryInFlight||sessionQueries>=SESSION_QUERY_BUDGET)return [];
    const state=await schedulerState();
    if(Number(state.queriesToday)>=DAILY_QUERY_BUDGET)return [];
    if(!interactive&&Date.now()-Number(state.lastQueryAt||0)<BACKGROUND_QUERY_INTERVAL_MS)return [];
    queryInFlight=true;
    try{
      const records=await searchSeed(entry);
      sessionQueries+=1;
      state.queriesToday=Number(state.queriesToday||0)+1;
      state.lastQueryAt=Date.now();
      await putMeta(state);
      const stored=await ingest(records);
      enqueueImages(stored);
      scheduleUi();
      return stored;
    }finally{queryInFlight=false;}
  }

  function enqueueImages(records=[]){
    for(const record of records){
      const id=identity(record);if(!id||record.imageState==='ready'||imageQueued.has(id.key))continue;
      imageQueued.add(id.key);
      imageQueue.push(record);
    }
    scheduleImageWarm(1000);
  }

  async function markImageState(record,state){
    return putProduct({...record,imageState:state,imageCheckedAt:Date.now()});
  }

  async function warmOneImage(record){
    if(imageInFlight||sessionImages>=SESSION_IMAGE_BUDGET)return null;
    const scheduler=await schedulerState();
    if(Number(scheduler.imagesToday)>=DAILY_IMAGE_BUDGET)return null;
    const library=root.CDCMarketImageLibrary;
    const official=root.CDCOfficialMarketImages;
    if(!library?.get||!library?.remember||!official?.resolve)return null;
    imageInFlight=true;
    try{
      const cached=await library.get(record).catch(()=>null);
      if(cached){await markImageState(record,'ready');return cached;}
      const result=await official.resolve({
        marketId:MARKET_ID,pid:record.pid,name:record.name,pack:record.pack,sourceUrl:record.sourceUrl
      }).catch(()=>null);
      sessionImages+=1;
      scheduler.imagesToday=Number(scheduler.imagesToday||0)+1;
      scheduler.lastImageAt=Date.now();
      await putMeta(scheduler);
      if(!result?.imageUrl){await markImageState(record,'missing');return null;}
      const stored=await library.remember({...result,marketId:MARKET_ID,pid:record.pid,name:record.name,pack:record.pack},record).catch(()=>null);
      await markImageState(record,stored?'ready':'missing');
      return stored;
    }finally{imageInFlight=false;}
  }

  function scheduleImageWarm(delay=BACKGROUND_IMAGE_INTERVAL_MS){
    if(imageTimer||!imageQueue.length||sessionImages>=SESSION_IMAGE_BUDGET)return;
    imageTimer=setTimeout(async()=>{
      imageTimer=0;
      if(!backgroundAllowed()){scheduleImageWarm(BACKGROUND_IMAGE_INTERVAL_MS);return;}
      const record=imageQueue.shift();
      if(record){imageQueued.delete(record.key);await warmOneImage(record);}
      scheduleUi();
      scheduleImageWarm(BACKGROUND_IMAGE_INTERVAL_MS);
    },Math.max(800,delay));
  }

  async function listPending(limit=PENDING_QUEUE_LIMIT){
    const max=Math.max(1,Math.min(Number(limit)||PENDING_QUEUE_LIMIT,300));
    const db=await openDb();
    if(!db)return [...memoryProducts.values()].filter(record=>record.imageState!=='ready').slice(0,max);
    return new Promise(resolve=>{
      let tx;try{tx=db.transaction(PRODUCT_STORE,'readonly');}catch(_error){resolve([]);return;}
      const request=tx.objectStore(PRODUCT_STORE).getAll();
      request.onsuccess=()=>resolve((Array.isArray(request.result)?request.result:[])
        .filter(record=>record.imageState!=='ready')
        .sort((a,b)=>Number(a.imageCheckedAt||0)-Number(b.imageCheckedAt||0))
        .slice(0,max));
      request.onerror=()=>resolve([]);
    });
  }

  async function primeQueue(){
    enqueueImages(await listPending());
  }

  async function stats(){
    const db=await openDb();
    if(!db){
      const records=[...memoryProducts.values()];
      return {revision:REVISION,products:records.length,photos:records.filter(record=>record.imageState==='ready').length,persistent:false};
    }
    return new Promise(resolve=>{
      let tx;try{tx=db.transaction(PRODUCT_STORE,'readonly');}catch(_error){resolve({revision:REVISION,products:memoryProducts.size,photos:0,persistent:false});return;}
      const store=tx.objectStore(PRODUCT_STORE);
      const total=store.count();
      const photos=store.index('imageState').count('ready');
      let totalValue=0,photoValue=0,done=0;
      const finish=()=>{done+=1;if(done===2)resolve({revision:REVISION,products:totalValue,photos:photoValue,persistent:true});};
      total.onsuccess=()=>{totalValue=Number(total.result)||0;finish();};
      total.onerror=finish;
      photos.onsuccess=()=>{photoValue=Number(photos.result)||0;finish();};
      photos.onerror=finish;
    });
  }

  async function backgroundStep(){
    backgroundTimer=0;
    if(sessionQueries>=SESSION_QUERY_BUDGET)return;
    if(!backgroundAllowed()){scheduleBackground(30000);return;}
    const state=await schedulerState();
    if(Number(state.queriesToday)>=DAILY_QUERY_BUDGET)return;
    try{await runSeed(await nextSeed(),{interactive:false});}catch(_error){}
    scheduleBackground(BACKGROUND_QUERY_INTERVAL_MS);
  }

  function scheduleBackground(delay=3500){
    if(backgroundTimer||sessionQueries>=SESSION_QUERY_BUDGET)return;
    backgroundTimer=setTimeout(()=>{
      if(typeof root.requestIdleCallback==='function')root.requestIdleCallback(()=>{void backgroundStep();},{timeout:5000});
      else void backgroundStep();
    },Math.max(1000,delay));
  }

  async function syncNow({seeds=3}={}){
    const amount=Math.max(1,Math.min(Number(seeds)||3,6));
    for(let index=0;index<amount;index+=1){
      if(sessionQueries>=SESSION_QUERY_BUDGET)break;
      try{await runSeed(await nextSeed(),{interactive:true});}catch(_error){}
    }
    await primeQueue();
    scheduleUi();
    return stats();
  }

  function el(tag,className='',text=''){
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text)node.textContent=text;
    return node;
  }

  function mountStatus(){
    if(typeof document==='undefined'||document.querySelector('#pingoDocePhotoLibraryStatus'))return;
    const catalog=document.querySelector('#marketVisualCatalog');
    if(!catalog)return;
    const controls=catalog.querySelector('.market-visual-catalog-controls')||catalog;
    const status=el('div','pingo-doce-photo-library-status');
    status.id='pingoDocePhotoLibraryStatus';
    const copy=el('div','pingo-doce-photo-library-copy');
    copy.append(el('strong','','Biblioteca Pingo Doce'));
    const metrics=el('span','pingo-doce-photo-library-metrics','A preparar inventário…');
    metrics.id='pingoDocePhotoLibraryMetrics';
    copy.append(metrics);
    const button=el('button','pingo-doce-photo-library-sync','Atualizar biblioteca');
    button.type='button';button.dataset.pingoDocePhotoSync='1';
    button.setAttribute('aria-label','Atualizar biblioteca de fotografias Pingo Doce');
    status.append(copy,button);
    controls.insertAdjacentElement('afterend',status);
    void renderStatus();
  }

  async function renderStatus(){
    if(typeof document==='undefined')return;
    mountStatus();
    const target=document.querySelector('#pingoDocePhotoLibraryMetrics');if(!target)return;
    const data=await stats();
    target.textContent=`${data.products} SKUs indexados · ${data.photos} fotografias oficiais`;
  }

  function scheduleUi(){
    if(uiQueued)return;
    uiQueued=true;
    Promise.resolve().then(()=>{uiQueued=false;void renderStatus();});
  }

  function onClick(event){
    const button=event.target.closest?.('[data-pingo-doce-photo-sync]');
    if(!button)return;
    button.disabled=true;
    button.setAttribute('aria-busy','true');
    void syncNow({seeds:3}).finally(()=>{
      button.disabled=false;
      button.removeAttribute('aria-busy');
      scheduleUi();
    });
  }

  function install(){
    document.addEventListener('click',onClick);
    mountStatus();
    void primeQueue();
    scheduleBackground(4500);
    if(document.body&&!observer){
      observer=new MutationObserver(mutations=>{
        if(document.querySelector('#pingoDocePhotoLibraryStatus'))return;
        if(mutations.some(mutation=>mutation.type==='childList'&&mutation.addedNodes.length))mountStatus();
      });
      observer.observe(document.body,{subtree:true,childList:true});
    }
  }

  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
    else install();
  }
  if(root.addEventListener)root.addEventListener('pageshow',()=>{void primeQueue();scheduleBackground(2500);scheduleUi();});

  root.CDCPingoDocePhotoLibrary=Object.freeze({
    revision:REVISION,categories:CATEGORIES,seedCount:seedPlan.length,
    identity,safeProductUrl,parseSearchRecords,stats,syncNow,warmPending:primeQueue
  });
})(globalThis);

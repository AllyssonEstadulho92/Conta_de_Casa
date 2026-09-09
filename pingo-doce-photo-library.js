'use strict';

/*
 * Conta de Casa — biblioteca progressiva de fotografias oficiais Pingo Doce (75-pd-photo2)
 *
 * Objetivos:
 * - descobrir SKUs reais Pingo Doce pela fonte de pesquisa já usada pelo Mercado;
 * - guardar inventário técnico do SKU e alimentar a biblioteca oficial marketId|pid;
 * - expor uma vista local leve da biblioteca sem depender de rede para abrir;
 * - sincronizar o estado ready com a biblioteca geral quando o loader visual resolve uma imagem;
 * - manter preços, quantidades, faturas, cofre e estado financeiro fora desta camada.
 */
(function installPingoDocePhotoLibrary(root){
  const REVISION='75-pd-photo2';
  const DB_NAME='conta-de-casa-pingo-doce-photo-library';
  const DB_VERSION=1;
  const PRODUCT_STORE='products';
  const META_STORE='meta';
  const MARKET_ID='pingo-doce';
  const STORE_ID='pingodoce';
  const CESTA_MCP_URL='https://cesta.pt/mcp';
  const REQUEST_TIMEOUT_MS=8000;
  const BACKGROUND_QUERY_INTERVAL_MS=24000;
  const BACKGROUND_IMAGE_INTERVAL_MS=9000;
  const SESSION_QUERY_BUDGET=18;
  const DAILY_QUERY_BUDGET=60;
  const SESSION_IMAGE_BUDGET=20;
  const DAILY_IMAGE_BUDGET=80;
  const PENDING_QUEUE_LIMIT=80;
  const LIBRARY_RENDER_LIMIT=12;

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
  let panelRenderPromise=null;
  let manualSyncPromise=null;

  function identity(value={}){
    const source=typeof value==='string'?{pid:value}:value;
    const pid=String(source?.pid??'').replace(/\D/g,'').slice(0,32);
    if(!pid)return null;
    return {marketId:MARKET_ID,pid,key:`${MARKET_ID}|${pid}`};
  }

  function marketIsActive(){return Boolean(document.querySelector('#page-market.page.active'));}

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
      lastSeenAt:Number(value.lastSeenAt)||Number(previous?.lastSeenAt)||Date.now(),
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

  async function listProducts({state='all',limit=LIBRARY_RENDER_LIMIT}={}){
    const max=Math.max(1,Math.min(Number(limit)||LIBRARY_RENDER_LIMIT,48));
    const db=await openDb();
    let records=[];
    if(db){
      records=await new Promise(resolve=>{
        let tx;try{tx=db.transaction(PRODUCT_STORE,'readonly');}catch(_error){resolve([]);return;}
        const request=tx.objectStore(PRODUCT_STORE).getAll();
        request.onsuccess=()=>resolve(Array.isArray(request.result)?request.result:[]);
        request.onerror=()=>resolve([]);
      });
    }else records=[...memoryProducts.values()];
    if(['ready','pending','missing'].includes(state))records=records.filter(record=>record.imageState===state);
    const order={ready:0,pending:1,missing:2};
    records.sort((a,b)=>(order[a.imageState]??3)-(order[b.imageState]??3)||Number(b.lastSeenAt||0)-Number(a.lastSeenAt||0)||a.name.localeCompare(b.name,'pt-PT'));
    return records.slice(0,max);
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
      await cestaRpc({jsonrpc:'2.0',id:7521,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'Conta de Casa Pingo Doce photo library',version:REVISION}}});
      await cestaRpc({jsonrpc:'2.0',method:'notifications/initialized'}).catch(()=>null);
      return true;
    })().catch(error=>{cestaReadyPromise=null;throw error;});
    return cestaReadyPromise;
  }

  async function searchSeed(entry){
    const term=clean(entry?.term,100);if(term.length<2)return [];
    await ensureCestaReady();
    const event=await cestaRpc({
      jsonrpc:'2.0',id:7522,method:'tools/call',
      params:{name:'search_products',arguments:{query:term,stores:[STORE_ID],limit:20}}
    });
    const text=event?.result?.content?.find(item=>item?.type==='text')?.text||'';
    return parseSearchRecords(text,entry.categoryId);
  }

  function dayKey(){return new Date().toISOString().slice(0,10);}

  async function schedulerState(){
    const previous=await getMeta('scheduler');
    if(previous?.day===dayKey())return previous;
    return {key:'scheduler',day:dayKey(),queriesToday:0,imagesToday:0,cursor:Number(previous?.cursor)||0,lastQueryAt:0,lastImageAt:0};
  }

  function backgroundAllowed(){
    if(typeof document!=='undefined'){
      if(document.visibilityState==='hidden'||!marketIsActive())return false;
    }
    if(typeof navigator!=='undefined'){
      if(navigator.onLine===false)return false;
      if(navigator.connection?.saveData)return false;
    }
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
      enqueueImages(stored.slice(0,4));
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
    scheduleImageWarm(1500);
  }

  async function markImageState(record,state){
    return putProduct({...record,imageState:state,imageCheckedAt:Date.now()});
  }

  async function noteImageResult(target,state='ready'){
    const id=identity(target);if(!id)return null;
    const record=await getProduct(id.key);if(!record)return null;
    const next=['ready','pending','missing'].includes(state)?state:'pending';
    const saved=await markImageState(record,next);
    scheduleUi();
    if(!document.querySelector('#pingoDocePhotoLibraryPanel')?.hidden)void renderLibraryPanel();
    return saved;
  }

  async function warmOneImage(record){
    if(imageInFlight||sessionImages>=SESSION_IMAGE_BUDGET||!backgroundAllowed())return null;
    const scheduler=await schedulerState();
    if(Number(scheduler.imagesToday)>=DAILY_IMAGE_BUDGET)return null;
    const library=root.CDCMarketImageLibrary;
    const official=root.CDCOfficialMarketImages;
    if(!library?.get||!library?.remember||!official?.resolve)return null;
    imageInFlight=true;
    try{
      const cached=await library.get(record).catch(()=>null);
      if(cached){await markImageState(record,'ready');return cached;}
      const result=await official.resolve({marketId:MARKET_ID,pid:record.pid,name:record.name,pack:record.pack,sourceUrl:record.sourceUrl}).catch(()=>null);
      sessionImages+=1;
      scheduler.imagesToday=Number(scheduler.imagesToday||0)+1;
      scheduler.lastImageAt=Date.now();
      await putMeta(scheduler);
      if(!result?.imageUrl){await markImageState(record,'missing');return null;}
      const stored=await library.remember({...result,marketId:MARKET_ID,pid:record.pid,name:record.name,pack:record.pack},record).catch(()=>null);
      await markImageState(record,stored?'ready':'pending');
      return stored;
    }finally{imageInFlight=false;}
  }

  function scheduleImageWarm(delay=BACKGROUND_IMAGE_INTERVAL_MS){
    if(imageTimer||!imageQueue.length||sessionImages>=SESSION_IMAGE_BUDGET||!marketIsActive())return;
    imageTimer=setTimeout(async()=>{
      imageTimer=0;
      if(!backgroundAllowed())return;
      const record=imageQueue.shift();
      if(record){imageQueued.delete(record.key);await warmOneImage(record);}
      scheduleUi();
      scheduleImageWarm(BACKGROUND_IMAGE_INTERVAL_MS);
    },Math.max(1000,delay));
  }

  async function listPending(limit=PENDING_QUEUE_LIMIT){
    const max=Math.max(1,Math.min(Number(limit)||PENDING_QUEUE_LIMIT,160));
    const records=await listProducts({limit:max});
    return records.filter(record=>record.imageState!=='ready').slice(0,max);
  }

  async function primeQueue(){enqueueImages(await listPending());}

  async function reconcileCachedImages(limit=LIBRARY_RENDER_LIMIT){
    const library=root.CDCMarketImageLibrary;if(!library?.get)return 0;
    const pending=await listPending(Math.max(1,Math.min(Number(limit)||LIBRARY_RENDER_LIMIT,24)));
    let changed=0;
    for(const record of pending){
      const cached=await library.get(record).catch(()=>null);
      if(cached){await markImageState(record,'ready');changed+=1;}
    }
    if(changed)scheduleUi();
    return changed;
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
    if(sessionQueries>=SESSION_QUERY_BUDGET||!backgroundAllowed())return;
    const state=await schedulerState();
    if(Number(state.queriesToday)>=DAILY_QUERY_BUDGET)return;
    try{await runSeed(await nextSeed(),{interactive:false});}catch(_error){}
    scheduleBackground(BACKGROUND_QUERY_INTERVAL_MS);
  }

  function scheduleBackground(delay=6000){
    if(backgroundTimer||sessionQueries>=SESSION_QUERY_BUDGET||!marketIsActive())return;
    backgroundTimer=setTimeout(()=>{
      backgroundTimer=0;
      if(!backgroundAllowed())return;
      if(typeof root.requestIdleCallback==='function')root.requestIdleCallback(()=>{void backgroundStep();},{timeout:4000});
      else void backgroundStep();
    },Math.max(1500,delay));
  }

  async function syncNow({seeds=1}={}){
    const amount=Math.max(1,Math.min(Number(seeds)||1,3));
    let added=0;
    for(let index=0;index<amount;index+=1){
      if(sessionQueries>=SESSION_QUERY_BUDGET)break;
      try{added+=(await runSeed(await nextSeed(),{interactive:true})).length;}catch(_error){}
    }
    await reconcileCachedImages(LIBRARY_RENDER_LIMIT);
    scheduleUi();
    return {...await stats(),added};
  }

  function el(tag,className='',text=''){
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text)node.textContent=text;
    return node;
  }

  function mountStatus(){
    if(typeof document==='undefined'||document.querySelector('#pingoDocePhotoLibraryStatus'))return true;
    const catalog=document.querySelector('#marketVisualCatalog');
    if(!catalog)return false;
    const controls=catalog.querySelector('.market-visual-catalog-controls')||catalog;
    const status=el('div','pingo-doce-photo-library-status');
    status.id='pingoDocePhotoLibraryStatus';
    const copy=el('div','pingo-doce-photo-library-copy');
    copy.append(el('strong','','Biblioteca Pingo Doce'));
    const metrics=el('span','pingo-doce-photo-library-metrics','A preparar inventário…');
    metrics.id='pingoDocePhotoLibraryMetrics';
    copy.append(metrics);
    const actions=el('div','pingo-doce-photo-library-actions');
    const open=el('button','pingo-doce-photo-library-open','Abrir biblioteca');
    open.type='button';open.dataset.pingoDocePhotoOpen='1';open.setAttribute('aria-expanded','false');open.setAttribute('aria-controls','pingoDocePhotoLibraryPanel');
    const sync=el('button','pingo-doce-photo-library-sync','Atualizar');
    sync.type='button';sync.dataset.pingoDocePhotoSync='1';sync.setAttribute('aria-label','Atualizar inventário Pingo Doce');
    actions.append(open,sync);
    status.append(copy,actions);

    const panel=el('section','pingo-doce-photo-library-panel');
    panel.id='pingoDocePhotoLibraryPanel';panel.hidden=true;panel.setAttribute('aria-label','Biblioteca local Pingo Doce');
    const panelHead=el('div','pingo-doce-photo-library-panel-head');
    const panelCopy=el('div','pingo-doce-photo-library-panel-copy');
    panelCopy.append(el('strong','','Fotografias Pingo Doce'));
    panelCopy.append(el('span','','Pré-visualização local. Abrir esta biblioteca não inicia pesquisas de rede.'));
    const close=el('button','pingo-doce-photo-library-close','Fechar');close.type='button';close.dataset.pingoDocePhotoClose='1';
    panelHead.append(panelCopy,close);
    const list=el('div','pingo-doce-photo-library-list');list.id='pingoDocePhotoLibraryList';
    panel.append(panelHead,list);

    controls.insertAdjacentElement('afterend',status);
    status.insertAdjacentElement('afterend',panel);
    void renderStatus();
    return true;
  }

  async function renderStatus(){
    if(typeof document==='undefined')return;
    mountStatus();
    const target=document.querySelector('#pingoDocePhotoLibraryMetrics');if(!target)return;
    const data=await stats();
    target.textContent=`${data.products} SKUs indexados · ${data.photos} fotografias oficiais`;
  }

  function libraryStateLabel(state){
    if(state==='ready')return 'Com fotografia';
    if(state==='missing')return 'Sem fotografia';
    return 'A validar';
  }

  async function libraryItem(record){
    const item=el('article','pingo-doce-photo-library-item');
    const media=el('div','pingo-doce-photo-library-media');
    let cached=null;
    try{cached=await root.CDCMarketImageLibrary?.get?.(record);}catch(_error){}
    if(cached?.imageUrl){
      const image=document.createElement('img');image.src=cached.imageUrl;image.alt='';image.loading='lazy';image.decoding='async';image.referrerPolicy='no-referrer';
      image.addEventListener('error',()=>{media.replaceChildren(el('span','pingo-doce-photo-library-placeholder','PD'));void noteImageResult(record,'pending');},{once:true});
      media.append(image);
      if(record.imageState!=='ready')void noteImageResult(record,'ready');
    }else media.append(el('span','pingo-doce-photo-library-placeholder','PD'));
    const copy=el('div','pingo-doce-photo-library-item-copy');
    copy.append(el('strong','',record.name||`Produto ${record.pid}`));
    if(record.pack)copy.append(el('span','',record.pack));
    copy.append(el('small','',`PID ${record.pid}`));
    const badge=el('span',`pingo-doce-photo-library-state is-${record.imageState||'pending'}`,libraryStateLabel(record.imageState));
    item.append(media,copy,badge);
    return item;
  }

  function renderLibraryPanel(){
    if(panelRenderPromise)return panelRenderPromise;
    panelRenderPromise=(async()=>{
      const panel=document.querySelector('#pingoDocePhotoLibraryPanel');
      const list=document.querySelector('#pingoDocePhotoLibraryList');
      if(!panel||panel.hidden||!list)return;
      list.replaceChildren(el('div','pingo-doce-photo-library-loading','A abrir biblioteca local…'));
      await reconcileCachedImages(LIBRARY_RENDER_LIMIT);
      const records=await listProducts({limit:LIBRARY_RENDER_LIMIT});
      list.replaceChildren();
      if(!records.length){
        const empty=el('div','pingo-doce-photo-library-empty','Ainda não existem produtos Pingo Doce indexados neste dispositivo.');
        list.append(empty);return;
      }
      const fragment=document.createDocumentFragment();
      for(const record of records)fragment.append(await libraryItem(record));
      list.append(fragment);
      const data=await stats();
      list.append(el('div','pingo-doce-photo-library-foot',`A mostrar ${records.length} de ${data.products} SKUs locais.`));
    })().finally(()=>{panelRenderPromise=null;});
    return panelRenderPromise;
  }

  function scheduleUi(){
    if(uiQueued)return;
    uiQueued=true;
    Promise.resolve().then(()=>{
      uiQueued=false;
      void renderStatus();
      const panel=document.querySelector('#pingoDocePhotoLibraryPanel');
      if(panel&&!panel.hidden)void renderLibraryPanel();
    });
  }

  function setPanelOpen(open){
    mountStatus();
    const panel=document.querySelector('#pingoDocePhotoLibraryPanel');
    const button=document.querySelector('[data-pingo-doce-photo-open]');
    if(!panel||!button)return;
    panel.hidden=!open;
    button.setAttribute('aria-expanded',String(open));
    button.textContent=open?'Ocultar biblioteca':'Abrir biblioteca';
    if(open)void renderLibraryPanel();
  }

  function runManualSync(button){
    if(manualSyncPromise)return manualSyncPromise;
    const original=button.textContent;
    button.disabled=true;button.setAttribute('aria-busy','true');button.textContent='A atualizar…';
    const metrics=document.querySelector('#pingoDocePhotoLibraryMetrics');
    if(metrics)metrics.textContent='A procurar novos produtos…';
    manualSyncPromise=syncNow({seeds:1})
      .catch(()=>null)
      .finally(()=>{
        button.disabled=false;button.removeAttribute('aria-busy');button.textContent=original;
        manualSyncPromise=null;scheduleUi();
      });
    return manualSyncPromise;
  }

  function onClick(event){
    const open=event.target.closest?.('[data-pingo-doce-photo-open]');
    if(open){setPanelOpen(open.getAttribute('aria-expanded')!=='true');return;}
    if(event.target.closest?.('[data-pingo-doce-photo-close]')){setPanelOpen(false);return;}
    const sync=event.target.closest?.('[data-pingo-doce-photo-sync]');
    if(sync){void runManualSync(sync);}
  }

  function activateMarket(){
    if(!marketIsActive())return;
    mountStatus();scheduleUi();
    void reconcileCachedImages(LIBRARY_RENDER_LIMIT);
    scheduleBackground(6500);
  }

  function install(){
    document.addEventListener('click',onClick);
    mountStatus();
    const page=document.querySelector('#page-market');
    if(page&&!observer){
      observer=new MutationObserver(mutations=>{
        const classChanged=mutations.some(mutation=>mutation.type==='attributes'&&mutation.target===page);
        const catalogAdded=mutations.some(mutation=>mutation.type==='childList'&&mutation.addedNodes.length&&!document.querySelector('#pingoDocePhotoLibraryStatus'));
        if(classChanged||catalogAdded)activateMarket();
      });
      observer.observe(page,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    }
    activateMarket();
  }

  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
    else install();
  }
  if(root.addEventListener)root.addEventListener('pageshow',activateMarket);

  root.CDCPingoDocePhotoLibrary=Object.freeze({
    revision:REVISION,categories:CATEGORIES,seedCount:seedPlan.length,
    identity,safeProductUrl,parseSearchRecords,stats,listProducts,syncNow,
    warmPending:primeQueue,noteImageResult,reconcileCachedImages,open:()=>setPanelOpen(true)
  });
})(globalThis);

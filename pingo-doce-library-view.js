'use strict';

/* Conta de Casa — vista local e paginada da Biblioteca Pingo Doce (75-pd-view1). */
(function installPingoDoceLibraryView(root){
  const REVISION='75-pd-view1';
  const DB_NAME='conta-de-casa-pingo-doce-photo-library';
  const PRODUCT_STORE='products';
  const PAGE_SIZE=12;
  const FILTERS=Object.freeze([
    ['all','Todos'],
    ['ready','Com fotografia'],
    ['pending','Pendentes'],
    ['missing','Sem fotografia']
  ]);

  let dbPromise=null;
  let overlay=null;
  let currentFilter='all';
  let currentQuery='';
  let currentOffset=0;
  let renderToken=0;
  let previousFocus=null;
  let observer=null;
  let searchTimer=0;

  const clean=(value,max=160)=>String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
  const normal=value=>clean(value,220).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-PT');

  function el(tag,className='',text=''){
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text)node.textContent=text;
    return node;
  }

  function openDb(){
    if(dbPromise)return dbPromise;
    if(!root.indexedDB)return Promise.resolve(null);
    dbPromise=new Promise(resolve=>{
      let request;
      try{request=root.indexedDB.open(DB_NAME);}catch(_error){resolve(null);return;}
      request.onerror=()=>resolve(null);
      request.onblocked=()=>resolve(null);
      request.onupgradeneeded=()=>{
        try{request.transaction.abort();}catch(_error){}
        resolve(null);
      };
      request.onsuccess=()=>{
        const db=request.result;
        if(!db.objectStoreNames.contains(PRODUCT_STORE)){db.close();resolve(null);return;}
        resolve(db);
      };
    });
    return dbPromise;
  }

  function matches(record,state,query){
    if(state!=='all'&&record?.imageState!==state)return false;
    if(!query)return true;
    const haystack=normal(`${record?.name||''} ${record?.pack||''} ${record?.categoryId||''} ${record?.pid||''}`);
    return haystack.includes(query);
  }

  async function listRecords({state='all',query='',offset=0,limit=PAGE_SIZE}={}){
    const safeState=FILTERS.some(([id])=>id===state)?state:'all';
    const q=normal(query);
    const skip=Math.max(0,Number(offset)||0);
    const max=Math.max(1,Math.min(Number(limit)||PAGE_SIZE,24));
    const db=await openDb();
    if(!db)return {items:[],hasMore:false};
    return new Promise(resolve=>{
      const items=[];
      let matched=0;
      let hasMore=false;
      let tx;
      try{tx=db.transaction(PRODUCT_STORE,'readonly');}catch(_error){resolve({items:[],hasMore:false});return;}
      const request=tx.objectStore(PRODUCT_STORE).openCursor();
      request.onerror=()=>resolve({items,hasMore:false});
      request.onsuccess=()=>{
        const cursor=request.result;
        if(!cursor){resolve({items,hasMore});return;}
        const record=cursor.value||{};
        if(matches(record,safeState,q)){
          if(matched>=skip){
            if(items.length<max)items.push(record);
            else{hasMore=true;resolve({items,hasMore});return;}
          }
          matched+=1;
        }
        cursor.continue();
      };
    });
  }

  function stateLabel(value){
    if(value==='ready')return 'Com fotografia';
    if(value==='missing')return 'Sem fotografia';
    return 'Pendente';
  }

  function placeholder(media){
    media.replaceChildren();
    const mark=el('span','pd-library-placeholder-mark','PD');
    mark.setAttribute('aria-hidden','true');
    media.append(mark);
  }

  async function productCard(record){
    const card=el('article','pd-library-product');
    const media=el('div','pd-library-product-media');
    placeholder(media);

    let cached=null;
    try{cached=await root.CDCMarketImageLibrary?.get?.(record);}catch(_error){}
    if(cached?.imageUrl){
      const image=document.createElement('img');
      image.alt='';
      image.loading='lazy';
      image.decoding='async';
      image.referrerPolicy='no-referrer';
      image.addEventListener('error',()=>placeholder(media),{once:true});
      image.src=cached.imageUrl;
      media.replaceChildren(image);
    }

    const copy=el('div','pd-library-product-copy');
    const top=el('div','pd-library-product-top');
    top.append(el('span','pd-library-product-state',stateLabel(record.imageState)));
    top.append(el('span','pd-library-product-pid',`PID ${clean(record.pid,32)}`));
    copy.append(top);
    copy.append(el('strong','pd-library-product-name',clean(record.name,140)||'Produto Pingo Doce'));
    if(record.pack)copy.append(el('span','pd-library-product-pack',clean(record.pack,100)));
    const category=clean(record.categoryId,60).replace(/-/g,' ');
    if(category)copy.append(el('span','pd-library-product-category',category));

    const sourceUrl=root.CDCPingoDocePhotoLibrary?.safeProductUrl?.(record.sourceUrl,record.pid)||'';
    if(sourceUrl){
      const link=el('a','pd-library-product-link','Ver produto');
      link.href=sourceUrl;
      link.target='_blank';
      link.rel='noopener noreferrer';
      copy.append(link);
    }

    card.append(media,copy);
    return card;
  }

  async function summaryText(){
    try{
      const data=await root.CDCPingoDocePhotoLibrary?.stats?.();
      if(data)return `${Number(data.products)||0} SKUs · ${Number(data.photos)||0} fotografias oficiais`;
    }catch(_error){}
    return 'Biblioteca local Pingo Doce';
  }

  function buildOverlay(){
    if(overlay||typeof document==='undefined')return overlay;
    overlay=el('div','pd-library-overlay');
    overlay.id='pingoDoceLibraryView';
    overlay.hidden=true;
    overlay.dataset.pingoDoceLibraryBackdrop='1';

    const panel=el('section','pd-library-panel');
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-labelledby','pingoDoceLibraryTitle');

    const head=el('header','pd-library-head');
    const heading=el('div','pd-library-heading');
    heading.append(el('span','pd-library-eyebrow','Mercado'));
    const title=el('h2','pd-library-title','Biblioteca Pingo Doce');
    title.id='pingoDoceLibraryTitle';
    heading.append(title);
    const summary=el('p','pd-library-summary','A preparar biblioteca…');
    summary.id='pingoDoceLibraryViewSummary';
    heading.append(summary);
    const close=el('button','pd-library-close','×');
    close.type='button';
    close.dataset.pingoDoceLibraryClose='1';
    close.setAttribute('aria-label','Fechar Biblioteca Pingo Doce');
    head.append(heading,close);

    const tools=el('div','pd-library-tools');
    const search=document.createElement('input');
    search.type='search';
    search.className='pd-library-search';
    search.id='pingoDoceLibrarySearch';
    search.placeholder='Pesquisar produto ou PID';
    search.autocomplete='off';
    search.setAttribute('aria-label','Pesquisar na Biblioteca Pingo Doce');
    const filters=el('div','pd-library-filters');
    filters.setAttribute('aria-label','Filtrar produtos da biblioteca');
    for(const [id,label] of FILTERS){
      const button=el('button','pd-library-filter',label);
      button.type='button';
      button.dataset.pingoDoceLibraryFilter=id;
      button.setAttribute('aria-pressed',String(id==='all'));
      filters.append(button);
    }
    tools.append(search,filters);

    const body=el('div','pd-library-body');
    const list=el('div','pd-library-grid');
    list.id='pingoDoceLibraryGrid';
    list.setAttribute('aria-live','polite');
    body.append(list);

    const footer=el('footer','pd-library-footer');
    const more=el('button','pd-library-more','Mostrar mais');
    more.type='button';
    more.dataset.pingoDoceLibraryMore='1';
    more.hidden=true;
    footer.append(more);

    panel.append(head,tools,body,footer);
    overlay.append(panel);
    document.body.append(overlay);
    return overlay;
  }

  function updateFilterUi(){
    document.querySelectorAll('[data-pingo-doce-library-filter]').forEach(button=>{
      const selected=button.dataset.pingoDoceLibraryFilter===currentFilter;
      button.classList.toggle('active',selected);
      button.setAttribute('aria-pressed',String(selected));
    });
  }

  async function renderLibrary({reset=false}={}){
    const view=buildOverlay();if(!view||view.hidden)return;
    if(reset)currentOffset=0;
    const token=++renderToken;
    const grid=view.querySelector('#pingoDoceLibraryGrid');
    const more=view.querySelector('[data-pingo-doce-library-more]');
    const summary=view.querySelector('#pingoDoceLibraryViewSummary');
    if(reset){
      grid.replaceChildren(el('div','pd-library-loading','A abrir biblioteca…'));
      if(more)more.hidden=true;
    }
    if(summary)summary.textContent=await summaryText();
    const result=await listRecords({state:currentFilter,query:currentQuery,offset:currentOffset,limit:PAGE_SIZE});
    if(token!==renderToken||view.hidden)return;
    if(reset)grid.replaceChildren();
    if(!result.items.length&&currentOffset===0){
      const empty=el('div','pd-library-empty');
      empty.append(el('strong','','Sem produtos para este filtro'));
      empty.append(el('span','','A biblioteca local será preenchida progressivamente sem bloquear o Mercado.'));
      grid.append(empty);
    }else{
      const cards=await Promise.all(result.items.map(productCard));
      if(token!==renderToken||view.hidden)return;
      cards.forEach(card=>grid.append(card));
      currentOffset+=result.items.length;
    }
    if(more)more.hidden=!result.hasMore;
    updateFilterUi();
  }

  function openLibrary(){
    const view=buildOverlay();if(!view)return;
    previousFocus=document.activeElement;
    view.hidden=false;
    document.body.classList.add('pd-library-is-open');
    currentOffset=0;
    void renderLibrary({reset:true}).then(()=>view.querySelector('[data-pingo-doce-library-close]')?.focus({preventScroll:true}));
  }

  function closeLibrary(){
    if(!overlay||overlay.hidden)return;
    overlay.hidden=true;
    renderToken+=1;
    document.body.classList.remove('pd-library-is-open');
    if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
    previousFocus=null;
  }

  function mountOpenAction(){
    const status=document.querySelector('#pingoDocePhotoLibraryStatus');
    if(!status||status.querySelector('[data-pingo-doce-library-open]'))return;
    const sync=status.querySelector('[data-pingo-doce-photo-sync]');
    if(!sync)return;
    sync.textContent='Atualizar';
    sync.setAttribute('aria-label','Atualizar inventário da Biblioteca Pingo Doce');
    const actions=el('div','pingo-doce-photo-library-actions');
    const open=el('button','pingo-doce-photo-library-open','Abrir biblioteca');
    open.type='button';
    open.dataset.pingoDoceLibraryOpen='1';
    open.setAttribute('aria-label','Abrir Biblioteca Pingo Doce');
    sync.before(actions);
    actions.append(open,sync);
  }

  function scheduleMount(){
    if(typeof root.requestAnimationFrame==='function')root.requestAnimationFrame(mountOpenAction);
    else setTimeout(mountOpenAction,0);
  }

  function onClick(event){
    if(event.target.closest?.('[data-pingo-doce-library-open]')){openLibrary();return;}
    if(event.target.closest?.('[data-pingo-doce-library-close]')){closeLibrary();return;}
    if(event.target===overlay&&event.target.matches?.('[data-pingo-doce-library-backdrop]')){closeLibrary();return;}
    const filter=event.target.closest?.('[data-pingo-doce-library-filter]');
    if(filter){
      currentFilter=FILTERS.some(([id])=>id===filter.dataset.pingoDoceLibraryFilter)?filter.dataset.pingoDoceLibraryFilter:'all';
      void renderLibrary({reset:true});return;
    }
    if(event.target.closest?.('[data-pingo-doce-library-more]')){void renderLibrary({reset:false});}
  }

  function install(){
    buildOverlay();
    mountOpenAction();
    document.addEventListener('click',onClick);
    document.addEventListener('input',event=>{
      if(event.target?.id!=='pingoDoceLibrarySearch')return;
      clearTimeout(searchTimer);
      currentQuery=clean(event.target.value,120);
      searchTimer=setTimeout(()=>void renderLibrary({reset:true}),180);
    });
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&overlay&&!overlay.hidden)closeLibrary();});
    const market=document.querySelector('#page-market')||document.body;
    if(market&&!observer){
      observer=new MutationObserver(mutations=>{
        if(document.querySelector('[data-pingo-doce-library-open]'))return;
        if(mutations.some(mutation=>mutation.type==='childList'&&mutation.addedNodes.length))scheduleMount();
      });
      observer.observe(market,{subtree:true,childList:true});
    }
  }

  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  }

  root.CDCPingoDoceLibraryView=Object.freeze({revision:REVISION,open:openLibrary,close:closeLibrary,list:listRecords});
})(globalThis);

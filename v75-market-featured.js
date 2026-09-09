'use strict';

/* Conta de Casa v75 — revisão 75-featured1.
 * Recompõe apenas o bloco móvel “Produtos em destaque” sobre os mesmos itens/handlers existentes.
 * Lê os itens da lista para apresentação, não escreve appState, não altera preços nem persistência.
 */
(function installV75Featured(root){
  const MOBILE_QUERY='(max-width: 820px)';
  const FEATURED_SELECTOR='#cdcMarketHome .cdc-product-grid';
  const GTIN_ENDPOINT='https://world.openfoodfacts.org/api/v2/product/';
  const imageByCode=new Map();
  let observer=null;
  let scheduled=false;

  const mobileMedia=root.matchMedia?.(MOBILE_QUERY)||null;
  const clean=(value,max=180)=>String(value??'')
    .replace(/[\u0000-\u001f\u007f]/g,' ')
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,max);
  const esc=value=>clean(value,400).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const attr=value=>esc(value).replace(/`/g,'&#96;');
  const norm=value=>clean(value,220).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-PT');

  function isMobile(){return mobileMedia?.matches??root.innerWidth<=820;}

  function appItems(){
    try{return typeof appState!=='undefined'&&Array.isArray(appState?.market)?appState.market:[];}
    catch(_error){return [];}
  }

  function itemById(id){return appItems().find(item=>String(item?.id)===String(id))||null;}

  function safeImageUrl(value){
    if(!value)return '';
    try{
      const url=new URL(String(value));
      if(url.protocol!=='https:')return '';
      const host=url.hostname.toLowerCase();
      const path=decodeURIComponent(url.pathname);
      if(host==='images.openfoodfacts.org')return url.href.slice(0,900);
      if(host==='www.continente.pt'&&path.includes('/Sites-col-master-catalog/')&&/\.(?:jpe?g|png|webp)$/i.test(path))return url.href.slice(0,1100);
      if(host==='static.pingodoce.pt'&&path.includes('/Sites-pingo-doce-master/')&&/\/images\/(?:large|medium|small)\//i.test(path)&&/\.(?:jpe?g|png|webp)$/i.test(path))return url.href.slice(0,1100);
      return '';
    }catch(_error){return '';}
  }

  function icon(name,size=20){
    const paths={
      star:'<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.4l6.1-.9z"/>',
      chevron:'<path d="m9 18 6-6-6-6"/>',
      left:'<path d="m15 18-6-6 6-6"/>',
      right:'<path d="m9 18 6-6-6-6"/>',
      check:'<path d="m5 12 4 4L19 6"/>',
      paw:'<circle cx="7" cy="8" r="2"/><circle cx="17" cy="8" r="2"/><circle cx="5" cy="13" r="1.7"/><circle cx="19" cy="13" r="1.7"/><path d="M8.2 17.5c0-2.1 1.7-3.8 3.8-3.8s3.8 1.7 3.8 3.8c0 1.5-1.2 2.5-3.8 2.5s-3.8-1-3.8-2.5Z"/>',
      dairy:'<path d="M9 4h6l1 3v13H8V7z"/><path d="M9 8h6M10 4V2h4v2"/>',
      food:'<path d="M5 4v7a3 3 0 0 0 3 3h1V4M7 4v7M16 4v16M16 10c3 0 4-2 4-6"/>',
      drink:'<path d="M8 3h8l-1 18H9z"/><path d="M9 8h6M16 3l3-2"/>',
      clean:'<path d="M9 3h6v4l3 3v11H6V10l3-3z"/><path d="M9 12h6M10 3h4"/>',
      market:'<path d="M3 5h2l2 10h10l2-7H7"/><circle cx="9" cy="19" r="1"/><circle cx="17" cy="19" r="1"/>'
    };
    return `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.market}</svg>`;
  }

  function categoryIcon(category,name){
    const value=norm(`${category} ${name}`);
    if(/animal|gato|cao|cão|racao|ração/.test(value))return 'paw';
    if(/lactic|lactíc|queijo|leite|iogurte|ovo/.test(value))return 'dairy';
    if(/bebida|agua|água|sumo|refrigerante/.test(value))return 'drink';
    if(/limpeza|detergente|lixiv|amaciante/.test(value))return 'clean';
    if(/carne|peixe|fiambre|padaria|pao|pão|mercearia|despensa/.test(value))return 'food';
    return 'market';
  }

  function imageFromExisting(card,item){
    const current=card.querySelector('img')?.getAttribute('src')||'';
    return safeImageUrl(current)||safeImageUrl(item?.imageUrl||'');
  }

  function gtin(value){
    const code=String(value||'').replace(/\D/g,'');
    return /^\d{8,14}$/.test(code)?code:'';
  }

  async function fetchImageByCode(code){
    const valid=gtin(code);
    if(!valid)return '';
    if(imageByCode.has(valid))return imageByCode.get(valid);
    const promise=(async()=>{
      try{
        const response=await fetch(`${GTIN_ENDPOINT}${encodeURIComponent(valid)}.json?fields=code,image_front_small_url,image_front_url`,{
          method:'GET',headers:{Accept:'application/json'},credentials:'omit',referrerPolicy:'no-referrer',cache:'force-cache'
        });
        if(!response.ok)return '';
        const payload=await response.json();
        return safeImageUrl(payload?.product?.image_front_small_url||payload?.product?.image_front_url||'');
      }catch(_error){return '';}
    })();
    imageByCode.set(valid,promise);
    return promise;
  }

  function setImageState(visual,state){
    visual.classList.remove('is-loading','is-loaded','is-unavailable');
    visual.classList.add(state);
    visual.dataset.featuredImageState=state.replace('is-','');
  }

  function bindImage(visual,img,item){
    if(!img){setImageState(visual,'is-unavailable');return;}
    const tryFallback=async()=>{
      const resolved=await fetchImageByCode(item?.productCode||'');
      if(!resolved){setImageState(visual,'is-unavailable');return;}
      if(img.src===resolved&&visual.dataset.featuredRetry==='1'){setImageState(visual,'is-unavailable');return;}
      visual.dataset.featuredRetry='1';
      setImageState(visual,'is-loading');
      img.src=resolved;
    };
    img.addEventListener('load',()=>setImageState(visual,'is-loaded'));
    img.addEventListener('error',()=>{void tryFallback();});
    if(img.complete){
      if(img.naturalWidth>0&&img.naturalHeight>0)setImageState(visual,'is-loaded');
      else void tryFallback();
    }else setImageState(visual,'is-loading');
  }

  function cardMarkup({name,category,price,imageUrl}){
    const iconName=categoryIcon(category,name);
    const image=imageUrl?`<img src="${attr(imageUrl)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">`:'';
    return `<span class="cdc-featured-visual ${imageUrl?'is-loading':'is-unavailable'}">
      ${image}
      <span class="cdc-featured-fallback" aria-hidden="true"><span class="cdc-featured-fallback-icon">${icon(iconName,27)}</span><strong>Imagem indisponível</strong></span>
      <span class="cdc-featured-category">${icon(iconName,14)}<span>${esc(category||'Outros')}</span></span>
    </span>
    <span class="cdc-featured-copy">
      <strong class="cdc-featured-name">${esc(name||'Produto')}</strong>
      <span class="cdc-featured-meta">${esc(category||'Outros')}</span>
      <span class="cdc-featured-price-row"><b class="cdc-featured-price" data-money>${esc(price||'—')}</b></span>
    </span>
    <span class="cdc-featured-list-state"><span>${icon('check',16)}Na sua lista</span>${icon('chevron',17)}</span>`;
  }

  function upgradeCard(card){
    if(!(card instanceof HTMLElement))return;
    if(card.dataset.v75Featured==='1')return;
    const id=card.dataset.editMarket||'';
    const item=itemById(id);
    const name=clean(item?.name||card.querySelector(':scope>strong')?.textContent||'Produto',120);
    const category=clean(item?.category||card.querySelector(':scope>small')?.textContent||'Outros',70);
    const price=clean(card.querySelector(':scope>b')?.textContent||'',40);
    const imageUrl=imageFromExisting(card,item);
    card.dataset.v75Featured='1';
    card.dataset.featuredCategory=norm(category).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50);
    card.classList.add('cdc-featured-card');
    card.innerHTML=cardMarkup({name,category,price,imageUrl});
    card.setAttribute('aria-label',`Ver detalhes de ${name}${price?`, ${price}`:''}`);
    const visual=card.querySelector('.cdc-featured-visual');
    const img=visual?.querySelector('img')||null;
    if(visual)bindImage(visual,img,item);
  }

  function ensureHeader(home){
    const heads=[...home.querySelectorAll('.cdc-market-section-head')];
    const head=heads.find(node=>/produtos\s+em\s+destaque/i.test(node.textContent||''));
    if(!head||head.dataset.v75FeaturedHead==='1')return;
    const action=head.querySelector('[data-v74-market-browser]');
    head.dataset.v75FeaturedHead='1';
    head.classList.add('cdc-featured-head');
    head.innerHTML=`<span class="cdc-featured-heading-icon">${icon('star',21)}</span><span class="cdc-featured-heading-copy"><strong>Produtos em destaque</strong><small>Seleção da sua lista de compras</small></span>`;
    if(action){
      action.innerHTML=`Ver todos ${icon('chevron',16)}`;
      head.append(action);
    }
  }

  function syncPager(grid,controls){
    const cards=[...grid.querySelectorAll('.cdc-featured-card')];
    const dots=[...controls.querySelectorAll('.cdc-featured-dot')];
    const previous=controls.querySelector('[data-featured-prev]');
    const next=controls.querySelector('[data-featured-next]');
    if(!cards.length)return;
    const left=grid.scrollLeft;
    let active=0;
    let distance=Number.POSITIVE_INFINITY;
    cards.forEach((card,index)=>{
      const delta=Math.abs(card.offsetLeft-grid.offsetLeft-left);
      if(delta<distance){distance=delta;active=index;}
    });
    dots.forEach((dot,index)=>dot.classList.toggle('active',index===active));
    if(previous)previous.disabled=active<=0;
    if(next)next.disabled=active>=cards.length-1;
  }

  function ensureControls(home,grid){
    const cards=[...grid.querySelectorAll('.cdc-featured-card')];
    let controls=home.querySelector('.cdc-featured-controls');
    if(cards.length<=1){controls?.remove();return;}
    const countKey=String(cards.length);
    if(controls?.dataset.featuredCount===countKey){syncPager(grid,controls);return;}
    if(!controls){
      controls=document.createElement('div');
      controls.className='cdc-featured-controls';
      controls.setAttribute('aria-label','Navegação dos produtos em destaque');
      grid.insertAdjacentElement('afterend',controls);
    }
    controls.dataset.featuredCount=countKey;
    controls.innerHTML=`<button class="cdc-featured-arrow" type="button" data-featured-prev aria-label="Produto anterior">${icon('left',18)}</button><span class="cdc-featured-dots" aria-hidden="true">${cards.map((_,index)=>`<i class="cdc-featured-dot${index===0?' active':''}"></i>`).join('')}</span><button class="cdc-featured-arrow" type="button" data-featured-next aria-label="Produto seguinte">${icon('right',18)}</button>`;
    const scrollToIndex=index=>{
      const target=cards[Math.max(0,Math.min(cards.length-1,index))];
      if(target)grid.scrollTo({left:target.offsetLeft-grid.offsetLeft,behavior:'smooth'});
    };
    const activeIndex=()=>{
      const dots=[...controls.querySelectorAll('.cdc-featured-dot')];
      const index=dots.findIndex(dot=>dot.classList.contains('active'));
      return index<0?0:index;
    };
    controls.querySelector('[data-featured-prev]')?.addEventListener('click',()=>scrollToIndex(activeIndex()-1));
    controls.querySelector('[data-featured-next]')?.addEventListener('click',()=>scrollToIndex(activeIndex()+1));
    if(grid.dataset.featuredScrollBound!=='1'){
      grid.dataset.featuredScrollBound='1';
      let raf=0;
      grid.addEventListener('scroll',()=>{
        if(raf)return;
        raf=requestAnimationFrame(()=>{raf=0;const current=home.querySelector('.cdc-featured-controls');if(current)syncPager(grid,current);});
      },{passive:true});
    }
    syncPager(grid,controls);
  }

  function upgrade(){
    if(!isMobile())return;
    const home=document.querySelector('#cdcMarketHome');
    const grid=document.querySelector(FEATURED_SELECTOR);
    if(!home||!grid)return;
    ensureHeader(home);
    grid.classList.add('cdc-featured-carousel');
    [...grid.querySelectorAll('.cdc-product-card')].forEach(upgradeCard);
    ensureControls(home,grid);
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;upgrade();});
  }

  function start(){
    upgrade();
    if(document.body&&!observer){
      observer=new MutationObserver(records=>{
        if(records.some(record=>record.type==='childList'&&record.addedNodes.length))schedule();
      });
      observer.observe(document.body,{subtree:true,childList:true});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  mobileMedia?.addEventListener?.('change',schedule);
  root.addEventListener('pageshow',schedule);
  root.addEventListener('online',schedule);

  root.CDCV75Featured=Object.freeze({revision:'75-featured1',upgrade});
})(window);

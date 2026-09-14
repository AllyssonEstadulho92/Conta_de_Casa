'use strict';

/* Conta de Casa v75 — estabilidade transversal de apresentação.
 * Responsabilidades exclusivas desta camada:
 * - sincronizar a cor do browser/PWA com o tema visível;
 * - marcar estados de carregamento/erro das imagens do Mercado;
 * - reavaliar esses estados após re-renderizações;
 * - estabilizar a navegação móvel final enquanto as camadas históricas v74/v75 coexistem;
 * - remover blocos v74 do Dashboard que já foram integralmente substituídos por v76.
 * Não lê nem escreve valores financeiros, IndexedDB, cofre ou sincronização.
 */
(function installV75Stability(root){
  const MOBILE_QUERY='(max-width: 820px)';
  const IMAGE_SELECTOR='.market-product-photo';
  const IMAGE_BOUND='v75ImageBound';
  const RUNTIME_REVISION='76-runtime-consolidation1';
  const PRIMARY_MOBILE_NAV=Object.freeze([
    Object.freeze({page:'dashboard',label:'Início',icon:'home'}),
    Object.freeze({page:'bills',label:'Despesas',icon:'bill'}),
    Object.freeze({page:'market',label:'Mercado',icon:'market'}),
    Object.freeze({page:'planning',label:'Plano',icon:'plan'}),
    Object.freeze({page:'settings',label:'Mais',icon:'more'})
  ]);
  const LEGACY_DASHBOARD_IDS=Object.freeze([
    'cdcMobileGreeting','cdcMobileMonthWrap','cdcMonthHero','cdcQuickActions','cdcDashboardCategories'
  ]);
  let auditFrame=0;
  let runtimeFrame=0;
  let navObserver=null;

  const mobileMedia=root.matchMedia?.(MOBILE_QUERY)||null;
  const html=document.documentElement;

  function isDark(){return html.dataset.theme==='dark';}
  function isMobile(){return mobileMedia?.matches??root.innerWidth<=820;}

  function syncThemeColor(){
    const meta=document.querySelector('meta[name="theme-color"]');
    if(!meta)return;
    const color=isMobile()
      ? (isDark()?'#062f38':'#003f4c')
      : (isDark()?'#071b20':'#f3f7f7');
    if(meta.getAttribute('content')!==color)meta.setAttribute('content',color);
  }

  function isInteractivePhoto(photo){return photo.matches('button,a,[role="button"]');}

  function rememberInteractiveLabel(photo){
    if(!isInteractivePhoto(photo)||photo.dataset.v75OriginalLabel!==undefined)return;
    photo.dataset.v75OriginalLabel=photo.getAttribute('aria-label')||'';
  }

  function setPhotoSemantics(photo,available){
    if(isInteractivePhoto(photo)){
      rememberInteractiveLabel(photo);
      if(available){
        const original=photo.dataset.v75OriginalLabel||'';
        if(original)photo.setAttribute('aria-label',original);
        else photo.removeAttribute('aria-label');
        photo.removeAttribute('aria-disabled');
        if(photo instanceof HTMLButtonElement)photo.disabled=false;
      }else{
        photo.setAttribute('aria-label','Imagem indisponível');
        photo.setAttribute('aria-disabled','true');
        if(photo instanceof HTMLButtonElement)photo.disabled=true;
      }
      return;
    }
    if(available){
      photo.setAttribute('aria-hidden','true');
      photo.removeAttribute('role');
      photo.removeAttribute('aria-label');
      return;
    }
    photo.removeAttribute('aria-hidden');
    photo.setAttribute('role','img');
    photo.setAttribute('aria-label','Imagem indisponível');
  }

  function markPhotoLoaded(photo){
    photo.classList.remove('is-loading','is-error','is-empty');
    photo.classList.add('is-loaded');
    photo.dataset.imageState='loaded';
    setPhotoSemantics(photo,true);
  }

  function markPhotoUnavailable(photo,state='error'){
    photo.classList.remove('is-loading','is-loaded');
    photo.classList.add(state==='empty'?'is-empty':'is-error');
    if(state==='empty')photo.classList.remove('is-error');
    else photo.classList.remove('is-empty');
    photo.dataset.imageState=state;
    setPhotoSemantics(photo,false);
  }

  function markPhotoLoading(photo){
    photo.classList.remove('is-loaded','is-error','is-empty');
    photo.classList.add('is-loading');
    photo.dataset.imageState='loading';
    rememberInteractiveLabel(photo);
  }

  function bindPhoto(photo){
    const img=photo.querySelector('img');
    if(!img){
      markPhotoUnavailable(photo,'empty');
      return;
    }

    if(photo.dataset[IMAGE_BOUND]!=='true'){
      photo.dataset[IMAGE_BOUND]='true';
      img.addEventListener('load',()=>markPhotoLoaded(photo));
      img.addEventListener('error',()=>markPhotoUnavailable(photo,'error'));
    }

    if(img.complete){
      if(img.naturalWidth>0&&img.naturalHeight>0)markPhotoLoaded(photo);
      else markPhotoUnavailable(photo,'error');
    }else{
      markPhotoLoading(photo);
    }
  }

  function auditProductImages(scope=document){
    const photos=[];
    if(scope instanceof Element&&scope.matches(IMAGE_SELECTOR))photos.push(scope);
    scope.querySelectorAll?.(IMAGE_SELECTOR).forEach(photo=>photos.push(photo));
    photos.forEach(bindPhoto);
  }

  function scheduleImageAudit(scope=document){
    if(auditFrame)root.cancelAnimationFrame?.(auditFrame);
    auditFrame=root.requestAnimationFrame?.(()=>{
      auditFrame=0;
      auditProductImages(scope);
    })||0;
    if(!root.requestAnimationFrame)auditProductImages(scope);
  }

  function mobileNavIcon(name,size=22){
    try{
      if(root.CDCIcons?.markup)return root.CDCIcons.markup(name,size);
      if(typeof root.icon==='function')return root.icon(name,size);
    }catch(_error){}
    const paths={
      home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h14v-9.5"/><path d="M9 20v-6h6v6"/>',
      bill:'<path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4"/><path d="M9 11h6M9 15h6"/>',
      market:'<path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6H18a2 2 0 0 0 2-1.6L21 8H7"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
      plan:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
      more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
    };
    return `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.more}</svg>`;
  }

  function routeFromLocation(){
    const value=String(root.location?.hash||'').replace(/^#/,'');
    return value||'dashboard';
  }

  function mobileNavParent(route){
    if(route==='calendar')return 'bills';
    if(route==='goals')return 'planning';
    if(route==='diagnostics'||route==='security')return 'settings';
    return route;
  }

  function canonicalMobileNavMarkup(){
    return PRIMARY_MOBILE_NAV.map(item=>`<button class="nav-btn" type="button" data-mobile="${item.page}" data-v76-primary="1" aria-label="${item.label}">${mobileNavIcon(item.icon)}<span>${item.label}</span></button>`).join('');
  }

  function syncMobileNavigation(){
    const nav=document.querySelector('#mobileNav');
    if(!nav)return;
    const expected=PRIMARY_MOBILE_NAV.map(item=>item.page).join(',');
    let buttons=[...nav.querySelectorAll(':scope > [data-mobile]')];
    const signature=buttons.map(button=>button.dataset.mobile).join(',');
    const canonical=signature===expected&&buttons.length===PRIMARY_MOBILE_NAV.length&&buttons.every(button=>button.dataset.v76Primary==='1');

    if(!canonical){
      nav.innerHTML=canonicalMobileNavMarkup();
      buttons=[...nav.querySelectorAll(':scope > [data-mobile]')];
    }

    /* Compatibilidade: v74 deixa de reescrever o mesmo dock quando encontra
       a assinatura final já instalada por esta autoridade. */
    nav.dataset.v74Nav='1';
    nav.dataset.v76NavAuthority=RUNTIME_REVISION;

    const activeParent=mobileNavParent(routeFromLocation());
    buttons.forEach((button,index)=>{
      const item=PRIMARY_MOBILE_NAV[index];
      if(!item)return;
      const label=button.querySelector('span');
      if(label&&label.textContent!==item.label)label.textContent=item.label;
      button.setAttribute('aria-label',item.label);
      const active=item.page===activeParent;
      button.classList.toggle('active',active);
      if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
    });
  }

  function pruneLegacyDashboardNodes(){
    if(!html.classList.contains('cdc-v75'))return;
    for(const id of LEGACY_DASHBOARD_IDS)document.getElementById(id)?.remove();
  }

  function runRuntimeAudit(){
    runtimeFrame=0;
    syncMobileNavigation();
    pruneLegacyDashboardNodes();
  }

  function scheduleRuntimeAudit(){
    if(runtimeFrame)return;
    runtimeFrame=root.requestAnimationFrame?.(runRuntimeAudit)||0;
    if(!root.requestAnimationFrame)runRuntimeAudit();
  }

  const themeObserver=new MutationObserver(records=>{
    if(records.some(record=>record.type==='attributes'&&record.attributeName==='data-theme'))syncThemeColor();
  });
  themeObserver.observe(html,{attributes:true,attributeFilter:['data-theme']});

  const domObserver=new MutationObserver(records=>{
    let needsAudit=false;
    let needsRuntimeAudit=false;
    for(const record of records){
      if(record.type==='childList'){
        if(record.addedNodes.length)needsAudit=true;
        if(record.addedNodes.length||record.removedNodes.length)needsRuntimeAudit=true;
      }
      if(record.type==='attributes'&&record.target instanceof HTMLImageElement&&record.attributeName==='src'){
        const photo=record.target.closest(IMAGE_SELECTOR);
        if(photo){markPhotoLoading(photo);needsAudit=true;}
      }
    }
    if(needsAudit)scheduleImageAudit(document);
    if(needsRuntimeAudit)scheduleRuntimeAudit();
  });

  function start(){
    syncThemeColor();
    auditProductImages(document);
    runRuntimeAudit();
    if(document.body)domObserver.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
    const nav=document.querySelector('#mobileNav');
    if(nav){
      navObserver=new MutationObserver(scheduleRuntimeAudit);
      navObserver.observe(nav,{childList:true});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  mobileMedia?.addEventListener?.('change',()=>{syncThemeColor();scheduleRuntimeAudit();});
  root.addEventListener('hashchange',scheduleRuntimeAudit,{passive:true});
  root.addEventListener('pageshow',()=>{syncThemeColor();scheduleImageAudit(document);scheduleRuntimeAudit();});
  root.addEventListener('online',()=>scheduleImageAudit(document));

  root.CDCV75Stability=Object.freeze({
    revision:'75-stability1',
    runtimeRevision:RUNTIME_REVISION,
    syncThemeColor,
    auditProductImages,
    syncMobileNavigation,
    pruneLegacyDashboardNodes
  });
})(window);
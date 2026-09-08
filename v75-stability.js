'use strict';

/* Conta de Casa v75 — estabilidade transversal de apresentação.
 * Responsabilidades exclusivas desta camada:
 * - sincronizar a cor do browser/PWA com o tema visível;
 * - marcar estados de carregamento/erro das imagens do Mercado;
 * - reavaliar esses estados após re-renderizações.
 * Não lê nem escreve valores financeiros, IndexedDB, cofre ou sincronização.
 */
(function installV75Stability(root){
  const MOBILE_QUERY='(max-width: 820px)';
  const IMAGE_SELECTOR='.market-product-photo';
  const IMAGE_BOUND='v75ImageBound';
  let auditFrame=0;

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

  function setPhotoSemantics(photo,available){
    if(photo.matches('button,a,[role="button"]'))return;
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

  const themeObserver=new MutationObserver(records=>{
    if(records.some(record=>record.type==='attributes'&&record.attributeName==='data-theme'))syncThemeColor();
  });
  themeObserver.observe(html,{attributes:true,attributeFilter:['data-theme']});

  const domObserver=new MutationObserver(records=>{
    let needsAudit=false;
    for(const record of records){
      if(record.type==='childList'&&record.addedNodes.length){needsAudit=true;break;}
      if(record.type==='attributes'&&record.target instanceof HTMLImageElement&&record.attributeName==='src'){
        const photo=record.target.closest(IMAGE_SELECTOR);
        if(photo){markPhotoLoading(photo);needsAudit=true;break;}
      }
    }
    if(needsAudit)scheduleImageAudit(document);
  });

  function start(){
    syncThemeColor();
    auditProductImages(document);
    if(document.body)domObserver.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  mobileMedia?.addEventListener?.('change',syncThemeColor);
  root.addEventListener('pageshow',()=>{syncThemeColor();scheduleImageAudit(document);});
  root.addEventListener('online',()=>scheduleImageAudit(document));

  root.CDCV75Stability=Object.freeze({
    revision:'75-stability1',
    syncThemeColor,
    auditProductImages
  });
})(window);

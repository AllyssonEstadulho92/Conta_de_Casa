'use strict';

/* Conta de Casa — carregador transversal de assets visuais/media (75-assets1).
 * Opt-in: só inicia carregamentos declarados por data-cdc-* ou pedidos pela API.
 * Não injeta CDNs, não altera CSP e mantém o Mercado no seu loader especializado.
 */
(function installAssetLoader(root){
  const REVISION='75-assets1';
  const IMAGE_SELECTOR='img[data-cdc-asset],img[data-cdc-src]';
  const MEDIA_SELECTOR='video[data-cdc-asset],audio[data-cdc-asset]';
  const LOTTIE_SELECTOR='[data-cdc-lottie-src]';
  const preparedImages=new WeakSet();
  const preparedMedia=new WeakSet();
  const lottieInstances=new WeakMap();
  let intersectionObserver=null;
  let mutationObserver=null;

  const reducedMotion=()=>Boolean(root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);

  function stateTarget(element,explicit){
    if(explicit)return explicit;
    return element?.closest?.('[data-cdc-asset-frame]')||element||null;
  }

  function setState(element,state,detail={}){
    if(!element)return;
    element.dataset.cdcAssetState=state;
    element.classList.remove('is-asset-loading','is-asset-ready','is-asset-error','is-asset-paused');
    if(state==='loading')element.classList.add('is-asset-loading');
    if(state==='ready')element.classList.add('is-asset-ready');
    if(state==='error'||state==='runtime-missing')element.classList.add('is-asset-error');
    if(state==='paused')element.classList.add('is-asset-paused');
    if(typeof root.CustomEvent==='function'&&root.dispatchEvent){
      root.dispatchEvent(new CustomEvent('cdc:asset-state',{detail:{revision:REVISION,state,...detail}}));
    }
  }

  function normalizeUrl(value,{allowExternal=false,allowData=false,allowBlob=false}={}){
    const raw=String(value||'').trim();
    if(!raw)return null;
    let url;
    try{url=new URL(raw,root.location?.href||'http://localhost/');}catch(_error){return null;}
    if(url.protocol==='data:')return allowData?url.href:null;
    if(url.protocol==='blob:')return allowBlob?url.href:null;
    if(!/^https?:$/.test(url.protocol))return null;
    if(!allowExternal&&root.location?.origin&&url.origin!==root.location.origin)return null;
    return url.href;
  }

  function imagePriority(img,requested){
    const value=String(requested||img?.dataset?.cdcPriority||'auto').toLowerCase();
    return value==='high'?'high':value==='low'?'low':'auto';
  }

  function applyImageSource(img,source,{allowExternal=false}={}){
    const safe=normalizeUrl(source,{allowExternal,allowData:true,allowBlob:true});
    if(!safe){
      setState(stateTarget(img),'error',{type:'image',reason:'invalid-url'});
      return false;
    }
    img.src=safe;
    return true;
  }

  function prepareImage(img,options={}){
    if(!img||String(img.tagName||'').toLowerCase()!=='img')return img||null;
    const target=stateTarget(img,options.frame);
    const priority=imagePriority(img,options.priority);
    img.decoding='async';
    if(!img.getAttribute('loading'))img.loading=priority==='high'?'eager':'lazy';
    if('fetchPriority' in img)img.fetchPriority=priority;
    if(!img.getAttribute('referrerpolicy'))img.referrerPolicy=options.referrerPolicy||'no-referrer';

    if(!preparedImages.has(img)){
      preparedImages.add(img);
      img.addEventListener('load',()=>setState(target,'ready',{type:'image',src:img.currentSrc||img.src}),{passive:true});
      img.addEventListener('error',()=>setState(target,'error',{type:'image',src:img.currentSrc||img.src,reason:'load-error'}),{passive:true});
    }

    if(img.complete&&img.naturalWidth>0){
      setState(target,'ready',{type:'image',src:img.currentSrc||img.src});
      return img;
    }

    const deferred=img.dataset.cdcSrc;
    const hasSource=Boolean(img.currentSrc||img.getAttribute('src'));
    if(hasSource){setState(target,'loading',{type:'image'});return img;}
    if(!deferred)return img;

    const start=()=>{
      setState(target,'loading',{type:'image'});
      applyImageSource(img,deferred,{allowExternal:options.allowExternal===true||img.dataset.cdcAllowExternal==='true'});
    };

    if(priority==='high'||!('IntersectionObserver' in root))start();
    else{
      if(!intersectionObserver){
        intersectionObserver=new root.IntersectionObserver(entries=>{
          entries.forEach(entry=>{
            if(!entry.isIntersecting)return;
            intersectionObserver.unobserve(entry.target);
            const node=entry.target;
            setState(stateTarget(node),'loading',{type:'image'});
            applyImageSource(node,node.dataset.cdcSrc,{allowExternal:node.dataset.cdcAllowExternal==='true'});
          });
        },{rootMargin:'240px 0px'});
      }
      intersectionObserver.observe(img);
    }
    return img;
  }

  function prepareMedia(element,options={}){
    const tag=String(element?.tagName||'').toLowerCase();
    if(tag!=='video'&&tag!=='audio')return element||null;
    const target=stateTarget(element,options.frame);
    if(!element.getAttribute('preload'))element.preload=options.preload||'metadata';
    if(!preparedMedia.has(element)){
      preparedMedia.add(element);
      element.addEventListener('loadstart',()=>setState(target,'loading',{type:tag}),{passive:true});
      element.addEventListener('loadeddata',()=>setState(target,'ready',{type:tag}),{passive:true});
      element.addEventListener('canplay',()=>setState(target,'ready',{type:tag}),{passive:true});
      element.addEventListener('error',()=>setState(target,'error',{type:tag,reason:'load-error'}),{passive:true});
    }
    return element;
  }

  function mountLottie(container,options={}){
    if(!container)return null;
    const target=stateTarget(container,options.frame);
    const src=options.src||container.dataset.cdcLottieSrc;
    const safe=normalizeUrl(src,{allowExternal:false});
    if(!safe){setState(target,'error',{type:'lottie',reason:'invalid-or-external-url'});return null;}

    const existing=lottieInstances.get(container);
    if(existing)return existing;

    if(reducedMotion()){
      setState(target,'paused',{type:'lottie',reason:'reduced-motion'});
      const fallback=normalizeUrl(options.fallback||container.dataset.cdcLottieFallback,{allowExternal:false,allowData:true,allowBlob:true});
      if(fallback){
        const image=document.createElement('img');
        image.alt=String(options.alt||container.dataset.cdcAlt||'');
        image.dataset.cdcAsset='lottie-fallback';
        image.src=fallback;
        container.replaceChildren(image);
        prepareImage(image,{priority:options.priority||'auto',frame:target});
      }
      return null;
    }

    const runtime=root.lottie;
    if(!runtime||typeof runtime.loadAnimation!=='function'){
      setState(target,'runtime-missing',{type:'lottie',reason:'local-runtime-not-installed'});
      return null;
    }

    setState(target,'loading',{type:'lottie'});
    let animation;
    try{
      animation=runtime.loadAnimation({
        container,
        renderer:options.renderer||container.dataset.cdcLottieRenderer||'svg',
        loop:options.loop??container.dataset.cdcLottieLoop!=='false',
        autoplay:options.autoplay??container.dataset.cdcLottieAutoplay!=='false',
        path:safe,
        rendererSettings:{progressiveLoad:true,preserveAspectRatio:'xMidYMid meet'}
      });
    }catch(_error){
      setState(target,'error',{type:'lottie',reason:'runtime-error'});
      return null;
    }
    lottieInstances.set(container,animation);
    animation.addEventListener?.('DOMLoaded',()=>setState(target,'ready',{type:'lottie'}));
    animation.addEventListener?.('data_ready',()=>setState(target,'ready',{type:'lottie'}));
    animation.addEventListener?.('data_failed',()=>setState(target,'error',{type:'lottie',reason:'data-failed'}));
    return animation;
  }

  function hydrate(scope){
    const host=scope?.querySelectorAll?scope:document;
    host.querySelectorAll?.(IMAGE_SELECTOR).forEach(img=>prepareImage(img));
    host.querySelectorAll?.(MEDIA_SELECTOR).forEach(media=>prepareMedia(media));
    host.querySelectorAll?.(LOTTIE_SELECTOR).forEach(container=>mountLottie(container));
  }

  function install(){
    hydrate(document);
    if(!document.body||mutationObserver)return;
    mutationObserver=new MutationObserver(mutations=>{
      for(const mutation of mutations){
        for(const node of mutation.addedNodes){
          if(node?.nodeType!==1)continue;
          if(node.matches?.(IMAGE_SELECTOR))prepareImage(node);
          if(node.matches?.(MEDIA_SELECTOR))prepareMedia(node);
          if(node.matches?.(LOTTIE_SELECTOR))mountLottie(node);
          hydrate(node);
        }
      }
    });
    mutationObserver.observe(document.body,{subtree:true,childList:true});
  }

  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
    else install();
  }

  root.CDCAssetLoader=Object.freeze({
    revision:REVISION,
    normalizeUrl,
    prepareImage,
    prepareMedia,
    mountLottie,
    hydrate,
    reducedMotion
  });
})(globalThis);

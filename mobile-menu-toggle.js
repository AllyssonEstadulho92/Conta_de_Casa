'use strict';

/* Conta de Casa v76 — controlador único e estável do menu móvel.
 * O trigger #mobileMenuBtn permanece sempre no header. O drawer usa o
 * #drawerCloseBtn existente como controlo de fecho visível no top-layer.
 * Isto evita mover nós entre o documento e <dialog>, comportamento que podia
 * fazer o hamburger/X desaparecer no Safari/PWA durante a abertura.
 */
(function installAnimatedMobileMenu(root){
  let installed=false;

  function install(){
    if(installed)return;
    const button=document.querySelector('#mobileMenuBtn');
    const drawer=document.querySelector('#mobileDrawer');
    const closeButton=document.querySelector('#drawerCloseBtn');
    const shell=drawer?.querySelector('.nav-drawer-shell');
    if(!button||!drawer||!closeButton||!shell)return;
    installed=true;

    button.classList.add('animated-mobile-menu-toggle');
    closeButton.classList.add('drawer-close-control');

    let iconSentinel=button.querySelector(':scope > svg.ui-icon-svg');
    if(!iconSentinel){
      iconSentinel=document.createElementNS('http://www.w3.org/2000/svg','svg');
      iconSentinel.classList.add('ui-icon-svg');
    }
    iconSentinel.classList.add('mobile-menu-icon-sentinel');
    iconSentinel.hidden=true;
    iconSentinel.setAttribute('aria-hidden','true');
    iconSentinel.setAttribute('focusable','false');

    const glyph=document.createElement('span');
    glyph.className='mobile-menu-glyph';
    glyph.setAttribute('aria-hidden','true');
    button.dataset.uiIconSlot='menu';
    button.replaceChildren(glyph,iconSentinel);

    const closeGlyph=document.createElement('span');
    closeGlyph.className='drawer-close-glyph';
    closeGlyph.setAttribute('aria-hidden','true');
    closeButton.replaceChildren(closeGlyph);
    closeButton.hidden=false;
    closeButton.tabIndex=0;
    closeButton.removeAttribute('aria-hidden');
    closeButton.setAttribute('aria-label','Fechar menu');
    closeButton.title='Fechar menu';

    const drawerCloseFallback=360;
    const swipeEdgeWidth=30;
    const swipeIntentThreshold=9;
    const swipeHorizontalBias=1.08;
    const swipeOpenThreshold=.34;
    const swipeKeepOpenThreshold=.66;
    const swipeFlingVelocity=.45;
    const swipeClickGuardMs=320;

    let closeTimer=0;
    let closeHandler=null;
    let closeReturnValue;
    let touchGesture=null;
    let suppressClicksUntil=0;
    let lastFocusKeyboard=false;

    function prefersReducedMotion(){
      return Boolean(root.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    }

    function mobileEnabled(){
      return root.matchMedia?.('(max-width: 820px)').matches!==false;
    }

    function nowMs(){return root.performance?.now?.()??Date.now();}
    function clamp(value,min,max){return Math.min(max,Math.max(min,value));}

    function findTouch(list,identifier){
      for(let index=0;index<list.length;index+=1){
        if(list[index].identifier===identifier)return list[index];
      }
      return null;
    }

    function measuredDrawerWidth(){
      const measured=shell.getBoundingClientRect?.().width||0;
      if(measured>0)return measured;
      return Math.max(1,Math.min(320,root.innerWidth-72));
    }

    function setButtonState(open){
      const expanded=Boolean(open);
      const state=expanded?'open':'closed';
      button.setAttribute('aria-expanded',String(expanded));
      button.setAttribute('aria-label',expanded?'Menu aberto':'Abrir menu');
      button.title=expanded?'Menu aberto':'Abrir menu';
      button.dataset.menuState=state;
      drawer.dataset.menuState=state;
      closeButton.dataset.menuState=state;
    }

    function setFocusOrigin(keyboard){
      lastFocusKeyboard=Boolean(keyboard);
      button.dataset.focusOrigin=lastFocusKeyboard?'keyboard':'pointer';
    }

    function focusTrigger(){
      requestAnimationFrame(()=>button.focus({preventScroll:true}));
    }

    function focusClose(){
      requestAnimationFrame(()=>closeButton.focus({preventScroll:true}));
    }

    function clearDragVisuals({pin=false}={}){
      if(pin&&drawer.dataset.dragging==='true'){
        const offset=Number.parseFloat(drawer.style.getPropertyValue('--drawer-drag-x'));
        if(Number.isFinite(offset))shell.style.transform=`translate3d(${offset}px,0,0)`;
      }
      delete drawer.dataset.dragging;
      delete drawer.dataset.dragDirection;
      delete drawer.dataset.dragProgress;
      drawer.style.removeProperty('--drawer-drag-x');
      drawer.style.removeProperty('--drawer-drag-alpha');
      drawer.style.removeProperty('--drawer-drag-blur');
      return shell;
    }

    function setDragVisual(offset,progress){
      drawer.style.setProperty('--drawer-drag-x',`${offset.toFixed(2)}px`);
      drawer.style.setProperty('--drawer-drag-alpha',(0.16*progress).toFixed(3));
      drawer.dataset.dragProgress=progress.toFixed(3);
    }

    function releasePinnedTransform(){
      shell.getBoundingClientRect();
      requestAnimationFrame(()=>shell.style.removeProperty('transform'));
    }

    const nativeDrawerClose=drawer.close.bind(drawer);

    function clearCloseWait(){
      if(closeTimer){root.clearTimeout(closeTimer);closeTimer=0;}
      if(closeHandler)shell.removeEventListener('transitionend',closeHandler);
      closeHandler=null;
    }

    function finishDrawerClose(){
      clearCloseWait();
      shell.style.removeProperty('transform');
      clearDragVisuals();
      touchGesture=null;
      drawer.classList.remove('open');
      delete drawer.dataset.closing;
      const value=closeReturnValue;
      closeReturnValue=undefined;
      if(drawer.open){
        if(value===undefined)nativeDrawerClose();
        else nativeDrawerClose(value);
      }
    }

    function animatedDrawerClose(returnValue){
      if(!drawer.open)return;
      if(drawer.dataset.closing==='true'){
        if(returnValue!==undefined)closeReturnValue=returnValue;
        return;
      }
      clearDragVisuals({pin:true});
      drawer.dataset.closing='true';
      closeReturnValue=returnValue;
      setButtonState(false);
      drawer.classList.remove('open');

      if(prefersReducedMotion()||!mobileEnabled()){
        finishDrawerClose();
        return;
      }

      closeHandler=event=>{
        if(event.target===shell&&event.propertyName==='transform')finishDrawerClose();
      };
      shell.addEventListener('transitionend',closeHandler);
      closeTimer=root.setTimeout(finishDrawerClose,drawerCloseFallback);
      releasePinnedTransform();
    }

    drawer.close=animatedDrawerClose;

    function openDrawer(keyboard=false){
      if(drawer.dataset.closing==='true'||drawer.open)return;
      setFocusOrigin(keyboard);
      setButtonState(false);
      drawer.classList.remove('open');
      drawer.showModal();
      shell.getBoundingClientRect();
      requestAnimationFrame(()=>{
        if(!drawer.open||drawer.dataset.closing==='true')return;
        setButtonState(true);
        drawer.classList.add('open');
        focusClose();
      });
    }

    function closeDrawer(keyboard=false){
      if(drawer.dataset.closing==='true'||!drawer.open)return;
      setFocusOrigin(keyboard);
      drawer.close();
    }

    function beginTouchDrag(gesture){
      setFocusOrigin(false);
      if(gesture.mode==='opening'){
        if(!drawer.open){
          setButtonState(false);
          drawer.classList.remove('open');
          drawer.showModal();
        }
        drawer.classList.add('open');
        setButtonState(true);
      }else if(!drawer.open){
        return false;
      }
      drawer.dataset.dragging='true';
      drawer.dataset.dragDirection=gesture.mode;
      gesture.dragging=true;
      gesture.width=measuredDrawerWidth();
      return true;
    }

    function settleTouchDrag(keepOpen){
      clearDragVisuals({pin:true});
      suppressClicksUntil=Date.now()+swipeClickGuardMs;
      touchGesture=null;
      if(keepOpen){
        drawer.classList.add('open');
        setButtonState(true);
        releasePinnedTransform();
        focusClose();
      }else{
        drawer.close();
      }
    }

    function onTouchStart(event){
      if(!mobileEnabled()||prefersReducedMotion()||event.touches.length!==1)return;
      if(drawer.dataset.closing==='true')return;
      const touch=event.touches[0];
      const time=nowMs();

      if(drawer.open){
        if(!shell.contains(event.target))return;
        touchGesture={mode:'closing',identifier:touch.identifier,startX:touch.clientX,startY:touch.clientY,lastX:touch.clientX,lastTime:time,velocity:0,progress:1,width:measuredDrawerWidth(),dragging:false};
        return;
      }

      if(touch.clientX>=root.innerWidth-swipeEdgeWidth){
        touchGesture={mode:'opening',identifier:touch.identifier,startX:touch.clientX,startY:touch.clientY,lastX:touch.clientX,lastTime:time,velocity:0,progress:0,width:0,dragging:false};
      }
    }

    function onTouchMove(event){
      const gesture=touchGesture;
      if(!gesture)return;
      const touch=findTouch(event.touches,gesture.identifier);
      if(!touch)return;

      const dx=touch.clientX-gesture.startX;
      const dy=touch.clientY-gesture.startY;
      const absX=Math.abs(dx);
      const absY=Math.abs(dy);
      if(!gesture.dragging){
        if(absX<swipeIntentThreshold&&absY<swipeIntentThreshold)return;
        if(absX<=absY*swipeHorizontalBias){touchGesture=null;return;}
        if(gesture.mode==='opening'&&dx>=0){touchGesture=null;return;}
        if(gesture.mode==='closing'&&dx<=0){touchGesture=null;return;}
        if(!beginTouchDrag(gesture)){touchGesture=null;return;}
      }

      if(event.cancelable)event.preventDefault();
      const time=nowMs();
      const elapsed=Math.max(1,time-gesture.lastTime);
      gesture.velocity=(touch.clientX-gesture.lastX)/elapsed;
      gesture.lastX=touch.clientX;
      gesture.lastTime=time;
      const width=Math.max(1,gesture.width||measuredDrawerWidth());
      const offset=gesture.mode==='opening'?clamp(width+Math.min(0,dx),0,width):clamp(Math.max(0,dx),0,width);
      const progress=clamp(1-(offset/width),0,1);
      gesture.progress=progress;
      setDragVisual(offset,progress);
    }

    function onTouchEnd(event){
      const gesture=touchGesture;
      if(!gesture)return;
      const touch=findTouch(event.changedTouches,gesture.identifier);
      if(!touch)return;
      if(!gesture.dragging){touchGesture=null;return;}
      if(event.cancelable)event.preventDefault();
      const velocity=(nowMs()-gesture.lastTime)<=120?gesture.velocity:0;
      const keepOpen=gesture.mode==='opening'
        ? (gesture.progress>=swipeOpenThreshold||velocity<=-swipeFlingVelocity)
        : !(gesture.progress<=swipeKeepOpenThreshold||velocity>=swipeFlingVelocity);
      settleTouchDrag(keepOpen);
    }

    function onTouchCancel(){
      const gesture=touchGesture;
      if(!gesture)return;
      if(!gesture.dragging){touchGesture=null;return;}
      settleTouchDrag(gesture.mode==='closing');
    }

    button.addEventListener('pointerdown',()=>setFocusOrigin(false),{passive:true});
    button.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      if(drawer.dataset.closing==='true'||drawer.dataset.dragging==='true')return;
      if(!drawer.open)openDrawer(event.detail===0);
    },true);

    closeButton.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      closeDrawer(event.detail===0);
    },true);

    drawer.addEventListener('cancel',event=>{
      event.preventDefault();
      closeDrawer(true);
    });
    drawer.addEventListener('click',event=>{
      if(event.target===drawer)closeDrawer(false);
    });
    drawer.addEventListener('close',()=>{
      clearCloseWait();
      clearDragVisuals();
      touchGesture=null;
      delete drawer.dataset.closing;
      setButtonState(false);
      if(mobileEnabled())focusTrigger();
    });

    document.addEventListener('touchstart',onTouchStart,{capture:true,passive:true});
    document.addEventListener('touchmove',onTouchMove,{capture:true,passive:false});
    document.addEventListener('touchend',onTouchEnd,{capture:true,passive:false});
    document.addEventListener('touchcancel',onTouchCancel,{capture:true,passive:true});
    document.addEventListener('click',event=>{
      if(Date.now()>=suppressClicksUntil)return;
      event.preventDefault();
      event.stopImmediatePropagation();
    },true);

    setButtonState(drawer.open);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})(window);

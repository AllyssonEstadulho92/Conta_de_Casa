'use strict';

/* Conta de Casa v72 — hambúrguer/X animado, drawer off-canvas e abertura sem salto visual no Safari. */
(function installAnimatedMobileMenu(root){
  let installed=false;

  function install(){
    if(installed)return;
    const button=document.querySelector('#mobileMenuBtn');
    const drawer=document.querySelector('#mobileDrawer');
    const drawerHead=drawer?.querySelector('.drawer-head');
    const legacyClose=document.querySelector('#drawerCloseBtn');
    if(!button||!drawer||!drawerHead)return;
    installed=true;

    const homeAnchor=document.createComment('mobile-menu-toggle-home');
    button.parentNode?.insertBefore(homeAnchor,button);
    let homePlaceholder=null;

    button.classList.add('animated-mobile-menu-toggle');

    // ui-icons.js hidrata #mobileMenuBtn com o SVG Lucide "menu". Mantemos um SVG-sentinela
    // oculto e o mesmo data-ui-icon-slot para que essa hidratação reconheça o controlo como
    // já tratado e não substitua as três linhas animáveis sempre que aria-expanded muda.
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
    glyph.append(document.createElement('span'),document.createElement('span'),document.createElement('span'));
    button.dataset.uiIconSlot='menu';
    button.replaceChildren(glyph,iconSentinel);

    // Mantém o botão histórico no DOM para não quebrar wiring legado, mas remove o X duplicado da interface.
    if(legacyClose){
      legacyClose.hidden=true;
      legacyClose.tabIndex=-1;
      legacyClose.setAttribute('aria-hidden','true');
    }

    const motionDuration=240;
    const motionEase='cubic-bezier(.32,.72,0,1)';
    const drawerCloseFallback=360;

    // Gesto horizontal: começa junto à margem esquerda quando fechado e em qualquer ponto
    // da superfície do drawer quando aberto. Só assume o gesto depois de confirmar intenção
    // horizontal, para não bloquear o scroll vertical dos itens.
    const swipeEdgeWidth=30;
    const swipeIntentThreshold=8;
    const swipeHorizontalBias=1.08;
    const swipeOpenThreshold=.34;
    const swipeKeepOpenThreshold=.66;
    const swipeFlingVelocity=.45;
    const swipeBackdropAlpha=.34;
    const swipeBackdropBlur=1;
    const swipeClickGuardMs=320;

    let motionAnimations=[];
    let motionRun=0;
    let lastFocusKeyboard=false;
    let drawerCloseTimer=0;
    let drawerCloseTarget=null;
    let drawerCloseHandler=null;
    let drawerCloseReturnValue;
    let touchGesture=null;
    let suppressClicksUntil=0;

    function prefersReducedMotion(){
      return Boolean(root.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    }

    function mobileEnabled(){
      return root.matchMedia?.('(max-width: 820px)').matches!==false;
    }

    function nowMs(){
      return root.performance?.now?.()??Date.now();
    }

    function clamp(value,min,max){
      return Math.min(max,Math.max(min,value));
    }

    function findTouch(list,identifier){
      for(let index=0;index<list.length;index+=1){
        if(list[index].identifier===identifier)return list[index];
      }
      return null;
    }

    function drawerShell(){
      return drawer.querySelector('.nav-drawer-shell');
    }

    function measuredDrawerWidth(shell=drawerShell()){
      const measured=shell?.getBoundingClientRect?.().width||0;
      if(measured>0)return measured;
      return Math.max(1,Math.min(364,root.innerWidth-24));
    }

    function cancelMenuMotion(){
      motionRun+=1;
      for(const animation of motionAnimations){
        try{animation.cancel();}catch(_error){}
      }
      motionAnimations=[];
      delete glyph.dataset.motion;
    }

    function animateMenuGlyph(open){
      if(prefersReducedMotion()||typeof glyph.animate!=='function')return;
      cancelMenuMotion();
      const run=motionRun;
      const direction=open?'opening':'closing';
      glyph.dataset.motion=direction;

      const closed=[
        {top:'1px',width:'22px',transform:'translateX(-50%) rotate(0deg) scaleX(1)',opacity:1},
        {top:'8px',width:'18px',transform:'translateX(-50%) rotate(0deg) scaleX(1)',opacity:1},
        {top:'15px',width:'14px',transform:'translateX(-50%) rotate(0deg) scaleX(1)',opacity:1}
      ];
      const opened=[
        {top:'8px',width:'22px',transform:'translateX(-50%) rotate(45deg) scaleX(1)',opacity:1},
        {top:'8px',width:'18px',transform:'translateX(-50%) rotate(0deg) scaleX(.18)',opacity:0},
        {top:'8px',width:'22px',transform:'translateX(-50%) rotate(-45deg) scaleX(1)',opacity:1}
      ];
      const lines=[...glyph.children];
      lines.forEach((line,index)=>{
        const frames=open?[closed[index],opened[index]]:[opened[index],closed[index]];
        motionAnimations.push(line.animate(frames,{duration:motionDuration,easing:motionEase,fill:'none'}));
      });

      const lean=open?-5:5;
      const settle=open?1.5:-1.5;
      const glyphMotion=glyph.animate([
        {transform:`scale(.92) rotate(${lean}deg)`},
        {transform:`scale(1.035) rotate(${settle}deg)`,offset:.68},
        {transform:'scale(1) rotate(0deg)'}
      ],{duration:motionDuration,easing:motionEase,fill:'none'});
      motionAnimations.push(glyphMotion);
      glyphMotion.onfinish=()=>{
        if(run===motionRun)delete glyph.dataset.motion;
      };
    }

    function ensureHomePlaceholder(){
      if(homePlaceholder?.isConnected)return homePlaceholder;
      const placeholder=document.createElement('span');
      placeholder.className='mobile-menu-home-placeholder';
      placeholder.setAttribute('aria-hidden','true');
      if(homeAnchor.parentNode)homeAnchor.parentNode.insertBefore(placeholder,homeAnchor.nextSibling);
      homePlaceholder=placeholder;
      return placeholder;
    }

    function restoreButtonHome(){
      const parent=homeAnchor.parentNode;
      if(parent){
        const reference=homePlaceholder?.parentNode===parent?homePlaceholder:homeAnchor.nextSibling;
        if(button.parentNode!==parent||button.nextSibling!==reference)parent.insertBefore(button,reference);
      }
      homePlaceholder?.remove();
      homePlaceholder=null;
      button.classList.remove('drawer-menu-control');
    }

    function placeButtonInDrawer(){
      if(button.parentNode!==drawerHead){
        ensureHomePlaceholder();
        drawerHead.insertBefore(button,drawerHead.firstChild);
      }
      button.classList.add('drawer-menu-control');
    }

    function setButtonState(open){
      const expanded=Boolean(open);
      const state=expanded?'open':'closed';
      button.setAttribute('aria-expanded',String(expanded));
      button.setAttribute('aria-label',expanded?'Fechar menu':'Abrir menu');
      button.title=expanded?'Fechar menu':'Abrir menu';
      button.dataset.menuState=state;
      drawer.dataset.menuState=state;
    }

    function syncButton(open){
      const expanded=Boolean(open);
      setButtonState(expanded);
      if(expanded)placeButtonInDrawer();
      else restoreButtonHome();
    }

    function setFocusOrigin(keyboard){
      lastFocusKeyboard=Boolean(keyboard);
      button.dataset.focusOrigin=lastFocusKeyboard?'keyboard':'pointer';
    }

    function focusButton(keyboard=lastFocusKeyboard){
      setFocusOrigin(keyboard);
      requestAnimationFrame(()=>button.focus({preventScroll:true}));
    }

    function setDragVisual(offset,progress){
      drawer.style.setProperty('--drawer-drag-x',`${offset.toFixed(2)}px`);
      drawer.style.setProperty('--drawer-drag-alpha',(swipeBackdropAlpha*progress).toFixed(3));
      drawer.style.setProperty('--drawer-drag-blur',`${(swipeBackdropBlur*progress).toFixed(2)}px`);
      drawer.dataset.dragProgress=progress.toFixed(3);
    }

    function clearDragVisuals({pin=false}={}){
      const shell=drawerShell();
      if(pin&&shell&&drawer.dataset.dragging==='true'){
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

    function releasePinnedTransform(shell){
      if(!shell)return;
      // Um frame mantém exatamente a posição alcançada pelo dedo; no seguinte o CSS volta a
      // assumir o transform final e executa apenas o pequeno percurso restante.
      shell.getBoundingClientRect();
      requestAnimationFrame(()=>shell.style.removeProperty('transform'));
    }

    // Abre a superfície ainda no estado visual fechado. O botão é transferido para o dialog
    // antes de showModal(), enquanto um placeholder conserva exatamente o espaço no topbar.
    // Assim o Safari nunca pinta o botão numa posição, remove-o e volta a pintá-lo noutra no
    // mesmo gesto; a primeira imagem visível do dialog já contém o mesmo controlo dentro do drawer.
    function showDrawerClosedSurface(){
      if(drawer.open)return;
      cancelMenuMotion();
      setButtonState(false);
      placeButtonInDrawer();
      drawer.classList.remove('open');
      drawer.showModal();
      drawerShell()?.getBoundingClientRect();
    }

    // O código legado fecha o dialog imediatamente. Intercetamos apenas esta instância para
    // permitir que a superfície termine a transição para a esquerda antes do close nativo.
    const nativeDrawerClose=drawer.close.bind(drawer);

    function clearDrawerCloseWait(){
      if(drawerCloseTimer){
        root.clearTimeout(drawerCloseTimer);
        drawerCloseTimer=0;
      }
      if(drawerCloseTarget&&drawerCloseHandler){
        drawerCloseTarget.removeEventListener('transitionend',drawerCloseHandler);
      }
      drawerCloseTarget=null;
      drawerCloseHandler=null;
    }

    function finishDrawerClose(){
      clearDrawerCloseWait();
      const shell=drawerShell();
      shell?.style.removeProperty('transform');
      clearDragVisuals();
      touchGesture=null;
      if(!drawer.open){
        delete drawer.dataset.closing;
        drawerCloseReturnValue=undefined;
        return;
      }
      drawer.classList.remove('open');
      delete drawer.dataset.closing;
      const returnValue=drawerCloseReturnValue;
      drawerCloseReturnValue=undefined;
      if(returnValue===undefined)nativeDrawerClose();
      else nativeDrawerClose(returnValue);
    }

    function animatedDrawerClose(returnValue){
      if(!drawer.open)return;
      if(drawer.dataset.closing==='true'){
        if(returnValue!==undefined)drawerCloseReturnValue=returnValue;
        return;
      }

      const pinnedShell=clearDragVisuals({pin:true});
      touchGesture=null;
      drawer.dataset.closing='true';
      drawerCloseReturnValue=returnValue;
      setButtonState(false);
      drawer.classList.remove('open');
      requestAnimationFrame(()=>animateMenuGlyph(false));

      const mobile=mobileEnabled();
      if(prefersReducedMotion()||!mobile){
        finishDrawerClose();
        return;
      }

      const shell=pinnedShell||drawerShell();
      if(!shell){
        finishDrawerClose();
        return;
      }

      drawerCloseTarget=shell;
      drawerCloseHandler=event=>{
        if(event.target===shell&&event.propertyName==='transform')finishDrawerClose();
      };
      shell.addEventListener('transitionend',drawerCloseHandler);
      drawerCloseTimer=root.setTimeout(finishDrawerClose,drawerCloseFallback);
      releasePinnedTransform(pinnedShell);
    }

    drawer.close=animatedDrawerClose;

    function openDrawer(keyboard=false){
      if(drawer.dataset.closing==='true')return;
      if(!drawer.open)showDrawerClosedSurface();

      // Separamos a montagem do dialog da mudança de estado visual. O style flush acima cria
      // um estado inicial real; no frame seguinte o painel entra e as mesmas três linhas formam o X.
      requestAnimationFrame(()=>{
        if(!drawer.open||drawer.dataset.closing==='true')return;
        setButtonState(true);
        drawer.classList.add('open');
        animateMenuGlyph(true);
        focusButton(keyboard);
      });
    }

    function closeDrawer(keyboard=false){
      if(drawer.dataset.closing==='true')return;
      setFocusOrigin(keyboard);
      if(typeof root.closeMobileDrawer==='function')root.closeMobileDrawer();
      else if(drawer.open)drawer.close();
      focusButton(keyboard);
    }

    function beginTouchDrag(gesture){
      cancelMenuMotion();
      setFocusOrigin(false);

      if(gesture.mode==='opening'){
        if(!drawer.open)showDrawerClosedSurface();
        // O estado .open representa o destino final; data-dragging sobrepõe o transform enquanto
        // o dedo está no ecrã, por isso o painel acompanha a posição real sem saltar para o fim.
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
      const shell=clearDragVisuals({pin:true});
      suppressClicksUntil=Date.now()+swipeClickGuardMs;
      touchGesture=null;

      if(keepOpen){
        drawer.classList.add('open');
        setButtonState(true);
        releasePinnedTransform(shell);
        focusButton(false);
        return;
      }

      // animatedDrawerClose reutiliza a posição fixa acabada de criar e anima apenas o percurso
      // restante até fora do ecrã, depois fecha realmente o <dialog>.
      drawer.close();
    }

    function onTouchStart(event){
      if(!mobileEnabled()||prefersReducedMotion()||event.touches.length!==1)return;
      if(drawer.dataset.closing==='true')return;
      const touch=event.touches[0];
      const time=nowMs();

      if(drawer.open){
        const shell=drawerShell();
        if(!shell?.contains(event.target))return;
        touchGesture={
          mode:'closing',identifier:touch.identifier,startX:touch.clientX,startY:touch.clientY,
          lastX:touch.clientX,lastTime:time,velocity:0,progress:1,width:measuredDrawerWidth(shell),dragging:false
        };
        return;
      }

      if(touch.clientX<=swipeEdgeWidth){
        touchGesture={
          mode:'opening',identifier:touch.identifier,startX:touch.clientX,startY:touch.clientY,
          lastX:touch.clientX,lastTime:time,velocity:0,progress:0,width:0,dragging:false
        };
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
        if(absX<=absY*swipeHorizontalBias){
          touchGesture=null;
          return;
        }
        if(gesture.mode==='opening'&&dx<=0){touchGesture=null;return;}
        if(gesture.mode==='closing'&&dx>=0){touchGesture=null;return;}
        if(!beginTouchDrag(gesture)){touchGesture=null;return;}
      }

      if(event.cancelable)event.preventDefault();
      const time=nowMs();
      const elapsed=Math.max(1,time-gesture.lastTime);
      gesture.velocity=(touch.clientX-gesture.lastX)/elapsed;
      gesture.lastX=touch.clientX;
      gesture.lastTime=time;

      const width=Math.max(1,gesture.width||measuredDrawerWidth());
      const offset=gesture.mode==='opening'
        ? clamp(-width+Math.max(0,dx),-width,0)
        : clamp(Math.min(0,dx),-width,0);
      const progress=clamp(1+(offset/width),0,1);
      gesture.progress=progress;
      gesture.offset=offset;
      setDragVisual(offset,progress);
    }

    function onTouchEnd(event){
      const gesture=touchGesture;
      if(!gesture)return;
      const touch=findTouch(event.changedTouches,gesture.identifier);
      if(!touch)return;

      if(!gesture.dragging){
        touchGesture=null;
        return;
      }

      if(event.cancelable)event.preventDefault();
      const velocity=(nowMs()-gesture.lastTime)<=120?gesture.velocity:0;
      const keepOpen=gesture.mode==='opening'
        ? (gesture.progress>=swipeOpenThreshold||velocity>=swipeFlingVelocity)
        : !(gesture.progress<=swipeKeepOpenThreshold||velocity<=-swipeFlingVelocity);
      settleTouchDrag(keepOpen);
    }

    function onTouchCancel(){
      const gesture=touchGesture;
      if(!gesture)return;
      if(!gesture.dragging){touchGesture=null;return;}
      // Um cancel do sistema regressa ao estado anterior para não deixar o drawer num ponto intermédio.
      settleTouchDrag(gesture.mode==='closing');
    }

    button.addEventListener('pointerdown',()=>setFocusOrigin(false),{passive:true});
    button.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' ')setFocusOrigin(true);
    });
    button.addEventListener('blur',()=>delete button.dataset.focusOrigin);

    // Regista também a origem de interações dentro do drawer para devolver o foco corretamente
    // quando o utilizador fecha por backdrop, Escape ou escolhe uma opção de navegação.
    drawer.addEventListener('pointerdown',()=>setFocusOrigin(false),{capture:true,passive:true});
    drawer.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '||event.key==='Escape')setFocusOrigin(true);
    },true);

    document.addEventListener('touchstart',onTouchStart,{capture:true,passive:true});
    document.addEventListener('touchmove',onTouchMove,{capture:true,passive:false});
    document.addEventListener('touchend',onTouchEnd,{capture:true,passive:false});
    document.addEventListener('touchcancel',onTouchCancel,{capture:true,passive:true});
    document.addEventListener('click',event=>{
      if(Date.now()>=suppressClicksUntil)return;
      event.preventDefault();
      event.stopImmediatePropagation();
    },true);

    // Captura o gesto do botão antes do listener legado: abrir e fechar passam a usar o mesmo botão.
    button.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      if(drawer.dataset.closing==='true'||drawer.dataset.dragging==='true')return;
      const keyboard=event.detail===0;
      if(drawer.open)closeDrawer(keyboard);
      else openDrawer(keyboard);
    },true);

    drawer.addEventListener('close',()=>{
      clearDrawerCloseWait();
      cancelMenuMotion();
      clearDragVisuals();
      touchGesture=null;
      delete drawer.dataset.closing;
      syncButton(false);
      const stillMobile=mobileEnabled();
      if(stillMobile)focusButton(lastFocusKeyboard);
    });
    syncButton(drawer.open);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})(window);
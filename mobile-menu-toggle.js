'use strict';

/* Conta de Casa v71 — o mesmo controlo móvel anima hambúrguer <-> X e mantém o drawer aberto até terminar a saída off-canvas. */
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
    const motionEase='cubic-bezier(.22,.8,.2,1)';
    const drawerCloseFallback=360;
    let motionAnimations=[];
    let motionRun=0;
    let lastFocusKeyboard=false;
    let drawerCloseTimer=0;
    let drawerCloseTarget=null;
    let drawerCloseHandler=null;
    let drawerCloseReturnValue;

    function prefersReducedMotion(){
      return Boolean(root.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
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

    function restoreButtonHome(){
      if(homeAnchor.parentNode&&button.parentNode!==homeAnchor.parentNode){
        homeAnchor.parentNode.insertBefore(button,homeAnchor.nextSibling);
      }
      button.classList.remove('drawer-menu-control');
    }

    function placeButtonInDrawer(){
      if(button.parentNode!==drawerHead)drawerHead.insertBefore(button,drawerHead.firstChild);
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

      drawer.dataset.closing='true';
      drawerCloseReturnValue=returnValue;
      setButtonState(false);
      drawer.classList.remove('open');
      requestAnimationFrame(()=>animateMenuGlyph(false));

      const mobile=root.matchMedia?.('(max-width: 820px)').matches!==false;
      if(prefersReducedMotion()||!mobile){
        finishDrawerClose();
        return;
      }

      const shell=drawer.querySelector('.nav-drawer-shell');
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
    }

    drawer.close=animatedDrawerClose;

    function openDrawer(keyboard=false){
      if(drawer.dataset.closing==='true')return;
      if(typeof root.openMobileDrawer==='function')root.openMobileDrawer();
      else if(!drawer.open){drawer.showModal();requestAnimationFrame(()=>drawer.classList.add('open'));}
      syncButton(drawer.open);
      // O botão é movido para dentro do <dialog>. CSS transitions do glifo podem ser consumidas
      // pelo reparenting no Safari; os keyframes explícitos garantem o movimento visível.
      requestAnimationFrame(()=>animateMenuGlyph(true));
      focusButton(keyboard);
    }

    function closeDrawer(keyboard=false){
      if(drawer.dataset.closing==='true')return;
      setFocusOrigin(keyboard);
      if(typeof root.closeMobileDrawer==='function')root.closeMobileDrawer();
      else if(drawer.open)drawer.close();
      // O botão permanece no cabeçalho do drawer durante a saída. animatedDrawerClose muda o
      // estado para hambúrguer e só o evento close o devolve ao topbar, evitando salto de layout.
      focusButton(keyboard);
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

    // Captura o gesto antes do listener legado: abrir e fechar passam a usar o mesmo botão.
    button.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      if(drawer.dataset.closing==='true')return;
      const keyboard=event.detail===0;
      if(drawer.open)closeDrawer(keyboard);
      else openDrawer(keyboard);
    },true);

    drawer.addEventListener('close',()=>{
      clearDrawerCloseWait();
      cancelMenuMotion();
      delete drawer.dataset.closing;
      syncButton(false);
      const stillMobile=root.matchMedia?.('(max-width: 820px)').matches!==false;
      if(stillMobile)focusButton(lastFocusKeyboard);
    });
    syncButton(drawer.open);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})(window);

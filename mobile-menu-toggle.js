'use strict';

/* Conta de Casa v69 — o mesmo controlo móvel alterna hambúrguer <-> X sem ser sobrescrito pelo hidratador Lucide. */
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

    function syncButton(open){
      const expanded=Boolean(open);
      const state=expanded?'open':'closed';
      button.setAttribute('aria-expanded',String(expanded));
      button.setAttribute('aria-label',expanded?'Fechar menu':'Abrir menu');
      button.title=expanded?'Fechar menu':'Abrir menu';
      button.dataset.menuState=state;
      drawer.dataset.menuState=state;
      if(expanded)placeButtonInDrawer();
      else restoreButtonHome();
    }

    function setFocusOrigin(keyboard){
      button.dataset.focusOrigin=keyboard?'keyboard':'pointer';
    }

    function focusButton(keyboard){
      setFocusOrigin(keyboard);
      requestAnimationFrame(()=>button.focus({preventScroll:true}));
    }

    function openDrawer(keyboard=false){
      if(typeof root.openMobileDrawer==='function')root.openMobileDrawer();
      else if(!drawer.open){drawer.showModal();drawer.classList.add('open');}
      syncButton(drawer.open);
      focusButton(keyboard);
    }

    function closeDrawer(keyboard=false){
      // Define primeiro a origem para neutralizar apenas o anel de foco programático após toque/rato.
      // A ativação por teclado continua a expor :focus-visible normalmente.
      setFocusOrigin(keyboard);
      if(typeof root.closeMobileDrawer==='function')root.closeMobileDrawer();
      else if(drawer.open){drawer.classList.remove('open');drawer.close();}
      syncButton(false);
      focusButton(keyboard);
    }

    button.addEventListener('pointerdown',()=>setFocusOrigin(false),{passive:true});
    button.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' ')setFocusOrigin(true);
    });
    button.addEventListener('blur',()=>delete button.dataset.focusOrigin);

    // Captura o gesto antes do listener legado: abrir e fechar passam a usar o mesmo botão.
    button.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      const keyboard=event.detail===0;
      if(drawer.open)closeDrawer(keyboard);
      else openDrawer(keyboard);
    },true);

    drawer.addEventListener('close',()=>syncButton(false));
    syncButton(drawer.open);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})(window);

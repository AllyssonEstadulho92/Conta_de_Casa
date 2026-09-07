'use strict';

/* Conta de Casa v68 — o mesmo controlo móvel alterna hambúrguer <-> X e acompanha o drawer. */
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
    button.innerHTML='<span class="mobile-menu-glyph" aria-hidden="true"><span></span><span></span><span></span></span>';

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

    function openDrawer(){
      if(typeof root.openMobileDrawer==='function')root.openMobileDrawer();
      else if(!drawer.open){drawer.showModal();drawer.classList.add('open');}
      syncButton(drawer.open);
      requestAnimationFrame(()=>button.focus({preventScroll:true}));
    }

    function closeDrawer(){
      if(typeof root.closeMobileDrawer==='function')root.closeMobileDrawer();
      else if(drawer.open){drawer.classList.remove('open');drawer.close();}
      syncButton(false);
      requestAnimationFrame(()=>button.focus({preventScroll:true}));
    }

    // Captura o gesto antes do listener legado: abrir e fechar passam a usar o mesmo botão.
    button.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      if(drawer.open)closeDrawer();
      else openDrawer();
    },true);

    drawer.addEventListener('close',()=>syncButton(false));
    syncButton(drawer.open);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})(window);

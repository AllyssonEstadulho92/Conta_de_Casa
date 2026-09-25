'use strict';

/* Conta de Casa v76 — guarda visual da transição PIN -> aplicação (76-auth-canonical2).
 * A abertura local-first pertence agora ao enterApp canónico em events.js.
 * Esta camada mantém apenas o contrato visual de exclusividade entre cofre e shell,
 * incluindo pageshow/Safari/PWA, sem substituir enterApp nem syncStartupGate.
 * Não altera cifra, estado financeiro, IndexedDB nem política de sincronização.
 */
(function installV75StartupGuard(root){
  const REVISION='76-auth-canonical2';
  let observer=null;

  function elements(){
    return {
      html:document.documentElement,
      vault:document.querySelector('#vaultScreen'),
      app:document.querySelector('#app')
    };
  }

  function syncAuthVisibility(){
    const {html,vault,app}=elements();
    if(!vault||!app)return;
    const appActive=html.classList.contains('app-active');

    if(!appActive){
      if(!app.hidden)app.hidden=true;
      if(vault.hidden)vault.hidden=false;
      return;
    }

    if(!app.hidden&&!vault.hidden)vault.hidden=true;
  }

  function start(){
    syncAuthVisibility();
    const {html,vault,app}=elements();
    if(!vault||!app)return;
    observer?.disconnect?.();
    observer=new MutationObserver(syncAuthVisibility);
    observer.observe(html,{attributes:true,attributeFilter:['class']});
    observer.observe(vault,{attributes:true,attributeFilter:['hidden']});
    observer.observe(app,{attributes:true,attributeFilter:['hidden']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  root.addEventListener('pageshow',syncAuthVisibility,{passive:true});
  root.CDCV75StartupGuard=Object.freeze({revision:REVISION,sync:syncAuthVisibility});
})(window);

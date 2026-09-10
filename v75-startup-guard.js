'use strict';

/* Conta de Casa v75 — guarda visual de arranque para Safari/PWA.
 * Mantém um estado seguro e visível quando o fluxo de desbloqueio está a aguardar
 * a barreira inicial de sincronização. Não lê/escreve dados financeiros, cofre ou sync.
 */
(function installV75StartupGuard(root){
  const REVISION='75-startup1';
  let observer=null;
  let active=false;
  let messageSnapshot=null;

  function elements(){
    return {
      html:document.documentElement,
      vault:document.querySelector('#vaultScreen'),
      app:document.querySelector('#app'),
      message:document.querySelector('#vaultMessage')
    };
  }

  function restoreMessage(message){
    if(!message||!messageSnapshot)return;
    message.textContent=messageSnapshot.text;
    message.className=messageSnapshot.className;
    messageSnapshot=null;
  }

  function showSafeStartup(vault,message){
    if(active)return;
    active=true;
    if(message)messageSnapshot={text:message.textContent,className:message.className};
    vault.hidden=false;
    vault.dataset.v75StartupGuard='true';
    vault.setAttribute('aria-busy','true');
    if(message){
      message.textContent='A preparar a aplicação com segurança…';
      message.className='form-message';
    }
  }

  function finishSafeStartup(vault,message,{keepVault=false}={}){
    if(!active)return;
    vault.removeAttribute('aria-busy');
    delete vault.dataset.v75StartupGuard;
    if(!keepVault)vault.hidden=true;
    restoreMessage(message);
    active=false;
  }

  function syncStartupVisibility(){
    const {html,vault,app,message}=elements();
    if(!vault||!app)return;
    const appActive=html.classList.contains('app-active');

    if(appActive&&vault.hidden&&app.hidden){
      showSafeStartup(vault,message);
      return;
    }

    if(active&&!app.hidden){
      finishSafeStartup(vault,message);
      return;
    }

    if(active&&!appActive){
      finishSafeStartup(vault,message,{keepVault:true});
    }
  }

  function start(){
    const {html,vault,app}=elements();
    if(!vault||!app)return;
    syncStartupVisibility();
    observer=new MutationObserver(syncStartupVisibility);
    observer.observe(html,{attributes:true,attributeFilter:['class']});
    observer.observe(vault,{attributes:true,attributeFilter:['hidden']});
    observer.observe(app,{attributes:true,attributeFilter:['hidden']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  root.addEventListener('pageshow',syncStartupVisibility);
  root.CDCV75StartupGuard=Object.freeze({revision:REVISION,sync:syncStartupVisibility});
})(window);

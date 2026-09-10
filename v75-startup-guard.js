'use strict';

/* Conta de Casa v75 — guarda de arranque Safari/PWA (75-startup2).
 * Mantém um estado seguro e visível durante a abertura e evita que um dispositivo
 * já emparelhado espere pela rede antes de mostrar a cópia local cifrada confirmada.
 * A sincronização remota continua imediatamente em segundo plano. Não altera o
 * cofre, os dados financeiros nem a política de conflitos.
 */
(function installV75StartupGuard(root){
  const REVISION='75-startup2';
  let observer=null;
  let active=false;
  let messageSnapshot=null;
  let fastGateInstalled=false;

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

  function installFastPairedSyncGate(){
    if(fastGateInstalled||typeof syncStartupGate!=='function')return;
    fastGateInstalled=true;
    const originalGate=syncStartupGate;

    syncStartupGate=async function fastPairedStartupGate(){
      try{
        if(typeof appState==='undefined'||typeof vaultKey==='undefined'||!appState||!vaultKey)return originalGate();
        if(typeof syncConfig!=='function'||typeof syncDeviceMeta!=='function'||typeof loadSyncToken!=='function'||typeof syncNow!=='function')return originalGate();
        const cfg=syncConfig();
        if(!cfg?.enabled||typeof navigator==='undefined'||navigator.onLine===false)return originalGate();
        const meta=await syncDeviceMeta().catch(()=>null);
        const paired=Boolean(meta?.pairedAt&&meta?.lastRemoteSha);
        if(!paired)return originalGate();
        const token=await loadSyncToken().catch(()=>null);
        if(!token)return originalGate();

        if(typeof syncSetStatus==='function'){
          syncSetStatus('syncing','A abrir a última cópia cifrada confirmada. A sincronização remota continua em segundo plano.');
        }
        root.setTimeout(()=>{void syncNow('startup-background');},0);
        /* Valor já reconhecido pelo shell como uma cópia local confirmada e segura. */
        return 'offline-paired';
      }catch(_error){
        return originalGate();
      }
    };
  }

  function start(){
    const {html,vault,app}=elements();
    installFastPairedSyncGate();
    if(!vault||!app)return;
    syncStartupVisibility();
    observer=new MutationObserver(syncStartupVisibility);
    observer.observe(html,{attributes:true,attributeFilter:['class']});
    observer.observe(vault,{attributes:true,attributeFilter:['hidden']});
    observer.observe(app,{attributes:true,attributeFilter:['hidden']});
  }

  installFastPairedSyncGate();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  root.addEventListener('pageshow',syncStartupVisibility);
  root.CDCV75StartupGuard=Object.freeze({revision:REVISION,sync:syncStartupVisibility});
})(window);

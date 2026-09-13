'use strict';

/* Conta de Casa v76 — transição segura PIN -> aplicação (76-auth-transition1).
 * O cofre local é a autoridade de desbloqueio. A sincronização GitHub é opcional
 * e nunca pode impedir a abertura do Dashboard depois de um PIN válido.
 *
 * Esta camada também impede que o shell autenticado (incluindo o dock móvel)
 * apareça por cima do ecrã do PIN durante a transição Safari/PWA.
 * Não altera cifra, estado financeiro, IndexedDB nem política de conflitos.
 */
(function installV75StartupGuard(root){
  const REVISION='76-auth-transition1';
  let observer=null;
  let fastGateInstalled=false;
  let enterPatchInstalled=false;

  function elements(){
    return {
      html:document.documentElement,
      vault:document.querySelector('#vaultScreen'),
      app:document.querySelector('#app')
    };
  }

  /* Estado de autenticação exclusivo: ou cofre, ou aplicação. Nunca os dois. */
  function syncAuthVisibility(){
    const {html,vault,app}=elements();
    if(!vault||!app)return;
    const appActive=html.classList.contains('app-active');

    if(!appActive){
      if(!app.hidden)app.hidden=true;
      if(vault.hidden)vault.hidden=false;
      return;
    }

    /* Durante a abertura pode existir um microtask com app ainda hidden.
       Quando o shell fica visível, o cofre tem obrigatoriamente de desaparecer. */
    if(!app.hidden&&!vault.hidden)vault.hidden=true;
  }

  /* Preserva a otimização existente para dispositivos já emparelhados. */
  function installFastPairedSyncGate(){
    if(fastGateInstalled||typeof root.syncStartupGate!=='function')return;
    fastGateInstalled=true;
    const originalGate=root.syncStartupGate;

    root.syncStartupGate=async function fastPairedStartupGate(){
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
        return 'offline-paired';
      }catch(_error){
        return originalGate();
      }
    };
  }

  /* O enterApp histórico aguardava syncStartupGate antes de mostrar a aplicação e,
     para estados not-configured/needs-token/error, redirecionava para Segurança.
     Isso contradiz o modelo local-first e provocava a situação observada no iPhone:
     PIN válido + cofre ainda visível + dock da aplicação por cima.

     A correção mantém enterApp como implementação canónica, mas substitui apenas
     o gate durante a transição por um resultado imediato. Depois de o Dashboard
     estar visível, o gate real é executado em background e continua a atualizar
     o estado de sincronização normalmente. */
  function installNonBlockingEnterApp(){
    if(enterPatchInstalled||typeof root.enterApp!=='function')return;
    enterPatchInstalled=true;
    const originalEnterApp=root.enterApp;

    root.enterApp=async function enterAppLocalFirst(){
      const realGate=typeof root.syncStartupGate==='function'?root.syncStartupGate:null;
      if(realGate)root.syncStartupGate=async()=> 'synced';

      try{
        await originalEnterApp();
      }catch(error){
        const {html,vault,app}=elements();
        html?.classList.remove('app-active');
        if(app)app.hidden=true;
        if(vault)vault.hidden=false;
        throw error;
      }finally{
        if(realGate)root.syncStartupGate=realGate;
      }

      /* Um desbloqueio concluído entra sempre pela página principal. */
      try{if(typeof root.showPage==='function')root.showPage('dashboard');}catch(_error){}
      syncAuthVisibility();

      /* Sync opcional não bloqueia a UI local já autenticada. */
      if(realGate){
        root.setTimeout(()=>{void Promise.resolve(realGate()).catch(()=>undefined);},0);
      }
    };
  }

  function start(){
    installFastPairedSyncGate();
    installNonBlockingEnterApp();
    syncAuthVisibility();

    const {html,vault,app}=elements();
    if(!vault||!app)return;
    observer=new MutationObserver(syncAuthVisibility);
    observer.observe(html,{attributes:true,attributeFilter:['class']});
    observer.observe(vault,{attributes:true,attributeFilter:['hidden']});
    observer.observe(app,{attributes:true,attributeFilter:['hidden']});
  }

  installFastPairedSyncGate();
  installNonBlockingEnterApp();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  root.addEventListener('pageshow',syncAuthVisibility);
  root.CDCV75StartupGuard=Object.freeze({revision:REVISION,sync:syncAuthVisibility});
})(window);

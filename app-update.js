'use strict';

/*
 * Conta de Casa — Centro de Atualização de Software (v58)
 *
 * Esta camada não altera dados financeiros nem o cofre. O estado de atualização
 * é obtido exclusivamente do Service Worker same-origin distribuído por GitHub Pages.
 *
 * Regra de manutenção: cada release pública deve acrescentar as alterações relevantes
 * a APP_RELEASE_NOTES para que o utilizador as encontre em “Mais detalhes”.
 */
(function installSoftwareUpdateCenter(root){
  const APP_RELEASE_NOTES=Object.freeze([
    Object.freeze({
      version:'v58',
      date:'5 de setembro de 2026',
      title:'Centro de Atualização de Software',
      items:Object.freeze([
        'Novo ecrã de atualização inspirado na hierarquia visual do iPhone.',
        'Verificação manual da versão pública através do Service Worker da própria aplicação.',
        'Atualizações automáticas continuam ativas no canal estável distribuído por GitHub Pages.',
        'Canal beta permanece desativado enquanto não existir uma pipeline beta separada e auditada.',
        'As alterações de cada versão passam a ficar centralizadas em “Mais detalhes”.'
      ])
    })
  ]);

  let updateDialog=null;
  let updateStatus='ready';
  let updateMessage='';
  let detailsOpen=false;
  let checkInFlight=null;

  const buildVersion=()=>document.querySelector('meta[name="app-build"]')?.content?.trim()||APP_RELEASE_NOTES[0].version;
  const icon=(name,size=22)=>root.CDCIcons?.markup?.(name,size)||fallbackIcon(name,size);
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function fallbackIcon(name,size){
    const path=name==='circleCheck'
      ? '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.2 2.2 4.8-5"/>'
      : name==='refresh'
        ? '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>'
        : name==='chevron'
          ? '<path d="m9 18 6-6-6-6"/>'
          : name==='back'
            ? '<path d="m15 18-6-6 6-6"/>'
            : '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v5"/>';
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  }

  function releaseNotesHtml(){
    return APP_RELEASE_NOTES.map(release=>`<article class="software-update-release">
      <div class="software-update-release-head"><div><strong>${escapeHtml(release.version)}</strong><span>${escapeHtml(release.title)}</span></div><small>${escapeHtml(release.date)}</small></div>
      <ul>${release.items.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul>
    </article>`).join('');
  }

  function statusCopy(){
    if(updateStatus==='checking') return {title:'A verificar atualizações…',subtitle:'A consultar a versão pública do Conta de Casa.',icon:'refresh',tone:'checking'};
    if(updateStatus==='updating') return {title:'Atualização encontrada',subtitle:'A nova versão está a ser preparada. A aplicação reinicia automaticamente quando estiver pronta.',icon:'refresh',tone:'checking'};
    if(updateStatus==='error') return {title:'Não foi possível verificar agora',subtitle:updateMessage||'Confirme a ligação à Internet e tente novamente.',icon:'info',tone:'warning'};
    if(updateStatus==='unsupported') return {title:'Atualização automática indisponível',subtitle:'Este navegador não disponibiliza Service Worker. Pode continuar a usar a aplicação online.',icon:'info',tone:'warning'};
    return {title:'O Conta de Casa está atualizado',subtitle:buildVersion(),icon:'circleCheck',tone:'ok'};
  }

  function dialogHtml(){
    const status=statusCopy();
    return `<div class="software-update-shell">
      <header class="software-update-header">
        <button class="software-update-back" type="button" data-software-update-close aria-label="Voltar">${icon('back',26)}</button>
        <h2>Atualização de Software</h2>
        <span class="software-update-header-spacer" aria-hidden="true"></span>
      </header>

      <div class="software-update-options" role="group" aria-label="Opções de atualização">
        <button class="software-update-row" type="button" data-update-explain="automatic">
          <span>Atualizações Automáticas</span><span class="software-update-row-value">Ativado ${icon('chevron',18)}</span>
        </button>
        <button class="software-update-row" type="button" data-update-explain="beta">
          <span>Atualizações Beta</span><span class="software-update-row-value muted">Desativado ${icon('chevron',18)}</span>
        </button>
      </div>

      <section class="software-update-status ${status.tone}" aria-live="polite">
        <span class="software-update-status-icon" aria-hidden="true">${icon(status.icon,48)}</span>
        <h3>${escapeHtml(status.title)}</h3>
        <p>${escapeHtml(status.subtitle)}</p>
        <button class="software-update-details-link" type="button" data-update-details aria-expanded="${detailsOpen}">${detailsOpen?'Ocultar detalhes':'Mais detalhes'}</button>
      </section>

      <section class="software-update-details" ${detailsOpen?'':'hidden'}>
        <div class="software-update-details-head"><div><strong>Novidades</strong><span>Alterações registadas nesta versão</span></div><span class="software-update-version-chip">${escapeHtml(buildVersion())}</span></div>
        ${releaseNotesHtml()}
      </section>

      <div class="software-update-actions">
        <button class="btn primary software-update-check" type="button" data-update-check ${checkInFlight?'disabled':''}>${icon('refresh',19)}<span>${updateStatus==='checking'||updateStatus==='updating'?'A verificar…':'Verificar atualizações'}</span></button>
        <small>A verificação usa apenas recursos da própria aplicação e não envia dados do cofre.</small>
      </div>
    </div>`;
  }

  function renderDialog(){
    if(!updateDialog)return;
    updateDialog.innerHTML=dialogHtml();
  }

  function ensureDialog(){
    if(updateDialog?.isConnected)return updateDialog;
    updateDialog=document.createElement('dialog');
    updateDialog.className='software-update-dialog';
    updateDialog.setAttribute('aria-label','Atualização de Software');
    updateDialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog();});
    updateDialog.addEventListener('click',event=>{
      if(event.target===updateDialog){closeDialog();return;}
      if(event.target.closest('[data-software-update-close]')){closeDialog();return;}
      if(event.target.closest('[data-update-details]')){
        detailsOpen=!detailsOpen;
        renderDialog();
        return;
      }
      const explanation=event.target.closest('[data-update-explain]')?.dataset.updateExplain;
      if(explanation==='automatic'){
        root.toast?.('As novas versões são verificadas quando a aplicação abre.');
        return;
      }
      if(explanation==='beta'){
        root.toast?.('O canal beta ainda não está configurado. A aplicação usa apenas versões estáveis.');
        return;
      }
      if(event.target.closest('[data-update-check]')) checkForUpdates();
    });
    document.body.appendChild(updateDialog);
    renderDialog();
    return updateDialog;
  }

  function openDialog(){
    const dialog=ensureDialog();
    if(dialog.open)return;
    updateStatus='ready';
    updateMessage='';
    renderDialog();
    dialog.showModal();
    requestAnimationFrame(()=>dialog.querySelector('[data-software-update-close]')?.focus({preventScroll:true}));
  }

  function closeDialog(){
    if(!updateDialog?.open)return;
    updateDialog.close();
    document.querySelector('[data-open-software-update]')?.focus({preventScroll:true});
  }

  function ensureSettingsLauncher(){
    const panel=document.querySelector('#page-settings article.panel.narrow');
    if(!panel||panel.querySelector('[data-open-software-update]'))return;
    const resetButton=panel.querySelector('#resetDataBtn');
    const block=document.createElement('section');
    block.className='settings-software-update-block';
    block.setAttribute('aria-label','Atualização da aplicação');
    block.innerHTML=`<button class="settings-software-update-row" type="button" data-open-software-update>
      <span class="settings-software-update-icon" aria-hidden="true">${icon('refresh',22)}</span>
      <span class="settings-software-update-copy"><strong>Atualização de Software</strong><small>Versão ${escapeHtml(buildVersion())} · atualizações automáticas</small></span>
      <span class="settings-software-update-chevron" aria-hidden="true">${icon('chevron',20)}</span>
    </button>`;
    panel.insertBefore(block,resetButton?.previousElementSibling||resetButton||null);
    block.querySelector('[data-open-software-update]')?.addEventListener('click',openDialog);
  }

  function waitForInstalling(registration,timeoutMs=4500){
    return new Promise(resolve=>{
      const worker=registration.installing;
      if(!worker){resolve();return;}
      let done=false;
      const finish=()=>{if(done)return;done=true;clearTimeout(timer);worker.removeEventListener?.('statechange',onState);resolve();};
      const onState=()=>{if(['installed','activated','redundant'].includes(worker.state))finish();};
      const timer=setTimeout(finish,timeoutMs);
      worker.addEventListener('statechange',onState);
      onState();
    });
  }

  async function checkForUpdates(){
    if(checkInFlight)return checkInFlight;
    checkInFlight=(async()=>{
      if(!('serviceWorker' in navigator)){
        updateStatus='unsupported';
        renderDialog();
        return;
      }
      updateStatus='checking';
      updateMessage='';
      renderDialog();
      try{
        let registration=await navigator.serviceWorker.getRegistration();
        if(!registration){
          registration=await navigator.serviceWorker.register('./sw.js?v=58',{updateViaCache:'none'});
        }
        let updateFound=false;
        const onUpdateFound=()=>{updateFound=true;updateStatus='updating';renderDialog();};
        registration.addEventListener('updatefound',onUpdateFound,{once:true});
        await registration.update();
        if(registration.installing)await waitForInstalling(registration);
        if(registration.waiting||updateFound){
          updateStatus='updating';
          renderDialog();
          if(registration.waiting) registration.waiting.postMessage({type:'SKIP_WAITING'});
          return;
        }
        updateStatus='ready';
        updateMessage='';
        renderDialog();
        root.toast?.('Não existem atualizações novas.');
      }catch(_error){
        updateStatus='error';
        updateMessage='Não foi possível contactar a versão pública neste momento.';
        renderDialog();
      }
    })().finally(()=>{checkInFlight=null;renderDialog();});
    return checkInFlight;
  }

  function install(){
    ensureSettingsLauncher();
    const observer=new MutationObserver(()=>ensureSettingsLauncher());
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  root.CDCAppUpdates=Object.freeze({
    open:openDialog,
    check:checkForUpdates,
    releases:APP_RELEASE_NOTES,
    version:buildVersion
  });
})(window);

'use strict';

/*
 * Conta de Casa — Versão e Atualizações (v76 version-audit1)
 *
 * Política:
 * - a versão da aplicação vem do package.json e é injetada no HTML publicado;
 * - a release pública continua identificada por app-build/release-manifest.json;
 * - o build exato é identificado pelo SHA curto e data de compilação;
 * - a verificação manual consulta sempre o Service Worker antes de declarar que está atualizado;
 * - instalar uma atualização exige ação explícita do utilizador;
 * - dados financeiros, cofre, PIN e IndexedDB não são modificados por esta camada.
 */
(function installSoftwareUpdateCenter(root){
  const FALLBACK_RELEASE_NOTES=Object.freeze([
    Object.freeze({
      version:'v75',
      date:'10 de setembro de 2026',
      title:'Estabilidade, páginas e experiência móvel',
      items:Object.freeze([
        'Revisão transversal de estabilidade e geometria da aplicação.',
        'Início, Despesas, Planeamento e Mercado receberam refinamentos de apresentação.',
        'O cofre, os cálculos financeiros e a sincronização cifrada permanecem isolados do sistema de atualização.'
      ])
    }),
    Object.freeze({
      version:'v74',
      date:'9 de setembro de 2026',
      title:'Experiência e navegação refinadas',
      items:Object.freeze(['Revisão da experiência, navegação e apresentação sem alterar o domínio financeiro.'])
    }),
    Object.freeze({
      version:'v63',
      date:'6 de setembro de 2026',
      title:'Centro de Atualização de Software',
      items:Object.freeze(['Foi introduzido o histórico público de versões e o fluxo de atualização controlada.'])
    })
  ]);

  let updateDialog=null;
  let updateStatus='ready';
  let updateMessage='';
  let detailsOpen=false;
  let actionInFlight=null;
  let manifestInFlight=null;
  let availableVersion='';
  let releaseManifest={latestVersion:FALLBACK_RELEASE_NOTES[0].version,releases:FALLBACK_RELEASE_NOTES};
  let reloadAfterUpdate=false;

  const metaValue=name=>document.querySelector(`meta[name="${name}"]`)?.content?.trim()||'';
  const buildVersion=()=>metaValue('app-build')||FALLBACK_RELEASE_NOTES[0].version;
  const appVersion=()=>metaValue('app-version')||buildVersion();
  const buildId=()=>metaValue('app-build-id')||'local';
  const buildDate=()=>metaValue('app-build-date');
  const icon=(name,size=22)=>root.CDCIcons?.markup?.(name,size)||fallbackIcon(name,size);
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const versionNumber=value=>{
    const match=/^v(\d+)$/.exec(String(value||'').trim());
    return match?Number(match[1]):-1;
  };
  const isNewerVersion=(candidate,current=buildVersion())=>versionNumber(candidate)>versionNumber(current);

  function isStandaloneMode(){
    const displayStandalone=typeof matchMedia==='function'&&matchMedia('(display-mode: standalone)').matches;
    return displayStandalone||navigator.standalone===true;
  }

  function formatBuildDate(){
    const raw=buildDate();
    if(!raw)return 'data de compilação indisponível';
    const date=new Date(raw);
    if(Number.isNaN(date.getTime()))return 'data de compilação indisponível';
    try{
      return new Intl.DateTimeFormat('pt-PT',{dateStyle:'medium',timeStyle:'short'}).format(date);
    }catch(_error){
      return date.toISOString().replace('T',' ').slice(0,16)+' UTC';
    }
  }

  function fallbackIcon(name,size){
    const path=name==='circleCheck'
      ? '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.2 2.2 4.8-5"/>'
      : name==='refresh'
        ? '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>'
        : name==='download'
          ? '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>'
          : name==='chevron'
            ? '<path d="m9 18 6-6-6-6"/>'
            : name==='back'
              ? '<path d="m15 18-6-6 6-6"/>'
              : '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v5"/>';
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  }

  function validRelease(release){
    return release&&/^v\d+$/.test(String(release.version||''))&&String(release.title||'').trim()&&Array.isArray(release.items);
  }

  function normalizeManifest(value){
    if(!value||value.schemaVersion!==1||!/^v\d+$/.test(String(value.latestVersion||''))||!Array.isArray(value.releases))return null;
    const releases=value.releases.filter(validRelease).map(release=>({
      version:String(release.version),
      date:String(release.date||''),
      title:String(release.title||''),
      items:release.items.map(item=>String(item||'')).filter(Boolean)
    }));
    if(!releases.some(release=>release.version===value.latestVersion))return null;
    return {latestVersion:String(value.latestVersion),releases};
  }

  async function loadReleaseManifest(force=false){
    if(manifestInFlight&&!force)return manifestInFlight;
    manifestInFlight=(async()=>{
      const suffix=`ts=${Date.now()}`;
      const response=await fetch(`./release-manifest.json?${suffix}`,{cache:'no-store',credentials:'same-origin'});
      if(!response.ok)throw new Error('release-manifest-unavailable');
      const normalized=normalizeManifest(await response.json());
      if(!normalized)throw new Error('release-manifest-invalid');
      releaseManifest=normalized;
      availableVersion=isNewerVersion(normalized.latestVersion)?normalized.latestVersion:'';
      return normalized;
    })().finally(()=>{manifestInFlight=null;});
    return manifestInFlight;
  }

  function releaseNotesHtml(){
    const releases=releaseManifest.releases?.length?releaseManifest.releases:FALLBACK_RELEASE_NOTES;
    return releases.map(release=>`<article class="software-update-release">
      <div class="software-update-release-head"><div><strong>${escapeHtml(release.version)}</strong><span>${escapeHtml(release.title)}</span></div><small>${escapeHtml(release.date)}</small></div>
      <ul>${release.items.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul>
    </article>`).join('');
  }

  function statusCopy(){
    if(updateStatus==='checking')return {title:'A verificar atualizações…',subtitle:'A comparar esta compilação com a versão publicada.',icon:'refresh',tone:'checking'};
    if(updateStatus==='available')return {title:`Atualização ${availableVersion||'disponível'}`,subtitle:'Foi encontrada uma compilação mais recente. Pode aplicá-la sem apagar o cofre ou os dados locais.',icon:'download',tone:'available'};
    if(updateStatus==='updating')return {title:'A instalar a atualização…',subtitle:updateMessage||'A nova compilação está a ser aplicada. A aplicação reinicia quando o Service Worker assumir o controlo.',icon:'refresh',tone:'checking'};
    if(updateStatus==='error')return {title:'Não foi possível verificar agora',subtitle:updateMessage||'Confirme a ligação à Internet e tente novamente.',icon:'info',tone:'warning'};
    if(updateStatus==='unsupported')return {title:'Atualização automática indisponível',subtitle:'Este navegador não disponibiliza Service Worker. Pode continuar a usar a aplicação online.',icon:'info',tone:'warning'};
    return {title:'O Conta de Casa está atualizado',subtitle:updateMessage||`Compilação ${buildId()} · release ${buildVersion()}`,icon:'circleCheck',tone:'ok'};
  }

  function actionLabel(){
    if(updateStatus==='checking')return 'A verificar…';
    if(updateStatus==='updating')return 'A instalar…';
    if(updateStatus==='available')return 'Verificar e atualizar agora';
    return 'Verificar e atualizar agora';
  }

  function versionOverviewHtml(){
    const standalone=isStandaloneMode();
    const workerActive='serviceWorker' in navigator&&Boolean(navigator.serviceWorker.controller);
    const online=navigator.onLine!==false;
    return `<section class="software-version-overview" aria-label="Versão instalada">
      <div class="software-version-hero">
        <div class="software-version-copy">
          <span class="software-version-kicker">VERSÃO INSTALADA</span>
          <strong>Conta de Casa ${escapeHtml(appVersion())}</strong>
          <small>${escapeHtml(buildVersion())} · Build <span class="software-version-build-id">${escapeHtml(buildId())}</span> · ${escapeHtml(formatBuildDate())}</small>
        </div>
        <span class="software-version-badge">${standalone?'PWA instalada':'Versão Web'}</span>
      </div>
      <div class="software-version-facts">
        <article><span>Aplicação</span><strong>${standalone?'PWA instalada':'Navegador'}</strong></article>
        <article><span>Atualizações</span><strong>${workerActive?'Service Worker ativo':'Ao abrir online'}</strong></article>
        <article><span>Rede</span><strong>${online?'Online':'Offline'}</strong></article>
      </div>
      <p class="software-version-note"><strong>Deteção por compilação.</strong> A verificação consulta o Service Worker mesmo quando o número da release não mudou, evitando indicar incorretamente que a aplicação está atualizada.</p>
    </section>`;
  }

  function dialogHtml(){
    const status=statusCopy();
    const releaseCount=releaseManifest.releases?.length||FALLBACK_RELEASE_NOTES.length;
    return `<div class="software-update-shell">
      <header class="software-update-header">
        <button class="software-update-back" type="button" data-software-update-close aria-label="Voltar">${icon('back',26)}</button>
        <h2>Versão e Atualizações</h2>
        <span class="software-update-header-spacer" aria-hidden="true"></span>
      </header>

      ${versionOverviewHtml()}

      <div class="software-update-options" role="group" aria-label="Opções de atualização">
        <button class="software-update-row" type="button" data-update-explain="controlled">
          <span>Instalação de atualizações</span><span class="software-update-row-value">Ao confirmar ${icon('chevron',18)}</span>
        </button>
        <button class="software-update-row" type="button" data-update-details-row>
          <span>Histórico de versões</span><span class="software-update-row-value">${releaseCount} versões ${icon('chevron',18)}</span>
        </button>
      </div>

      <section class="software-update-status ${status.tone}" aria-live="polite">
        <span class="software-update-status-icon" aria-hidden="true">${icon(status.icon,48)}</span>
        <h3>${escapeHtml(status.title)}</h3>
        <p>${escapeHtml(status.subtitle)}</p>
        <button class="software-update-details-link" type="button" data-update-details aria-expanded="${detailsOpen}">${detailsOpen?'Ocultar detalhes':'Mais detalhes'}</button>
      </section>

      <section class="software-update-details" ${detailsOpen?'':'hidden'}>
        <div class="software-update-details-head"><div><strong>Novidades e histórico</strong><span>Alterações armazenadas por release pública</span></div><span class="software-update-version-chip">${escapeHtml(buildVersion())}</span></div>
        ${releaseNotesHtml()}
      </section>

      <div class="software-update-actions">
        <button class="btn primary software-update-check" type="button" data-update-check ${actionInFlight?'disabled':''}>${icon(updateStatus==='available'?'download':'refresh',19)}<span>${escapeHtml(actionLabel())}</span></button>
        <small>A verificação e a instalação usam apenas recursos da própria aplicação. O cofre, PIN e dados financeiros não são enviados nem substituídos.</small>
      </div>
    </div>`;
  }

  function renderDialog(){if(updateDialog)updateDialog.innerHTML=dialogHtml();}

  function ensureDialog(){
    if(updateDialog?.isConnected)return updateDialog;
    updateDialog=document.createElement('dialog');
    updateDialog.className='software-update-dialog';
    updateDialog.setAttribute('aria-label','Versão e Atualizações');
    updateDialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog();});
    updateDialog.addEventListener('click',event=>{
      if(event.target===updateDialog){closeDialog();return;}
      if(event.target.closest('[data-software-update-close]')){closeDialog();return;}
      if(event.target.closest('[data-update-details], [data-update-details-row]')){detailsOpen=!detailsOpen;renderDialog();return;}
      const explanation=event.target.closest('[data-update-explain]')?.dataset.updateExplain;
      if(explanation==='controlled'){
        root.toast?.('A aplicação só aplica uma nova compilação quando confirmar em Verificar e atualizar agora.');
        return;
      }
      if(event.target.closest('[data-update-check]'))runUpdateAction();
    });
    document.body.appendChild(updateDialog);renderDialog();return updateDialog;
  }

  async function probeAvailability(){
    updateStatus='checking';updateMessage='';renderDialog();
    try{
      await loadReleaseManifest(true);
      updateStatus=availableVersion?'available':'ready';
      if(!availableVersion)updateMessage=`Versão ${appVersion()} · Build ${buildId()}. Use Verificar e atualizar agora para validar a compilação publicada.`;
    }catch(_error){
      updateStatus='ready';
      updateMessage=`Versão ${appVersion()} · Build ${buildId()}. O histórico não pôde ser consultado agora; a verificação da compilação continua disponível.`;
    }
    renderDialog();
  }

  function openDialog(){
    const dialog=ensureDialog();if(dialog.open)return;
    updateStatus='ready';updateMessage='';renderDialog();dialog.showModal();
    requestAnimationFrame(()=>dialog.querySelector('[data-software-update-close]')?.focus({preventScroll:true}));
    probeAvailability();
  }

  function closeDialog(){
    if(!updateDialog?.open)return;updateDialog.close();
    document.querySelector('[data-open-software-update]')?.focus({preventScroll:true});
  }

  function ensureSettingsLauncher(){
    const panel=document.querySelector('#page-settings article.panel.narrow');
    if(!panel||panel.querySelector('[data-open-software-update]'))return;
    const resetButton=panel.querySelector('#resetDataBtn');
    const block=document.createElement('section');block.className='settings-software-update-block';block.setAttribute('aria-label','Versão e atualizações da aplicação');
    block.innerHTML=`<button class="settings-software-update-row" type="button" data-open-software-update><span class="settings-software-update-icon" aria-hidden="true">${icon('refresh',22)}</span><span class="settings-software-update-copy"><strong>Versão e Atualizações</strong><small>Conta de Casa ${escapeHtml(appVersion())} · Build ${escapeHtml(buildId())}</small></span><span class="settings-software-update-chevron" aria-hidden="true">${icon('chevron',20)}</span></button>`;
    panel.insertBefore(block,resetButton?.previousElementSibling||resetButton||null);
    block.querySelector('[data-open-software-update]')?.addEventListener('click',openDialog);
  }

  function waitForWaiting(registration,timeoutMs=9000){
    if(registration.waiting)return Promise.resolve(registration.waiting);
    return new Promise(resolve=>{
      let finished=false;
      let worker=registration.installing;
      const finish=value=>{if(finished)return;finished=true;clearTimeout(timer);registration.removeEventListener?.('updatefound',onUpdateFound);worker?.removeEventListener?.('statechange',onState);resolve(value||null);};
      const onState=()=>{
        if(registration.waiting){finish(registration.waiting);return;}
        if(worker&&['activated','redundant'].includes(worker.state))finish(null);
      };
      const watchWorker=()=>{
        worker?.removeEventListener?.('statechange',onState);
        worker=registration.installing;
        if(worker)worker.addEventListener('statechange',onState);
        onState();
      };
      const onUpdateFound=()=>watchWorker();
      const timer=setTimeout(()=>finish(registration.waiting||null),timeoutMs);
      registration.addEventListener('updatefound',onUpdateFound);
      watchWorker();
    });
  }

  function armReload(){
    reloadAfterUpdate=true;
    setTimeout(()=>{if(reloadAfterUpdate)location.reload();},6500);
  }

  async function runUpdateAction(){
    if(actionInFlight)return actionInFlight;
    actionInFlight=(async()=>{
      if(!('serviceWorker' in navigator)){updateStatus='unsupported';renderDialog();return;}
      if(navigator.onLine===false){
        updateStatus='error';updateMessage='Sem ligação à Internet. A versão instalada continua disponível; tente novamente quando estiver online.';renderDialog();return;
      }

      updateStatus='checking';updateMessage='';renderDialog();
      let manifest=null;
      let manifestError=false;
      try{
        manifest=await loadReleaseManifest(true);
      }catch(_error){
        manifestError=true;
      }

      try{
        let registration=await navigator.serviceWorker.getRegistration();
        if(!registration)registration=await navigator.serviceWorker.register(`./sw.js?v=${buildVersion().replace(/^v/,'')}`,{updateViaCache:'none'});

        // A verificação da compilação é deliberadamente anterior à conclusão "atualizado".
        // Isto corrige o falso negativo que ocorria quando a release permanecia igual.
        await registration.update();
        const waiting=await waitForWaiting(registration);
        if(waiting){
          const newerRelease=manifest&&isNewerVersion(manifest.latestVersion)?manifest.latestVersion:'';
          availableVersion=newerRelease||`${buildVersion()} · nova compilação`;
          updateStatus='updating';
          updateMessage=`Nova compilação encontrada. A substituir o Build ${buildId()} sem alterar os dados locais.`;
          renderDialog();
          armReload();
          waiting.postMessage({type:'APPLY_UPDATE',version:availableVersion,buildId:buildId()});
          return;
        }

        if(manifest&&isNewerVersion(manifest.latestVersion)){
          availableVersion=manifest.latestVersion;
          updateStatus='error';
          updateMessage=`O histórico indica ${manifest.latestVersion}, mas o navegador ainda não recebeu o novo Service Worker. Tente novamente dentro de alguns instantes.`;
          renderDialog();
          return;
        }

        availableVersion='';
        updateStatus='ready';
        updateMessage=`Compilação ${buildId()} verificada. Não existe uma atualização pendente${manifestError?'; o histórico de versões estava temporariamente indisponível':''}.`;
        renderDialog();
        root.toast?.(`Build ${buildId()} verificado. Não existem atualizações pendentes.`);
      }catch(_error){
        reloadAfterUpdate=false;
        updateStatus='error';
        updateMessage='Não foi possível verificar a compilação publicada. A versão atual continua disponível e os seus dados não foram alterados.';
        renderDialog();
      }
    })().finally(()=>{actionInFlight=null;renderDialog();});
    return actionInFlight;
  }

  function install(){
    ensureSettingsLauncher();
    const observer=new MutationObserver(()=>ensureSettingsLauncher());observer.observe(document.body,{childList:true,subtree:true});
    if('serviceWorker' in navigator){
      navigator.serviceWorker.addEventListener('controllerchange',()=>{
        if(!reloadAfterUpdate)return;
        reloadAfterUpdate=false;
        location.reload();
      });
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();

  root.CDCAppUpdates=Object.freeze({
    open:openDialog,
    check:probeAvailability,
    update:runUpdateAction,
    version:buildVersion,
    appVersion,
    buildId,
    buildDate,
    get releases(){return releaseManifest.releases;},
    get latest(){return releaseManifest.latestVersion;}
  });
})(window);

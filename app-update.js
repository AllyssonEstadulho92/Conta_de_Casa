'use strict';

/*
 * Conta de Casa — Centro de Atualização de Software (v63)
 *
 * Política de atualização:
 * - o histórico público fica em release-manifest.json, versionado no repositório;
 * - abrir este ecrã pode verificar se existe versão nova, mas não a instala;
 * - a instalação só começa após ação explícita no botão de atualização;
 * - o Service Worker aplica a nova versão e reinicia a aplicação;
 * - dados financeiros, cofre, PIN e IndexedDB não são modificados por esta camada.
 */
(function installSoftwareUpdateCenter(root){
  const FALLBACK_RELEASE_NOTES=Object.freeze([
    Object.freeze({
      version:'v63',
      date:'6 de setembro de 2026',
      title:'Compras organizadas e atualizações controladas',
      items:Object.freeze([
        'A Lista de compras passa a ficar organizada por categoria e com alinhamento visual consistente à esquerda.',
        'A categoria Mercearia / Despensa recebe um ícone mais adequado à função.',
        'O histórico das versões passa a ser mantido em release-manifest.json.',
        'Ao confirmar Atualizar agora, o Service Worker instala a nova versão e reinicia a aplicação.',
        'O cofre e os dados financeiros locais permanecem separados do mecanismo de atualização.'
      ])
    }),
    Object.freeze({
      version:'v62',
      date:'6 de setembro de 2026',
      title:'Mercado text-first e correções no iPhone',
      items:Object.freeze([
        'As fotografias deixaram de ocupar espaço na experiência principal do Mercado.',
        'Foi corrigida a coluna fantasma que comprimira os resultados no Safari/iPhone.',
        'Metadados técnicos antigos deixaram de gerar conflitos manuais com zero diferenças financeiras.'
      ])
    }),
    Object.freeze({
      version:'v61',
      date:'6 de setembro de 2026',
      title:'Imagens oficiais no browser real',
      items:Object.freeze(['Corrigida a integração entre os cartões reais do Mercado e o resolvedor de fotografias oficiais.'])
    }),
    Object.freeze({
      version:'v60',
      date:'6 de setembro de 2026',
      title:'Imagens oficiais e catálogo alargado',
      items:Object.freeze(['As fotografias passaram a dar prioridade ao SKU exato das páginas oficiais do retalhista.'])
    }),
    Object.freeze({
      version:'v59',
      date:'5 de setembro de 2026',
      title:'Imagens de produto e ampliação',
      items:Object.freeze(['As miniaturas de produto passaram a permitir ampliação ao toque ou clique.'])
    }),
    Object.freeze({
      version:'v58',
      date:'5 de setembro de 2026',
      title:'Centro de Atualização de Software',
      items:Object.freeze(['Foi criado o ecrã Atualização de Software nas Definições.'])
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

  const buildVersion=()=>document.querySelector('meta[name="app-build"]')?.content?.trim()||FALLBACK_RELEASE_NOTES[0].version;
  const icon=(name,size=22)=>root.CDCIcons?.markup?.(name,size)||fallbackIcon(name,size);
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[char]));
  const versionNumber=value=>{
    const match=/^v(\d+)$/.exec(String(value||'').trim());
    return match?Number(match[1]):-1;
  };
  const isNewerVersion=(candidate,current=buildVersion())=>versionNumber(candidate)>versionNumber(current);

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
    if(!value||value.schemaVersion!==1||!/^v\d+$/.test(String(value.latestVersion||''))||!Array.isArray(value.releases)) return null;
    const releases=value.releases.filter(validRelease).map(release=>({
      version:String(release.version),
      date:String(release.date||''),
      title:String(release.title||''),
      items:release.items.map(item=>String(item||'')).filter(Boolean)
    }));
    if(!releases.some(release=>release.version===value.latestVersion)) return null;
    return {latestVersion:String(value.latestVersion),releases};
  }

  async function loadReleaseManifest(force=false){
    if(manifestInFlight&&!force) return manifestInFlight;
    manifestInFlight=(async()=>{
      const suffix=`ts=${Date.now()}`;
      const response=await fetch(`./release-manifest.json?${suffix}`,{cache:'no-store',credentials:'same-origin'});
      if(!response.ok) throw new Error('release-manifest-unavailable');
      const normalized=normalizeManifest(await response.json());
      if(!normalized) throw new Error('release-manifest-invalid');
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
    if(updateStatus==='checking') return {title:'A verificar atualizações…',subtitle:'A consultar o manifesto público de versões do Conta de Casa.',icon:'refresh',tone:'checking'};
    if(updateStatus==='available') return {title:`Atualização ${availableVersion} disponível`,subtitle:'A nova versão está pronta para instalar. O cofre e os dados locais não são apagados.',icon:'download',tone:'available'};
    if(updateStatus==='updating') return {title:`A instalar ${availableVersion||'a atualização'}…`,subtitle:'A preparar os novos ficheiros. A aplicação reinicia automaticamente quando a instalação terminar.',icon:'refresh',tone:'checking'};
    if(updateStatus==='error') return {title:'Não foi possível verificar agora',subtitle:updateMessage||'Confirme a ligação à Internet e tente novamente.',icon:'info',tone:'warning'};
    if(updateStatus==='unsupported') return {title:'Atualização automática indisponível',subtitle:'Este navegador não disponibiliza Service Worker. Pode continuar a usar a aplicação online.',icon:'info',tone:'warning'};
    return {title:'O Conta de Casa está atualizado',subtitle:`Versão ${buildVersion()}`,icon:'circleCheck',tone:'ok'};
  }

  function actionLabel(){
    if(updateStatus==='checking') return 'A verificar…';
    if(updateStatus==='updating') return 'A instalar…';
    if(updateStatus==='available') return `Atualizar agora para ${availableVersion}`;
    return 'Verificar atualizações';
  }

  function dialogHtml(){
    const status=statusCopy();
    const releaseCount=releaseManifest.releases?.length||FALLBACK_RELEASE_NOTES.length;
    return `<div class="software-update-shell">
      <header class="software-update-header">
        <button class="software-update-back" type="button" data-software-update-close aria-label="Voltar">${icon('back',26)}</button>
        <h2>Atualização de Software</h2>
        <span class="software-update-header-spacer" aria-hidden="true"></span>
      </header>

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
        <div class="software-update-details-head"><div><strong>Novidades e histórico</strong><span>Alterações armazenadas por versão</span></div><span class="software-update-version-chip">${escapeHtml(buildVersion())}</span></div>
        ${releaseNotesHtml()}
      </section>

      <div class="software-update-actions">
        <button class="btn primary software-update-check" type="button" data-update-check ${actionInFlight?'disabled':''}>${icon(updateStatus==='available'?'download':'refresh',19)}<span>${escapeHtml(actionLabel())}</span></button>
        <small>A instalação usa apenas recursos da própria aplicação. O cofre, PIN e dados financeiros não são enviados nem substituídos.</small>
      </div>
    </div>`;
  }

  function renderDialog(){if(updateDialog)updateDialog.innerHTML=dialogHtml();}

  function ensureDialog(){
    if(updateDialog?.isConnected)return updateDialog;
    updateDialog=document.createElement('dialog');
    updateDialog.className='software-update-dialog';
    updateDialog.setAttribute('aria-label','Atualização de Software');
    updateDialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog();});
    updateDialog.addEventListener('click',event=>{
      if(event.target===updateDialog){closeDialog();return;}
      if(event.target.closest('[data-software-update-close]')){closeDialog();return;}
      if(event.target.closest('[data-update-details], [data-update-details-row]')){detailsOpen=!detailsOpen;renderDialog();return;}
      const explanation=event.target.closest('[data-update-explain]')?.dataset.updateExplain;
      if(explanation==='controlled'){
        root.toast?.('A aplicação só instala uma nova versão quando confirmar no botão Atualizar agora.');
        return;
      }
      if(event.target.closest('[data-update-check]')) runUpdateAction();
    });
    document.body.appendChild(updateDialog);renderDialog();return updateDialog;
  }

  async function probeAvailability(){
    updateStatus='checking';updateMessage='';renderDialog();
    try{
      await loadReleaseManifest(true);
      updateStatus=availableVersion?'available':'ready';
    }catch(_error){
      updateStatus='error';
      updateMessage='Não foi possível ler o histórico público de versões neste momento.';
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
    const block=document.createElement('section');block.className='settings-software-update-block';block.setAttribute('aria-label','Atualização da aplicação');
    block.innerHTML=`<button class="settings-software-update-row" type="button" data-open-software-update><span class="settings-software-update-icon" aria-hidden="true">${icon('refresh',22)}</span><span class="settings-software-update-copy"><strong>Atualização de Software</strong><small>Versão ${escapeHtml(buildVersion())} · histórico de alterações</small></span><span class="settings-software-update-chevron" aria-hidden="true">${icon('chevron',20)}</span></button>`;
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
      updateStatus='checking';updateMessage='';renderDialog();
      try{
        const manifest=await loadReleaseManifest(true);
        if(!isNewerVersion(manifest.latestVersion)){
          availableVersion='';updateStatus='ready';renderDialog();root.toast?.('Não existem atualizações novas.');return;
        }
        availableVersion=manifest.latestVersion;
        updateStatus='updating';renderDialog();

        let registration=await navigator.serviceWorker.getRegistration();
        if(!registration)registration=await navigator.serviceWorker.register(`./sw.js?v=${buildVersion().replace(/^v/,'')}`,{updateViaCache:'none'});
        await registration.update();
        const waiting=await waitForWaiting(registration);
        if(waiting){
          armReload();
          waiting.postMessage({type:'APPLY_UPDATE',version:availableVersion});
          return;
        }

        // Se o browser ativou imediatamente o worker (por exemplo numa primeira
        // instalação), recarregar garante que o novo index/assets entram em uso.
        armReload();
        setTimeout(()=>location.reload(),350);
      }catch(_error){
        reloadAfterUpdate=false;
        updateStatus='error';
        updateMessage='Não foi possível preparar a atualização. A versão atual continua disponível e os seus dados não foram alterados.';
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
    get releases(){return releaseManifest.releases;},
    get latest(){return releaseManifest.latestVersion;}
  });
})(window);

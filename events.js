let eventsWired = false;

function ensureDialogShellIsContainer() {
  const shell = $('#dialogShell');
  if (!shell || shell.tagName !== 'FORM') return;
  const div = document.createElement('div');
  div.id = 'dialogShell';
  div.className = shell.className;
  while (shell.firstChild) div.appendChild(shell.firstChild);
  shell.replaceWith(div);
}

function installPinRecoveryUi() {
  const unlockBox = $('#vaultUnlock');
  if (unlockBox && !$('#pinHelpToggle')) {
    const actions = document.createElement('div');
    actions.className = 'pin-recovery-actions';
    setHTML(actions, `<div class="vault-action-row">
        <button id="togglePinVisibility" class="link-btn pin-help-link" type="button">Mostrar PIN</button>
        <button id="changePinLockedToggle" class="link-btn pin-help-link" type="button">Alterar PIN</button>
      </div>
      <div id="changePinLockedBox" class="device-transfer-box pin-recovery-box" hidden>
        <strong>Alterar PIN deste cofre</strong>
        <p>Para preservar as faturas e restantes dados, confirme primeiro o PIN atual. O cofre será recifrado com o novo PIN.</p>
        <form id="changePinLockedForm" class="form-grid">
          <label>PIN atual<input id="lockedCurrentPin" name="currentPin" type="password" autocomplete="current-password" autocapitalize="off" spellcheck="false" required></label>
          <label>Novo PIN<input id="lockedNewPin" name="newPin" type="password" minlength="8" autocomplete="new-password" autocapitalize="off" spellcheck="false" required></label>
          <label>Confirmar novo PIN<input id="lockedConfirmPin" name="confirmPin" type="password" minlength="8" autocomplete="new-password" autocapitalize="off" spellcheck="false" required></label>
          <button id="changePinLockedBtn" class="btn primary full" type="submit">Guardar novo PIN</button>
          <p id="changePinLockedMessage" class="form-message" role="status"></p>
        </form>
        <small>Se não souber o PIN atual, ele não pode ser substituído sem perder o acesso criptográfico ao cofre. Nesse caso, use um backup cifrado válido ou recrie apenas o cofre local.</small>
      </div>
      <button id="pinHelpToggle" class="link-btn pin-help-link" type="button">Problemas com o PIN?</button>
      <div id="pinRecoveryBox" class="device-transfer-box pin-recovery-box" hidden>
        <strong>Recuperar acesso neste dispositivo</strong>
        <p>O PIN pertence ao cofre guardado neste navegador. Se este telemóvel tiver um cofre diferente, o PIN usado no computador não o consegue abrir.</p>
        <p><strong>Se existem dados importantes neste dispositivo, não os apague.</strong> Importe um backup cifrado do computador ou altere primeiro o PIN no computador e exporte um novo backup.</p>
        <button id="resetLocalVaultBtn" class="btn danger full" type="button">Recriar acesso local</button>
        <small>Apaga somente o cofre local deste navegador. Não apaga o computador nem backups externos.</small>
      </div>`);
    unlockBox.appendChild(actions);
  }

  const securityGrid = $('#page-security .two-col');
  if (securityGrid && !$('#changePinForm')) {
    const panel = document.createElement('article');
    panel.className = 'panel';
    setHTML(panel, `<div class="panel-head"><div><h2>Alterar PIN de acesso</h2><p>Recifra o cofre inteiro com um novo PIN, sem apagar os dados.</p></div></div>
      <form id="changePinForm" class="form-grid">
        <label>PIN atual<input id="currentVaultPin" name="currentPin" type="password" autocomplete="current-password" autocapitalize="off" spellcheck="false" required></label>
        <label>Novo PIN<input id="newVaultPin" name="newPin" type="password" minlength="8" autocomplete="new-password" autocapitalize="off" spellcheck="false" required></label>
        <label>Confirmar novo PIN<input id="confirmVaultPin" name="confirmPin" type="password" minlength="8" autocomplete="new-password" autocapitalize="off" spellcheck="false" required></label>
        <button id="changePinBtn" class="btn primary" type="submit">Alterar PIN</button>
        <p id="changePinMessage" class="form-message" role="status"></p>
      </form>
      <small>Depois de alterar, faça um novo backup. Backups antigos continuam protegidos pelo PIN antigo.</small>`);
    securityGrid.appendChild(panel);
  }
}
let viewportMetricsWired = false;
let viewportRaf = 0;

function updateViewportMetrics() {
  cancelAnimationFrame(viewportRaf);
  viewportRaf = requestAnimationFrame(() => {
    const root = document.documentElement;
    const vv = window.visualViewport;
    const viewportHeight = Math.max(320, Math.round(vv?.height || window.innerHeight || root.clientHeight || 0));
    root.style.setProperty('--visual-vh', `${viewportHeight}px`);

    const narrow = window.matchMedia('(max-width: 820px)').matches;
    const layoutHeight = Math.max(root.clientHeight || 0, window.innerHeight || 0);
    const keyboardInset = vv ? Math.max(0, Math.round(layoutHeight - vv.height - vv.offsetTop)) : 0;
    const keyboardOpen = Boolean(narrow && vv && keyboardInset > 220);

    root.classList.toggle('keyboard-open', keyboardOpen);

    // Modern mobile browsers already position fixed elements inside the visual viewport.
    // Extra manual offsets caused the navigation to float in the middle of Safari.
    root.style.setProperty('--browser-bottom-offset', '0px');
  });
}

function installViewportMetrics() {
  if (viewportMetricsWired) return;
  viewportMetricsWired = true;
  updateViewportMetrics();
  window.addEventListener('resize', updateViewportMetrics, { passive:true });
  window.addEventListener('orientationchange', updateViewportMetrics, { passive:true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateViewportMetrics, { passive:true });
    window.visualViewport.addEventListener('scroll', updateViewportMetrics, { passive:true });
  }
}

function billDeletionScope(rootId) {
  const ids=new Set([String(rootId)]);
  let changed=true;
  while(changed){
    changed=false;
    for(const bill of appState?.bills||[]){
      if(bill?.recurrenceParentId && ids.has(String(bill.recurrenceParentId)) && !ids.has(String(bill.id))){
        ids.add(String(bill.id));
        changed=true;
      }
    }
  }
  return ids;
}

async function deleteBillEnteredByMistake(id) {
  const bill=appState?.bills?.find(x=>x.id===id);
  if(!bill) return;

  const scope=billDeletionScope(id);
  const payments=(appState.payments||[]).filter(p=>scope.has(String(p.billId)));
  if(payments.length){
    toast('Não é possível excluir uma fatura com pagamentos. Cancele-a para preservar o histórico financeiro.');
    return;
  }

  const generated=Math.max(0,scope.size-1);
  const warning=generated
    ? `Excluir definitivamente esta fatura e ${generated} recorrência(s) futura(s) gerada(s)? Esta ação é apenas para registos criados por engano.`
    : 'Excluir definitivamente esta fatura? Use esta opção apenas quando o registo foi criado por engano.';
  if(!confirm(warning)) return;

  for(const billId of scope){
    if(typeof recordSyncDeletion==='function') recordSyncDeletion('bill',billId);
  }
  appState.bills=appState.bills.filter(x=>!scope.has(String(x.id)));
  await commit('deleted','bill');
  closeDialog();
  toast(generated?'Fatura e recorrências futuras excluídas.':'Fatura excluída.');
}

function wireEvents(){
  if (eventsWired) return;
  eventsWired = true;
  $('#desktopNav').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b)showPage(b.dataset.page);});
  $('#mobileNav').addEventListener('click',e=>{const b=e.target.closest('[data-mobile]');if(!b)return;if(b.dataset.mobile==='add')$('#quickDialog').showModal();else if(b.dataset.mobile==='more')openMoreMenu();else showPage(b.dataset.mobile);});
  $('#quickAddBtn').addEventListener('click',()=>$('#quickDialog').showModal());
  document.addEventListener('click',e=>{
    const go=e.target.closest('[data-go]');
    if(go) showPage(go.dataset.go);
    const close=e.target.closest('[data-close-dialog]');
    if(close){e.preventDefault();closeDialog();return;}
    const closeQuick=e.target.closest('[data-close-quick-dialog]');
    if(closeQuick){e.preventDefault();const q=$('#quickDialog');if(q?.open)q.close();return;}
    const more=e.target.closest('[data-more-page]');
    if(more){closeDialog();showPage(more.dataset.morePage);}
  });
  $('#quickDialog').addEventListener('click',e=>{
    if(e.target===$('#quickDialog')){$('#quickDialog').close();return;}
    const b=e.target.closest('[data-quick]');
    if(!b)return;
    $('#quickDialog').close();
    ({bill:openBillForm,income:openIncomeForm,market:openMarketForm,goal:openGoalForm})[b.dataset.quick]?.();
  });
  $('#newBillBtn').addEventListener('click',()=>openBillForm()); $('#newIncomeBtn').addEventListener('click',openIncomeForm); $('#newMarketBtn').addEventListener('click',openMarketForm); $('#newGoalBtn').addEventListener('click',openGoalForm);
  $('#billSearch').addEventListener('input',renderBills);
  ['#billStatusFilter','#billCategoryFilter','#billDateFrom','#billDateTo','#billSort'].forEach(sel=>$(sel)?.addEventListener('change',renderBills));
  $('#billClearFilters')?.addEventListener('click',()=>{
    $('#billSearch').value='';
    $('#billStatusFilter').value='all';
    $('#billCategoryFilter').value='all';
    $('#billDateFrom').value='';
    $('#billDateTo').value='';
    $('#billSort').value='due-asc';
    renderBills();
  });
  const formDialog=$('#formDialog');
  formDialog.addEventListener('click',e=>{if(e.target===formDialog)closeDialog();});
  formDialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
  formDialog.addEventListener('close',()=>{formDialog.classList.remove('detail-dialog');delete formDialog.dataset.mode;});
  $('#billsList').addEventListener('click',async e=>{
    const pay=e.target.closest('[data-pay-bill]');
    if(pay){openPaymentForm(pay.dataset.payBill);return;}
    const del=e.target.closest('[data-delete-bill]');
    if(del){await deleteBillEnteredByMistake(del.dataset.deleteBill);return;}
    const b=e.target.closest('[data-bill-id]');
    if(b)openBillDetail(b.dataset.billId);
  });
  $('#upcomingBills').addEventListener('click',e=>{const b=e.target.closest('[data-bill-id]');if(b)openBillDetail(b.dataset.billId);});
  $('#calendarAgenda').addEventListener('click',e=>{const b=e.target.closest('[data-bill-id]');if(b)openBillDetail(b.dataset.billId);});
  $('#dialogBody').addEventListener('click',async e=>{
    const pay=e.target.closest('[data-detail-pay]');
    if(pay){openPaymentForm(pay.dataset.detailPay);return;}
    const edit=e.target.closest('[data-detail-edit]');
    if(edit){const b=appState.bills.find(x=>x.id===edit.dataset.detailEdit);openBillForm(b);return;}
    const duplicate=e.target.closest('[data-detail-duplicate]');
    if(duplicate){
      const source=appState.bills.find(x=>x.id===duplicate.dataset.detailDuplicate);
      if(source){
        const now=new Date().toISOString();
        const copy={...source,id:uid(),title:cleanString(`${source.title} — cópia`,80),reference:'',recurrence:'none',recurrenceParentId:undefined,recurrenceSeriesId:undefined,recurrenceKey:undefined,createdAt:now,updatedAt:now,cancelled:false,archived:false};
        appState.bills.push(copy);
        await commit('created','bill');
        closeDialog();
        toast('Fatura duplicada. Reveja os dados da cópia antes de usar.');
      }
      return;
    }
    const undo=e.target.closest('[data-delete-payment]');
    if(undo){
      const payment=appState.payments.find(x=>x.id===undo.dataset.deletePayment);
      const billId=undo.dataset.paymentBill||payment?.billId;
      if(payment&&confirm('Desfazer este pagamento? O valor volta a ficar pendente na fatura.')){
        if(typeof recordSyncDeletion==='function') recordSyncDeletion('payment',payment.id);
        appState.payments=appState.payments.filter(x=>x.id!==payment.id);
        const bill=appState.bills.find(x=>x.id===billId);
        if(bill) bill.updatedAt=new Date().toISOString();
        await commit('deleted','payment');
        if(bill) openBillDetail(bill.id); else closeDialog();
        toast('Pagamento desfeito.');
      }
      return;
    }
    const del=e.target.closest('[data-detail-delete]');
    if(del){await deleteBillEnteredByMistake(del.dataset.detailDelete);return;}
    const cancel=e.target.closest('[data-detail-cancel]');
    if(cancel){
      const b=appState.bills.find(x=>x.id===cancel.dataset.detailCancel);
      if(b&&paidForBill(b.id)>0){toast('Não é possível cancelar uma fatura com pagamentos. Desfaça os pagamentos incorretos primeiro.');return;}
      if(b&&confirm('Cancelar esta fatura?')){
        b.cancelled=true;
        b.updatedAt=new Date().toISOString();
        await commit('cancelled','bill');
        closeDialog();
        toast('Fatura cancelada.');
      }
    }
  });
  $('#monthPicker').addEventListener('change',()=>{selectedMonth=$('#monthPicker').value||selectedMonth;monthProfile();renderCurrentPage();});
  $('#monthPlanForm').addEventListener('submit',async e=>{e.preventDefault();const open=parseCents($('#openingBalance').value),budget=parseCents($('#monthlyBudget').value);if(!Number.isFinite(open)||!Number.isFinite(budget)||budget<0){toast('Valores de planeamento inválidos.');return;}const p=monthProfile();p.openingBalanceCents=open;p.budgetCents=budget;p.updatedAt=new Date().toISOString();await commit('updated','planning');toast('Planeamento guardado.');});
  $('#incomeList').addEventListener('click',async e=>{const b=e.target.closest('[data-delete-income]');if(b&&confirm('Eliminar este rendimento?')){if(typeof recordSyncDeletion==='function')recordSyncDeletion('income',b.dataset.deleteIncome);appState.incomes=appState.incomes.filter(x=>x.id!==b.dataset.deleteIncome);await commit('deleted','income');}});
  $('#marketList').addEventListener('change',async e=>{const t=e.target;if(t.matches('[data-market-toggle]')){const i=appState.market.find(x=>x.id===t.dataset.marketToggle);if(!i)return;i.purchased=t.checked;i.purchasedAt=t.checked?new Date().toISOString():null;i.updatedAt=new Date().toISOString();await commit('updated','market');}if(t.matches('[data-market-actual]')){const i=appState.market.find(x=>x.id===t.dataset.marketActual),v=parseCents(t.value);if(i&&Number.isFinite(v)&&v>=0){i.actualCents=v;i.updatedAt=new Date().toISOString();await saveState();renderMarket();}}});
  $('#marketList').addEventListener('click',async e=>{const b=e.target.closest('[data-delete-market]');if(b&&confirm('Eliminar este item?')){if(typeof recordSyncDeletion==='function')recordSyncDeletion('market',b.dataset.deleteMarket);appState.market=appState.market.filter(x=>x.id!==b.dataset.deleteMarket);await commit('deleted','market');}});
  $('#goalList').addEventListener('click',async e=>{const add=e.target.closest('[data-goal-add]');if(add){openGoalContribution(add.dataset.goalAdd);return;}const ar=e.target.closest('[data-goal-archive]');if(ar&&confirm('Arquivar este objetivo?')){const g=appState.goals.find(x=>x.id===ar.dataset.goalArchive);if(!g)return;g.archived=true;g.updatedAt=new Date().toISOString();await commit('archived','goal');}});
  $('#settingsForm').addEventListener('submit',async e=>{e.preventDefault();appState.settings.profileName=cleanString($('#profileName').value,80);appState.settings.currency=$('#currencySelect').value;appState.settings.theme=$('#themeSelect').value;applyTheme();await commit('updated','settings');toast('Preferências guardadas.');});
  const changePinForm=$('#changePinForm');
  if(changePinForm){
    changePinForm.addEventListener('submit',async e=>{
      e.preventDefault();
      const current=$('#currentVaultPin').value;
      const next=$('#newVaultPin').value;
      const confirmPin=$('#confirmVaultPin').value;
      const msg=$('#changePinMessage');
      msg.className='form-message';
      if(next.length<8){msg.textContent='O novo PIN deve ter pelo menos 8 caracteres.';msg.classList.add('error');return;}
      if(next!==confirmPin){msg.textContent='A confirmação do novo PIN não coincide.';msg.classList.add('error');return;}
      try{
        $('#changePinBtn').disabled=true;
        msg.textContent='A recifrar o cofre...';
        await changeVaultPassphrase(current,next);
        ['#currentVaultPin','#newVaultPin','#confirmVaultPin'].forEach(sel=>{const el=$(sel);if(el)el.value='';});
        msg.textContent='PIN alterado com sucesso. Faça agora um novo backup cifrado.';
        msg.classList.add('success');
        toast('PIN alterado com sucesso.');
      }catch(err){
        const known=['Palavra-passe/PIN incorreto.','O novo PIN deve ter pelo menos 8 caracteres.','O novo PIN deve ser diferente do atual.','O cofre local não passou na validação de integridade.'];
        msg.textContent=known.includes(err?.message)?err.message:'Não foi possível alterar o PIN.';
        msg.classList.add('error');
      }finally{$('#changePinBtn').disabled=false;}
    });
  }
  $('#themeToggle').addEventListener('click',async()=>{appState.settings.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';applyTheme();$('#themeSelect').value=appState.settings.theme;await saveState();});
  $('#privacyToggle').addEventListener('click',()=>setPrivacy(!privacyHidden));
  $('#lockBtn').addEventListener('click',()=>lockApp('manual')); $('#securityLockBtn').addEventListener('click',()=>lockApp('manual'));
  $('#exportBackupBtn').addEventListener('click',exportBackup); $('#importBackupInput').addEventListener('change',async e=>{try{if(e.target.files[0])await importBackup(e.target.files[0]);}catch(err){$('#backupMessage').textContent=safeUserError(err);$('#backupMessage').className='form-message error';}finally{e.target.value='';}});
  $('#resetDataBtn').addEventListener('click',async()=>{if(confirm('ATENÇÃO: isto apaga definitivamente o cofre e todos os dados deste dispositivo. Continuar?')){await idbClearAll();location.reload();}});
  $('#notificationsBtn').addEventListener('click',()=>{showPage('dashboard');toast('Os alertas importantes aparecem no topo do Início.');});
}

async function enterApp() {
  installViewportMetrics();
  ensureDialogShellIsContainer();
  installPinRecoveryUi();
  clearPassphraseInputs();
  document.documentElement.classList.add('app-active');

  $('#vaultScreen').hidden=true;
  $('#app').hidden=true;
  $('#monthPicker').value=selectedMonth;
  renderNav();
  applyTheme();
  setPrivacy(false);
  wireEvents();
  installSessionLockGuards();

  let startupSyncState='not-configured';
  if(typeof syncStartupGate==='function'){
    try{startupSyncState=await syncStartupGate();}
    catch(_err){startupSyncState='error';}
  }

  $('#app').hidden=false;
  const mayShowFinancialData=['synced','offline-paired'].includes(startupSyncState);
  showPage(mayShowFinancialData?currentPage():'security');
  recordUserActivity();

  if ('serviceWorker' in navigator) {
    (async()=>{
      try{
        const reg=await navigator.serviceWorker.register('./sw.js?v=31',{updateViaCache:'none'});
        await reg.update().catch(()=>{});
        if(!window.__swReloadBound){
          window.__swReloadBound=true;
          let refreshing=false;
          navigator.serviceWorker.addEventListener('controllerchange',()=>{
            if(refreshing) return;
            refreshing=true;
            location.reload();
          });
        }
      }catch(_err){}
    })();
  }
  if (typeof startSyncLifecycle === 'function') startSyncLifecycle({skipInitial:true});
}
async function initVaultUi() {
  installViewportMetrics();
  installStorageGuards();
  installRuntimeErrorGuards();
  installPinRecoveryUi();
  await openDb();
  const meta=await idbGet('meta','vault'); $('#vaultCreate').hidden=!!meta; $('#vaultUnlock').hidden=!meta;

  const vaultTransferToggle=$('#vaultTransferToggle');
  if(vaultTransferToggle){
    vaultTransferToggle.addEventListener('click',()=>{
      const panel=$('#vaultTransferPanel');
      const open=panel.hidden;
      panel.hidden=!open;
      vaultTransferToggle.setAttribute('aria-expanded',String(open));
      vaultTransferToggle.classList.toggle('open',open);
    });
  }

  const togglePin=$('#togglePinVisibility');
  if(togglePin){
    togglePin.addEventListener('click',()=>{
      const input=$('#unlockPassphrase');
      const show=input.type==='password';
      input.type=show?'text':'password';
      togglePin.textContent=show?'Ocultar PIN':'Mostrar PIN';
    });
  }
  const changePinLockedToggle=$('#changePinLockedToggle');
  if(changePinLockedToggle){
    changePinLockedToggle.addEventListener('click',()=>{
      const box=$('#changePinLockedBox');
      const open=box.hidden;
      box.hidden=!open;
      changePinLockedToggle.textContent=open?'Fechar alteração':'Alterar PIN';
      changePinLockedToggle.setAttribute('aria-expanded',String(open));
      if(open){
        const help=$('#pinRecoveryBox');
        if(help) help.hidden=true;
        $('#lockedCurrentPin')?.focus();
      }
    });
  }
  const changePinLockedForm=$('#changePinLockedForm');
  if(changePinLockedForm){
    changePinLockedForm.addEventListener('submit',async e=>{
      e.preventDefault();
      const current=$('#lockedCurrentPin').value;
      const next=$('#lockedNewPin').value;
      const confirmPin=$('#lockedConfirmPin').value;
      const msg=$('#changePinLockedMessage');
      msg.className='form-message';
      if(next.length<8){
        msg.textContent='O novo PIN deve ter pelo menos 8 caracteres.';
        msg.classList.add('error');
        return;
      }
      if(next!==confirmPin){
        msg.textContent='A confirmação do novo PIN não coincide.';
        msg.classList.add('error');
        return;
      }
      try{
        $('#changePinLockedBtn').disabled=true;
        msg.textContent='A validar o PIN atual e a recifrar o cofre...';
        await changeVaultPassphrase(current,next);
        ['#unlockPassphrase','#lockedCurrentPin','#lockedNewPin','#lockedConfirmPin'].forEach(sel=>{const el=$(sel);if(el)el.value='';});
        msg.textContent='PIN alterado com sucesso. A abrir a aplicação...';
        msg.classList.add('success');
        await enterApp();
        toast('PIN alterado com sucesso.');
      }catch(err){
        if(err?.message==='Palavra-passe/PIN incorreto.'){
          msg.textContent='O PIN atual não corresponde a este cofre. Se este dispositivo tem outro cofre, importe o backup cifrado correto ou use “Problemas com o PIN?”.';
        }else if(err?.message==='O novo PIN deve ser diferente do atual.'){
          msg.textContent=err.message;
        }else if(err?.message==='O cofre local não passou na validação de integridade.'){
          msg.textContent='O cofre local parece estar danificado. Preserve os dados e restaure um backup cifrado válido.';
        }else{
          msg.textContent='Não foi possível alterar o PIN.';
        }
        msg.classList.add('error');
      }finally{
        const btn=$('#changePinLockedBtn');
        if(btn) btn.disabled=false;
      }
    });
  }
  const pinHelp=$('#pinHelpToggle');
  if(pinHelp){
    pinHelp.addEventListener('click',()=>{
      const box=$('#pinRecoveryBox');
      const open=box.hidden;
      box.hidden=!open;
      pinHelp.textContent=open?'Fechar ajuda':'Problemas com o PIN?';
      if(open){
        const change=$('#changePinLockedBox');
        if(change) change.hidden=true;
      }
    });
  }
  const resetLocal=$('#resetLocalVaultBtn');
  if(resetLocal){
    resetLocal.addEventListener('click',async()=>{
      const ok=confirm('Recriar o acesso local apaga somente o cofre guardado neste navegador. Se houver dados neste dispositivo sem backup, serão perdidos. Continuar?');
      if(!ok)return;
      const again=confirm('Confirma que pretende apagar o cofre LOCAL deste dispositivo e criar um novo acesso?');
      if(!again)return;
      await resetLocalVaultForRecovery();
      location.reload();
    });
  }

  const vaultImportInput=$('#vaultImportInput');
  if(vaultImportInput){
    vaultImportInput.addEventListener('change',async e=>{
      const file=e.target.files?.[0];
      const msg=$('#vaultMessage');
      msg.className='form-message';
      if(!file)return;
      try{
        msg.textContent='A validar e restaurar o cofre cifrado...';
        await importBackup(file);
        msg.textContent='Cofre restaurado neste dispositivo. Introduza agora a palavra-passe/PIN do cofre do computador.';
        msg.classList.add('success');
        $('#vaultCreate').hidden=true;
        $('#vaultUnlock').hidden=false;
        $('#unlockPassphrase').value='';
        $('#unlockPassphrase').focus();
      }catch(err){
        msg.textContent=safeUserError(err,'Não foi possível restaurar este backup cifrado.');
        msg.classList.add('error');
      }finally{
        e.target.value='';
      }
    });
  }

  $('#createVaultBtn').addEventListener('click',async()=>{const a=$('#newPassphrase').value,b=$('#confirmPassphrase').value,msg=$('#vaultMessage');msg.className='form-message';if(a.length<8){msg.textContent='Use pelo menos 8 caracteres.';msg.classList.add('error');return;}if(a!==b){msg.textContent='As confirmações não coincidem.';msg.classList.add('error');return;}try{$('#createVaultBtn').disabled=true;msg.textContent='A criar cofre cifrado...';await createVault(a);clearPassphraseInputs();await enterApp();}catch(err){msg.textContent=safeUserError(err,'Não foi possível criar o cofre neste navegador.');msg.classList.add('error');}finally{$('#createVaultBtn').disabled=false;}});
  const unlock=async()=>{
    const msg=$('#vaultMessage');
    msg.className='form-message';
    try{
      $('#unlockVaultBtn').disabled=true;
      msg.textContent='A desbloquear...';
      await unlockVault($('#unlockPassphrase').value);
      clearPassphraseInputs();
      await enterApp();
    }catch(err){
      if(err?.message==='Palavra-passe/PIN incorreto.'){
        msg.textContent='Este PIN não corresponde ao cofre guardado neste dispositivo. Se está a usar o PIN do computador, importe primeiro o backup cifrado desse cofre ou use “Problemas com o PIN?”.';
      }else if(err?.message==='O cofre local não passou na validação de integridade.'){
        msg.textContent='O cofre deste dispositivo parece estar danificado. Não o apague se tiver dados importantes; restaure um backup cifrado válido.';
      }else{
        msg.textContent='Não foi possível desbloquear o cofre neste dispositivo.';
      }
      msg.classList.add('error');
    }finally{$('#unlockVaultBtn').disabled=false;}
  };
  $('#unlockVaultBtn').addEventListener('click',unlock); $('#unlockPassphrase').addEventListener('keydown',e=>{if(e.key==='Enter')unlock();});
}

window.addEventListener('DOMContentLoaded',()=>{initVaultUi().catch(()=>{$('#vaultMessage').textContent='Este navegador não conseguiu iniciar o armazenamento seguro.';$('#vaultMessage').className='form-message error';});});

let eventsWired = false;
function wireEvents(){
  if (eventsWired) return;
  eventsWired = true;
  $('#desktopNav').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b)showPage(b.dataset.page);});
  $('#mobileNav').addEventListener('click',e=>{const b=e.target.closest('[data-mobile]');if(!b)return;if(b.dataset.mobile==='add')$('#quickDialog').showModal();else if(b.dataset.mobile==='more')openMoreMenu();else showPage(b.dataset.mobile);});
  $('#quickAddBtn').addEventListener('click',()=>$('#quickDialog').showModal());
  document.addEventListener('click',e=>{const go=e.target.closest('[data-go]');if(go)showPage(go.dataset.go);const c=e.target.closest('[data-close-dialog]');if(c)closeDialog();const more=e.target.closest('[data-more-page]');if(more){closeDialog();showPage(more.dataset.morePage);}});
  $('#quickDialog').addEventListener('click',e=>{const b=e.target.closest('[data-quick]');if(!b)return;$('#quickDialog').close();({bill:openBillForm,income:openIncomeForm,market:openMarketForm,goal:openGoalForm})[b.dataset.quick]?.();});
  $('#newBillBtn').addEventListener('click',()=>openBillForm()); $('#newIncomeBtn').addEventListener('click',openIncomeForm); $('#newMarketBtn').addEventListener('click',openMarketForm); $('#newGoalBtn').addEventListener('click',openGoalForm);
  $('#billSearch').addEventListener('input',renderBills); $('#billStatusFilter').addEventListener('change',renderBills);
  $('#billsList').addEventListener('click',e=>{const pay=e.target.closest('[data-pay-bill]');if(pay){openPaymentForm(pay.dataset.payBill);return;}const b=e.target.closest('[data-bill-id]');if(b)openBillDetail(b.dataset.billId);});
  $('#upcomingBills').addEventListener('click',e=>{const b=e.target.closest('[data-bill-id]');if(b)openBillDetail(b.dataset.billId);});
  $('#calendarAgenda').addEventListener('click',e=>{const b=e.target.closest('[data-bill-id]');if(b)openBillDetail(b.dataset.billId);});
  $('#dialogBody').addEventListener('click',async e=>{const pay=e.target.closest('[data-detail-pay]');if(pay){openPaymentForm(pay.dataset.detailPay);return;}const edit=e.target.closest('[data-detail-edit]');if(edit){const b=appState.bills.find(x=>x.id===edit.dataset.detailEdit);openBillForm(b);return;}const cancel=e.target.closest('[data-detail-cancel]');if(cancel){const b=appState.bills.find(x=>x.id===cancel.dataset.detailCancel);if(b&&confirm('Cancelar esta fatura? O histórico de pagamentos será preservado.')){b.cancelled=true;b.updatedAt=new Date().toISOString();await commit('cancelled','bill');closeDialog();toast('Fatura cancelada.');}}});
  $('#monthPicker').addEventListener('change',()=>{selectedMonth=$('#monthPicker').value||selectedMonth;monthProfile();renderCurrentPage();});
  $('#monthPlanForm').addEventListener('submit',async e=>{e.preventDefault();const open=parseCents($('#openingBalance').value),budget=parseCents($('#monthlyBudget').value);if(!Number.isFinite(open)||!Number.isFinite(budget)||budget<0){toast('Valores de planeamento inválidos.');return;}const p=monthProfile();p.openingBalanceCents=open;p.budgetCents=budget;await commit('updated','planning');toast('Planeamento guardado.');});
  $('#incomeList').addEventListener('click',async e=>{const b=e.target.closest('[data-delete-income]');if(b&&confirm('Eliminar este rendimento?')){appState.incomes=appState.incomes.filter(x=>x.id!==b.dataset.deleteIncome);await commit('deleted','income');}});
  $('#marketList').addEventListener('change',async e=>{const t=e.target;if(t.matches('[data-market-toggle]')){const i=appState.market.find(x=>x.id===t.dataset.marketToggle);if(!i)return;i.purchased=t.checked;i.purchasedAt=t.checked?new Date().toISOString():null;i.updatedAt=new Date().toISOString();await commit('updated','market');}if(t.matches('[data-market-actual]')){const i=appState.market.find(x=>x.id===t.dataset.marketActual),v=parseCents(t.value);if(i&&Number.isFinite(v)&&v>=0){i.actualCents=v;i.updatedAt=new Date().toISOString();await saveState();renderMarket();}}});
  $('#marketList').addEventListener('click',async e=>{const b=e.target.closest('[data-delete-market]');if(b&&confirm('Eliminar este item?')){appState.market=appState.market.filter(x=>x.id!==b.dataset.deleteMarket);await commit('deleted','market');}});
  $('#goalList').addEventListener('click',async e=>{const add=e.target.closest('[data-goal-add]');if(add){openGoalContribution(add.dataset.goalAdd);return;}const ar=e.target.closest('[data-goal-archive]');if(ar&&confirm('Arquivar este objetivo?')){const g=appState.goals.find(x=>x.id===ar.dataset.goalArchive);if(!g)return;g.archived=true;await commit('archived','goal');}});
  $('#settingsForm').addEventListener('submit',async e=>{e.preventDefault();appState.settings.profileName=cleanString($('#profileName').value,80);appState.settings.currency=$('#currencySelect').value;appState.settings.theme=$('#themeSelect').value;applyTheme();await commit('updated','settings');toast('Preferências guardadas.');});
  $('#themeToggle').addEventListener('click',async()=>{appState.settings.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';applyTheme();$('#themeSelect').value=appState.settings.theme;await saveState();});
  $('#privacyToggle').addEventListener('click',()=>setPrivacy(!privacyHidden));
  $('#lockBtn').addEventListener('click',()=>lockApp('manual')); $('#securityLockBtn').addEventListener('click',()=>lockApp('manual'));
  $('#exportBackupBtn').addEventListener('click',exportBackup); $('#importBackupInput').addEventListener('change',async e=>{try{if(e.target.files[0])await importBackup(e.target.files[0]);}catch(err){$('#backupMessage').textContent=safeUserError(err);$('#backupMessage').className='form-message error';}finally{e.target.value='';}});
  $('#resetDataBtn').addEventListener('click',async()=>{if(confirm('ATENÇÃO: isto apaga definitivamente o cofre e todos os dados deste dispositivo. Continuar?')){await idbClearAll();location.reload();}});
  $('#notificationsBtn').addEventListener('click',()=>{showPage('dashboard');toast('Os alertas importantes aparecem no topo do Início.');});
}

async function enterApp() {
  clearPassphraseInputs();
  $('#vaultScreen').hidden=true; $('#app').hidden=false; $('#monthPicker').value=selectedMonth; renderNav(); applyTheme(); setPrivacy(false); wireEvents(); installSessionLockGuards(); showPage(currentPage()); recordUserActivity();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
async function initVaultUi() {
  installStorageGuards();
  installRuntimeErrorGuards();
  await openDb();
  const meta=await idbGet('meta','vault'); $('#vaultCreate').hidden=!!meta; $('#vaultUnlock').hidden=!meta;

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
  const unlock=async()=>{const msg=$('#vaultMessage');msg.className='form-message';try{$('#unlockVaultBtn').disabled=true;msg.textContent='A desbloquear...';await unlockVault($('#unlockPassphrase').value);clearPassphraseInputs();await enterApp();}catch(_err){msg.textContent='Não foi possível desbloquear. Verifique a palavra-passe/PIN.';msg.classList.add('error');}finally{$('#unlockVaultBtn').disabled=false;}};
  $('#unlockVaultBtn').addEventListener('click',unlock); $('#unlockPassphrase').addEventListener('keydown',e=>{if(e.key==='Enter')unlock();});
}

window.addEventListener('DOMContentLoaded',()=>{initVaultUi().catch(()=>{$('#vaultMessage').textContent='Este navegador não conseguiu iniciar o armazenamento seguro.';$('#vaultMessage').className='form-message error';});});

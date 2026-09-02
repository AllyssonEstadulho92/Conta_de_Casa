let lastDialogOpener = null;

function openDialog(title, html, mode='form') {
  const dialog = $('#formDialog');
  lastDialogOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  $('#dialogTitle').textContent = title;
  setHTML('#dialogBody', html);
  dialog.dataset.mode = mode;
  dialog.classList.toggle('detail-dialog', mode === 'detail');
  if (!dialog.open) dialog.showModal();
  requestAnimationFrame(() => dialog.querySelector('[data-close-dialog], input, select, textarea, button')?.focus({preventScroll:true}));
}

function closeDialog() {
  const dialog = $('#formDialog');
  if (dialog?.open) dialog.close();
  dialog?.classList.remove('detail-dialog');
  if (dialog) delete dialog.dataset.mode;
  const target = lastDialogOpener;
  lastDialogOpener = null;
  if (target?.isConnected) requestAnimationFrame(() => target.focus({preventScroll:true}));
}
const BILL_CATEGORIES = Object.freeze([
  'Casa',
  'Renda / Condomínio',
  'Energia',
  'Água',
  'Gás',
  'Internet / Telecomunicações',
  'Telemóvel',
  'Alimentação / Supermercado',
  'Saúde',
  'Farmácia',
  'Educação',
  'Transporte',
  'Combustível',
  'Automóvel',
  'Seguros',
  'Subscrições',
  'Ginásio / Desporto',
  'Impostos / Taxas',
  'Bancos / Crédito',
  'Lazer',
  'Animais',
  'Manutenção / Reparações',
  'Serviços',
  'Outros'
]);

function billCategoryOptions(selected='Casa') {
  const current=cleanString(selected||'Casa',80)||'Casa';
  const existing=[...new Set((appState?.bills||[]).map(b=>cleanString(b?.category,80)).filter(Boolean))];
  const categories=[...BILL_CATEGORIES];
  for(const name of existing){
    if(!categories.includes(name)) categories.splice(categories.length-1,0,name);
  }
  if(!categories.includes(current)) categories.splice(categories.length-1,0,current);
  return categories.map(name=>`<option value="${attr(name)}"${name===current?' selected':''}>${esc(name)}</option>`).join('');
}
async function withFormSubmissionLock(event, task) {
  event.preventDefault();
  const form=event.currentTarget;
  if(!form || form.dataset.submitting==='true') return false;
  form.dataset.submitting='true';
  const buttons=[...form.querySelectorAll('button[type="submit"],button:not([type])')];
  buttons.forEach(btn=>btn.disabled=true);
  try{return await task(form);}
  finally{
    if(form?.isConnected){
      delete form.dataset.submitting;
      buttons.forEach(btn=>btn.disabled=false);
    }
  }
}
function paymentFingerprint(payment) {
  return [payment.billId,payment.amountCents,payment.paidAt,payment.method].join('|');
}
function duplicatePaymentExists(payment, ignoreId='') {
  const key=paymentFingerprint(payment);
  return (appState?.payments||[]).some(existing=>existing.id!==ignoreId && paymentFingerprint(existing)===key);
}

function billFormHtml(bill=null){
  const due=bill?null:new Date(); if(due) due.setDate(due.getDate()+7);
  const date=bill?billDueDateKey(bill):dateKeyFromDate(due);
  const time=bill?billDueTimeKey(bill):'23:59';
  return `<form id="billForm" class="form-grid two"><input type="hidden" name="id" value="${attr(bill?.id||'')}"><label>Descrição<input name="title" required maxlength="80" value="${attr(bill?.title||'')}" autocomplete="off" spellcheck="false"></label><label>Fornecedor/entidade<input name="provider" maxlength="80" value="${attr(bill?.provider||'')}" autocomplete="off" spellcheck="false"></label><label>Categoria<select name="category" required>${billCategoryOptions(bill?.category||'Casa')}</select></label><label>Valor total<input name="amount" inputmode="decimal" required value="${bill?(bill.totalCents/100).toFixed(2).replace('.',','):''}" placeholder="0,00" autocomplete="off"></label><label>Vencimento<input name="dueDate" type="date" required value="${date}" autocomplete="off"></label><label>Hora limite<input name="dueTime" type="time" value="${time||'23:59'}" autocomplete="off"></label><label>Método<select name="method"><option>Débito automático</option><option>Transferência</option><option>Referência Multibanco</option><option>Cartão</option><option>Dinheiro</option><option>Outro</option></select></label><label>Recorrência<select name="recurrence"><option value="none">Sem recorrência</option><option value="weekly">Semanal</option><option value="monthly">Mensal</option><option value="quarterly">Trimestral</option><option value="semiannual">Semestral</option><option value="annual">Anual</option></select></label><label class="full-row">Referência<input name="reference" value="${attr(bill?.reference||'')}" autocomplete="off" spellcheck="false"></label><label class="full-row">Observações<textarea name="notes" autocomplete="off" spellcheck="false">${esc(bill?.notes||'')}</textarea></label><div class="button-row full-row"><button type="button" class="btn secondary" data-close-dialog>Cancelar</button><button type="submit" class="btn primary">${bill?'Guardar alterações':'Criar fatura'}</button></div></form>`;
}
function openBillForm(bill=null){ openDialog(bill?'Editar fatura':'Nova fatura',billFormHtml(bill)); const f=$('#billForm'); if(bill){f.method.value=bill.method||'Outro';f.recurrence.value=bill.recurrence||'none';} f.addEventListener('submit',handleBillSubmit); }
async function handleBillSubmit(e){
  return withFormSubmissionLock(e,async form=>{
    const fd=new FormData(form);
    const title=cleanString(fd.get('title'),80);
    if(!title){toast('Indique uma descrição para a fatura.');return false;}
    const total=parseCents(fd.get('amount'));
    if(!validCents(total,1)){toast('Introduza um valor monetário válido superior a zero, com no máximo 2 casas decimais.');return false;}
    const dueDate=cleanDateKey(fd.get('dueDate'));
    const dueTime=cleanTimeKey(fd.get('dueTime'),'23:59');
    const dueAt=composeLocalDateTimeIso(dueDate,dueTime);
    if(!dueDate||!dueAt){toast('Data de vencimento inválida.');return false;}
    const id=String(fd.get('id')||'');
    if(id && total<paidForBill(id)){
      toast(`O valor total não pode ficar abaixo do montante já pago (${money(paidForBill(id))}). Desfaça primeiro o pagamento incorreto.`);
      return false;
    }
    const data={title,provider:cleanString(fd.get('provider'),80),category:cleanString(fd.get('category'),80)||'Outros',totalCents:total,dueDate,dueTime,dueAt,method:cleanString(fd.get('method'),60),recurrence:cleanRecurrence(String(fd.get('recurrence'))),reference:cleanString(fd.get('reference'),160),notes:cleanMultiline(fd.get('notes'),1200),updatedAt:new Date().toISOString()};
    if(id){
      const b=appState.bills.find(x=>x.id===id);
      if(!b){toast('A fatura já não existe. Atualize a lista.');return false;}
      const before=billAuditSnapshot(b);
      Object.assign(b,data);
      recordBillAudit(b.id,'bill-updated',before,billAuditSnapshot(b));
      await commit('updated','bill');
    }else{
      const bill={id:uid(),...data,createdAt:new Date().toISOString(),cancelled:false,archived:false};
      appState.bills.push(bill);
      recordBillAudit(bill.id,'bill-created',{},billAuditSnapshot(bill));
      await commit('created','bill');
    }
    closeDialog();
    toast('Fatura guardada.');
    return true;
  });
}

function openBillDetail(id){
  const b=appState.bills.find(x=>x.id===id); if(!b)return;
  const paid=paidForBill(id),rem=remainingForBill(b),st=billStatus(b),urg=billUrgency(b);
  const payments=billPayments(id).sort((a,c)=>new Date(c.paidAt)-new Date(a.paidAt));
  const audit=billAuditEntries(id);
  const paymentSummary=paid>0?`<span><small>Já pago</small><strong data-money>${money(paid)}</strong></span>`:'';
  const excess=Math.max(0,paid-b.totalCents);
  const newestPayment=payments[0]||null;
  const excessWarning=excess&&newestPayment?`<div class="payment-integrity-alert" role="alert">
    <div><strong>Pagamento excedente detetado</strong><small>Os pagamentos ultrapassam o valor da fatura em <span data-money>${money(excess)}</span>. O registo mais recente é ${money(newestPayment.amountCents)} em ${fmtDateTime(newestPayment.paidAt)}.</small></div>
    <button class="btn danger" type="button" data-remove-excess-payment="${attr(newestPayment.id)}" data-payment-bill="${attr(b.id)}">Remover pagamento mais recente</button>
  </div>`:'';
  openDialog('Detalhes da fatura',`
    <div class="bill-detail">
      <div class="bill-detail-hero">
        <div class="bill-detail-title">
          <small>Fatura</small>
          <h3>${esc(b.title)}</h3>
          <p>${esc(b.provider||'Sem fornecedor')} · ${esc(b.category||'Outros')}</p>
        </div>
        <span class="status-chip ${st}">${statusLabel(st)}</span>
      </div>

      <div class="bill-detail-money">
        <span><small>Restante</small><strong data-money>${money(rem)}</strong></span>
        <span><small>Valor total</small><strong data-money>${money(b.totalCents)}</strong></span>
        ${paymentSummary}
      </div>

      <div class="detail-grid bill-detail-grid">
        <div class="detail-item"><small>Vencimento</small><strong>${fmtDate(billDueDateKey(b))} · ${esc(billDueTimeKey(b))}</strong><span class="detail-hint">${dueText(b)}</span></div>
        <div class="detail-item"><small>Urgência</small><strong class="${urg==='critical'||urg==='urgent'?'danger-text':''}">${urgencyLabel(urg)}</strong></div>
        <div class="detail-item"><small>Método</small><strong>${esc(b.method||'—')}</strong></div>
        <div class="detail-item"><small>Recorrência</small><strong>${recurrenceLabel(b.recurrence)}</strong></div>
        ${b.reference?`<div class="detail-item full-detail"><small>Referência</small><strong>${esc(b.reference)}</strong></div>`:''}
        ${b.notes?`<div class="detail-item full-detail"><small>Observações</small><strong>${esc(b.notes)}</strong></div>`:''}
      </div>

      ${excessWarning}
      <div class="detail-section">
        <div class="detail-section-head"><h3>Pagamentos</h3><small>${payments.length} registo${payments.length===1?'':'s'}</small></div>
        <div class="stack-list compact">${payments.length?payments.map(p=>`<div class="list-row"><div class="list-main"><strong data-money>${money(p.amountCents)}</strong><small>${fmtDateTime(p.paidAt)} · ${esc(p.method||'')}</small></div><div class="list-side payment-actions"><button class="link-btn" type="button" data-edit-payment="${attr(p.id)}" data-payment-bill="${attr(b.id)}">Editar</button><button class="link-btn danger-text" type="button" data-delete-payment="${attr(p.id)}" data-payment-bill="${attr(b.id)}">Eliminar</button></div></div>`).join(''):empty('Sem pagamentos registados.')}</div>
      </div>

      <div class="detail-section">
        <div class="detail-section-head"><h3>Histórico financeiro</h3><small>${audit.length} evento${audit.length===1?'':'s'}</small></div>
        <div class="audit-trail">${audit.length?audit.map(entry=>`<div class="audit-entry"><span class="audit-dot" aria-hidden="true"></span><div><strong>${esc(AUDIT_ACTION_LABELS[entry.action]||'Alteração registada')}</strong><small>${fmtDateTime(entry.at)}</small>${entry.changes?.length?`<div class="audit-changes">${entry.changes.map(change=>`<p><span>${esc(AUDIT_FIELD_LABELS[change.field]||change.field)}</span>${change.before===null?auditValueHtml(change.field,change.after):`${auditValueHtml(change.field,change.before)} <em>→</em> ${auditValueHtml(change.field,change.after)}`}</p>`).join('')}</div>`:''}</div></div>`).join(''):empty('O histórico detalhado começa na v34.')}</div>
      </div>

      <div class="dialog-actions detail-actions">
        ${rem>0&&!b.cancelled?`<button class="btn primary" data-detail-pay="${attr(b.id)}">Registar pagamento</button>`:''}
        <button class="btn secondary" data-detail-edit="${attr(b.id)}">Editar</button>
        <button class="btn secondary" data-detail-duplicate="${attr(b.id)}">Duplicar</button>
        ${!b.cancelled?`<button class="btn danger" data-detail-cancel="${attr(b.id)}">Cancelar fatura</button>`:''}
        <button class="btn secondary" type="button" data-close-dialog>Fechar</button>
        <button class="btn danger detail-delete" type="button" data-detail-delete="${attr(b.id)}">Excluir fatura</button>
      </div>
    </div>`, 'detail');
}
function openPaymentForm(id,paymentId=''){
  const b=appState.bills.find(x=>x.id===id); if(!b)return;
  const existing=paymentId?appState.payments.find(x=>x.id===paymentId&&x.billId===id):null;
  const rem=remainingForBill(b);
  const allowed=sumCents([rem,existing?.amountCents||0]);
  const amount=existing?.amountCents??rem;
  const paidAt=existing?localDateTimeInput(new Date(existing.paidAt)):localDateTimeInput();
  openDialog(existing?'Editar pagamento':'Registar pagamento',`<form id="paymentForm" class="form-grid"><input type="hidden" name="billId" value="${attr(b.id)}"><input type="hidden" name="paymentId" value="${attr(existing?.id||'')}"><p>Fatura: <strong>${esc(b.title)}</strong><br>${existing?'Máximo permitido após edição':'Restante'}: <strong data-money>${money(allowed)}</strong></p><label>Valor<input name="amount" inputmode="decimal" required value="${(amount/100).toFixed(2).replace('.',',')}" autocomplete="off"></label><label>Data e hora<input name="paidAt" type="datetime-local" required value="${paidAt}" autocomplete="off"></label><label>Método<select name="method"><option>Débito automático</option><option>Transferência</option><option>Referência Multibanco</option><option>Cartão</option><option>Dinheiro</option><option>Outro</option></select></label><label>Nota<input name="notes" value="${attr(existing?.notes||'')}" autocomplete="off" spellcheck="false"></label><div class="button-row"><button type="button" class="btn secondary" data-close-dialog>Cancelar</button><button class="btn primary" type="submit">${existing?'Guardar alterações':'Guardar pagamento'}</button></div></form>`);
  const form=$('#paymentForm');
  form.method.value=existing?.method||b.method||'Outro';
  form.addEventListener('submit',handlePaymentSubmit);
}
async function handlePaymentSubmit(e){
  return withFormSubmissionLock(e,async form=>{
    const fd=new FormData(form);
    const b=appState.bills.find(x=>x.id===fd.get('billId'));
    if(!b){toast('A fatura já não existe. Atualize a lista.');return false;}
    if(b.cancelled||b.archived){toast('Não é possível alterar pagamentos de uma fatura cancelada ou arquivada.');return false;}
    const paymentId=String(fd.get('paymentId')||'');
    const existing=paymentId?appState.payments.find(x=>x.id===paymentId&&x.billId===b.id):null;
    if(paymentId&&!existing){toast('O pagamento já não existe. Atualize a lista.');return false;}
    const amount=parseCents(fd.get('amount'));
    const maxAllowed=sumCents([remainingForBill(b),existing?.amountCents||0]);
    if(!validCents(amount,1)||!Number.isSafeInteger(maxAllowed)||amount>maxAllowed){toast(`O pagamento deve estar entre 0,01 e ${money(maxAllowed)}.`);return false;}
    const at=new Date(fd.get('paidAt'));
    if(Number.isNaN(at.getTime())){toast('Data de pagamento inválida.');return false;}
    const now=new Date().toISOString();
    const payment={id:existing?.id||uid(),billId:b.id,amountCents:amount,paidAt:at.toISOString(),method:cleanString(fd.get('method'),60),notes:cleanMultiline(fd.get('notes'),600),createdAt:existing?.createdAt||now,updatedAt:now};
    if(duplicatePaymentExists(payment,existing?.id||'')){toast('Este pagamento já está registado com o mesmo valor, data/hora e método.');return false;}
    const before={...billAuditSnapshot(b),...paymentAuditSnapshot(existing)};
    if(existing) Object.assign(existing,payment); else appState.payments.push(payment);
    b.updatedAt=now;
    const after={...billAuditSnapshot(b),...paymentAuditSnapshot(payment)};
    recordBillAudit(b.id,existing?'payment-updated':'payment-created',before,after,payment.id);
    await syncRecurringBills();
    await commit(existing?'updated':'created','payment');
    closeDialog();
    toast(existing?'Pagamento atualizado.':'Pagamento registado.');
    return true;
  });
}

function openIncomeForm(){
  openDialog('Novo rendimento',`<form id="incomeForm" class="form-grid"><label>Descrição<input name="description" required placeholder="Ex.: Salário" autocomplete="off" spellcheck="false"></label><label>Valor<input name="amount" inputmode="decimal" required placeholder="0,00" autocomplete="off"></label><label>Data<input name="receivedAt" type="datetime-local" required value="${localDateTimeInput()}" autocomplete="off"></label><div class="button-row"><button type="button" class="btn secondary" data-close-dialog>Cancelar</button><button class="btn primary">Guardar</button></div></form>`);
  $('#incomeForm').addEventListener('submit',e=>withFormSubmissionLock(e,async form=>{
    const fd=new FormData(form),description=cleanString(fd.get('description'),100),amount=parseCents(fd.get('amount')),receivedAt=new Date(fd.get('receivedAt'));
    if(!description){toast('Indique uma descrição para o rendimento.');return false;}
    if(!validCents(amount,1)){toast('Introduza um valor monetário válido superior a zero.');return false;}
    if(Number.isNaN(receivedAt.getTime())){toast('Data inválida.');return false;}
    appState.incomes.push({id:uid(),description,amountCents:amount,receivedAt:receivedAt.toISOString(),createdAt:new Date().toISOString()});
    await commit('created','income');closeDialog();toast('Rendimento guardado.');return true;
  }));
}
function openMarketForm(item=null){
  const existing=item?.id?appState.market.find(x=>x.id===item.id):null;
  const estimatedValue=existing?.estimatedCents>0?(existing.estimatedCents/100).toFixed(2).replace('.',','):'';
  const units=['un','kg','g','L','ml'];
  openDialog(existing?'Editar item do mercado':'Adicionar ao mercado',`<form id="marketForm" class="form-grid two"><input type="hidden" name="marketId" value="${attr(existing?.id||'')}"><label>Produto<input name="name" required value="${attr(existing?.name||'')}" autocomplete="off" spellcheck="false"></label><label>Categoria<input name="category" value="${attr(existing?.category||'')}" placeholder="Frutas, limpeza..." autocomplete="off" spellcheck="false"></label><label>Quantidade<input name="quantity" value="${attr(existing?.quantity||'1')}" autocomplete="off"></label><label>Unidade<select name="unit">${units.map(unit=>`<option value="${attr(unit)}" ${unit===(existing?.unit||'un')?'selected':''}>${esc(unit)}</option>`).join('')}</select></label><label class="full-row">Preço estimado<input name="estimated" inputmode="decimal" value="${attr(estimatedValue)}" placeholder="0,00" autocomplete="off"></label><div class="button-row full-row"><button type="button" class="btn secondary" data-close-dialog>Cancelar</button><button class="btn primary" type="submit">${existing?'Guardar alterações':'Adicionar'}</button></div></form>`);
  $('#marketForm').addEventListener('submit',e=>withFormSubmissionLock(e,async form=>{
    const fd=new FormData(form);
    const marketId=cleanString(fd.get('marketId'),80);
    const current=marketId?appState.market.find(x=>x.id===marketId):null;
    if(marketId&&!current){toast('O item já não existe. Atualize a lista.');return false;}
    const name=cleanString(fd.get('name'),100),est=parseCents(fd.get('estimated'));
    if(!name){toast('Indique o produto.');return false;}
    if(!validCents(est,0)){toast('Preço estimado inválido. Use zero ou um valor positivo.');return false;}
    const now=new Date().toISOString();
    const patch={name,category:cleanString(fd.get('category'),80)||'Outros',quantity:cleanString(fd.get('quantity'),40)||'1',unit:cleanString(fd.get('unit'),20)||'un',estimatedCents:est,updatedAt:now};
    if(current){
      Object.assign(current,patch);
    }else{
      appState.market.push({id:uid(),...patch,actualCents:0,purchased:false,createdAt:now,purchasedAt:null});
    }
    await commit(current?'updated':'created','market');closeDialog();toast(current?'Item atualizado.':'Item adicionado.');return true;
  }));
}
function openGoalForm(){
  openDialog('Novo objetivo',`<form id="goalForm" class="form-grid"><label>Objetivo<input name="name" required placeholder="Ex.: Fundo de emergência" autocomplete="off" spellcheck="false"></label><label>Meta<input name="target" inputmode="decimal" required placeholder="0,00" autocomplete="off"></label><label>Já poupado<input name="saved" inputmode="decimal" value="0,00" autocomplete="off"></label><label>Prazo opcional<input name="deadline" type="date" autocomplete="off"></label><div class="button-row"><button type="button" class="btn secondary" data-close-dialog>Cancelar</button><button class="btn primary">Criar objetivo</button></div></form>`);
  $('#goalForm').addEventListener('submit',e=>withFormSubmissionLock(e,async form=>{
    const fd=new FormData(form),name=cleanString(fd.get('name'),100),target=parseCents(fd.get('target')),saved=parseCents(fd.get('saved'));
    if(!name){toast('Indique o nome do objetivo.');return false;}
    if(!validCents(target,1)||!validCents(saved,0)){toast('Valores inválidos.');return false;}
    const deadlineKey=cleanDateKey(fd.get('deadline'));
    if(fd.get('deadline')&&!deadlineKey){toast('Prazo inválido.');return false;}
    const deadline=deadlineKey?composeLocalDateTimeIso(deadlineKey,'12:00'):null;
    appState.goals.push({id:uid(),name,targetCents:target,savedCents:Math.min(saved,target),deadline,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),archived:false});
    await commit('created','goal');closeDialog();toast('Objetivo criado.');return true;
  }));
}
function openGoalContribution(id){
  const g=appState.goals.find(x=>x.id===id);if(!g)return;
  openDialog('Adicionar ao objetivo',`<form id="goalAddForm" class="form-grid"><p><strong>${esc(g.name)}</strong><br>Falta <span data-money>${money(Math.max(0,g.targetCents-g.savedCents))}</span></p><label>Valor<input name="amount" inputmode="decimal" required placeholder="0,00" autocomplete="off"></label><div class="button-row"><button type="button" class="btn secondary" data-close-dialog>Cancelar</button><button class="btn primary">Adicionar</button></div></form>`);
  $('#goalAddForm').addEventListener('submit',e=>withFormSubmissionLock(e,async form=>{
    const amount=parseCents(new FormData(form).get('amount'));
    if(!validCents(amount,1)){toast('Valor inválido.');return false;}
    const updated=sumCents([g.savedCents,amount]);
    if(!Number.isSafeInteger(updated)){toast('O total do objetivo excede o limite monetário seguro.');return false;}
    g.savedCents=Math.min(g.targetCents,updated);g.updatedAt=new Date().toISOString();await commit('updated','goal');closeDialog();toast('Objetivo atualizado.');return true;
  }));
}
async function exportBackup(){
  const msg=$('#backupMessage');
  try{
    if(!vaultKey||!appState)throw new Error('Cofre bloqueado.');
    appState.security ||= {};
    appState.security.lastBackupAt=new Date().toISOString();
    logActivity('exported','backup');
    await saveState();
    const meta=await idbGet('meta','vault'),secure=await idbGet('secure','state');
    if(!meta||!secure)throw new Error('Cofre incompleto.');
    const envelope=await buildBackupEnvelope(meta,secure);
    const text=JSON.stringify(envelope,null,2);
    if(backupContainsPlaintextFinancialData(text))throw new Error('Backup em claro bloqueado.');
    const blob=new Blob([text],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`Conta_de_Casa_backup_cifrado_${new Date().toISOString().slice(0,10)}.json`;
    a.rel='noopener';
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    msg.textContent='Backup cifrado exportado e validado.';
    msg.className='form-message success';
    renderSecurity();
  }catch(err){
    msg.textContent=safeUserError(err,'Backup bloqueado por validação de segurança.');
    msg.className='form-message error';
  }
}
async function importBackup(file){
  if(!file) return;
  if(file.size>MAX_IMPORT_BYTES)throw new Error('Ficheiro de backup demasiado grande.');
  const normalized=await parseBackupText(await file.text());
  const existing=await idbGet('meta','vault');
  if(existing && !confirm('Restaurar este backup substitui o cofre local deste dispositivo. Confirma que já preservou o cofre atual ou pretende continuar?')) return false;
  await idbPutVaultPair(normalized.meta,normalized.secure);
  await idbPut('device',{key:'restore-meta',lastRestoreAt:new Date().toISOString()});
  lockApp('restore');
  const vaultMsg=$('#vaultMessage');
  if(vaultMsg){
    vaultMsg.textContent='Backup cifrado validado. Desbloqueie com a palavra-passe do backup.';
    vaultMsg.className='form-message success';
  }
}

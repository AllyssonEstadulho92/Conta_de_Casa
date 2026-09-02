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
function billFormHtml(bill=null){
  const due=bill?null:new Date(); if(due) due.setDate(due.getDate()+7);
  const date=bill?billDueDateKey(bill):dateKeyFromDate(due);
  const time=bill?billDueTimeKey(bill):'23:59';
  return `<form id="billForm" class="form-grid two"><input type="hidden" name="id" value="${attr(bill?.id||'')}"><label>Descrição<input name="title" required maxlength="80" value="${attr(bill?.title||'')}" autocomplete="off" spellcheck="false"></label><label>Fornecedor/entidade<input name="provider" maxlength="80" value="${attr(bill?.provider||'')}" autocomplete="off" spellcheck="false"></label><label>Categoria<select name="category" required>${billCategoryOptions(bill?.category||'Casa')}</select></label><label>Valor total<input name="amount" inputmode="decimal" required value="${bill?(bill.totalCents/100).toFixed(2).replace('.',','):''}" placeholder="0,00" autocomplete="off"></label><label>Vencimento<input name="dueDate" type="date" required value="${date}" autocomplete="off"></label><label>Hora limite<input name="dueTime" type="time" value="${time||'23:59'}" autocomplete="off"></label><label>Método<select name="method"><option>Débito automático</option><option>Transferência</option><option>Referência Multibanco</option><option>Cartão</option><option>Dinheiro</option><option>Outro</option></select></label><label>Recorrência<select name="recurrence"><option value="none">Sem recorrência</option><option value="weekly">Semanal</option><option value="monthly">Mensal</option><option value="quarterly">Trimestral</option><option value="semiannual">Semestral</option><option value="annual">Anual</option></select></label><label class="full-row">Referência<input name="reference" value="${attr(bill?.reference||'')}" autocomplete="off" spellcheck="false"></label><label class="full-row">Observações<textarea name="notes" autocomplete="off" spellcheck="false">${esc(bill?.notes||'')}</textarea></label><div class="button-row full-row"><button type="button" class="btn secondary" data-close-dialog>Cancelar</button><button type="submit" class="btn primary">${bill?'Guardar alterações':'Criar fatura'}</button></div></form>`;
}
function openBillForm(bill=null){ openDialog(bill?'Editar fatura':'Nova fatura',billFormHtml(bill)); const f=$('#billForm'); if(bill){f.method.value=bill.method||'Outro';f.recurrence.value=bill.recurrence||'none';} f.addEventListener('submit',handleBillSubmit); }
async function handleBillSubmit(e){
  e.preventDefault();
  const fd=new FormData(e.currentTarget);
  const title=cleanString(fd.get('title'),80);
  if(!title){toast('Indique uma descrição para a fatura.');return;}
  const total=parseCents(fd.get('amount'));
  if(!Number.isFinite(total)||total<=0){toast('Introduza um valor monetário válido superior a zero, com no máximo 2 casas decimais.');return;}
  const dueDate=cleanDateKey(fd.get('dueDate'));
  const dueTime=cleanTimeKey(fd.get('dueTime'),'23:59');
  const dueAt=composeLocalDateTimeIso(dueDate,dueTime);
  if(!dueDate||!dueAt){toast('Data de vencimento inválida.');return;}
  const data={title,provider:cleanString(fd.get('provider'),80),category:cleanString(fd.get('category'),80)||'Outros',totalCents:total,dueDate,dueTime,dueAt,method:cleanString(fd.get('method'),60),recurrence:cleanRecurrence(String(fd.get('recurrence'))),reference:cleanString(fd.get('reference'),160),notes:cleanMultiline(fd.get('notes'),1200),updatedAt:new Date().toISOString()};
  const id=String(fd.get('id')||'');
  if(id){const b=appState.bills.find(x=>x.id===id);if(!b)return;Object.assign(b,data);await commit('updated','bill');}
  else{appState.bills.push({id:uid(),...data,createdAt:new Date().toISOString(),cancelled:false,archived:false});await commit('created','bill');}
  closeDialog(); toast('Fatura guardada.');
}

function openBillDetail(id){
  const b=appState.bills.find(x=>x.id===id); if(!b)return;
  const paid=paidForBill(id),rem=remainingForBill(b),st=billStatus(b),urg=billUrgency(b);
  const payments=billPayments(id).sort((a,c)=>new Date(c.paidAt)-new Date(a.paidAt));
  const paymentSummary=paid>0?`<span><small>Já pago</small><strong data-money>${money(paid)}</strong></span>`:'';
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

      <div class="detail-section">
        <div class="detail-section-head"><h3>Pagamentos</h3><small>${payments.length} registo${payments.length===1?'':'s'}</small></div>
        <div class="stack-list compact">${payments.length?payments.map(p=>`<div class="list-row"><div class="list-main"><strong data-money>${money(p.amountCents)}</strong><small>${fmtDateTime(p.paidAt)} · ${esc(p.method||'')}</small></div></div>`).join(''):empty('Sem pagamentos registados.')}</div>
      </div>

      <div class="dialog-actions detail-actions">
        ${rem>0&&!b.cancelled?`<button class="btn primary" data-detail-pay="${attr(b.id)}">Registar pagamento</button>`:''}
        <button class="btn secondary" data-detail-edit="${attr(b.id)}">Editar</button>
        ${!b.cancelled?`<button class="btn danger" data-detail-cancel="${attr(b.id)}">Cancelar fatura</button>`:''}
        <button class="btn secondary" type="button" data-close-dialog>Fechar</button>
        <button class="btn danger detail-delete" type="button" data-detail-delete="${attr(b.id)}">Excluir fatura</button>
      </div>
    </div>`, 'detail');
}
function openPaymentForm(id){
  const b=appState.bills.find(x=>x.id===id); if(!b)return;
  const rem=remainingForBill(b);
  openDialog('Registar pagamento',`<form id="paymentForm" class="form-grid"><input type="hidden" name="billId" value="${attr(b.id)}"><p>Fatura: <strong>${esc(b.title)}</strong><br>Restante: <strong data-money>${money(rem)}</strong></p><label>Valor<input name="amount" inputmode="decimal" required value="${(rem/100).toFixed(2).replace('.',',')}" autocomplete="off"></label><label>Data e hora<input name="paidAt" type="datetime-local" required value="${localDateTimeInput()}" autocomplete="off"></label><label>Método<select name="method"><option>Débito automático</option><option>Transferência</option><option>Referência Multibanco</option><option>Cartão</option><option>Dinheiro</option><option>Outro</option></select></label><label>Nota<input name="notes" autocomplete="off" spellcheck="false"></label><div class="button-row"><button type="button" class="btn secondary" data-close-dialog>Cancelar</button><button class="btn primary" type="submit">Guardar pagamento</button></div></form>`);
  $('#paymentForm').addEventListener('submit',handlePaymentSubmit);
}
async function handlePaymentSubmit(e){
  e.preventDefault();
  const fd=new FormData(e.currentTarget);
  const b=appState.bills.find(x=>x.id===fd.get('billId'));if(!b)return;
  const amount=parseCents(fd.get('amount'));const rem=remainingForBill(b);
  if(!Number.isFinite(amount)||amount<=0||amount>rem){toast(`O pagamento deve estar entre 0,01 e ${money(rem)}.`);return;}
  const at=new Date(fd.get('paidAt'));if(Number.isNaN(at.getTime())){toast('Data de pagamento inválida.');return;}
  appState.payments.push({id:uid(),billId:b.id,amountCents:amount,paidAt:at.toISOString(),method:cleanString(fd.get('method'),60),notes:cleanMultiline(fd.get('notes'),600),createdAt:new Date().toISOString()});
  await syncRecurringBills();await commit('created','payment');closeDialog();toast('Pagamento registado.');
}

function openIncomeForm(){
  openDialog('Novo rendimento',`<form id="incomeForm" class="form-grid"><label>Descrição<input name="description" required placeholder="Ex.: Salário" autocomplete="off" spellcheck="false"></label><label>Valor<input name="amount" inputmode="decimal" required placeholder="0,00" autocomplete="off"></label><label>Data<input name="receivedAt" type="datetime-local" required value="${localDateTimeInput()}" autocomplete="off"></label><div class="button-row"><button type="button" class="btn secondary" data-close-dialog>Cancelar</button><button class="btn primary">Guardar</button></div></form>`);
  $('#incomeForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const fd=new FormData(e.currentTarget);const amount=parseCents(fd.get('amount'));const receivedAt=new Date(fd.get('receivedAt'));
    if(!Number.isFinite(amount)||amount<=0){toast('Valor inválido.');return;}
    if(Number.isNaN(receivedAt.getTime())){toast('Data inválida.');return;}
    appState.incomes.push({id:uid(),description:cleanString(fd.get('description'),100),amountCents:amount,receivedAt:receivedAt.toISOString(),createdAt:new Date().toISOString()});
    await commit('created','income');closeDialog();toast('Rendimento guardado.');
  });
}
function openMarketForm(){
  openDialog('Adicionar ao mercado',`<form id="marketForm" class="form-grid two"><label>Produto<input name="name" required autocomplete="off" spellcheck="false"></label><label>Categoria<input name="category" placeholder="Frutas, limpeza..." autocomplete="off" spellcheck="false"></label><label>Quantidade<input name="quantity" value="1" autocomplete="off"></label><label>Unidade<select name="unit"><option>un</option><option>kg</option><option>g</option><option>L</option><option>ml</option></select></label><label class="full-row">Preço estimado<input name="estimated" inputmode="decimal" placeholder="0,00" autocomplete="off"></label><div class="button-row full-row"><button type="button" class="btn secondary" data-close-dialog>Cancelar</button><button class="btn primary">Adicionar</button></div></form>`);
  $('#marketForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const fd=new FormData(e.currentTarget),est=parseCents(fd.get('estimated'));
    appState.market.push({id:uid(),name:cleanString(fd.get('name'),100),category:cleanString(fd.get('category'),80),quantity:cleanString(fd.get('quantity'),40)||'1',unit:cleanString(fd.get('unit'),20),estimatedCents:Number.isFinite(est)&&est>=0?est:0,actualCents:0,purchased:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),purchasedAt:null});
    await commit('created','market');closeDialog();toast('Item adicionado.');
  });
}
function openGoalForm(){
  openDialog('Novo objetivo',`<form id="goalForm" class="form-grid"><label>Objetivo<input name="name" required placeholder="Ex.: Fundo de emergência" autocomplete="off" spellcheck="false"></label><label>Meta<input name="target" inputmode="decimal" required placeholder="0,00" autocomplete="off"></label><label>Já poupado<input name="saved" inputmode="decimal" value="0,00" autocomplete="off"></label><label>Prazo opcional<input name="deadline" type="date" autocomplete="off"></label><div class="button-row"><button type="button" class="btn secondary" data-close-dialog>Cancelar</button><button class="btn primary">Criar objetivo</button></div></form>`);
  $('#goalForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const fd=new FormData(e.currentTarget),target=parseCents(fd.get('target')),saved=parseCents(fd.get('saved'));
    if(!Number.isFinite(target)||target<=0||!Number.isFinite(saved)||saved<0){toast('Valores inválidos.');return;}
    const deadline=fd.get('deadline')?new Date(`${fd.get('deadline')}T12:00:00`):null;
    if(deadline&&Number.isNaN(deadline.getTime())){toast('Prazo inválido.');return;}
    appState.goals.push({id:uid(),name:cleanString(fd.get('name'),100),targetCents:target,savedCents:Math.min(saved,target),deadline:deadline?deadline.toISOString():null,createdAt:new Date().toISOString(),archived:false});
    await commit('created','goal');closeDialog();toast('Objetivo criado.');
  });
}
function openGoalContribution(id){
  const g=appState.goals.find(x=>x.id===id);if(!g)return;
  openDialog('Adicionar ao objetivo',`<form id="goalAddForm" class="form-grid"><p><strong>${esc(g.name)}</strong><br>Falta <span data-money>${money(Math.max(0,g.targetCents-g.savedCents))}</span></p><label>Valor<input name="amount" inputmode="decimal" required placeholder="0,00" autocomplete="off"></label><div class="button-row"><button type="button" class="btn secondary" data-close-dialog>Cancelar</button><button class="btn primary">Adicionar</button></div></form>`);
  $('#goalAddForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const amount=parseCents(new FormData(e.currentTarget).get('amount'));
    if(!Number.isFinite(amount)||amount<=0){toast('Valor inválido.');return;}
    g.savedCents=Math.min(g.targetCents,g.savedCents+amount);g.updatedAt=new Date().toISOString();await commit('updated','goal');closeDialog();toast('Objetivo atualizado.');
  });
}
function openMoreMenu(){
  openDialog('Mais secções',`<div class="quick-grid">${[['calendar','Calendário','calendar'],['market','Mercado','market'],['reports','Relatórios','report'],['goals','Objetivos','goal'],['security','Segurança','shield'],['settings','Configurações','settings']].map(([id,label,ic])=>`<button type="button" data-more-page="${id}">${icon(ic,22)}<br>${label}</button>`).join('')}</div>`);
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
  await idbPut('meta',normalized.meta);
  await idbPut('secure',normalized.secure);
  lockApp('restore');
  const vaultMsg=$('#vaultMessage');
  if(vaultMsg){
    vaultMsg.textContent='Backup cifrado validado. Desbloqueie com a palavra-passe do backup.';
    vaultMsg.className='form-message success';
  }
}

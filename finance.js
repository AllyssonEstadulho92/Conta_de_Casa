function sumCents(values) {
  let total = 0n;
  for (const value of values || []) {
    if (!Number.isSafeInteger(value)) return NaN;
    total += BigInt(value);
  }
  if (total > BigInt(Number.MAX_SAFE_INTEGER) || total < BigInt(Number.MIN_SAFE_INTEGER)) return NaN;
  return Number(total);
}
function billPayments(billId) { return (appState?.payments || []).filter(p => p.billId === billId); }
function paidForBill(billId) { return sumCents(billPayments(billId).map(p => p.amountCents)); }
function billLedger(bill) {
  const totalCents = bill?.totalCents;
  const paidCents = paidForBill(bill?.id);
  const valid = Number.isSafeInteger(totalCents) && totalCents > 0 && Number.isSafeInteger(paidCents) && paidCents >= 0;
  if (!valid) return { totalCents, paidCents, remainingCents:NaN, overpaidCents:NaN, valid:false };
  return {
    totalCents,
    paidCents,
    remainingCents:Math.max(0,totalCents-paidCents),
    overpaidCents:Math.max(0,paidCents-totalCents),
    valid:true
  };
}
function remainingForBill(bill) { return billLedger(bill).remainingCents; }

function billDueDateKey(bill) { return cleanDateKey(bill?.dueDate) || dateKeyFromValue(bill?.dueAt); }
function billDueTimeKey(bill) { return cleanTimeKey(bill?.dueTime) || timeKeyFromValue(bill?.dueAt) || '23:59'; }
function billDaysUntil(bill, now = new Date()) {
  const due = billDueDateKey(bill);
  const today = currentLocalDateKey(now);
  if (!due || !today) return NaN;
  return civilDayDiff(today, due);
}
function billInMonth(bill, month = selectedMonth) {
  const due = billDueDateKey(bill);
  return Boolean(due && due.slice(0,7) === month);
}
function billStatus(bill, now = new Date()) {
  if (bill.cancelled) return 'cancelled';
  if (bill.archived) return 'archived';
  const ledger = billLedger(bill);
  if (!ledger.valid) return 'invalid';
  const rem = ledger.remainingCents;
  if (rem <= 0) return 'paid';
  const days = billDaysUntil(bill, now);
  if (!Number.isFinite(days)) return 'invalid';
  if (days < 0) return 'overdue';
  if (ledger.paidCents > 0) return 'partial';
  if (days === 0) return 'due-today';
  return 'pending';
}
function billUrgency(bill, now = new Date()) {
  const st = billStatus(bill, now);
  if (['paid','cancelled','archived','invalid','overdue'].includes(st)) return 'normal';
  const days = billDaysUntil(bill, now);
  if (!Number.isFinite(days)) return 'normal';
  if (days === 0) return 'critical';
  if (days <= 3) return 'urgent';
  if (days <= 7) return 'attention';
  return 'normal';
}
function statusLabel(st) {
  return ({pending:'Por pagar',partial:'Pago parcialmente',paid:'Pago',overdue:'Em atraso','due-today':'Vence hoje',cancelled:'Cancelado',archived:'Arquivado',invalid:'Dados inválidos'})[st] || st;
}
function urgencyLabel(st) { return ({normal:'Normal',attention:'Atenção',urgent:'Urgente',critical:'Crítico'})[st] || st; }
function recurrenceLabel(value) {
  return ({none:'Sem recorrência',weekly:'Semanal',monthly:'Mensal',quarterly:'Trimestral',semiannual:'Semestral',annual:'Anual'})[value] || 'Sem recorrência';
}
const AUDIT_FIELD_LABELS = Object.freeze({
  title:'Descrição',provider:'Fornecedor',category:'Categoria',totalCents:'Valor total',dueDate:'Vencimento',dueTime:'Hora limite',method:'Método',recurrence:'Recorrência',cancelled:'Estado',
  paymentAmountCents:'Valor do pagamento',paymentPaidAt:'Data do pagamento',paymentMethod:'Método do pagamento',paidCents:'Total pago',remainingCents:'Em falta',status:'Estado financeiro'
});
const AUDIT_MONEY_FIELDS = new Set(['totalCents','paymentAmountCents','paidCents','remainingCents']);
const AUDIT_ACTION_LABELS = Object.freeze({
  'bill-created':'Fatura criada','bill-updated':'Fatura atualizada','bill-duplicated':'Fatura duplicada','bill-cancelled':'Fatura cancelada','bill-deleted':'Fatura eliminada','bill-recurring-created':'Ocorrência recorrente criada',
  'payment-created':'Pagamento registado','payment-updated':'Pagamento atualizado','payment-deleted':'Pagamento eliminado'
});
function billAuditSnapshot(bill, now = new Date()) {
  if (!bill) return {};
  const ledger=billLedger(bill);
  return {
    title:bill.title||'',provider:bill.provider||'',category:bill.category||'',totalCents:bill.totalCents,
    dueDate:billDueDateKey(bill),dueTime:billDueTimeKey(bill),method:bill.method||'',recurrence:bill.recurrence||'none',cancelled:Boolean(bill.cancelled),
    paidCents:ledger.paidCents,remainingCents:ledger.remainingCents,status:billStatus(bill,now)
  };
}
function paymentAuditSnapshot(payment) {
  if (!payment) return {};
  return {paymentAmountCents:payment.amountCents,paymentPaidAt:payment.paidAt||'',paymentMethod:payment.method||''};
}
function auditChanges(before = {}, after = {}) {
  const fields=[...new Set([...Object.keys(before||{}),...Object.keys(after||{})])];
  return fields.filter(field=>AUDIT_FIELD_LABELS[field] && before?.[field]!==after?.[field]).map(field=>({
    field,before:before?.[field]??null,after:after?.[field]??null
  })).slice(0,20);
}
function recordBillAudit(billId,action,before={},after={},paymentId='') {
  if (!appState || !billId || !AUDIT_ACTION_LABELS[action]) return;
  const changes=auditChanges(before,after);
  appState.auditTrail ||= [];
  appState.auditTrail.push({id:uid(),billId:String(billId),paymentId:paymentId||undefined,action,changes,at:new Date().toISOString()});
  if (appState.auditTrail.length>2000) appState.auditTrail=appState.auditTrail.slice(-2000);
}
function billAuditEntries(billId) {
  return (appState?.auditTrail||[]).filter(entry=>entry.billId===billId).sort((a,b)=>new Date(b.at)-new Date(a.at));
}
function auditValueHtml(field,value) {
  if (value===null || value===undefined || value==='') return '<em>Sem valor</em>';
  if (AUDIT_MONEY_FIELDS.has(field)) return `<span data-money>${money(value)}</span>`;
  if (field==='status') return esc(statusLabel(value));
  if (field==='recurrence') return esc(recurrenceLabel(value));
  if (field==='cancelled') return value?'Cancelada':'Ativa';
  if (field==='dueDate') return esc(fmtDate(value));
  if (field==='paymentPaidAt') return esc(fmtDateTime(value));
  return esc(value);
}
function dueText(bill, now = new Date()) {
  if (remainingForBill(bill) === 0) return 'Concluída';
  const days = billDaysUntil(bill, now);
  if (!Number.isFinite(days)) return 'Data inválida';
  if (days < 0) {
    const d = Math.abs(days);
    return `${d} dia${d===1?'':'s'} em atraso`;
  }
  if (days === 0) return 'Vence hoje';
  if (days === 1) return 'Vence amanhã';
  return `${days} dias para vencer`;
}
function compareBillsByDue(a,b) {
  const ad=billDueDateKey(a), bd=billDueDateKey(b);
  if(ad!==bd) return ad.localeCompare(bd);
  return billDueTimeKey(a).localeCompare(billDueTimeKey(b));
}
function nextRecurrenceDateKey(dateKey, recurrence) {
  if (!cleanDateKey(dateKey)) return '';
  if (recurrence === 'weekly') return addCivilDays(dateKey, 7);
  if (recurrence === 'monthly') return addCivilMonthsClamped(dateKey, 1);
  if (recurrence === 'quarterly') return addCivilMonthsClamped(dateKey, 3);
  if (recurrence === 'semiannual') return addCivilMonthsClamped(dateKey, 6);
  if (recurrence === 'annual') return addCivilMonthsClamped(dateKey, 12);
  return dateKey;
}
function nextDueAt(dueAt, recurrence, dueDate = '', dueTime = '') {
  const currentDate = cleanDateKey(dueDate) || dateKeyFromValue(dueAt);
  const nextDate = nextRecurrenceDateKey(currentDate, recurrence);
  const time = cleanTimeKey(dueTime) || timeKeyFromValue(dueAt) || '23:59';
  return composeLocalDateTimeIso(nextDate, time);
}
function recurrenceSeriesIdFor(bill, bills = appState?.bills || []) {
  if (bill?.recurrenceSeriesId) return bill.recurrenceSeriesId;
  let current = bill;
  const seen = new Set();
  while (current?.recurrenceParentId && !seen.has(current.id)) {
    seen.add(current.id);
    const parent = bills.find(x=>x.id===current.recurrenceParentId);
    if (!parent) break;
    current = parent;
  }
  return current?.id || bill?.id || '';
}
function recurrenceOccurrenceKey(seriesId, dateKey) { return `${seriesId}:${dateKey}`; }

async function syncRecurringBills() {
  if (!appState) return;
  const horizon = addCivilMonthsClamped(`${currentLocalMonthKey()}-01`, 2);
  let changed = false;
  for (let loops=0; loops<24; loops++) {
    let loopChanged = false;
    const sources = [...appState.bills].filter(b => b.recurrence && b.recurrence !== 'none' && !b.cancelled && !b.archived);
    for (const bill of sources) {
      const currentDate = billDueDateKey(bill);
      if (!currentDate) continue;
      const nextDate = nextRecurrenceDateKey(currentDate, bill.recurrence);
      if (!nextDate || civilDayDiff(nextDate, horizon) < 0) continue;
      const seriesId = recurrenceSeriesIdFor(bill);
      const occurrenceKey = recurrenceOccurrenceKey(seriesId, nextDate);
      const exists = appState.bills.some(x => {
        const sameKey = x.recurrenceKey === occurrenceKey;
        const sameSeriesDate = recurrenceSeriesIdFor(x) === seriesId && billDueDateKey(x) === nextDate;
        return sameKey || sameSeriesDate;
      });
      if (exists) continue;
      if (!bill.recurrenceSeriesId) { bill.recurrenceSeriesId = seriesId; changed = true; }
      if (!bill.recurrenceKey) { bill.recurrenceKey = recurrenceOccurrenceKey(seriesId, currentDate); changed = true; }
      const nextTime = billDueTimeKey(bill);
      const recurringBill={
        ...bill,
        id: cleanString(`rec_${seriesId}_${nextDate}`,80),
        dueDate:nextDate,
        dueTime:nextTime,
        dueAt:composeLocalDateTimeIso(nextDate,nextTime),
        issueAt:null,
        reference:'',
        createdAt:new Date().toISOString(),
        updatedAt:new Date().toISOString(),
        recurrenceParentId:bill.id,
        recurrenceSeriesId:seriesId,
        recurrenceKey:occurrenceKey,
        archived:false,
        cancelled:false
      };
      appState.bills.push(recurringBill);
      recordBillAudit(recurringBill.id,'bill-recurring-created',{},billAuditSnapshot(recurringBill));
      loopChanged = changed = true;
    }
    if (!loopChanged) break;
  }
  if (changed) await saveState();
}

function monthNumbers(month = selectedMonth, now = new Date()) {
  const profile = monthProfile(month);
  const incomes = sumCents(appState.incomes.filter(i=>inSelectedMonth(i.receivedAt, month)).map(i=>i.amountCents));
  const paymentTotal = sumCents(appState.payments.filter(p=>inSelectedMonth(p.paidAt, month)).map(p=>p.amountCents));
  const marketSpent = sumCents(appState.market.filter(i=>i.purchased && inSelectedMonth(i.purchasedAt || i.updatedAt, month)).map(i=>i.actualCents || i.estimatedCents || 0));
  const bills = appState.bills.filter(b=>billInMonth(b, month) && !b.cancelled && !b.archived);
  let pending = 0;
  let overdue = 0;
  for (const bill of bills) {
    const st = billStatus(bill, now);
    const rem = remainingForBill(bill);
    if (st === 'overdue') overdue = sumCents([overdue,rem]);
    else if (['pending','partial','due-today'].includes(st)) pending = sumCents([pending,rem]);
  }
  const outstanding = sumCents([pending,overdue]);
  const ledgerCurrent = sumCents([profile.openingBalanceCents,incomes,-paymentTotal,-marketSpent]);
  const hasAccountBalance = Number.isSafeInteger(profile.accountBalanceCents);
  const current = hasAccountBalance ? profile.accountBalanceCents : ledgerCurrent;
  const reconciliationDiff = hasAccountBalance ? sumCents([current,-ledgerCurrent]) : 0;
  const projected = sumCents([current,-outstanding]);
  const budgetUsed = sumCents([paymentTotal,marketSpent]);
  return { profile, incomes, paymentTotal, marketSpent, pending, overdue, outstanding, ledgerCurrent, hasAccountBalance, reconciliationDiff, current, projected, budgetUsed, bills };
}
function dashboardNumbers(month = selectedMonth, now = new Date()) {
  const n = monthNumbers(month, now);
  const pendingBills = n.bills.filter(b=>['pending','partial','due-today'].includes(billStatus(b,now)));
  const overdueBills = n.bills.filter(b=>billStatus(b,now)==='overdue');
  const next7Bills = pendingBills.filter(b=>{
    const days=billDaysUntil(b,now);
    return Number.isFinite(days) && days>=0 && days<=7;
  });
  return {
    ...n,
    pendingCount:pendingBills.length,
    overdueCount:overdueBills.length,
    next7:sumCents(next7Bills.map(b=>remainingForBill(b))),
    next7Count:next7Bills.length,
    criticalCount:pendingBills.filter(b=>billUrgency(b,now)==='critical').length
  };
}
function categoryTotals(month = selectedMonth) {
  const map = new Map();
  const payments = appState.payments.filter(p=>inSelectedMonth(p.paidAt, month));
  for (const p of payments) {
    const bill = appState.bills.find(b=>b.id===p.billId); const cat = bill?.category || 'Outros';
    map.set(cat,sumCents([map.get(cat)||0,p.amountCents]));
  }
  const market = appState.market.filter(i=>i.purchased && inSelectedMonth(i.purchasedAt || i.updatedAt, month));
  for (const item of market) {
    const cat = item.category ? `Mercado · ${item.category}` : 'Mercado';
    map.set(cat,sumCents([map.get(cat)||0,item.actualCents||item.estimatedCents||0]));
  }
  return [...map.entries()].sort((a,b)=>b[1]-a[1]);
}


function filterBills(bills, criteria = {}) {
  const search=cleanString(criteria.search||'',160).toLocaleLowerCase('pt-PT');
  const status=cleanString(criteria.status||'all',30);
  const category=cleanString(criteria.category||'all',80);
  const from=cleanDateKey(criteria.from);
  const to=cleanDateKey(criteria.to);
  const sort=cleanString(criteria.sort||'due-asc',30);
  let list=(bills||[]).filter(bill=>{
    const due=billDueDateKey(bill);
    const text=`${bill.title||''} ${bill.provider||''} ${bill.category||''} ${bill.reference||''}`.toLocaleLowerCase('pt-PT');
    if(search&&!text.includes(search)) return false;
    if(status!=='all'&&billStatus(bill)!==status) return false;
    if(category!=='all'&&(bill.category||'Outros')!==category) return false;
    if(from&&(!due||due<from)) return false;
    if(to&&(!due||due>to)) return false;
    return true;
  });
  const sorters={
    'due-asc':compareBillsByDue,
    'due-desc':(a,b)=>compareBillsByDue(b,a),
    'amount-desc':(a,b)=>remainingForBill(b)-remainingForBill(a),
    'amount-asc':(a,b)=>remainingForBill(a)-remainingForBill(b),
    'title-asc':(a,b)=>String(a.title||'').localeCompare(String(b.title||''),'pt-PT')
  };
  return list.sort(sorters[sort]||sorters['due-asc']);
}

function financialDiagnostics(month = selectedMonth, now = new Date()) {
  const issues=[];
  const bills=appState?.bills||[];
  const payments=appState?.payments||[];
  const billIds=new Set(bills.map(b=>b.id));
  const invalidBills=bills.filter(b=>!cleanString(b.title,80)||!Number.isSafeInteger(b.totalCents)||b.totalCents<=0||!billDueDateKey(b));
  if(invalidBills.length) issues.push({code:'invalid-bills',severity:'critical',count:invalidBills.length,label:'Faturas com dados obrigatórios inválidos'});
  const orphanPayments=payments.filter(p=>!billIds.has(p.billId));
  if(orphanPayments.length) issues.push({code:'orphan-payments',severity:'critical',count:orphanPayments.length,label:'Pagamentos sem fatura associada'});
  const invalidAggregates=bills.filter(b=>!billLedger(b).valid);
  if(invalidAggregates.length) issues.push({code:'invalid-aggregates',severity:'critical',count:invalidAggregates.length,label:'Faturas com totais agregados fora do intervalo seguro'});
  const overpaid=bills.filter(b=>billLedger(b).valid&&billLedger(b).overpaidCents>0);
  if(overpaid.length) issues.push({code:'overpaid-bills',severity:'critical',count:overpaid.length,label:'Faturas com pagamentos acima do valor total'});
  const fingerprintCounts=new Map();
  for(const p of payments){
    const key=[p.billId,p.amountCents,p.paidAt,p.method].join('|');
    fingerprintCounts.set(key,(fingerprintCounts.get(key)||0)+1);
  }
  const duplicatePayments=[...fingerprintCounts.values()].filter(v=>v>1).reduce((sum,v)=>sum+(v-1),0);
  if(duplicatePayments) issues.push({code:'duplicate-payments',severity:'high',count:duplicatePayments,label:'Possíveis pagamentos duplicados'});
  const recurrenceCounts=new Map();
  for(const b of bills){
    if(!b.recurrenceKey) continue;
    recurrenceCounts.set(b.recurrenceKey,(recurrenceCounts.get(b.recurrenceKey)||0)+1);
  }
  const duplicateRecurrences=[...recurrenceCounts.values()].filter(v=>v>1).reduce((sum,v)=>sum+(v-1),0);
  if(duplicateRecurrences) issues.push({code:'duplicate-recurrences',severity:'high',count:duplicateRecurrences,label:'Possíveis ocorrências recorrentes duplicadas'});
  const n=monthNumbers(month,now);
  if(![n.incomes,n.paymentTotal,n.marketSpent,n.pending,n.overdue,n.outstanding,n.current,n.projected,n.budgetUsed].every(Number.isSafeInteger)) issues.push({code:'unsafe-month-total',severity:'critical',count:1,label:'Total mensal fora do intervalo monetário seguro'});
  if(n.projected!==sumCents([n.current,-n.outstanding])) issues.push({code:'projected-invariant',severity:'critical',count:1,label:'Saldo projetado não corresponde ao saldo atual menos obrigações'});
  const dash=dashboardNumbers(month,now);
  const pendingBills=n.bills.filter(b=>['pending','partial','due-today'].includes(billStatus(b,now)));
  const overdueBills=n.bills.filter(b=>billStatus(b,now)==='overdue');
  const next7Bills=pendingBills.filter(b=>{
    const days=billDaysUntil(b,now);
    return Number.isFinite(days)&&days>=0&&days<=7;
  });
  const expectedPending=sumCents(pendingBills.map(b=>remainingForBill(b)));
  const expectedOverdue=sumCents(overdueBills.map(b=>remainingForBill(b)));
  const expectedOutstanding=sumCents([expectedPending,expectedOverdue]);
  const expectedBudgetUsed=sumCents([n.paymentTotal,n.marketSpent]);
  const expectedLedgerCurrent=sumCents([n.profile.openingBalanceCents,n.incomes,-n.paymentTotal,-n.marketSpent]);
  const expectedCurrent=n.hasAccountBalance?n.profile.accountBalanceCents:expectedLedgerCurrent;
  const expectedNext7=sumCents(next7Bills.map(b=>remainingForBill(b)));
  const categoryTotal=sumCents(categoryTotals(month).map(([,value])=>value));
  if(n.pending!==expectedPending) issues.push({code:'pending-invariant',severity:'critical',count:1,label:'Total por pagar não corresponde às faturas pendentes'});
  if(n.overdue!==expectedOverdue) issues.push({code:'overdue-invariant',severity:'critical',count:1,label:'Total em atraso não corresponde às faturas vencidas'});
  if(n.outstanding!==expectedOutstanding) issues.push({code:'outstanding-invariant',severity:'critical',count:1,label:'Total em aberto não corresponde a por pagar mais atrasos'});
  if(n.budgetUsed!==expectedBudgetUsed) issues.push({code:'budget-used-invariant',severity:'critical',count:1,label:'Despesa contabilizada não corresponde a pagamentos mais compras'});
  if(n.ledgerCurrent!==expectedLedgerCurrent) issues.push({code:'ledger-current-invariant',severity:'critical',count:1,label:'Saldo calculado não corresponde aos movimentos registados'});
  if(n.current!==expectedCurrent) issues.push({code:'current-balance-invariant',severity:'critical',count:1,label:'Saldo atual não corresponde ao saldo bancário confirmado ou ao saldo calculado'});
  if(dash.pendingCount!==pendingBills.length) issues.push({code:'pending-count-invariant',severity:'critical',count:1,label:'Contagem por pagar não corresponde ao número de faturas pendentes'});
  if(dash.overdueCount!==overdueBills.length) issues.push({code:'overdue-count-invariant',severity:'critical',count:1,label:'Contagem em atraso não corresponde ao número de faturas vencidas'});
  if(dash.next7!==expectedNext7||dash.next7Count!==next7Bills.length) issues.push({code:'next7-invariant',severity:'critical',count:1,label:'Próximos 7 dias não correspondem aos vencimentos do período'});
  if(categoryTotal!==expectedBudgetUsed) issues.push({code:'category-total-invariant',severity:'critical',count:1,label:'Total por categorias não corresponde às despesas efetivas do mês'});
  return {
    issues,
    ok:issues.length===0,
    counts:{bills:bills.length,payments:payments.length,pending:dash.pendingCount,overdue:dash.overdueCount},
    totals:{current:n.current,pending:n.pending,overdue:n.overdue,outstanding:n.outstanding,projected:n.projected}
  };
}

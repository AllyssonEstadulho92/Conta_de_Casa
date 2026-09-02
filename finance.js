function billPayments(billId) { return appState.payments.filter(p => p.billId === billId); }
function paidForBill(billId) { return billPayments(billId).reduce((s,p)=>s+p.amountCents,0); }
function remainingForBill(bill) { return Math.max(0, bill.totalCents - paidForBill(bill.id)); }

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
  const rem = remainingForBill(bill);
  if (rem <= 0) return 'paid';
  const days = billDaysUntil(bill, now);
  if (!Number.isFinite(days)) return 'invalid';
  if (days < 0) return 'overdue';
  if (paidForBill(bill.id) > 0) return 'partial';
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
      appState.bills.push({
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
      });
      loopChanged = changed = true;
    }
    if (!loopChanged) break;
  }
  if (changed) await saveState();
}

function monthNumbers(month = selectedMonth, now = new Date()) {
  const profile = monthProfile(month);
  const incomes = appState.incomes.filter(i=>inSelectedMonth(i.receivedAt, month)).reduce((s,i)=>s+i.amountCents,0);
  const paymentTotal = appState.payments.filter(p=>inSelectedMonth(p.paidAt, month)).reduce((s,p)=>s+p.amountCents,0);
  const marketSpent = appState.market.filter(i=>i.purchased && inSelectedMonth(i.purchasedAt || i.updatedAt, month)).reduce((s,i)=>s+(i.actualCents || i.estimatedCents || 0),0);
  const bills = appState.bills.filter(b=>billInMonth(b, month) && !b.cancelled && !b.archived);
  let pending = 0;
  let overdue = 0;
  for (const bill of bills) {
    const st = billStatus(bill, now);
    const rem = remainingForBill(bill);
    if (st === 'overdue') overdue += rem;
    else if (['pending','partial','due-today'].includes(st)) pending += rem;
  }
  const outstanding = pending + overdue;
  const current = profile.openingBalanceCents + incomes - paymentTotal - marketSpent;
  const projected = current - outstanding;
  const budgetUsed = paymentTotal + marketSpent;
  return { profile, incomes, paymentTotal, marketSpent, pending, overdue, outstanding, current, projected, budgetUsed, bills };
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
    next7:next7Bills.reduce((s,b)=>s+remainingForBill(b),0),
    next7Count:next7Bills.length,
    criticalCount:pendingBills.filter(b=>billUrgency(b,now)==='critical').length
  };
}
function categoryTotals(month = selectedMonth) {
  const map = new Map();
  const payments = appState.payments.filter(p=>inSelectedMonth(p.paidAt, month));
  for (const p of payments) {
    const bill = appState.bills.find(b=>b.id===p.billId); const cat = bill?.category || 'Outros';
    map.set(cat,(map.get(cat)||0)+p.amountCents);
  }
  const market = appState.market.filter(i=>i.purchased && inSelectedMonth(i.purchasedAt || i.updatedAt, month));
  for (const item of market) {
    const cat = item.category ? `Mercado · ${item.category}` : 'Mercado';
    map.set(cat,(map.get(cat)||0)+(item.actualCents||item.estimatedCents||0));
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
  const overpaid=bills.filter(b=>paidForBill(b.id)>b.totalCents);
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
  if(n.projected!==n.current-n.outstanding) issues.push({code:'projected-invariant',severity:'critical',count:1,label:'Saldo projetado não corresponde ao saldo atual menos obrigações'});
  const dash=dashboardNumbers(month,now);
  const expectedPending=n.bills.filter(b=>['pending','partial','due-today'].includes(billStatus(b,now))).reduce((sum,b)=>sum+remainingForBill(b),0);
  const expectedOverdue=n.bills.filter(b=>billStatus(b,now)==='overdue').reduce((sum,b)=>sum+remainingForBill(b),0);
  if(n.pending!==expectedPending) issues.push({code:'pending-invariant',severity:'critical',count:1,label:'Total por pagar não corresponde às faturas pendentes'});
  if(n.overdue!==expectedOverdue) issues.push({code:'overdue-invariant',severity:'critical',count:1,label:'Total em atraso não corresponde às faturas vencidas'});
  return {
    issues,
    ok:issues.length===0,
    counts:{bills:bills.length,payments:payments.length,pending:dash.pendingCount,overdue:dash.overdueCount},
    totals:{current:n.current,pending:n.pending,overdue:n.overdue,outstanding:n.outstanding,projected:n.projected}
  };
}

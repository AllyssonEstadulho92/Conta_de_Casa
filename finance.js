function billPayments(billId) { return appState.payments.filter(p => p.billId === billId); }
function paidForBill(billId) { return billPayments(billId).reduce((s,p)=>s+p.amountCents,0); }
function remainingForBill(bill) { return Math.max(0, bill.totalCents - paidForBill(bill.id)); }
function billStatus(bill) {
  if (bill.cancelled) return 'cancelled';
  if (bill.archived) return 'archived';
  const rem = remainingForBill(bill);
  if (rem <= 0) return 'paid';
  if (new Date(bill.dueAt).getTime() < Date.now()) return 'overdue';
  if (paidForBill(bill.id) > 0) return 'partial';
  return 'pending';
}
function billUrgency(bill) {
  const st = billStatus(bill);
  if (['paid','cancelled','archived'].includes(st)) return 'normal';
  const diff = new Date(bill.dueAt).getTime() - Date.now();
  if (diff <= DAY_MS) return 'critical';
  if (diff <= 3*DAY_MS) return 'urgent';
  if (diff <= 7*DAY_MS) return 'attention';
  return 'normal';
}
function statusLabel(st) {
  return ({pending:'Por pagar',partial:'Pago parcialmente',paid:'Pago',overdue:'Em atraso',cancelled:'Cancelado',archived:'Arquivado'})[st] || st;
}
function urgencyLabel(st) { return ({normal:'Normal',attention:'Atenção',urgent:'Urgente',critical:'Crítico'})[st] || st; }
function recurrenceLabel(value) {
  return ({
    none:'Sem recorrência',
    weekly:'Semanal',
    monthly:'Mensal',
    quarterly:'Trimestral',
    semiannual:'Semestral',
    annual:'Anual'
  })[value] || 'Sem recorrência';
}
function dueText(bill) {
  const diff = new Date(bill.dueAt).getTime() - Date.now();
  if (remainingForBill(bill) === 0) return 'Concluída';
  if (diff < 0) {
    const d = Math.ceil(Math.abs(diff)/DAY_MS); return `${d} dia${d===1?'':'s'} em atraso`;
  }
  const hours = Math.ceil(diff/3600000);
  if (hours <= 24) return `${hours}h para vencer`;
  const days = Math.ceil(diff/DAY_MS); return `${days} dia${days===1?'':'s'} para vencer`;
}
function nextDueAt(dueAt, recurrence) {
  const d = new Date(dueAt);
  if (recurrence === 'weekly') d.setDate(d.getDate()+7);
  if (recurrence === 'monthly') d.setMonth(d.getMonth()+1);
  if (recurrence === 'quarterly') d.setMonth(d.getMonth()+3);
  if (recurrence === 'semiannual') d.setMonth(d.getMonth()+6);
  if (recurrence === 'annual') d.setFullYear(d.getFullYear()+1);
  return d.toISOString();
}
async function syncRecurringBills() {
  if (!appState) return;
  const horizon = new Date(); horizon.setMonth(horizon.getMonth()+2, 1); horizon.setHours(0,0,0,0);
  let changed = false;
  for (let loops=0; loops<24; loops++) {
    let loopChanged = false;
    const sources = [...appState.bills].filter(b => b.recurrence && b.recurrence !== 'none' && !b.cancelled && !b.archived);
    for (const bill of sources) {
      if (appState.bills.some(x => x.recurrenceParentId === bill.id)) continue;
      const next = nextDueAt(bill.dueAt, bill.recurrence);
      if (new Date(next) > horizon) continue;
      appState.bills.push({ ...bill, id:uid(), dueAt:next, issueAt:null, reference:'', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(), recurrenceParentId:bill.id, archived:false, cancelled:false });
      loopChanged = changed = true;
    }
    if (!loopChanged) break;
  }
  if (changed) await saveState();
}

function monthNumbers(month = selectedMonth) {
  const profile = monthProfile(month);
  const incomes = appState.incomes.filter(i=>inSelectedMonth(i.receivedAt, month)).reduce((s,i)=>s+i.amountCents,0);
  const paymentTotal = appState.payments.filter(p=>inSelectedMonth(p.paidAt, month)).reduce((s,p)=>s+p.amountCents,0);
  const marketSpent = appState.market.filter(i=>i.purchased && inSelectedMonth(i.purchasedAt || i.updatedAt, month)).reduce((s,i)=>s+(i.actualCents || i.estimatedCents || 0),0);
  const bills = appState.bills.filter(b=>inSelectedMonth(b.dueAt, month) && !b.cancelled && !b.archived);
  const pending = bills.reduce((s,b)=>s+remainingForBill(b),0);
  const overdue = bills.filter(b=>billStatus(b)==='overdue').reduce((s,b)=>s+remainingForBill(b),0);
  const current = profile.openingBalanceCents + incomes - paymentTotal - marketSpent;
  const projected = current - pending;
  const budgetUsed = paymentTotal + marketSpent;
  return { profile, incomes, paymentTotal, marketSpent, pending, overdue, current, projected, budgetUsed, bills };
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

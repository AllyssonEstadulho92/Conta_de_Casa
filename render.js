function applyTheme() {
  const pref = appState?.settings?.theme || 'light';
  const dark = pref === 'dark' || (pref === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  $('#themeToggle').textContent = dark ? '☾' : '☼';
}
function setPrivacy(hidden) {
  privacyHidden = hidden;
  $('#app').classList.toggle('money-hidden', hidden);
  $('#privacyToggle span').textContent = hidden ? 'Mostrar valores' : 'Ocultar valores';
}
function toast(message) {
  const el = $('#toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(()=>el.classList.remove('show'),2600);
}
function empty(text) { return `<div class="empty">${esc(text)}</div>`; }

function renderNav() {
  $('#desktopNav').innerHTML = NAV_ITEMS.map(([id,label,ic])=>`<button class="nav-btn" data-page="${id}">${icon(ic)}<span>${label}</span></button>`).join('');
  const mobile = [['dashboard','Início','home'],['bills','Faturas','bill'],['add','Adicionar','more'],['planning','Planeamento','plan'],['more','Mais','more']];
  $('#mobileNav').innerHTML = mobile.map(([id,label,ic])=>`<button class="nav-btn" data-mobile="${id}">${icon(ic)}<span>${label}</span></button>`).join('');
}
function showPage(page) {
  const known = NAV_ITEMS.some(x=>x[0]===page) ? page : 'dashboard';
  $$('.page').forEach(p=>p.classList.toggle('active', p.id===`page-${known}`));
  $$('.nav-btn[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===known));
  $$('.nav-btn[data-mobile]').forEach(b=>b.classList.toggle('active',b.dataset.mobile===known));
  $('#pageTitle').textContent = NAV_ITEMS.find(x=>x[0]===known)?.[1] || 'Início';
  history.replaceState(null,'',`#${known}`);
  renderPage(known);
  window.scrollTo({top:0,behavior:'smooth'});
}
function currentPage() { return location.hash.replace('#','') || 'dashboard'; }
function renderCurrentPage() { renderPage(currentPage()); }
function renderPage(page) {
  if (!appState) return;
  if (page==='dashboard') renderDashboard();
  if (page==='bills') renderBills();
  if (page==='calendar') renderCalendar();
  if (page==='planning') renderPlanning();
  if (page==='market') renderMarket();
  if (page==='reports') renderReports();
  if (page==='goals') renderGoals();
  if (page==='settings') renderSettings();
  updateAlertBadge();
}

function renderDashboard() {
  const n = monthNumbers();
  const now = Date.now();
  const next7 = n.bills.filter(b=>remainingForBill(b)>0 && new Date(b.dueAt).getTime()>=now && new Date(b.dueAt).getTime()<=now+7*DAY_MS).reduce((s,b)=>s+remainingForBill(b),0);
  const paidBills = n.paymentTotal;
  const kpis = [
    ['Saldo atual',n.current,'success','Disponível registado'],['Por pagar',n.pending,'primary',`${n.bills.filter(b=>remainingForBill(b)>0).length} contas`],['Pago',paidBills,'success','Pagamentos do mês'],['Em atraso',n.overdue,'danger',`${n.bills.filter(b=>billStatus(b)==='overdue').length} contas`],['Próximos 7 dias',next7,'warning','Vencimentos próximos'],['Saldo projetado',n.projected,n.projected<0?'danger':'success','Depois de pagar pendentes']
  ];
  $('#kpiGrid').innerHTML = kpis.map(([label,value,kind,sub])=>`<article class="kpi ${kind}"><span class="label">${esc(label)}</span><strong data-money>${money(value)}</strong><small>${esc(sub)}</small></article>`).join('');
  const alerts = [];
  const overdueCount = n.bills.filter(b=>billStatus(b)==='overdue').length;
  const critical = n.bills.filter(b=>billUrgency(b)==='critical' && billStatus(b)!=='overdue').length;
  if (overdueCount) alerts.push(`<div class="alert danger"><span><strong>${overdueCount} fatura${overdueCount===1?'':'s'} em atraso</strong> — reveja os pagamentos pendentes.</span><button class="link-btn" data-go="bills">Abrir</button></div>`);
  if (critical) alerts.push(`<div class="alert warning"><span><strong>${critical} vencimento${critical===1?'':'s'} nas próximas 24 horas.</strong></span><button class="link-btn" data-go="bills">Ver</button></div>`);
  if (n.projected < 0) alerts.push(`<div class="alert danger"><span>O saldo projetado está negativo em <strong data-money>${money(Math.abs(n.projected))}</strong>.</span><button class="link-btn" data-go="planning">Planear</button></div>`);
  $('#alertsPanel').innerHTML = alerts.join('');
  const upcoming = n.bills.filter(b=>remainingForBill(b)>0).sort((a,b)=>new Date(a.dueAt)-new Date(b.dueAt)).slice(0,6);
  $('#upcomingBills').innerHTML = upcoming.length ? upcoming.map(b=>billRowHtml(b)).join('') : empty('Sem faturas pendentes neste mês.');
  renderCategoryBars('#categoryBars', categoryTotals());
  const budget = n.profile.budgetCents || 0;
  const rem = budget - n.budgetUsed;
  const pct = budget ? clamp(Math.round(n.budgetUsed/budget*100),0,100) : 0;
  $('#budgetPanel').innerHTML = budget ? `<div class="detail-grid"><div class="detail-item"><small>Orçado</small><strong data-money>${money(budget)}</strong></div><div class="detail-item"><small>Utilizado</small><strong data-money>${money(n.budgetUsed)}</strong></div></div><div style="margin-top:14px"><div class="progress ${pct>100?'danger':pct>80?'warning':'success'}"><span style="width:${Math.min(pct,100)}%"></span></div><div class="goal-values"><span>${pct}% utilizado</span><strong class="${rem<0?'danger-text':'success-text'}" data-money>${money(rem)}</strong></div></div>` : `<p class="muted">Ainda não definiu um orçamento para ${esc(selectedMonth)}.</p><button class="btn secondary" data-go="planning">Definir orçamento</button>`;
  const acts = appState.activity.slice(0,8);
  $('#activityList').innerHTML = acts.length ? acts.map(a=>`<div class="list-row"><div class="list-main"><strong>${esc(a.text)}</strong><small>${fmtDateTime(a.at)}</small></div></div>`).join('') : empty('Ainda não existem atividades.');
}
function billRowHtml(bill) {
  const st=billStatus(bill), urg=billUrgency(bill), rem=remainingForBill(bill);
  return `<button class="list-row row-button" data-bill-id="${bill.id}" type="button"><div class="list-main"><strong>${esc(bill.title)}</strong><small>${fmtDate(bill.dueAt)} · ${esc(bill.provider||bill.category||'Sem entidade')}</small></div><div class="list-side"><strong data-money>${money(rem)}</strong><br><span class="status-chip ${st==='overdue'?'overdue':urg}">${st==='overdue'?'Em atraso':esc(dueText(bill))}</span></div></button>`;
}
function renderCategoryBars(selector, entries) {
  const root=$(selector); if (!root) return;
  if (!entries.length) { root.innerHTML=empty('Sem despesas registadas neste período.'); return; }
  const max=Math.max(...entries.map(x=>x[1]),1);
  root.innerHTML=entries.slice(0,8).map(([name,val])=>`<div class="bar-item"><span>${esc(name)}</span><div class="bar-track"><span class="bar-fill" style="width:${Math.max(4,val/max*100)}%"></span></div><span data-money>${money(val)}</span></div>`).join('');
}

function renderBills() {
  const search=$('#billSearch')?.value?.trim().toLowerCase()||'';
  const filter=$('#billStatusFilter')?.value||'all';
  const all=appState.bills.filter(b=>inSelectedMonth(b.dueAt) && !b.archived);
  let list=all.filter(b=>{
    const st=billStatus(b);
    const text=`${b.title} ${b.provider||''} ${b.category||''} ${b.reference||''}`.toLowerCase();
    return (!search||text.includes(search)) && (filter==='all'||st===filter);
  }).sort((a,b)=>new Date(a.dueAt)-new Date(b.dueAt));
  const totals=monthNumbers();
  $('#billSummary').innerHTML=`<span class="summary-pill">Total por pagar <strong data-money>${money(totals.pending)}</strong></span><span class="summary-pill">Em atraso <strong class="danger-text" data-money>${money(totals.overdue)}</strong></span><span class="summary-pill">Faturas <strong>${all.length}</strong></span>`;
  $('#billsList').innerHTML=list.length?list.map(b=>billCardHtml(b)).join(''):empty('Nenhuma fatura encontrada para este mês.');
}
function billCardHtml(b) {
  const st=billStatus(b), urg=billUrgency(b), rem=remainingForBill(b), paid=paidForBill(b.id), pct=b.totalCents?clamp(paid/b.totalCents*100,0,100):0;
  return `<article class="bill-card"><div class="bill-title"><div><h3>${esc(b.title)}</h3><small>${esc(b.provider||'Sem fornecedor')}</small></div><span class="status-chip ${st}">${statusLabel(st)}</span></div><div class="bill-amount" data-money>${money(rem)}</div><div class="bill-meta"><span>Vence<br><strong>${fmtDate(b.dueAt)}</strong></span><span>Prioridade<br><strong class="${urg==='critical'?'danger-text':''}">${urgencyLabel(urg)}</strong></span><span>Categoria<br><strong>${esc(b.category||'Outros')}</strong></span><span>Pago<br><strong data-money>${money(paid)}</strong></span></div><div class="progress ${st==='paid'?'success':st==='overdue'?'danger':'warning'}"><span style="width:${pct}%"></span></div><div class="bill-actions"><button class="btn secondary" data-bill-id="${b.id}">Detalhes</button>${rem>0&&!b.cancelled?`<button class="btn primary" data-pay-bill="${b.id}">Pagar</button>`:''}</div></article>`;
}

function renderCalendar() {
  const [year, month] = selectedMonth.split('-').map(Number);
  const first = new Date(year,month-1,1); const days=new Date(year,month,0).getDate();
  const offset=(first.getDay()+6)%7;
  const headers=['S','T','Q','Q','S','S','D'].map(d=>`<div class="calendar-head">${d}</div>`).join('');
  const cells=[]; for(let i=0;i<offset;i++) cells.push('<div class="calendar-day out"></div>');
  const today=new Date();
  for(let day=1;day<=days;day++){
    const bills=appState.bills.filter(b=>{const d=new Date(b.dueAt);return d.getFullYear()===year&&d.getMonth()===month-1&&d.getDate()===day&&!b.archived&&!b.cancelled;});
    const overdue=bills.some(b=>billStatus(b)==='overdue');
    const cls=[today.getFullYear()===year&&today.getMonth()===month-1&&today.getDate()===day?'today':'',bills.length?(overdue?'has-overdue':'has-due'):''].join(' ');
    const total=bills.reduce((s,b)=>s+remainingForBill(b),0);
    cells.push(`<button class="calendar-day ${cls}" data-calendar-day="${day}"><span class="day-num">${day}</span>${bills.length?`<small>${bills.length} · <span data-money>${money(total)}</span></small>`:''}</button>`);
  }
  $('#calendarGrid').innerHTML=headers+cells.join('');
  const monthBills=appState.bills.filter(b=>inSelectedMonth(b.dueAt)&&!b.archived&&!b.cancelled).sort((a,b)=>new Date(a.dueAt)-new Date(b.dueAt));
  $('#calendarAgenda').innerHTML=monthBills.length?monthBills.map(b=>billRowHtml(b)).join(''):empty('Sem vencimentos neste mês.');
}

function renderPlanning() {
  const p=monthProfile();
  $('#openingBalance').value=(p.openingBalanceCents/100).toFixed(2).replace('.',',');
  $('#monthlyBudget').value=(p.budgetCents/100).toFixed(2).replace('.',',');
  const incomes=appState.incomes.filter(i=>inSelectedMonth(i.receivedAt)).sort((a,b)=>new Date(b.receivedAt)-new Date(a.receivedAt));
  $('#incomeList').innerHTML=incomes.length?incomes.map(i=>`<div class="list-row"><div class="list-main"><strong>${esc(i.description)}</strong><small>${fmtDate(i.receivedAt)}</small></div><div class="list-side"><strong class="success-text" data-money>+${money(i.amountCents)}</strong><br><button class="link-btn danger-text" data-delete-income="${i.id}">Eliminar</button></div></div>`).join(''):empty('Sem rendimentos registados neste mês.');
}

function renderMarket() {
  const list=appState.market.filter(i=>monthOf(i.createdAt)===selectedMonth || (i.purchased&&inSelectedMonth(i.purchasedAt))).sort((a,b)=>Number(a.purchased)-Number(b.purchased));
  const estimated=list.reduce((s,i)=>s+(i.estimatedCents||0),0); const actual=list.filter(i=>i.purchased).reduce((s,i)=>s+(i.actualCents||i.estimatedCents||0),0);
  $('#marketSummary').innerHTML=`<span class="summary-pill">Estimado <strong data-money>${money(estimated)}</strong></span><span class="summary-pill">Comprado <strong data-money>${money(actual)}</strong></span><span class="summary-pill">Itens <strong>${list.length}</strong></span>`;
  $('#marketList').innerHTML=list.length?list.map(i=>`<div class="market-row ${i.purchased?'done':''}"><input type="checkbox" data-market-toggle="${i.id}" ${i.purchased?'checked':''} aria-label="Marcar ${esc(i.name)} como comprado"><div><strong>${esc(i.name)}</strong><small>${esc(i.category||'Outros')}</small></div><div class="market-qty"><small>Qtd.</small><strong>${esc(i.quantity||'1')} ${esc(i.unit||'un')}</strong></div><div class="market-estimate"><small>Estimado</small><strong data-money>${money(i.estimatedCents||0)}</strong></div><label class="market-price">Preço real<input data-market-actual="${i.id}" inputmode="decimal" value="${i.actualCents? (i.actualCents/100).toFixed(2).replace('.',','):''}" placeholder="0,00"></label><button class="icon-btn danger-text" data-delete-market="${i.id}" aria-label="Eliminar">×</button></div>`).join(''):empty('A lista de mercado está vazia.');
}

function renderReports() {
  const n=monthNumbers();
  const saved=n.incomes-(n.paymentTotal+n.marketSpent);
  $('#reportCards').innerHTML=[['Rendimentos',n.incomes,'success'],['Despesas efetivas',n.paymentTotal+n.marketSpent,'danger'],['Resultado do mês',saved,saved<0?'danger':'success'],['Por pagar',n.pending,'primary']].map(([l,v,k])=>`<article class="kpi ${k}"><span class="label">${l}</span><strong data-money>${money(v)}</strong></article>`).join('');
  renderCategoryBars('#reportCategoryBars',categoryTotals());
  const [y,m]=selectedMonth.split('-').map(Number); const vals=[];
  for(let i=5;i>=0;i--){ const d=new Date(y,m-1-i,1); const mk=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; const pay=appState.payments.filter(p=>inSelectedMonth(p.paidAt,mk)).reduce((s,p)=>s+p.amountCents,0); const market=appState.market.filter(x=>x.purchased&&inSelectedMonth(x.purchasedAt||x.updatedAt,mk)).reduce((s,x)=>s+(x.actualCents||x.estimatedCents||0),0); vals.push([mk,pay+market]); }
  const max=Math.max(...vals.map(v=>v[1]),1);
  $('#monthlyTrend').innerHTML=vals.map(([mk,v])=>`<div class="trend-col"><em data-money>${money(v)}</em><div class="trend-bar" style="height:${Math.max(3,v/max*165)}px"></div><small>${new Intl.DateTimeFormat('pt-PT',{month:'short'}).format(new Date(`${mk}-01T12:00:00`))}</small></div>`).join('');
}

function renderGoals() {
  const list=appState.goals.filter(g=>!g.archived);
  $('#goalList').innerHTML=list.length?list.map(g=>{const pct=g.targetCents?clamp(Math.round(g.savedCents/g.targetCents*100),0,100):0;return `<article class="goal-card"><div class="panel-head"><div><h2>${esc(g.name)}</h2><p>${g.deadline?`Meta até ${fmtDate(g.deadline)}`:'Sem prazo definido'}</p></div><span class="status-chip ${pct>=100?'paid':'partial'}">${pct}%</span></div><div class="goal-values"><span data-money>${money(g.savedCents)}</span><span data-money>${money(g.targetCents)}</span></div><div class="progress success"><span style="width:${pct}%"></span></div><div class="button-row" style="margin-top:14px"><button class="btn secondary" data-goal-add="${g.id}">Adicionar valor</button><button class="link-btn danger-text" data-goal-archive="${g.id}">Arquivar</button></div></article>`}).join(''):empty('Ainda não criou objetivos de poupança.');
}

function renderSettings() {
  $('#profileName').value=appState.settings.profileName||''; $('#currencySelect').value=appState.settings.currency||'EUR'; $('#themeSelect').value=appState.settings.theme||'light';
}
function updateAlertBadge(){ const n=monthNumbers(); const c=n.bills.filter(b=>remainingForBill(b)>0 && ['overdue','critical'].includes(billStatus(b)==='overdue'?'overdue':billUrgency(b))).length; $('#alertBadge').hidden=!c; }

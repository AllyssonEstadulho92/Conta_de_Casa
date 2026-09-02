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
  setHTML('#desktopNav', NAV_ITEMS.map(([id,label,ic])=>`<button class="nav-btn" data-page="${id}">${icon(ic)}<span>${label}</span></button>`).join(''));
  const mobile = [['dashboard','Início','home'],['bills','Faturas','bill'],['add','Adicionar','more'],['planning','Planeamento','plan'],['more','Mais','more']];
  setHTML('#mobileNav', mobile.map(([id,label,ic])=>`<button class="nav-btn" data-mobile="${id}">${icon(ic)}<span>${label}</span></button>`).join(''));
}
function showPage(page) {
  const known = NAV_ITEMS.some(x=>x[0]===page) ? page : 'dashboard';
  $$('.page').forEach(p=>p.classList.toggle('active', p.id===`page-${known}`));
  $$('.nav-btn[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===known));
  $$('.nav-btn[data-mobile]').forEach(b=>b.classList.toggle('active',b.dataset.mobile===known));
  $('#pageTitle').textContent = NAV_ITEMS.find(x=>x[0]===known)?.[1] || 'Início';
  history.replaceState(null,'',`#${known}`);
  renderPage(known);
  const mobileScroller=window.matchMedia('(max-width: 820px)').matches?$('.main'):null;
  if(mobileScroller) mobileScroller.scrollTo({top:0,behavior:'smooth'});
  else window.scrollTo({top:0,behavior:'smooth'});
}
function currentPage() { return NAV_ITEMS.some(x=>x[0]===location.hash.replace('#','')) ? location.hash.replace('#','') : 'dashboard'; }
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
  if (page==='security') renderSecurity();
  if (page==='diagnostics') renderDiagnostics();
  if (page==='settings') renderSettings();
  updateAlertBadge();
}

function renderDashboard() {
  const n = dashboardNumbers();
  const paidBills = n.paymentTotal;
  const kpis = [
    ['Saldo atual',n.current,'success','Disponível registado'],['Por pagar',n.pending,'primary',`${n.pendingCount} contas`],['Pago',paidBills,'success','Pagamentos do mês'],['Em atraso',n.overdue,'danger',`${n.overdueCount} contas`],['Próximos 7 dias',n.next7,'warning',`${n.next7Count} vencimento${n.next7Count===1?'':'s'}`],['Saldo projetado',n.projected,n.projected<0?'danger':'success','Após todas as obrigações do mês']
  ];
  setHTML('#kpiGrid', kpis.map(([label,value,kind,sub])=>`<article class="kpi ${kind}"><span class="label">${esc(label)}</span><strong data-money>${money(value)}</strong><small>${esc(sub)}</small></article>`).join(''));
  const alerts = [];
  const overdueCount = n.overdueCount;
  const critical = n.criticalCount;
  if (overdueCount) alerts.push(`<div class="alert danger"><span><strong>${overdueCount} fatura${overdueCount===1?'':'s'} em atraso</strong> — reveja os pagamentos pendentes.</span><button class="link-btn" data-go="bills">Abrir</button></div>`);
  if (critical) alerts.push(`<div class="alert warning"><span><strong>${critical} vencimento${critical===1?'':'s'} nas próximas 24 horas.</strong></span><button class="link-btn" data-go="bills">Ver</button></div>`);
  if (n.projected < 0) alerts.push(`<div class="alert danger"><span>O saldo projetado está negativo em <strong data-money>${money(Math.abs(n.projected))}</strong>.</span><button class="link-btn" data-go="planning">Planear</button></div>`);
  setHTML('#alertsPanel', alerts.join(''));
  const upcoming = n.bills.filter(b=>{const days=billDaysUntil(b);return remainingForBill(b)>0&&Number.isFinite(days)&&days>=0;}).sort(compareBillsByDue).slice(0,6);
  setHTML('#upcomingBills', upcoming.length ? upcoming.map(b=>billRowHtml(b)).join('') : empty('Sem faturas pendentes neste mês.'));
  renderCategoryBars('#categoryBars', categoryTotals());
  const budget = n.profile.budgetCents || 0;
  const rem = sumCents([budget,-n.budgetUsed]);
  const pct = budget ? clamp(Math.round(n.budgetUsed/budget*100),0,100) : 0;
  setHTML('#budgetPanel', budget ? `<div class="detail-grid"><div class="detail-item"><small>Orçado</small><strong data-money>${money(budget)}</strong></div><div class="detail-item"><small>Utilizado</small><strong data-money>${money(n.budgetUsed)}</strong></div></div><div class="section-gap"><div class="progress ${pct>100?'danger':pct>80?'warning':'success'}"><span data-width="${Math.min(pct,100)}"></span></div><div class="goal-values"><span>${pct}% utilizado</span><strong class="${rem<0?'danger-text':'success-text'}" data-money>${money(rem)}</strong></div></div>` : `<p class="muted">Ainda não definiu um orçamento para ${esc(selectedMonth)}.</p><button class="btn secondary" data-go="planning">Definir orçamento</button>`);
  const acts = appState.activity.slice(0,8);
  setHTML('#activityList', acts.length ? acts.map(a=>`<div class="list-row"><div class="list-main"><strong>${esc(a.text)}</strong><small>${fmtDateTime(a.at)}</small></div></div>`).join('') : empty('Ainda não existem atividades.'));
}
function billRowHtml(bill) {
  const st=billStatus(bill), urg=billUrgency(bill), rem=remainingForBill(bill);
  return `<button class="list-row row-button" data-bill-id="${attr(bill.id)}" type="button"><div class="list-main"><strong>${esc(bill.title)}</strong><small>${fmtDate(billDueDateKey(bill))} · ${esc(bill.provider||bill.category||'Sem entidade')}</small></div><div class="list-side"><strong data-money>${money(rem)}</strong><br><span class="status-chip ${st==='overdue'?'overdue':urg}">${st==='overdue'?'Em atraso':esc(dueText(bill))}</span></div></button>`;
}
function renderCategoryBars(selector, entries) {
  const root=$(selector); if (!root) return;
  if (!entries.length) { setHTML(root, empty('Sem despesas registadas neste período.')); return; }
  const max=Math.max(...entries.map(x=>x[1]),1);
  setHTML(root, entries.slice(0,8).map(([name,val])=>`<div class="bar-item"><span>${esc(name)}</span><div class="bar-track"><span class="bar-fill" data-width="${Math.max(4,val/max*100)}"></span></div><span data-money>${money(val)}</span></div>`).join(''));
}

function renderBills() {
  const all=appState.bills.filter(b=>billInMonth(b) && !b.archived);
  const categorySelect=$('#billCategoryFilter');
  if(categorySelect){
    const selected=categorySelect.value||'all';
    const categories=[...new Set(all.map(b=>b.category||'Outros'))].sort((a,b)=>a.localeCompare(b,'pt-PT'));
    setHTML(categorySelect,`<option value="all">Todas as categorias</option>${categories.map(c=>`<option value="${attr(c)}">${esc(c)}</option>`).join('')}`);
    categorySelect.value=categories.includes(selected)?selected:'all';
  }
  const criteria={
    search:$('#billSearch')?.value||'',
    status:$('#billStatusFilter')?.value||'all',
    category:$('#billCategoryFilter')?.value||'all',
    from:$('#billDateFrom')?.value||'',
    to:$('#billDateTo')?.value||'',
    sort:$('#billSort')?.value||'due-asc'
  };
  const list=filterBills(all,criteria);
  const totals=monthNumbers();
  setHTML('#billSummary', `<span class="summary-pill">Total por pagar <strong data-money>${money(totals.pending)}</strong></span><span class="summary-pill">Em atraso <strong class="danger-text" data-money>${money(totals.overdue)}</strong></span><span class="summary-pill">Faturas no mês <strong>${all.length}</strong></span><span class="summary-pill">Resultados <strong>${list.length}</strong></span>`);
  setHTML('#billsList', list.length?list.map(b=>billCardHtml(b)).join(''):empty('Nenhuma fatura corresponde aos filtros atuais.'));
}
function billCardHtml(b) {
  const st=billStatus(b), urg=billUrgency(b), rem=remainingForBill(b), paid=paidForBill(b.id), pct=b.totalCents?clamp(paid/b.totalCents*100,0,100):0;
  const canDelete=b.cancelled && paid===0;
  return `<article class="bill-card"><div class="bill-title"><div><h3>${esc(b.title)}</h3><small>${esc(b.provider||'Sem fornecedor')}</small></div><span class="status-chip ${st}">${statusLabel(st)}</span></div><div class="bill-amount" data-money>${money(rem)}</div><div class="bill-meta"><span>Vence<br><strong>${fmtDate(billDueDateKey(b))}</strong></span><span>Prioridade<br><strong class="${urg==='critical'?'danger-text':''}">${urgencyLabel(urg)}</strong></span><span>Categoria<br><strong>${esc(b.category||'Outros')}</strong></span><span>Pago<br><strong data-money>${money(paid)}</strong></span></div><div class="progress ${st==='paid'?'success':st==='overdue'?'danger':'warning'}"><span data-width="${pct}"></span></div><div class="bill-actions"><button class="btn secondary" data-bill-id="${attr(b.id)}">Detalhes</button>${canDelete?`<button class="btn danger" data-delete-bill="${attr(b.id)}">Excluir</button>`:rem>0&&!b.cancelled?`<button class="btn primary" data-pay-bill="${attr(b.id)}">Pagar</button>`:''}</div></article>`;
}

function renderCalendar() {
  const [year, month] = selectedMonth.split('-').map(Number);
  const first = new Date(year,month-1,1); const days=new Date(year,month,0).getDate();
  const offset=(first.getDay()+6)%7;
  const headers=['S','T','Q','Q','S','S','D'].map(d=>`<div class="calendar-head">${d}</div>`).join('');
  const cells=[]; for(let i=0;i<offset;i++) cells.push('<div class="calendar-day out"></div>');
  const today=new Date();
  for(let day=1;day<=days;day++){
    const dayKey=`${year}-${pad2(month)}-${pad2(day)}`;
    const bills=appState.bills.filter(b=>billDueDateKey(b)===dayKey&&!b.archived&&!b.cancelled);
    const overdue=bills.some(b=>billStatus(b)==='overdue');
    const cls=[today.getFullYear()===year&&today.getMonth()===month-1&&today.getDate()===day?'today':'',bills.length?(overdue?'has-overdue':'has-due'):''].join(' ');
    const total=sumCents(bills.map(b=>remainingForBill(b)));
    cells.push(`<button class="calendar-day ${cls}" data-calendar-day="${day}"><span class="day-num">${day}</span>${bills.length?`<small>${bills.length} · <span data-money>${money(total)}</span></small>`:''}</button>`);
  }
  setHTML('#calendarGrid', headers+cells.join(''));
  const monthBills=appState.bills.filter(b=>billInMonth(b)&&!b.archived&&!b.cancelled).sort(compareBillsByDue);
  setHTML('#calendarAgenda', monthBills.length?monthBills.map(b=>billRowHtml(b)).join(''):empty('Sem vencimentos neste mês.'));
}

function renderPlanning() {
  const p=monthProfile();
  $('#openingBalance').value=(p.openingBalanceCents/100).toFixed(2).replace('.',',');
  $('#monthlyBudget').value=(p.budgetCents/100).toFixed(2).replace('.',',');
  const incomes=appState.incomes.filter(i=>inSelectedMonth(i.receivedAt)).sort((a,b)=>new Date(b.receivedAt)-new Date(a.receivedAt));
  setHTML('#incomeList', incomes.length?incomes.map(i=>`<div class="list-row"><div class="list-main"><strong>${esc(i.description)}</strong><small>${fmtDate(i.receivedAt)}</small></div><div class="list-side"><strong class="success-text" data-money>+${money(i.amountCents)}</strong><br><button class="link-btn danger-text" data-delete-income="${attr(i.id)}">Eliminar</button></div></div>`).join(''):empty('Sem rendimentos registados neste mês.'));
}

function renderMarket() {
  const list=appState.market.filter(i=>monthOf(i.createdAt)===selectedMonth || (i.purchased&&inSelectedMonth(i.purchasedAt))).sort((a,b)=>Number(a.purchased)-Number(b.purchased));
  const estimated=sumCents(list.map(i=>i.estimatedCents||0)); const actual=sumCents(list.filter(i=>i.purchased).map(i=>i.actualCents||i.estimatedCents||0));
  setHTML('#marketSummary', `<span class="summary-pill">Estimado <strong data-money>${money(estimated)}</strong></span><span class="summary-pill">Comprado <strong data-money>${money(actual)}</strong></span><span class="summary-pill">Itens <strong>${list.length}</strong></span>`);
  setHTML('#marketList', list.length?list.map(i=>`<div class="market-row ${i.purchased?'done':''}"><input type="checkbox" data-market-toggle="${attr(i.id)}" ${i.purchased?'checked':''} aria-label="Marcar ${attr(i.name)} como comprado"><div><strong>${esc(i.name)}</strong><small>${esc(i.category||'Outros')}</small></div><div class="market-qty"><small>Qtd.</small><strong>${esc(i.quantity||'1')} ${esc(i.unit||'un')}</strong></div><div class="market-estimate"><small>Estimado</small><strong data-money>${money(i.estimatedCents||0)}</strong></div><label class="market-price">Preço real<input data-market-actual="${attr(i.id)}" inputmode="decimal" value="${i.actualCents? (i.actualCents/100).toFixed(2).replace('.',','):''}" placeholder="0,00" autocomplete="off"></label><button class="icon-btn danger-text" data-delete-market="${attr(i.id)}" aria-label="Eliminar">×</button></div>`).join(''):empty('A lista de mercado está vazia.'));
}

function renderReports() {
  const n=monthNumbers();
  const expenses=sumCents([n.paymentTotal,n.marketSpent]);
  const saved=sumCents([n.incomes,-expenses]);
  setHTML('#reportCards', [['Rendimentos',n.incomes,'success'],['Despesas efetivas',expenses,'danger'],['Resultado do mês',saved,saved<0?'danger':'success'],['Por pagar',n.pending,'primary']].map(([l,v,k])=>`<article class="kpi ${k}"><span class="label">${l}</span><strong data-money>${money(v)}</strong></article>`).join(''));
  renderCategoryBars('#reportCategoryBars',categoryTotals());
  const [y,m]=selectedMonth.split('-').map(Number); const vals=[];
  for(let i=5;i>=0;i--){ const d=new Date(y,m-1-i,1); const mk=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; const pay=sumCents(appState.payments.filter(p=>inSelectedMonth(p.paidAt,mk)).map(p=>p.amountCents)); const market=sumCents(appState.market.filter(x=>x.purchased&&inSelectedMonth(x.purchasedAt||x.updatedAt,mk)).map(x=>x.actualCents||x.estimatedCents||0)); vals.push([mk,sumCents([pay,market])]); }
  const max=Math.max(...vals.map(v=>v[1]),1);
  setHTML('#monthlyTrend', vals.map(([mk,v])=>`<div class="trend-col"><em data-money>${money(v)}</em><div class="trend-bar" data-height="${Math.max(3,v/max*165)}"></div><small>${new Intl.DateTimeFormat('pt-PT',{month:'short'}).format(new Date(`${mk}-01T12:00:00`))}</small></div>`).join(''));
}

function renderGoals() {
  const list=appState.goals.filter(g=>!g.archived);
  setHTML('#goalList', list.length?list.map(g=>{const pct=g.targetCents?clamp(Math.round(g.savedCents/g.targetCents*100),0,100):0;return `<article class="goal-card"><div class="panel-head"><div><h2>${esc(g.name)}</h2><p>${g.deadline?`Meta até ${fmtDate(g.deadline)}`:'Sem prazo definido'}</p></div><span class="status-chip ${pct>=100?'paid':'partial'}">${pct}%</span></div><div class="goal-values"><span data-money>${money(g.savedCents)}</span><span data-money>${money(g.targetCents)}</span></div><div class="progress success"><span data-width="${pct}"></span></div><div class="button-row section-gap"><button class="btn secondary" data-goal-add="${attr(g.id)}">Adicionar valor</button><button class="link-btn danger-text" data-goal-archive="${attr(g.id)}">Arquivar</button></div></article>`}).join(''):empty('Ainda não criou objetivos de poupança.'));
}

function renderSecurity() {
  const s = securitySnapshot();
  const rows = [
    ['Cifragem', `${s.encryption}; AES-GCM 256 com PBKDF2-SHA-256`, 'good'],
    ['Armazenamento', s.storage, 'good'],
    ['Web storage', s.localStorage, 'good'],
    ['Cloud', s.cloud, 'good'],
    ['Telemetria', s.telemetry, 'good'],
    ['CSP', s.csp, 'good'],
    ['Offline', s.serviceWorker, 'good'],
    ['Anexos', s.attachments, 'warning'],
    ['Bloqueio', s.lock, 'warning']
  ];
  setHTML('#securityStatusGrid', rows.map(([label,value,kind])=>`<div class="security-item ${kind}"><span class="security-dot"></span><div><strong>${esc(label)}</strong><small>${esc(value)}</small></div></div>`).join(''));
  setHTML('#securityBackupInfo', `<div class="detail-grid"><div class="detail-item"><small>Formato</small><strong>Backup cifrado v${BACKUP_FORMAT_VERSION}</strong></div><div class="detail-item"><small>Integridade</small><strong>SHA-256 obrigatório</strong></div><div class="detail-item"><small>Último backup</small><strong>${s.lastBackupAt?fmtDateTime(s.lastBackupAt):'Ainda não exportado'}</strong></div><div class="detail-item"><small>Exportação em claro</small><strong>Bloqueada</strong></div></div>`);
  setHTML('#securityPolicyList', `<div class="stack-list compact"><div class="list-row"><div class="list-main"><strong>Rede restrita</strong><small>Sem CDNs, trackers, anúncios ou telemetria. Quando a sincronização está ativa, apenas api.github.com é autorizado e recebe somente o envelope cifrado.</small></div></div><div class="list-row"><div class="list-main"><strong>Sem dados em URL</strong><small>A navegação usa apenas secções conhecidas da aplicação.</small></div></div><div class="list-row"><div class="list-main"><strong>Sem anexos reais</strong><small>A estrutura existe, mas ficheiros continuam bloqueados até cifragem dedicada.</small></div></div></div>`);
  if (typeof renderSyncUi === 'function') renderSyncUi();
}

async function renderDiagnostics() {
  const summary=$('#diagnosticSummary'),issuesRoot=$('#diagnosticIssues');
  if(!summary||!issuesRoot||!appState) return;
  const diagnostics=financialDiagnostics();
  const syncMeta=typeof syncDeviceMeta==='function'?await syncDeviceMeta().catch(()=>null):null;
  const restoreMeta=await idbGet('device','restore-meta').catch(()=>null);
  const build=document.querySelector('meta[name="app-build"]')?.content||'—';
  setHTML(summary,`
    <div class="detail-item"><small>Versão da aplicação</small><strong>${esc(build)}</strong></div>
    <div class="detail-item"><small>Schema de dados</small><strong>v${STATE_VERSION}</strong></div>
    <div class="detail-item"><small>Faturas</small><strong>${diagnostics.counts.bills}</strong></div>
    <div class="detail-item"><small>Pagamentos</small><strong>${diagnostics.counts.payments}</strong></div>
    <div class="detail-item"><small>Eventos financeiros</small><strong>${appState.auditTrail?.length||0}</strong></div>
    <div class="detail-item"><small>Armazenamento</small><strong>IndexedDB cifrado</strong></div>
    <div class="detail-item"><small>Último backup</small><strong>${appState.security?.lastBackupAt?fmtDateTime(appState.security.lastBackupAt):'Ainda não exportado'}</strong></div>
    <div class="detail-item"><small>Último restauro</small><strong>${restoreMeta?.lastRestoreAt?fmtDateTime(restoreMeta.lastRestoreAt):'Sem restauro registado'}</strong></div>
    <div class="detail-item"><small>Última sincronização</small><strong>${syncMeta?.lastSyncedAt?fmtDateTime(syncMeta.lastSyncedAt):'Ainda não confirmada'}</strong></div>
    <div class="detail-item"><small>Revisão remota</small><strong>${Number(syncMeta?.lastRevision)||0}</strong></div>
  `);
  if(diagnostics.ok){
    setHTML(issuesRoot,'<div class="security-item good"><span class="security-dot"></span><div><strong>Sem inconsistências detetadas</strong><small>As invariantes financeiras verificadas estão coerentes neste cofre.</small></div></div>');
  }else{
    setHTML(issuesRoot,diagnostics.issues.map(issue=>`<div class="security-item ${issue.severity==='critical'?'warning':'warning'}"><span class="security-dot"></span><div><strong>${esc(issue.label)}</strong><small>${issue.count} ocorrência${issue.count===1?'':'s'} · ${esc(issue.severity)}</small></div></div>`).join(''));
  }
}

function renderSettings() {
  $('#profileName').value=appState.settings.profileName||''; $('#currencySelect').value=appState.settings.currency||'EUR'; $('#themeSelect').value=appState.settings.theme||'light';
}
function updateAlertBadge(){ const n=dashboardNumbers(); const c=n.overdueCount+n.criticalCount; $('#alertBadge').hidden=!c; }

function applyTheme() {
  const pref = appState?.settings?.theme || 'light';
  const dark = pref === 'dark' || (pref === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const toggle=$('#themeToggle');
  toggle.textContent = dark ? '☾' : '☼';
  toggle.setAttribute('aria-label',dark?'Ativar tema claro':'Ativar tema escuro');
  toggle.title=dark?'Ativar tema claro':'Ativar tema escuro';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#0f1722':'#f5f7fa');
}
function setPrivacy(hidden) {
  privacyHidden = hidden;
  $('#app').classList.toggle('money-hidden', hidden);
  const label=hidden?'Mostrar valores':'Ocultar valores';
  ['#privacyToggle','#drawerPrivacyToggle'].forEach(selector=>{
    const button=$(selector);
    if(!button)return;
    const text=button.querySelector('.action-label');
    if(text)text.textContent=label;
    button.setAttribute('aria-label',label);
  });
}
function toast(message) {
  const el = $('#toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(()=>el.classList.remove('show'),2600);
}
function empty(text) { return `<div class="empty">${esc(text)}</div>`; }

function navigationGroupsHtml() {
  return NAV_GROUPS.map(group=>`<div class="nav-group">
    <p class="nav-group-label">${esc(group.label)}</p>
    <div class="nav-group-items">${group.items.map(id=>{
      const meta=PAGE_META[id];
      return `<button class="nav-btn" type="button" data-page="${attr(id)}" aria-label="${attr(meta.label)}" title="${attr(meta.label)}">${icon(meta.icon)}<span class="nav-label">${esc(meta.label)}</span></button>`;
    }).join('')}</div>
  </div>`).join('');
}

function renderNav() {
  const groups=navigationGroupsHtml();
  setHTML('#desktopNav',groups);
  setHTML('#drawerNav',groups);
  setHTML('#mobileNav',MOBILE_NAV_ITEMS.map(id=>{
    const meta=PAGE_META[id];
    const shortLabel=id==='planning'?'Plano':meta.label.replace('Lista de ','');
    return `<button class="nav-btn" type="button" data-mobile="${attr(id)}" aria-label="${attr(meta.label)}">${icon(meta.icon)}<span>${esc(shortLabel)}</span></button>`;
  }).join('')+
  `<button class="nav-btn" type="button" data-mobile-more aria-label="Abrir mais opções" aria-controls="mobileDrawer" aria-expanded="false">${icon('more')}<span>Mais</span></button>`);
}
function showPage(page) {
  const known = PAGE_META[page] ? page : 'dashboard';
  const meta = PAGE_META[known];
  const navParent = meta.navParent || known;
  $$('.page').forEach(p=>p.classList.toggle('active', p.id===`page-${known}`));
  $$('.nav-btn[data-page]').forEach(b=>{
    const active=b.dataset.page===navParent;
    b.classList.toggle('active',active);
    if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  });
  $$('.nav-btn[data-mobile]').forEach(b=>{
    const active=b.dataset.mobile===navParent;
    b.classList.toggle('active',active);
    if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  });
  $$('.section-tab[data-page]').forEach(b=>{
    const active=b.dataset.page===known;
    b.classList.toggle('active',active);
    if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  });
  $('#pageTitle').textContent = meta.label;
  $('#pageContext').textContent = meta.context;
  document.title=`${meta.label} · Conta de Casa`;
  history.replaceState(null,'',`#${known}`);
  renderPage(known);
  const drawer=$('#mobileDrawer');
  if(drawer?.open)drawer.close();
  const mobileScroller=window.matchMedia('(max-width: 820px)').matches?$('.main'):null;
  const behavior=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
  if(mobileScroller) mobileScroller.scrollTo({top:0,behavior});
  else window.scrollTo({top:0,behavior});
}
function currentPage() { return PAGE_META[location.hash.replace('#','')] ? location.hash.replace('#','') : 'dashboard'; }
function renderCurrentPage() { renderPage(currentPage()); }
function renderPage(page) {
  if (!appState) return;
  if (page==='dashboard') renderDashboard();
  if (page==='bills') renderBills();
  if (page==='calendar') renderCalendar();
  if (page==='planning') renderPlanning();
  // Mercado desativado na navegação. Preservam-se apenas dados históricos no cofre.
  if (page==='reports') renderReports();
  if (page==='goals') renderGoals();
  if (page==='security') renderSecurity();
  if (page==='diagnostics') renderDiagnostics();
  if (page==='settings') renderSettings();
  if (page==='petshare') renderPetShare();
  updateAlertBadge();
}

function dashboardAlertItems(n = dashboardNumbers()) {
  const items = [];
  const add = (id,tone,title,description,actionLabel,page,amountCents=null,amountLead='',amountTrail='',monthTarget='') => {
    items.push({id,tone,title,description,actionLabel,page,amountCents,amountLead,amountTrail,monthTarget});
  };
  if (!n.hasAccountBalance) {
    add('balance-unconfirmed','warning','Saldo bancário por confirmar','O saldo apresentado é uma estimativa baseada nos registos internos.','Atualizar saldo','planning');
  }
  if (n.hasAccountBalance && n.reconciliationDiff!==0) {
    add('reconciliation','warning','Diferença de conciliação','O saldo da conta difere do saldo calculado pelos movimentos registados.','Rever saldo','planning',Math.abs(n.reconciliationDiff),'Diferença atual: ','.');
  }
  if (n.marketEstimatedCount>0) {
    const count=n.marketEstimatedCount;
    add('market-price-unconfirmed','warning',
      `${count} compra${count===1?'':'s'} com preço por confirmar`,
      'O valor contabilizado no mês inclui estimativas até registar o preço realmente pago.',
      'Consultar histórico','reports',n.marketEstimatedCents,'Estimativa histórica: ','.');
  }
  if (n.overdueCount) {
    add('overdue','danger',`${n.overdueCount} fatura${n.overdueCount===1?'':'s'} em atraso neste mês`,'Reveja os pagamentos pendentes.','Ver faturas','bills',n.overdue,'Total em atraso: ','.');
  }
  if (n.otherOverdueCount) {
    add('overdue-other-months','danger',`${n.otherOverdueCount} fatura${n.otherOverdueCount===1?'':'s'} em atraso noutros meses`,
      'Estes valores não estão incluídos no saldo projetado do mês selecionado.',
      'Ver faturas','bills',n.otherOverdue,'Total por regularizar: ','.',n.otherOverdueFirstMonth);
  }
  if (n.criticalCount) {
    add('critical-due','warning',`${n.criticalCount} vencimento${n.criticalCount===1?'':'s'} hoje`,
      'Inclui faturas de outros meses, se existirem.','Ver vencimentos','bills',null,'','',n.criticalFirstMonth);
  }
  // Vencimentos dos próximos sete dias, sem repetir as faturas que vencem hoje.
  const upcomingBills=activeUnpaidBills().filter(bill=>{
    const days=billDaysUntil(bill);
    return Number.isFinite(days)&&days>=1&&days<=7;
  });
  if(upcomingBills.length){
    const next=upcomingBills.slice().sort(compareBillsByDue)[0];
    add('upcoming-week','info',
      `${upcomingBills.length} conta${upcomingBills.length===1?'':'s'} a vencer nos próximos 7 dias`,
      'Valores por liquidar, incluindo faturas de outros meses.',
      'Consultar faturas','bills',sumCents(upcomingBills.map(remainingForBill)),
      'Total a vencer: ','.',next?(billDueDateKey(next)||'').slice(0,7):'');
  }
  if (n.projected < 0) {
    add('negative-projection','danger','Saldo projetado negativo','As obrigações em aberto ultrapassam o saldo atual projetado.','Abrir planeamento','planning',Math.abs(n.projected),'Falta projetada: ','.');
  }
  return items;
}

function dashboardAlertDescriptionHtml(item) {
  const amount = Number.isSafeInteger(item.amountCents)
    ? `${esc(item.amountLead||'')}<strong data-money>${money(item.amountCents)}</strong>${esc(item.amountTrail||'')}`
    : '';
  const description = esc(item.description||'');
  return [amount,description].filter(Boolean).join(' ');
}

function dashboardAlertPanelHtml(item) {
  const monthAttr=item.monthTarget?` data-month-target="${attr(item.monthTarget)}"`:'';
  return `<div class="alert ${attr(item.tone)}"><span><strong>${esc(item.title)}</strong> ${dashboardAlertDescriptionHtml(item)}</span><button class="link-btn" type="button" data-go="${attr(item.page)}"${monthAttr}>${esc(item.actionLabel)}</button></div>`;
}

function alertCenterItemHtml(item) {
  const severity=item.tone==='danger'?'Urgente':item.tone==='info'?'Próximo vencimento':'Atenção';
  const monthAttr=item.monthTarget?` data-month-target="${attr(item.monthTarget)}"`:'';
  return `<article class="alert-center-item ${attr(item.tone)}" role="listitem" data-alert-id="${attr(item.id)}">
    <span class="alert-center-indicator" aria-hidden="true"></span>
    <div class="alert-center-copy">
      <div class="alert-center-item-head"><strong>${esc(item.title)}</strong><span class="alert-center-severity">${severity}</span></div>
      <p>${dashboardAlertDescriptionHtml(item)}</p>
    </div>
    <button class="btn secondary alert-center-action" type="button" data-go="${attr(item.page)}"${monthAttr}>${esc(item.actionLabel)}</button>
  </article>`;
}

function renderAlertCenter(items = dashboardAlertItems()) {
  const list=$('#alertCenterList');
  const summary=$('#alertCenterSummary');
  if(!list||!summary)return;
  const count=items.length;
  summary.textContent=count
    ? `${count} alerta${count===1?'':'s'} ativo${count===1?'':'s'} neste momento`
    : 'Sem alertas ativos neste momento';
  // As categorias são informativas: não são notificações push nem dados persistidos.
  const groups=[
    ['urgentes','Prioritários',item=>item.tone==='danger'||item.id==='critical-due'],
    ['vencimentos','A vencer',item=>item.id==='upcoming-week'],
    ['verificar','A verificar',item=>item.tone!=='danger'&&item.id!=='critical-due'&&item.id!=='upcoming-week']
  ];
  setHTML(list,count
    ? groups.map(([key,title,match])=>{
        const group=items.filter(match);
        return group.length?`<section class="cdc-alert-group" aria-label="${esc(title)}"><h3 class="cdc-alert-group-title">${esc(title)} <span data-money>${group.length}</span></h3>${group.map(alertCenterItemHtml).join('')}</section>`:'';
      }).join('')
    : '<div class="alert-center-empty"><strong>Está tudo em ordem</strong><p>Não existem alertas financeiros ativos.</p></div>');
}

function updateAlertBadge() {
  const button=$('#notificationsBtn');
  const badge=$('#alertBadge');
  if(!button||!badge)return;
  const items=dashboardAlertItems();
  const count=items.length;
  badge.hidden=count===0;
  badge.textContent=count>99?'99+':String(count);
  badge.dataset.count=String(count);
  const label=count
    ? `Centro de Alertas, ${count} alerta${count===1?'':'s'} ativo${count===1?'':'s'}`
    : 'Centro de Alertas, sem alertas ativos';
  button.setAttribute('aria-label',label);
  button.title=label;
  const dialog=$('#alertCenterDialog');
  if(dialog?.open)renderAlertCenter(items);
}

function renderDashboard() {
  const n = dashboardNumbers();
  const paidBills = n.paymentTotal;
  const balanceSub=n.hasAccountBalance
    ? `Saldo da conta · ${n.profile.accountBalanceUpdatedAt?fmtDateTime(n.profile.accountBalanceUpdatedAt):'atualizado manualmente'}`
    : 'Estimativa pelos registos · atualize o saldo da conta';
  const balanceCard=`<article class="kpi success account-balance-kpi"><span class="label">Saldo atual</span><strong data-money>${money(n.current)}</strong><small>${esc(balanceSub)}</small><button class="link-btn kpi-action" type="button" data-update-balance>Atualizar saldo</button></article>`;
  const kpis = [
    ['Por pagar · mês',n.pending,'primary',`${n.pendingCount} conta${n.pendingCount===1?'':'s'}`],
    ['Em atraso · mês',n.overdue,'danger',`${n.overdueCount} conta${n.overdueCount===1?'':'s'}`],
    ['Saldo projetado · mês',n.projected,n.projected<0?'danger':'success','Saldo atual menos obrigações do mês selecionado']
  ];
  setHTML('#kpiGrid', balanceCard+kpis.map(([label,value,kind,sub])=>`<article class="kpi ${kind}"><span class="label">${esc(label)}</span><strong data-money>${money(value)}</strong><small>${esc(sub)}</small></article>`).join(''));
  const secondaryMetrics = [
    ['Pago no mês',paidBills,'Pagamentos confirmados'],
    ['Próximos 7 dias',n.next7,`${n.next7Count} vencimento${n.next7Count===1?'':'s'} · todos os meses`]
  ];
  setHTML('#dashboardSecondary', secondaryMetrics.map(([label,value,sub])=>`<article class="dashboard-secondary-card"><div><span>${esc(label)}</span><small>${esc(sub)}</small></div><strong data-money>${money(value)}</strong></article>`).join(''));
  const alerts = dashboardAlertItems(n);
  setHTML('#alertsPanel', alerts.map(dashboardAlertPanelHtml).join(''));
  const priorityBills = dashboardPriorityBills(selectedMonth);
  setHTML('#upcomingBills', priorityBills.length ? priorityBills.map((bill,index)=>dashboardUpcomingBillHtml(bill,index,priorityBills.length)).join('') : empty('Sem faturas em atraso ou vencimentos prioritários.'));
  renderCategoryBars('#categoryBars', categoryTotals());
  const budget = n.profile.budgetCents || 0;
  const budgetCommitted = Number.isSafeInteger(n.budgetCommitted) ? n.budgetCommitted : sumCents([n.budgetUsed,n.outstanding]);
  const rawBudgetPct = budget ? Math.max(0,Math.round(budgetCommitted/budget*100)) : 0;
  const budgetBarPct = clamp(rawBudgetPct,0,100);
  setHTML('#budgetPanel', budget ? `<div class="dashboard-budget-card"><div class="dashboard-budget-top"><span class="dashboard-budget-amount"><small>Orçado</small><strong data-money>${money(budget)}</strong></span><span class="dashboard-budget-usage"><strong>${rawBudgetPct}% comprometido</strong><small><b data-money>${money(budgetCommitted)}</b> de <span data-money>${money(budget)}</span></small></span></div><div class="dashboard-budget-track" role="progressbar" aria-label="Orçamento comprometido" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${budgetBarPct}"><span data-width="${budgetBarPct}"></span></div></div>` : `<div class="dashboard-budget-empty"><p class="muted">Ainda não definiu um orçamento para ${esc(selectedMonth)}.</p><button class="btn secondary" data-go="planning">Definir orçamento</button></div>`);
  const acts = appState.activity.slice(0,8);
  setHTML('#activityList', acts.length ? acts.map(a=>`<div class="list-row"><div class="list-main"><strong>${esc(a.text)}</strong><small>${fmtDateTime(a.at)}</small></div></div>`).join('') : empty('Ainda não existem atividades.'));
}
function dashboardPriorityConfig(bill,index,now=new Date()) {
  const status=billStatus(bill,now);
  const days=billDaysUntil(bill,now);
  if(status==='overdue') return {tone:'pay',label:'Pagar agora'};
  if(days===0) return {tone:'pay',label:'Vence hoje'};
  if(days<=3) return {tone:'next',label:'Prioridade'};
  if(days<=7) return {tone:'soon',label:'A seguir'};
  if(index<=4) return {tone:'later',label:'Depois'};
  return {tone:'relaxed',label:'Mais tarde'};
}
function dashboardBillInitial(bill) {
  const source=String(bill?.provider||bill?.title||'Conta').trim();
  const words=source.split(/\s+/).filter(Boolean);
  const value=words.length>1?`${words[0]?.[0]||''}${words[1]?.[0]||''}`:source.slice(0,1);
  return value.toLocaleUpperCase('pt-PT')||'•';
}
function dashboardBillBrandTone(bill) {
  const source=String(bill?.provider||bill?.title||'Conta');
  let hash=0;
  for(const char of source) hash=(hash+char.codePointAt(0))%5;
  return hash+1;
}
function dashboardUpcomingBillHtml(bill,index,total) {
  const rem=remainingForBill(bill);
  const priority=dashboardPriorityConfig(bill,index);
  const rank=index+1;
  const category=bill.category||bill.provider||'Sem categoria';
  const due=dueText(bill);
  const initial=dashboardBillInitial(bill);
  const brandTone=dashboardBillBrandTone(bill);
  const label=`Prioridade ${rank} de ${total}: ${bill.title||'Fatura'}, ${due}, ${money(rem)}`;
  return `<button class="dashboard-priority-row priority-${priority.tone}" data-bill-id="${attr(bill.id)}" type="button" aria-label="${attr(label)}"><span class="dashboard-priority-rank"><strong>${rank}º</strong><small>${esc(priority.label)}</small></span><span class="dashboard-bill-brand tone-${brandTone}" aria-hidden="true">${esc(initial)}</span><span class="dashboard-priority-copy"><strong>${esc(bill.title)}</strong><small>${fmtDate(billDueDateKey(bill))} · ${esc(category)}</small></span><strong class="dashboard-priority-amount" data-money>${money(rem)}</strong><span class="dashboard-priority-due">${icon('clock',15)}<span>${esc(due)}</span></span></button>`;
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

function billFilterState(){
  return {
    status:$('#billStatusFilter')?.value||'all',
    category:$('#billCategoryFilter')?.value||'all',
    from:$('#billDateFrom')?.value||'',
    to:$('#billDateTo')?.value||'',
    sort:$('#billSort')?.value||'due-asc'
  };
}

function syncBillFilterToggle(criteria=billFilterState()){
  const toggle=$('#billFiltersToggle');
  const countNode=$('#billFilterCount');
  if(!toggle||!countNode)return;
  const count=[
    criteria.status!=='all',
    criteria.category!=='all',
    Boolean(criteria.from),
    Boolean(criteria.to),
    criteria.sort!=='due-asc'
  ].filter(Boolean).length;
  countNode.textContent=String(count);
  countNode.hidden=count===0;
  toggle.classList.toggle('has-active-filters',count>0);
  const label=count?('Filtros, '+count+' opção'+(count===1?'':'ões')+' alterada'+(count===1?'':'s')):'Filtros';
  toggle.setAttribute('aria-label',label);
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
  const filterState=billFilterState();
  const criteria={
    search:$('#billSearch')?.value||'',
    ...filterState
  };
  syncBillFilterToggle(filterState);
  const list=filterBills(all,criteria);
  const totals=monthNumbers();
  const summary=[
    ['Em aberto',totals.outstanding,'Valor ainda por liquidar','primary'],
    ['A vencer',totals.pending,'Dentro do prazo','normal'],
    ['Em atraso',totals.overdue,'Requer atenção','danger']
  ];
  setHTML('#billSummary', summary.map(([label,value,sub,kind])=>`<article class="bill-summary-item ${kind}"><span>${esc(label)}</span><strong data-money>${money(value)}</strong><small>${esc(sub)}</small></article>`).join('')+`<article class="bill-summary-item normal"><span>Resultados</span><strong>${list.length}</strong><small>de ${all.length} fatura${all.length===1?'':'s'} no mês</small></article>`);
  if(!list.length){
    setHTML('#billsList',`<div class="empty bill-empty-state"><strong>Sem resultados</strong><span>Nenhuma fatura corresponde aos filtros atuais.</span><button class="btn secondary" type="button" data-clear-bill-filters>Limpar filtros</button></div>`);
    return;
  }
  setHTML('#billsList', billTableHtml(list)+`<div class="bill-mobile-list">${list.map(b=>billCardHtml(b)).join('')}</div>`);
}
function billDueSignal(b, st=billStatus(b), urg=billUrgency(b)) {
  if(st==='invalid') return ['Dados inválidos','danger'];
  if(st==='overdue') return [dueText(b),'danger'];
  if(st==='due-today'||urg==='critical') return [dueText(b),'danger'];
  if(urg==='urgent'||urg==='attention') return [dueText(b),'warning'];
  if(st==='paid') return ['Concluída','success'];
  if(st==='cancelled') return ['Cancelada','normal'];
  return [dueText(b),'normal'];
}
function billActionsHtml(b, compact=false) {
  const rem=remainingForBill(b), paid=paidForBill(b.id);
  const canDelete=b.cancelled && paid===0;
  const detailLabel=compact?'Detalhes':'Abrir';
  const detail=`<button class="btn secondary" type="button" data-bill-id="${attr(b.id)}">${detailLabel}</button>`;
  const edit=`<button class="btn secondary" type="button" data-edit-bill="${attr(b.id)}">Editar</button>`;
  if(canDelete) return detail+edit+`<button class="btn danger bill-action-delete" type="button" data-delete-bill="${attr(b.id)}">Excluir</button>`;
  if(rem>0&&!b.cancelled) return detail+edit+`<button class="btn primary bill-action-pay" type="button" data-pay-bill="${attr(b.id)}">Pagar</button>`;
  return detail+edit;
}
function billTableHtml(list) {
  return `<div class="bill-table-shell"><table class="bill-table"><thead><tr><th scope="col">Fatura</th><th scope="col">Estado</th><th scope="col">Vencimento</th><th scope="col" class="money-col">Total</th><th scope="col" class="money-col">Pago</th><th scope="col" class="money-col">Em falta</th><th scope="col" class="actions-col">Ações</th></tr></thead><tbody>${list.map(b=>billTableRowHtml(b)).join('')}</tbody></table></div>`;
}
function billTableRowHtml(b) {
  const st=billStatus(b), urg=billUrgency(b), rem=remainingForBill(b), paid=paidForBill(b.id);
  const [dueLabel,dueKind]=billDueSignal(b,st,urg);
  return `<tr class="bill-table-row">
    <td><div class="bill-identity"><strong>${esc(b.title)}</strong><small>${esc(b.provider||'Sem fornecedor')} · ${esc(b.category||'Outros')}</small></div></td>
    <td><span class="status-chip ${st}">${esc(statusLabel(st))}</span></td>
    <td><div class="bill-due-cell"><strong>${fmtDate(billDueDateKey(b))}</strong><span class="bill-due-signal ${dueKind}">${esc(dueLabel)}</span></div></td>
    <td class="money-col" data-money>${money(b.totalCents)}</td>
    <td class="money-col" data-money>${money(paid)}</td>
    <td class="money-col bill-remaining" data-money>${money(rem)}</td>
    <td><div class="bill-table-actions">${billActionsHtml(b)}</div></td>
  </tr>`;
}
function billCardHtml(b) {
  const st=billStatus(b), urg=billUrgency(b), rem=remainingForBill(b), paid=paidForBill(b.id);
  const [dueLabel,dueKind]=billDueSignal(b,st,urg);
  const validProgress=Number.isSafeInteger(b.totalCents)&&b.totalCents>0&&Number.isSafeInteger(paid)&&paid>=0;
  const pct=validProgress?clamp(paid/b.totalCents*100,0,100):0;
  return `<article class="bill-mobile-card">
    <div class="bill-mobile-head"><div><h3>${esc(b.title)}</h3><small>${esc(b.provider||'Sem fornecedor')}</small></div><span class="status-chip ${st}">${esc(statusLabel(st))}</span></div>
    <div class="bill-mobile-focus"><div><span>Em falta</span><strong data-money>${money(rem)}</strong></div><span class="bill-due-signal ${dueKind}">${esc(dueLabel)}</span></div>
    <div class="bill-mobile-due"><span>Vencimento</span><strong>${fmtDate(billDueDateKey(b))}</strong></div>
    <div class="bill-mobile-finance"><div><span>Total</span><strong data-money>${money(b.totalCents)}</strong></div><div><span>Pago</span><strong data-money>${money(paid)}</strong></div><div><span>Categoria</span><strong>${esc(b.category||'Outros')}</strong></div></div>
    <div class="progress ${st==='paid'?'success':st==='overdue'?'danger':'warning'}" aria-label="Progresso de pagamento"><span data-width="${pct}"></span></div>
    <div class="bill-mobile-actions">${billActionsHtml(b,true)}</div>
  </article>`;
}

function renderCalendar() {
  const [year, month] = selectedMonth.split('-').map(Number);
  const first = new Date(year,month-1,1); const days=new Date(year,month,0).getDate();
  const offset=(first.getDay()+6)%7;
  const headers=['S','T','Q','Q','S','S','D'].map(d=>`<div class="calendar-head">${d}</div>`).join('');
  const numbers=monthNumbers(selectedMonth);
  const history=monthlySpendHistory(selectedMonth,6);

  setHTML('#calendarMonthSummary',[
    ['Gasto no mês',numbers.cashSpent,'Pagamentos + compras','primary'],
    ['Faturas pagas',numbers.paymentTotal,'Pagamentos registados','success'],
    ['Compras anteriores',numbers.marketSpent,numbers.marketEstimatedCount?`${numbers.marketEstimatedCount} compra${numbers.marketEstimatedCount===1?'':'s'} sem preço real`:'Compras concluídas','normal'],
    ['Por pagar',numbers.outstanding,'Faturas ainda pendentes',numbers.outstanding>0?'warning':'normal']
  ].map(([label,value,sub,kind])=>`<article class="calendar-summary-item ${kind}"><span>${esc(label)}</span><strong data-money>${money(value)}</strong><small>${esc(sub)}</small></article>`).join(''));

  setHTML('#calendarHistory',history.map(item=>{
    const [hy,hm]=item.month.split('-').map(Number);
    const label=new Intl.DateTimeFormat('pt-PT',{month:'short',year:'2-digit'}).format(new Date(hy,hm-1,1));
    return `<button type="button" class="calendar-history-item${item.month===selectedMonth?' active':''}" data-calendar-month="${attr(item.month)}"><span>${esc(label)}</span><strong data-money>${money(item.total)}</strong></button>`;
  }).join(''));

  const cells=[]; for(let i=0;i<offset;i++) cells.push('<div class="calendar-day out"></div>');
  const today=new Date();
  for(let day=1;day<=days;day++){
    const dayKey=`${year}-${pad2(month)}-${pad2(day)}`;
    const bills=appState.bills.filter(b=>billDueDateKey(b)===dayKey&&!b.archived&&!b.cancelled);
    const overdue=bills.some(b=>billStatus(b)==='overdue');
    const dueTotal=sumCents(bills.map(b=>remainingForBill(b)));
    const spent=spendingForDate(dayKey);
    const cls=[
      today.getFullYear()===year&&today.getMonth()===month-1&&today.getDate()===day?'today':'',
      bills.length?(overdue?'has-overdue':'has-due'):'',
      spent.total>0?'has-spent':''
    ].join(' ');
    const dueLine=bills.length?`<small class="calendar-due">${bills.length} venc. · <span data-money>${money(dueTotal)}</span></small>`:'';
    const spentLine=spent.total>0?`<small class="calendar-spent">Gasto · <span data-money>${money(spent.total)}</span></small>`:'';
    cells.push(`<button class="calendar-day ${cls}" data-calendar-day="${day}"><span class="day-num">${day}</span>${spentLine}${dueLine}</button>`);
  }
  setHTML('#calendarGrid', headers+cells.join(''));

  const monthBills=appState.bills.filter(b=>billInMonth(b,selectedMonth)&&!b.archived&&!b.cancelled).sort(compareBillsByDue);
  setHTML('#calendarAgenda', monthBills.length?monthBills.map(b=>billRowHtml(b)).join(''):empty('Sem vencimentos neste mês.'));
}

function planningOverviewCard(label,value,kind,note) {
  return `<article class="cdc-plan-kpi ${attr(kind)}"><span class="cdc-plan-kpi-label">${esc(label)}</span><strong data-money>${money(value)}</strong><small>${esc(note)}</small></article>`;
}
// O resultado do mês é o fluxo de caixa registado, não o saldo do banco.
// Não depende da introdução manual de um saldo atual e não deduz pagamentos duas vezes.
function planningMonthlyResult(n) {
  return sumCents([n.incomes,-n.cashSpent]);
}
function renderPlanningOverview(n){
  const result=planningMonthlyResult(n);
  const hasUnpaid=n.outstanding>0;
  const marketNote=n.marketEstimatedCount>0
    ? `Inclui ${n.marketEstimatedCount} compra${n.marketEstimatedCount===1?'':'s'} com preço estimado.`
    : '';
  const items=[
    ['Recebido',n.incomes,'income','Rendimentos registados'],
    ['Gasto',n.cashSpent,'spent',marketNote||'Pagamentos e compras registados'],
    ['Por pagar',n.outstanding,'pending','Faturas deste mês por liquidar'],
    [n.hasAccountBalance?'Saldo informado':'Saldo calculado',n.hasAccountBalance?n.current:n.ledgerCurrent,'balance',
      n.hasAccountBalance?'Referência atualizada por ti':'Saldo inicial + entradas − saídas; sujeito aos registos']
  ];
  setHTML('#planningKpis',items.map(row=>planningOverviewCard(...row)).join(''));
  const resultNote=marketNote
    ? `Receitas menos pagamentos e compras registados. ${marketNote} Não é o saldo bancário.`
    : 'Receitas registadas menos pagamentos e compras do mês. Não é o saldo bancário.';
  const future=hasUnpaid
    ? `<div class="cdc-plan-projection-next"><span>Saldo estimado após liquidar as faturas pendentes</span><strong data-money>${money(n.projected)}</strong></div>`
    : '<div class="cdc-plan-projection-next is-settled"><span>Sem faturas pendentes neste mês. Não há valores por descontar novamente.</span></div>';
  setHTML('#planningProjection',`<span class="cdc-plan-projection-copy">
    <small>RESULTADO AUTOMÁTICO DO MÊS</small>
    <strong>Recebido menos gasto</strong>
    <small>${esc(resultNote)}</small>
  </span>
  <strong class="cdc-plan-projection-value ${result<0?'is-negative':''}" data-money>${money(result)}</strong>
  ${future}`);
}
function renderPlanningUpcoming(){
  const pending=activeUnpaidBills().slice().sort(compareBillsByDue).slice(0,5);
  setHTML('#planningUpcomingList',pending.length?pending.map(b=>{
    const days=billDaysUntil(b);
    const label=!Number.isFinite(days)?'Data por confirmar':days<0?'Em atraso':days===0?'Vence hoje':`Em ${days} dia${days===1?'':'s'}`;
    const kind=Number.isFinite(days)&&days<0?'overdue':days===0?'today':'pending';
    const due=billDueDateKey(b);
    return `<div class="cdc-plan-upcoming-row"><div class="cdc-plan-upcoming-item"><strong>${esc(b.title||'Fatura sem descrição')}</strong><small>${due?esc(fmtDate(due)):'Vencimento por confirmar'} · ${esc(label)}</small></div><span class="cdc-plan-upcoming-value ${attr(kind)}" data-money>${money(remainingForBill(b))}</span></div>`;
  }).join(''):'<p class="cdc-plan-empty">Não existem contas por pagar registadas.</p>');
}

function renderPlanning() {
  const p=monthProfile();
  const n=monthNumbers();
  renderPlanningOverview(n);
  renderPlanningUpcoming();
  $('#accountBalance').value=Number.isSafeInteger(p.accountBalanceCents)?(p.accountBalanceCents/100).toFixed(2).replace('.',','):'';
  $('#openingBalance').value=p.openingBalanceCents===0?'':(p.openingBalanceCents/100).toFixed(2).replace('.',',');
  $('#monthlyBudget').value=p.budgetCents===0?'':(p.budgetCents/100).toFixed(2).replace('.',',');
  setHTML('#accountBalanceInfo',Number.isSafeInteger(p.accountBalanceCents)
    ? `<div class="detail-grid"><div class="detail-item"><small>Saldo da conta</small><strong data-money>${money(p.accountBalanceCents)}</strong></div><div class="detail-item"><small>Saldo calculado pelos registos</small><strong data-money>${money(n.ledgerCurrent)}</strong></div><div class="detail-item full-detail"><small>Diferença de conciliação</small><strong class="${n.reconciliationDiff===0?'success-text':'warning-text'}" data-money>${money(n.reconciliationDiff)}</strong></div></div>`
    : '<p class="muted">Ainda não foi registado o saldo real da conta para este mês.</p>');
  const incomes=appState.incomes.filter(i=>inSelectedMonth(i.receivedAt)).sort((a,b)=>new Date(b.receivedAt)-new Date(a.receivedAt));
  setHTML('#incomeList', incomes.length?incomes.map(i=>`<div class="list-row"><div class="list-main"><strong>${esc(i.description)}</strong><small>${fmtDate(i.receivedAt)}</small></div><div class="list-side"><strong class="success-text" data-money>+${money(i.amountCents)}</strong><br><button class="link-btn danger-text" data-delete-income="${attr(i.id)}">Eliminar</button></div></div>`).join(''):empty('Sem rendimentos registados neste mês.'));
}

function marketItemEstimatedCents(item) {
  return marketLineCents(item?.estimatedCents||0,item?.quantity||'1');
}
function marketItemActualCents(item) {
  return marketLineCents(item?.actualCents||0,item?.quantity||'1');
}
function marketItemEffectiveCents(item) {
  if(!item?.purchased) return 0;
  return item.actualCents>0?marketItemActualCents(item):marketItemEstimatedCents(item);
}
function marketMetrics(items) {
  const purchased=items.filter(i=>i.purchased);
  const pending=items.filter(i=>!i.purchased);
  const estimatedTotal=sumCents(items.map(marketItemEstimatedCents));
  const accounted=sumCents(purchased.map(marketItemEffectiveCents));
  const pendingEstimated=sumCents(pending.map(marketItemEstimatedCents));
  const purchasedEstimated=sumCents(purchased.map(marketItemEstimatedCents));
  const variance=sumCents([accounted,-purchasedEstimated]);
  const missingReal=purchased.filter(i=>!(i.actualCents>0)).length;
  return {estimatedTotal,accounted,pendingEstimated,purchasedEstimated,variance,missingReal,purchasedCount:purchased.length,pendingCount:pending.length};
}
function marketFilteredItems(items) {
  const search=cleanString($('#marketSearch')?.value||'',160).toLocaleLowerCase('pt-PT');
  const status=$('#marketStatusFilter')?.value||'all';
  const category=$('#marketCategoryFilter')?.value||'all';
  const sort=$('#marketSort')?.value||'pending-first';
  const filtered=items.filter(item=>{
    const text=`${item.name||''} ${item.category||''}`.toLocaleLowerCase('pt-PT');
    if(search&&!text.includes(search)) return false;
    if(status==='pending'&&item.purchased) return false;
    if(status==='purchased'&&!item.purchased) return false;
    if(status==='missing-price'&&(!item.purchased||item.actualCents>0)) return false;
    if(category!=='all'&&(item.category||'Outros')!==category) return false;
    return true;
  });
  const sorters={
    'pending-first':(a,b)=>Number(a.purchased)-Number(b.purchased)||String(a.name||'').localeCompare(String(b.name||''),'pt-PT'),
    'name-asc':(a,b)=>String(a.name||'').localeCompare(String(b.name||''),'pt-PT'),
    'estimate-desc':(a,b)=>(b.estimatedCents||0)-(a.estimatedCents||0),
    'actual-desc':(a,b)=>marketItemEffectiveCents(b)-marketItemEffectiveCents(a),
    'recent':(a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt)
  };
  return filtered.sort(sorters[sort]||sorters['pending-first']);
}
function marketVarianceHtml(item) {
  if(!item.purchased||!(item.actualCents>0)) return '<span class="muted">—</span>';
  const diff=sumCents([marketItemActualCents(item),-marketItemEstimatedCents(item)]);
  if(!Number.isSafeInteger(diff)) return '<span class="danger-text">Inválido</span>';
  const cls=diff>0?'danger-text':diff<0?'success-text':'muted';
  const prefix=diff>0?'+':'';
  return `<strong class="${cls}" data-money>${prefix}${money(diff)}</strong>`;
}
function marketStatusHtml(item) {
  if(!item.purchased) return '<span class="status-chip pending">Por comprar</span>';
  if(!(item.actualCents>0)) return '<span class="status-chip attention">Falta preço real</span>';
  return '<span class="status-chip paid">Comprado</span>';
}
function marketActualInputHtml(item) {
  const value=item.actualCents>0?(item.actualCents/100).toFixed(2).replace('.',','):'';
  return `<label class="market-real-field"><span class="sr-only">Preço real de ${esc(item.name)}</span><input data-market-actual="${attr(item.id)}" inputmode="decimal" value="${attr(value)}" placeholder="0,00" autocomplete="off" aria-label="Preço real de ${attr(item.name)}"></label>`;
}
function marketProductImageHtml(item,size='mobile') {
  const image=safeProductImageUrl(item?.imageUrl);
  if(!image)return '<span class="market-product-photo is-empty" aria-hidden="true"></span>';
  return `<span class="market-product-photo ${attr(size)}"><img src="${attr(image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></span>`;
}
function marketTableHtml(list) {
  return `<div class="market-table-shell"><table class="market-table"><thead><tr><th scope="col" class="check-col">Comprado</th><th scope="col">Produto</th><th scope="col">Qtd.</th><th scope="col" class="money-col">Estimado</th><th scope="col" class="money-col">Preço real</th><th scope="col" class="money-col">Diferença</th><th scope="col">Estado</th><th scope="col" class="actions-col">Ações</th></tr></thead><tbody>${list.map(marketTableRowHtml).join('')}</tbody></table></div>`;
}
function marketTableRowHtml(item) {
  return `<tr class="market-table-row ${item.purchased?'purchased':''}">
    <td><label class="market-check"><input type="checkbox" data-market-toggle="${attr(item.id)}" ${item.purchased?'checked':''}><span class="sr-only">Marcar ${esc(item.name)} como comprado</span></label></td>
    <td><div class="market-identity market-identity-with-photo">${marketProductImageHtml(item,'table')}<span><strong>${esc(item.name)}</strong><small>${esc(item.category||'Outros')}</small></span></div></td>
    <td><span class="market-quantity">${esc(item.quantity||'1')} ${esc(item.unit||'un')}</span></td>
    <td class="money-col" data-money>${money(marketItemEstimatedCents(item))}</td>
    <td class="market-real-cell">${marketActualInputHtml(item)}</td>
    <td class="money-col">${marketVarianceHtml(item)}</td>
    <td>${marketStatusHtml(item)}</td>
    <td><div class="market-table-actions"><button class="btn secondary" type="button" data-edit-market="${attr(item.id)}">Editar</button><button class="icon-btn danger-text" type="button" data-delete-market="${attr(item.id)}" aria-label="Eliminar ${attr(item.name)}">×</button></div></td>
  </tr>`;
}
function marketMobileCardHtml(item) {
  const effective=marketItemEffectiveCents(item);
  return `<article class="market-mobile-card ${item.purchased?'purchased':''}">
    <div class="market-mobile-head"><label class="market-check"><input type="checkbox" data-market-toggle="${attr(item.id)}" ${item.purchased?'checked':''}><span class="sr-only">Marcar ${esc(item.name)} como comprado</span></label>${marketProductImageHtml(item)}<div><h3>${esc(item.name)}</h3><small>${esc(item.category||'Outros')} · ${esc(item.quantity||'1')} ${esc(item.unit||'un')}</small></div>${marketStatusHtml(item)}</div>
    <div class="market-mobile-money"><div><span>Estimado</span><strong data-money>${money(marketItemEstimatedCents(item))}</strong></div><div><span>${item.purchased?(item.actualCents>0?'Contabilizado':'Estimado usado'):'Previsto'}</span><strong data-money>${money(item.purchased?effective:marketItemEstimatedCents(item))}</strong></div><div><span>Diferença</span>${marketVarianceHtml(item)}</div></div>
    <div class="market-mobile-real"><span>Preço real / unidade</span>${marketActualInputHtml(item)}<small>${item.purchased&&!(item.actualCents>0)?'Enquanto faltar o preço real, os relatórios usam o valor estimado.':'Guardado automaticamente ao sair do campo.'}</small></div>
    <div class="market-mobile-actions"><button class="btn secondary" type="button" data-edit-market="${attr(item.id)}">Editar</button><button class="btn danger" type="button" data-delete-market="${attr(item.id)}">Eliminar</button></div>
  </article>`;
}
function renderMarket() {
  const all=appState.market.filter(i=>monthOf(i.createdAt)===selectedMonth || (i.purchased&&inSelectedMonth(i.purchasedAt)));
  const categorySelect=$('#marketCategoryFilter');
  if(categorySelect){
    const selected=categorySelect.value||'all';
    const categories=[...new Set(all.map(i=>i.category||'Outros'))].sort((a,b)=>a.localeCompare(b,'pt-PT'));
    setHTML(categorySelect,`<option value="all">Todas as categorias</option>${categories.map(c=>`<option value="${attr(c)}">${esc(c)}</option>`).join('')}`);
    categorySelect.value=categories.includes(selected)?selected:'all';
  }
  const list=marketFilteredItems(all);
  const metrics=marketMetrics(all);
  const varianceKind=metrics.variance>0?'danger':metrics.variance<0?'success':'normal';
  setHTML('#marketSummary',`
    <article class="market-summary-item primary"><span>Estimado total</span><strong data-money>${money(metrics.estimatedTotal)}</strong><small>${all.length} item${all.length===1?'':'s'} no mês</small></article>
    <article class="market-summary-item success"><span>Gasto contabilizado</span><strong data-money>${money(metrics.accounted)}</strong><small>${metrics.missingReal?`${metrics.missingReal} comprado${metrics.missingReal===1?'':'s'} sem preço real`:'Preços reais registados'}</small></article>
    <article class="market-summary-item warning"><span>Por comprar</span><strong data-money>${money(metrics.pendingEstimated)}</strong><small>${metrics.pendingCount} item${metrics.pendingCount===1?'':'s'} pendente${metrics.pendingCount===1?'':'s'}</small></article>
    <article class="market-summary-item ${varianceKind}"><span>Diferença nas compras</span><strong data-money>${metrics.variance>0?'+':''}${money(metrics.variance)}</strong><small>Contabilizado vs. estimado dos comprados</small></article>
  `);
  const resultCount=$('#marketResultCount');
  if(resultCount) resultCount.textContent=`${list.length} de ${all.length} item${all.length===1?'':'s'}`;
  if(!list.length){
    setHTML('#marketList',`<div class="empty market-empty-state"><strong>Sem resultados</strong><span>Nenhum item corresponde aos filtros atuais.</span><button class="btn secondary" type="button" data-clear-market-filters>Limpar filtros</button></div>`);
    return;
  }
  setHTML('#marketList',marketTableHtml(list)+`<div class="market-mobile-list">${list.map(marketMobileCardHtml).join('')}</div>`);
}

function debtSummaryCard(label,value,kind='primary',note='') {
  return `<article class="debt-stat-card ${attr(kind)}"><span class="debt-stat-label">${esc(label)}</span><strong data-money>${money(value)}</strong>${note?`<small>${esc(note)}</small>`:''}</article>`;
}
function debtSummaryCounts(stats) {
  const counts=[
    ['Pagas integralmente',stats.fullyPaidCount],
    ['Não pagas',stats.unpaidCount],
    ['Pagas parcialmente',stats.partlyPaidCount],
    ['Em atraso',stats.overdueCount],
    ['Vencem hoje',stats.dueTodayCount],
    ['Futuras',stats.futureCount]
  ];
  return `<div class="debt-counts" role="group" aria-label="Quantidades de faturas">${counts.map(([label,value])=>`<div class="debt-count"><span>${esc(label)}</span><strong data-money>${value}</strong></div>`).join('')}</div>`;
}
function debtScopeHtml(stats) {
  const cards=[
    debtSummaryCard('Total das faturas',stats.totalCents,'primary',`${stats.billCount} faturas válidas`),
    debtSummaryCard('Já liquidado nessas faturas',stats.paidAllocatedCents,'success','Inclui pagamentos parciais'),
    debtSummaryCard('Em dívida · total',stats.outstandingCents,'warning','Em atraso, hoje e futuras'),
    debtSummaryCard('Em atraso',stats.overdueCents,'danger',`${stats.overdueCount} vencida(s)`),
    debtSummaryCard('A vencer',sumCents([stats.dueTodayCents,stats.futureCents]),'info','Hoje e datas futuras')
  ];
  const note=[
    `Vencem hoje: ${money(stats.dueTodayCents)} (${stats.dueTodayCount}).`,
    `Vencimentos futuros: ${money(stats.futureCents)} (${stats.futureCount}), dos quais ${money(stats.next7Cents)} nos próximos 7 dias.`
  ];
  if(stats.unknownDueCount)note.push(`Sem vencimento válido: ${money(stats.unknownDueCents)} (${stats.unknownDueCount}).`);
  if(stats.invalidCount)note.push(`${stats.invalidCount} registo(s) com valores inválidos, excluídos dos totais.`);
  if(stats.overpaidCount)note.push(`${stats.overpaidCount} fatura(s) com pagamentos em excesso, no valor de ${money(stats.overpaidCents)}; não compensam dívidas diferentes.`);
  return `<div class="debt-stats-grid">${cards.join('')}</div>${debtSummaryCounts(stats)}<p class="debt-stats-note" data-money>${esc(note.join(' '))}</p>`;
}

let debtAccountsFilter='all';
let debtAccountsLimit=24;
function debtAccountKind(bill, now=new Date()) {
  const ledger=billLedger(bill);
  if(!ledger.valid) return 'invalid';
  if(ledger.remainingCents===0) return 'paid';
  const days=billDaysUntil(bill,now);
  if(!Number.isFinite(days)) return 'unknown';
  if(days<0) return 'overdue';
  if(ledger.paidCents>0) return 'partial';
  return 'unpaid';
}
function debtAccountFilterMatches(bill,filter,now=new Date()){
  const ledger=billLedger(bill);
  const days=billDaysUntil(bill,now);
  if(filter==='all')return true;
  if(filter==='invalid')return !ledger.valid || (ledger.remainingCents>0&&!Number.isFinite(days));
  if(!ledger.valid)return false;
  if(filter==='paid')return ledger.remainingCents===0;
  if(filter==='partial')return ledger.remainingCents>0&&ledger.paidCents>0;
  if(filter==='unpaid')return ledger.remainingCents>0&&ledger.paidCents===0;
  if(filter==='overdue')return ledger.remainingCents>0&&Number.isFinite(days)&&days<0;
  if(filter==='future')return ledger.remainingCents>0&&Number.isFinite(days)&&days>=0;
  return false;
}
function renderDebtStatus(stats){
  const count=stats.billCount;
  const paid=stats.fullyPaidCount;
  const partial=stats.partlyPaidCount;
  const unpaid=stats.unpaidCount;
  const percent=value=>count?Math.round(value/count*100):0;
  setHTML('#debtStatusSummary',`
    <div class="debt-status-layout">
      <div class="debt-donut" id="debtStatusDonut" role="img" aria-label="Distribuição: pagas ${paid}, parcialmente pagas ${partial}, sem pagamentos ${unpaid}">
        <div class="debt-donut-center"><strong data-money>${count}</strong><small>contas</small></div>
      </div>
      <div class="debt-status-legend">
        <div><span class="debt-dot paid"></span><span>Pagas</span><strong data-money>${paid} (${percent(paid)}%)</strong></div>
        <div><span class="debt-dot partial"></span><span>Parciais</span><strong data-money>${partial} (${percent(partial)}%)</strong></div>
        <div><span class="debt-dot unpaid"></span><span>Sem pagamentos</span><strong data-money>${unpaid} (${percent(unpaid)}%)</strong></div>
        <div class="debt-overdue-inline"><span class="debt-dot overdue"></span><span>Em atraso</span><strong data-money>${stats.overdueCount}</strong></div>
      </div>
    </div>
    <p class="debt-balance-note">As contas em atraso também podem estar parciais ou sem pagamentos. Não são somadas novamente ao total.</p>
  `);
  const donut=$('#debtStatusDonut');
  if(donut){
    const p=count?paid/count*100:0;
    const q=count?(paid+partial)/count*100:0;
    donut.style.background=count
      ? `conic-gradient(#159455 0% ${p}%,#3479d6 ${p}% ${q}%,#e8a53c ${q}% 100%)`
      : 'conic-gradient(#e5eaf0 0% 100%)';
  }
}
function debtAccountEntryHtml(bill,now){
  const ledger=billLedger(bill);
  const kind=debtAccountKind(bill,now);
  const st=billStatus(bill,now);
  const label=kind==='invalid'?'Dados inválidos':kind==='unknown'?'Vencimento por confirmar':
    kind==='overdue'?(ledger.paidCents>0?'Atraso · parcial':'Em atraso'):
    kind==='paid'?'Paga':kind==='partial'?'Parcial':st==='due-today'?'Vence hoje':'Por pagar';
  const css=kind==='unknown'?'warning':kind==='overdue'?'overdue':kind==='paid'?'paid':kind==='partial'?'partial':kind==='invalid'?'invalid':'pending';
  const rawPaid=ledger.valid?Math.min(ledger.totalCents,ledger.paidCents):NaN;
  const due=billDueDateKey(bill);
  return `<button class="debt-ledger-row" type="button" data-debt-bill="${attr(bill.id)}" aria-label="Abrir detalhes da fatura">
    <span class="debt-ledger-name debt-sensitive"><strong>${esc(bill.title||'Fatura sem descrição')}</strong><small>${esc(bill.category||'Outros')}</small></span>
    <span class="debt-ledger-cell debt-sensitive" data-label="Vencimento">${due?esc(fmtDate(due)):'Por confirmar'}</span>
    <span class="debt-ledger-cell debt-sensitive" data-label="Valor" data-money>${money(ledger.totalCents)}</span>
    <span class="debt-ledger-cell debt-sensitive" data-label="Pago" data-money>${money(rawPaid)}</span>
    <span class="debt-ledger-cell debt-sensitive" data-label="Em dívida" data-money>${money(ledger.remainingCents)}</span>
    <span class="debt-ledger-cell debt-ledger-state debt-sensitive" data-label="Estado"><span class="status-chip ${attr(css)}">${esc(label)}</span></span>
  </button>`;
}
function renderDebtAccounts(){
  const now=new Date();
  const bills=(appState?.bills||[]).filter(b=>!b.cancelled&&!b.archived)
    .sort((a,b)=>{
      const aDue=billDueDateKey(a)||'9999-12-31';
      const bDue=billDueDateKey(b)||'9999-12-31';
      return aDue.localeCompare(bDue)||String(a.title||'').localeCompare(String(b.title||''),'pt-PT');
    });
  const tabs=[
    ['all','Todas'],['paid','Pagas'],['partial','Parciais'],
    ['unpaid','Sem pagamentos'],['overdue','Em atraso'],
    ['future','A vencer'],['invalid','Por corrigir']
  ];
  if(!tabs.some(([value])=>value===debtAccountsFilter))debtAccountsFilter='all';
  setHTML('#debtAccountsFilters',tabs.map(([value,label])=>{
    const num=bills.filter(b=>debtAccountFilterMatches(b,value,now)).length;
    return `<button type="button" data-debt-filter="${attr(value)}" class="debt-filter-chip${debtAccountsFilter===value?' active':''}" aria-pressed="${debtAccountsFilter===value?'true':'false'}">${esc(label)} <span data-money>${num}</span></button>`;
  }).join(''));
  const filtered=bills.filter(b=>debtAccountFilterMatches(b,debtAccountsFilter,now));
  const visible=filtered.slice(0,debtAccountsLimit);
  const heading=`<div class="debt-ledger-heading" aria-hidden="true"><span>Conta / descrição</span><span>Vencimento</span><span>Valor</span><span>Pago</span><span>Em dívida</span><span>Estado</span></div>`;
  const rows=visible.map(b=>debtAccountEntryHtml(b,now)).join('');
  const more=filtered.length>visible.length?`<button class="btn secondary debt-more-btn" type="button" data-debt-more>Mostrar mais contas (${filtered.length-visible.length} restantes)</button>`:'';
  setHTML('#debtAccountsList',filtered.length
    ? `${heading}<div class="debt-ledger-rows">${rows}</div>${more}`
    : '<p class="empty">Não existem contas neste estado.</p>');
}
function renderDebtStatistics() {
  const s=debtBalanceStatistics(selectedMonth);
  setHTML('#debtMonthSummary',debtScopeHtml(s.period));
  setHTML('#debtAllSummary',debtScopeHtml(s.all));
  renderDebtStatus(s.all);
  renderDebtAccounts();
  const balanceLabel=s.hasAccountBalance
    ? `Saldo introduzido manualmente${s.balanceUpdatedAt?' · '+fmtDateTime(s.balanceUpdatedAt):''}`
    : 'Saldo calculado pelos movimentos registados, não confirmado com o banco';
  const allText=s.canProjectAll
    ? `<div class="debt-balance-line"><span>Saldo após liquidar todas as faturas registadas</span><strong data-money>${money(s.projectedAllCents)}</strong></div>`
    : '<div class="debt-balance-line"><span>Saldo global</span><strong>Seleciona o mês atual para o calcular</strong></div>';
  setHTML('#debtBalanceSummary',`
    <div class="debt-balance-line"><span>Saldo de referência</span><strong data-money>${money(s.currentBalanceCents)}</strong></div>
    <p class="debt-balance-note">${esc(balanceLabel)}</p>
    <div class="debt-balance-line"><span>Saldo depois das faturas do mês selecionado</span><strong data-money>${money(s.projectedMonthCents)}</strong></div>
    ${allText}
    <div class="debt-balance-line"><span>Pagamentos efetivamente registados no mês</span><strong data-money>${money(s.paymentInMonthCents)}</strong></div>
    <p class="debt-balance-note">Simulação, não saldo bancário garantido: não inclui receitas futuras, nem faturas recorrentes ainda não criadas. Os pagamentos feitos neste mês são apresentados à parte e não devem ser somados novamente ao valor já liquidado por fatura.</p>
  `);
}

function renderReports() {
  renderDebtStatistics();
  const n=monthNumbers();
  const expenses=n.cashSpent;
  const s=debtBalanceStatistics(selectedMonth);
  const isCurrent=selectedMonth===currentLocalMonthKey();
  const items=[
    ['Receitas do mês',n.incomes,'success','Rendimentos recebidos'],
    ['Despesas do mês',expenses,'danger','Pagamentos e compras'],
    [isCurrent?'Saldo atual':'Saldo do mês',n.current,n.current<0?'danger':'primary',n.hasAccountBalance?'Introduzido manualmente':'Estimado pelos registos'],
    ['Em dívida · total',s.all.outstandingCents,'warning','Todas as faturas por liquidar']
  ];
  setHTML('#reportCards',items.map(([label,value,tone,note])=>`<article class="debt-top-card ${attr(tone)}"><span class="debt-top-label">${esc(label)}</span><strong data-money>${money(value)}</strong><small>${esc(note)}</small></article>`).join(''));
  renderCategoryBars('#reportCategoryBars',cashCategoryTotals());
  const vals=monthlySpendHistory(selectedMonth,6).map(item=>[item.month,item.total]);
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
  setHTML('#securityPolicyList', `<div class="stack-list compact"><div class="list-row"><div class="list-main"><strong>Rede restrita</strong><small>Sem trackers, anúncios ou telemetria. A sincronização usa api.github.com e recebe somente o envelope cifrado. O leitor QR e o leitor de códigos de barras usam ZXing 0.2.0 empacotado localmente e servido pela própria aplicação, sem dependência de CDN. As pesquisas iniciadas pelo utilizador em Mercado podem consultar apenas as origens autorizadas pela CSP; nenhum dado financeiro do cofre é enviado.</small></div></div><div class="list-row"><div class="list-main"><strong>Sem dados em URL</strong><small>A navegação usa apenas secções conhecidas da aplicação.</small></div></div><div class="list-row"><div class="list-main"><strong>Sem anexos reais</strong><small>A estrutura existe, mas ficheiros continuam bloqueados até cifragem dedicada.</small></div></div></div>`);
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

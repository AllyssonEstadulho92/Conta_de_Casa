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
    return `<button class="nav-btn" type="button" data-mobile="${attr(id)}" aria-label="${attr(meta.label)}">${icon(meta.icon)}<span>${esc(meta.label.replace('Lista de ',''))}</span></button>`;
  }).join(''));
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
    ['Saldo atual',n.current,'success','Disponível registado'],
    ['Por pagar',n.pending,'primary',`${n.pendingCount} conta${n.pendingCount===1?'':'s'}`],
    ['Em atraso',n.overdue,'danger',`${n.overdueCount} conta${n.overdueCount===1?'':'s'}`],
    ['Saldo projetado',n.projected,n.projected<0?'danger':'success','Após todas as obrigações do mês']
  ];
  setHTML('#kpiGrid', kpis.map(([label,value,kind,sub])=>`<article class="kpi ${kind}"><span class="label">${esc(label)}</span><strong data-money>${money(value)}</strong><small>${esc(sub)}</small></article>`).join(''));
  const secondaryMetrics = [
    ['Pago no mês',paidBills,'Pagamentos confirmados'],
    ['Próximos 7 dias',n.next7,`${n.next7Count} vencimento${n.next7Count===1?'':'s'}`]
  ];
  setHTML('#dashboardSecondary', secondaryMetrics.map(([label,value,sub])=>`<article class="dashboard-secondary-card"><div><span>${esc(label)}</span><small>${esc(sub)}</small></div><strong data-money>${money(value)}</strong></article>`).join(''));
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
  if(canDelete) return detail+`<button class="btn danger" type="button" data-delete-bill="${attr(b.id)}">Excluir</button>`;
  if(rem>0&&!b.cancelled) return detail+`<button class="btn primary" type="button" data-pay-bill="${attr(b.id)}">Pagar</button>`;
  return detail;
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

function marketItemEffectiveCents(item) {
  if(!item?.purchased) return 0;
  return item.actualCents || item.estimatedCents || 0;
}
function marketMetrics(items) {
  const purchased=items.filter(i=>i.purchased);
  const pending=items.filter(i=>!i.purchased);
  const estimatedTotal=sumCents(items.map(i=>i.estimatedCents||0));
  const accounted=sumCents(purchased.map(marketItemEffectiveCents));
  const pendingEstimated=sumCents(pending.map(i=>i.estimatedCents||0));
  const purchasedEstimated=sumCents(purchased.map(i=>i.estimatedCents||0));
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
  const diff=sumCents([item.actualCents,-(item.estimatedCents||0)]);
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
function marketTableHtml(list) {
  return `<div class="market-table-shell"><table class="market-table"><thead><tr><th scope="col" class="check-col">Comprado</th><th scope="col">Produto</th><th scope="col">Qtd.</th><th scope="col" class="money-col">Estimado</th><th scope="col" class="money-col">Preço real</th><th scope="col" class="money-col">Diferença</th><th scope="col">Estado</th><th scope="col" class="actions-col">Ações</th></tr></thead><tbody>${list.map(marketTableRowHtml).join('')}</tbody></table></div>`;
}
function marketTableRowHtml(item) {
  return `<tr class="market-table-row ${item.purchased?'purchased':''}">
    <td><label class="market-check"><input type="checkbox" data-market-toggle="${attr(item.id)}" ${item.purchased?'checked':''}><span class="sr-only">Marcar ${esc(item.name)} como comprado</span></label></td>
    <td><div class="market-identity"><strong>${esc(item.name)}</strong><small>${esc(item.category||'Outros')}</small></div></td>
    <td><span class="market-quantity">${esc(item.quantity||'1')} ${esc(item.unit||'un')}</span></td>
    <td class="money-col" data-money>${money(item.estimatedCents||0)}</td>
    <td class="market-real-cell">${marketActualInputHtml(item)}</td>
    <td class="money-col">${marketVarianceHtml(item)}</td>
    <td>${marketStatusHtml(item)}</td>
    <td><div class="market-table-actions"><button class="btn secondary" type="button" data-edit-market="${attr(item.id)}">Editar</button><button class="icon-btn danger-text" type="button" data-delete-market="${attr(item.id)}" aria-label="Eliminar ${attr(item.name)}">×</button></div></td>
  </tr>`;
}
function marketMobileCardHtml(item) {
  const effective=marketItemEffectiveCents(item);
  return `<article class="market-mobile-card ${item.purchased?'purchased':''}">
    <div class="market-mobile-head"><label class="market-check"><input type="checkbox" data-market-toggle="${attr(item.id)}" ${item.purchased?'checked':''}><span class="sr-only">Marcar ${esc(item.name)} como comprado</span></label><div><h3>${esc(item.name)}</h3><small>${esc(item.category||'Outros')} · ${esc(item.quantity||'1')} ${esc(item.unit||'un')}</small></div>${marketStatusHtml(item)}</div>
    <div class="market-mobile-money"><div><span>Estimado</span><strong data-money>${money(item.estimatedCents||0)}</strong></div><div><span>${item.purchased?'Contabilizado':'Previsto'}</span><strong data-money>${money(item.purchased?effective:(item.estimatedCents||0))}</strong></div><div><span>Diferença</span>${marketVarianceHtml(item)}</div></div>
    <div class="market-mobile-real"><span>Preço real</span>${marketActualInputHtml(item)}<small>${item.purchased&&!(item.actualCents>0)?'Enquanto faltar o preço real, os relatórios usam o valor estimado.':'Guardado automaticamente ao sair do campo.'}</small></div>
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

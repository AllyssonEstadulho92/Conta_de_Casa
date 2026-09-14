'use strict';

/* Conta de Casa v74 — experiência visual fiel ao protótipo móvel.
 * Esta camada só compõe apresentação e navegação sobre dados/handlers existentes.
 * Não altera cálculos, valores monetários, schema, IndexedDB, cifragem ou sync.
 */
(function installV74Experience(root){
  const MOBILE_QUERY='(max-width: 820px)';
  const MOBILE_NAV=[
    ['dashboard','Início','home'],
    ['bills','Despesas','bill'],
    ['market','Mercado','market'],
    ['planning','Plano','plan'],
    ['settings','Mais','more']
  ];
  const SUPPORTED_STORES=[
    ['Continente','C','continente'],
    ['Pingo Doce','PD','pingo-doce']
  ];
  let scheduled=false;
  let observer=null;
  let expenseTab='all';

  const byId=id=>document.getElementById(id);
  const q=(selector,rootNode=document)=>rootNode.querySelector(selector);
  const qa=(selector,rootNode=document)=>[...rootNode.querySelectorAll(selector)];
  const clean=value=>String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim();
  const esc=value=>clean(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const attr=value=>esc(value).replace(/`/g,'&#96;');
  const isMobile=()=>root.matchMedia?.(MOBILE_QUERY)?.matches??false;

  function moneyText(cents){
    try{return typeof money==='function'?money(Number(cents)||0):`${((Number(cents)||0)/100).toFixed(2).replace('.',',')} €`;}
    catch(_error){return '0,00 €';}
  }

  function iconMarkup(name,size=20){
    try{
      if(root.CDCIcons?.markup)return root.CDCIcons.markup(name,size);
      if(typeof icon==='function')return icon(name,size);
    }catch(_error){}
    const fallback={
      home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h14v-9.5"/>',
      bill:'<path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4"/><path d="M9 11h6M9 15h6"/>',
      receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
      market:'<path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6H18a2 2 0 0 0 2-1.6L21 8H7"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
      plan:'<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
      more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
      bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
      calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
      search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
      income:'<path d="M12 19V5m-5 5 5-5 5 5"/>',
      security:'<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
      sync:'<path d="M20 7h-5V2"/><path d="M20 7a8 8 0 0 0-14-2"/><path d="M4 17h5v5"/><path d="M4 17a8 8 0 0 0 14 2"/>',
      report:'<path d="M5 21v-6M12 21V9M19 21V3"/>',
      goal:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
      shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
      cloudCheck:'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="m9 12 2 2 4-4"/>',
      activity:'<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
      settings:'<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>'
    };
    return `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${fallback[name]||fallback.more}</svg>`;
  }

  function appReady(){
    try{return Boolean(document.documentElement.classList.contains('app-active')&&typeof appState!=='undefined'&&appState);}
    catch(_error){return false;}
  }

  function selectedMonthKey(){
    try{return String(selectedMonth||'');}catch(_error){return '';}
  }

  function monthLabel(){
    const key=selectedMonthKey();
    if(!/^\d{4}-\d{2}$/.test(key))return 'Mês atual';
    const [year,month]=key.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-PT',{month:'long',year:'numeric'}).format(new Date(year,month-1,1)).replace(/^./,c=>c.toUpperCase());
  }

  function profileName(){
    try{return clean(appState?.settings?.profileName||'Utilizador').split(/\s+/)[0]||'Utilizador';}
    catch(_error){return 'Utilizador';}
  }

  function initials(){return profileName().slice(0,2).toLocaleUpperCase('pt-PT');}

  function ensureMobileNav(){
    const nav=byId('mobileNav');
    if(!nav)return;
    const current=qa('[data-mobile]',nav).map(node=>node.dataset.mobile).join(',');
    const expected=MOBILE_NAV.map(item=>item[0]).join(',');
    if(current===expected&&nav.dataset.v74Nav==='1')return;
    nav.dataset.v74Nav='1';
    nav.innerHTML=MOBILE_NAV.map(([page,label,iconName])=>`<button class="nav-btn" type="button" data-mobile="${page}" aria-label="${label}">${iconMarkup(iconName,20)}<span>${label}</span></button>`).join('');
    syncMobileNavState();
  }

  function syncMobileNavState(){
    const nav=byId('mobileNav');
    if(!nav)return;
    let page='dashboard';
    try{page=typeof currentPage==='function'?currentPage():(location.hash.replace('#','')||'dashboard');}catch(_error){}
    const parent=page==='calendar'?'bills':page==='goals'?'planning':page==='diagnostics'||page==='security'?'settings':page;
    qa('[data-mobile]',nav).forEach(button=>{
      const active=button.dataset.mobile===parent;
      button.classList.toggle('active',active);
      if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
    });
  }

  function dashboardMetrics(){
    try{
      if(typeof dashboardNumbers!=='function')return null;
      const n=dashboardNumbers();
      const spent=typeof sumCents==='function'?sumCents([n.paymentTotal||0,n.marketSpent||0]):Number(n.paymentTotal||0)+Number(n.marketSpent||0);
      const budget=Number(n.profile?.budgetCents||0);
      const pct=budget>0?Math.max(0,Math.min(100,Math.round(spent/budget*100))):0;
      const remaining=budget>0?Math.max(0,budget-spent):0;
      return {spent,budget,pct,remaining,projected:Number(n.projected||0),current:Number(n.current||0)};
    }catch(_error){return null;}
  }

  function categoryEntries(){
    try{return typeof categoryTotals==='function'?categoryTotals().filter(entry=>Number(entry?.[1])>0):[];}
    catch(_error){return [];}
  }

  function categoryTone(index){return ['food','home','transport','health','other'][index%5];}

  function heroHtml(metrics){
    const budgetLine=metrics.budget>0
      ? `<div class="cdc-budget-head"><span>Orçamento: <strong data-money>${moneyText(metrics.budget)}</strong></span><strong>${metrics.pct}%</strong></div><div class="cdc-budget-track" aria-label="${metrics.pct}% do orçamento utilizado"><span></span></div><small>Disponível: <strong data-money>${moneyText(metrics.remaining)}</strong></small>`
      : `<div class="cdc-budget-head"><span>Orçamento mensal</span><strong>Por definir</strong></div><small>Defina o orçamento em Planeamento.</small>`;
    return `<section id="cdcMonthHero" class="cdc-month-hero" aria-label="Resumo financeiro do mês"><div class="cdc-month-hero-main"><span>Resumo do mês</span><strong data-money>${moneyText(metrics.spent)}</strong><small>Total de despesas efetivamente registadas.</small></div><div class="cdc-budget-box">${budgetLine}</div></section>`;
  }

  function quickActionsHtml(){
    return `<section id="cdcQuickActions" class="cdc-quick-actions" aria-label="Ações rápidas"><button class="cdc-quick-action" type="button" data-v74-action="expense"><span class="cdc-quick-action-icon" aria-hidden="true">${iconMarkup('bill',21)}</span><strong>Adicionar<br>despesa</strong></button><button class="cdc-quick-action" type="button" data-v74-action="invoice"><span class="cdc-quick-action-icon" aria-hidden="true">${iconMarkup('receipt',21)}</span><strong>Ler fatura</strong></button><button class="cdc-quick-action" type="button" data-v74-action="market"><span class="cdc-quick-action-icon" aria-hidden="true">${iconMarkup('market',21)}</span><strong>Mercado</strong></button></section>`;
  }

  function greetingHtml(){
    return `<section id="cdcMobileGreeting" class="cdc-mobile-greeting" aria-label="Boas-vindas"><span class="cdc-avatar" aria-hidden="true">${esc(initials())}</span><div><span>Olá, ${esc(profileName())}</span><strong>Bem-vindo de volta!</strong></div><button type="button" class="cdc-greeting-bell" data-v74-notifications aria-label="Ver notificações">${iconMarkup('bell',20)}</button></section>`;
  }

  function monthControlHtml(){
    return `<label id="cdcMobileMonthWrap" class="cdc-mobile-month"><span aria-hidden="true">‹</span><input id="cdcMobileMonth" type="month" value="${attr(selectedMonthKey())}" aria-label="Mês em análise"><strong>${esc(monthLabel())}</strong><span class="cdc-mobile-month-calendar" aria-hidden="true">${iconMarkup('calendar',17)}</span></label>`;
  }

  function dashboardCategoryHtml(){
    const entries=categoryEntries().slice(0,5);
    const total=entries.reduce((sum,entry)=>sum+Number(entry[1]||0),0)||1;
    return `<section id="cdcDashboardCategories" class="cdc-dashboard-categories" aria-label="Despesas por categoria"><div class="cdc-section-title"><strong>Despesas por categoria</strong><button type="button" data-v74-go="reports">Ver todas</button></div><div class="cdc-category-list">${entries.length?entries.map(([name,value],index)=>{const pct=Math.round(Number(value||0)/total*100);return `<div class="cdc-category-row"><span class="cdc-category-dot ${categoryTone(index)}" aria-hidden="true"></span><div><strong>${esc(name)}</strong><span class="cdc-mini-track"><i style="width:${Math.max(5,pct)}%"></i></span></div><strong data-money>${moneyText(value)}</strong><small>${pct}%</small></div>`;}).join(''):'<p class="cdc-empty-note">Ainda não existem despesas neste mês.</p>'}</div></section>`;
  }

  function replaceOrInsert(id,html,anchor,position='beforebegin'){
    const existing=byId(id);if(existing){existing.outerHTML=html;return byId(id);}
    anchor?.insertAdjacentHTML(position,html);return byId(id);
  }

  function renderDashboardPrototype(){
    const page=byId('page-dashboard');if(!page||!appReady())return;
    const metrics=dashboardMetrics();if(!metrics)return;
    const kpi=byId('kpiGrid');
    const secondary=byId('dashboardSecondary');
    if(isMobile()){
      if(kpi)replaceOrInsert('cdcMobileGreeting',greetingHtml(),kpi,'beforebegin');
      const greeting=byId('cdcMobileGreeting');
      if(greeting)replaceOrInsert('cdcMobileMonthWrap',monthControlHtml(),greeting,'afterend');
    }else{byId('cdcMobileGreeting')?.remove();byId('cdcMobileMonthWrap')?.remove();}
    if(kpi)replaceOrInsert('cdcMonthHero',heroHtml(metrics),kpi,'beforebegin');
    if(kpi)replaceOrInsert('cdcQuickActions',quickActionsHtml(),kpi,'beforebegin');
    if(secondary)replaceOrInsert('cdcDashboardCategories',dashboardCategoryHtml(),secondary,'afterend');
  }

  function movementRows(){
    try{
      const month=selectedMonthKey();
      const bills=(appState?.bills||[]).filter(b=>String(b?.dueDate||'').slice(0,7)===month);
      const payments=(appState?.payments||[]).filter(p=>String(p?.date||'').slice(0,7)===month).map(p=>({id:p.id,type:'payment',title:p.description||'Pagamento',date:p.date,cents:Number(p.amountCents||0),category:p.category||'Pagamentos'}));
      const markets=(appState?.markets||[]).filter(m=>String(m?.date||m?.updatedAt||'').slice(0,7)===month).map(m=>({id:m.id,type:'market',title:m.name||'Mercado',date:m.date||m.updatedAt,cents:Number(m.actualCents??m.estimatedCents??0),category:'Mercado'}));
      const billRows=bills.map(b=>({id:b.id,type:'bill',title:b.title||b.description||'Despesa',date:b.dueDate,cents:Number(b.amountCents||0),category:b.category||'Outros'}));
      return [...billRows,...payments,...markets].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    }catch(_error){return [];}
  }

  function expenseFeedHtml(){
    let rows=movementRows();
    if(expenseTab==='paid')rows=rows.filter(row=>row.type==='payment'||row.type==='market');
    if(expenseTab==='pending')rows=rows.filter(row=>row.type==='bill');
    const body=rows.slice(0,60).map(row=>`<button type="button" class="cdc-expense-row" ${row.type==='bill'?`data-bill-id="${attr(row.id)}"`:'disabled'}><span class="cdc-expense-icon ${row.type}">${iconMarkup(row.type==='market'?'market':row.type==='payment'?'income':'bill',19)}</span><span><strong>${esc(row.title)}</strong><small>${esc(row.category)} · ${esc(row.date||'')}</small></span><strong data-money>${moneyText(row.cents)}</strong><i>${row.type==='bill'?'›':''}</i></button>`).join('');
    return `<section id="cdcExpenseFeed" class="cdc-expense-feed"><div class="cdc-expense-tabs"><button type="button" class="${expenseTab==='all'?'active':''}" data-expense-tab="all">Todos</button><button type="button" class="${expenseTab==='paid'?'active':''}" data-expense-tab="paid">Pagos</button><button type="button" class="${expenseTab==='pending'?'active':''}" data-expense-tab="pending">Pendentes</button></div><div class="cdc-expense-list">${body||'<p class="cdc-empty-note">Ainda não existem movimentos neste mês.</p>'}</div></section>`;
  }

  function renderExpenseFeed(){
    const page=byId('page-bills'),list=byId('billsList');if(!page||!list)return;
    replaceOrInsert('cdcExpenseFeed',expenseFeedHtml(),list,'afterend');
    if(isMobile()&&!byId('cdcExpenseFab'))page.insertAdjacentHTML('beforeend','<button id="cdcExpenseFab" class="cdc-expense-fab" type="button" data-v74-action="expense" aria-label="Adicionar despesa"><span>+</span></button>');
    if(!isMobile())byId('cdcExpenseFab')?.remove();
  }

  function marketHomeHtml(){
    const names=SUPPORTED_STORES.map(([name,abbr,id])=>`<button class="cdc-store-card" type="button" data-v74-market-browser="${id}"><span>${esc(abbr)}</span><strong>${esc(name)}</strong><small>Pesquisar produtos</small></button>`).join('');
    const lists=(appState?.markets||[]).slice(-4).reverse().map(m=>`<button class="cdc-list-row" type="button" data-market-id="${attr(m.id)}"><span>${iconMarkup('market',18)}</span><span><strong>${esc(m.name||'Lista')}</strong><small>${esc(m.date||'')}</small></span><strong data-money>${moneyText(m.actualCents??m.estimatedCents??0)}</strong><i>›</i></button>`).join('');
    return `<section id="cdcMarketHome" class="cdc-market-home"><div class="cdc-section-title"><strong>Supermercados</strong><button type="button" data-v74-market-browser="all">Ver todos</button></div><div class="cdc-store-grid">${names}</div><div class="cdc-section-title"><strong>As minhas listas</strong></div><div class="cdc-list-box">${lists||'<p class="cdc-empty-note">Ainda não existem listas.</p>'}</div></section>`;
  }

  function renderMarketHome(){
    const page=byId('page-market'),toolbar=q('.market-toolbar',page);if(!page)return;
    if(toolbar)replaceOrInsert('cdcMarketHome',marketHomeHtml(),toolbar,'afterend');
  }

  function planningOverviewHtml(){
    const metrics=dashboardMetrics()||{spent:0,budget:0,remaining:0,pct:0};
    return `<section id="cdcPlanningOverview" class="cdc-planning-overview"><div class="cdc-planning-summary"><span>Total gasto este mês</span><strong data-money>${moneyText(metrics.spent)}</strong><small>Orçamento: <b data-money>${metrics.budget?moneyText(metrics.budget):'Por definir'}</b></small></div><div class="cdc-planning-progress"><div><span></span></div><small>${metrics.budget?`${metrics.pct}% utilizado`:'Defina um orçamento mensal'}</small></div></section>`;
  }

  function renderPlanningPrototype(){
    const page=byId('page-planning');if(!page)return;
    const tabs=q('.section-tabs',page);
    if(tabs){const buttons=qa('.section-tab',tabs);if(buttons[0])buttons[0].textContent='Orçamento';if(buttons[1])buttons[1].textContent='Metas';}
    if(tabs)replaceOrInsert('cdcPlanningOverview',planningOverviewHtml(),tabs,'afterend');
  }

  function reportSummaryHtml(){
    const entries=categoryEntries().slice(0,5),total=entries.reduce((sum,entry)=>sum+Number(entry[1]||0),0);let offset=0;
    const stops=entries.map((entry,index)=>{const start=offset;offset+=total?Number(entry[1]||0)/total*100:0;return `var(--cdc-chart-${index}) ${start}% ${offset}%`;}).join(',');
    return `<section id="cdcReportSummary" class="cdc-report-summary"><div class="cdc-report-tabs"><button class="active" type="button">Visão geral</button><button type="button" data-v74-go="reports">Categorias</button><button type="button" data-v74-go="market">Lojas</button></div><div class="cdc-report-donut" style="--segments:${stops||'var(--surface-2) 0 100%'}"><div><strong data-money>${moneyText(total)}</strong><small>este mês</small></div></div><div class="cdc-report-legend">${entries.map(([name,value],index)=>`<div><i class="tone-${index}"></i><span>${esc(name)}</span><strong>${total?Math.round(Number(value||0)/total*100):0}%</strong></div>`).join('')}</div></section>`;
  }

  function renderReportsPrototype(){
    const page=byId('page-reports');if(!page)return;
    replaceOrInsert('cdcReportSummary',reportSummaryHtml(),page,'afterbegin');
  }

  function moreMenuHtml(){
    const items=[['market','As minhas listas','market'],['planning','Planeamento e orçamento','plan'],['reports','Relatórios','report'],['goals','Metas de poupança','goal'],['security','Segurança e privacidade','shield'],['sync','Sincronização','cloudCheck'],['diagnostics','Diagnóstico e integridade','activity']];
    return `<section id="cdcMoreMenu" class="cdc-more-menu"><div class="cdc-profile-card"><span class="cdc-avatar">${esc(initials())}</span><div><strong>${esc(profileName())}</strong><small>Conta de Casa · cofre local</small></div></div><div class="cdc-more-list">${items.map(([page,label,iconName])=>`<button type="button" ${page==='sync'?'data-v74-more="sync"':`data-v74-go="${page}"`}><span>${iconMarkup(iconName,19)}</span><strong>${esc(label)}</strong><i>›</i></button>`).join('')}</div></section>`;
  }

  function renderMorePrototype(){
    const page=byId('page-settings');if(!page)return;
    if(!byId('cdcMoreMenu'))page.insertAdjacentHTML('afterbegin',moreMenuHtml());
    const panel=q(':scope > .panel.narrow',page);
    if(panel&&!panel.closest('#cdcPreferencesDetails')){
      const details=document.createElement('details');details.id='cdcPreferencesDetails';details.className='cdc-preferences-details';
      const summary=document.createElement('summary');summary.textContent='Definições da aplicação';panel.before(details);details.append(summary,panel);
    }
  }

  function decorateBillForm(){
    const form=byId('billForm');if(!form)return;
    const id=clean(form.elements?.id?.value||''),title=byId('dialogTitle');
    if(title)title.textContent=id?'Editar despesa':'Adicionar despesa';
    if(id||form.dataset.v74Decorated==='1')return;
    form.dataset.v74Decorated='1';form.dataset.v74BillMode='manual';
    form.insertAdjacentHTML('afterbegin','<div class="cdc-bill-mode-tabs full-row" role="tablist" aria-label="Modo de registo"><button class="active" type="button" role="tab" data-v74-bill-mode="manual" aria-selected="true">Manual</button><button type="button" role="tab" data-v74-bill-mode="scan" aria-selected="false">Ler fatura</button><button type="button" role="tab" data-v74-bill-mode="photo" aria-selected="false">QR / Fotografia</button></div>');
    const submit=q('button[type="submit"]',form);if(submit)submit.textContent='Guardar despesa';
  }

  function setBillMode(mode,trigger=false){
    const form=byId('billForm');if(!form)return;
    const next=['manual','scan','photo'].includes(mode)?mode:'manual';form.dataset.v74BillMode=next;
    qa('[data-v74-bill-mode]',form).forEach(button=>{const active=button.dataset.v74BillMode===next;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));});
    if(!trigger||next==='manual')return;
    const activate=()=>{if(next==='scan')q('[data-invoice-camera]',form)?.click();if(next==='photo')byId('invoiceImageInput')?.click();};
    if(q('[data-invoice-capture]',form))activate();else setTimeout(activate,60);
  }

  function renderWelcome(){
    const create=byId('vaultCreate'),unlock=byId('vaultUnlock'),card=q('#vaultScreen .vault-card');
    if(!create||!unlock||!card)return;
    if(!unlock.hidden){byId('cdcWelcome')?.remove();create.classList.remove('cdc-vault-create-collapsed');return;}
    if(create.hidden||byId('cdcWelcome'))return;
    create.classList.add('cdc-vault-create-collapsed');
    card.insertAdjacentHTML('afterbegin','<section id="cdcWelcome" class="cdc-welcome"><div class="cdc-house-mark" aria-hidden="true"><span></span><i>€</i></div><h1>Conta de Casa</h1><p>Mais controlo. Uma vida melhor.</p><ul><li>Organize as suas despesas</li><li>Planeie o seu mês</li><li>Poupe com inteligência</li></ul><button type="button" class="btn primary full" data-v74-welcome-start>Começar</button><button type="button" class="cdc-welcome-link" data-v74-import>Já tem um cofre? <strong>Importar dados</strong></button></section>');
  }

  function syncThemeChrome(){
    const dark=document.documentElement.dataset.theme==='dark';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#071b20':'#f4f8f8');
  }

  function openExpense(mode='manual'){
    if(typeof openBillForm!=='function')return;
    openBillForm();
    setTimeout(()=>{decorateBillForm();setBillMode(mode,mode!=='manual');},40);
  }

  function handleAction(action){
    if(action==='market'){if(typeof showPage==='function')showPage('market');return;}
    if(action==='expense'){openExpense('manual');return;}
    if(action==='invoice')openExpense('scan');
  }

  function stepMonth(delta){
    const key=selectedMonthKey();if(!/^\d{4}-\d{2}$/.test(key))return;
    const [year,month]=key.split('-').map(Number),next=new Date(year,month-1+Number(delta||0),1),value=`${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}`;
    const picker=byId('monthPicker');if(!picker)return;picker.value=value;picker.dispatchEvent(new Event('change',{bubbles:true}));
  }

  function handleMoreSync(){
    if(typeof showPage==='function')showPage('security');
    setTimeout(()=>byId('syncPanel')?.scrollIntoView({block:'start',behavior:root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth'}),40);
  }

  function apply(){
    renderWelcome();ensureMobileNav();syncMobileNavState();syncThemeChrome();
    if(!appReady())return;
    renderDashboardPrototype();renderExpenseFeed();renderMarketHome();renderPlanningPrototype();renderReportsPrototype();renderMorePrototype();decorateBillForm();
  }

  function schedule(){
    if(scheduled)return;scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;apply();});
  }

  function observeStableRoots(){
    observer=new MutationObserver(schedule);
    observer.observe(document.documentElement,{attributes:true,attributeFilter:['class','data-theme']});
    for(const [id,subtree,characterData] of [['kpiGrid',false,false],['billsList',false,false],['marketList',false,false],['reportCards',false,false],['pageTitle',true,true],['dialogBody',false,false]]){
      const node=byId(id);if(node)observer.observe(node,{childList:true,subtree,characterData});
    }
    const vault=byId('vaultScreen');if(vault)observer.observe(vault,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
  }

  function start(){
    document.documentElement.classList.add('cdc-v74');
    document.addEventListener('click',event=>{
      const startButton=event.target.closest?.('[data-v74-welcome-start]');
      if(startButton){byId('cdcWelcome')?.setAttribute('hidden','');byId('vaultCreate')?.classList.remove('cdc-vault-create-collapsed');q('#newPassphrase')?.focus({preventScroll:true});return;}
      const importButton=event.target.closest?.('[data-v74-import]');
      if(importButton){byId('vaultTransferToggle')?.click();byId('vaultTransferPanel')?.scrollIntoView({block:'center'});return;}
      const action=event.target.closest?.('[data-v74-action]');
      if(action){event.preventDefault();handleAction(action.dataset.v74Action);return;}
      const nav=event.target.closest?.('[data-v74-go]');
      if(nav){event.preventDefault();if(typeof showPage==='function')showPage(nav.dataset.v74Go);return;}
      const tab=event.target.closest?.('[data-expense-tab]');
      if(tab){event.preventDefault();expenseTab=tab.dataset.expenseTab||'all';renderExpenseFeed();return;}
      const browser=event.target.closest?.('[data-v74-market-browser]');
      if(browser){event.preventDefault();byId('newMarketBtn')?.click();return;}
      const monthStep=event.target.closest?.('[data-v74-month-step]');
      if(monthStep){event.preventDefault();stepMonth(monthStep.dataset.v74MonthStep);return;}
      const billMode=event.target.closest?.('[data-v74-bill-mode]');
      if(billMode){event.preventDefault();setBillMode(billMode.dataset.v74BillMode,true);return;}
      if(event.target.closest?.('[data-invoice-apply]'))setTimeout(()=>setBillMode('manual',false),0);
      if(event.target.closest?.('[data-v74-more="sync"]')){event.preventDefault();handleMoreSync();return;}
      if(event.target.closest?.('[data-v74-notifications]')){event.preventDefault();byId('notificationsBtn')?.click();return;}
      if(event.target.closest?.('#newBillBtn,[data-edit-bill],[data-bill-id]'))setTimeout(decorateBillForm,40);
      if(event.target.closest?.('#mobileNav [data-mobile]'))setTimeout(syncMobileNavState,0);
    });

    document.addEventListener('change',event=>{
      if(event.target?.id==='cdcMobileMonth'){
        const picker=byId('monthPicker');if(picker){picker.value=event.target.value;picker.dispatchEvent(new Event('change',{bubbles:true}));}
      }
      if(event.target?.id==='monthPicker')schedule();
    });
    document.addEventListener('input',event=>{if(event.target?.id==='billSearch')renderExpenseFeed();});
    window.addEventListener('hashchange',schedule,{passive:true});
    root.matchMedia?.(MOBILE_QUERY)?.addEventListener?.('change',schedule);
    observeStableRoots();schedule();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  root.CDCV74=Object.freeze({VERSION:'v74',MOBILE_NAV:MOBILE_NAV.map(item=>item[0]),dashboardMetrics,categoryEntries,movementRows,isMobile});
})(typeof window!=='undefined'?window:globalThis);

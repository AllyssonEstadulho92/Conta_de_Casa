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
    ['planning','Planeamento','plan'],
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
  const mobile=()=>root.matchMedia?.(MOBILE_QUERY)?.matches??false;

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
      plan:'<path d="M4 19V9m6 10V5m6 14v-7m4 7H2"/>',
      more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
      bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
      calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
      search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
      income:'<path d="M12 19V5m-5 5 5-5 5 5"/>',
      expense:'<path d="M12 5v14m5-5-5 5-5-5"/>',
      security:'<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
      sync:'<path d="M20 7h-5V2"/><path d="M20 7a8 8 0 0 0-14-2"/><path d="M4 17h5v5"/><path d="M4 17a8 8 0 0 0 14 2"/>',
      settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z"/>'
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

  function initials(){
    const name=profileName();
    return name.slice(0,2).toLocaleUpperCase('pt-PT');
  }

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

  function dashboardCategoryHtml(){
    const entries=categoryEntries().slice(0,5);
    const total=entries.reduce((sum,entry)=>sum+Number(entry[1]||0),0)||1;
    return `<section id="cdcDashboardCategories" class="cdc-dashboard-categories" aria-label="Despesas por categoria">
      <div class="cdc-section-title"><strong>Despesas por categoria</strong><button type="button" data-v74-go="reports">Ver todas</button></div>
      <div class="cdc-category-list">${entries.length?entries.map(([name,value],index)=>{
        const pct=Math.round(Number(value||0)/total*100);
        return `<div class="cdc-category-row"><span class="cdc-category-dot ${categoryTone(index)}" aria-hidden="true"></span><div><strong>${esc(name)}</strong><span class="cdc-mini-track"><i style="width:${Math.max(5,pct)}%"></i></span></div><strong data-money>${moneyText(value)}</strong><small>${pct}%</small></div>`;
      }).join(''):'<p class="cdc-empty-note">Ainda não existem despesas neste mês.</p>'}</div>
    </section>`;
  }

  function heroHtml(metrics){
    const budgetLine=metrics.budget>0
      ? `<div class="cdc-budget-head"><span>Orçamento: <strong data-money>${moneyText(metrics.budget)}</strong></span><strong>${metrics.pct}%</strong></div><div class="cdc-budget-track" aria-label="${metrics.pct}% do orçamento utilizado"><span></span></div><small>Disponível: <strong data-money>${moneyText(metrics.remaining)}</strong></small>`
      : `<div class="cdc-budget-head"><span>Orçamento mensal</span><strong>Por definir</strong></div><small>Defina o orçamento em Planeamento.</small>`;
    return `<section id="cdcMonthHero" class="cdc-month-hero" aria-label="Resumo financeiro do mês">
      <div class="cdc-month-hero-main"><span>Resumo do mês</span><strong data-money>${moneyText(metrics.spent)}</strong><small>Total de despesas efetivamente registadas.</small></div>
      <div class="cdc-budget-box">${budgetLine}</div>
    </section>`;
  }

  function quickActionsHtml(){
    return `<section id="cdcQuickActions" class="cdc-quick-actions" aria-label="Ações rápidas">
      <button class="cdc-quick-action" type="button" data-v74-action="expense"><span class="cdc-quick-action-icon" aria-hidden="true">${iconMarkup('bill',21)}</span><strong>Adicionar<br>despesa</strong></button>
      <button class="cdc-quick-action" type="button" data-v74-action="invoice"><span class="cdc-quick-action-icon" aria-hidden="true">${iconMarkup('receipt',21)}</span><strong>Ler fatura</strong></button>
      <button class="cdc-quick-action" type="button" data-v74-action="market"><span class="cdc-quick-action-icon" aria-hidden="true">${iconMarkup('market',21)}</span><strong>Mercado</strong></button>
    </section>`;
  }

  function greetingHtml(){
    return `<section id="cdcMobileGreeting" class="cdc-mobile-greeting" aria-label="Boas-vindas">
      <span class="cdc-avatar" aria-hidden="true">${esc(initials())}</span>
      <div><span>Olá, ${esc(profileName())}</span><strong>Bem-vindo de volta!</strong></div>
      <button type="button" class="cdc-greeting-bell" data-v74-notifications aria-label="Ver notificações">${iconMarkup('bell',20)}</button>
    </section>`;
  }

  function monthControlHtml(){
    const key=selectedMonthKey();
    return `<label id="cdcMobileMonthWrap" class="cdc-mobile-month"><span aria-hidden="true">‹</span><input id="cdcMobileMonth" type="month" value="${attr(key)}" aria-label="Mês em análise"><strong>${esc(monthLabel())}</strong><span class="cdc-mobile-month-calendar" aria-hidden="true">${iconMarkup('calendar',17)}</span></label>`;
  }

  function renderDashboardPrototype(){
    if(!appReady())return;
    const kpis=byId('kpiGrid');
    if(!kpis)return;
    const metrics=dashboardMetrics();
    if(!metrics)return;
    const page=byId('page-dashboard');
    if(!page)return;

    let greeting=byId('cdcMobileGreeting');
    if(!greeting){const shell=document.createElement('div');shell.innerHTML=greetingHtml();greeting=shell.firstElementChild;page.prepend(greeting);}
    else greeting.outerHTML=greetingHtml();

    let month=byId('cdcMobileMonthWrap');
    if(!month){const shell=document.createElement('div');shell.innerHTML=monthControlHtml();month=shell.firstElementChild;byId('cdcMobileGreeting')?.after(month);}
    else month.outerHTML=monthControlHtml();

    let hero=byId('cdcMonthHero');
    const heroShell=document.createElement('div');heroShell.innerHTML=heroHtml(metrics);const nextHero=heroShell.firstElementChild;
    if(hero)hero.replaceWith(nextHero);else kpis.before(nextHero);
    nextHero.style.setProperty('--cdc-budget-pct',`${metrics.pct}%`);

    if(!byId('cdcQuickActions'))nextHero.insertAdjacentHTML('afterend',quickActionsHtml());
    const actions=byId('cdcQuickActions');
    const category=byId('cdcDashboardCategories');
    const categoryShell=document.createElement('div');categoryShell.innerHTML=dashboardCategoryHtml();const nextCategory=categoryShell.firstElementChild;
    if(category)category.replaceWith(nextCategory);else actions?.insertAdjacentElement('afterend',nextCategory);
  }

  function dateTime(value){
    const date=new Date(value||0);
    return Number.isNaN(date.getTime())?new Date(0):date;
  }

  function movementRows(){
    if(!appReady())return [];
    const rows=[];
    try{
      for(const bill of appState.bills||[]){
        if(bill.archived||bill.cancelled)continue;
        if(typeof billInMonth==='function'&&!billInMonth(bill))continue;
        const payments=(appState.payments||[]).filter(p=>p.billId===bill.id).sort((a,b)=>dateTime(b.paidAt)-dateTime(a.paidAt));
        const when=payments[0]?.paidAt||bill.createdAt||bill.dueAt||`${bill.dueDate||selectedMonthKey()+'-01'}T12:00:00`;
        rows.push({type:'out',id:bill.id,title:bill.title||'Despesa',subtitle:bill.provider||bill.category||'Despesa',amount:Number(bill.totalCents||0),when,category:bill.category||'Outros'});
      }
      for(const income of appState.incomes||[]){
        if(typeof inSelectedMonth==='function'&&!inSelectedMonth(income.receivedAt))continue;
        rows.push({type:'in',id:income.id,title:income.description||'Entrada',subtitle:'Rendimento',amount:Number(income.amountCents||0),when:income.receivedAt,category:'Rendimento'});
      }
    }catch(_error){}
    const search=clean(byId('billSearch')?.value||'').toLocaleLowerCase('pt-PT');
    return rows.filter(row=>(expenseTab==='all'||expenseTab===row.type)&&(!search||`${row.title} ${row.subtitle} ${row.category}`.toLocaleLowerCase('pt-PT').includes(search))).sort((a,b)=>dateTime(b.when)-dateTime(a.when));
  }

  function dayKey(value){
    const date=dateTime(value);if(date.getTime()===0)return 'Sem data';
    const today=new Date();
    const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if(key(date)===key(today))return `Hoje, ${new Intl.DateTimeFormat('pt-PT',{day:'numeric',month:'long'}).format(date)}`;
    const yesterday=new Date(today);yesterday.setDate(today.getDate()-1);
    if(key(date)===key(yesterday))return `Ontem, ${new Intl.DateTimeFormat('pt-PT',{day:'numeric',month:'long'}).format(date)}`;
    return new Intl.DateTimeFormat('pt-PT',{day:'numeric',month:'long'}).format(date).replace(/^./,c=>c.toUpperCase());
  }

  function movementIcon(row,index){
    if(row.type==='in')return ['income','income'];
    const text=`${row.title} ${row.category}`.toLocaleLowerCase('pt-PT');
    if(/aliment|mercado|supermerc|continente|pingo/.test(text))return ['market','food'];
    if(/casa|renda|energia|eletric|água|gas|gás/.test(text))return ['home','home'];
    if(/transport|combust|galp|autom/.test(text))return ['plan','transport'];
    if(/saúde|saude|farm/.test(text))return ['security','health'];
    return ['bill',categoryTone(index)];
  }

  function renderExpenseFeed(){
    const page=byId('page-bills');
    const command=q('.bill-command-bar',page);
    if(!page||!command)return;
    let tabs=byId('cdcExpenseTabs');
    const tabsHtml=`<div id="cdcExpenseTabs" class="cdc-segmented" role="tablist" aria-label="Movimentos"><button type="button" role="tab" data-expense-tab="all" aria-selected="${expenseTab==='all'}" class="${expenseTab==='all'?'active':''}">Todas</button><button type="button" role="tab" data-expense-tab="in" aria-selected="${expenseTab==='in'}" class="${expenseTab==='in'?'active':''}">Entradas</button><button type="button" role="tab" data-expense-tab="out" aria-selected="${expenseTab==='out'}" class="${expenseTab==='out'?'active':''}">Saídas</button></div>`;
    if(tabs)tabs.outerHTML=tabsHtml;else command.insertAdjacentHTML('beforebegin',tabsHtml);

    const rows=movementRows();
    const groups=new Map();
    rows.forEach(row=>{const key=dayKey(row.when);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);});
    const body=[...groups.entries()].map(([label,items])=>`<section class="cdc-movement-day"><h3>${esc(label)}</h3><div>${items.map((row,index)=>{
      const [iconName,tone]=movementIcon(row,index);
      const date=dateTime(row.when);
      const time=date.getTime()?new Intl.DateTimeFormat('pt-PT',{hour:'2-digit',minute:'2-digit'}).format(date):'';
      const action=row.type==='out'?`data-bill-id="${attr(row.id)}"`:'data-v74-go="planning"';
      return `<button type="button" class="cdc-movement-row" ${action}><span class="cdc-movement-icon ${tone}">${iconMarkup(iconName,19)}</span><span class="cdc-movement-copy"><strong>${esc(row.title)}</strong><small>${esc(row.subtitle)}</small></span><span class="cdc-movement-value ${row.type==='in'?'income':'expense'}"><strong data-money>${row.type==='in'?'+ ':'- '}${moneyText(row.amount)}</strong><small>${esc(time)}</small></span></button>`;
    }).join('')}</div></section>`).join('');
    const feedHtml=`<div id="cdcExpenseFeed" class="cdc-expense-feed" aria-live="polite">${body||'<p class="cdc-empty-note">Sem movimentos para este filtro.</p>'}</div><button id="cdcExpenseFab" class="cdc-expense-fab" type="button" data-v74-action="expense" aria-label="Adicionar despesa">+</button>`;
    const current=byId('cdcExpenseFeed');
    if(current){current.outerHTML=feedHtml.split('<button id="cdcExpenseFab"')[0];const fab=byId('cdcExpenseFab');if(!fab)page.insertAdjacentHTML('beforeend',feedHtml.slice(feedHtml.indexOf('<button id="cdcExpenseFab"')));}
    else command.insertAdjacentHTML('afterend',feedHtml);
  }

  function productImage(item){
    let src='';
    try{src=typeof safeProductImageUrl==='function'?safeProductImageUrl(item?.imageUrl):'';}catch(_error){}
    return src?`<img src="${attr(src)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">`:`<span>${iconMarkup('market',23)}</span>`;
  }

  function renderMarketHome(){
    const page=byId('page-market');
    const command=q('.market-command-bar',page);
    if(!page||!command||byId('cdcMarketHome'))return;
    let items=[];
    try{items=(appState.market||[]).filter(item=>!item.purchased).slice(0,3);}catch(_error){}
    const featured=items.length?items.map(item=>`<button class="cdc-product-card" type="button" data-edit-market="${attr(item.id)}"><span class="cdc-product-image">${productImage(item)}</span><strong>${esc(item.name||'Produto')}</strong><small>${esc(item.category||'Outros')}</small><b data-money>${moneyText(Number(item.estimatedCents||0))}</b></button>`).join(''):'<p class="cdc-empty-note">Pesquise produtos reais para começar a sua lista.</p>';
    command.insertAdjacentHTML('beforebegin',`<section id="cdcMarketHome" class="cdc-market-home">
      <button type="button" class="cdc-market-search" data-v74-market-browser>${iconMarkup('search',18)}<span>Pesquisar produtos, marcas...</span><i>${iconMarkup('receipt',18)}</i></button>
      <div class="cdc-market-section-head"><strong>Produtos em destaque</strong><button type="button" data-v74-market-browser>Ver todos</button></div>
      <div class="cdc-product-grid">${featured}</div>
      <div class="cdc-market-section-head"><strong>Lojas</strong><small>Fontes ativas</small></div>
      <div class="cdc-store-grid">${SUPPORTED_STORES.map(([name,mark,id])=>`<button type="button" class="cdc-store-card" data-v74-market-browser data-v74-store="${id}"><span>${esc(mark)}</span><strong>${esc(name)}</strong></button>`).join('')}</div>
      <div class="cdc-list-heading"><strong>A minha lista</strong><small>${items.length?`${items.length} por comprar`:'Sem itens pendentes'}</small></div>
    </section>`);
  }

  function planningOverviewHtml(){
    const metrics=dashboardMetrics();if(!metrics)return '';
    const entries=categoryEntries().slice(0,4);const total=entries.reduce((sum,entry)=>sum+Number(entry[1]||0),0)||1;
    return `<section id="cdcPlanningOverview" class="cdc-planning-overview">
      <div class="cdc-planning-month"><button type="button" data-v74-month-step="-1" aria-label="Mês anterior">‹</button><strong>${esc(monthLabel())}</strong><button type="button" data-v74-month-step="1" aria-label="Mês seguinte">›</button></div>
      <div class="cdc-budget-ring" style="--pct:${metrics.pct}"><div><strong>${metrics.pct}%</strong><span data-money>${moneyText(metrics.spent)}</span><small>de ${moneyText(metrics.budget||0)}</small></div></div>
      <div class="cdc-planning-categories">${entries.map(([name,value],index)=>{const pct=Math.round(Number(value||0)/total*100);return `<div><span class="cdc-category-dot ${categoryTone(index)}"></span><strong>${esc(name)}</strong><span class="cdc-plan-track"><i style="width:${Math.max(5,pct)}%"></i></span><b data-money>${moneyText(value)}</b></div>`;}).join('')||'<p class="cdc-empty-note">Sem despesas para distribuir.</p>'}</div>
    </section>`;
  }

  function renderPlanningPrototype(){
    const page=byId('page-planning');if(!page)return;
    const tabs=q('.section-tabs',page);
    if(tabs){const buttons=qa('.section-tab',tabs);if(buttons[0])buttons[0].textContent='Orçamento';if(buttons[1])buttons[1].textContent='Metas';}
    const current=byId('cdcPlanningOverview');
    const shell=document.createElement('div');shell.innerHTML=planningOverviewHtml();const next=shell.firstElementChild;
    if(!next)return;
    if(current)current.replaceWith(next);else tabs?.insertAdjacentElement('afterend',next);
  }

  function reportSummaryHtml(){
    const entries=categoryEntries().slice(0,5);const total=entries.reduce((sum,entry)=>sum+Number(entry[1]||0),0);
    let offset=0;
    const stops=entries.map((entry,index)=>{const start=offset;offset+=total?Number(entry[1]||0)/total*100:0;return `var(--cdc-chart-${index}) ${start}% ${offset}%`;}).join(',');
    return `<section id="cdcReportSummary" class="cdc-report-summary"><div class="cdc-report-tabs"><button class="active" type="button">Visão geral</button><button type="button" data-v74-go="reports">Categorias</button><button type="button" data-v74-go="market">Lojas</button></div><div class="cdc-report-donut" style="--segments:${stops||'var(--surface-2) 0 100%'}"><div><strong data-money>${moneyText(total)}</strong><small>este mês</small></div></div><div class="cdc-report-legend">${entries.map(([name,value],index)=>`<div><i class="tone-${index}"></i><span>${esc(name)}</span><strong>${total?Math.round(Number(value||0)/total*100):0}%</strong></div>`).join('')}</div></section>`;
  }

  function renderReportsPrototype(){
    const page=byId('page-reports');if(!page)return;
    const current=byId('cdcReportSummary');
    const shell=document.createElement('div');shell.innerHTML=reportSummaryHtml();const next=shell.firstElementChild;
    if(current)current.replaceWith(next);else page.prepend(next);
  }

  function moreMenuHtml(){
    const name=profileName();
    const items=[
      ['market','As minhas listas','market'],
      ['planning','Planeamento e orçamento','plan'],
      ['reports','Relatórios','bill'],
      ['goals','Metas de poupança','income'],
      ['security','Segurança e privacidade','security'],
      ['sync','Sincronização','sync'],
      ['diagnostics','Diagnóstico e integridade','settings']
    ];
    return `<section id="cdcMoreMenu" class="cdc-more-menu"><div class="cdc-profile-card"><span class="cdc-avatar">${esc(initials())}</span><div><strong>${esc(name)}</strong><small>Conta de Casa · cofre local</small></div></div><div class="cdc-more-list">${items.map(([page,label,iconName])=>`<button type="button" ${page==='sync'?'data-v74-more="sync"':`data-v74-go="${page}"`}><span>${iconMarkup(iconName,19)}</span><strong>${esc(label)}</strong><i>›</i></button>`).join('')}</div></section>`;
  }

  function renderMorePrototype(){
    const page=byId('page-settings');if(!page)return;
    if(!byId('cdcMoreMenu'))page.insertAdjacentHTML('afterbegin',moreMenuHtml());
    const panel=q(':scope > .panel.narrow',page);
    if(panel&&!panel.closest('#cdcPreferencesDetails')){
      const details=document.createElement('details');details.id='cdcPreferencesDetails';details.className='cdc-preferences-details';
      const summary=document.createElement('summary');summary.textContent='Definições da aplicação';
      panel.before(details);details.append(summary,panel);
    }
  }

  function decorateBillForm(){
    const form=byId('billForm');if(!form)return;
    const id=clean(form.elements?.id?.value||'');
    const title=byId('dialogTitle');
    if(title)title.textContent=id?'Editar despesa':'Adicionar despesa';
    if(id||form.dataset.v74Decorated==='1')return;
    form.dataset.v74Decorated='1';
    form.dataset.v74BillMode='manual';
    form.insertAdjacentHTML('afterbegin',`<div class="cdc-bill-mode-tabs full-row" role="tablist" aria-label="Modo de registo"><button class="active" type="button" role="tab" data-v74-bill-mode="manual" aria-selected="true">Manual</button><button type="button" role="tab" data-v74-bill-mode="scan" aria-selected="false">Ler fatura</button><button type="button" role="tab" data-v74-bill-mode="photo" aria-selected="false">QR / Fotografia</button></div>`);
    const submit=q('button[type="submit"]',form);if(submit)submit.textContent='Guardar despesa';
  }

  function setBillMode(mode,trigger=false){
    const form=byId('billForm');if(!form)return;
    const next=['manual','scan','photo'].includes(mode)?mode:'manual';
    form.dataset.v74BillMode=next;
    qa('[data-v74-bill-mode]',form).forEach(button=>{const active=button.dataset.v74BillMode===next;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));});
    if(!trigger||next==='manual')return;
    requestAnimationFrame(()=>{
      if(next==='scan')q('[data-invoice-camera]',form)?.click();
      if(next==='photo')byId('invoiceImageInput')?.click();
    });
  }

  function renderWelcome(){
    const create=byId('vaultCreate'),unlock=byId('vaultUnlock'),card=q('#vaultScreen .vault-card');
    if(!create||!unlock||!card)return;
    if(!unlock.hidden){byId('cdcWelcome')?.remove();create.classList.remove('cdc-vault-create-collapsed');return;}
    if(create.hidden||byId('cdcWelcome'))return;
    create.classList.add('cdc-vault-create-collapsed');
    card.insertAdjacentHTML('afterbegin',`<section id="cdcWelcome" class="cdc-welcome"><div class="cdc-house-mark" aria-hidden="true"><span></span><i>€</i></div><h1>Conta de Casa</h1><p>Mais controlo. Uma vida melhor.</p><ul><li>Organize as suas despesas</li><li>Planeie o seu mês</li><li>Poupe com inteligência</li></ul><button type="button" class="btn primary full" data-v74-welcome-start>Começar</button><button type="button" class="cdc-welcome-link" data-v74-import>Já tem um cofre? <strong>Importar dados</strong></button></section>`);
  }

  function syncThemeChrome(){
    const dark=document.documentElement.dataset.theme==='dark';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#071b20':'#f4f8f8');
  }

  function handleAction(action){
    if(action==='market'){if(typeof showPage==='function')showPage('market');return;}
    if(action==='expense'){if(typeof openBillForm==='function')openBillForm();return;}
    if(action==='invoice'&&typeof openBillForm==='function'){
      openBillForm();
      setTimeout(()=>setBillMode('scan',false),0);
    }
  }

  function stepMonth(delta){
    const key=selectedMonthKey();if(!/^\d{4}-\d{2}$/.test(key))return;
    const [year,month]=key.split('-').map(Number);const next=new Date(year,month-1+Number(delta||0),1);const value=`${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}`;
    const picker=byId('monthPicker');if(!picker)return;picker.value=value;picker.dispatchEvent(new Event('change',{bubbles:true}));
  }

  function handleMoreSync(){
    if(typeof showPage==='function')showPage('security');
    setTimeout(()=>byId('syncPanel')?.scrollIntoView({block:'start',behavior:root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth'}),40);
  }

  function apply(){
    renderWelcome();
    ensureMobileNav();
    syncMobileNavState();
    syncThemeChrome();
    if(!appReady())return;
    renderDashboardPrototype();
    renderExpenseFeed();
    renderMarketHome();
    renderPlanningPrototype();
    renderReportsPrototype();
    renderMorePrototype();
    decorateBillForm();
  }

  function schedule(){
    if(scheduled)return;scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;apply();});
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
      if(event.target.closest?.('#mobileNav [data-mobile]'))setTimeout(syncMobileNavState,0);
    },false);

    document.addEventListener('change',event=>{
      if(event.target?.id==='cdcMobileMonth'){
        const picker=byId('monthPicker');if(picker){picker.value=event.target.value;picker.dispatchEvent(new Event('change',{bubbles:true}));}
      }
    });
    document.addEventListener('input',event=>{if(event.target?.id==='billSearch')renderExpenseFeed();});
    window.addEventListener('hashchange',schedule,{passive:true});

    observer=new MutationObserver(schedule);
    observer.observe(document.documentElement,{attributes:true,attributeFilter:['class','data-theme']});
    const app=byId('app');if(app)observer.observe(app,{childList:true,subtree:true});
    const vault=byId('vaultScreen');if(vault)observer.observe(vault,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
    schedule();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  root.CDCV74=Object.freeze({VERSION:'v74',MOBILE_NAV:MOBILE_NAV.map(item=>item[0]),dashboardMetrics,categoryEntries,movementRows});
})(typeof window!=='undefined'?window:globalThis);

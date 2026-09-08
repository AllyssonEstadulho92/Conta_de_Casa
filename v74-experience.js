'use strict';

/* Conta de Casa v74 — camada de experiência do protótipo.
 * Não altera o modelo financeiro, a cifragem, o schema IndexedDB ou a sincronização.
 * Acrescenta apenas composição de interface reutilizando os dados e handlers existentes.
 */
(function installV74Experience(root){
  const MOBILE_NAV=[
    ['dashboard','Início','home'],
    ['bills','Despesas','bill'],
    ['market','Mercado','market'],
    ['planning','Planeamento','plan'],
    ['settings','Mais','more']
  ];
  let scheduled=false;
  let observer=null;

  function byId(id){return document.getElementById(id);}
  function escText(value){return String(value??'');}
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
      bill:'<path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4"/><path d="M9 11h6M9 15h6"/>',
      receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
      market:'<path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6H18a2 2 0 0 0 2-1.6L21 8H7"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
      home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h14v-9.5"/>',
      plan:'<path d="M4 19V9m6 10V5m6 14v-7m4 7H2"/>',
      more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
    };
    return `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${fallback[name]||fallback.more}</svg>`;
  }

  function appReady(){return Boolean(document.documentElement.classList.contains('app-active')&&root.appState!==null&&typeof appState!=='undefined'&&appState);}

  function ensureMobileNav(){
    const nav=byId('mobileNav');
    if(!nav)return;
    const current=[...nav.querySelectorAll('[data-mobile]')].map(node=>node.dataset.mobile).join(',');
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
    const parent=page==='calendar'?'bills':page==='goals'?'planning':page==='diagnostics'?'settings':page;
    nav.querySelectorAll('[data-mobile]').forEach(button=>{
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

  function heroHtml(metrics){
    const budgetLine=metrics.budget>0
      ? `<div class="cdc-budget-head"><span>Orçamento mensal</span><strong>${metrics.pct}% utilizado</strong></div><div class="cdc-budget-track" aria-label="${metrics.pct}% do orçamento utilizado"><span></span></div><small>Disponível: <strong data-money>${moneyText(metrics.remaining)}</strong> de <span data-money>${moneyText(metrics.budget)}</span></small>`
      : `<div class="cdc-budget-head"><span>Orçamento mensal</span><strong>Por definir</strong></div><small>Defina um orçamento em Planeamento para acompanhar o limite do mês.</small>`;
    return `<section class="cdc-month-hero" aria-label="Resumo financeiro do mês">
      <div class="cdc-month-hero-main"><span>Resumo do mês</span><strong data-money>${moneyText(metrics.spent)}</strong><small>Despesas efetivas registadas em faturas pagas e compras.</small></div>
      <div class="cdc-budget-box">${budgetLine}</div>
    </section>`;
  }

  function quickActionsHtml(){
    return `<section class="cdc-quick-actions" aria-label="Ações rápidas">
      <button class="cdc-quick-action" type="button" data-v74-action="expense"><span class="cdc-quick-action-icon" aria-hidden="true">${iconMarkup('bill',21)}</span><span><strong>Adicionar despesa</strong><small>Registar uma fatura ou conta</small></span></button>
      <button class="cdc-quick-action" type="button" data-v74-action="invoice"><span class="cdc-quick-action-icon" aria-hidden="true">${iconMarkup('receipt',21)}</span><span><strong>Ler fatura</strong><small>QR ou imagem no dispositivo</small></span></button>
      <button class="cdc-quick-action" type="button" data-v74-action="market"><span class="cdc-quick-action-icon" aria-hidden="true">${iconMarkup('market',21)}</span><span><strong>Mercado</strong><small>Pesquisar e planear compras</small></span></button>
    </section>`;
  }

  function renderDashboardPrototype(){
    if(!appReady())return;
    const page=byId('page-dashboard');
    const kpis=byId('kpiGrid');
    if(!page||!kpis)return;
    const metrics=dashboardMetrics();
    if(!metrics)return;
    let hero=byId('cdcMonthHero');
    if(!hero){
      const wrapper=document.createElement('div');
      wrapper.innerHTML=heroHtml(metrics);
      hero=wrapper.firstElementChild;
      hero.id='cdcMonthHero';
      kpis.before(hero);
    }else{
      const wrapper=document.createElement('div');
      wrapper.innerHTML=heroHtml(metrics);
      const replacement=wrapper.firstElementChild;
      replacement.id='cdcMonthHero';
      hero.replaceWith(replacement);
      hero=replacement;
    }
    hero.style.setProperty('--cdc-budget-pct',`${metrics.pct}%`);

    let actions=byId('cdcQuickActions');
    if(!actions){
      const wrapper=document.createElement('div');
      wrapper.innerHTML=quickActionsHtml();
      actions=wrapper.firstElementChild;
      actions.id='cdcQuickActions';
      hero.after(actions);
    }
  }

  function syncThemeChrome(){
    const dark=document.documentElement.dataset.theme==='dark';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#071b20':'#f4f8f8');
  }

  function focusInvoiceCapture(){
    let attempts=0;
    const find=()=>{
      attempts+=1;
      const section=document.querySelector('[data-invoice-capture]');
      const camera=section?.querySelector('[data-invoice-camera]');
      if(section&&camera){
        section.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
        camera.focus({preventScroll:true});
        return;
      }
      if(attempts<8)setTimeout(find,40);
    };
    find();
  }

  function handleAction(action){
    if(action==='market'){
      if(typeof showPage==='function')showPage('market');
      return;
    }
    if(action==='expense'){
      if(typeof openBillForm==='function')openBillForm();
      return;
    }
    if(action==='invoice'){
      if(typeof openBillForm==='function'){
        openBillForm();
        focusInvoiceCapture();
      }
    }
  }

  function apply(){
    ensureMobileNav();
    syncMobileNavState();
    syncThemeChrome();
    renderDashboardPrototype();
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;apply();});
  }

  function start(){
    document.documentElement.classList.add('cdc-v74');
    document.addEventListener('click',event=>{
      const action=event.target.closest?.('[data-v74-action]');
      if(action){event.preventDefault();handleAction(action.dataset.v74Action);return;}
      if(event.target.closest?.('#mobileNav [data-mobile]'))setTimeout(syncMobileNavState,0);
    });
    window.addEventListener('hashchange',schedule,{passive:true});
    observer=new MutationObserver(schedule);
    observer.observe(document.documentElement,{attributes:true,attributeFilter:['class','data-theme']});
    const kpis=byId('kpiGrid');if(kpis)observer.observe(kpis,{childList:true,subtree:false});
    const title=byId('pageTitle');if(title)observer.observe(title,{childList:true,subtree:true,characterData:true});
    const nav=byId('mobileNav');if(nav)observer.observe(nav,{childList:true,subtree:false});
    schedule();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  root.CDCV74=Object.freeze({VERSION:'v74',MOBILE_NAV:MOBILE_NAV.map(item=>item[0]),dashboardMetrics});
})(typeof window!=='undefined'?window:globalThis);

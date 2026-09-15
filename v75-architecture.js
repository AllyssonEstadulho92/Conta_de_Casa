'use strict';

/* Conta de Casa v76 — arquitetura final de apresentação sobre o runtime funcional.
 * Esta camada é a autoridade para composição/navegação progressiva ainda não migrada
 * para o núcleo. Não altera cálculos, valores financeiros, IndexedDB, cifragem,
 * pagamentos, scanner, QR ou sincronização.
 *
 * 76-architecture-consolidation1:
 * - deixa de depender de CDCV74;
 * - passa a criar os seus próprios shells de Planeamento, Mais e Preferências;
 * - torna a navegação desktop/drawer/mobile determinística numa única camada;
 * - preserva os handlers funcionais existentes através de data-page/data-mobile.
 *
 * 76-retire-v74-nav-marker1:
 * - elimina data-v74-nav, que servia apenas um runtime v74 já removido do repositório.
 *
 * 76-expense-mode-stability1:
 * - Manual / Ler fatura / QR Code passam a ser modos determinísticos e acessíveis;
 * - mudar de modo deixa de abrir automaticamente ficheiro ou câmara;
 * - ações de captura são explícitas e ficam a cargo de invoice-capture.js.
 *
 * 76-mobile-label-fit1:
 * - a rota continua a chamar-se Planeamento; apenas o label do dock passa a “Plano”
 *   para evitar truncamento em iPhones estreitos sem reduzir a legibilidade.
 *
 * 76-prototype-planning1:
 * - orçamento inexistente deixa de ser apresentado como 0%;
 * - Mais separa Conta e dados, Segurança e Aplicação em responsabilidades claras.
 *
 * 76-drawer-hierarchy1:
 * - o menu completo expõe apenas destinos de primeiro nível;
 * - Calendário permanece dentro de Despesas, Metas dentro de Planeamento e
 *   Diagnóstico dentro de Definições, evitando duplicação de rotas secundárias;
 * - Segurança mantém seleção própria no menu completo, embora continue agrupada
 *   em “Mais” no dock móvel compacto.
 */
(function installV75Prototype(root){
  const MOBILE_QUERY='(max-width: 820px)';
  const REVISION='76-architecture-consolidation1';
  const LABELS=Object.freeze({
    dashboard:['Início','Visão geral'],
    bills:['Despesas','Movimentos'],
    calendar:['Calendário','Despesas'],
    market:['Mercado','Compras'],
    planning:['Planeamento','Orçamento'],
    goals:['Metas','Poupança'],
    reports:['Relatórios','Análise'],
    security:['Segurança e sincronização','Conta e dados'],
    diagnostics:['Diagnóstico e integridade','Sistema'],
    settings:['Definições','Aplicação']
  });
  const DRAWER_GROUPS=Object.freeze([
    {label:'Principal',items:[['dashboard','Início','home'],['bills','Despesas','bill'],['planning','Planeamento','plan'],['market','Mercado','market']]},
    {label:'Análise',items:[['reports','Relatórios','report']]},
    {label:'Sistema',items:[['security','Segurança e sincronização','shield'],['settings','Definições','settings']]}
  ]);
  const MOBILE_NAV=Object.freeze([
    ['dashboard','Início','home'],
    ['bills','Despesas','bill'],
    ['market','Mercado','market'],
    ['planning','Plano','plan'],
    ['settings','Mais','more']
  ]);
  const MORE_GROUPS=Object.freeze([
    {label:'Organização',items:[['reports','Relatórios','report','Análise de despesas e evolução'],['goals','Metas de poupança','goal','Objetivos e progresso']]},
    {label:'Conta e dados',items:[['sync','Sincronização','sync','Estado entre dispositivos']]},
    {label:'Segurança',items:[['security','Segurança e privacidade','shield','Cofre, backup e proteção'],['diagnostics','Diagnóstico e integridade','settings','Verificações técnicas']]},
    {label:'Aplicação',items:[['theme','Aparência','theme','Claro, escuro ou sistema'],['preferences','Definições da aplicação','settings','Nome, moeda e preferências']]}
  ]);

  let scheduled=false;
  let observer=null;
  const byId=id=>document.getElementById(id);
  const q=(selector,node=document)=>node.querySelector(selector);
  const qa=(selector,node=document)=>[...node.querySelectorAll(selector)];
  const clean=value=>String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim();
  const esc=value=>clean(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const attr=esc;
  const isMobile=()=>root.matchMedia?.(MOBILE_QUERY)?.matches??false;

  function appReady(){
    try{return document.documentElement.classList.contains('app-active')&&typeof appState!=='undefined'&&Boolean(appState);}
    catch(_error){return false;}
  }

  function currentPageId(){
    try{return typeof currentPage==='function'?currentPage():(location.hash.replace('#','')||'dashboard');}
    catch(_error){return 'dashboard';}
  }

  function navParent(page,compact=false){
    if(page==='calendar')return 'bills';
    if(page==='goals')return 'planning';
    if(page==='diagnostics')return 'settings';
    if(compact&&page==='security')return 'settings';
    return page;
  }

  function selectedMonthKey(){
    try{return String(selectedMonth||'');}catch(_error){return '';}
  }

  function monthLabel(){
    const key=selectedMonthKey();
    if(!/^\d{4}-\d{2}$/.test(key))return 'Mês atual';
    const [year,month]=key.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-PT',{month:'long',year:'numeric'}).format(new Date(year,month-1,1)).replace(/^./,char=>char.toUpperCase());
  }

  function profileName(){
    try{return clean(appState?.settings?.profileName||'Utilizador').split(/\s+/)[0]||'Utilizador';}
    catch(_error){return 'Utilizador';}
  }

  function initials(){return profileName().slice(0,2).toLocaleUpperCase('pt-PT');}

  function moneyText(cents){
    try{return typeof money==='function'?money(Number(cents)||0):`${((Number(cents)||0)/100).toFixed(2).replace('.',',')} €`;}
    catch(_error){return '0,00 €';}
  }

  function iconMarkup(name,size=20){
    try{
      if(root.CDCIcons?.markup)return root.CDCIcons.markup(name,size);
      if(typeof icon==='function')return icon(name,size);
    }catch(_error){}
    const paths={
      home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h14v-9.5"/><path d="M9 20v-6h6v6"/>',
      bill:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
      market:'<path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6H18a2 2 0 0 0 2-1.6L21 8H7"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
      plan:'<path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/>',
      report:'<path d="M4 20V10m5 10V4m6 16v-7m5 7V7"/>',
      goal:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
      shield:'<path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-5"/>',
      settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M4.9 4.9 7 7m10 10 2.1 2.1M2 12h3m14 0h3M4.9 19.1 7 17m10-10 2.1-2.1"/>',
      sync:'<path d="M20 7h-5V2"/><path d="M20 7a8 8 0 0 0-14-2"/><path d="M4 17h5v5"/><path d="M4 17a8 8 0 0 0 14 2"/>',
      theme:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
      more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
    };
    return `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.settings}</svg>`;
  }

  function dashboardMetrics(){
    try{
      if(typeof dashboardNumbers!=='function')return null;
      const numbers=dashboardNumbers();
      const spent=typeof sumCents==='function'
        ? sumCents([numbers.paymentTotal||0,numbers.marketSpent||0])
        : Number(numbers.paymentTotal||0)+Number(numbers.marketSpent||0);
      const budget=Number(numbers.profile?.budgetCents||0);
      const pct=budget>0?Math.max(0,Math.min(100,Math.round(spent/budget*100))):0;
      const remaining=budget>0?Math.max(0,budget-spent):0;
      return {spent,budget,pct,remaining,projected:Number(numbers.projected||0),current:Number(numbers.current||0)};
    }catch(_error){return null;}
  }

  function categoryEntries(){
    try{return typeof categoryTotals==='function'?categoryTotals().filter(entry=>Number(entry?.[1])>0):[];}
    catch(_error){return [];}
  }

  function syncPageChrome(){
    const page=currentPageId();
    document.documentElement.dataset.v75Page=page;
    const meta=LABELS[page]||LABELS.dashboard;
    const title=byId('pageTitle');
    const context=byId('pageContext');
    if(title&&title.textContent!==meta[0])title.textContent=meta[0];
    if(context&&context.textContent!==meta[1])context.textContent=meta[1];
    const nextTitle=`${meta[0]} · Conta de Casa`;
    if(document.title!==nextTitle)document.title=nextTitle;
    q('.topbar')?.classList.toggle('v75-dashboard-topbar',page==='dashboard'&&isMobile());
  }

  function navGroupsHtml(){
    return DRAWER_GROUPS.map(group=>`<div class="nav-group v75-nav-group"><p class="nav-group-label">${esc(group.label)}</p><div class="nav-group-items">${group.items.map(([page,label,iconName])=>`<button class="nav-btn" type="button" data-page="${attr(page)}" aria-label="${attr(label)}" title="${attr(label)}">${iconMarkup(iconName,20)}<span class="nav-label">${esc(label)}</span></button>`).join('')}</div></div>`).join('');
  }

  function mobileNavHtml(){
    return MOBILE_NAV.map(([page,label,iconName])=>`<button class="nav-btn" type="button" data-mobile="${attr(page)}" data-v76-primary="1" aria-label="${attr(label)}">${iconMarkup(iconName,22)}<span>${esc(label)}</span></button>`).join('');
  }

  function syncNavigationArchitecture(){
    const groups=navGroupsHtml();
    const groupSignature=DRAWER_GROUPS.map(group=>group.items.map(item=>item[0]).join(',')).join('|');
    for(const id of ['desktopNav','drawerNav']){
      const nav=byId(id);
      if(!nav)continue;
      if(nav.dataset.v76Architecture!==groupSignature){
        nav.innerHTML=groups;
        nav.dataset.v76Architecture=groupSignature;
      }
    }

    const mobile=byId('mobileNav');
    const mobileSignature=MOBILE_NAV.map(item=>item[0]).join(',');
    if(mobile){
      const current=qa(':scope > [data-mobile]',mobile).map(button=>button.dataset.mobile).join(',');
      if(current!==mobileSignature||mobile.dataset.v76Architecture!==mobileSignature){
        mobile.innerHTML=mobileNavHtml();
        mobile.dataset.v76Architecture=mobileSignature;
      }
    }

    const page=currentPageId();
    const fullActive=navParent(page,false);
    qa('.nav-btn[data-page]').forEach(button=>{
      const on=button.dataset.page===fullActive;
      button.classList.toggle('active',on);
      if(on)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
    });
    const mobileActive=navParent(page,true);
    qa('#mobileNav [data-mobile]').forEach(button=>{
      const on=button.dataset.mobile===mobileActive;
      button.classList.toggle('active',on);
      if(on)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
    });
  }

  function moreItemHtml(action,label,iconName,description){
    const attrs=action==='sync'?'data-v75-sync':action==='theme'?'data-v75-theme':action==='preferences'?'data-v75-preferences':`data-v75-go="${attr(action)}"`;
    return `<button type="button" class="v75-more-row" ${attrs}><span class="v75-more-icon">${iconMarkup(iconName,19)}</span><span><strong>${esc(label)}</strong><small>${esc(description||'')}</small></span><i aria-hidden="true">›</i></button>`;
  }

  function ensureMoreShell(){
    const page=byId('page-settings');
    if(!page)return null;
    let menu=byId('cdcMoreMenu');
    if(!menu){
      menu=document.createElement('section');
      menu.id='cdcMoreMenu';
      menu.className='cdc-more-menu';
      page.insertAdjacentElement('afterbegin',menu);
    }
    const panel=q(':scope > .panel.narrow',page);
    if(panel&&!panel.closest('#cdcPreferencesDetails')){
      const details=document.createElement('details');
      details.id='cdcPreferencesDetails';
      details.className='cdc-preferences-details';
      const summary=document.createElement('summary');
      summary.textContent='Definições da aplicação';
      panel.before(details);
      details.append(summary,panel);
    }
    return menu;
  }

  function moreArchitectureHtml(){
    return `<button type="button" class="cdc-profile-card v75-profile-card" data-v75-preferences><span class="cdc-avatar" aria-hidden="true">${esc(initials())}</span><div><strong>${esc(profileName())}</strong><small>Conta de Casa · cofre privado</small></div><i aria-hidden="true">›</i></button>${MORE_GROUPS.map(group=>`<section class="v75-more-group" aria-label="${attr(group.label)}"><h2>${esc(group.label)}</h2><div>${group.items.map(([action,label,iconName,description])=>moreItemHtml(action,label,iconName,description)).join('')}</div></section>`).join('')}`;
  }

  function renderMoreArchitecture(){
    const rootNode=ensureMoreShell();
    if(!rootNode||!appReady())return;
    const signature=`${profileName()}|${MORE_GROUPS.length}`;
    if(rootNode.dataset.v75Architecture===signature)return;
    rootNode.innerHTML=moreArchitectureHtml();
    rootNode.dataset.v75Architecture=signature;
  }

  function ensurePlanningShell(){
    const page=byId('page-planning');
    const tabs=q('.section-tabs',page);
    if(!page||!tabs)return null;
    let rootNode=byId('cdcPlanningOverview');
    if(!rootNode){
      rootNode=document.createElement('section');
      rootNode.id='cdcPlanningOverview';
      rootNode.className='cdc-planning-overview v75-planning-overview';
      tabs.insertAdjacentElement('afterend',rootNode);
    }
    return rootNode;
  }

  function planningMonthHtml(){
    return `<div class="cdc-planning-month"><button type="button" data-v75-month-step="-1" aria-label="Mês anterior">‹</button><strong>${esc(monthLabel())}</strong><button type="button" data-v75-month-step="1" aria-label="Mês seguinte">›</button></div>`;
  }

  function planningArchitectureHtml(metrics,entries){
    if(!metrics)return '';
    const total=entries.reduce((sum,entry)=>sum+Number(entry[1]||0),0)||1;
    const hasBudget=metrics.budget>0;
    const budgetLabel=hasBudget?moneyText(metrics.budget):'Por definir';
    const remainingLabel=hasBudget?moneyText(metrics.remaining):'—';
    const ringClass=hasBudget?'':' is-unset';
    const ringValue=hasBudget?`${metrics.pct}%`:'—';
    const ringDetail=hasBudget?`<span data-money>${moneyText(metrics.spent)}</span><small>de ${budgetLabel}</small>`:'<span>Por definir</span><small>Defina um orçamento mensal</small>';
    const ringLabel=hasBudget?`Orçamento usado: ${metrics.pct}%`:'Orçamento mensal por definir';
    return `${planningMonthHtml()}<section class="v75-budget-summary" aria-label="Resumo do orçamento"><div class="cdc-budget-ring${ringClass}" style="--pct:${hasBudget?metrics.pct:0}" aria-label="${attr(ringLabel)}"><div><strong>${ringValue}</strong>${ringDetail}</div></div><div class="v75-budget-metrics"><div><small>Gasto este mês</small><strong data-money>${moneyText(metrics.spent)}</strong></div><div><small>Orçamento</small><strong${hasBudget?' data-money':''}>${budgetLabel}</strong></div><div><small>Disponível</small><strong${hasBudget?' data-money':''}>${remainingLabel}</strong></div></div></section><div class="v75-section-heading"><strong>Despesas por categoria</strong><small>${entries.length?'Distribuição do mês':'Sem movimentos neste mês'}</small></div><div class="cdc-planning-categories">${entries.map(([name,value],index)=>{const pct=Math.round(Number(value||0)/total*100);return `<div><span class="cdc-category-dot ${['food','home','transport','health','other'][index%5]}" aria-hidden="true"></span><strong>${esc(name)}</strong><span class="cdc-plan-track"><i style="width:${Math.max(5,pct)}%"></i></span><b data-money>${moneyText(value)}</b></div>`;}).join('')||'<p class="cdc-empty-note">Ainda não existem despesas para distribuir.</p>'}</div>`;
  }

  function renderPlanningArchitecture(){
    const rootNode=ensurePlanningShell();
    if(!rootNode||!appReady())return;
    const metrics=dashboardMetrics();
    const entries=categoryEntries().slice(0,5);
    const key=`${selectedMonthKey()}|${metrics?.spent||0}|${metrics?.budget||0}|${entries.map(entry=>`${entry[0]}:${entry[1]}`).join(',')}`;
    if(rootNode.dataset.v75Key===key)return;
    const html=planningArchitectureHtml(metrics,entries);
    if(html){
      rootNode.innerHTML=html;
      rootNode.dataset.v75Key=key;
      rootNode.classList.add('v75-planning-overview');
    }
  }

  function ensureBillTabs(form){
    if(!form||form.querySelector('.v75-bill-tabs'))return;
    const isNew=!String(form.elements.id?.value||'');
    if(!isNew)return;
    form.insertAdjacentHTML('afterbegin',`<div class="v75-bill-tabs full-row" role="tablist" aria-label="Modo de registo"><button type="button" class="active" role="tab" aria-selected="true" tabindex="0" data-v75-bill-mode="manual">Manual</button><button type="button" role="tab" aria-selected="false" tabindex="-1" data-v75-bill-mode="image">Ler fatura</button><button type="button" role="tab" aria-selected="false" tabindex="-1" data-v75-bill-mode="qr">QR Code</button></div>`);
  }

  function syncBillModeButtons(form,mode){
    const effective=['manual','image','qr'].includes(mode)?mode:'manual';
    qa('.v75-bill-tabs [data-v75-bill-mode]',form).forEach(button=>{
      const on=button.dataset.v75BillMode===effective;
      button.classList.toggle('active',on);
      button.setAttribute('aria-selected',String(on));
      button.tabIndex=on?0:-1;
    });
  }

  function syncBillDialog(){
    const dialog=byId('formDialog');
    if(!dialog)return;
    const form=byId('billForm');
    if(!dialog.open||!form){delete dialog.dataset.v75Kind;delete dialog.dataset.v75BillMode;return;}
    dialog.dataset.v75Kind='expense';
    ensureBillTabs(form);
    const isNew=!String(form.elements.id?.value||'');
    const title=byId('dialogTitle');
    if(title)title.textContent=isNew?'Adicionar despesa':'Editar despesa';
    if(!['manual','image','qr'].includes(dialog.dataset.v75BillMode||''))dialog.dataset.v75BillMode='manual';
    syncBillModeButtons(form,dialog.dataset.v75BillMode);
  }

  function syncScannerState(){
    document.documentElement.classList.toggle('v75-invoice-scanning',Boolean(q('[data-invoice-scanner-overlay]')));
  }

  function syncHeroHtml(){
    const badge=clean(byId('syncStatusBadge')?.textContent||'Não configurado');
    const status=clean(byId('syncStatusText')?.textContent||'Sincronização não configurada.');
    return `<section class="v75-sync-hero" aria-label="Estado da sincronização"><div class="v75-sync-visual" aria-hidden="true"><span class="device phone"></span><span class="device desktop"></span><span class="device phone right"></span><i>✓</i></div><strong>${esc(badge==='Ligado'?'Tudo sincronizado':badge)}</strong><p>${esc(status)}</p><div class="v75-sync-checks"><span>✓ Cofre cifrado</span><span>✓ Dados financeiros protegidos</span><span>✓ Configuração por dispositivo</span></div></section>`;
  }

  function enhanceSyncPanel(){
    const panel=byId('syncPanel');
    if(!panel||!appReady())return;
    const status=`${clean(byId('syncStatusBadge')?.textContent)}|${clean(byId('syncStatusText')?.textContent)}`;
    const current=q('.v75-sync-hero',panel);
    if(current?.dataset.key===status)return;
    current?.remove();
    panel.insertAdjacentHTML('afterbegin',syncHeroHtml());
    const hero=q('.v75-sync-hero',panel);if(hero)hero.dataset.key=status;
  }

  function handleSync(){
    if(typeof showPage==='function')showPage('security');
    setTimeout(()=>{enhanceSyncPanel();byId('syncPanel')?.scrollIntoView({block:'start',behavior:root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth'});},50);
  }

  function handlePreferences(){
    if(typeof showPage==='function'&&currentPageId()!=='settings')showPage('settings');
    setTimeout(()=>{
      const details=byId('cdcPreferencesDetails');
      if(!details)return;
      details.open=true;
      details.scrollIntoView({block:'start',behavior:root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth'});
    },30);
  }

  function stepMonth(delta){
    const key=selectedMonthKey();
    if(!/^\d{4}-\d{2}$/.test(key))return;
    const [year,month]=key.split('-').map(Number);
    const next=new Date(year,month-1+Number(delta||0),1);
    const value=`${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}`;
    const picker=byId('monthPicker');
    if(!picker)return;
    picker.value=value;
    picker.dispatchEvent(new Event('change',{bubbles:true}));
  }

  function setBillMode(mode){
    const dialog=byId('formDialog');
    const form=byId('billForm');
    if(!dialog||!form||!['manual','image','qr'].includes(mode))return;
    dialog.dataset.v75BillMode=mode;
    syncBillModeButtons(form,mode);
    dialog.dispatchEvent(new CustomEvent('cdc:bill-mode-change',{bubbles:true,detail:{mode}}));
  }

  function handleBillModeKeydown(event){
    const current=event.target.closest?.('.v75-bill-tabs [data-v75-bill-mode]');
    if(!current)return;
    const buttons=qa('.v75-bill-tabs [data-v75-bill-mode]',current.closest('.v75-bill-tabs'));
    const index=buttons.indexOf(current);
    let next=index;
    if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%buttons.length;
    else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index-1+buttons.length)%buttons.length;
    else if(event.key==='Home')next=0;
    else if(event.key==='End')next=buttons.length-1;
    else return;
    event.preventDefault();
    const button=buttons[next];
    setBillMode(button.dataset.v75BillMode);
    button.focus({preventScroll:true});
    schedule();
  }

  function apply(){
    syncPageChrome();
    syncNavigationArchitecture();
    syncScannerState();
    if(!appReady())return;
    renderMoreArchitecture();
    renderPlanningArchitecture();
    syncBillDialog();
    enhanceSyncPanel();
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;apply();});
  }

  function start(){
    document.documentElement.classList.add('cdc-v75');
    document.documentElement.dataset.v76Architecture=REVISION;
    document.addEventListener('click',event=>{
      const mode=event.target.closest?.('[data-v75-bill-mode]');
      if(mode){event.preventDefault();setBillMode(mode.dataset.v75BillMode);schedule();return;}
      const monthStep=event.target.closest?.('[data-v75-month-step]');
      if(monthStep){event.preventDefault();stepMonth(monthStep.dataset.v75MonthStep);schedule();return;}
      const go=event.target.closest?.('[data-v75-go]');
      if(go){event.preventDefault();if(typeof showPage==='function')showPage(go.dataset.v75Go);schedule();return;}
      if(event.target.closest?.('[data-v75-sync]')){event.preventDefault();handleSync();schedule();return;}
      if(event.target.closest?.('[data-v75-theme]')){event.preventDefault();byId('themeToggle')?.click();setTimeout(schedule,0);return;}
      if(event.target.closest?.('[data-v75-preferences]')){event.preventDefault();handlePreferences();schedule();return;}
      setTimeout(schedule,0);
    },true);
    document.addEventListener('keydown',handleBillModeKeydown,true);
    window.addEventListener('hashchange',schedule,{passive:true});
    root.matchMedia?.(MOBILE_QUERY)?.addEventListener?.('change',schedule);
    observer=new MutationObserver(schedule);
    const title=byId('pageTitle');if(title)observer.observe(title,{childList:true,characterData:true,subtree:true});
    const dialog=byId('formDialog');if(dialog)observer.observe(dialog,{childList:true,subtree:true,attributes:true,attributeFilter:['open','hidden']});
    const sync=byId('syncPanel');if(sync)observer.observe(sync,{childList:true,subtree:true,characterData:true});
    schedule();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  root.CDCV75=Object.freeze({VERSION:'v75',REVISION,LABELS,DRAWER_GROUPS,MOBILE_NAV:MobileNavSnapshot(),MORE_GROUPS});

  function MobileNavSnapshot(){return MOBILE_NAV.map(item=>item[0]);}
})(typeof window!=='undefined'?window:globalThis);
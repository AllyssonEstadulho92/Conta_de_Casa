'use strict';

/* Conta de Casa v75 — arquitetura de informação e clareza visual.
 * Camada de apresentação: reorganiza navegação e hierarquia sem alterar
 * cálculos, estado financeiro, IndexedDB, cofre, pagamentos ou sincronização.
 */
(function installV75Architecture(root){
  const MOBILE_QUERY='(max-width: 820px)';
  const LABELS=Object.freeze({
    dashboard:['Início','Visão geral'],
    bills:['Despesas','Movimentos'],
    calendar:['Calendário','Despesas'],
    market:['Mercado','Compras'],
    planning:['Planeamento','Orçamento'],
    goals:['Metas','Poupança'],
    reports:['Relatórios','Análise'],
    security:['Segurança e privacidade','Conta'],
    diagnostics:['Diagnóstico e integridade','Sistema'],
    settings:['Mais','Conta e aplicação']
  });
  const DRAWER_GROUPS=Object.freeze([
    {label:'Principal',items:[['dashboard','Início','home'],['bills','Despesas','bill'],['market','Mercado','market'],['planning','Planeamento','plan']]},
    {label:'Análise',items:[['reports','Relatórios','report']]},
    {label:'Conta e sistema',items:[['security','Segurança e privacidade','shield'],['settings','Mais','settings']]}
  ]);
  const MORE_GROUPS=Object.freeze([
    {label:'Análise',items:[['reports','Relatórios','report'],['goals','Metas de poupança','goal']]},
    {label:'Privacidade e dados',items:[['security','Segurança e privacidade','shield'],['sync','Sincronização','sync'],['diagnostics','Diagnóstico e integridade','settings']]},
    {label:'Aplicação',items:[['theme','Aparência','theme'],['preferences','Definições da aplicação','settings']]}
  ]);

  let scheduled=false;
  let observer=null;
  const byId=id=>document.getElementById(id);
  const q=(selector,node=document)=>node.querySelector(selector);
  const qa=(selector,node=document)=>[...node.querySelectorAll(selector)];
  const clean=value=>String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim();
  const esc=value=>clean(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const attr=esc;

  function iconMarkup(name,size=20){
    try{
      if(root.CDCIcons?.markup)return root.CDCIcons.markup(name,size);
      if(typeof icon==='function')return icon(name,size);
    }catch(_error){}
    const paths={
      home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h14v-9.5"/><path d="M9 20v-6h6v6"/>',
      bill:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
      market:'<path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6H18a2 2 0 0 0 2-1.6L21 8H7"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
      plan:'<path d="M4 19V9m6 10V5m6 14v-7m4 7H2"/>',
      report:'<path d="M4 20V10m5 10V4m6 16v-7m5 7V7"/>',
      goal:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
      shield:'<path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-5"/>',
      settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M4.9 4.9 7 7m10 10 2.1 2.1M2 12h3m14 0h3M4.9 19.1 7 17m10-10 2.1-2.1"/>',
      sync:'<path d="M20 7h-5V2"/><path d="M20 7a8 8 0 0 0-14-2"/><path d="M4 17h5v5"/><path d="M4 17a8 8 0 0 0 14 2"/>',
      theme:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
    };
    return `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.settings}</svg>`;
  }

  function appReady(){
    try{return document.documentElement.classList.contains('app-active')&&typeof appState!=='undefined'&&Boolean(appState);}
    catch(_error){return false;}
  }

  function currentPageId(){
    try{return typeof currentPage==='function'?currentPage():(location.hash.replace('#','')||'dashboard');}
    catch(_error){return 'dashboard';}
  }

  function navParent(page){
    if(page==='calendar')return 'bills';
    if(page==='goals')return 'planning';
    if(page==='diagnostics')return 'settings';
    return page;
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

  function syncPageChrome(){
    const page=currentPageId();
    const meta=LABELS[page]||LABELS.dashboard;
    const title=byId('pageTitle');
    const context=byId('pageContext');
    if(title&&title.textContent!==meta[0])title.textContent=meta[0];
    if(context&&context.textContent!==meta[1])context.textContent=meta[1];
    const nextTitle=`${meta[0]} · Conta de Casa`;
    if(document.title!==nextTitle)document.title=nextTitle;
  }

  function navGroupsHtml(){
    return DRAWER_GROUPS.map(group=>`<div class="nav-group v75-nav-group"><p class="nav-group-label">${esc(group.label)}</p><div class="nav-group-items">${group.items.map(([page,label,iconName])=>`<button class="nav-btn" type="button" data-page="${attr(page)}" aria-label="${attr(label)}" title="${attr(label)}">${iconMarkup(iconName,20)}<span class="nav-label">${esc(label)}</span></button>`).join('')}</div></div>`).join('');
  }

  function syncNavigationArchitecture(){
    const html=navGroupsHtml();
    for(const id of ['desktopNav','drawerNav']){
      const nav=byId(id);
      if(!nav)continue;
      if(nav.dataset.v75Architecture!=='1'){
        nav.innerHTML=html;
        nav.dataset.v75Architecture='1';
      }
    }
    const active=navParent(currentPageId());
    qa('.nav-btn[data-page]').forEach(button=>{
      const on=button.dataset.page===active;
      button.classList.toggle('active',on);
      if(on)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
    });

    const mobile=byId('mobileNav');
    if(mobile){
      const labels={dashboard:'Início',bills:'Despesas',market:'Mercado',planning:'Planeamento',settings:'Mais'};
      qa('[data-mobile]',mobile).forEach(button=>{
        const label=labels[button.dataset.mobile];
        if(label){
          const span=q('span',button);if(span&&span.textContent!==label)span.textContent=label;
          button.setAttribute('aria-label',label);
        }
      });
    }
  }

  function moreItemHtml(action,label,iconName){
    const attrs=action==='sync'?'data-v75-sync':action==='theme'?'data-v75-theme':action==='preferences'?'data-v75-preferences':`data-v75-go="${attr(action)}"`;
    return `<button type="button" class="v75-more-row" ${attrs}><span class="v75-more-icon">${iconMarkup(iconName,19)}</span><span><strong>${esc(label)}</strong>${action==='theme'?'<small>Claro, escuro ou sistema</small>':''}</span><i aria-hidden="true">›</i></button>`;
  }

  function moreArchitectureHtml(){
    return `<div class="cdc-profile-card v75-profile-card"><span class="cdc-avatar" aria-hidden="true">${esc(initials())}</span><div><strong>${esc(profileName())}</strong><small>Conta de Casa · cofre local</small></div></div>${MORE_GROUPS.map(group=>`<section class="v75-more-group" aria-label="${attr(group.label)}"><h2>${esc(group.label)}</h2><div>${group.items.map(([action,label,iconName])=>moreItemHtml(action,label,iconName)).join('')}</div></section>`).join('')}`;
  }

  function renderMoreArchitecture(){
    const rootNode=byId('cdcMoreMenu');
    if(!rootNode||!appReady())return;
    if(rootNode.dataset.v75Architecture==='1')return;
    rootNode.innerHTML=moreArchitectureHtml();
    rootNode.dataset.v75Architecture='1';
  }

  function planningArchitectureHtml(){
    const metrics=root.CDCV74?.dashboardMetrics?.();
    const entries=root.CDCV74?.categoryEntries?.().slice(0,4)||[];
    if(!metrics)return '';
    const total=entries.reduce((sum,entry)=>sum+Number(entry[1]||0),0)||1;
    const budgetLabel=metrics.budget>0?moneyText(metrics.budget):'Por definir';
    const remainingLabel=metrics.budget>0?moneyText(metrics.remaining):'—';
    const month=q('#cdcPlanningOverview .cdc-planning-month')?.outerHTML||'';
    return `${month}<section class="v75-budget-summary" aria-label="Resumo do orçamento"><div class="cdc-budget-ring" style="--pct:${metrics.pct}"><div><strong>${metrics.pct}%</strong><span>utilizado</span></div></div><div class="v75-budget-metrics"><div><small>Gasto este mês</small><strong data-money>${moneyText(metrics.spent)}</strong></div><div><small>Orçamento</small><strong data-money>${budgetLabel}</strong></div><div><small>Disponível</small><strong data-money>${remainingLabel}</strong></div></div></section><div class="v75-section-heading"><strong>Distribuição por categoria</strong><small>${entries.length?'Percentagem das despesas registadas':'Sem movimentos neste mês'}</small></div><div class="cdc-planning-categories">${entries.map(([name,value],index)=>{const pct=Math.round(Number(value||0)/total*100);return `<div><span class="cdc-category-dot ${['food','home','transport','health','other'][index%5]}" aria-hidden="true"></span><strong>${esc(name)}</strong><span class="cdc-plan-track"><i style="width:${Math.max(5,pct)}%"></i></span><b data-money>${moneyText(value)}</b></div>`;}).join('')||'<p class="cdc-empty-note">Ainda não existem despesas para distribuir.</p>'}</div>`;
  }

  function renderPlanningArchitecture(){
    const rootNode=byId('cdcPlanningOverview');
    if(!rootNode||!appReady())return;
    const key=`${rootNode.textContent?.slice(0,40)||''}|${root.CDCV74?.dashboardMetrics?.()?.spent||0}|${root.CDCV74?.dashboardMetrics?.()?.budget||0}`;
    if(rootNode.dataset.v75Key===key)return;
    const html=planningArchitectureHtml();
    if(html){rootNode.innerHTML=html;rootNode.dataset.v75Key=key;rootNode.classList.add('v75-planning-overview');}
  }

  function handleSync(){
    if(typeof showPage==='function')showPage('security');
    setTimeout(()=>byId('syncPanel')?.scrollIntoView({block:'start',behavior:root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth'}),40);
  }

  function handlePreferences(){
    const details=byId('cdcPreferencesDetails');
    if(!details)return;
    details.open=!details.open;
    if(details.open)setTimeout(()=>details.scrollIntoView({block:'start',behavior:root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth'}),20);
  }

  function apply(){
    syncPageChrome();
    syncNavigationArchitecture();
    if(!appReady())return;
    renderMoreArchitecture();
    renderPlanningArchitecture();
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;apply();});
  }

  function start(){
    document.documentElement.classList.add('cdc-v75');
    document.addEventListener('click',event=>{
      const go=event.target.closest?.('[data-v75-go]');
      if(go){event.preventDefault();if(typeof showPage==='function')showPage(go.dataset.v75Go);schedule();return;}
      if(event.target.closest?.('[data-v75-sync]')){event.preventDefault();handleSync();schedule();return;}
      if(event.target.closest?.('[data-v75-theme]')){event.preventDefault();byId('themeToggle')?.click();setTimeout(schedule,0);return;}
      if(event.target.closest?.('[data-v75-preferences]')){event.preventDefault();handlePreferences();return;}
      setTimeout(schedule,0);
    });
    window.addEventListener('hashchange',schedule,{passive:true});
    root.matchMedia?.(MOBILE_QUERY)?.addEventListener?.('change',schedule);
    observer=new MutationObserver(schedule);
    const title=byId('pageTitle');if(title)observer.observe(title,{childList:true,characterData:true,subtree:true});
    const more=byId('page-settings');if(more)observer.observe(more,{childList:true,subtree:false});
    schedule();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  root.CDCV75=Object.freeze({VERSION:'v75',LABELS,DRAWER_GROUPS,MORE_GROUPS});
})(typeof window!=='undefined'?window:globalThis);

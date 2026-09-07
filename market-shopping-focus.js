'use strict';

/* Conta de Casa v65 — foco operacional da Lista de compras no mobile.
 * Camada de apresentação apenas: reorganiza informação já renderizada, mantém os
 * mesmos nós/handlers e não altera preços, quantidades, persistência ou sincronização.
 */
(function installMarketShoppingFocus(root){
  const MOBILE_QUERY='(max-width: 820px)';
  const media=root.matchMedia?.(MOBILE_QUERY)||{matches:false,addEventListener:null};
  let queued=false;
  let listObserver=null;

  function marketPage(){return document.querySelector('#page-market');}
  function marketPageActive(){return Boolean(marketPage()?.classList.contains('active'));}

  function selectedMonthItems(){
    try{
      if(typeof appState==='undefined'||!Array.isArray(appState?.market))return [];
      return appState.market.filter(item=>monthOf(item.createdAt)===selectedMonth||(item.purchased&&inSelectedMonth(item.purchasedAt)));
    }catch(_error){return [];}
  }

  function currentMetrics(){
    const items=selectedMonthItems();
    try{
      const metrics=typeof marketMetrics==='function'?marketMetrics(items):null;
      if(metrics)return {items,...metrics};
    }catch(_error){}
    const purchasedCount=items.filter(item=>item?.purchased).length;
    return {items,estimatedTotal:0,accounted:0,pendingEstimated:0,purchasedEstimated:0,variance:0,missingReal:0,purchasedCount,pendingCount:items.length-purchasedCount};
  }

  function moneyText(cents){
    try{return typeof money==='function'?money(cents):`${(Number(cents||0)/100).toFixed(2)} €`;}
    catch(_error){return '0,00 €';}
  }

  function moneyValue(className,label,value){
    const box=document.createElement('div');
    box.className=className;
    const name=document.createElement('span');
    name.textContent=label;
    const amount=document.createElement('strong');
    amount.setAttribute('data-money','');
    amount.textContent=value;
    box.append(name,amount);
    return box;
  }

  function ensureMobileOverview(){
    const page=marketPage();
    if(!page)return;
    let overview=page.querySelector('#marketMobileOverview');
    if(!overview){
      overview=document.createElement('section');
      overview.id='marketMobileOverview';
      overview.className='market-mobile-overview';
      overview.setAttribute('aria-label','Resumo da lista de compras');
      page.querySelector('.market-command-bar')?.before(overview);
    }
    if(!media.matches)return;

    const metrics=currentMetrics();
    overview.replaceChildren();

    const line=document.createElement('div');
    line.className='market-compact-summary';
    const pending=document.createElement('strong');
    pending.textContent=`${metrics.pendingCount} por comprar`;
    const sep1=document.createElement('span'); sep1.textContent='·'; sep1.setAttribute('aria-hidden','true');
    const purchased=document.createElement('span');
    purchased.textContent=`${metrics.purchasedCount} comprado${metrics.purchasedCount===1?'':'s'}`;
    const sep2=document.createElement('span'); sep2.textContent='·'; sep2.setAttribute('aria-hidden','true');
    const forecast=document.createElement('span'); forecast.textContent='Previsto ';
    const forecastValue=document.createElement('strong'); forecastValue.setAttribute('data-money',''); forecastValue.textContent=moneyText(metrics.estimatedTotal);
    forecast.appendChild(forecastValue);
    line.append(pending,sep1,purchased,sep2,forecast);

    const details=document.createElement('details');
    details.className='market-finance-details';
    const summary=document.createElement('summary');
    summary.textContent='Resumo financeiro';
    const grid=document.createElement('div');
    grid.className='market-finance-details-grid';
    grid.append(
      moneyValue('market-finance-detail','Estimado total',moneyText(metrics.estimatedTotal)),
      moneyValue('market-finance-detail','Gasto contabilizado',moneyText(metrics.accounted)),
      moneyValue('market-finance-detail','Por comprar',moneyText(metrics.pendingEstimated)),
      moneyValue('market-finance-detail','Diferença',`${metrics.variance>0?'+':''}${moneyText(metrics.variance)}`)
    );
    if(metrics.missingReal){
      const note=document.createElement('small');
      note.className='market-finance-note';
      note.textContent=`${metrics.missingReal} comprado${metrics.missingReal===1?'':'s'} sem preço real.`;
      details.append(summary,grid,note);
    }else details.append(summary,grid);

    overview.append(line,details);
  }

  function filterIsActive(){
    const search=document.querySelector('#marketSearch')?.value?.trim()||'';
    const status=document.querySelector('#marketStatusFilter')?.value||'all';
    const category=document.querySelector('#marketCategoryFilter')?.value||'all';
    const sort=document.querySelector('#marketSort')?.value||'pending-first';
    return Boolean(search||status!=='all'||category!=='all'||sort!=='pending-first');
  }

  function syncFilterControls(){
    const labels=[
      ['#marketStatusFilter','Estado'],
      ['#marketCategoryFilter','Categoria'],
      ['#marketSort','Ordenar']
    ];
    for(const [selector,label] of labels){
      const control=document.querySelector(selector);
      if(control&&!control.getAttribute('aria-label'))control.setAttribute('aria-label',label);
    }
    const clear=document.querySelector('#marketClearFilters');
    if(clear)clear.hidden=!filterIsActive();
  }

  function iconMarkup(name){
    try{return root.CDCIcons?.markup?.(name,19)||'';}
    catch(_error){return '';}
  }

  function compactCard(card){
    if(card.dataset.marketShoppingFocused==='1')return;
    const purchased=card.classList.contains('purchased');
    const head=card.querySelector('.market-mobile-head');
    const moneyBlocks=[...card.querySelectorAll(':scope > .market-mobile-money')];
    const moneyBlock=moneyBlocks[0]||card.querySelector('.market-mobile-money');
    const amounts=[...(moneyBlock?.querySelectorAll('strong')||[])];
    const source=purchased?(amounts[1]||amounts[0]):amounts[0];
    if(head&&source){
      const quick=document.createElement('strong');
      quick.className='market-mobile-quick-price';
      if(source.hasAttribute('data-money'))quick.setAttribute('data-money','');
      quick.textContent=source.textContent||'';
      head.appendChild(quick);
    }

    const real=card.querySelector(':scope > .market-mobile-real');
    const actions=card.querySelector(':scope > .market-mobile-actions');
    if(moneyBlock||real||actions){
      const details=document.createElement('details');
      details.className='market-item-details';
      const summary=document.createElement('summary');
      summary.textContent='Detalhes';
      const body=document.createElement('div');
      body.className='market-item-details-body';
      for(const node of [moneyBlock,real,actions])if(node)body.appendChild(node);
      details.append(summary,body);
      card.appendChild(details);
    }
    card.dataset.marketShoppingFocused='1';
  }

  function purchasedSummary(count){
    const summary=document.createElement('summary');
    summary.className='market-category-summary';
    const icon=document.createElement('span');
    icon.className='market-category-icon';
    icon.setAttribute('aria-hidden','true');
    icon.innerHTML=iconMarkup('circleCheck');
    const title=document.createElement('strong');
    title.textContent='Comprados';
    const meta=document.createElement('span');
    meta.className='market-category-count';
    meta.textContent=`${count} ${count===1?'item':'itens'}`;
    const chevron=document.createElement('span');
    chevron.className='market-category-chevron';
    chevron.setAttribute('aria-hidden','true');
    chevron.innerHTML=iconMarkup('chevronDown');
    summary.append(icon,title,meta,chevron);
    return summary;
  }

  function focusMobileList(){
    if(!media.matches)return;
    const mobile=document.querySelector('#marketList > .market-mobile-list');
    if(!mobile||mobile.dataset.marketShoppingFocused==='1')return;
    const groups=[...mobile.querySelectorAll(':scope > .market-category-group')];
    if(!groups.length)return;

    const purchased=[];
    for(const group of groups){
      const cards=[...group.querySelectorAll(':scope > .market-category-items > .market-mobile-card')];
      const pending=cards.filter(card=>!card.classList.contains('purchased'));
      for(const card of cards.filter(card=>card.classList.contains('purchased'))){
        purchased.push(card);
        card.remove();
      }
      if(!pending.length){
        group.remove();
        continue;
      }
      group.open=true;
      const count=group.querySelector('.market-category-count');
      if(count)count.textContent=`${pending.length} ${pending.length===1?'item':'itens'} por comprar`;
      pending.forEach(compactCard);
    }

    if(purchased.length){
      const group=document.createElement('details');
      group.className='market-category-group market-purchased-group';
      group.open=false;
      const items=document.createElement('div');
      items.className='market-category-items';
      purchased.forEach(card=>{compactCard(card);items.appendChild(card);});
      group.append(purchasedSummary(purchased.length),items);
      mobile.appendChild(group);
    }
    mobile.dataset.marketShoppingFocused='1';
  }

  function syncQuickAddContext(){
    const button=document.querySelector('#quickAddBtn');
    if(!button)return;
    if(marketPageActive()){
      button.setAttribute('aria-label','Adicionar produto à lista de compras');
      button.title='Adicionar produto à lista de compras';
    }else{
      button.setAttribute('aria-label','Adicionar registo');
      button.removeAttribute('title');
    }
  }

  function wireQuickAdd(){
    const button=document.querySelector('#quickAddBtn');
    if(!button||button.dataset.marketQuickAddWired==='1')return;
    button.dataset.marketQuickAddWired='1';
    button.addEventListener('click',event=>{
      if(!marketPageActive())return;
      event.preventDefault();
      event.stopImmediatePropagation();
      document.querySelector('#newMarketBtn')?.click();
    },{capture:true});
  }

  function apply(){
    ensureMobileOverview();
    syncFilterControls();
    focusMobileList();
    syncQuickAddContext();
    wireQuickAdd();
  }

  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;apply();});
  }

  function start(){
    const list=document.querySelector('#marketList');
    if(list){
      listObserver=new MutationObserver(schedule);
      listObserver.observe(list,{childList:true,subtree:true});
    }
    const title=document.querySelector('#pageTitle');
    if(title)new MutationObserver(schedule).observe(title,{childList:true,subtree:true,characterData:true});
    document.addEventListener('input',event=>{if(event.target?.matches?.('#marketSearch'))schedule();});
    document.addEventListener('change',event=>{if(event.target?.matches?.('#marketStatusFilter,#marketCategoryFilter,#marketSort'))schedule();});
    document.addEventListener('click',event=>{if(event.target?.closest?.('#marketClearFilters,[data-clear-market-filters]'))schedule();});
    if(typeof media.addEventListener==='function')media.addEventListener('change',schedule);
    schedule();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})(typeof window!=='undefined'?window:globalThis);

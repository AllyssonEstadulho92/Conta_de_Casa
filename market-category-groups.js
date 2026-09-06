'use strict';

/* Conta de Casa — organização visual da Lista de compras por categoria.
 * Camada de apresentação apenas: reutiliza os cartões/ações existentes e não
 * altera preços, quantidades, estados financeiros, persistência ou sincronização.
 */
(function installMarketCategoryGroups(root){
  const CATEGORY_ORDER=Object.freeze([
    'Frutas e legumes','Padaria e pastelaria','Lacticínios e ovos','Carne e peixe',
    'Mercearia / Despensa','Congelados','Bebidas','Snacks e doces',
    'Higiene pessoal','Limpeza','Bebé','Animais','Outros'
  ]);
  const ORDER_INDEX=new Map(CATEGORY_ORDER.map((name,index)=>[name,index]));
  let queued=false;

  function marketItems(){
    try{return typeof appState!=='undefined'&&Array.isArray(appState?.market)?appState.market:[];}
    catch(_error){return [];}
  }

  function itemForNode(node){
    const id=node.querySelector?.('[data-market-toggle]')?.dataset?.marketToggle||'';
    return marketItems().find(item=>String(item?.id||'')===String(id))||null;
  }

  function metaForNode(node){
    const item=itemForNode(node);
    if(item){
      return {
        category:String(item.category||'Outros').trim()||'Outros',
        quantity:`${String(item.quantity||'1').trim()||'1'} ${String(item.unit||'un').trim()||'un'}`,
        pending:!item.purchased
      };
    }
    const small=node.querySelector?.('.market-mobile-head small');
    const parts=String(small?.textContent||'').split('·').map(part=>part.trim()).filter(Boolean);
    return {category:parts[0]||'Outros',quantity:parts.slice(1).join(' · '),pending:!node.classList.contains('purchased')};
  }

  function orderedGroups(nodes){
    const groups=new Map();
    nodes.forEach(node=>{
      const meta=metaForNode(node);
      if(!groups.has(meta.category))groups.set(meta.category,[]);
      groups.get(meta.category).push({node,meta});
    });
    return [...groups.entries()].sort(([a],[b])=>{
      const ai=ORDER_INDEX.has(a)?ORDER_INDEX.get(a):999;
      const bi=ORDER_INDEX.has(b)?ORDER_INDEX.get(b):999;
      return ai-bi||a.localeCompare(b,'pt-PT');
    });
  }

  function categoryIconName(category){
    if(['Limpeza','Higiene pessoal'].includes(category))return 'home';
    if(category==='Outros')return 'more';
    return 'market';
  }

  function iconMarkup(name){
    try{return root.CDCIcons?.markup?.(name,19)||'';}
    catch(_error){return '';}
  }

  function categorySummary(category,entries){
    const summary=document.createElement('summary');
    summary.className='market-category-summary';

    const icon=document.createElement('span');
    icon.className='market-category-icon';
    icon.setAttribute('aria-hidden','true');
    icon.innerHTML=iconMarkup(categoryIconName(category));

    const title=document.createElement('strong');
    title.textContent=category;

    const count=document.createElement('span');
    count.className='market-category-count';
    const pending=entries.filter(entry=>entry.meta.pending).length;
    count.textContent=pending===entries.length
      ? `${entries.length} ${entries.length===1?'item':'itens'}`
      : `${pending} por comprar · ${entries.length} total`;

    const chevron=document.createElement('span');
    chevron.className='market-category-chevron';
    chevron.setAttribute('aria-hidden','true');
    chevron.innerHTML=iconMarkup('chevronDown');

    summary.append(icon,title,count,chevron);
    return summary;
  }

  function groupMobile(listRoot){
    const mobile=listRoot.querySelector(':scope > .market-mobile-list');
    if(!mobile||mobile.dataset.marketCategoryGrouped==='1')return;
    const cards=[...mobile.children].filter(node=>node.classList?.contains('market-mobile-card'));
    if(!cards.length)return;

    const fragment=document.createDocumentFragment();
    for(const [category,entries] of orderedGroups(cards)){
      const details=document.createElement('details');
      details.className='market-category-group';
      details.open=true;
      details.appendChild(categorySummary(category,entries));

      const items=document.createElement('div');
      items.className='market-category-items';
      entries.forEach(({node,meta})=>{
        node.dataset.marketCategory=category;
        const small=node.querySelector('.market-mobile-head small');
        if(small&&meta.quantity)small.textContent=meta.quantity;
        items.appendChild(node);
      });
      details.appendChild(items);
      fragment.appendChild(details);
    }
    mobile.replaceChildren(fragment);
    mobile.dataset.marketCategoryGrouped='1';
  }

  function tableHeader(category,entries,columnCount){
    const row=document.createElement('tr');
    row.className='market-table-category-row';
    const cell=document.createElement('th');
    cell.colSpan=columnCount;
    cell.scope='rowgroup';
    const pending=entries.filter(entry=>entry.meta.pending).length;
    cell.textContent=`${category} · ${pending===entries.length?entries.length:`${pending}/${entries.length}`} ${entries.length===1?'item':'itens'}`;
    row.appendChild(cell);
    return row;
  }

  function groupTable(listRoot){
    const table=listRoot.querySelector(':scope > .market-table-shell .market-table');
    const body=table?.tBodies?.[0];
    if(!table||!body||table.dataset.marketCategoryGrouped==='1')return;
    const rows=[...body.children].filter(node=>node.classList?.contains('market-table-row'));
    if(!rows.length)return;
    const columnCount=table.tHead?.rows?.[0]?.cells?.length||8;
    const fragment=document.createDocumentFragment();
    for(const [category,entries] of orderedGroups(rows)){
      fragment.appendChild(tableHeader(category,entries,columnCount));
      entries.forEach(({node})=>fragment.appendChild(node));
    }
    body.replaceChildren(fragment);
    table.dataset.marketCategoryGrouped='1';
  }

  function apply(){
    const listRoot=document.querySelector('#marketList');
    if(!listRoot)return;
    groupTable(listRoot);
    groupMobile(listRoot);
  }

  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;apply();});
  }

  function start(){
    const listRoot=document.querySelector('#marketList');
    if(!listRoot)return;
    new MutationObserver(schedule).observe(listRoot,{childList:true,subtree:true});
    schedule();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})(typeof window!=='undefined'?window:globalThis);

'use strict';

/* Conta de Casa — sistema de ícones Lucide local (v54).
 * Fonte: Lucide Icons, snapshot 94e4cb9d9db5907053ebf3636a97c45529cf776b.
 * Licença: ISC; alguns glifos derivados de Feather mantêm também o aviso MIT.
 * O aviso integral é distribuído em LUCIDE_LICENSE.txt.
 *
 * A aplicação não carrega icon fonts nem bibliotecas de ícones em runtime.
 * Apenas a geometria SVG necessária é mantida localmente para garantir:
 * - consistência iOS / Android / desktop;
 * - funcionamento offline;
 * - CSP mínima;
 * - controlo exato de dimensões, contraste e acessibilidade.
 */
(function installLucideIconSystem(){
  if(typeof ICONS==='undefined'||typeof icon!=='function') return;

  const LUCIDE_SOURCE_COMMIT='94e4cb9d9db5907053ebf3636a97c45529cf776b';
  const LUCIDE_ICONS=Object.freeze({
    home:'<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    bill:'<path d="M13 16H8"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"/>',
    receipt:'<path d="M13 16H8"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"/>',
    calendar:'<path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"/>',
    plan:'<path d="M3 11h3.75a2 2 0 0 1 1.6.8l.45.6a4 4 0 0 0 6.4 0l.45-.6a2 2 0 0 1 1.6-.8H21"/><path d="M3 7h18"/><rect x="3" y="3" width="18" height="18" rx="2"/>',
    market:'<path d="m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18"/><path d="M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25"/><circle cx="18" cy="20" r="2"/><circle cx="8" cy="20" r="2"/>',
    report:'<path d="M5 21v-6"/><path d="M12 21V9"/><path d="M19 21V3"/>',
    goal:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    settings:'<path d="M14 17H5"/><path d="M19 7h-9"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
    more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    alert:'<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
    lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    menu:'<path d="M4 12h16"/><path d="M4 18h16"/><path d="M4 6h16"/>',
    close:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    chevron:'<path d="m9 18 6-6-6-6"/>',
    chevronDown:'<path d="m6 9 6 6 6-6"/>',
    arrowRight:'<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',
    minus:'<path d="M5 12h14"/>',
    search:'<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
    eye:'<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    eyeOff:'<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon:'<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
    camera:'<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/>',
    flash:'<path d="M4 14a1 1 0 0 1-.78-1.63l9-11a.5.5 0 0 1 .87.44l-1.69 6.17A1 1 0 0 0 12.36 9H20a1 1 0 0 1 .78 1.63l-9 11a.5.5 0 0 1-.87-.44l1.69-6.17A1 1 0 0 0 11.64 14z"/>',
    qr:'<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M12 7v3a2 2 0 0 1-2 2H7M3 12h.01M12 3h.01M12 16v.01M16 12h1M21 12v.01M12 21v-1"/>',
    image:'<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    upload:'<path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
    download:'<path d="M12 15V3"/><path d="m7 10 5 5 5-5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
    wallet:'<path d="M3 11h3.75a2 2 0 0 1 1.6.8l.45.6a4 4 0 0 0 6.4 0l.45-.6a2 2 0 0 1 1.6-.8H21"/><path d="M3 7h18"/><rect x="3" y="3" width="18" height="18" rx="2"/>',
    banknote:'<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
    check:'<path d="m20 6-11 11-5-5"/>',
    circleCheck:'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    warning:'<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
    external:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    refresh:'<path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5"/>',
    back:'<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    backspace:'<path d="M20 6H9l-7 6 7 6h11a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z"/><path d="m12 10 4 4M16 10l-4 4"/>',
    edit:'<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    trash:'<path d="M10 11v6M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    filter:'<path d="M10 18h4M6 14h12M3 10h18M8 6h8"/>',
    scan:'<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>',
    cloud:'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    cloudCheck:'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="m9 12 2 2 4-4"/>',
    cloudOff:'<path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 2.33-.65M13.4 5.1A7 7 0 0 1 15.71 10h1.79a4.5 4.5 0 0 1 4.27 5.92"/>',
    key:'<path d="m15.5 7.5 2 2L22 5l-3-3-4.5 4.5"/><circle cx="8.5" cy="15.5" r="5.5"/><path d="m14 12 1.5-1.5"/>'
  });

  Object.assign(ICONS,LUCIDE_ICONS);

  function sizeClass(size){
    const value=Math.max(12,Math.min(30,Number(size)||20));
    if(value<=16)return 'ui-icon-xs';
    if(value<=20)return 'ui-icon-sm';
    if(value<=24)return 'ui-icon-md';
    return 'ui-icon-lg';
  }

  function appIcon(name,size=20){
    const safeSize=Math.max(12,Math.min(30,Number(size)||20));
    const path=ICONS[name]||ICONS.more;
    return `<svg class="svg-icon ui-icon-svg ${sizeClass(safeSize)}" width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
  }

  try{icon=appIcon;}catch(_error){}

  function svgNode(name,size=20){
    const template=document.createElement('template');
    template.innerHTML=appIcon(name,size);
    const node=template.content.firstElementChild;
    if(node)node.dataset.uiIcon=name;
    return node;
  }

  function fillIcon(target,name,size=20){
    if(!target)return;
    const existing=target.querySelector?.(':scope > svg.ui-icon-svg');
    if(target.dataset.uiIconSlot===name&&existing)return;
    target.replaceChildren(svgNode(name,size));
    target.dataset.uiIconSlot=name;
  }

  function replaceSvg(svg,name,size=20){
    if(!svg)return;
    if(svg.matches?.('.ui-icon-svg')&&svg.dataset.uiIcon===name)return;
    svg.replaceWith(svgNode(name,size));
  }

  function cleanButtonLabel(button){
    return String(button?.textContent||'').replace(/^\s*\+\s*/,'').trim();
  }

  function iconizeTextButton(button,name,size=18){
    if(!button)return;
    const direct=button.querySelector?.(':scope > svg.ui-icon-svg');
    if(button.dataset.uiActionIcon===name&&direct)return;
    const label=cleanButtonLabel(button);
    if(!label){fillIcon(button,name,size);button.dataset.uiActionIcon=name;return;}
    const text=document.createElement('span');
    text.className='ui-icon-label';
    text.textContent=label;
    button.replaceChildren(svgNode(name,size),text);
    button.dataset.uiActionIcon=name;
    button.dataset.uiIconized='true';
  }

  function appendNavigationIcon(button,name='arrowRight',size=16){
    if(!button||button.dataset.uiTrailingIcon===name)return;
    const trailing=svgNode(name,size);
    trailing.classList.add('ui-icon-trailing');
    button.appendChild(trailing);
    button.dataset.uiTrailingIcon=name;
  }

  function decorateSearchInput(input){
    if(!input||input.dataset.uiSearchDecorated==='true')return;
    if(input.closest('.market-browser-search'))return;
    const host=input.closest('.search-wrap')||input.parentElement;
    if(!host)return;
    host.classList.add('ui-search-control');
    const slot=document.createElement('span');
    slot.className='ui-search-icon';
    slot.setAttribute('aria-hidden','true');
    slot.appendChild(svgNode('search',21));
    host.insertBefore(slot,input);
    input.dataset.uiSearchDecorated='true';
  }

  function decorateSelect(select){
    if(!select||select.closest('.ui-select-control'))return;
    const wrapper=document.createElement('span');
    wrapper.className='ui-select-control';
    select.parentNode.insertBefore(wrapper,select);
    wrapper.appendChild(select);
    const slot=document.createElement('span');
    slot.className='ui-select-arrow';
    slot.setAttribute('aria-hidden','true');
    slot.appendChild(svgNode('chevronDown',18));
    wrapper.appendChild(slot);
  }

  function updateThemeIcon(){
    const button=document.querySelector('#themeToggle');
    if(!button)return;
    fillIcon(button,document.documentElement.dataset.theme==='dark'?'moon':'sun',20);
  }

  function updatePrivacyIcon(selector){
    const button=document.querySelector(selector);
    const slot=button?.querySelector('.footer-icon');
    if(!button||!slot)return;
    const showing=button.getAttribute('aria-label')?.startsWith('Mostrar');
    fillIcon(slot,showing?'eye':'eyeOff',19);
  }

  function updateDisclosure(){
    const slot=document.querySelector('.vault-disclosure-icon');
    if(slot)fillIcon(slot,'chevronDown',18);
  }

  function updateSyncIcon(){
    const header=document.querySelector('#syncHeaderStatus');
    const slot=header?.querySelector('.sync-dot');
    if(!header||!slot)return;
    const label=header.querySelector('.sync-header-text')?.textContent?.trim()||'';
    const name=label==='Sync'?'cloudCheck':label==='...'?'refresh':label==='Offline'?'cloudOff':
      ['Conflito','Rever','Erro'].includes(label)?'warning':'cloud';
    fillIcon(slot,name,17);
  }

  function preserveBadgeIcon(button,name,size=20){
    if(!button)return;
    const badge=button.querySelector('.badge-dot');
    const existing=button.querySelector(':scope > svg');
    if(existing)replaceSvg(existing,name,size);
    else button.insertBefore(svgNode(name,size),badge||button.firstChild);
  }

  function hydrateMarket(root=document){
    root.querySelectorAll?.('.market-browser-search > .svg-icon').forEach(svg=>replaceSvg(svg,'search',22));
    root.querySelectorAll?.('.market-search-clear').forEach(button=>fillIcon(button,'close',20));
    root.querySelectorAll?.('.market-source-notice > .svg-icon').forEach(svg=>replaceSvg(svg,'info',20));
    root.querySelectorAll?.('.market-source-check .svg-icon').forEach(svg=>replaceSvg(svg,'check',14));
    root.querySelectorAll?.('.market-add-product').forEach(button=>fillIcon(button,'plus',20));
    root.querySelectorAll?.('.market-barcode-open').forEach(button=>fillIcon(button,'camera',20));
    root.querySelectorAll?.('.market-barcode-close').forEach(button=>fillIcon(button,'close',20));
    root.querySelectorAll?.('.market-barcode-torch').forEach(button=>fillIcon(button,'flash',18));
  }

  const TEXT_BUTTON_RULES=Object.freeze([
    ['#newBillBtn','plus'],['#newIncomeBtn','plus'],['#newMarketBtn','plus'],['#newGoalBtn','plus'],
    ['#billClearFilters','filter'],['#marketClearFilters','filter'],['#securityLockBtn','lock'],
    ['#exportBackupBtn','download'],['#syncConfigureBtn','cloudCheck'],['#syncNowBtn','refresh'],
    ['#syncDisableBtn','cloudOff'],['#syncResolveBtn','cloudCheck'],['#syncConflictRetryBtn','refresh'],
    ['#syncMergeBackupBtn','copy'],['#resetDataBtn','trash'],['#vaultKeyboardModeToggle','key'],
    ['[data-edit-bill]','edit'],['[data-edit-payment]','edit'],['[data-edit-market]','edit'],
    ['[data-delete-bill]','trash'],['[data-delete-payment]','trash'],
    ['[data-detail-edit]','edit'],['[data-detail-duplicate]','copy'],['[data-detail-delete]','trash'],
    ['[data-detail-pay]','circleCheck'],['[data-detail-cancel]','warning'],['[data-remove-excess-payment]','trash'],
    ['[data-clear-bill-filters]','filter']
  ]);

  function hydrateActionButtons(root=document){
    for(const [selector,name] of TEXT_BUTTON_RULES){
      root.querySelectorAll?.(selector).forEach(button=>iconizeTextButton(button,name,18));
    }
    root.querySelectorAll?.('[data-delete-market]').forEach(button=>{
      if(button.classList.contains('icon-btn'))fillIcon(button,'trash',19);
      else iconizeTextButton(button,'trash',18);
    });
    root.querySelectorAll?.('.btn[data-bill-id]').forEach(button=>iconizeTextButton(button,'eye',18));
    root.querySelectorAll?.('[data-go].link-btn').forEach(button=>appendNavigationIcon(button,'arrowRight',15));
    const importLabel=document.querySelector('#importBackupInput')?.closest('.file-btn');
    if(importLabel&&!importLabel.dataset.uiFileIcon){
      importLabel.insertBefore(svgNode('upload',18),importLabel.firstChild);
      importLabel.dataset.uiFileIcon='upload';
    }
  }

  function hydrate(root=document){
    root.querySelectorAll?.('.brand-mark').forEach(slot=>fillIcon(slot,'home',22));
    root.querySelectorAll?.('.vault-lock-badge').forEach(slot=>fillIcon(slot,'lock',20));
    root.querySelectorAll?.('[data-pin-delete]').forEach(button=>fillIcon(button,'backspace',20));
    updateDisclosure();
    fillIcon(document.querySelector('#sidebarToggle'),'menu',21);
    fillIcon(document.querySelector('#mobileMenuBtn'),'menu',22);
    fillIcon(document.querySelector('#drawerCloseBtn'),'close',20);
    document.querySelectorAll?.('#lockBtn .footer-icon,#drawerLockBtn .footer-icon').forEach(slot=>fillIcon(slot,'lock',19));
    updatePrivacyIcon('#privacyToggle');
    updatePrivacyIcon('#drawerPrivacyToggle');
    updateThemeIcon();
    updateSyncIcon();
    preserveBadgeIcon(document.querySelector('#notificationsBtn'),'alert',20);
    const quickAdd=document.querySelector('#quickAddBtn > span:first-child');
    if(quickAdd)fillIcon(quickAdd,'plus',20);
    root.querySelectorAll?.('.dialog-close').forEach(button=>fillIcon(button,'close',20));
    const quickMap={bill:'receipt',income:'banknote',market:'market',goal:'goal'};
    root.querySelectorAll?.('.quick-grid [data-quick]').forEach(button=>iconizeTextButton(button,quickMap[button.dataset.quick]||'plus',21));
    root.querySelectorAll?.('input[type="search"]').forEach(decorateSearchInput);
    root.querySelectorAll?.('select').forEach(decorateSelect);
    hydrateActionButtons(root);
    hydrateMarket(root);
  }

  globalThis.CDCIcons=Object.freeze({
    markup:appIcon,
    source:'Lucide',
    sourceCommit:LUCIDE_SOURCE_COMMIT
  });

  let queued=false;
  function scheduleHydrate(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;hydrate(document);});
  }

  const observer=new MutationObserver(mutations=>{
    if(mutations.some(m=>m.type==='childList'||m.type==='attributes'))scheduleHydrate();
  });
  observer.observe(document.documentElement,{
    subtree:true,
    childList:true,
    attributes:true,
    attributeFilter:['aria-label','aria-expanded','data-theme','class']
  });

  hydrate(document);
})();

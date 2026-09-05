'use strict';

/* Conta de Casa — registo visual único de ícones.
 * Mantém os ícones como SVG local, sem fontes externas, emojis ou dependências de runtime.
 * A geometria 24x24 e o traço uniforme evitam diferenças de rendering entre iOS, Android e desktop.
 */
(function installUnifiedIcons(){
  if(typeof ICONS==='undefined'||typeof icon!=='function') return;

  const STANDARD_ICONS=Object.freeze({
    home:'<path d="M3 10.8 12 3.5l9 7.3"/><path d="M5.5 9.8V20h13V9.8"/><path d="M9.5 20v-6h5v6"/>',
    bill:'<path d="M6 3.5h9l3 3V21H6z"/><path d="M14.5 3.5V7H18"/><path d="M9 11h6M9 15h6M9 18h4"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18"/>',
    plan:'<path d="M4 19V10m6 9V5m6 14v-7m4 7H2"/>',
    market:'<path d="M3 4h2l2.3 10.1a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.5L21 8H7"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
    report:'<path d="M4 20V11m5 9V5m6 15v-7m5 7V8"/>',
    goal:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    shield:'<path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-5"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14v-4a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3h4a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9A1.7 1.7 0 0 0 21 10v4a1.7 1.7 0 0 0-1.6 1z"/>',
    more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    alert:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    chevron:'<path d="m9 18 6-6-6-6"/>',
    chevronDown:'<path d="m6 9 6 6 6-6"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    eye:'<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.8"/>',
    eyeOff:'<path d="m3 3 18 18"/><path d="M10.6 6.1A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a14 14 0 0 1-2.1 2.8M6.2 6.2C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6c1.6 0 3-.4 4.2-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon:'<path d="M20.5 14.5A8 8 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z"/>',
    camera:'<path d="M9 5 7.5 7H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2.5L15 5H9Z"/><circle cx="12" cy="13" r="3.5"/>',
    flash:'<path d="M13 2 5 14h6l-1 8 9-13h-6V2Z"/>',
    qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM18 14h3M18 18h3v3h-3M14 19v2"/>',
    image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 20"/>',
    upload:'<path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M5 20h14"/>',
    receipt:'<path d="M6 3v18l2-1.5 2 1.5 2-1.5 2 1.5 2-1.5 2 1.5V3l-2 1.5L14 3l-2 1.5L10 3 8 4.5 6 3Z"/><path d="M9 9h6M9 13h6M9 17h4"/>',
    wallet:'<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H18v16H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3"/><path d="M15 11h6v5h-6a2.5 2.5 0 0 1 0-5Z"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    external:'<path d="M14 5h5v5M19 5l-8 8"/><path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    refresh:'<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>',
    back:'<path d="m15 18-6-6 6-6"/>',
    backspace:'<path d="M21 6H9l-6 6 6 6h12z"/><path d="m12 10 4 4m0-4-4 4"/>'
  });

  Object.assign(ICONS,STANDARD_ICONS);

  function sizeClass(size){
    const value=Math.max(12,Math.min(28,Number(size)||20));
    if(value<=16)return 'ui-icon-xs';
    if(value<=20)return 'ui-icon-sm';
    if(value<=24)return 'ui-icon-md';
    return 'ui-icon-lg';
  }

  function appIcon(name,size=20){
    const safeSize=Math.max(12,Math.min(28,Number(size)||20));
    const path=ICONS[name]||ICONS.more;
    return `<svg class="svg-icon ui-icon-svg ${sizeClass(safeSize)}" width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  }

  try{icon=appIcon;}catch(_error){}
  globalThis.CDCIcons=Object.freeze({markup:appIcon});

  function svgNode(name,size=20){
    const template=document.createElement('template');
    template.innerHTML=appIcon(name,size);
    return template.content.firstElementChild;
  }

  function replaceSvg(svg,name,size=20){
    if(!svg||svg.dataset?.uiIcon===name)return;
    const next=svgNode(name,size);
    next.dataset.uiIcon=name;
    svg.replaceWith(next);
  }

  function fillIcon(target,name,size=20){
    if(!target)return;
    const current=target.querySelector?.(':scope > svg');
    if(current){replaceSvg(current,name,size);return;}
    target.replaceChildren(svgNode(name,size));
  }

  function iconizeTextButton(button,name){
    if(!button||button.dataset.uiIconized==='true')return;
    const label=button.textContent.replace(/^\s*\+\s*/,'').trim();
    const text=document.createElement('span');
    text.className='ui-icon-label';
    text.textContent=label;
    button.replaceChildren(svgNode(name,19),text);
    button.dataset.uiIconized='true';
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
    root.querySelectorAll?.('.market-barcode-torch').forEach(button=>{
      const svg=button.querySelector('svg');
      if(svg)replaceSvg(svg,'flash',18);
    });
  }

  function hydrate(root=document){
    root.querySelectorAll?.('.brand-mark').forEach(slot=>fillIcon(slot,'home',22));
    root.querySelectorAll?.('.vault-lock-badge').forEach(slot=>fillIcon(slot,'lock',20));
    root.querySelectorAll?.('[data-pin-delete]').forEach(button=>fillIcon(button,'backspace',20));
    updateDisclosure();
    fillIcon(document.querySelector('#sidebarToggle'),'menu',20);
    fillIcon(document.querySelector('#mobileMenuBtn'),'menu',20);
    fillIcon(document.querySelector('#drawerCloseBtn'),'close',20);
    document.querySelectorAll?.('#lockBtn .footer-icon,#drawerLockBtn .footer-icon').forEach(slot=>fillIcon(slot,'lock',19));
    updatePrivacyIcon('#privacyToggle');
    updatePrivacyIcon('#drawerPrivacyToggle');
    updateThemeIcon();
    preserveBadgeIcon(document.querySelector('#notificationsBtn'),'alert',20);
    const quickAdd=document.querySelector('#quickAddBtn > span:first-child');
    if(quickAdd)fillIcon(quickAdd,'plus',18);
    root.querySelectorAll?.('.dialog-close').forEach(button=>fillIcon(button,'close',20));
    const quickMap={bill:'receipt',income:'wallet',market:'market',goal:'goal'};
    root.querySelectorAll?.('.quick-grid [data-quick]').forEach(button=>iconizeTextButton(button,quickMap[button.dataset.quick]||'plus'));
    iconizeTextButton(document.querySelector('#newBillBtn'),'bill');
    iconizeTextButton(document.querySelector('#newIncomeBtn'),'wallet');
    iconizeTextButton(document.querySelector('#newMarketBtn'),'market');
    iconizeTextButton(document.querySelector('#newGoalBtn'),'goal');
    hydrateMarket(root);
  }

  if(typeof applyTheme==='function'){
    const baseApplyTheme=applyTheme;
    applyTheme=function(){
      const result=baseApplyTheme.apply(this,arguments);
      updateThemeIcon();
      return result;
    };
  }
  if(typeof setPrivacy==='function'){
    const baseSetPrivacy=setPrivacy;
    setPrivacy=function(){
      const result=baseSetPrivacy.apply(this,arguments);
      updatePrivacyIcon('#privacyToggle');
      updatePrivacyIcon('#drawerPrivacyToggle');
      return result;
    };
  }

  let queued=false;
  function scheduleHydrate(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;hydrate(document);});
  }

  const observer=new MutationObserver(mutations=>{
    if(mutations.some(m=>m.type==='childList'||m.type==='attributes'))scheduleHydrate();
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-label','aria-expanded','data-theme']});

  hydrate(document);
})();

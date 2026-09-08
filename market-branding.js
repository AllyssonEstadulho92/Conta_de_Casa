'use strict';

/* Conta de Casa v74 — identidade semântica do Mercado.
 * Não lê nem altera dados do cofre. A apresentação pode mostrar fotografias já
 * validadas pelos módulos de produto; nome, embalagem, loja e preço continuam a
 * ser a identificação principal e a fotografia nunca prova preço ou compra.
 */
(function installMarketBranding(){
  const NOTICE_SELECTOR='#formDialog[data-mode="market-browser"] .market-source-notice p';
  const NOTICE_COPY='Os resultados usam nome, embalagem, loja e preço como referência principal. Quando existe uma fotografia de produto validada, ela é apresentada apenas como apoio visual.';

  function updateNotice(root=document){
    const notices=root.querySelectorAll?.(NOTICE_SELECTOR)||[];
    notices.forEach(notice=>{
      if(notice.dataset.marketBrandCopy==='74'&&notice.textContent.trim()===NOTICE_COPY)return;
      notice.replaceChildren(document.createTextNode(NOTICE_COPY));
      notice.dataset.marketBrandCopy='74';
    });
  }

  function install(){
    document.documentElement.dataset.marketProductImages='verified';
    updateNotice();
    const dialog=document.querySelector('#formDialog');
    if(!dialog)return;
    const observer=new MutationObserver(()=>updateNotice());
    observer.observe(dialog,{subtree:true,childList:true,attributes:true,attributeFilter:['data-mode']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();

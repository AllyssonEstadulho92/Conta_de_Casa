'use strict';

/* Conta de Casa — ajuste semântico da identidade visual do Mercado.
 * Não lê nem altera dados do cofre. Apenas identifica a variante visual sem
 * fotografias e mantém o aviso de origem coerente com essa decisão de produto.
 */
(function installMarketBranding(){
  const NOTICE_SELECTOR='#formDialog[data-mode="market-browser"] .market-source-notice p';
  const NOTICE_COPY='Mostramos produtos que correspondem pelo nome, embalagem, loja e preço. A fotografia é opcional.';

  function updateNotice(root=document){
    const notices=root.querySelectorAll?.(NOTICE_SELECTOR)||[];
    notices.forEach(notice=>{
      if(notice.dataset.marketBrandCopy==='2'&&notice.textContent.trim()===NOTICE_COPY)return;
      notice.replaceChildren(document.createTextNode(NOTICE_COPY));
      notice.dataset.marketBrandCopy='2';
    });
  }

  function install(){
    document.documentElement.dataset.marketProductImages='hidden';
    updateNotice();
    const dialog=document.querySelector('#formDialog');
    if(!dialog)return;
    const observer=new MutationObserver(()=>updateNotice());
    observer.observe(dialog,{subtree:true,childList:true,attributes:true,attributeFilter:['data-mode']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();

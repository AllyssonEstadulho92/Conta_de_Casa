/* Conta de Casa v76 — identidade semântica do Mercado em TypeScript.
 * Não lê nem altera dados do cofre. A apresentação pode mostrar fotografias já
 * validadas pelos módulos de produto; nome, embalagem, loja e preço continuam a
 * ser a identificação principal e a fotografia nunca prova preço ou compra.
 */

const MARKET_BRAND_NOTICE_SELECTOR = '#formDialog[data-mode="market-browser"] .market-source-notice p';
const MARKET_BRAND_NOTICE_COPY = 'Os resultados usam nome, embalagem, loja e preço como referência principal. Quando existe uma fotografia de produto validada, ela é apresentada apenas como apoio visual.';

(function installMarketBranding(): void {
  function updateNotice(root: ParentNode = document): void {
    const notices = root.querySelectorAll<HTMLElement>(MARKET_BRAND_NOTICE_SELECTOR);
    notices.forEach(notice => {
      if (notice.dataset.marketBrandCopy === '74' && notice.textContent.trim() === MARKET_BRAND_NOTICE_COPY) return;
      notice.replaceChildren(document.createTextNode(MARKET_BRAND_NOTICE_COPY));
      notice.dataset.marketBrandCopy = '74';
    });
  }

  function install(): void {
    document.documentElement.dataset.marketProductImages = 'verified';
    updateNotice();

    const dialog = document.querySelector<HTMLDialogElement>('#formDialog');
    if (!dialog) return;

    const observer = new MutationObserver(() => updateNotice());
    observer.observe(dialog, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-mode']
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();

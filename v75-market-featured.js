'use strict';

/* Conta de Casa v76 — compatibilidade de retirada do antigo Featured 75-featured1.
 * O bloco original dependia de #cdcMarketHome/.cdc-product-grid, criados pelo runtime
 * v74 que já não faz parte do bundle público. A lista atual do Mercado é apresentada
 * pelos módulos canónicos; esta camada deixa de instalar observers, listeners ou rede.
 * Mantém apenas a API histórica até à remoção física do ficheiro do bundle.
 *
 * Não lê/escreve estado da aplicação, preços, quantidades, persistência ou sincronização.
 */
(function installRetiredV75Featured(root){
  function upgrade(){return false;}

  root.CDCV75Featured=Object.freeze({
    revision:'75-featured1',
    retired:true,
    upgrade
  });
})(window);

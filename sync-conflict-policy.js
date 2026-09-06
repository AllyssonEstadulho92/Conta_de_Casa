'use strict';

/* Conta de Casa — política de conflitos técnicos da sincronização.
 *
 * Campos de identificação/representação auxiliares do Mercado não são valores
 * financeiros nem decisões do utilizador. Diferenças nesses metadados devem ser
 * reconciliadas automaticamente pelo motor existente, preservando o registo mais
 * completo, em vez de abrir uma revisão com “0 diferenças”.
 */
(function installSyncConflictPolicy(root){
  const originalBusinessView=root.syncBusinessView;
  if(typeof originalBusinessView!=='function')return;

  const MARKET_TECHNICAL_FIELDS=Object.freeze([
    'productCode',
    'imageUrl',
    'imageSource',
    'imageMatchedAt'
  ]);

  function businessView(entity,item){
    const view=originalBusinessView(entity,item);
    if(entity!=='market'||!view||typeof view!=='object')return view;
    for(const field of MARKET_TECHNICAL_FIELDS)delete view[field];
    return view;
  }

  root.syncBusinessView=businessView;
  root.CDCSyncConflictPolicy=Object.freeze({
    version:1,
    marketTechnicalFields:MARKET_TECHNICAL_FIELDS
  });
})(typeof window!=='undefined'?window:globalThis);

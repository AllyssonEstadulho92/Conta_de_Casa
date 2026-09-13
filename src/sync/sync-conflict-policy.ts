'use strict';

/* Conta de Casa — política de conflitos técnicos da sincronização.
 * Fonte TypeScript canónica. O browser recebe apenas o JavaScript gerado pelo build.
 *
 * Campos de identificação/representação auxiliares do Mercado não são valores
 * financeiros nem decisões do utilizador. Diferenças nesses metadados devem ser
 * reconciliadas automaticamente pelo motor existente, preservando o registo mais
 * completo, em vez de abrir uma revisão com “0 diferenças”.
 */

type SyncBusinessView = (entity: string, item: unknown) => unknown;

type SyncConflictPolicyDescriptor = Readonly<{
  version: 1;
  marketTechnicalFields: readonly string[];
}>;

interface SyncConflictPolicyRoot {
  syncBusinessView?: SyncBusinessView;
  CDCSyncConflictPolicy?: SyncConflictPolicyDescriptor;
}

(function installSyncConflictPolicy(root: SyncConflictPolicyRoot): void {
  const originalBusinessView = root.syncBusinessView;
  if (typeof originalBusinessView !== 'function') return;
  const callBusinessView: SyncBusinessView = originalBusinessView;

  const MARKET_TECHNICAL_FIELDS = Object.freeze([
    'productCode',
    'imageUrl',
    'imageSource',
    'imageMatchedAt'
  ] as const);

  function businessView(entity: string, item: unknown): unknown {
    const view = callBusinessView(entity, item);
    if (entity !== 'market' || !view || typeof view !== 'object') return view;

    const mutableView = view as Record<string, unknown>;
    for (const field of MARKET_TECHNICAL_FIELDS) delete mutableView[field];
    return view;
  }

  root.syncBusinessView = businessView;
  root.CDCSyncConflictPolicy = Object.freeze({
    version: 1,
    marketTechnicalFields: MARKET_TECHNICAL_FIELDS
  });
})(
  (typeof window !== 'undefined' ? window : globalThis) as unknown as SyncConflictPolicyRoot
);

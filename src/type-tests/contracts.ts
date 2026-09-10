import type {
  ActiveMarketId,
  AppStateV5,
  Cents,
  CivilDateKey,
  EntityId,
  IsoDateTime,
  MarketPriceObservation,
  MarketSearchResultV75,
  ProductCode
} from '../types/index.js';

declare const cents: Cents;
declare const entityId: EntityId;
declare const dateKey: CivilDateKey;
declare const iso: IsoDateTime;
declare const productCode: ProductCode;

const marketId: ActiveMarketId = 'continente';
void marketId;

const searchResult: MarketSearchResultV75 = {
  id: 'cesta-continente-demo',
  provider: 'cesta',
  marketId: 'continente',
  name: 'Produto',
  pack: '1 un',
  priceCents: cents,
  oldPriceCents: cents,
  discount: '',
  promotionUntil: dateKey,
  unitPrice: '',
  sourceUrl: 'https://www.continente.pt/',
  sourceLabel: 'Produto oficial',
  freshness: 'current',
  observedDate: ''
};
void searchResult;

const priceObservation: MarketPriceObservation = {
  evidence: 'estimated',
  amountCents: cents,
  marketId: 'continente',
  productId: 'pid-demo',
  observedAt: iso,
  source: 'cesta'
};
void priceObservation;

const emptyState: AppStateV5 = {
  version: 5,
  settings: {
    profileName: '',
    currency: 'EUR',
    theme: 'light',
    lockMinutes: 5,
    lockOnHidden: true,
    sync: { enabled: false, disabledByUser: false, owner: '', repo: '', path: 'sync/vault.json' }
  },
  months: {},
  bills: [],
  payments: [],
  incomes: [],
  market: [{
    id: entityId,
    name: 'Produto',
    category: 'Outros',
    quantity: '1',
    unit: 'un',
    estimatedCents: cents,
    actualCents: cents,
    purchased: false,
    productCode,
    imageUrl: '',
    imageSource: '',
    imageMatchedAt: null,
    createdAt: iso,
    updatedAt: iso,
    syncResolvedAt: null,
    purchasedAt: null
  }],
  goals: [],
  activity: [],
  auditTrail: [],
  security: { lastBackupAt: null, lastRestoreAt: null },
  syncTombstones: [],
  syncConflicts: [],
  attachments: { enabled: false, items: [] }
};
void emptyState;

// Regressões de tipos que o compilador deve bloquear.
// @ts-expect-error a versão persistida atual é exatamente 5.
const invalidVersion: AppStateV5['version'] = 6;
void invalidVersion;

// @ts-expect-error preço pesquisado e confirmado usam estados explícitos.
const invalidEvidence: MarketPriceObservation['evidence'] = 'aproximado';
void invalidEvidence;

// @ts-expect-error o browser live atual só aceita os mercados ativos declarados.
const invalidMarket: ActiveMarketId = 'mercado-inexistente';
void invalidMarket;

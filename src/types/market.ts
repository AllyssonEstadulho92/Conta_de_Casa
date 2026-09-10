import type { Cents, CivilDateKey, IsoDateTime } from './primitives.js';

/** Mercados atualmente ativos na pesquisa live v75. */
export type ActiveMarketId = 'pingo-doce' | 'continente';
export type MarketProvider = 'cesta';

/** Resultado que o browser live v75 efetivamente produz hoje. */
export interface MarketSearchResultV75 {
  id: string;
  provider: MarketProvider;
  marketId: ActiveMarketId;
  name: string;
  pack: string;
  priceCents: Cents;
  oldPriceCents: Cents;
  discount: string;
  promotionUntil: CivilDateKey | '';
  unitPrice: string;
  sourceUrl: string;
  sourceLabel: string;
  freshness: 'current';
  observedDate: CivilDateKey | '';
  productCode?: string;
  imageUrl?: string;
  imageSource?: 'Open Food Facts';
  imageMatchedAt?: IsoDateTime;
}

/** Identidade canónica exigida pela biblioteca de catálogo/fotografia. */
export interface MarketCatalogIdentity {
  marketId: string;
  pid: string;
}

export type PriceEvidence = 'estimated' | 'confirmed';

/** Contrato de destino para preços: não substitui ainda o schema persistido v5. */
export interface MarketPriceObservation {
  evidence: PriceEvidence;
  amountCents: Cents;
  marketId: string;
  productId: string;
  observedAt: IsoDateTime;
  source: string;
  validUntil?: CivilDateKey;
}

export type PurchaseState = 'to-buy' | 'price-to-confirm' | 'purchased';

declare const centsBrand: unique symbol;
declare const entityIdBrand: unique symbol;
declare const civilDateBrand: unique symbol;
declare const civilTimeBrand: unique symbol;
declare const isoDateTimeBrand: unique symbol;
declare const productCodeBrand: unique symbol;

/** Valor monetário persistido em cêntimos inteiros. */
export type Cents = number & { readonly [centsBrand]: 'Cents' };

/** ID normalizado de uma entidade persistida. */
export type EntityId = string & { readonly [entityIdBrand]: 'EntityId' };

/** Data civil no formato YYYY-MM-DD. */
export type CivilDateKey = string & { readonly [civilDateBrand]: 'CivilDateKey' };

/** Hora civil no formato HH:MM. */
export type CivilTimeKey = string & { readonly [civilTimeBrand]: 'CivilTimeKey' };

/** Data/hora ISO normalizada. */
export type IsoDateTime = string & { readonly [isoDateTimeBrand]: 'IsoDateTime' };

/** Código de produto atualmente persistido pelo Mercado. */
export type ProductCode = string & { readonly [productCodeBrand]: 'ProductCode' };

export type NullableIsoDateTime = IsoDateTime | null;

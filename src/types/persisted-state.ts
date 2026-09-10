import type {
  Cents,
  CivilDateKey,
  CivilTimeKey,
  EntityId,
  IsoDateTime,
  NullableIsoDateTime,
  ProductCode
} from './primitives.js';

export type Recurrence = 'none' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual';
export type ThemeMode = 'light' | 'dark' | 'system';
export type CurrencyCode = 'EUR';
export type ActivityType = 'security' | 'backup' | 'bill' | 'payment' | 'planning' | 'income' | 'market' | 'goal' | 'settings' | 'general';

export interface MonthProfile {
  openingBalanceCents: Cents;
  budgetCents: Cents;
  accountBalanceCents: Cents | null;
  accountBalanceUpdatedAt: NullableIsoDateTime;
  updatedAt: NullableIsoDateTime;
  syncResolvedAt?: NullableIsoDateTime;
}

export interface Bill {
  id: EntityId;
  title: string;
  provider: string;
  category: string;
  totalCents: Cents;
  dueDate: CivilDateKey | '';
  dueTime: CivilTimeKey;
  dueAt: NullableIsoDateTime;
  issueAt: NullableIsoDateTime;
  method: string;
  recurrence: Recurrence;
  reference: string;
  notes: string;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  syncResolvedAt: NullableIsoDateTime;
  recurrenceParentId?: EntityId;
  recurrenceSeriesId?: EntityId;
  recurrenceKey?: string;
  cancelled: boolean;
  archived: boolean;
}

export interface Payment {
  id: EntityId;
  billId: EntityId;
  amountCents: Cents;
  paidAt: IsoDateTime;
  method: string;
  notes: string;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  syncResolvedAt: NullableIsoDateTime;
}

export interface Income {
  id: EntityId;
  description: string;
  amountCents: Cents;
  receivedAt: IsoDateTime;
  createdAt: IsoDateTime;
  syncResolvedAt: NullableIsoDateTime;
}

/** Forma persistida atual do artigo de Mercado na v75. */
export interface MarketItem {
  id: EntityId;
  name: string;
  category: string;
  quantity: string;
  unit: string;
  estimatedCents: Cents;
  actualCents: Cents;
  purchased: boolean;
  productCode: ProductCode | '';
  imageUrl: string;
  imageSource: string;
  imageMatchedAt: NullableIsoDateTime;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  syncResolvedAt: NullableIsoDateTime;
  purchasedAt: NullableIsoDateTime;
}

export interface Goal {
  id: EntityId;
  name: string;
  targetCents: Cents;
  savedCents: Cents;
  deadline: NullableIsoDateTime;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  syncResolvedAt: NullableIsoDateTime;
  archived: boolean;
}

export interface ActivityEntry {
  id: EntityId;
  text: string;
  type: ActivityType;
  at: IsoDateTime;
}

export type AuditAction =
  | 'bill-created'
  | 'bill-updated'
  | 'bill-duplicated'
  | 'bill-cancelled'
  | 'bill-deleted'
  | 'bill-recurring-created'
  | 'payment-created'
  | 'payment-updated'
  | 'payment-deleted';

export type AuditValue = string | number | boolean | null;

export interface AuditChange {
  field: string;
  before: AuditValue;
  after: AuditValue;
}

export interface AuditEntry {
  id: EntityId;
  billId: EntityId;
  paymentId?: EntityId;
  action: AuditAction;
  changes: AuditChange[];
  at: IsoDateTime;
}

export interface SyncSettings {
  enabled: boolean;
  disabledByUser: boolean;
  owner: string;
  repo: string;
  path: string;
}

export interface AppSettings {
  profileName: string;
  currency: CurrencyCode;
  theme: ThemeMode;
  lockMinutes: number;
  lockOnHidden: boolean;
  sync: SyncSettings;
}

export interface SyncTombstone {
  entity: string;
  id: string;
  deletedAt: IsoDateTime;
}

export interface SyncConflict {
  entity: string;
  id: string;
  at: IsoDateTime;
  local: Record<string, unknown>;
  remote: Record<string, unknown>;
}

export interface AppStateV5 {
  version: 5;
  settings: AppSettings;
  months: Record<string, MonthProfile>;
  bills: Bill[];
  payments: Payment[];
  incomes: Income[];
  market: MarketItem[];
  goals: Goal[];
  activity: ActivityEntry[];
  auditTrail: AuditEntry[];
  security: {
    lastBackupAt: NullableIsoDateTime;
    lastRestoreAt: NullableIsoDateTime;
  };
  syncTombstones: SyncTombstone[];
  syncConflicts: SyncConflict[];
  attachments: {
    enabled: false;
    items: unknown[];
  };
}

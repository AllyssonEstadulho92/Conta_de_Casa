import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

type DbExecutor = Pick<SQLiteDatabase, 'runAsync' | 'getFirstAsync'>;
import { getDatabase } from './database';
import {
  calculateShareCents,
  daysInMonthFromKey,
  enumerateDateKeysInclusive,
  monthKeyFromDateKey,
  ownerShareCents,
  type CalculationMode,
} from './domain';

export const DEFAULT_PET_ID = 'walli';
export const DEFAULT_CAREGIVER_ID = 'nuno';

export type Pet = { id: string; name: string; species: string };
export type Caregiver = { id: string; name: string };
export type ShareMonth = {
  petId: string;
  caregiverId: string;
  monthKey: string;
  calculationMode: CalculationMode;
  baseCents: number;
  dailyRateCents: number;
};
export type CareRecord = {
  id: string;
  petId: string;
  caregiverId: string;
  startDate: string;
  endDate: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};
export type SharePayment = { id: string; amountCents: number; paidAt: string; note: string };
export type PetShareSnapshot = {
  pet: Pet;
  caregiver: Caregiver;
  month: ShareMonth;
  careDays: string[];
  records: CareRecord[];
  payments: SharePayment[];
  daysInMonth: number;
  caregiverShareCents: number;
  ownerShareCents: number;
  paidCents: number;
  outstandingCents: number;
};

type CareRecordRow = {
  id: string;
  pet_id: string;
  caregiver_id: string;
  start_date: string;
  end_date: string;
  note: string;
  created_at: string;
  updated_at: string;
};

type ShareMonthRow = {
  pet_id: string;
  caregiver_id: string;
  month_key: string;
  calculation_mode: CalculationMode;
  base_cents: number;
  daily_rate_cents: number;
};

function mapRecord(row: CareRecordRow): CareRecord {
  return {
    id: row.id,
    petId: row.pet_id,
    caregiverId: row.caregiver_id,
    startDate: row.start_date,
    endDate: row.end_date,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function ensureDefaults(db: DbExecutor): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT OR IGNORE INTO pets(id, name, species, created_at) VALUES (?, ?, ?, ?)',
    DEFAULT_PET_ID,
    'Walli',
    'Cão',
    now,
  );
  await db.runAsync(
    'INSERT OR IGNORE INTO caregivers(id, name, created_at) VALUES (?, ?, ?)',
    DEFAULT_CAREGIVER_ID,
    'Nuno',
    now,
  );
}

async function ensureMonth(db: DbExecutor, monthKey: string): Promise<ShareMonthRow> {
  daysInMonthFromKey(monthKey);
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT OR IGNORE INTO pet_share_months(
      pet_id, caregiver_id, month_key, calculation_mode, base_cents, daily_rate_cents, updated_at
    ) VALUES (?, ?, ?, 'proportional', 0, 0, ?)`,
    DEFAULT_PET_ID,
    DEFAULT_CAREGIVER_ID,
    monthKey,
    now,
  );
  const row = await db.getFirstAsync<ShareMonthRow>(
    `SELECT pet_id, caregiver_id, month_key, calculation_mode, base_cents, daily_rate_cents
       FROM pet_share_months WHERE pet_id = ? AND caregiver_id = ? AND month_key = ?`,
    DEFAULT_PET_ID,
    DEFAULT_CAREGIVER_ID,
    monthKey,
  );
  if (!row) throw new Error('Não foi possível preparar a partilha deste mês.');
  return row;
}

export async function loadPetShareSnapshot(monthKey: string): Promise<PetShareSnapshot> {
  const db = await getDatabase();
  await ensureDefaults(db);
  const monthRow = await ensureMonth(db, monthKey);
  const pet = await db.getFirstAsync<Pet>('SELECT id, name, species FROM pets WHERE id = ?', DEFAULT_PET_ID);
  const caregiver = await db.getFirstAsync<Caregiver>('SELECT id, name FROM caregivers WHERE id = ?', DEFAULT_CAREGIVER_ID);
  if (!pet || !caregiver) throw new Error('Configuração do animal indisponível.');

  const careDayRows = await db.getAllAsync<{ date_key: string }>(
    `SELECT date_key FROM pet_care_days
      WHERE pet_id = ? AND caregiver_id = ? AND substr(date_key, 1, 7) = ?
      ORDER BY date_key`,
    DEFAULT_PET_ID,
    DEFAULT_CAREGIVER_ID,
    monthKey,
  );
  const recordRows = await db.getAllAsync<CareRecordRow>(
    `SELECT id, pet_id, caregiver_id, start_date, end_date, note, created_at, updated_at
       FROM pet_care_records
      WHERE pet_id = ? AND caregiver_id = ?
        AND start_date <= ? AND end_date >= ?
      ORDER BY start_date DESC, created_at DESC`,
    DEFAULT_PET_ID,
    DEFAULT_CAREGIVER_ID,
    `${monthKey}-${String(daysInMonthFromKey(monthKey)).padStart(2, '0')}`,
    `${monthKey}-01`,
  );
  const paymentRows = await db.getAllAsync<{ id: string; amount_cents: number; paid_at: string; note: string }>(
    `SELECT id, amount_cents, paid_at, note FROM pet_share_payments
      WHERE pet_id = ? AND caregiver_id = ? AND month_key = ?
      ORDER BY paid_at DESC`,
    DEFAULT_PET_ID,
    DEFAULT_CAREGIVER_ID,
    monthKey,
  );

  const careDays = careDayRows.map(row => row.date_key);
  const daysInMonth = daysInMonthFromKey(monthKey);
  const caregiverShareCents = calculateShareCents({
    baseCents: monthRow.base_cents,
    careDays: careDays.length,
    daysInMonth,
    mode: monthRow.calculation_mode,
    dailyRateCents: monthRow.daily_rate_cents,
  });
  const paidCents = paymentRows.reduce((sum, row) => sum + row.amount_cents, 0);
  return {
    pet,
    caregiver,
    month: {
      petId: monthRow.pet_id,
      caregiverId: monthRow.caregiver_id,
      monthKey: monthRow.month_key,
      calculationMode: monthRow.calculation_mode,
      baseCents: monthRow.base_cents,
      dailyRateCents: monthRow.daily_rate_cents,
    },
    careDays,
    records: recordRows.map(mapRecord),
    payments: paymentRows.map(row => ({ id: row.id, amountCents: row.amount_cents, paidAt: row.paid_at, note: row.note })),
    daysInMonth,
    caregiverShareCents,
    ownerShareCents: ownerShareCents(monthRow.base_cents, caregiverShareCents),
    paidCents,
    outstandingCents: Math.max(0, caregiverShareCents - paidCents),
  };
}

export async function saveMonthSettings(
  monthKey: string,
  values: { calculationMode: CalculationMode; baseCents: number; dailyRateCents: number },
): Promise<void> {
  daysInMonthFromKey(monthKey);
  if (!Number.isSafeInteger(values.baseCents) || values.baseCents < 0) throw new RangeError('Base mensal inválida.');
  if (!Number.isSafeInteger(values.dailyRateCents) || values.dailyRateCents < 0) throw new RangeError('Valor diário inválido.');
  const db = await getDatabase();
  await ensureDefaults(db);
  await ensureMonth(db, monthKey);
  await db.runAsync(
    `UPDATE pet_share_months
        SET calculation_mode = ?, base_cents = ?, daily_rate_cents = ?, updated_at = ?
      WHERE pet_id = ? AND caregiver_id = ? AND month_key = ?`,
    values.calculationMode,
    values.baseCents,
    values.dailyRateCents,
    new Date().toISOString(),
    DEFAULT_PET_ID,
    DEFAULT_CAREGIVER_ID,
    monthKey,
  );
}

async function assertNoOverlap(
  transaction: DbExecutor,
  dateKeys: readonly string[],
  excludingRecordId?: string,
): Promise<void> {
  for (const dateKey of dateKeys) {
    const row = await transaction.getFirstAsync<{ record_id: string }>(
      `SELECT record_id FROM pet_care_days
        WHERE pet_id = ? AND caregiver_id = ? AND date_key = ?
        ${excludingRecordId ? 'AND record_id <> ?' : ''}`,
      ...(excludingRecordId
        ? [DEFAULT_PET_ID, DEFAULT_CAREGIVER_ID, dateKey, excludingRecordId]
        : [DEFAULT_PET_ID, DEFAULT_CAREGIVER_ID, dateKey]),
    );
    if (row) throw new Error(`O dia ${dateKey} já está registado com o Nuno.`);
  }
}

export async function createCareRecord(startDate: string, endDate: string, note: string): Promise<string> {
  const dates = enumerateDateKeysInclusive(startDate, endDate);
  const db = await getDatabase();
  await ensureDefaults(db);
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  await db.withExclusiveTransactionAsync(async transaction => {
    await assertNoOverlap(transaction, dates);
    await transaction.runAsync(
      `INSERT INTO pet_care_records(id, pet_id, caregiver_id, start_date, end_date, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      DEFAULT_PET_ID,
      DEFAULT_CAREGIVER_ID,
      startDate,
      endDate,
      note.trim().slice(0, 500),
      now,
      now,
    );
    for (const dateKey of dates) {
      await transaction.runAsync(
        'INSERT INTO pet_care_days(pet_id, caregiver_id, record_id, date_key) VALUES (?, ?, ?, ?)',
        DEFAULT_PET_ID,
        DEFAULT_CAREGIVER_ID,
        id,
        dateKey,
      );
      await ensureMonth(transaction, monthKeyFromDateKey(dateKey));
    }
  });
  return id;
}

export async function updateCareRecord(recordId: string, startDate: string, endDate: string, note: string): Promise<void> {
  const dates = enumerateDateKeysInclusive(startDate, endDate);
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async transaction => {
    const existing = await transaction.getFirstAsync<{ id: string }>('SELECT id FROM pet_care_records WHERE id = ?', recordId);
    if (!existing) throw new Error('Registo não encontrado.');
    await assertNoOverlap(transaction, dates, recordId);
    await transaction.runAsync(
      `UPDATE pet_care_records SET start_date = ?, end_date = ?, note = ?, updated_at = ? WHERE id = ?`,
      startDate,
      endDate,
      note.trim().slice(0, 500),
      new Date().toISOString(),
      recordId,
    );
    await transaction.runAsync('DELETE FROM pet_care_days WHERE record_id = ?', recordId);
    for (const dateKey of dates) {
      await transaction.runAsync(
        'INSERT INTO pet_care_days(pet_id, caregiver_id, record_id, date_key) VALUES (?, ?, ?, ?)',
        DEFAULT_PET_ID,
        DEFAULT_CAREGIVER_ID,
        recordId,
        dateKey,
      );
      await ensureMonth(transaction, monthKeyFromDateKey(dateKey));
    }
  });
}

export async function deleteCareRecord(recordId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM pet_care_records WHERE id = ?', recordId);
}

export async function markOutstandingAsReceived(monthKey: string): Promise<void> {
  const snapshot = await loadPetShareSnapshot(monthKey);
  if (snapshot.outstandingCents <= 0) return;
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO pet_share_payments(id, pet_id, caregiver_id, month_key, amount_cents, paid_at, note)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    Crypto.randomUUID(),
    DEFAULT_PET_ID,
    DEFAULT_CAREGIVER_ID,
    monthKey,
    snapshot.outstandingCents,
    new Date().toISOString(),
    'Liquidação da partilha mensal',
  );
}

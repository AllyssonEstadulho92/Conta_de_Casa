import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'conta-de-casa-mobile.db';
const DB_KEY_ID = 'cdc-native-db-key-v1';
const SCHEMA_VERSION = 1;

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
}

async function getOrCreateDatabaseKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DB_KEY_ID);
  if (existing) return existing;

  const key = bytesToHex(await Crypto.getRandomBytesAsync(32));
  await SecureStore.setItemAsync(DB_KEY_ID, key, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return key;
}

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = Number(versionRow?.user_version ?? 0);
  if (currentVersion > SCHEMA_VERSION) throw new Error('A base de dados foi criada por uma versão mais recente da aplicação.');

  if (currentVersion < 1) {
    await db.withExclusiveTransactionAsync(async transaction => {
      await transaction.execAsync(`
        CREATE TABLE IF NOT EXISTS pets (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          species TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS caregivers (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS pet_share_months (
          pet_id TEXT NOT NULL,
          caregiver_id TEXT NOT NULL,
          month_key TEXT NOT NULL CHECK(length(month_key) = 7),
          calculation_mode TEXT NOT NULL CHECK(calculation_mode IN ('proportional', 'daily-fixed')),
          base_cents INTEGER NOT NULL CHECK(base_cents >= 0),
          daily_rate_cents INTEGER NOT NULL CHECK(daily_rate_cents >= 0),
          updated_at TEXT NOT NULL,
          PRIMARY KEY (pet_id, caregiver_id, month_key),
          FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
          FOREIGN KEY (caregiver_id) REFERENCES caregivers(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS pet_care_records (
          id TEXT PRIMARY KEY NOT NULL,
          pet_id TEXT NOT NULL,
          caregiver_id TEXT NOT NULL,
          start_date TEXT NOT NULL CHECK(length(start_date) = 10),
          end_date TEXT NOT NULL CHECK(length(end_date) = 10),
          note TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
          FOREIGN KEY (caregiver_id) REFERENCES caregivers(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS pet_care_days (
          pet_id TEXT NOT NULL,
          caregiver_id TEXT NOT NULL,
          record_id TEXT NOT NULL,
          date_key TEXT NOT NULL CHECK(length(date_key) = 10),
          PRIMARY KEY (pet_id, caregiver_id, date_key),
          FOREIGN KEY (record_id) REFERENCES pet_care_records(id) ON DELETE CASCADE,
          FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
          FOREIGN KEY (caregiver_id) REFERENCES caregivers(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS pet_share_payments (
          id TEXT PRIMARY KEY NOT NULL,
          pet_id TEXT NOT NULL,
          caregiver_id TEXT NOT NULL,
          month_key TEXT NOT NULL CHECK(length(month_key) = 7),
          amount_cents INTEGER NOT NULL CHECK(amount_cents > 0),
          paid_at TEXT NOT NULL,
          note TEXT NOT NULL DEFAULT '',
          FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
          FOREIGN KEY (caregiver_id) REFERENCES caregivers(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_pet_care_days_month
          ON pet_care_days(pet_id, caregiver_id, date_key);
        CREATE INDEX IF NOT EXISTS idx_pet_share_payments_month
          ON pet_share_payments(pet_id, caregiver_id, month_key, paid_at);
      `);
      await transaction.execAsync('PRAGMA user_version = 1');
    });
  }
}

async function openEncryptedDatabase(): Promise<SQLite.SQLiteDatabase> {
  const key = await getOrCreateDatabaseKey();
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync(`PRAGMA key = '${key}'`);
  await db.execAsync('PRAGMA foreign_keys = ON');
  await db.execAsync('PRAGMA journal_mode = WAL');
  await migrate(db);
  return db;
}

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  databasePromise ??= openEncryptedDatabase();
  return databasePromise;
}

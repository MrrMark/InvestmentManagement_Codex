import * as SQLite from 'expo-sqlite';

import { localUserId, seedAccounts, seedSnapshots } from '@/data/seed-data';

const databaseName = 'investment-snapshots.db';
const databaseVersion = 1;

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getMobileDb() {
  databasePromise ??= openAndPrepareDatabase();
  return databasePromise;
}

async function openAndPrepareDatabase() {
  const db = await SQLite.openDatabaseAsync(databaseName);
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await migrateDbIfNeeded(db);
  await seedDbIfEmpty(db);
  return db;
}

async function migrateDbIfNeeded(db: SQLite.SQLiteDatabase) {
  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion >= databaseVersion) {
    return;
  }

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      account_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS asset_snapshots (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      snapshot_month TEXT NOT NULL,
      market TEXT NOT NULL,
      asset_category TEXT NOT NULL,
      asset_name TEXT NOT NULL,
      currency TEXT NOT NULL,
      amount_text TEXT NOT NULL,
      return_rate_text TEXT NOT NULL,
      memo TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
      UNIQUE (
        user_id,
        account_id,
        snapshot_month,
        asset_name,
        asset_category,
        currency
      )
    );

    CREATE INDEX IF NOT EXISTS idx_asset_snapshots_snapshot_month
      ON asset_snapshots(snapshot_month);

    CREATE INDEX IF NOT EXISTS idx_asset_snapshots_account_month
      ON asset_snapshots(account_id, snapshot_month);

    PRAGMA user_version = ${databaseVersion};
  `);
}

async function seedDbIfEmpty(db: SQLite.SQLiteDatabase) {
  const user = await db.getFirstAsync<{ id: string }>('SELECT id FROM users LIMIT 1');

  if (user) {
    return;
  }

  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO users (id, name, created_at, updated_at)
       VALUES (?, ?, ?, ?)`,
      localUserId,
      'Personal Investor',
      now,
      now,
    );

    for (const account of seedAccounts) {
      await db.runAsync(
        `INSERT INTO accounts (id, user_id, name, account_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        account.id,
        localUserId,
        account.name,
        account.accountType,
        now,
        now,
      );
    }

    for (const snapshot of seedSnapshots) {
      await db.runAsync(
        `INSERT INTO asset_snapshots (
          id,
          user_id,
          account_id,
          snapshot_month,
          market,
          asset_category,
          asset_name,
          currency,
          amount_text,
          return_rate_text,
          memo,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        snapshot.id,
        localUserId,
        snapshot.accountId,
        snapshot.snapshotMonth,
        snapshot.market,
        snapshot.assetCategory,
        snapshot.assetName,
        snapshot.currency,
        String(snapshot.amount),
        snapshot.returnRate,
        snapshot.memo,
        now,
        now,
      );
    }
  });
}

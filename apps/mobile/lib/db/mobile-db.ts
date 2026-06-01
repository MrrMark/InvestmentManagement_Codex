import * as SQLite from 'expo-sqlite';

import { prepareMobileDatabase } from './mobile-db-core';

const databaseName = 'investment-snapshots.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getMobileDb() {
  databasePromise ??= openAndPrepareDatabase();
  return databasePromise;
}

async function openAndPrepareDatabase() {
  const db = await SQLite.openDatabaseAsync(databaseName);
  await prepareMobileDatabase(db);
  return db;
}

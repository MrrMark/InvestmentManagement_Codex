import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test, { type TestContext } from 'node:test';

import type { CreateSnapshotInput } from '@investment/domain/snapshot';

import { seedAccounts, seedSnapshots } from '../../data/seed-data';

import {
  mobileDatabaseVersion,
  prepareMobileDatabase,
} from './mobile-db-core';
import {
  createSnapshotInDb,
  deleteSnapshotFromDb,
  getSnapshotByIdFromDb,
  importSnapshotsIntoDb,
  listAccountsFromDb,
  listSnapshotsFromDb,
  updateSnapshotInDb,
} from './snapshot-repository';
import type { MobileSqlDatabase, SqlValue } from './sqlite-types';

test('prepareMobileDatabase migrates and seeds an empty database once', async (t) => {
  const db = createTestDatabase(t);

  await prepareMobileDatabase(db);
  await prepareMobileDatabase(db);

  const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const foreignKeys = await db.getFirstAsync<{ foreign_keys: number }>('PRAGMA foreign_keys');
  const counts = await getSeedCounts(db);

  assert.equal(version?.user_version, mobileDatabaseVersion);
  assert.equal(foreignKeys?.foreign_keys, 1);
  assert.deepEqual(counts, {
    users: 1,
    accounts: seedAccounts.length,
    snapshots: seedSnapshots.length,
  });
});

test('snapshot repository supports create, read, update, delete, and duplicate errors', async (t) => {
  const db = createTestDatabase(t);
  await prepareMobileDatabase(db);

  const account = (await listAccountsFromDb(db))[0];
  assert.ok(account);

  const input: CreateSnapshotInput = {
    accountId: account.id,
    snapshotMonth: '2026-04',
    market: 'KR',
    assetCategory: 'ETF',
    assetName: 'Repository CRUD QA',
    currency: 'KRW',
    amount: 12345.67,
    returnRate: 5.68,
    memo: 'created from repository test',
  };

  await createSnapshotInDb(db, input);

  const created = (await listSnapshotsFromDb(db)).find(
    (snapshot) => snapshot.assetName === input.assetName,
  );

  assert.ok(created);
  assert.equal(created.amount, '12345.67');
  assert.equal(created.returnRate, 5.68);
  assert.equal(created.memo, 'created from repository test');

  await updateSnapshotInDb(db, {
    ...input,
    id: created.id,
    amount: 20000,
    returnRate: -1.2,
    memo: '',
  });

  const updated = await getSnapshotByIdFromDb(db, created.id);

  assert.equal(updated?.amount, '20000');
  assert.equal(updated?.returnRate, -1.2);
  assert.equal(updated?.memo, null);

  await assert.rejects(() => createSnapshotInDb(db, input), /같은 계좌, 월, 자산명/);

  await deleteSnapshotFromDb(db, created.id);

  assert.equal(await getSnapshotByIdFromDb(db, created.id), null);
});

test('importSnapshotsIntoDb creates new rows and skips exact duplicates', async (t) => {
  const db = createTestDatabase(t);
  await prepareMobileDatabase(db);

  const existing = seedSnapshots[0];
  assert.ok(existing);

  const result = await importSnapshotsIntoDb(db, [
    {
      accountId: existing.accountId,
      snapshotMonth: existing.snapshotMonth,
      market: existing.market as CreateSnapshotInput['market'],
      assetCategory: existing.assetCategory as CreateSnapshotInput['assetCategory'],
      assetName: existing.assetName,
      currency: existing.currency as CreateSnapshotInput['currency'],
      amount: Number(existing.amount),
      returnRate: Number(existing.returnRate),
      memo: existing.memo ?? '',
    },
    {
      accountId: existing.accountId,
      snapshotMonth: '2026-04',
      market: 'US',
      assetCategory: 'STOCK',
      assetName: 'CSV Native Smoke QA',
      currency: 'USD',
      amount: 9876.54,
      returnRate: -3.21,
      memo: 'new import row',
    },
  ]);

  const imported = (await listSnapshotsFromDb(db)).filter(
    (snapshot) => snapshot.assetName === 'CSV Native Smoke QA',
  );

  assert.deepEqual(result, { createdCount: 1, skippedDuplicateCount: 1 });
  assert.equal(imported.length, 1);
  assert.equal(imported[0]?.amount, '9876.54');
  assert.equal(imported[0]?.returnRate, -3.21);
});

async function getSeedCounts(db: MobileSqlDatabase) {
  return db.getFirstAsync<{
    users: number;
    accounts: number;
    snapshots: number;
  }>(
    `SELECT
       (SELECT COUNT(*) FROM users) AS users,
       (SELECT COUNT(*) FROM accounts) AS accounts,
       (SELECT COUNT(*) FROM asset_snapshots) AS snapshots`,
  );
}

function createTestDatabase(t: TestContext) {
  const directory = mkdtempSync(join(tmpdir(), 'investment-mobile-db-'));
  const db = new SqliteCliDatabase(join(directory, 'test.db'));

  t.after(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  return db;
}

class SqliteCliDatabase implements MobileSqlDatabase {
  constructor(private readonly databasePath: string) {}

  async execAsync(source: string) {
    runSqlite(this.databasePath, source);
  }

  async getFirstAsync<T>(source: string, ...params: SqlValue[]) {
    const rows = await this.getAllAsync<T>(source, ...params);

    return rows[0] ?? null;
  }

  async getAllAsync<T>(source: string, ...params: SqlValue[]) {
    const output = runSqlite(
      this.databasePath,
      `.mode json\n${terminateSql(bindSqlParams(source, params))}`,
    );

    return parseJsonRows<T>(output);
  }

  async runAsync(source: string, ...params: SqlValue[]) {
    const output = runSqlite(
      this.databasePath,
      `.mode json\n${terminateSql(bindSqlParams(source, params))}\nSELECT changes() AS changes;`,
    );
    const rows = parseJsonRows<{ changes: number }>(output);

    return { changes: rows[0]?.changes ?? 0 };
  }

  async withTransactionAsync(task: () => Promise<void>) {
    await task();
  }
}

function runSqlite(databasePath: string, input: string) {
  try {
    return execFileSync('/usr/bin/sqlite3', [databasePath], {
      encoding: 'utf8',
      input: `.bail on\nPRAGMA foreign_keys = ON;\n${input}`,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (error) {
    throw new Error(getSqliteErrorMessage(error));
  }
}

function bindSqlParams(source: string, params: readonly SqlValue[]) {
  let paramIndex = 0;
  const boundSql = source.replace(/\?/g, () => {
    const value = params[paramIndex];
    paramIndex += 1;

    return toSqlLiteral(value);
  });

  if (paramIndex !== params.length) {
    throw new Error('SQL parameter count does not match placeholder count.');
  }

  return boundSql;
}

function toSqlLiteral(value: SqlValue | undefined) {
  if (value === null) {
    return 'NULL';
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('SQL number parameter must be finite.');
    }

    return String(value);
  }

  if (typeof value === 'string') {
    return `'${value.replaceAll("'", "''")}'`;
  }

  throw new Error('SQL parameter is missing.');
}

function terminateSql(source: string) {
  const trimmed = source.trim();

  return trimmed.endsWith(';') ? trimmed : `${trimmed};`;
}

function parseJsonRows<T>(output: string) {
  const trimmed = output.trim();

  if (!trimmed) {
    return [];
  }

  return JSON.parse(trimmed) as T[];
}

function getSqliteErrorMessage(error: unknown) {
  if (error instanceof Error && 'stderr' in error) {
    const stderr = (error as Error & { stderr?: Buffer | string }).stderr;
    const message = stderr ? String(stderr).trim() : error.message;

    return message || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'sqlite3 command failed.';
}

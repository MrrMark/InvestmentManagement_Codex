import type { AggregationSnapshot } from '@investment/domain/aggregation';
import type {
  accountTypes,
  assetCategories,
  currencies,
  markets,
  CreateSnapshotInput,
  UpdateSnapshotInput,
} from '@investment/domain/snapshot';

import { localUserId } from '@/data/seed-data';
import { getMobileDb } from '@/lib/db/mobile-db';

export type MobileAccount = {
  id: string;
  name: string;
  accountType: (typeof accountTypes)[number];
};

export type MobileSnapshot = AggregationSnapshot & {
  id: string;
  accountId: string;
  returnRate: number;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
};

const duplicateSnapshotMessage =
  '같은 계좌, 월, 자산명, 자산 분류, 통화의 스냅샷이 이미 있습니다. 기존 행을 수정하거나 다른 값으로 입력해 주세요.';

type AccountRow = {
  id: string;
  name: string;
  account_type: (typeof accountTypes)[number];
};

type SnapshotRow = {
  id: string;
  account_id: string;
  snapshot_month: string;
  market: (typeof markets)[number];
  asset_category: (typeof assetCategories)[number];
  asset_name: string;
  currency: (typeof currencies)[number];
  amount_text: string;
  return_rate_text: string;
  memo: string | null;
  created_at: string;
  updated_at: string;
  account_name: string;
};

export async function listAccounts(): Promise<MobileAccount[]> {
  const db = await getMobileDb();
  const rows = await db.getAllAsync<AccountRow>(
    `SELECT id, name, account_type
     FROM accounts
     ORDER BY name ASC`,
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    accountType: row.account_type,
  }));
}

export async function listSnapshots(): Promise<MobileSnapshot[]> {
  const db = await getMobileDb();
  const rows = await db.getAllAsync<SnapshotRow>(
    `SELECT
       asset_snapshots.id,
       asset_snapshots.account_id,
       asset_snapshots.snapshot_month,
       asset_snapshots.market,
       asset_snapshots.asset_category,
       asset_snapshots.asset_name,
       asset_snapshots.currency,
       asset_snapshots.amount_text,
       asset_snapshots.return_rate_text,
       asset_snapshots.memo,
       asset_snapshots.created_at,
       asset_snapshots.updated_at,
       accounts.name AS account_name
     FROM asset_snapshots
     INNER JOIN accounts ON accounts.id = asset_snapshots.account_id
     ORDER BY asset_snapshots.snapshot_month DESC, CAST(asset_snapshots.amount_text AS REAL) DESC`,
  );

  return rows.map(toMobileSnapshot);
}

export async function getSnapshotById(id: string): Promise<MobileSnapshot | null> {
  const db = await getMobileDb();
  const row = await db.getFirstAsync<SnapshotRow>(
    `SELECT
       asset_snapshots.id,
       asset_snapshots.account_id,
       asset_snapshots.snapshot_month,
       asset_snapshots.market,
       asset_snapshots.asset_category,
       asset_snapshots.asset_name,
       asset_snapshots.currency,
       asset_snapshots.amount_text,
       asset_snapshots.return_rate_text,
       asset_snapshots.memo,
       asset_snapshots.created_at,
       asset_snapshots.updated_at,
       accounts.name AS account_name
     FROM asset_snapshots
     INNER JOIN accounts ON accounts.id = asset_snapshots.account_id
     WHERE asset_snapshots.id = ?
     LIMIT 1`,
    id,
  );

  return row ? toMobileSnapshot(row) : null;
}

export async function createSnapshot(input: CreateSnapshotInput) {
  const db = await getMobileDb();
  const now = new Date().toISOString();

  try {
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
      createId(),
      localUserId,
      input.accountId,
      input.snapshotMonth,
      input.market,
      input.assetCategory,
      input.assetName,
      input.currency,
      String(input.amount),
      input.returnRate.toFixed(2),
      input.memo || null,
      now,
      now,
    );
  } catch (caughtError) {
    throw toSnapshotStorageError(caughtError);
  }
}

export async function importSnapshots(inputs: readonly CreateSnapshotInput[]) {
  const db = await getMobileDb();
  const now = new Date().toISOString();
  let createdCount = 0;
  let skippedDuplicateCount = 0;

  await db.withTransactionAsync(async () => {
    for (const input of inputs) {
      const result = await db.runAsync(
        `INSERT OR IGNORE INTO asset_snapshots (
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
        createId(),
        localUserId,
        input.accountId,
        input.snapshotMonth,
        input.market,
        input.assetCategory,
        input.assetName,
        input.currency,
        String(input.amount),
        input.returnRate.toFixed(2),
        input.memo || null,
        now,
        now,
      );

      if (result.changes > 0) {
        createdCount += 1;
      } else {
        skippedDuplicateCount += 1;
      }
    }
  });

  return { createdCount, skippedDuplicateCount };
}

export async function updateSnapshot(input: UpdateSnapshotInput) {
  const db = await getMobileDb();
  const now = new Date().toISOString();

  try {
    await db.runAsync(
      `UPDATE asset_snapshots
     SET account_id = ?,
         snapshot_month = ?,
         market = ?,
         asset_category = ?,
         asset_name = ?,
         currency = ?,
         amount_text = ?,
         return_rate_text = ?,
         memo = ?,
         updated_at = ?
     WHERE id = ?`,
      input.accountId,
      input.snapshotMonth,
      input.market,
      input.assetCategory,
      input.assetName,
      input.currency,
      String(input.amount),
      input.returnRate.toFixed(2),
      input.memo || null,
      now,
      input.id,
    );
  } catch (caughtError) {
    throw toSnapshotStorageError(caughtError);
  }
}

export async function deleteSnapshot(id: string) {
  const db = await getMobileDb();
  await db.runAsync('DELETE FROM asset_snapshots WHERE id = ?', id);
}

function toMobileSnapshot(row: SnapshotRow): MobileSnapshot {
  return {
    id: row.id,
    accountId: row.account_id,
    snapshotMonth: row.snapshot_month,
    accountName: row.account_name,
    market: row.market,
    assetCategory: row.asset_category,
    assetName: row.asset_name,
    currency: row.currency,
    amount: row.amount_text,
    returnRate: Number(row.return_rate_text),
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `snapshot-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toSnapshotStorageError(error: unknown) {
  if (isDuplicateSnapshotError(error)) {
    return new Error(duplicateSnapshotMessage);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('스냅샷 저장에 실패했습니다.');
}

function isDuplicateSnapshotError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes('UNIQUE constraint failed') &&
    error.message.includes('asset_snapshots')
  );
}

import type {
  CreateSnapshotInput,
  UpdateSnapshotInput,
} from '@investment/domain/snapshot';

import { getMobileDb } from '@/lib/db/mobile-db';
import {
  createSnapshotInDb,
  deleteSnapshotFromDb,
  getSnapshotByIdFromDb,
  importSnapshotsIntoDb,
  listAccountsFromDb,
  listSnapshotsFromDb,
  type MobileAccount,
  type MobileSnapshot,
  updateSnapshotInDb,
} from '@/lib/db/snapshot-repository';

export type { MobileAccount, MobileSnapshot } from '@/lib/db/snapshot-repository';

export async function listAccounts(): Promise<MobileAccount[]> {
  const db = await getMobileDb();
  return listAccountsFromDb(db);
}

export async function listSnapshots(): Promise<MobileSnapshot[]> {
  const db = await getMobileDb();
  return listSnapshotsFromDb(db);
}

export async function getSnapshotById(id: string): Promise<MobileSnapshot | null> {
  const db = await getMobileDb();
  return getSnapshotByIdFromDb(db, id);
}

export async function createSnapshot(input: CreateSnapshotInput) {
  const db = await getMobileDb();
  return createSnapshotInDb(db, input);
}

export async function importSnapshots(inputs: readonly CreateSnapshotInput[]) {
  const db = await getMobileDb();
  return importSnapshotsIntoDb(db, inputs);
}

export async function updateSnapshot(input: UpdateSnapshotInput) {
  const db = await getMobileDb();
  return updateSnapshotInDb(db, input);
}

export async function deleteSnapshot(id: string) {
  const db = await getMobileDb();
  return deleteSnapshotFromDb(db, id);
}

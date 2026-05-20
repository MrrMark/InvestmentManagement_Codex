import {
  buildSnapshotCsvImportPreview,
  type SnapshotCsvImportPreviewRow,
} from '@investment/domain/csv';
import {
  type CreateSnapshotInput,
  type ImportSnapshotCsvRowInput,
} from '@investment/domain/snapshot';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

import type { MobileAccount } from '@/lib/db/snapshots';

export type SnapshotCsvPreview = {
  fileName: string;
  rows: SnapshotCsvImportPreviewRow[];
  validRows: ImportSnapshotCsvRowInput[];
};

const acceptedCsvTypes = [
  'text/csv',
  'text/comma-separated-values',
  'application/csv',
  'text/plain',
];

export async function pickSnapshotCsvPreview(
  accounts: readonly MobileAccount[],
): Promise<SnapshotCsvPreview | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: acceptedCsvTypes,
    copyToCacheDirectory: true,
    multiple: false,
    base64: false,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];

  if (!asset) {
    return null;
  }

  const text = asset.file
    ? await asset.file.text()
    : await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

  return buildSnapshotCsvPreview(asset.name, text, accounts);
}

export function buildSnapshotCsvPreview(
  fileName: string,
  text: string,
  accounts: readonly MobileAccount[],
): SnapshotCsvPreview {
  const preview = buildSnapshotCsvImportPreview({
    text,
    locale: 'ko',
    accountNames: accounts.map((account) => account.name),
    unknownAccountPrefix: '알 수 없는 계좌: ',
  });

  return {
    fileName,
    ...preview,
  };
}

export function toCreateSnapshotInputs(
  rows: readonly ImportSnapshotCsvRowInput[],
  accounts: readonly MobileAccount[],
): CreateSnapshotInput[] {
  const accountsByName = new Map(accounts.map((account) => [account.name, account]));

  return rows.flatMap((row) => {
    const account = accountsByName.get(row.accountName);

    if (!account) {
      return [];
    }

    return [
      {
        accountId: account.id,
        snapshotMonth: row.snapshotMonth,
        market: row.market,
        assetCategory: row.assetCategory,
        assetName: row.assetName,
        currency: row.currency,
        amount: row.amount,
        returnRate: row.returnRate,
        memo: row.memo,
      },
    ];
  });
}

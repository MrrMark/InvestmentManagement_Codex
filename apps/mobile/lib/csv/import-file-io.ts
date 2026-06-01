import { buildSnapshotCsvImportPreview } from '@investment/domain/csv';
import type { SnapshotCsvImportPreviewRow } from '@investment/domain/csv';
import type {
  CreateSnapshotInput,
  ImportSnapshotCsvRowInput,
} from '@investment/domain/snapshot';

import type { MobileAccount } from '../db/snapshots';

export type SnapshotCsvPreview = {
  fileName: string;
  errors: string[];
  rows: SnapshotCsvImportPreviewRow[];
  validRows: ImportSnapshotCsvRowInput[];
};

export type SnapshotCsvDocumentAsset = {
  name: string;
  uri: string;
  file?: {
    text(): Promise<string>;
  };
};

export type SnapshotCsvDocumentReader = {
  readAsStringAsync(uri: string): Promise<string>;
};

export async function buildSnapshotCsvPreviewFromDocument(
  asset: SnapshotCsvDocumentAsset,
  accounts: readonly MobileAccount[],
  reader: SnapshotCsvDocumentReader,
) {
  const text = asset.file ? await asset.file.text() : await reader.readAsStringAsync(asset.uri);

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

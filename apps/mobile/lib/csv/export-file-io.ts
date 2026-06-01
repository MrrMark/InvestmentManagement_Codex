import { serializeSnapshotCsvRows } from '@investment/domain/csv';

import type { MobileSnapshot } from '../db/snapshots';

const csvMimeType = 'text/csv';
const csvUti = 'public.comma-separated-values-text';

export type SnapshotCsvExportPayload = {
  fileName: string;
  csvText: string;
};

export type NativeSnapshotCsvExportDependencies<Encoding> = {
  cacheDirectory: string | null;
  documentDirectory: string | null;
  writeAsStringAsync(uri: string, text: string, options: { encoding: Encoding }): Promise<void>;
  isSharingAvailableAsync(): Promise<boolean>;
  shareAsync(
    uri: string,
    options: {
      dialogTitle: string;
      mimeType: string;
      UTI: string;
    },
  ): Promise<void>;
  encodingUtf8: Encoding;
};

export function buildSnapshotCsvExportPayload(
  snapshots: readonly MobileSnapshot[],
  now = new Date(),
): SnapshotCsvExportPayload {
  if (snapshots.length === 0) {
    throw new Error('내보낼 스냅샷이 없습니다.');
  }

  const fileName = `snapshots-${formatFileNameDate(now)}.csv`;
  const csvText = `\uFEFF${serializeSnapshotCsvRows(
    snapshots.map((snapshot) => ({
      accountName: snapshot.accountName,
      snapshotMonth: snapshot.snapshotMonth,
      market: snapshot.market,
      assetCategory: snapshot.assetCategory,
      assetName: snapshot.assetName,
      currency: snapshot.currency,
      amount: String(snapshot.amount),
      returnRate: snapshot.returnRate.toFixed(2),
      memo: snapshot.memo,
    })),
  )}`;

  return { fileName, csvText };
}

export async function shareNativeSnapshotCsvExport<Encoding>(
  payload: SnapshotCsvExportPayload,
  dependencies: NativeSnapshotCsvExportDependencies<Encoding>,
) {
  const directory = dependencies.cacheDirectory ?? dependencies.documentDirectory;

  if (!directory) {
    throw new Error('CSV 파일을 저장할 위치를 찾지 못했습니다.');
  }

  const fileUri = `${directory}${payload.fileName}`;
  await dependencies.writeAsStringAsync(fileUri, payload.csvText, {
    encoding: dependencies.encodingUtf8,
  });

  if (!(await dependencies.isSharingAvailableAsync())) {
    throw new Error('이 기기에서는 공유 기능을 사용할 수 없습니다.');
  }

  await dependencies.shareAsync(fileUri, {
    dialogTitle: 'CSV 내보내기',
    mimeType: csvMimeType,
    UTI: csvUti,
  });
}

function formatFileNameDate(date: Date) {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');

  return `${yyyy}${mm}${dd}-${hh}${min}`;
}

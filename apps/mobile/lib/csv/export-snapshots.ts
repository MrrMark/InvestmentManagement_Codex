import { serializeSnapshotCsvRows } from '@investment/domain/csv';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import type { MobileSnapshot } from '@/lib/db/snapshots';

const csvMimeType = 'text/csv';
const csvUti = 'public.comma-separated-values-text';

export async function exportSnapshotsToCsv(snapshots: readonly MobileSnapshot[]) {
  if (snapshots.length === 0) {
    throw new Error('내보낼 스냅샷이 없습니다.');
  }

  const fileName = `snapshots-${formatFileNameDate(new Date())}.csv`;
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

  if (Platform.OS === 'web') {
    downloadCsvOnWeb(fileName, csvText);
    return fileName;
  }

  const directory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;

  if (!directory) {
    throw new Error('CSV 파일을 저장할 위치를 찾지 못했습니다.');
  }

  const fileUri = `${directory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, csvText, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('이 기기에서는 공유 기능을 사용할 수 없습니다.');
  }

  await Sharing.shareAsync(fileUri, {
    dialogTitle: 'CSV 내보내기',
    mimeType: csvMimeType,
    UTI: csvUti,
  });

  return fileName;
}

function formatFileNameDate(date: Date) {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');

  return `${yyyy}${mm}${dd}-${hh}${min}`;
}

function downloadCsvOnWeb(fileName: string, csvText: string) {
  if (typeof document === 'undefined') {
    throw new Error('CSV 다운로드를 시작할 수 없습니다.');
  }

  const blob = new Blob([csvText], { type: `${csvMimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

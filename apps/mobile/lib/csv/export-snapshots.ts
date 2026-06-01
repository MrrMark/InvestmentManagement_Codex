import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import type { MobileSnapshot } from '@/lib/db/snapshots';
import {
  buildSnapshotCsvExportPayload,
  shareNativeSnapshotCsvExport,
} from './export-file-io';

export async function exportSnapshotsToCsv(snapshots: readonly MobileSnapshot[]) {
  const payload = buildSnapshotCsvExportPayload(snapshots);

  if (Platform.OS === 'web') {
    downloadCsvOnWeb(payload.fileName, payload.csvText);
    return payload.fileName;
  }

  await shareNativeSnapshotCsvExport(payload, {
    cacheDirectory: FileSystem.cacheDirectory,
    documentDirectory: FileSystem.documentDirectory,
    writeAsStringAsync: FileSystem.writeAsStringAsync,
    isSharingAvailableAsync: Sharing.isAvailableAsync,
    shareAsync: Sharing.shareAsync,
    encodingUtf8: FileSystem.EncodingType.UTF8,
  });

  return payload.fileName;
}

function downloadCsvOnWeb(fileName: string, csvText: string) {
  if (typeof document === 'undefined') {
    throw new Error('CSV 다운로드를 시작할 수 없습니다.');
  }

  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
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

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

import type { MobileAccount } from '@/lib/db/snapshots';
import {
  buildSnapshotCsvPreviewFromDocument,
  type SnapshotCsvPreview,
} from './import-file-io';

export { buildSnapshotCsvPreview, toCreateSnapshotInputs } from './import-file-io';
export type { SnapshotCsvPreview } from './import-file-io';

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

  return buildSnapshotCsvPreviewFromDocument(asset, accounts, {
    readAsStringAsync: (uri) =>
      FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8,
      }),
  });
}

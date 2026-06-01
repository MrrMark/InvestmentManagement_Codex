import assert from 'node:assert/strict';
import test from 'node:test';

import type { MobileSnapshot } from '../db/snapshots';
import {
  buildSnapshotCsvExportPayload,
  shareNativeSnapshotCsvExport,
} from './export-file-io';

const snapshots: MobileSnapshot[] = [
  {
    id: 'snapshot-1',
    accountId: 'account-cma',
    snapshotMonth: '2026-04',
    accountName: 'CMA',
    market: 'KR',
    assetCategory: 'ETF',
    assetName: 'NATIVE_EXPORT_SMOKE_KR',
    currency: 'KRW',
    amount: '123456',
    returnRate: 1.23,
    memo: 'native export smoke',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
];

test('buildSnapshotCsvExportPayload creates stable CSV text and file names', () => {
  const payload = buildSnapshotCsvExportPayload(snapshots, new Date('2026-06-01T14:44:00'));

  assert.equal(payload.fileName, 'snapshots-20260601-1444.csv');
  assert.ok(payload.csvText.startsWith('\uFEFFaccountName,snapshotMonth'));
  assert.match(payload.csvText, /NATIVE_EXPORT_SMOKE_KR/);
  assert.match(payload.csvText, /1\.23/);
});

test('buildSnapshotCsvExportPayload rejects empty exports', () => {
  assert.throws(() => buildSnapshotCsvExportPayload([]), /내보낼 스냅샷이 없습니다/);
});

test('shareNativeSnapshotCsvExport writes CSV and opens the native share sheet', async () => {
  const writes: { uri: string; text: string; encoding: string }[] = [];
  const shares: { uri: string; mimeType: string; UTI: string }[] = [];

  await shareNativeSnapshotCsvExport(
    {
      fileName: 'snapshots-20260601-1444.csv',
      csvText: 'csv body',
    },
    {
      cacheDirectory: 'file:///cache/',
      documentDirectory: null,
      async writeAsStringAsync(uri, text, options) {
        writes.push({ uri, text, encoding: options.encoding });
      },
      async isSharingAvailableAsync() {
        return true;
      },
      async shareAsync(uri, options) {
        shares.push({ uri, mimeType: options.mimeType, UTI: options.UTI });
      },
      encodingUtf8: 'utf8',
    },
  );

  assert.deepEqual(writes, [
    {
      uri: 'file:///cache/snapshots-20260601-1444.csv',
      text: 'csv body',
      encoding: 'utf8',
    },
  ]);
  assert.deepEqual(shares, [
    {
      uri: 'file:///cache/snapshots-20260601-1444.csv',
      mimeType: 'text/csv',
      UTI: 'public.comma-separated-values-text',
    },
  ]);
});

test('shareNativeSnapshotCsvExport reports unavailable storage or sharing', async () => {
  await assert.rejects(
    () =>
      shareNativeSnapshotCsvExport(
        { fileName: 'snapshots.csv', csvText: 'csv body' },
        {
          cacheDirectory: null,
          documentDirectory: null,
          async writeAsStringAsync() {},
          async isSharingAvailableAsync() {
            return true;
          },
          async shareAsync() {},
          encodingUtf8: 'utf8',
        },
      ),
    /CSV 파일을 저장할 위치/,
  );

  await assert.rejects(
    () =>
      shareNativeSnapshotCsvExport(
        { fileName: 'snapshots.csv', csvText: 'csv body' },
        {
          cacheDirectory: 'file:///cache/',
          documentDirectory: null,
          async writeAsStringAsync() {},
          async isSharingAvailableAsync() {
            return false;
          },
          async shareAsync() {},
          encodingUtf8: 'utf8',
        },
      ),
    /공유 기능을 사용할 수 없습니다/,
  );
});

import assert from 'node:assert/strict';
import test from 'node:test';

import type { MobileAccount } from '../db/snapshots';
import {
  buildSnapshotCsvPreviewFromDocument,
  toCreateSnapshotInputs,
} from './import-file-io';

const accounts: MobileAccount[] = [
  { id: 'account-cma', name: 'CMA', accountType: 'CMA' },
  { id: 'account-irp', name: 'IRP', accountType: 'IRP' },
];

const csvText = [
  'accountName,snapshotMonth,market,assetCategory,assetName,currency,amount,returnRate,memo',
  'CMA,2026-04,KR,ETF,NATIVE_IMPORT_SMOKE_KR,KRW,123456,1.23,native import smoke',
  'IRP,2026-04,US,STOCK,NATIVE_IMPORT_SMOKE_US,USD,789.01,-2.34,native import smoke',
].join('\n');

test('buildSnapshotCsvPreviewFromDocument reads web File text assets', async () => {
  const preview = await buildSnapshotCsvPreviewFromDocument(
    {
      name: 'web-file.csv',
      uri: 'file://unused.csv',
      file: {
        async text() {
          return csvText;
        },
      },
    },
    accounts,
    {
      async readAsStringAsync() {
        throw new Error('uri reader should not run when asset.file exists');
      },
    },
  );

  assert.equal(preview.fileName, 'web-file.csv');
  assert.equal(preview.errors.length, 0);
  assert.equal(preview.validRows.length, 2);
});

test('buildSnapshotCsvPreviewFromDocument falls back to native URI reader', async () => {
  const preview = await buildSnapshotCsvPreviewFromDocument(
    {
      name: 'native-uri.csv',
      uri: 'file:///tmp/native-uri.csv',
    },
    accounts,
    {
      async readAsStringAsync(uri) {
        assert.equal(uri, 'file:///tmp/native-uri.csv');
        return csvText;
      },
    },
  );

  assert.equal(preview.fileName, 'native-uri.csv');
  assert.equal(preview.validRows[0]?.assetName, 'NATIVE_IMPORT_SMOKE_KR');
});

test('toCreateSnapshotInputs maps valid CSV rows to account ids', async () => {
  const preview = await buildSnapshotCsvPreviewFromDocument(
    {
      name: 'native-uri.csv',
      uri: 'file:///tmp/native-uri.csv',
    },
    accounts,
    {
      async readAsStringAsync() {
        return csvText;
      },
    },
  );

  assert.deepEqual(toCreateSnapshotInputs(preview.validRows, accounts), [
    {
      accountId: 'account-cma',
      snapshotMonth: '2026-04',
      market: 'KR',
      assetCategory: 'ETF',
      assetName: 'NATIVE_IMPORT_SMOKE_KR',
      currency: 'KRW',
      amount: 123456,
      returnRate: 1.23,
      memo: 'native import smoke',
    },
    {
      accountId: 'account-irp',
      snapshotMonth: '2026-04',
      market: 'US',
      assetCategory: 'STOCK',
      assetName: 'NATIVE_IMPORT_SMOKE_US',
      currency: 'USD',
      amount: 789.01,
      returnRate: -2.34,
      memo: 'native import smoke',
    },
  ]);
});

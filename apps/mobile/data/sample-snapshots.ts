import type { AggregationSnapshot } from '@investment/domain/aggregation';

export const selectedSampleMonth = '2026-03';

export const sampleSnapshots: AggregationSnapshot[] = [
  {
    snapshotMonth: '2026-03',
    accountName: 'CMA',
    market: 'KR',
    assetCategory: 'ETF',
    assetName: 'KODEX 200',
    currency: 'KRW',
    amount: 1500000,
  },
  {
    snapshotMonth: '2026-03',
    accountName: 'PENSION_SAVINGS',
    market: 'US',
    assetCategory: 'ETF',
    assetName: 'VOO',
    currency: 'USD',
    amount: 4200,
  },
  {
    snapshotMonth: '2026-03',
    accountName: 'IRP',
    market: 'KR',
    assetCategory: 'TDF',
    assetName: 'TDF 2045',
    currency: 'KRW',
    amount: 920000,
  },
  {
    snapshotMonth: '2026-02',
    accountName: 'CMA',
    market: 'KR',
    assetCategory: 'ETF',
    assetName: 'KODEX 200',
    currency: 'KRW',
    amount: 1400000,
  },
  {
    snapshotMonth: '2026-02',
    accountName: 'PENSION_SAVINGS',
    market: 'US',
    assetCategory: 'ETF',
    assetName: 'VOO',
    currency: 'USD',
    amount: 4000,
  },
];

export function formatAmount(amount: number, currency: string) {
  return `${amount.toLocaleString()} ${currency}`;
}

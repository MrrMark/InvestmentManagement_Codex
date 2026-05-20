import type { AggregationSnapshot } from '@investment/domain/aggregation';
import type { accountTypes } from '@investment/domain/snapshot';

export const localUserId = 'local-user';
export const defaultSnapshotMonth = '2026-03';

export type SeedAccount = {
  id: string;
  name: string;
  accountType: (typeof accountTypes)[number];
};

export type SeedSnapshot = AggregationSnapshot & {
  id: string;
  accountId: string;
  returnRate: string;
  memo: string | null;
};

export const seedAccounts: SeedAccount[] = [
  { id: 'account-cma', name: 'CMA', accountType: 'CMA' },
  {
    id: 'account-pension-savings',
    name: 'PENSION_SAVINGS',
    accountType: 'PENSION_SAVINGS',
  },
  { id: 'account-irp', name: 'IRP', accountType: 'IRP' },
];

export const seedSnapshots: SeedSnapshot[] = [
  {
    id: 'snapshot-2026-03-kodex-200',
    accountId: 'account-cma',
    snapshotMonth: '2026-03',
    accountName: 'CMA',
    market: 'KR',
    assetCategory: 'ETF',
    assetName: 'KODEX 200',
    currency: 'KRW',
    amount: 1500000,
    returnRate: '4.25',
    memo: '초기 샘플',
  },
  {
    id: 'snapshot-2026-03-voo',
    accountId: 'account-pension-savings',
    snapshotMonth: '2026-03',
    accountName: 'PENSION_SAVINGS',
    market: 'US',
    assetCategory: 'ETF',
    assetName: 'VOO',
    currency: 'USD',
    amount: 4200,
    returnRate: '7.10',
    memo: null,
  },
  {
    id: 'snapshot-2026-03-tdf',
    accountId: 'account-irp',
    snapshotMonth: '2026-03',
    accountName: 'IRP',
    market: 'KR',
    assetCategory: 'TDF',
    assetName: 'TDF 2045',
    currency: 'KRW',
    amount: 920000,
    returnRate: '1.40',
    memo: null,
  },
  {
    id: 'snapshot-2026-02-kodex-200',
    accountId: 'account-cma',
    snapshotMonth: '2026-02',
    accountName: 'CMA',
    market: 'KR',
    assetCategory: 'ETF',
    assetName: 'KODEX 200',
    currency: 'KRW',
    amount: 1400000,
    returnRate: '3.80',
    memo: null,
  },
  {
    id: 'snapshot-2026-02-voo',
    accountId: 'account-pension-savings',
    snapshotMonth: '2026-02',
    accountName: 'PENSION_SAVINGS',
    market: 'US',
    assetCategory: 'ETF',
    assetName: 'VOO',
    currency: 'USD',
    amount: 4000,
    returnRate: '6.60',
    memo: null,
  },
];

export function formatAmount(amount: number, currency: string) {
  return `${amount.toLocaleString()} ${currency}`;
}

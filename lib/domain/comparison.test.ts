import test from "node:test";
import assert from "node:assert/strict";
import {
  compareMonthOverMonth,
  getAvailableSnapshotMonths,
  getPreviousSnapshotMonth,
} from "@/lib/domain/comparison";
import type { AggregationSnapshot } from "@/lib/domain/aggregation";

const snapshots: AggregationSnapshot[] = [
  {
    snapshotMonth: "2026-03",
    accountName: "CMA",
    market: "KR",
    assetCategory: "ETF",
    assetName: "KODEX 200",
    currency: "KRW",
    amount: 1600000,
  },
  {
    snapshotMonth: "2026-03",
    accountName: "IRP",
    market: "US",
    assetCategory: "ETF",
    assetName: "VTI",
    currency: "USD",
    amount: 5100,
  },
  {
    snapshotMonth: "2026-02",
    accountName: "CMA",
    market: "KR",
    assetCategory: "ETF",
    assetName: "KODEX 200",
    currency: "KRW",
    amount: 1500000,
  },
  {
    snapshotMonth: "2026-02",
    accountName: "CMA",
    market: "KR",
    assetCategory: "BOND",
    assetName: "Korea Bond",
    currency: "KRW",
    amount: 500000,
  },
  {
    snapshotMonth: "2026-02",
    accountName: "IRP",
    market: "US",
    assetCategory: "ETF",
    assetName: "VTI",
    currency: "USD",
    amount: 4200,
  },
  {
    snapshotMonth: "2026-01",
    accountName: "CMA",
    market: "KR",
    assetCategory: "ETF",
    assetName: "KODEX 200",
    currency: "KRW",
    amount: 1400000,
  },
];

test("getAvailableSnapshotMonths returns unique months in descending order", () => {
  assert.deepEqual(getAvailableSnapshotMonths(snapshots), [
    "2026-03",
    "2026-02",
    "2026-01",
  ]);
});

test("getPreviousSnapshotMonth returns the closest earlier month", () => {
  assert.equal(getPreviousSnapshotMonth(snapshots, "2026-03"), "2026-02");
  assert.equal(getPreviousSnapshotMonth(snapshots, "2026-02"), "2026-01");
  assert.equal(getPreviousSnapshotMonth(snapshots, "2026-01"), null);
});

test("compareMonthOverMonth calculates deltas by total/account/market/category", () => {
  const result = compareMonthOverMonth(snapshots, "2026-03");

  assert.equal(result.previousMonth, "2026-02");
  assert.equal(result.hasPreviousMonth, true);
  assert.deepEqual(result.totalDelta, [
    { currency: "KRW", deltaAmount: -400000 },
    { currency: "USD", deltaAmount: 900 },
  ]);
  assert.deepEqual(result.deltaByAccount, [
    {
      label: "CMA",
      deltas: [{ currency: "KRW", deltaAmount: -400000 }],
    },
    {
      label: "IRP",
      deltas: [{ currency: "USD", deltaAmount: 900 }],
    },
  ]);
  assert.deepEqual(result.deltaByMarket, [
    {
      label: "KR",
      deltas: [{ currency: "KRW", deltaAmount: -400000 }],
    },
    {
      label: "US",
      deltas: [{ currency: "USD", deltaAmount: 900 }],
    },
  ]);
  assert.deepEqual(result.deltaByCategory, [
    {
      label: "BOND",
      deltas: [{ currency: "KRW", deltaAmount: -500000 }],
    },
    {
      label: "ETF",
      deltas: [
        { currency: "KRW", deltaAmount: 100000 },
        { currency: "USD", deltaAmount: 900 },
      ],
    },
  ]);
});

test("compareMonthOverMonth handles missing previous month gracefully", () => {
  const result = compareMonthOverMonth(snapshots, "2026-01");

  assert.equal(result.previousMonth, null);
  assert.equal(result.hasPreviousMonth, false);
  assert.deepEqual(result.totalDelta, []);
  assert.deepEqual(result.deltaByAccount, []);
  assert.deepEqual(result.deltaByMarket, []);
  assert.deepEqual(result.deltaByCategory, []);
});

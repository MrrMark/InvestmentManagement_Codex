import test from "node:test";
import assert from "node:assert/strict";
import {
  filterSnapshotsByMonth,
  getAssetsByAccount,
  getAssetsByCategory,
  getAssetsByMarket,
  getTopAssets,
  getTotalAssetsByCurrency,
  type AggregationSnapshot,
} from "@/lib/domain/aggregation";

const snapshots: AggregationSnapshot[] = [
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
    accountName: "IRP",
    market: "US",
    assetCategory: "ETF",
    assetName: "VTI",
    currency: "USD",
    amount: 4200,
  },
  {
    snapshotMonth: "2026-02",
    accountName: "IRP",
    market: "US",
    assetCategory: "ETF",
    assetName: "VTI",
    currency: "USD",
    amount: 800,
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
    snapshotMonth: "2026-01",
    accountName: "CMA",
    market: "KR",
    assetCategory: "ETF",
    assetName: "KODEX 200",
    currency: "KRW",
    amount: 1400000,
  },
];

test("filterSnapshotsByMonth filters only matching month", () => {
  const result = filterSnapshotsByMonth(snapshots, "2026-02");

  assert.equal(result.length, 4);
  assert.ok(result.every((snapshot) => snapshot.snapshotMonth === "2026-02"));
});

test("getTotalAssetsByCurrency returns totals split by currency", () => {
  assert.deepEqual(getTotalAssetsByCurrency(snapshots, "2026-02"), [
    { currency: "KRW", totalAmount: 2000000 },
    { currency: "USD", totalAmount: 5000 },
  ]);
});

test("getAssetsByAccount groups totals by account and currency", () => {
  assert.deepEqual(getAssetsByAccount(snapshots, "2026-02"), [
    {
      label: "CMA",
      totals: [{ currency: "KRW", totalAmount: 2000000 }],
    },
    {
      label: "IRP",
      totals: [{ currency: "USD", totalAmount: 5000 }],
    },
  ]);
});

test("getAssetsByMarket and category aggregate month data", () => {
  assert.deepEqual(getAssetsByMarket(snapshots, "2026-02"), [
    {
      label: "KR",
      totals: [{ currency: "KRW", totalAmount: 2000000 }],
    },
    {
      label: "US",
      totals: [{ currency: "USD", totalAmount: 5000 }],
    },
  ]);

  assert.deepEqual(getAssetsByCategory(snapshots, "2026-02"), [
    {
      label: "BOND",
      totals: [{ currency: "KRW", totalAmount: 500000 }],
    },
    {
      label: "ETF",
      totals: [
        { currency: "KRW", totalAmount: 1500000 },
        { currency: "USD", totalAmount: 5000 },
      ],
    },
  ]);
});

test("getTopAssets aggregates same asset and respects limit", () => {
  assert.deepEqual(getTopAssets(snapshots, "2026-02", 2), [
    { assetName: "KODEX 200", currency: "KRW", totalAmount: 1500000 },
    { assetName: "Korea Bond", currency: "KRW", totalAmount: 500000 },
  ]);
});

import assert from "node:assert/strict";
import test from "node:test";
import { parseCsvText, serializeSnapshotCsvRows } from "@investment/domain/csv";

test("serializeSnapshotCsvRows emits the shared snapshot CSV format", () => {
  assert.equal(
    serializeSnapshotCsvRows([
      {
        accountName: "CMA",
        snapshotMonth: "2026-03",
        market: "KR",
        assetCategory: "ETF",
        assetName: "KODEX 200",
        currency: "KRW",
        amount: 1000000,
        returnRate: 3.5,
        memo: "core",
      },
    ]),
    [
      "accountName,snapshotMonth,market,assetCategory,assetName,currency,amount,returnRate,memo",
      "CMA,2026-03,KR,ETF,KODEX 200,KRW,1000000,3.5,core",
    ].join("\n"),
  );
});

test("serializeSnapshotCsvRows escapes commas, quotes, and newlines", () => {
  const csvText = serializeSnapshotCsvRows([
    {
      accountName: "Pension",
      snapshotMonth: "2026-04",
      market: "US",
      assetCategory: "STOCK",
      assetName: 'ACME, "Growth"',
      currency: "USD",
      amount: "12.34",
      returnRate: "-1.25",
      memo: "line1\nline2",
    },
  ]);

  assert.deepEqual(parseCsvText(csvText), [
    {
      accountName: "Pension",
      snapshotMonth: "2026-04",
      market: "US",
      assetCategory: "STOCK",
      assetName: 'ACME, "Growth"',
      currency: "USD",
      amount: "12.34",
      returnRate: "-1.25",
      memo: "line1\nline2",
    },
  ]);
});

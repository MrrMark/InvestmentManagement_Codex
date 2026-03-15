import test from "node:test";
import assert from "node:assert/strict";
import {
  createSnapshotSchema,
  importSnapshotCsvRowSchema,
  updateSnapshotSchema,
} from "@/lib/domain/snapshot";

test("createSnapshotSchema parses valid snapshot input", () => {
  const result = createSnapshotSchema.parse({
    snapshotMonth: "2026-02",
    accountId: "account-cma",
    market: "KR",
    assetCategory: "ETF",
    assetName: "KODEX 200",
    currency: "KRW",
    amount: "1500000",
    returnRate: "4.25",
    memo: "memo",
  });

  assert.equal(result.snapshotMonth, "2026-02");
  assert.equal(result.amount, 1500000);
  assert.equal(result.returnRate, 4.25);
});

test("createSnapshotSchema rejects invalid month and enum", () => {
  const result = createSnapshotSchema.safeParse({
    snapshotMonth: "2026/02",
    accountId: "account-cma",
    market: "JP",
    assetCategory: "ETF",
    assetName: "KODEX 200",
    currency: "KRW",
    amount: "1500000",
    returnRate: "4.25",
    memo: "",
  });

  assert.equal(result.success, false);
});

test("updateSnapshotSchema requires id", () => {
  const result = updateSnapshotSchema.safeParse({
    snapshotMonth: "2026-02",
    accountId: "account-cma",
    market: "KR",
    assetCategory: "ETF",
    assetName: "KODEX 200",
    currency: "KRW",
    amount: "1500000",
    returnRate: "4.25",
    memo: "",
  });

  assert.equal(result.success, false);
});

test("importSnapshotCsvRowSchema rejects invalid numeric value", () => {
  const result = importSnapshotCsvRowSchema.safeParse({
    accountName: "CMA",
    snapshotMonth: "2026-02",
    market: "KR",
    assetCategory: "ETF",
    assetName: "KODEX 200",
    currency: "KRW",
    amount: "-1",
    returnRate: "4.25",
    memo: "",
  });

  assert.equal(result.success, false);
});

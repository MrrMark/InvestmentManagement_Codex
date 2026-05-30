import test from "node:test";
import assert from "node:assert/strict";
import {
  createSnapshotSchema,
  importSnapshotCsvRowSchema,
  updateSnapshotSchema,
} from "@investment/domain/snapshot";

test("createSnapshotSchema parses valid snapshot input", () => {
  const result = createSnapshotSchema("en").parse({
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
  const result = createSnapshotSchema("en").safeParse({
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

test("snapshot schemas reject out-of-range months", () => {
  const createResult = createSnapshotSchema("en").safeParse({
    snapshotMonth: "2026-13",
    accountId: "account-cma",
    market: "KR",
    assetCategory: "ETF",
    assetName: "KODEX 200",
    currency: "KRW",
    amount: "1500000",
    returnRate: "4.25",
    memo: "",
  });
  const importResult = importSnapshotCsvRowSchema("en").safeParse({
    accountName: "CMA",
    snapshotMonth: "2026-00",
    market: "KR",
    assetCategory: "ETF",
    assetName: "KODEX 200",
    currency: "KRW",
    amount: "1500000",
    returnRate: "4.25",
    memo: "",
  });

  assert.equal(createResult.success, false);
  assert.equal(importResult.success, false);
});

test("return rate precision accepts two-decimal values despite floating point scaling", () => {
  const validResult = importSnapshotCsvRowSchema("en").safeParse({
    accountName: "CMA",
    snapshotMonth: "2026-04",
    market: "KR",
    assetCategory: "ETF",
    assetName: "KODEX 200",
    currency: "KRW",
    amount: "1500000",
    returnRate: "4.56",
    memo: "",
  });
  const invalidResult = importSnapshotCsvRowSchema("en").safeParse({
    accountName: "CMA",
    snapshotMonth: "2026-04",
    market: "KR",
    assetCategory: "ETF",
    assetName: "KODEX 200",
    currency: "KRW",
    amount: "1500000",
    returnRate: "4.567",
    memo: "",
  });

  assert.equal(validResult.success, true);
  assert.equal(invalidResult.success, false);
});

test("updateSnapshotSchema requires id", () => {
  const result = updateSnapshotSchema("en").safeParse({
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
  const result = importSnapshotCsvRowSchema("en").safeParse({
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

test("createSnapshotSchema returns locale-specific validation message", () => {
  const koResult = createSnapshotSchema("ko").safeParse({
    snapshotMonth: "2026/02",
    accountId: "account-cma",
    market: "KR",
    assetCategory: "ETF",
    assetName: "KODEX 200",
    currency: "KRW",
    amount: "1500000",
    returnRate: "4.25",
    memo: "",
  });
  const enResult = createSnapshotSchema("en").safeParse({
    snapshotMonth: "2026/02",
    accountId: "account-cma",
    market: "KR",
    assetCategory: "ETF",
    assetName: "KODEX 200",
    currency: "KRW",
    amount: "1500000",
    returnRate: "4.25",
    memo: "",
  });

  assert.equal(koResult.success, false);
  assert.equal(enResult.success, false);
  assert.equal(koResult.error.issues[0]?.message, "YYYY-MM 형식으로 입력하세요.");
  assert.equal(enResult.error.issues[0]?.message, "Use YYYY-MM format.");
});

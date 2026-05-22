import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSnapshotCsvImportPreview,
  parseCsvText,
  serializeSnapshotCsvRows,
} from "@investment/domain/csv";

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

test("buildSnapshotCsvImportPreview returns valid rows and row-level errors", () => {
  const preview = buildSnapshotCsvImportPreview({
    text: [
      "accountName,snapshotMonth,market,assetCategory,assetName,currency,amount,returnRate,memo",
      "CMA,2026-03,KR,ETF,KODEX 200,KRW,1000,1.25,core",
      "UNKNOWN,2026-03,KR,ETF,KODEX 200,KRW,1000,1.25,core",
      "CMA,202603,KR,ETF,KODEX 200,KRW,1000,1.25,core",
    ].join("\n"),
    locale: "ko",
    accountNames: ["CMA"],
    unknownAccountPrefix: "알 수 없는 계좌: ",
  });

  assert.deepEqual(preview.errors, []);
  assert.equal(preview.rows.length, 3);
  assert.equal(preview.validRows.length, 1);
  assert.equal(preview.rows[0].rowNumber, 2);
  assert.equal(preview.rows[1].errors[0], "알 수 없는 계좌: UNKNOWN");
  assert.match(preview.rows[2].errors[0], /YYYY-MM/);
});

test("buildSnapshotCsvImportPreview reports missing required headers", () => {
  const preview = buildSnapshotCsvImportPreview({
    text: [
      "accountName,snapshotMonth,assetName,currency,amount,returnRate,memo",
      "CMA,2026-03,KODEX 200,KRW,1000,1.25,core",
    ].join("\n"),
    locale: "ko",
    accountNames: ["CMA"],
    unknownAccountPrefix: "알 수 없는 계좌: ",
  });

  assert.deepEqual(preview.errors, ["CSV 헤더에 market, assetCategory 필드가 필요합니다."]);
  assert.equal(preview.validRows.length, 0);
});

test("buildSnapshotCsvImportPreview reports an empty CSV file", () => {
  const preview = buildSnapshotCsvImportPreview({
    text: "",
    locale: "ko",
    accountNames: ["CMA"],
    unknownAccountPrefix: "알 수 없는 계좌: ",
  });

  assert.deepEqual(preview.errors, ["CSV가 비어 있습니다. 헤더 행을 포함해 주세요."]);
  assert.equal(preview.rows.length, 0);
  assert.equal(preview.validRows.length, 0);
});

import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSnapshotListFilters } from "@/lib/domain/snapshot-filters";

test("normalizeSnapshotListFilters keeps valid filter values", () => {
  assert.deepEqual(
    normalizeSnapshotListFilters({
      snapshotMonth: "2026-02",
      account: "account-cma",
      market: "KR",
      assetCategory: "ETF",
      currency: "KRW",
      keyword: " KODEX ",
    }),
    {
      snapshotMonth: "2026-02",
      account: "account-cma",
      market: "KR",
      assetCategory: "ETF",
      currency: "KRW",
      keyword: "KODEX",
    },
  );
});

test("normalizeSnapshotListFilters drops invalid or empty values", () => {
  assert.deepEqual(
    normalizeSnapshotListFilters({
      snapshotMonth: "2026/02",
      account: " ",
      market: "JP",
      assetCategory: "FUND",
      currency: "JPY",
      keyword: "",
    }),
    {
      snapshotMonth: undefined,
      account: undefined,
      market: undefined,
      assetCategory: undefined,
      currency: undefined,
      keyword: undefined,
    },
  );
});

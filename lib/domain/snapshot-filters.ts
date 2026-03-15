import { assetCategories, currencies, markets } from "@/lib/domain/snapshot";

export type SnapshotListFilters = {
  snapshotMonth?: string;
  account?: string;
  market?: (typeof markets)[number];
  assetCategory?: (typeof assetCategories)[number];
  currency?: (typeof currencies)[number];
  keyword?: string;
};

type RawSnapshotListFilters = Record<string, string | undefined>;

function getTrimmedValue(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function normalizeSnapshotListFilters(
  rawFilters: RawSnapshotListFilters,
): SnapshotListFilters {
  const snapshotMonth = getTrimmedValue(rawFilters.snapshotMonth);
  const account = getTrimmedValue(rawFilters.account);
  const market = getTrimmedValue(rawFilters.market);
  const assetCategory = getTrimmedValue(rawFilters.assetCategory);
  const currency = getTrimmedValue(rawFilters.currency);
  const keyword = getTrimmedValue(rawFilters.keyword);

  return {
    snapshotMonth:
      snapshotMonth && /^\d{4}-\d{2}$/.test(snapshotMonth)
        ? snapshotMonth
        : undefined,
    account,
    market: markets.includes(market as (typeof markets)[number])
      ? (market as (typeof markets)[number])
      : undefined,
    assetCategory: assetCategories.includes(
      assetCategory as (typeof assetCategories)[number],
    )
      ? (assetCategory as (typeof assetCategories)[number])
      : undefined,
    currency: currencies.includes(currency as (typeof currencies)[number])
      ? (currency as (typeof currencies)[number])
      : undefined,
    keyword,
  };
}

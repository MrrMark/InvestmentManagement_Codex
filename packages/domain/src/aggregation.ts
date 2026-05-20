export type AggregationSnapshot = {
  snapshotMonth: string;
  accountName: string;
  market: string;
  assetCategory: string;
  assetName: string;
  currency: string;
  amount: number | string;
};

export type CurrencyTotal = {
  currency: string;
  totalAmount: number;
};

export type GroupedCurrencyTotal = {
  label: string;
  totals: CurrencyTotal[];
};

export type TopAsset = {
  assetName: string;
  currency: string;
  totalAmount: number;
};

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

export function filterSnapshotsByMonth(
  snapshots: AggregationSnapshot[],
  snapshotMonth: string,
) {
  return snapshots.filter((snapshot) => snapshot.snapshotMonth === snapshotMonth);
}

function groupTotalsByCurrency(
  snapshots: AggregationSnapshot[],
  getLabel: (snapshot: AggregationSnapshot) => string,
) {
  const grouped = new Map<string, Map<string, number>>();

  for (const snapshot of snapshots) {
    const label = getLabel(snapshot);
    const currencyTotals = grouped.get(label) ?? new Map<string, number>();
    const amount = toNumber(snapshot.amount);

    currencyTotals.set(
      snapshot.currency,
      (currencyTotals.get(snapshot.currency) ?? 0) + amount,
    );
    grouped.set(label, currencyTotals);
  }

  return Array.from(grouped.entries())
    .map(([label, totals]) => ({
      label,
      totals: Array.from(totals.entries())
        .map(([currency, totalAmount]) => ({
          currency,
          totalAmount,
        }))
        .sort((a, b) => a.currency.localeCompare(b.currency)),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getTotalAssetsByCurrency(
  snapshots: AggregationSnapshot[],
  snapshotMonth: string,
) {
  return groupTotalsByCurrency(
    filterSnapshotsByMonth(snapshots, snapshotMonth),
    () => "Total Assets",
  )[0]?.totals ?? [];
}

export function getAssetsByAccount(
  snapshots: AggregationSnapshot[],
  snapshotMonth: string,
) {
  return groupTotalsByCurrency(
    filterSnapshotsByMonth(snapshots, snapshotMonth),
    (snapshot) => snapshot.accountName,
  );
}

export function getAssetsByMarket(
  snapshots: AggregationSnapshot[],
  snapshotMonth: string,
) {
  return groupTotalsByCurrency(
    filterSnapshotsByMonth(snapshots, snapshotMonth),
    (snapshot) => snapshot.market,
  );
}

export function getAssetsByCategory(
  snapshots: AggregationSnapshot[],
  snapshotMonth: string,
) {
  return groupTotalsByCurrency(
    filterSnapshotsByMonth(snapshots, snapshotMonth),
    (snapshot) => snapshot.assetCategory,
  );
}

export function getTopAssets(
  snapshots: AggregationSnapshot[],
  snapshotMonth: string,
  limit = 5,
) {
  const totals = new Map<string, TopAsset>();

  for (const snapshot of filterSnapshotsByMonth(snapshots, snapshotMonth)) {
    const key = `${snapshot.assetName}:${snapshot.currency}`;
    const current = totals.get(key);
    const amount = toNumber(snapshot.amount);

    totals.set(key, {
      assetName: snapshot.assetName,
      currency: snapshot.currency,
      totalAmount: (current?.totalAmount ?? 0) + amount,
    });
  }

  return Array.from(totals.values())
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit);
}

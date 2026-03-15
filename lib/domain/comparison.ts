import {
  getAssetsByAccount,
  getAssetsByCategory,
  getAssetsByMarket,
  getTotalAssetsByCurrency,
  type AggregationSnapshot,
  type CurrencyTotal,
  type GroupedCurrencyTotal,
} from "@/lib/domain/aggregation";

export type CurrencyDelta = {
  currency: string;
  deltaAmount: number;
};

export type GroupedCurrencyDelta = {
  label: string;
  deltas: CurrencyDelta[];
};

export type MonthComparison = {
  selectedMonth: string;
  previousMonth: string | null;
  hasPreviousMonth: boolean;
  totalDelta: CurrencyDelta[];
  deltaByAccount: GroupedCurrencyDelta[];
  deltaByMarket: GroupedCurrencyDelta[];
  deltaByCategory: GroupedCurrencyDelta[];
};

function sortMonthsDescending(months: string[]) {
  return [...months].sort((a, b) => b.localeCompare(a));
}

export function getAvailableSnapshotMonths(snapshots: AggregationSnapshot[]) {
  return sortMonthsDescending(
    Array.from(new Set(snapshots.map((snapshot) => snapshot.snapshotMonth))),
  );
}

export function getPreviousSnapshotMonth(
  snapshots: AggregationSnapshot[],
  selectedMonth: string,
) {
  const months = sortMonthsDescending(
    getAvailableSnapshotMonths(snapshots).filter((month) => month < selectedMonth),
  );

  return months[0] ?? null;
}

function diffCurrencyTotals(
  current: CurrencyTotal[],
  previous: CurrencyTotal[],
): CurrencyDelta[] {
  const currencies = new Set([
    ...current.map((item) => item.currency),
    ...previous.map((item) => item.currency),
  ]);

  return Array.from(currencies)
    .map((currency) => {
      const currentAmount =
        current.find((item) => item.currency === currency)?.totalAmount ?? 0;
      const previousAmount =
        previous.find((item) => item.currency === currency)?.totalAmount ?? 0;

      return {
        currency,
        deltaAmount: currentAmount - previousAmount,
      };
    })
    .sort((a, b) => a.currency.localeCompare(b.currency));
}

function diffGroupedTotals(
  current: GroupedCurrencyTotal[],
  previous: GroupedCurrencyTotal[],
): GroupedCurrencyDelta[] {
  const labels = new Set([
    ...current.map((item) => item.label),
    ...previous.map((item) => item.label),
  ]);

  return Array.from(labels)
    .map((label) => {
      const currentTotals = current.find((item) => item.label === label)?.totals ?? [];
      const previousTotals =
        previous.find((item) => item.label === label)?.totals ?? [];

      return {
        label,
        deltas: diffCurrencyTotals(currentTotals, previousTotals),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function compareMonthOverMonth(
  snapshots: AggregationSnapshot[],
  selectedMonth: string,
): MonthComparison {
  const previousMonth = getPreviousSnapshotMonth(snapshots, selectedMonth);

  if (!previousMonth) {
    return {
      selectedMonth,
      previousMonth: null,
      hasPreviousMonth: false,
      totalDelta: [],
      deltaByAccount: [],
      deltaByMarket: [],
      deltaByCategory: [],
    };
  }

  return {
    selectedMonth,
    previousMonth,
    hasPreviousMonth: true,
    totalDelta: diffCurrencyTotals(
      getTotalAssetsByCurrency(snapshots, selectedMonth),
      getTotalAssetsByCurrency(snapshots, previousMonth),
    ),
    deltaByAccount: diffGroupedTotals(
      getAssetsByAccount(snapshots, selectedMonth),
      getAssetsByAccount(snapshots, previousMonth),
    ),
    deltaByMarket: diffGroupedTotals(
      getAssetsByMarket(snapshots, selectedMonth),
      getAssetsByMarket(snapshots, previousMonth),
    ),
    deltaByCategory: diffGroupedTotals(
      getAssetsByCategory(snapshots, selectedMonth),
      getAssetsByCategory(snapshots, previousMonth),
    ),
  };
}

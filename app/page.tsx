import {
  isDatabaseSetupError,
  listSnapshotMonths,
  listSnapshots,
} from "@/lib/db/snapshots";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import {
  getAssetsByAccount,
  getAssetsByCategory,
  getAssetsByMarket,
  getTopAssets,
  getTotalAssetsByCurrency,
} from "@/lib/domain/aggregation";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/locale";

type DashboardPageProps = {
  searchParams?: Promise<{
    snapshotMonth?: string;
  }>;
};

function formatCurrencyTotals(
  totals: { currency: string; totalAmount: number }[],
  noDataLabel: string,
) {
  if (totals.length === 0) {
    return noDataLabel;
  }

  return totals.map((total) => `${total.totalAmount} ${total.currency}`).join(" / ");
}

function getLatestSnapshotMonth(
  snapshots: Awaited<ReturnType<typeof listSnapshots>>,
  availableMonths: string[],
  selectedMonth?: string,
) {
  if (selectedMonth && availableMonths.includes(selectedMonth)) {
    return selectedMonth;
  }

  return availableMonths[0] ?? snapshots[0]?.snapshotMonth ?? "";
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const params = searchParams ? await searchParams : undefined;
  let dbNotReady = false;
  const snapshots = await listSnapshots().catch((error) => {
    dbNotReady = isDatabaseSetupError(error);
    return [];
  });
  const snapshotMonths = await listSnapshotMonths().catch(() => []);
  const snapshotMonth = getLatestSnapshotMonth(
    snapshots,
    snapshotMonths,
    params?.snapshotMonth,
  );
  const aggregationInput = snapshots.map((snapshot) => ({
    snapshotMonth: snapshot.snapshotMonth,
    accountName: snapshot.account.name,
    market: snapshot.market,
    assetCategory: snapshot.assetCategory,
    assetName: snapshot.assetName,
    currency: snapshot.currency,
    amount: Number(snapshot.amount),
  }));

  const totalAssets = getTotalAssetsByCurrency(aggregationInput, snapshotMonth);
  const byAccount = getAssetsByAccount(aggregationInput, snapshotMonth);
  const byMarket = getAssetsByMarket(aggregationInput, snapshotMonth);
  const byCategory = getAssetsByCategory(aggregationInput, snapshotMonth);
  const topAssets = getTopAssets(aggregationInput, snapshotMonth);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={t.dashboard.eyebrow}
        title={t.dashboard.title}
        description={t.dashboard.description}
      />
      {dbNotReady ? (
        <SectionCard
          title={t.dashboard.dbNotReadyTitle}
          description={t.dashboard.dbNotReadyDescription}
        />
      ) : null}
      {!dbNotReady && snapshotMonths.length > 0 ? (
        <form className="flex flex-wrap items-end gap-3" method="get">
          <label className="space-y-2 text-sm font-medium text-stone-700">
            <span>{t.dashboard.snapshotMonth}</span>
            <select
              name="snapshotMonth"
              defaultValue={snapshotMonth}
              className="block rounded-xl border border-stone-300 px-3 py-2 text-sm"
            >
              {snapshotMonths.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white"
          >
            {t.common.apply}
          </button>
        </form>
      ) : null}
      <p className="text-sm text-stone-600">
        {t.common.selectedMonth}:{" "}
        <span className="font-medium text-stone-900">
          {snapshotMonth || t.common.notAvailable}
        </span>
      </p>
      {!dbNotReady && snapshotMonths.length === 0 ? (
        <SectionCard
          title={t.dashboard.emptyTitle}
          description={t.dashboard.emptyDescription}
        />
      ) : null}

      {!dbNotReady && snapshotMonths.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard
            title={t.dashboard.totalAssets}
            description={formatCurrencyTotals(totalAssets, t.common.noData)}
          />
          <SectionCard title={t.dashboard.topAssets}>
            <ul className="space-y-2 text-sm text-stone-700">
              {topAssets.length > 0 ? (
                topAssets.map((asset) => (
                  <li key={`${asset.assetName}-${asset.currency}`}>
                    {asset.assetName}: {asset.totalAmount} {asset.currency}
                  </li>
                ))
              ) : (
                <li>{t.common.noData}</li>
              )}
            </ul>
          </SectionCard>
          <SectionCard title={t.dashboard.byAccount}>
            <ul className="space-y-2 text-sm text-stone-700">
              {byAccount.length > 0 ? (
                byAccount.map((item) => (
                  <li key={item.label}>
                    {item.label}: {formatCurrencyTotals(item.totals, t.common.noData)}
                  </li>
                ))
              ) : (
                <li>{t.common.noData}</li>
              )}
            </ul>
          </SectionCard>
          <SectionCard title={t.dashboard.byMarket}>
            <ul className="space-y-2 text-sm text-stone-700">
              {byMarket.length > 0 ? (
                byMarket.map((item) => (
                  <li key={item.label}>
                    {t.labels.market[item.label as "KR" | "US"]}:{" "}
                    {formatCurrencyTotals(item.totals, t.common.noData)}
                  </li>
                ))
              ) : (
                <li>{t.common.noData}</li>
              )}
            </ul>
          </SectionCard>
          <SectionCard title={t.dashboard.byCategory}>
            <ul className="space-y-2 text-sm text-stone-700">
              {byCategory.length > 0 ? (
                byCategory.map((item) => (
                  <li key={item.label}>
                    {
                      t.labels.assetCategory[
                        item.label as "STOCK" | "ETF" | "BOND" | "ELB" | "TDF"
                      ]
                    }
                    : {formatCurrencyTotals(item.totals, t.common.noData)}
                  </li>
                ))
              ) : (
                <li>{t.common.noData}</li>
              )}
            </ul>
          </SectionCard>
        </div>
      ) : null}
    </section>
  );
}

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

type DashboardPageProps = {
  searchParams?: Promise<{
    snapshotMonth?: string;
  }>;
};

function formatCurrencyTotals(
  totals: { currency: string; totalAmount: number }[],
) {
  if (totals.length === 0) {
    return "No data";
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
  const params = searchParams ? await searchParams : undefined;
  let dbNotReady = false;
  let snapshots = await listSnapshots().catch((error) => {
    dbNotReady = isDatabaseSetupError(error);
    return [];
  });
  let snapshotMonths = await listSnapshotMonths().catch(() => []);
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
        eyebrow="Dashboard"
        title="Monthly portfolio overview"
        description="This MVP starts with a calm monthly snapshot workflow: record holdings, review allocation, and compare month over month."
      />
      {dbNotReady ? (
        <SectionCard
          title="Database not ready"
          description="Run the Prisma migration and seed steps before using the dashboard."
        />
      ) : null}
      {!dbNotReady && snapshotMonths.length > 0 ? (
        <form className="flex flex-wrap items-end gap-3" method="get">
          <label className="space-y-2 text-sm font-medium text-stone-700">
            <span>Snapshot Month</span>
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
            Apply
          </button>
        </form>
      ) : null}
      <p className="text-sm text-stone-600">
        Selected month: <span className="font-medium text-stone-900">{snapshotMonth || "N/A"}</span>
      </p>
      {!dbNotReady && snapshotMonths.length === 0 ? (
        <SectionCard
          title="No dashboard data"
          description="Add or import monthly snapshots to see allocation summaries."
        />
      ) : null}

      {!dbNotReady && snapshotMonths.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard
            title="Total assets"
            description={formatCurrencyTotals(totalAssets)}
          />
          <SectionCard title="Top assets">
            <ul className="space-y-2 text-sm text-stone-700">
              {topAssets.length > 0 ? (
                topAssets.map((asset) => (
                  <li key={`${asset.assetName}-${asset.currency}`}>
                    {asset.assetName}: {asset.totalAmount} {asset.currency}
                  </li>
                ))
              ) : (
                <li>No data</li>
              )}
            </ul>
          </SectionCard>
          <SectionCard title="Assets by account">
            <ul className="space-y-2 text-sm text-stone-700">
              {byAccount.length > 0 ? (
                byAccount.map((item) => (
                  <li key={item.label}>
                    {item.label}: {formatCurrencyTotals(item.totals)}
                  </li>
                ))
              ) : (
                <li>No data</li>
              )}
            </ul>
          </SectionCard>
          <SectionCard title="Assets by market">
            <ul className="space-y-2 text-sm text-stone-700">
              {byMarket.length > 0 ? (
                byMarket.map((item) => (
                  <li key={item.label}>
                    {item.label}: {formatCurrencyTotals(item.totals)}
                  </li>
                ))
              ) : (
                <li>No data</li>
              )}
            </ul>
          </SectionCard>
          <SectionCard title="Assets by asset category">
            <ul className="space-y-2 text-sm text-stone-700">
              {byCategory.length > 0 ? (
                byCategory.map((item) => (
                  <li key={item.label}>
                    {item.label}: {formatCurrencyTotals(item.totals)}
                  </li>
                ))
              ) : (
                <li>No data</li>
              )}
            </ul>
          </SectionCard>
        </div>
      ) : null}
    </section>
  );
}

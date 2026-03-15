import {
  isDatabaseSetupError,
  listSnapshotMonths,
  listSnapshots,
} from "@/lib/db/snapshots";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { compareMonthOverMonth } from "@/lib/domain/comparison";

type ComparePageProps = {
  searchParams?: Promise<{
    snapshotMonth?: string;
  }>;
};

function formatDeltas(
  deltas: { currency: string; deltaAmount: number }[],
) {
  if (deltas.length === 0) {
    return "No data";
  }

  return deltas
    .map((item) => `${item.deltaAmount > 0 ? "+" : ""}${item.deltaAmount} ${item.currency}`)
    .join(" / ");
}

export default async function ComparePage({
  searchParams,
}: ComparePageProps) {
  const params = searchParams ? await searchParams : undefined;
  let dbNotReady = false;
  const snapshots = await listSnapshots().catch((error) => {
    dbNotReady = isDatabaseSetupError(error);
    return [];
  });
  const months: string[] = await listSnapshotMonths().catch(() => []);
  const aggregationInput = snapshots.map((snapshot) => ({
    snapshotMonth: snapshot.snapshotMonth,
    accountName: snapshot.account.name,
    market: snapshot.market,
    assetCategory: snapshot.assetCategory,
    assetName: snapshot.assetName,
    currency: snapshot.currency,
    amount: Number(snapshot.amount),
  }));
  const selectedMonth =
    params?.snapshotMonth && months.includes(params.snapshotMonth)
      ? params.snapshotMonth
      : months[0] ?? "";
  const comparison = compareMonthOverMonth(aggregationInput, selectedMonth);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Compare"
        title="Month-over-month comparison"
        description="Compare the selected month against the closest previous snapshot month."
      />
      {dbNotReady ? (
        <SectionCard
          title="Database not ready"
          description="Run the Prisma migration and seed steps before using month-over-month comparison."
        />
      ) : null}
      {!dbNotReady && months.length > 0 ? (
        <form className="flex flex-wrap items-end gap-3" method="get">
          <label className="space-y-2 text-sm font-medium text-stone-700">
            <span>Snapshot Month</span>
            <select
              name="snapshotMonth"
              defaultValue={selectedMonth}
              className="block rounded-xl border border-stone-300 px-3 py-2 text-sm"
            >
              {months.map((month) => (
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
        Selected month: <span className="font-medium text-stone-900">{selectedMonth || "N/A"}</span>
      </p>
      {!dbNotReady && months.length === 0 ? (
        <SectionCard
          title="No comparison data"
          description="Add or import at least one month of snapshots to start comparing months."
        />
      ) : null}
      {!dbNotReady && comparison.hasPreviousMonth ? (
        <p className="text-sm text-stone-600">
          Previous month: <span className="font-medium text-stone-900">{comparison.previousMonth}</span>
        </p>
      ) : !dbNotReady && months.length > 0 ? (
        <SectionCard
          title="No previous month"
          description="There is no earlier snapshot month to compare against yet."
        />
      ) : null}
      {!dbNotReady && comparison.hasPreviousMonth ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard
            title="Total delta"
            description={formatDeltas(comparison.totalDelta)}
          />
          <SectionCard title="Delta by account">
            <ul className="space-y-2 text-sm text-stone-700">
              {comparison.deltaByAccount.map((item) => (
                <li key={item.label}>
                  {item.label}: {formatDeltas(item.deltas)}
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard title="Delta by market">
            <ul className="space-y-2 text-sm text-stone-700">
              {comparison.deltaByMarket.map((item) => (
                <li key={item.label}>
                  {item.label}: {formatDeltas(item.deltas)}
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard title="Delta by asset category">
            <ul className="space-y-2 text-sm text-stone-700">
              {comparison.deltaByCategory.map((item) => (
                <li key={item.label}>
                  {item.label}: {formatDeltas(item.deltas)}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      ) : null}
    </section>
  );
}

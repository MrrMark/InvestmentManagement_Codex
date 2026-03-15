import {
  isDatabaseSetupError,
  listSnapshotMonths,
  listSnapshots,
} from "@/lib/db/snapshots";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { compareMonthOverMonth } from "@/lib/domain/comparison";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/locale";

type ComparePageProps = {
  searchParams?: Promise<{
    snapshotMonth?: string;
  }>;
};

function formatDeltas(
  deltas: { currency: string; deltaAmount: number }[],
  noDataLabel: string,
) {
  if (deltas.length === 0) {
    return noDataLabel;
  }

  return deltas
    .map((item) => `${item.deltaAmount > 0 ? "+" : ""}${item.deltaAmount} ${item.currency}`)
    .join(" / ");
}

export default async function ComparePage({
  searchParams,
}: ComparePageProps) {
  const locale = await getLocale();
  const t = getDictionary(locale);
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
        eyebrow={t.compare.eyebrow}
        title={t.compare.title}
        description={t.compare.description}
      />
      {dbNotReady ? (
        <SectionCard
          title={t.compare.dbNotReadyTitle}
          description={t.compare.dbNotReadyDescription}
        />
      ) : null}
      {!dbNotReady && months.length > 0 ? (
        <form className="flex flex-wrap items-end gap-3" method="get">
          <label className="space-y-2 text-sm font-medium text-stone-700">
            <span>{t.compare.snapshotMonth}</span>
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
            {t.common.apply}
          </button>
        </form>
      ) : null}
      <p className="text-sm text-stone-600">
        {t.common.selectedMonth}:{" "}
        <span className="font-medium text-stone-900">
          {selectedMonth || t.common.notAvailable}
        </span>
      </p>
      {!dbNotReady && months.length === 0 ? (
        <SectionCard
          title={t.compare.noComparisonTitle}
          description={t.compare.noComparisonDescription}
        />
      ) : null}
      {!dbNotReady && comparison.hasPreviousMonth ? (
        <p className="text-sm text-stone-600">
          {t.compare.previousMonth}:{" "}
          <span className="font-medium text-stone-900">{comparison.previousMonth}</span>
        </p>
      ) : !dbNotReady && months.length > 0 ? (
        <SectionCard
          title={t.compare.noPreviousTitle}
          description={t.compare.noPreviousDescription}
        />
      ) : null}
      {!dbNotReady && comparison.hasPreviousMonth ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard
            title={t.compare.totalDelta}
            description={formatDeltas(comparison.totalDelta, t.common.noData)}
          />
          <SectionCard title={t.compare.byAccountDelta}>
            <ul className="space-y-2 text-sm text-stone-700">
              {comparison.deltaByAccount.map((item) => (
                <li key={item.label}>
                  {item.label}: {formatDeltas(item.deltas, t.common.noData)}
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard title={t.compare.byMarketDelta}>
            <ul className="space-y-2 text-sm text-stone-700">
              {comparison.deltaByMarket.map((item) => (
                <li key={item.label}>
                  {t.labels.market[item.label as "KR" | "US"]}:{" "}
                  {formatDeltas(item.deltas, t.common.noData)}
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard title={t.compare.byCategoryDelta}>
            <ul className="space-y-2 text-sm text-stone-700">
              {comparison.deltaByCategory.map((item) => (
                <li key={item.label}>
                  {
                    t.labels.assetCategory[
                      item.label as "STOCK" | "ETF" | "BOND" | "ELB" | "TDF"
                    ]
                  }
                  : {formatDeltas(item.deltas, t.common.noData)}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      ) : null}
    </section>
  );
}

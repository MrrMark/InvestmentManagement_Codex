import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { deleteSnapshotAction } from "@/app/snapshots/actions";
import {
  isDatabaseSetupError,
  listAccounts,
  listSnapshots,
  listSnapshotMonths,
} from "@/lib/db/snapshots";
import { normalizeSnapshotListFilters } from "@/lib/domain/snapshot-filters";
import {
  assetCategories,
  currencies,
  markets,
} from "@/lib/domain/snapshot";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/locale";

type SnapshotsPageProps = {
  searchParams?: Promise<{
    status?: string;
    message?: string;
    snapshotMonth?: string;
    account?: string;
    market?: string;
    assetCategory?: string;
    currency?: string;
    keyword?: string;
  }>;
};

function formatAmount(amount: string, currency: string) {
  return `${amount} ${currency}`;
}

export default async function SnapshotsPage({
  searchParams,
}: SnapshotsPageProps) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const params = searchParams ? await searchParams : undefined;
  const filters = normalizeSnapshotListFilters((params ?? {}) as Record<string, string | undefined>);
  let dbNotReady = false;
  const [snapshots, accounts, snapshotMonths] = await Promise.all([
    listSnapshots(filters).catch((error) => {
      dbNotReady = isDatabaseSetupError(error);
      return [];
    }),
    listAccounts().catch(() => []),
    listSnapshotMonths().catch(() => []),
  ]);
  const exportParams = new URLSearchParams();

  if (filters.snapshotMonth) {
    exportParams.set("snapshotMonth", filters.snapshotMonth);
  }

  if (filters.account) {
    exportParams.set("account", filters.account);
  }

  if (filters.market) {
    exportParams.set("market", filters.market);
  }

  if (filters.assetCategory) {
    exportParams.set("assetCategory", filters.assetCategory);
  }

  if (filters.currency) {
    exportParams.set("currency", filters.currency);
  }

  if (filters.keyword) {
    exportParams.set("keyword", filters.keyword);
  }

  const exportHref =
    exportParams.size > 0
      ? `/snapshots/export?${exportParams.toString()}`
      : "/snapshots/export";

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={t.snapshots.eyebrow}
        title={t.snapshots.title}
        description={t.snapshots.description}
      />
      {params?.message ? (
        <p className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 shadow-sm">
          {params.message}
        </p>
      ) : null}
      {dbNotReady ? (
        <SectionCard
          title={t.snapshots.dbNotReadyTitle}
          description={t.snapshots.dbNotReadyDescription}
        />
      ) : null}
      <SectionCard title={t.snapshots.tableTitle}>
        {!dbNotReady ? (
          <form className="grid gap-3 md:grid-cols-3" method="get">
            <label className="space-y-2 text-sm font-medium text-stone-700">
              <span>{t.snapshots.filters.snapshotMonth}</span>
              <select
                name="snapshotMonth"
                defaultValue={filters.snapshotMonth ?? ""}
                className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="">{t.common.all}</option>
                {snapshotMonths.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-700">
              <span>{t.snapshots.filters.account}</span>
              <select
                name="account"
                defaultValue={filters.account ?? ""}
                className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="">{t.common.all}</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-700">
              <span>{t.snapshots.filters.market}</span>
              <select
                name="market"
                defaultValue={filters.market ?? ""}
                className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="">{t.common.all}</option>
                {markets.map((market) => (
                  <option key={market} value={market}>
                    {t.labels.market[market]}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-700">
              <span>{t.snapshots.filters.assetCategory}</span>
              <select
                name="assetCategory"
                defaultValue={filters.assetCategory ?? ""}
                className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="">{t.common.all}</option>
                {assetCategories.map((category) => (
                  <option key={category} value={category}>
                    {t.labels.assetCategory[category]}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-700">
              <span>{t.snapshots.filters.currency}</span>
              <select
                name="currency"
                defaultValue={filters.currency ?? ""}
                className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="">{t.common.all}</option>
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {t.labels.currency[currency]}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-700">
              <span>{t.snapshots.filters.keyword}</span>
              <input
                name="keyword"
                defaultValue={filters.keyword ?? ""}
                className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                placeholder={t.snapshots.filters.keywordPlaceholder}
              />
            </label>
            <div className="md:col-span-3 flex gap-3">
              <button
                type="submit"
                className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white"
              >
                {t.snapshots.filters.apply}
              </button>
              <Link
                href={exportHref}
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
              >
                {t.snapshots.filters.exportCsv}
              </Link>
              <Link
                href="/snapshots"
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
              >
                {t.snapshots.filters.reset}
              </Link>
            </div>
          </form>
        ) : null}
        {!dbNotReady && snapshots.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-stone-500">
                <tr>
                  <th className="pb-3 pr-4 font-medium">{t.snapshots.table.month}</th>
                  <th className="pb-3 pr-4 font-medium">{t.snapshots.table.account}</th>
                  <th className="pb-3 pr-4 font-medium">{t.snapshots.table.asset}</th>
                  <th className="pb-3 pr-4 font-medium">{t.snapshots.table.market}</th>
                  <th className="pb-3 pr-4 font-medium">{t.snapshots.table.category}</th>
                  <th className="pb-3 pr-4 font-medium">{t.snapshots.table.currency}</th>
                  <th className="pb-3 pr-4 font-medium">{t.snapshots.table.amount}</th>
                  <th className="pb-3 pr-4 font-medium">{t.snapshots.table.returnRate}</th>
                  <th className="pb-3 font-medium">{t.snapshots.table.actions}</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((snapshot) => (
                  <tr key={snapshot.id} className="border-t border-stone-200">
                    <td className="py-3 pr-4">{snapshot.snapshotMonth}</td>
                    <td className="py-3 pr-4">{snapshot.account.name}</td>
                    <td className="py-3 pr-4">{snapshot.assetName}</td>
                    <td className="py-3 pr-4">{t.labels.market[snapshot.market]}</td>
                    <td className="py-3 pr-4">
                      {t.labels.assetCategory[snapshot.assetCategory]}
                    </td>
                    <td className="py-3 pr-4">{t.labels.currency[snapshot.currency]}</td>
                    <td className="py-3 pr-4">
                      {formatAmount(snapshot.amount.toString(), snapshot.currency)}
                    </td>
                    <td className="py-3 pr-4">{snapshot.returnRate.toString()}%</td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/snapshots/${snapshot.id}/edit`}
                          className="text-sm font-medium text-stone-700 underline-offset-4 hover:underline"
                        >
                          {t.snapshots.table.edit}
                        </Link>
                        <form action={deleteSnapshotAction}>
                          <input type="hidden" name="id" value={snapshot.id} />
                          <button
                            type="submit"
                            className="text-sm font-medium text-red-700 underline-offset-4 hover:underline"
                          >
                            {t.snapshots.table.delete}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !dbNotReady ? (
          <p className="text-sm leading-6 text-stone-600">{t.snapshots.empty}</p>
        ) : null}
      </SectionCard>
    </section>
  );
}

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

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Snapshots"
        title="Monthly snapshot list"
        description="A simple server-rendered list placeholder for upcoming filtering and CRUD work."
      />
      {params?.message ? (
        <p className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 shadow-sm">
          {params.message}
        </p>
      ) : null}
      {dbNotReady ? (
        <SectionCard
          title="Database not ready"
          description="Run the Prisma migration and seed steps before using the snapshot list."
        />
      ) : null}
      <SectionCard title="Recent snapshot rows">
        {!dbNotReady ? (
          <form className="grid gap-3 md:grid-cols-3" method="get">
            <label className="space-y-2 text-sm font-medium text-stone-700">
              <span>Snapshot Month</span>
              <select
                name="snapshotMonth"
                defaultValue={filters.snapshotMonth ?? ""}
                className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {snapshotMonths.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-700">
              <span>Account</span>
              <select
                name="account"
                defaultValue={filters.account ?? ""}
                className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-700">
              <span>Market</span>
              <select
                name="market"
                defaultValue={filters.market ?? ""}
                className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {markets.map((market) => (
                  <option key={market} value={market}>
                    {market}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-700">
              <span>Asset Category</span>
              <select
                name="assetCategory"
                defaultValue={filters.assetCategory ?? ""}
                className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {assetCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-700">
              <span>Currency</span>
              <select
                name="currency"
                defaultValue={filters.currency ?? ""}
                className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-700">
              <span>Keyword</span>
              <input
                name="keyword"
                defaultValue={filters.keyword ?? ""}
                className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                placeholder="Asset name"
              />
            </label>
            <div className="md:col-span-3 flex gap-3">
              <button
                type="submit"
                className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white"
              >
                Apply Filters
              </button>
              <Link
                href="/snapshots"
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
              >
                Reset
              </Link>
            </div>
          </form>
        ) : null}
        {!dbNotReady && snapshots.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-stone-500">
                <tr>
                  <th className="pb-3 pr-4 font-medium">Month</th>
                  <th className="pb-3 pr-4 font-medium">Account</th>
                  <th className="pb-3 pr-4 font-medium">Asset</th>
                  <th className="pb-3 pr-4 font-medium">Market</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 pr-4 font-medium">Return</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((snapshot) => (
                  <tr key={snapshot.id} className="border-t border-stone-200">
                    <td className="py-3 pr-4">{snapshot.snapshotMonth}</td>
                    <td className="py-3 pr-4">{snapshot.account.name}</td>
                    <td className="py-3 pr-4">{snapshot.assetName}</td>
                    <td className="py-3 pr-4">{snapshot.market}</td>
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
                          Edit
                        </Link>
                        <form action={deleteSnapshotAction}>
                          <input type="hidden" name="id" value={snapshot.id} />
                          <button
                            type="submit"
                            className="text-sm font-medium text-red-700 underline-offset-4 hover:underline"
                          >
                            Delete
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
          <p className="text-sm leading-6 text-stone-600">
            No snapshots match the current filters. Add or import monthly snapshots to get started.
          </p>
        ) : null}
      </SectionCard>
    </section>
  );
}

import { notFound } from "next/navigation";
import { SnapshotForm } from "@/components/snapshot-form";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { updateSnapshotAction } from "@/app/snapshots/actions";
import { getSnapshotById, listAccounts } from "@/lib/db/snapshots";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/locale";

type EditSnapshotPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    status?: string;
    message?: string;
  }>;
};

export default async function EditSnapshotPage({
  params,
  searchParams,
}: EditSnapshotPageProps) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const { id } = await params;
  const [snapshot, accounts, query] = await Promise.all([
    getSnapshotById(id).catch(() => null),
    listAccounts().catch(() => []),
    searchParams ? searchParams : Promise.resolve(undefined),
  ]);

  if (!snapshot) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={t.editSnapshot.eyebrow}
        title={t.editSnapshot.title}
        description={t.editSnapshot.description}
      />
      {query?.message ? (
        <p className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 shadow-sm">
          {query.message}
        </p>
      ) : null}
      <SectionCard title={t.editSnapshot.formTitle}>
        <SnapshotForm
          accounts={accounts}
          action={updateSnapshotAction}
          submitLabel={t.editSnapshot.submitLabel}
          labels={{
            snapshotMonth: t.form.snapshotMonth,
            assetName: t.form.assetName,
            amount: t.form.amount,
            returnRate: t.form.returnRate,
            account: t.form.account,
            market: t.form.market,
            assetCategory: t.form.assetCategory,
            currency: t.form.currency,
            memo: t.form.memo,
            submit: t.form.submitCreate,
          }}
          marketLabels={t.labels.market}
          assetCategoryLabels={t.labels.assetCategory}
          currencyLabels={t.labels.currency}
          snapshot={snapshot}
        />
      </SectionCard>
    </section>
  );
}

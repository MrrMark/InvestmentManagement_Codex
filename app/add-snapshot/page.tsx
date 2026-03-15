import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { SnapshotForm } from "@/components/snapshot-form";
import { createSnapshotAction } from "@/app/snapshots/actions";
import { isDatabaseSetupError, listAccounts } from "@/lib/db/snapshots";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/locale";

type AddSnapshotPageProps = {
  searchParams?: Promise<{
    status?: string;
    message?: string;
  }>;
};

export default async function AddSnapshotPage({
  searchParams,
}: AddSnapshotPageProps) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  let dbNotReady = false;
  const accounts = await listAccounts().catch((error) => {
    dbNotReady = isDatabaseSetupError(error);
    return [];
  });
  const params = searchParams ? await searchParams : undefined;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={t.addSnapshot.eyebrow}
        title={t.addSnapshot.title}
        description={t.addSnapshot.description}
      />
      {params?.message ? (
        <p className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 shadow-sm">
          {params.message}
        </p>
      ) : null}
      <SectionCard title={t.addSnapshot.formTitle}>
        {dbNotReady ? (
          <p className="text-sm leading-6 text-stone-600">{t.addSnapshot.dbNotReady}</p>
        ) : accounts.length > 0 ? (
          <SnapshotForm
            accounts={accounts}
            action={createSnapshotAction}
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
          />
        ) : (
          <p className="text-sm leading-6 text-stone-600">{t.addSnapshot.emptyAccounts}</p>
        )}
      </SectionCard>
    </section>
  );
}

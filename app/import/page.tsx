import { CsvImportForm } from "@/components/csv-import-form";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { isDatabaseSetupError, listAccounts } from "@/lib/db/snapshots";
import { importSnapshotsCsvAction } from "@/app/snapshots/actions";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/locale";

type ImportPageProps = {
  searchParams?: Promise<{
    status?: string;
    message?: string;
  }>;
};

export default async function ImportPage({ searchParams }: ImportPageProps) {
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
        eyebrow={t.importCsv.eyebrow}
        title={t.importCsv.title}
        description={t.importCsv.description}
      />
      {params?.message ? (
        <p className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 shadow-sm">
          {params.message}
        </p>
      ) : null}
      <SectionCard title={t.importCsv.sectionTitle}>
        {dbNotReady ? (
          <p className="text-sm leading-6 text-stone-600">{t.importCsv.dbNotReady}</p>
        ) : accounts.length > 0 ? (
          <CsvImportForm
            locale={locale}
            accountNames={accounts.map((account) => account.name)}
            action={importSnapshotsCsvAction}
            labels={{
              fileLabel: t.importCsv.fileLabel,
              requiredHeaders: t.importCsv.requiredHeaders,
              importButton: t.importCsv.importButton,
              row: t.importCsv.row,
              status: t.importCsv.status,
              valid: t.importCsv.valid,
              csvEmpty: t.importCsv.csvEmpty,
              parseSummary: t.importCsv.parseSummary,
              unknownAccount: t.importCsv.unknownAccount,
            }}
          />
        ) : (
          <p className="text-sm leading-6 text-stone-600">{t.importCsv.emptyAccounts}</p>
        )}
      </SectionCard>
    </section>
  );
}

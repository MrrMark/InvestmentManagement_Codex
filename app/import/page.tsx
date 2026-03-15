import { CsvImportForm } from "@/components/csv-import-form";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { isDatabaseSetupError, listAccounts } from "@/lib/db/snapshots";
import { importSnapshotsCsvAction } from "@/app/snapshots/actions";

type ImportPageProps = {
  searchParams?: Promise<{
    status?: string;
    message?: string;
  }>;
};

export default async function ImportPage({ searchParams }: ImportPageProps) {
  let dbNotReady = false;
  const accounts = await listAccounts().catch((error) => {
    dbNotReady = isDatabaseSetupError(error);
    return [];
  });
  const params = searchParams ? await searchParams : undefined;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Import CSV"
        title="Import asset snapshots from CSV"
        description="Upload a CSV file, preview rows, and import only rows that pass validation."
      />
      {params?.message ? (
        <p className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 shadow-sm">
          {params.message}
        </p>
      ) : null}
      <SectionCard title="CSV import">
        {dbNotReady ? (
          <p className="text-sm leading-6 text-stone-600">
            Database is not ready yet. Run the Prisma migration and seed steps first.
          </p>
        ) : accounts.length > 0 ? (
          <CsvImportForm
            accountNames={accounts.map((account) => account.name)}
            action={importSnapshotsCsvAction}
          />
        ) : (
          <p className="text-sm leading-6 text-stone-600">
            Seed or create an account first before importing CSV rows.
          </p>
        )}
      </SectionCard>
    </section>
  );
}

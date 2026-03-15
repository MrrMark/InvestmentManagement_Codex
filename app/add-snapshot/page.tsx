import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { SnapshotForm } from "@/components/snapshot-form";
import { createSnapshotAction } from "@/app/snapshots/actions";
import { isDatabaseSetupError, listAccounts } from "@/lib/db/snapshots";

type AddSnapshotPageProps = {
  searchParams?: Promise<{
    status?: string;
    message?: string;
  }>;
};

export default async function AddSnapshotPage({
  searchParams,
}: AddSnapshotPageProps) {
  let dbNotReady = false;
  const accounts = await listAccounts().catch((error) => {
    dbNotReady = isDatabaseSetupError(error);
    return [];
  });
  const params = searchParams ? await searchParams : undefined;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Add Snapshot"
        title="Create a monthly holding snapshot"
        description="This is the initial form shell for the MVP. Validation and persistence can be wired in next."
      />
      {params?.message ? (
        <p className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 shadow-sm">
          {params.message}
        </p>
      ) : null}
      <SectionCard title="Snapshot form">
        {dbNotReady ? (
          <p className="text-sm leading-6 text-stone-600">
            Database is not ready yet. Run the Prisma migration and seed steps first.
          </p>
        ) : accounts.length > 0 ? (
          <SnapshotForm accounts={accounts} action={createSnapshotAction} />
        ) : (
          <p className="text-sm leading-6 text-stone-600">
            Seed or create a user and account first before adding snapshots.
          </p>
        )}
      </SectionCard>
    </section>
  );
}

import { notFound } from "next/navigation";
import { SnapshotForm } from "@/components/snapshot-form";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { updateSnapshotAction } from "@/app/snapshots/actions";
import { getSnapshotById, listAccounts } from "@/lib/db/snapshots";

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
        eyebrow="Edit Snapshot"
        title="Update a monthly holding snapshot"
        description="Adjust a saved row and keep the monthly record accurate."
      />
      {query?.message ? (
        <p className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 shadow-sm">
          {query.message}
        </p>
      ) : null}
      <SectionCard title="Snapshot form">
        <SnapshotForm
          accounts={accounts}
          action={updateSnapshotAction}
          submitLabel="Update Snapshot"
          snapshot={snapshot}
        />
      </SectionCard>
    </section>
  );
}

import { NextRequest } from "next/server";
import { listSnapshots } from "@/lib/db/snapshots";
import { serializeSnapshotCsvRows } from "@investment/domain/csv";
import { normalizeSnapshotListFilters } from "@investment/domain/snapshot-filters";

function toCsv(rows: Awaited<ReturnType<typeof listSnapshots>>) {
  return serializeSnapshotCsvRows(
    rows.map((row) => ({
      accountName: row.account.name,
      snapshotMonth: row.snapshotMonth,
      market: row.market,
      assetCategory: row.assetCategory,
      assetName: row.assetName,
      currency: row.currency,
      amount: row.amount.toString(),
      returnRate: row.returnRate.toString(),
      memo: row.memo,
    })),
  );
}

function formatFileNameDate(date: Date) {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${yyyy}${mm}${dd}-${hh}${min}`;
}

export async function GET(request: NextRequest) {
  const rawFilters = Object.fromEntries(
    request.nextUrl.searchParams.entries(),
  ) as Record<string, string | undefined>;
  const filters = normalizeSnapshotListFilters(rawFilters);
  const rows = await listSnapshots(filters);
  const csvText = toCsv(rows);
  const fileName = `snapshots-${formatFileNameDate(new Date())}.csv`;

  return new Response(`\uFEFF${csvText}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}

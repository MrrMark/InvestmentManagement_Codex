import { NextRequest } from "next/server";
import { listSnapshots } from "@/lib/db/snapshots";
import { normalizeSnapshotListFilters } from "@/lib/domain/snapshot-filters";

function escapeCsvCell(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }

  return value;
}

function toCsv(rows: Awaited<ReturnType<typeof listSnapshots>>) {
  const header = [
    "accountName",
    "snapshotMonth",
    "market",
    "assetCategory",
    "assetName",
    "currency",
    "amount",
    "returnRate",
    "memo",
  ];
  const lines = [header.join(",")];

  for (const row of rows) {
    const csvRow = [
      row.account.name,
      row.snapshotMonth,
      row.market,
      row.assetCategory,
      row.assetName,
      row.currency,
      row.amount.toString(),
      row.returnRate.toString(),
      row.memo ?? "",
    ].map((cell) => escapeCsvCell(cell));

    lines.push(csvRow.join(","));
  }

  return lines.join("\n");
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

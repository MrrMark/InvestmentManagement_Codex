import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  createSnapshotSchema,
  importSnapshotCsvRowSchema,
  updateSnapshotSchema,
} from "@/lib/domain/snapshot";
import {
  normalizeSnapshotListFilters,
  type SnapshotListFilters,
} from "@/lib/domain/snapshot-filters";
import { defaultLocale, type Locale } from "@/lib/i18n/locale";

const snapshotInclude = {
  account: true,
  user: true,
} satisfies Prisma.AssetSnapshotInclude;

function getStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export function parseCreateSnapshotFormData(
  formData: FormData,
  locale: Locale = defaultLocale,
) {
  return createSnapshotSchema(locale).parse({
    snapshotMonth: getStringValue(formData.get("snapshotMonth")),
    accountId: getStringValue(formData.get("accountId")),
    market: getStringValue(formData.get("market")),
    assetCategory: getStringValue(formData.get("assetCategory")),
    assetName: getStringValue(formData.get("assetName")),
    currency: getStringValue(formData.get("currency")),
    amount: getStringValue(formData.get("amount")),
    returnRate: getStringValue(formData.get("returnRate")),
    memo: getStringValue(formData.get("memo")),
  });
}

export function parseUpdateSnapshotFormData(
  formData: FormData,
  locale: Locale = defaultLocale,
) {
  return updateSnapshotSchema(locale).parse({
    id: getStringValue(formData.get("id")),
    snapshotMonth: getStringValue(formData.get("snapshotMonth")),
    accountId: getStringValue(formData.get("accountId")),
    market: getStringValue(formData.get("market")),
    assetCategory: getStringValue(formData.get("assetCategory")),
    assetName: getStringValue(formData.get("assetName")),
    currency: getStringValue(formData.get("currency")),
    amount: getStringValue(formData.get("amount")),
    returnRate: getStringValue(formData.get("returnRate")),
    memo: getStringValue(formData.get("memo")),
  });
}

export function parseImportSnapshotRowsFormData(
  formData: FormData,
  locale: Locale = defaultLocale,
) {
  const rowsJson = getStringValue(formData.get("rowsJson"));
  const rows = JSON.parse(rowsJson) as unknown;

  return z.array(importSnapshotCsvRowSchema(locale)).parse(rows);
}

export async function getDefaultUser() {
  return prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
  });
}

export async function listAccounts() {
  return prisma.account.findMany({
    orderBy: [{ createdAt: "asc" }, { name: "asc" }],
  });
}

export async function listAccountsByName() {
  const accounts = await listAccounts();

  return new Map(accounts.map((account) => [account.name, account]));
}

export async function listSnapshots(filters?: SnapshotListFilters) {
  const normalizedFilters = normalizeSnapshotListFilters(filters ?? {});

  return prisma.assetSnapshot.findMany({
    where: {
      snapshotMonth: normalizedFilters.snapshotMonth,
      accountId: normalizedFilters.account,
      market: normalizedFilters.market,
      assetCategory: normalizedFilters.assetCategory,
      currency: normalizedFilters.currency,
      assetName: normalizedFilters.keyword
        ? {
            contains: normalizedFilters.keyword,
          }
        : undefined,
    },
    include: snapshotInclude,
    orderBy: [{ snapshotMonth: "desc" }, { amount: "desc" }],
  });
}

export async function getSnapshotById(id: string) {
  return prisma.assetSnapshot.findUnique({
    where: { id },
    include: snapshotInclude,
  });
}

export async function listSnapshotMonths() {
  const rows = await prisma.assetSnapshot.findMany({
    select: { snapshotMonth: true },
    distinct: ["snapshotMonth"],
    orderBy: { snapshotMonth: "desc" },
  });

  return rows.map((row) => row.snapshotMonth);
}

export function isDatabaseSetupError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2021";
  }

  return (
    error instanceof Error &&
    error.message.includes("does not exist in the current database")
  );
}

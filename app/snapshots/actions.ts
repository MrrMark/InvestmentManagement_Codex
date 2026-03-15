"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/locale";
import {
  getDefaultUser,
  listAccountsByName,
  parseCreateSnapshotFormData,
  parseImportSnapshotRowsFormData,
  parseUpdateSnapshotFormData,
} from "@/lib/db/snapshots";

function redirectWithMessage(
  path: string,
  type: "error" | "success",
  message: string,
): never {
  const params = new URLSearchParams({
    status: type,
    message,
  });

  redirect(`${path}?${params.toString()}`);
}

function getErrorMessage(error: unknown, locale: Awaited<ReturnType<typeof getLocale>>) {
  const t = getDictionary(locale);

  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? t.actions.validationFailed;
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return t.actions.duplicateSnapshot;
  }

  if (
    error instanceof Error &&
    error.message.startsWith(t.actions.unknownAccountPrefix)
  ) {
    return error.message;
  }

  return t.actions.unableToSave;
}

export async function createSnapshotAction(formData: FormData) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const user = await getDefaultUser();

  if (!user) {
    redirectWithMessage("/add-snapshot", "error", t.actions.createUserBeforeAdd);
  }

  try {
    const input = parseCreateSnapshotFormData(formData, locale);

    await prisma.assetSnapshot.create({
      data: {
        userId: user.id,
        accountId: input.accountId,
        snapshotMonth: input.snapshotMonth,
        market: input.market,
        assetCategory: input.assetCategory,
        assetName: input.assetName,
        currency: input.currency,
        amount: input.amount,
        returnRate: input.returnRate,
        memo: input.memo || null,
      },
    });
  } catch (error) {
    redirectWithMessage("/add-snapshot", "error", getErrorMessage(error, locale));
  }

  revalidatePath("/snapshots");
  revalidatePath("/add-snapshot");
  redirectWithMessage("/snapshots", "success", t.actions.snapshotCreated);
}

export async function updateSnapshotAction(formData: FormData) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  let snapshotId = "";

  try {
    const input = parseUpdateSnapshotFormData(formData, locale);
    snapshotId = input.id;

    await prisma.assetSnapshot.update({
      where: { id: input.id },
      data: {
        accountId: input.accountId,
        snapshotMonth: input.snapshotMonth,
        market: input.market,
        assetCategory: input.assetCategory,
        assetName: input.assetName,
        currency: input.currency,
        amount: input.amount,
        returnRate: input.returnRate,
        memo: input.memo || null,
      },
    });
  } catch (error) {
    const path = snapshotId ? `/snapshots/${snapshotId}/edit` : "/snapshots";
    redirectWithMessage(path, "error", getErrorMessage(error, locale));
  }

  revalidatePath("/snapshots");
  redirectWithMessage("/snapshots", "success", t.actions.snapshotUpdated);
}

export async function deleteSnapshotAction(formData: FormData) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirectWithMessage("/snapshots", "error", t.actions.missingSnapshotId);
  }

  try {
    await prisma.assetSnapshot.delete({
      where: { id },
    });
  } catch {
    redirectWithMessage("/snapshots", "error", t.actions.unableToDelete);
  }

  revalidatePath("/snapshots");
  redirectWithMessage("/snapshots", "success", t.actions.snapshotDeleted);
}

export async function importSnapshotsCsvAction(formData: FormData) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const user = await getDefaultUser();

  if (!user) {
    redirectWithMessage("/import", "error", t.actions.createUserBeforeImport);
  }

  try {
    const rows = parseImportSnapshotRowsFormData(formData, locale);

    if (rows.length === 0) {
      redirectWithMessage("/import", "error", t.actions.noRowsToImport);
    }

    const accountsByName = await listAccountsByName();

    await prisma.$transaction(
      rows.map((row) => {
        const account = accountsByName.get(row.accountName);

        if (!account) {
          throw new Error(`${t.actions.unknownAccountPrefix}${row.accountName}`);
        }

        return prisma.assetSnapshot.create({
          data: {
            userId: user.id,
            accountId: account.id,
            snapshotMonth: row.snapshotMonth,
            market: row.market,
            assetCategory: row.assetCategory,
            assetName: row.assetName,
            currency: row.currency,
            amount: row.amount,
            returnRate: row.returnRate,
            memo: row.memo || null,
          },
        });
      }),
    );
  } catch (error) {
    redirectWithMessage("/import", "error", getErrorMessage(error, locale));
  }

  revalidatePath("/snapshots");
  revalidatePath("/import");
  redirectWithMessage("/snapshots", "success", t.actions.importCompleted);
}

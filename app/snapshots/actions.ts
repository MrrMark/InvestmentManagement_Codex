"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { prisma } from "@/lib/db/prisma";
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

function getErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Validation failed.";
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return "An identical snapshot already exists.";
  }

  return "Unable to save snapshot.";
}

export async function createSnapshotAction(formData: FormData) {
  const user = await getDefaultUser();

  if (!user) {
    redirectWithMessage("/add-snapshot", "error", "Create a user before adding snapshots.");
  }

  try {
    const input = parseCreateSnapshotFormData(formData);

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
    redirectWithMessage("/add-snapshot", "error", getErrorMessage(error));
  }

  revalidatePath("/snapshots");
  revalidatePath("/add-snapshot");
  redirectWithMessage("/snapshots", "success", "Snapshot created.");
}

export async function updateSnapshotAction(formData: FormData) {
  let snapshotId = "";

  try {
    const input = parseUpdateSnapshotFormData(formData);
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
    redirectWithMessage(path, "error", getErrorMessage(error));
  }

  revalidatePath("/snapshots");
  redirectWithMessage("/snapshots", "success", "Snapshot updated.");
}

export async function deleteSnapshotAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirectWithMessage("/snapshots", "error", "Snapshot id is missing.");
  }

  try {
    await prisma.assetSnapshot.delete({
      where: { id },
    });
  } catch {
    redirectWithMessage("/snapshots", "error", "Unable to delete snapshot.");
  }

  revalidatePath("/snapshots");
  redirectWithMessage("/snapshots", "success", "Snapshot deleted.");
}

export async function importSnapshotsCsvAction(formData: FormData) {
  const user = await getDefaultUser();

  if (!user) {
    redirectWithMessage("/import", "error", "Create a user before importing snapshots.");
  }

  try {
    const rows = parseImportSnapshotRowsFormData(formData);

    if (rows.length === 0) {
      redirectWithMessage("/import", "error", "No valid rows to import.");
    }

    const accountsByName = await listAccountsByName();

    await prisma.$transaction(
      rows.map((row) => {
        const account = accountsByName.get(row.accountName);

        if (!account) {
          throw new Error(`Unknown account: ${row.accountName}`);
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
    redirectWithMessage("/import", "error", getErrorMessage(error));
  }

  revalidatePath("/snapshots");
  revalidatePath("/import");
  redirectWithMessage("/snapshots", "success", "CSV import completed.");
}

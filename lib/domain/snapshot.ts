import { z } from "zod";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

export const accountTypes = [
  "CMA",
  "PENSION_SAVINGS",
  "IRP",
  "DC_PENSION",
] as const;

export const markets = ["KR", "US"] as const;

export const assetCategories = [
  "STOCK",
  "ETF",
  "BOND",
  "ELB",
  "TDF",
] as const;

export const currencies = ["KRW", "USD"] as const;

function hasTwoDecimalPrecision(value: number) {
  return Number.isInteger(value * 100);
}

export function createSnapshotSchema(locale: Locale) {
  const t = getDictionary(locale);

  return z.object({
    snapshotMonth: z
      .string()
      .regex(/^\d{4}-\d{2}$/, t.validation.useYYYYMM),
    accountId: z.string().min(1),
    market: z.enum(markets),
    assetCategory: z.enum(assetCategories),
    assetName: z.string().trim().min(1),
    currency: z.enum(currencies),
    amount: z.coerce.number().nonnegative(),
    returnRate: z.coerce
      .number()
      .refine((value) => Number.isFinite(value), {
        message: t.validation.returnRateNumeric,
      })
      .refine(hasTwoDecimalPrecision, {
        message: t.validation.returnRatePrecision,
      }),
    memo: z.string().trim().max(200).optional().or(z.literal("")),
  });
}

export function updateSnapshotSchema(locale: Locale) {
  return createSnapshotSchema(locale).extend({
    id: z.string().min(1),
  });
}

export function importSnapshotCsvRowSchema(locale: Locale) {
  const t = getDictionary(locale);

  return z.object({
    userName: z.string().trim().optional().or(z.literal("")),
    accountName: z
      .string()
      .trim()
      .min(1, t.validation.accountRequired),
    snapshotMonth: z
      .string()
      .regex(/^\d{4}-\d{2}$/, t.validation.useYYYYMM),
    market: z.enum(markets),
    assetCategory: z.enum(assetCategories),
    assetName: z
      .string()
      .trim()
      .min(1, t.validation.assetNameRequired),
    currency: z.enum(currencies),
    amount: z.coerce
      .number()
      .nonnegative(t.validation.amountNonNegative),
    returnRate: z.coerce
      .number()
      .refine((value) => Number.isFinite(value), {
        message: t.validation.returnRateNumeric,
      })
      .refine(hasTwoDecimalPrecision, {
        message: t.validation.returnRatePrecision,
      }),
    memo: z.string().trim().max(200).optional().or(z.literal("")),
  });
}

export type CreateSnapshotInput = z.infer<
  ReturnType<typeof createSnapshotSchema>
>;
export type UpdateSnapshotInput = z.infer<
  ReturnType<typeof updateSnapshotSchema>
>;
export type ImportSnapshotCsvRowInput = z.infer<
  ReturnType<typeof importSnapshotCsvRowSchema>
>;

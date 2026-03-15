import { z } from "zod";

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

export const createSnapshotSchema = z.object({
  snapshotMonth: z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM format."),
  accountId: z.string().min(1),
  market: z.enum(markets),
  assetCategory: z.enum(assetCategories),
  assetName: z.string().trim().min(1),
  currency: z.enum(currencies),
  amount: z.coerce.number().nonnegative(),
  returnRate: z.coerce
    .number()
    .refine((value) => Number.isFinite(value), {
      message: "Return rate must be numeric.",
    })
    .refine(hasTwoDecimalPrecision, {
      message: "Return rate must use up to 2 decimal places.",
    }),
  memo: z.string().trim().max(200).optional().or(z.literal("")),
});

export const updateSnapshotSchema = createSnapshotSchema.extend({
  id: z.string().min(1),
});

export const importSnapshotCsvRowSchema = z.object({
  userName: z.string().trim().optional().or(z.literal("")),
  accountName: z.string().trim().min(1, "Account is required."),
  snapshotMonth: z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM format."),
  market: z.enum(markets),
  assetCategory: z.enum(assetCategories),
  assetName: z.string().trim().min(1, "Asset name is required."),
  currency: z.enum(currencies),
  amount: z.coerce.number().nonnegative("Amount must be non-negative."),
  returnRate: z.coerce
    .number()
    .refine((value) => Number.isFinite(value), {
      message: "Return rate must be numeric.",
    })
    .refine(hasTwoDecimalPrecision, {
      message: "Return rate must use up to 2 decimal places.",
    }),
  memo: z.string().trim().max(200).optional().or(z.literal("")),
});

export type CreateSnapshotInput = z.infer<typeof createSnapshotSchema>;
export type UpdateSnapshotInput = z.infer<typeof updateSnapshotSchema>;
export type ImportSnapshotCsvRowInput = z.infer<
  typeof importSnapshotCsvRowSchema
>;

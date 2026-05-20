import { z } from "zod";

export const locales = ["ko", "en"] as const;
export type Locale = (typeof locales)[number];

export type SnapshotValidationMessages = {
  useYYYYMM: string;
  returnRateNumeric: string;
  returnRatePrecision: string;
  accountRequired: string;
  assetNameRequired: string;
  amountNonNegative: string;
};

const snapshotValidationMessages: Record<Locale, SnapshotValidationMessages> = {
  ko: {
    useYYYYMM: "YYYY-MM 형식으로 입력하세요.",
    returnRateNumeric: "수익률은 숫자여야 합니다.",
    returnRatePrecision: "수익률은 소수점 둘째 자리까지 입력할 수 있습니다.",
    accountRequired: "계좌는 필수 입력값입니다.",
    assetNameRequired: "자산명은 필수 입력값입니다.",
    amountNonNegative: "금액은 0 이상이어야 합니다.",
  },
  en: {
    useYYYYMM: "Use YYYY-MM format.",
    returnRateNumeric: "Return rate must be numeric.",
    returnRatePrecision: "Return rate must use up to 2 decimal places.",
    accountRequired: "Account is required.",
    assetNameRequired: "Asset name is required.",
    amountNonNegative: "Amount must be non-negative.",
  },
};

export function getSnapshotValidationMessages(locale: Locale) {
  return snapshotValidationMessages[locale];
}

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
  const validation = getSnapshotValidationMessages(locale);

  return z.object({
    snapshotMonth: z
      .string()
      .regex(/^\d{4}-\d{2}$/, validation.useYYYYMM),
    accountId: z.string().min(1),
    market: z.enum(markets),
    assetCategory: z.enum(assetCategories),
    assetName: z.string().trim().min(1),
    currency: z.enum(currencies),
    amount: z.coerce.number().nonnegative(),
    returnRate: z.coerce
      .number()
      .refine((value) => Number.isFinite(value), {
        message: validation.returnRateNumeric,
      })
      .refine(hasTwoDecimalPrecision, {
        message: validation.returnRatePrecision,
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
  const validation = getSnapshotValidationMessages(locale);

  return z.object({
    userName: z.string().trim().optional().or(z.literal("")),
    accountName: z
      .string()
      .trim()
      .min(1, validation.accountRequired),
    snapshotMonth: z
      .string()
      .regex(/^\d{4}-\d{2}$/, validation.useYYYYMM),
    market: z.enum(markets),
    assetCategory: z.enum(assetCategories),
    assetName: z
      .string()
      .trim()
      .min(1, validation.assetNameRequired),
    currency: z.enum(currencies),
    amount: z.coerce
      .number()
      .nonnegative(validation.amountNonNegative),
    returnRate: z.coerce
      .number()
      .refine((value) => Number.isFinite(value), {
        message: validation.returnRateNumeric,
      })
      .refine(hasTwoDecimalPrecision, {
        message: validation.returnRatePrecision,
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

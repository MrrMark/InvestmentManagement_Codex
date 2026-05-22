import {
  importSnapshotCsvRowSchema,
  type ImportSnapshotCsvRowInput,
  type Locale,
} from "./snapshot";

export type ParsedCsvRow = Record<string, string>;

export type SnapshotCsvRow = {
  accountName: string;
  snapshotMonth: string;
  market: string;
  assetCategory: string;
  assetName: string;
  currency: string;
  amount: string | number;
  returnRate: string | number;
  memo?: string | null;
};

export const snapshotCsvHeaders = [
  "accountName",
  "snapshotMonth",
  "market",
  "assetCategory",
  "assetName",
  "currency",
  "amount",
  "returnRate",
  "memo",
] as const;

export type SnapshotCsvImportPreviewRow = {
  rowNumber: number;
  raw: ParsedCsvRow;
  parsed: ImportSnapshotCsvRowInput | null;
  errors: string[];
};

export type SnapshotCsvImportPreview = {
  errors: string[];
  rows: SnapshotCsvImportPreviewRow[];
  validRows: ImportSnapshotCsvRowInput[];
};

const requiredSnapshotCsvHeaders = snapshotCsvHeaders.filter(
  (header) => header !== "memo",
);

const csvImportMessages = {
  ko: {
    emptyFile: "CSV가 비어 있습니다. 헤더 행을 포함해 주세요.",
    missingHeaders: (headers: readonly string[]) =>
      `CSV 헤더에 ${headers.join(", ")} 필드가 필요합니다.`,
  },
  en: {
    emptyFile: "CSV is empty. Include a header row.",
    missingHeaders: (headers: readonly string[]) =>
      `CSV header must include ${headers.join(", ")}.`,
  },
} satisfies Record<
  Locale,
  {
    emptyFile: string;
    missingHeaders: (headers: readonly string[]) => string;
  }
>;

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseCsvRecords(text: string) {
  const records: string[] = [];
  const normalizedText = text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < normalizedText.length; index += 1) {
    const char = normalizedText[index];
    const nextChar = normalizedText[index + 1];

    if (char === '"') {
      current += char;

      if (inQuotes && nextChar === '"') {
        current += nextChar;
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "\n" && !inQuotes) {
      const record = current.trim();

      if (record) {
        records.push(record);
      }
      current = "";
      continue;
    }

    current += char;
  }

  const record = current.trim();

  if (record) {
    records.push(record);
  }

  return records;
}

function parseCsvDocument(text: string) {
  const lines = parseCsvRecords(text);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);

    return headers.reduce<ParsedCsvRow>((row, header, index) => {
      row[header] = values[index] ?? "";
      return row;
    }, {});
  });

  return { headers, rows };
}

export function parseCsvText(text: string) {
  return parseCsvDocument(text).rows;
}

function escapeCsvCell(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }

  return value;
}

export function serializeSnapshotCsvRows(rows: readonly SnapshotCsvRow[]) {
  const lines = [snapshotCsvHeaders.join(",")];

  for (const row of rows) {
    lines.push(
      [
        row.accountName,
        row.snapshotMonth,
        row.market,
        row.assetCategory,
        row.assetName,
        row.currency,
        String(row.amount),
        String(row.returnRate),
        row.memo ?? "",
      ]
        .map(escapeCsvCell)
        .join(","),
    );
  }

  return lines.join("\n");
}

function hasParsedImportRow(
  row: SnapshotCsvImportPreviewRow,
): row is SnapshotCsvImportPreviewRow & { parsed: ImportSnapshotCsvRowInput } {
  return row.parsed !== null;
}

export function buildSnapshotCsvImportPreview({
  text,
  locale,
  accountNames,
  unknownAccountPrefix,
}: {
  text: string;
  locale: Locale;
  accountNames: readonly string[];
  unknownAccountPrefix: string;
}): SnapshotCsvImportPreview {
  const { headers, rows } = parseCsvDocument(text);
  const accountNameSet = new Set(accountNames);
  const schema = importSnapshotCsvRowSchema(locale);
  const messages = csvImportMessages[locale];
  const missingHeaders = requiredSnapshotCsvHeaders.filter(
    (header) => !headers.includes(header),
  );
  const previewErrors =
    headers.length === 0
      ? [messages.emptyFile]
      : missingHeaders.length > 0
        ? [messages.missingHeaders(missingHeaders)]
        : [];
  const previewRows = rows.map((row, index) => {
    const parsedResult = schema.safeParse(row);
    const errors: string[] = [];

    if (!parsedResult.success) {
      errors.push(...parsedResult.error.issues.map((issue) => issue.message));
    } else if (!accountNameSet.has(parsedResult.data.accountName)) {
      errors.push(`${unknownAccountPrefix}${parsedResult.data.accountName}`);
    }

    return {
      rowNumber: index + 2,
      raw: row,
      parsed: parsedResult.success && errors.length === 0 ? parsedResult.data : null,
      errors,
    };
  });

  return {
    errors: previewErrors,
    rows: previewRows,
    validRows: previewRows.filter(hasParsedImportRow).map((row) => row.parsed),
  };
}

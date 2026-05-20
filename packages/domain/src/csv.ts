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

export function parseCsvText(text: string) {
  const lines = parseCsvRecords(text);

  if (lines.length === 0) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);

    return headers.reduce<ParsedCsvRow>((row, header, index) => {
      row[header] = values[index] ?? "";
      return row;
    }, {});
  });
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

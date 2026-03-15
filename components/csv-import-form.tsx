"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import { parseCsvText } from "@/lib/domain/csv";
import {
  importSnapshotCsvRowSchema,
  type ImportSnapshotCsvRowInput,
} from "@/lib/domain/snapshot";
import type { Locale } from "@/lib/i18n/locale";

type CsvPreviewRow = {
  rowNumber: number;
  raw: Record<string, string>;
  parsed: ImportSnapshotCsvRowInput | null;
  errors: string[];
};

type CsvImportFormLabels = {
  fileLabel: string;
  requiredHeaders: string;
  importButton: string;
  row: string;
  status: string;
  valid: string;
  csvEmpty: string;
  parseSummary: string;
  unknownAccount: string;
};

type CsvImportFormProps = {
  locale: Locale;
  accountNames: string[];
  action: (formData: FormData) => void | Promise<void>;
  labels: CsvImportFormLabels;
};

const previewHeaders = [
  "accountName",
  "snapshotMonth",
  "market",
  "assetCategory",
  "assetName",
  "currency",
  "amount",
  "returnRate",
] as const;

function formatParseSummary(template: string, validCount: number, totalCount: number) {
  return template
    .replace("{valid}", String(validCount))
    .replace("{total}", String(totalCount));
}

export function CsvImportForm({
  locale,
  accountNames,
  action,
  labels,
}: CsvImportFormProps) {
  const [previewRows, setPreviewRows] = useState<CsvPreviewRow[]>([]);
  const [parseMessage, setParseMessage] = useState("");

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setPreviewRows([]);
      setParseMessage("");
      return;
    }

    const text = await file.text();
    const rows = parseCsvText(text);

    if (rows.length === 0) {
      setPreviewRows([]);
      setParseMessage(labels.csvEmpty);
      return;
    }

    const schema = importSnapshotCsvRowSchema(locale);
    const nextPreviewRows = rows.map((row, index) => {
      const parsedResult = schema.safeParse(row);
      const errors: string[] = [];

      if (!parsedResult.success) {
        errors.push(
          ...parsedResult.error.issues.map((issue) => issue.message),
        );
      } else if (!accountNames.includes(parsedResult.data.accountName)) {
        errors.push(`${labels.unknownAccount}: ${parsedResult.data.accountName}`);
      }

      return {
        rowNumber: index + 2,
        raw: row,
        parsed: parsedResult.success && errors.length === 0 ? parsedResult.data : null,
        errors,
      };
    });

    setPreviewRows(nextPreviewRows);
    setParseMessage(
      formatParseSummary(
        labels.parseSummary,
        nextPreviewRows.filter((row) => row.parsed).length,
        nextPreviewRows.length,
      ),
    );
  }

  const validRows = previewRows
    .filter((row) => row.parsed)
    .map((row) => row.parsed) as ImportSnapshotCsvRowInput[];

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-4">
        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>{labels.fileLabel}</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="block w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
          />
        </label>

        <input type="hidden" name="rowsJson" value={JSON.stringify(validRows)} />

        <p className="text-sm text-stone-600">{labels.requiredHeaders}</p>

        {parseMessage ? <p className="text-sm text-stone-700">{parseMessage}</p> : null}

        <button
          type="submit"
          disabled={validRows.length === 0}
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {labels.importButton}
        </button>
      </form>

      {previewRows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-stone-500">
              <tr>
                <th className="pb-3 pr-4 font-medium">{labels.row}</th>
                {previewHeaders.map((header) => (
                  <th key={header} className="pb-3 pr-4 font-medium">
                    {header}
                  </th>
                ))}
                <th className="pb-3 font-medium">{labels.status}</th>
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row) => (
                <tr key={row.rowNumber} className="border-t border-stone-200 align-top">
                  <td className="py-3 pr-4">{row.rowNumber}</td>
                  {previewHeaders.map((header) => (
                    <td key={header} className="py-3 pr-4">
                      {row.raw[header] ?? ""}
                    </td>
                  ))}
                  <td className="py-3">
                    {row.errors.length > 0 ? (
                      <ul className="space-y-1 text-red-700">
                        {row.errors.map((error) => (
                          <li key={`${row.rowNumber}-${error}`}>{error}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-stone-700">{labels.valid}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

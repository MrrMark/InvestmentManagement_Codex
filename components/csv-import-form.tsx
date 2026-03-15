"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import { parseCsvText } from "@/lib/domain/csv";
import {
  importSnapshotCsvRowSchema,
  type ImportSnapshotCsvRowInput,
} from "@/lib/domain/snapshot";

type CsvPreviewRow = {
  rowNumber: number;
  raw: Record<string, string>;
  parsed: ImportSnapshotCsvRowInput | null;
  errors: string[];
};

type CsvImportFormProps = {
  accountNames: string[];
  action: (formData: FormData) => void | Promise<void>;
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

export function CsvImportForm({ accountNames, action }: CsvImportFormProps) {
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
      setParseMessage("CSV is empty.");
      return;
    }

    const nextPreviewRows = rows.map((row, index) => {
      const parsedResult = importSnapshotCsvRowSchema.safeParse(row);
      const errors: string[] = [];

      if (!parsedResult.success) {
        errors.push(
          ...parsedResult.error.issues.map((issue) => issue.message),
        );
      } else if (!accountNames.includes(parsedResult.data.accountName)) {
        errors.push(`Unknown account: ${parsedResult.data.accountName}`);
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
      `${nextPreviewRows.filter((row) => row.parsed).length} valid / ${nextPreviewRows.length} total rows`,
    );
  }

  const validRows = previewRows
    .filter((row) => row.parsed)
    .map((row) => row.parsed) as ImportSnapshotCsvRowInput[];

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-4">
        <label className="block space-y-2 text-sm font-medium text-stone-700">
          <span>CSV file</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="block w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
          />
        </label>

        <input type="hidden" name="rowsJson" value={JSON.stringify(validRows)} />

        <p className="text-sm text-stone-600">
          Required headers: accountName, snapshotMonth, market, assetCategory,
          assetName, currency, amount, returnRate, memo
        </p>

        {parseMessage ? <p className="text-sm text-stone-700">{parseMessage}</p> : null}

        <button
          type="submit"
          disabled={validRows.length === 0}
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          Import Valid Rows
        </button>
      </form>

      {previewRows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-stone-500">
              <tr>
                <th className="pb-3 pr-4 font-medium">Row</th>
                {previewHeaders.map((header) => (
                  <th key={header} className="pb-3 pr-4 font-medium">
                    {header}
                  </th>
                ))}
                <th className="pb-3 font-medium">Status</th>
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
                      <span className="text-stone-700">Valid</span>
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

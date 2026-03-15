import {
  assetCategories,
  currencies,
  markets,
} from "@/lib/domain/snapshot";
import type { Account, AssetSnapshot } from "@prisma/client";

type SnapshotFormProps = {
  accounts: Account[];
  action: (formData: FormData) => void | Promise<void>;
  submitLabel?: string;
  snapshot?: Pick<
    AssetSnapshot,
    | "id"
    | "snapshotMonth"
    | "accountId"
    | "market"
    | "assetCategory"
    | "assetName"
    | "currency"
    | "amount"
    | "returnRate"
    | "memo"
  >;
};

const fields = [
  { name: "snapshotMonth", label: "Snapshot Month", type: "month" },
  { name: "assetName", label: "Asset Name", type: "text" },
  { name: "amount", label: "Amount", type: "number" },
  { name: "returnRate", label: "Return Rate (%)", type: "number" },
] as const;

function getDefaultValue(
  fieldName: (typeof fields)[number]["name"],
  snapshot?: SnapshotFormProps["snapshot"],
) {
  if (!snapshot) {
    return "";
  }

  if (fieldName === "amount" || fieldName === "returnRate") {
    return snapshot[fieldName].toString();
  }

  return snapshot[fieldName] ?? "";
}

export function SnapshotForm({
  accounts,
  action,
  submitLabel = "Save Snapshot",
  snapshot,
}: SnapshotFormProps) {
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      {snapshot ? <input type="hidden" name="id" value={snapshot.id} /> : null}

      {fields.map((field) => (
        <label key={field.name} className="space-y-2 text-sm font-medium text-stone-700">
          <span>{field.label}</span>
          <input
            name={field.name}
            type={field.type}
            step={field.type === "number" ? "0.01" : undefined}
            defaultValue={getDefaultValue(field.name, snapshot)}
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-stone-500"
          />
        </label>
      ))}

      <label className="space-y-2 text-sm font-medium text-stone-700">
        <span>Account</span>
        <select
          name="accountId"
          defaultValue={snapshot?.accountId ?? accounts[0]?.id ?? ""}
          className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-stone-700">
        <span>Market</span>
        <select
          name="market"
          defaultValue={snapshot?.market ?? markets[0]}
          className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
        >
          {markets.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-stone-700">
        <span>Asset Category</span>
        <select
          name="assetCategory"
          defaultValue={snapshot?.assetCategory ?? assetCategories[0]}
          className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
        >
          {assetCategories.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-stone-700">
        <span>Currency</span>
        <select
          name="currency"
          defaultValue={snapshot?.currency ?? currencies[0]}
          className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
        >
          {currencies.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-stone-700 md:col-span-2">
        <span>Memo</span>
        <textarea
          name="memo"
          rows={4}
          defaultValue={snapshot?.memo ?? ""}
          className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none transition focus:border-stone-500"
        />
      </label>

      <div className="md:col-span-2">
        <button
          type="submit"
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n/locale";

type LanguageSwitcherProps = {
  locale: Locale;
  action: (formData: FormData) => void | Promise<void>;
  label: string;
  koLabel: string;
  enLabel: string;
};

export function LanguageSwitcher({
  locale,
  action,
  label,
  koLabel,
  enLabel,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const redirectTo = query ? `${pathname}?${query}` : pathname;

  return (
    <form action={action} className="flex items-center gap-2">
      <span className="text-xs font-medium text-stone-500">{label}</span>
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <button
        type="submit"
        name="locale"
        value="ko"
        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
          locale === "ko"
            ? "border-stone-900 bg-stone-900 text-white"
            : "border-stone-300 text-stone-700 hover:border-stone-900 hover:text-stone-900"
        }`}
      >
        {koLabel}
      </button>
      <button
        type="submit"
        name="locale"
        value="en"
        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
          locale === "en"
            ? "border-stone-900 bg-stone-900 text-white"
            : "border-stone-300 text-stone-700 hover:border-stone-900 hover:text-stone-900"
        }`}
      >
        {enLabel}
      </button>
    </form>
  );
}

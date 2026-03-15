import type { Metadata } from "next";
import Link from "next/link";
import { setLocaleAction } from "@/app/actions/locale";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/locale";
import "./globals.css";

export const metadata: Metadata = {
  title: "월간 자산 포트폴리오 매니저",
  description: "수동 월간 투자 스냅샷 관리 앱",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const navigation = [
    { href: "/", label: t.navigation.dashboard },
    { href: "/snapshots", label: t.navigation.snapshots },
    { href: "/add-snapshot", label: t.navigation.addSnapshot },
    { href: "/import", label: t.navigation.importCsv },
    { href: "/compare", label: t.navigation.compare },
  ];

  return (
    <html lang={locale}>
      <body className="bg-stone-50 text-stone-900 antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
          <header className="mb-8 rounded-2xl border border-stone-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
                  {t.metadata.appEyebrow}
                </p>
                <h1 className="text-2xl font-semibold text-stone-900">
                  {t.metadata.appTitle}
                </h1>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <LanguageSwitcher
                  locale={locale}
                  action={setLocaleAction}
                  label={t.common.languageLabel}
                  koLabel={t.common.languageKo}
                  enLabel={t.common.languageEn}
                />
                <nav aria-label={t.common.primaryNavAria}>
                  <ul className="flex flex-wrap gap-2">
                    {navigation.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="inline-flex rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}

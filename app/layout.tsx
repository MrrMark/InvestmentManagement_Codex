import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monthly Asset Portfolio Manager",
  description: "Manual monthly investment snapshot management app",
};

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/snapshots", label: "Snapshots" },
  { href: "/add-snapshot", label: "Add Snapshot" },
  { href: "/import", label: "Import CSV" },
  { href: "/compare", label: "Compare" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-stone-50 text-stone-900 antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
          <header className="mb-8 rounded-2xl border border-stone-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
                  Monthly Asset Portfolio Manager
                </p>
                <h1 className="text-2xl font-semibold text-stone-900">
                  Personal Investment Snapshot App
                </h1>
              </div>
              <nav aria-label="Primary">
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
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}

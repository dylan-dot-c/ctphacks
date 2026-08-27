import Link from "next/link";

const COPYRIGHT_YEAR = 2026;

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-16 w-full max-w-7xl border-t border-white/10 px-6 py-8 text-sm text-slate-400">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p>&copy; {COPYRIGHT_YEAR} PhishingHook. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/" className="transition hover:text-white">
            Scan
          </Link>
          <Link href="/scan-history" className="transition hover:text-white">
            Scan history
          </Link>
          <Link href="/protected" className="transition hover:text-white">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}

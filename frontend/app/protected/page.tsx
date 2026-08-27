import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const savedScans = [
  {
    id: "PH-1048",
    type: "Credential phishing",
    risk: "87 / 100",
    status: "High risk",
    date: "Aug 27, 2026",
  },
  {
    id: "PH-1031",
    type: "Suspicious invoice",
    risk: "63 / 100",
    status: "Moderate risk",
    date: "Aug 24, 2026",
  },
  {
    id: "PH-1022",
    type: "Fake security alert",
    risk: "41 / 100",
    status: "Low risk",
    date: "Aug 18, 2026",
  },
];

const history = [
  { label: "Bank payment request", status: "Flagged", date: "Aug 27" },
  { label: "HR document request", status: "Reviewed", date: "Aug 25" },
  { label: "Suspicious delivery notice", status: "Saved", date: "Aug 21" },
  { label: "Password reset message", status: "Safe", date: "Aug 16" },
];

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const email = String(data.claims.email ?? "user@example.com");
  const username = email.split("@")[0] || "User";

  return (
    <div className="w-full max-w-6xl px-4 py-8 text-white">
      <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/80 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Dashboard</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
            Welcome back, {username}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Home
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            New scan
          </Link>
          <Link
            href="/scan-history"
            className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
          >
            View history
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Saved reports</p>
          <p className="mt-3 text-3xl font-bold text-white">{savedScans.length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Total scans</p>
          <p className="mt-3 text-3xl font-bold text-white">12</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Account email</p>
          <p className="mt-3 text-lg font-semibold text-emerald-200">{email}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Saved scans</h2>
            <Link href="/save-report" className="text-sm font-medium text-emerald-300 hover:text-emerald-200">
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {savedScans.map((scan) => (
              <div key={scan.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-200">
                        {scan.id}
                      </span>
                      <span className="text-sm text-slate-400">{scan.date}</span>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-white">{scan.type}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-200">
                      {scan.status}
                    </span>
                    <span className="text-sm font-semibold text-white">{scan.risk}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">
          <h2 className="text-2xl font-bold text-white">History</h2>
          <div className="mt-5 space-y-3">
            {history.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                <div>
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.date}</p>
                </div>
                <span
                  className={
                    item.status === "Flagged"
                      ? "rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-200"
                      : item.status === "Safe"
                        ? "rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-200"
                        : "rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-200"
                  }
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

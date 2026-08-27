"use client";

import { useEffect, useState } from "react";
import {
  fetchAnalyses,
  getAccessToken,
  describeApiError,
  type HistoryItem,
} from "@/lib/api";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";

const RISK_BADGE: Record<string, string> = {
  low: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  suspicious: "border-amber-500/20 bg-amber-500/10 text-amber-200",
  high: "border-red-500/20 bg-red-500/10 text-red-200",
  very_high: "border-red-500/30 bg-red-500/20 text-red-200",
};

export default function ScanHistoryPage() {
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [error, setError] = useState<{ title: string; message: string } | null>(
    null,
  );
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getAccessToken();
      if (!token) {
        setSignedOut(true);
        return;
      }
      try {
        const data = await fetchAnalyses(token);
        setItems(data);
      } catch (err) {
        setError(describeApiError(err));
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#0f172a_30%,#111827_65%,#0b1120_100%)] text-white">
      <div className="mx-auto max-w-5xl px-6 pt-6 lg:px-8">
        <SiteNavbar />
      </div>
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Scan history
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white">
            Recent phishing checks
          </h1>
        </div>

        {signedOut && (
          <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 text-center">
            <p className="text-slate-300">
              Sign in to view your saved scan history.
            </p>
            <a
              href="/auth/login"
              className="mt-5 inline-block rounded-full bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Sign In
            </a>
          </section>
        )}

        {error && (
          <section className="rounded-[28px] border border-rose-500/30 bg-rose-500/10 p-8 text-center">
            <h2 className="text-xl font-bold text-white">{error.title}</h2>
            <p className="mt-3 text-rose-100">{error.message}</p>
          </section>
        )}

        {!signedOut && !error && items === null && (
          <p className="text-center text-slate-300">Loading scan history...</p>
        )}

        {items && items.length === 0 && (
          <p className="text-center text-slate-300">
            No saved scans yet. Run a detailed scan while signed in to save one.
          </p>
        )}

        {items && items.length > 0 && (
          <div className="space-y-4">
            {items.map((item) => (
              <a
                key={item.analysis_id}
                href={`/results?id=${item.analysis_id}`}
                className="block rounded-[24px] border border-white/10 bg-slate-900/80 p-5 transition hover:border-emerald-400/30"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm uppercase tracking-[0.2em] text-slate-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="mt-3 text-2xl font-bold text-white">
                      {item.classification.replaceAll("_", " ")}
                    </h2>
                    <p className="mt-2 max-w-xl text-sm text-slate-300">
                      {item.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-center">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-400">
                        Score
                      </p>
                      <p className="mt-1 text-lg font-bold text-white">
                        {item.risk_score} / 100
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${RISK_BADGE[item.risk_level] ?? RISK_BADGE.low}`}
                    >
                      {item.risk_level.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/protected"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Back to Profile
          </a>
          <a
            href="/"
            className="rounded-full bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Run Another Scan
          </a>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

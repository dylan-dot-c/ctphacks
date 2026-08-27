"use client";

import { useEffect, useState } from "react";
import {
  fetchAnalyses,
  getAccessToken,
  describeApiError,
  type HistoryItem,
} from "@/lib/api";

const RISK_BADGE: Record<string, string> = {
  low: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  suspicious: "border-amber-500/20 bg-amber-500/10 text-amber-200",
  high: "border-red-500/20 bg-red-500/10 text-red-200",
  very_high: "border-red-500/30 bg-red-500/20 text-red-200",
};

interface DashboardOverviewProps {
  fullName: string;
  email: string;
}

export function DashboardOverview({ fullName, email }: DashboardOverviewProps) {
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [error, setError] = useState<{ title: string; message: string } | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      const token = await getAccessToken();
      if (!token) return;
      try {
        setItems(await fetchAnalyses(token));
      } catch (err) {
        setError(describeApiError(err));
      }
    })();
  }, []);

  const riskCounts = (items ?? []).reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.risk_level] = (acc[item.risk_level] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Saved reports</p>
          <p className="mt-3 text-3xl font-bold text-white">
            {items?.length ?? "—"}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Highest risk found</p>
          <p className="mt-3 text-3xl font-bold text-white">
            {items && items.length > 0
              ? Math.max(...items.map((i) => i.risk_score))
              : "—"}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Profile</p>
          <p className="mt-3 text-lg font-semibold text-emerald-200">
            {fullName}
          </p>
          <p className="mt-2 text-sm text-slate-300">{email}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Saved scans</h2>
            <a
              href="/scan-history"
              className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
            >
              View all
            </a>
          </div>

          {error && <p className="text-sm text-rose-300">{error.message}</p>}
          {!error && items === null && (
            <p className="text-sm text-slate-400">Loading...</p>
          )}
          {items && items.length === 0 && (
            <p className="text-sm text-slate-400">
              No saved scans yet. Run a detailed scan to see it here.
            </p>
          )}

          <div className="space-y-4">
            {items?.slice(0, 5).map((scan) => (
              <a
                key={scan.analysis_id}
                href={`/results?id=${scan.analysis_id}`}
                className="block rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-emerald-400/30"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-400">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-white">
                      {scan.classification.replaceAll("_", " ")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${RISK_BADGE[scan.risk_level] ?? RISK_BADGE.low}`}
                    >
                      {scan.risk_level.replaceAll("_", " ")}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {scan.risk_score} / 100
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">
          <h2 className="text-2xl font-bold text-white">Risk breakdown</h2>
          <div className="mt-5 space-y-3">
            {["very_high", "high", "suspicious", "low"].map((level) => (
              <div
                key={level}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3"
              >
                <span className="font-medium text-white">
                  {level.replaceAll("_", " ")}
                </span>
                <span
                  className={`rounded-full border px-2 py-1 text-xs font-medium ${RISK_BADGE[level]}`}
                >
                  {riskCounts[level] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

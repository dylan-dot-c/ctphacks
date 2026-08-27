"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  analyzeQuick,
  analyzeDetailed,
  fetchAnalysisById,
  getAccessToken,
  describeApiError,
  type QuickAnalysisResult,
  type DetailedAnalysisResult,
} from "@/lib/api";
import { SCAN_MESSAGE_KEY, SCAN_IMAGE_KEY } from "@/components/scanner-form";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";

const RESULT_CACHE_PREFIX = "phishing_result_cache_";

interface CachedResult {
  quickResult: QuickAnalysisResult | null;
  detailedResult: DetailedAnalysisResult | null;
}

function saveResultCache(id: string, data: CachedResult) {
  try {
    sessionStorage.setItem(RESULT_CACHE_PREFIX + id, JSON.stringify(data));
  } catch {
    // ignore storage errors (quota, private browsing, etc.)
  }
}

function loadResultCache(id: string): CachedResult | null {
  try {
    const raw = sessionStorage.getItem(RESULT_CACHE_PREFIX + id);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const RISK_BREAKDOWN_MAX: Record<string, number> = {
  urgency: 20,
  impersonation: 20,
  credential_request: 25,
  suspicious_link: 20,
  financial_request: 10,
  other_risk: 5,
};

const RISK_LEVEL_LABEL: Record<string, string> = {
  low: "Low risk",
  suspicious: "Suspicious",
  high: "High risk",
  very_high: "Very high risk",
};

function riskLevelClasses(level: string) {
  if (level === "very_high" || level === "high") {
    return {
      panel: "rounded-2xl border border-red-500/30 bg-red-500/10 p-5",
      label: "text-sm uppercase tracking-[0.2em] text-red-200",
      value: "text-lg text-red-200",
      bar: "h-full rounded-full bg-gradient-to-r from-red-500 via-red-400 to-rose-500",
    };
  }
  if (level === "suspicious") {
    return {
      panel: "rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5",
      label: "text-sm uppercase tracking-[0.2em] text-amber-200",
      value: "text-lg text-amber-200",
      bar: "h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500",
    };
  }
  return {
    panel: "rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5",
    label: "text-sm uppercase tracking-[0.2em] text-emerald-200",
    value: "text-lg text-emerald-200",
    bar: "h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400",
  };
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const historyId = searchParams.get("id");
  const initializedRef = useRef(false);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const [quickResult, setQuickResult] = useState<QuickAnalysisResult | null>(
    null,
  );
  const [quickLoading, setQuickLoading] = useState(true);
  const [quickError, setQuickError] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const [detailedResult, setDetailedResult] =
    useState<DetailedAnalysisResult | null>(null);
  const [detailedLoading, setDetailedLoading] = useState(false);
  const [detailedError, setDetailedError] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const runScan = useCallback(async () => {
    const stored = sessionStorage.getItem(SCAN_MESSAGE_KEY);
    const storedImage = sessionStorage.getItem(SCAN_IMAGE_KEY);

    const token = await getAccessToken();
    setIsLoggedIn(Boolean(token));

    if (!stored && !storedImage) {
      setQuickLoading(false);
      setQuickError({
        title: "No message to analyze",
        message:
          "Go back home and paste a message or upload a screenshot to scan.",
      });
      return;
    }

    setQuickLoading(true);
    setQuickError(null);
    let quick: QuickAnalysisResult | null = null;
    try {
      quick = await analyzeQuick(stored ?? "", storedImage ?? undefined);
      setQuickResult(quick);
    } catch (err) {
      setQuickError(describeApiError(err));
    } finally {
      setQuickLoading(false);
    }

    let detailed: DetailedAnalysisResult | null = null;
    if (token) {
      setDetailedLoading(true);
      setDetailedError(null);
      try {
        detailed = await analyzeDetailed(
          stored ?? "",
          token,
          storedImage ?? undefined,
        );
        setDetailedResult(detailed);
      } catch (err) {
        setDetailedError(describeApiError(err));
      } finally {
        setDetailedLoading(false);
      }
    }

    // Cache the question/image + results and tag the URL with an id so
    // reopening this exact result (back button, refresh, share) doesn't
    // re-run the AI analysis.
    if (quick || detailed) {
      const id = detailed?.analysis_id ?? crypto.randomUUID();
      saveResultCache(id, { quickResult: quick, detailedResult: detailed });
      router.replace(`/results?id=${id}`, { scroll: false });
    }
  }, [router]);

  const loadHistoryItem = useCallback(async (id: string) => {
    const cached = loadResultCache(id);
    if (cached) {
      setQuickResult(cached.quickResult);
      setDetailedResult(cached.detailedResult);
      setQuickLoading(false);
      const token = await getAccessToken();
      setIsLoggedIn(cached.detailedResult ? true : Boolean(token));
      return;
    }

    setQuickLoading(true);
    const token = await getAccessToken();
    setIsLoggedIn(Boolean(token));

    if (!token) {
      setQuickLoading(false);
      setQuickError({
        title: "Sign in required",
        message: "Please sign in to view saved analyses.",
      });
      return;
    }

    setDetailedLoading(true);
    try {
      const result = await fetchAnalysisById(id, token);
      setDetailedResult(result);
      saveResultCache(id, { quickResult: null, detailedResult: result });
      setQuickError(null);
    } catch (err) {
      setQuickError(describeApiError(err));
    } finally {
      setQuickLoading(false);
      setDetailedLoading(false);
    }
  }, []);

  useEffect(() => {
    // Guard against re-running when our own router.replace adds ?id= after a scan
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (historyId) {
      loadHistoryItem(historyId);
    } else {
      runScan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const primary = detailedResult ?? quickResult;
  const riskScore = primary?.risk_score ?? 0;
  const riskLevel = primary?.risk_level ?? "low";
  const classes = riskLevelClasses(riskLevel);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#0f172a_30%,#111827_65%,#0b1120_100%)] text-white">
      <div className="mx-auto max-w-5xl px-6 pt-6 lg:px-8">
        <SiteNavbar />
      </div>
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <a
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Home
          </a>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              {quickResult ? "Quick safety result" : "Saved analysis"}
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white">
              {primary ? primary.summary.split(".")[0] : "Analyzing message..."}
            </h1>
          </div>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-200">
            {primary ? primary.classification.replaceAll("_", " ") : "..."}
          </span>
        </div>

        {quickLoading && (
          <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 text-center">
            <p className="text-slate-300">
              Scanning the message for phishing indicators...
            </p>
          </section>
        )}

        {!quickLoading && quickError && (
          <section className="rounded-[28px] border border-rose-500/30 bg-rose-500/10 p-8 text-center">
            <h2 className="text-xl font-bold text-white">{quickError.title}</h2>
            <p className="mt-3 text-rose-100">{quickError.message}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() =>
                  historyId ? loadHistoryItem(historyId) : runScan()
                }
                className="rounded-full bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Try again
              </button>
              <a
                href="/"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Home
              </a>
            </div>
          </section>
        )}

        {!quickLoading && !quickError && primary && (
          <>
            <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 md:p-8">
              <div className="mt-2 grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                    Summary
                  </p>
                  <p className="mt-4 text-lg leading-8 text-slate-200">
                    {primary.summary}
                  </p>
                </div>

                <div className={classes.panel}>
                  <p className={classes.label}>
                    {RISK_LEVEL_LABEL[riskLevel] ?? riskLevel}
                  </p>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <span className="text-4xl font-black text-white">
                      {riskScore}
                    </span>
                    <span className={classes.value}>/ 100</span>
                  </div>
                  <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={classes.bar}
                      style={{ width: `${riskScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">
                  Top warning signs
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                  {primary.warning_signs.map((warning) => (
                    <li key={warning.title} className="flex gap-3">
                      <span className="mt-1 text-rose-400">●</span>
                      <span>
                        <span className="font-semibold text-white">
                          {warning.title}:
                        </span>{" "}
                        {warning.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {quickResult && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Quick recommendation
                  </p>
                  <p className="mt-3 text-slate-200">
                    {quickResult.quick_recommendation}
                  </p>
                </div>
              )}
            </section>

            <section className="mt-10 rounded-[28px] border border-white/10 bg-slate-900/80 p-6 md:p-8">
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Detailed Analysis
                </p>
                <h2 className="mt-3 text-2xl font-bold text-white">
                  Detailed Security Analysis
                </h2>
              </div>

              {isLoggedIn === false && (
                <div className="relative flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 p-10 text-center">
                  <div className="mb-3 text-4xl">🔒</div>
                  <h3 className="text-2xl font-bold text-white">
                    Unlock Detailed Results
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
                    Sign in to see exactly why this message was flagged and what
                    to do next.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <a
                      href="/auth/login"
                      className="rounded-full bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
                    >
                      Sign In
                    </a>
                    <a
                      href="/auth/sign-up"
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                    >
                      Create Account
                    </a>
                  </div>
                </div>
              )}

              {isLoggedIn && detailedLoading && (
                <p className="text-center text-slate-300">
                  Loading detailed breakdown...
                </p>
              )}

              {isLoggedIn && !detailedLoading && detailedError && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
                  <h3 className="text-lg font-bold text-white">
                    {detailedError.title}
                  </h3>
                  <p className="mt-2 text-rose-100">{detailedError.message}</p>
                </div>
              )}

              {isLoggedIn && !detailedLoading && detailedResult && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Object.entries(detailedResult.risk_breakdown).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                        >
                          <div className="text-sm text-slate-400">
                            {key.replaceAll("_", " ")}
                          </div>
                          <div className="mt-2 text-xl font-bold text-white">
                            {value} / {RISK_BREAKDOWN_MAX[key] ?? "?"}
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                      Evidence From the Message
                    </p>
                    <div className="mt-5 space-y-4">
                      {detailedResult.evidence.map((item, i) => (
                        <div
                          key={i}
                          className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                        >
                          <p className="text-lg font-medium text-white">
                            &quot;{item.text}&quot;
                          </p>
                          <p className="mt-3 text-sm text-slate-300">
                            Flagged because:
                          </p>
                          <p className="mt-1 text-emerald-300">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                      Social Engineering Analysis
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {detailedResult.social_engineering.map((item, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200"
                          title={item.explanation}
                        >
                          {item.technique} ({item.severity})
                        </span>
                      ))}
                    </div>
                  </div>

                  {detailedResult.detected_urls.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                        Detected Links
                      </p>
                      <div className="mt-4 space-y-3">
                        {detailedResult.detected_urls.map((item, i) => (
                          <div
                            key={i}
                            className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                          >
                            <p className="break-all font-mono text-sm text-white">
                              {item.url}
                            </p>
                            <p className="mt-2 text-sm text-slate-300">
                              {item.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                      Recommended Actions
                    </p>
                    <ol className="mt-4 list-decimal space-y-3 pl-5 text-base leading-7 text-slate-200">
                      {[...detailedResult.recommended_actions]
                        .sort((a, b) => a.priority - b.priority)
                        .map((tip) => (
                          <li key={tip.priority}>{tip.action}</li>
                        ))}
                    </ol>
                  </div>

                  <p className="text-xs text-slate-500">
                    Saved {new Date(detailedResult.created_at).toLocaleString()}
                  </p>
                </div>
              )}
            </section>
          </>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a
            href="/"
            className="rounded-full bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Analyze Another Message
          </a>
          {isLoggedIn && (
            <a
              href="/scan-history"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              View Scan History
            </a>
          )}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsContent />
    </Suspense>
  );
}

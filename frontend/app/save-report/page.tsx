const savedReport = {
  title: "Likely Credential Phishing",
  timestamp: "Aug 27, 2026 • 10:42 AM",
  classification: "Credential Phishing",
  summary:
    "The submitted message used urgency, impersonation, and a credential request to pressure the user into entering login information on a fake page.",
  riskLevel: "High risk",
  score: "87 / 100",
};

export default function SaveReportPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
        <div className="rounded-[30px] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-cyan-500/10 p-8 md:p-10">
          <div className="flex items-center gap-3 text-emerald-300">
            <span className="text-3xl">✅</span>
            <p className="text-sm font-semibold uppercase tracking-[0.2em]">Report saved</p>
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight text-white md:text-4xl">
            Your analysis has been saved to your account.
          </h1>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-slate-950/70 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Saved report</p>
                <h2 className="mt-2 text-2xl font-bold text-white">{savedReport.title}</h2>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-200">
                {savedReport.riskLevel}
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Score</p>
                <p className="mt-2 text-2xl font-bold text-white">{savedReport.score}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Classification</p>
                <p className="mt-2 text-lg font-semibold text-white">{savedReport.classification}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Saved</p>
                <p className="mt-2 text-lg font-semibold text-white">{savedReport.timestamp}</p>
              </div>
            </div>

            <p className="mt-6 text-base leading-7 text-slate-200">{savedReport.summary}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/"
              className="rounded-full bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Analyze Another Message
            </a>
            <a
              href="/scan-history"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              View Scan History
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

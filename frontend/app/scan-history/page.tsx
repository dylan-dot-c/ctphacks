const historyItems = [
  {
    id: "AN-1042",
    date: "Aug 27, 2026",
    type: "Credential Phishing",
    score: "87 / 100",
    status: "High Risk",
  },
  {
    id: "AN-1038",
    date: "Aug 26, 2026",
    type: "Suspicious Invoice",
    score: "74 / 100",
    status: "Medium Risk",
  },
  {
    id: "AN-1029",
    date: "Aug 24, 2026",
    type: "Safe Message",
    score: "12 / 100",
    status: "Low Risk",
  },
];

export default function ScanHistoryPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#0f172a_30%,#111827_65%,#0b1120_100%)] text-white">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Scan history</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Recent phishing checks</h1>
        </div>

        <div className="space-y-4">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5 transition hover:border-emerald-400/30"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{item.id}</p>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs uppercase tracking-[0.12em] text-slate-300">
                      {item.date}
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-bold text-white">{item.type}</h2>
                </div>

                <div className="flex items-center gap-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-center">
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Score</p>
                    <p className="mt-1 text-lg font-bold text-white">{item.score}</p>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-200">
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

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
          <a
            href="/results"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Open Latest Result
          </a>
        </div>
      </div>
    </main>
  );
}

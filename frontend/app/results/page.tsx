const warningSigns = [
  "Urgent threat that claims the account will be suspended within 24 hours.",
  "Direct request to verify credentials via a link or form.",
  "Impersonation of a trusted organization or security team.",
  "Pressure to act immediately without checking official channels.",
];

const findings = [
  {
    title: "Urgency Detection",
    text: "The message creates fear by threatening account suspension within 24 hours. This is a common social engineering tactic used to rush the victim into action.",
  },
  {
    title: "Threat / Fear Tactics",
    text: "It relies on panic and urgency rather than a legitimate business explanation, which is a strong signal of scam activity.",
  },
  {
    title: "Impersonation Analysis",
    text: 'The phrasing mimics a security notice from a brand or provider, but there is no clear trusted context or verifiable sender identity.',
  },
  {
    title: "Credential Harvesting Risk",
    text: "The message asks the user to verify credentials through a link, which is a classic sign of phishing designed to steal login details.",
  },
];

const evidence = [
  {
    quote: '"Your account will be suspended within 24 hours."',
    reason: "Artificial urgency / fear tactic",
  },
  {
    quote: '"Verify your password here."',
    reason: "Possible credential harvesting",
  },
  {
    quote: '"Click the secure link to restore access."',
    reason: "Suspicious request to use a crafted link instead of official channels",
  },
];

const socialEngineering = [
  "Urgency",
  "Fear",
  "Authority",
  "Impersonation",
  "Reward or prize",
  "Credential harvesting",
  "Financial pressure",
];

const preventionTips = [
  "Do not click suspicious links or respond to the sender.",
  "Visit the organization’s official website directly instead of using the link in the message.",
  "Change your password immediately if credentials were entered anywhere.",
  "Enable multi-factor authentication on the account.",
  "Contact your financial institution if banking details were shared.",
];

const riskBreakdown = [
  { label: "Overall Risk", value: "87 / 100" },
  { label: "Urgency", value: "High" },
  { label: "Impersonation", value: "High" },
  { label: "Credential Request", value: "Very High" },
  { label: "Financial Request", value: "Low" },
  { label: "Suspicious Link", value: "High" },
];

const riskScore = 87;
const isHighRisk = riskScore >= 70;

export default function ResultsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#0f172a_30%,#111827_65%,#0b1120_100%)] text-white">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <a
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Home
          </a>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Quick safety result</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Likely Credential Phishing</h1>
          </div>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-200">
            Most likely type: Credential Phishing
          </span>
        </div>

        <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <div className="flex flex-wrap gap-2">
            {['Credential phishing', 'Urgent action request', 'Suspicious link', 'Impersonation'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-slate-200"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Summary</p>
              <p className="mt-4 text-lg leading-8 text-slate-200">
                This message appears designed to create panic and trick the recipient into entering account credentials or following a dangerous link. The request is urgent, the sender is not clearly trustworthy, and the action requested is a common phishing pattern.
              </p>
            </div>

            <div
              className={
                isHighRisk
                  ? "rounded-2xl border border-red-500/30 bg-red-500/10 p-5"
                  : "rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5"
              }
            >
              <p className={isHighRisk ? "text-sm uppercase tracking-[0.2em] text-red-200" : "text-sm uppercase tracking-[0.2em] text-amber-200"}>Quick verdict</p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <span className="text-4xl font-black text-white">{riskScore}</span>
                <span className={isHighRisk ? "text-lg text-red-200" : "text-lg text-amber-200"}>/ 100</span>
              </div>
              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={
                    isHighRisk
                      ? "h-full rounded-full bg-gradient-to-r from-red-500 via-red-400 to-rose-500"
                      : "h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500"
                  }
                  style={{ width: `${riskScore}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">Top warning signs</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              {warningSigns.map((warning) => (
                <li key={warning} className="flex gap-3">
                  <span className="mt-1 text-rose-400">●</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-10 rounded-[28px] border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Detailed Analysis</p>
            <h2 className="mt-3 text-2xl font-bold text-white">Detailed Security Analysis</h2>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-5">
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
            <div className="relative space-y-5 text-slate-200">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-cyan-300">Detailed Security Analysis</p>
                <div className="mt-3 h-3 w-full rounded-full bg-slate-800" />
                <div className="mt-2 h-3 w-5/6 rounded-full bg-slate-800" />
                <div className="mt-2 h-3 w-4/5 rounded-full bg-slate-800" />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-cyan-300">Social Engineering Techniques</p>
                <div className="mt-3 h-3 w-full rounded-full bg-slate-800" />
                <div className="mt-2 h-3 w-11/12 rounded-full bg-slate-800" />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-cyan-300">Suspicious Evidence</p>
                <div className="mt-3 h-3 w-full rounded-full bg-slate-800" />
                <div className="mt-2 h-3 w-5/6 rounded-full bg-slate-800" />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-cyan-300">Link Analysis</p>
                <div className="mt-3 h-3 w-full rounded-full bg-slate-800" />
                <div className="mt-2 h-3 w-4/5 rounded-full bg-slate-800" />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-cyan-300">Recommended Next Steps</p>
                <div className="mt-3 h-3 w-full rounded-full bg-slate-800" />
                <div className="mt-2 h-3 w-4/5 rounded-full bg-slate-800" />
              </div>
            </div>

            <div className="relative z-10 mt-8 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-center">
              <div className="mb-3 text-4xl">🔒</div>
              <h3 className="text-2xl font-bold text-white">Unlock Detailed Results</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
                Sign in to see exactly why this message was flagged and what to do next.
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
          </div>
        </section>

        <section className="mt-10 rounded-[28px] border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Signed-In Detailed Results</p>
            <h2 className="mt-3 text-2xl font-bold text-white">Full risk breakdown</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {riskBreakdown.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="text-sm text-slate-400">{item.label}</div>
                <div className="mt-2 text-xl font-bold text-white">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Evidence From the Message</p>
              <div className="mt-5 space-y-4">
                {evidence.map((item) => (
                  <div key={item.quote} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-lg font-medium text-white">{item.quote}</p>
                    <p className="mt-3 text-sm text-slate-300">Flagged because:</p>
                    <p className="mt-1 text-emerald-300">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Social Engineering Analysis</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {socialEngineering.map((item) => (
                  <span key={item} className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">
                    {item}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-base leading-7 text-slate-200">
                The message uses classic phishing patterns: urgency, fear, impersonation, and a direct call to action. It tries to bypass the consumer’s natural caution by creating the feeling that a problem is immediate and must be solved now without verifying the source.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Recommended Actions</p>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-base leading-7 text-slate-200">
                {preventionTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[28px] border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Saving the Analysis</p>
            <h2 className="mt-3 text-2xl font-bold text-white">Authenticated users only</h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <p className="text-sm text-slate-300">Only authenticated users have analysis records stored permanently.</p>

            <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-slate-900/60">
              <div className="border-b border-white/10 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-white">analysis</div>
              <div className="divide-y divide-white/10 text-sm text-slate-200">
                <div className="flex justify-between gap-4 px-4 py-3"><span>id</span><span className="text-slate-400">uuid</span></div>
                <div className="flex justify-between gap-4 px-4 py-3"><span>user_id</span><span className="text-slate-400">string</span></div>
                <div className="flex justify-between gap-4 px-4 py-3"><span>message_text</span><span className="text-slate-400">text</span></div>
                <div className="flex justify-between gap-4 px-4 py-3"><span>risk_score</span><span className="text-slate-400">integer</span></div>
                <div className="flex justify-between gap-4 px-4 py-3"><span>risk_level</span><span className="text-slate-400">string</span></div>
                <div className="flex justify-between gap-4 px-4 py-3"><span>classification</span><span className="text-slate-400">string</span></div>
                <div className="flex justify-between gap-4 px-4 py-3"><span>summary</span><span className="text-slate-400">text</span></div>
                <div className="flex justify-between gap-4 px-4 py-3"><span>reasons</span><span className="text-slate-400">json</span></div>
                <div className="flex justify-between gap-4 px-4 py-3"><span>recommended_actions</span><span className="text-slate-400">json</span></div>
                <div className="flex justify-between gap-4 px-4 py-3"><span>created_at</span><span className="text-slate-400">timestamp</span></div>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-300">
              Guest scans may be processed temporarily but should not automatically become part of a permanent user history.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-[28px] border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Signed-In Result Actions</p>
            <h2 className="mt-3 text-2xl font-bold text-white">Available actions</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/save-report"
              className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 font-semibold text-red-100 transition hover:bg-red-500/20"
            >
              Save Report
            </a>
            <a
              href="/"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Analyze Another Message
            </a>
            <a
              href="/scan-history"
              className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 font-semibold text-red-100 transition hover:bg-red-500/20"
            >
              View Scan History
            </a>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-300">
            Because the user is authenticated, the result can automatically be associated with their account.
          </p>
        </section>

        <div className="mt-8 flex justify-center">
          <a
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Home
          </a>
        </div>
      </div>
    </main>
  );
}

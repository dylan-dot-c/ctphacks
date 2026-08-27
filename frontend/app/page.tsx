const features = [
  {
    title: "Urgency detection",
    description: "Flags messages that pressure you to act immediately, click now, or verify an account without warning.",
  },
  {
    title: "Sender spoofing checks",
    description: "Identifies mismatched domains, lookalike addresses, and fake brand impersonation patterns.",
  },
  {
    title: "Malware signal spotting",
    description: "Detects suspicious links, shortened URLs, and scam language often used in phishing attempts.",
  },
];

const steps = [
  {
    number: "01",
    title: "Paste the message",
    text: "Drop in an email, SMS, or chat text to scan it for suspicious indicators.",
  },
  {
    number: "02",
    title: "Analyze the risk",
    text: "Our checks review tone, urgency, sender identity, links, and call-to-action patterns.",
  },
  {
    number: "03",
    title: "Act with confidence",
    text: "Know whether the message is safe, suspicious, or likely phishing before you respond.",
  },
];

const stats = [
  { value: "87%", label: "phishing detection confidence" },
  { value: "2.4s", label: "average scan time" },
  { value: "24/7", label: "always-on protection" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-lg text-emerald-300">
              🛡️
            </div>
            <div>
              <p className="text-lg font-semibold">PhishLens</p>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#how-it-works" className="transition hover:text-white">How it works</a>
            <a href="#security" className="transition hover:text-white">Security</a>
          </div>

          <button className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20">
            Try demo
          </button>
        </nav>

        <section className="grid items-center gap-12 pb-12 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
          <div>
            <span className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-amber-200">
              phishing protection
            </span>

            <h1 className="mt-6 max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Detect phishing messages from text or screenshots.
            </h1>

            <p className="mt-5 max-w-xl text-lg text-slate-300">
              Paste a message or upload an image to check if it looks like a scam, fake alert, or urgent phishing attempt.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button className="rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02]">
                Check now
              </button>
              <button className="rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
                See demo
              </button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="mt-1 text-xs text-slate-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-cyan-500/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm text-slate-400">Scanner</p>
                <p className="text-lg font-semibold text-white">Input your message</p>
              </div>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200">
                Live check
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Paste text</span>
                <textarea
                  placeholder="Example: Your account has been suspended. Verify now to avoid permanent lockout..."
                  className="h-28 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm leading-6 text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-400"
                />
              </label>

              <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/70 p-4">
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center">
                  <span className="text-2xl">📷</span>
                  <span className="text-sm font-medium text-white">Upload screenshot or image</span>
                  <span className="text-xs text-slate-400">PNG, JPG, or PDF preview</span>
                  <input type="file" accept="image/*,.pdf" className="hidden" />
                </label>
              </div>

              <button className="w-full rounded-full bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
                Scan for phishing
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Risk score</span>
                <span className="font-semibold text-amber-300">87% likely phishing</span>
              </div>

              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500" />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-16 pt-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Why teams use it</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Built to catch the warning signs before damage happens.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl text-emerald-300">
                  ✓
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mt-24 rounded-[32px] border border-white/10 bg-slate-900/70 p-8 md:p-10">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">How it works</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Fast checks, clear answers.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
                <div className="text-sm font-semibold text-cyan-300">{step.number}</div>
                <h3 className="mt-4 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="security" className="mt-24">
          <div className="rounded-[32px] border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-slate-900 to-cyan-500/10 p-8 md:p-12">
            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Security-first</p>
                <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Protect inboxes, teams, and customers from phishing attacks.</h2>
              </div>

              <button className="rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200">
                Launch scanner
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DashboardOverview } from "@/components/dashboard-overview";

// Per-user dashboard behind auth - not eligible for static prerendering
export const instant = false;

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: userData, error } = await supabase.auth.getUser();

  if (error || !userData?.user) {
    redirect("/auth/login");
  }

  const user = userData.user;
  const email = String(user.email ?? "user@example.com");
  const firstName = String(user.user_metadata?.first_name ?? "");
  const lastName = String(user.user_metadata?.last_name ?? "");
  const displayName = firstName || email.split("@")[0] || "User";
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    email.split("@")[0] ||
    "User";

  return (
    <div className="w-full max-w-6xl px-4 py-8 text-white">
      <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/80 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
            Welcome back, {displayName}
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

      <DashboardOverview fullName={fullName} email={email} />
    </div>
  );
}

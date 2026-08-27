import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function NavAuthStatus() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  const isLoggedIn = Boolean(user);
  const firstName = String(user?.user_metadata?.first_name ?? "");
  const lastName = String(user?.user_metadata?.last_name ?? "");
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    "User";

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 sm:inline-block">
          Welcome, {displayName}
        </span>
        <Link
          href="/protected"
          className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
        >
          Profile
        </Link>
      </div>
    );
  }

  return (
    <>
      <a
        href="/auth/login"
        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
      >
        Login
      </a>
      <a
        href="/auth/sign-up"
        className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
      >
        Sign Up
      </a>
    </>
  );
}

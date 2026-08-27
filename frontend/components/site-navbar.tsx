"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/logout-button";

export function SiteNavbar() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (user) {
        const firstName = String(user.user_metadata?.first_name ?? "");
        const lastName = String(user.user_metadata?.last_name ?? "");
        setDisplayName(
          [firstName, lastName].filter(Boolean).join(" ") ||
            user.email?.split("@")[0] ||
            "User",
        );
      } else {
        setDisplayName(null);
      }
      setChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (user) {
        const firstName = String(user.user_metadata?.first_name ?? "");
        const lastName = String(user.user_metadata?.last_name ?? "");
        setDisplayName(
          [firstName, lastName].filter(Boolean).join(" ") ||
            user.email?.split("@")[0] ||
            "User",
        );
      } else {
        setDisplayName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-lg text-emerald-300">
            🛡️
          </div>
          <p className="text-lg font-semibold text-white">PhishingHook</p>
        </Link>
      </div>

      <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
        <Link href="/" className="transition hover:text-white">
          Scan
        </Link>
        {displayName && (
          <Link href="/scan-history" className="transition hover:text-white">
            Scan history
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!checked ? null : displayName ? (
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
            <LogoutButton />
          </div>
        ) : (
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
        )}
      </div>
    </nav>
  );
}

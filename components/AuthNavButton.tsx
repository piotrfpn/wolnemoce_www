"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthNavButtonProps = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
  loginHref?: string;
  labels?: {
    login: string;
    panel: string;
    logout: string;
    loggingOut: string;
  };
};

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setUser(data.user);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading };
}

export default function AuthNavButton({
  variant = "desktop",
  onNavigate,
  loginHref = "/logowanie",
  labels = {
    login: "Zaloguj się",
    panel: "Panel",
    logout: "Wyloguj",
    loggingOut: "Wylogowywanie...",
  },
}: AuthNavButtonProps) {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    onNavigate?.();
    router.push("/");
    router.refresh();
  }

  const loginClass =
    variant === "mobile"
      ? "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-slate-600 no-underline hover:bg-slate-50"
      : "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 no-underline transition hover:bg-slate-50 hover:text-[#1a5f3c]";

  const panelClass =
    variant === "mobile"
      ? "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-slate-600 no-underline hover:bg-slate-50"
      : "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 no-underline transition hover:bg-slate-50 hover:text-[#1a5f3c]";

  const logoutClass =
    variant === "mobile"
      ? "inline-flex items-center justify-center rounded-xl border-2 border-[#1a5f3c] px-5 py-3 text-sm font-bold text-[#1a5f3c] transition hover:bg-[#1a5f3c] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      : "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 no-underline transition hover:bg-slate-50 hover:text-[#1a5f3c] disabled:cursor-not-allowed disabled:opacity-60";

  if (isLoading) {
    return <span className={loginClass}>{labels.login}</span>;
  }

  if (!user) {
    return (
      <Link href={loginHref} onClick={onNavigate} className={loginClass}>
        {labels.login}
      </Link>
    );
  }

  return (
    <div
      className={
        variant === "mobile"
          ? "grid grid-cols-1 gap-3"
          : "flex items-center gap-2"
      }
    >
      <Link href="/panel" onClick={onNavigate} className={panelClass}>
        {labels.panel}
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isSigningOut}
        className={logoutClass}
      >
        {isSigningOut ? labels.loggingOut : labels.logout}
      </button>
    </div>
  );
}

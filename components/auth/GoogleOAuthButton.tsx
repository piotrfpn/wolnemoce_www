"use client";

import { useState } from "react";
import { getSiteUrl } from "@/lib/seo";
import { getSafeNextPath } from "@/lib/safeNextPath";
import { createClient } from "@/lib/supabase/client";

type GoogleOAuthButtonProps = {
  errorLabel: string;
  hint?: string;
  label: string;
  nextPath?: string;
  onError: (message: string) => void;
};

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.56-5.15 3.56-8.65Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.28a12 12 0 0 0 0 10.78l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.28 6.61l4 3.1C6.23 6.88 8.88 4.77 12 4.77Z"
      />
    </svg>
  );
}

function getOAuthOrigin() {
  if (typeof window === "undefined") {
    return getSiteUrl();
  }

  if (
    process.env.NODE_ENV !== "production" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return window.location.origin;
  }

  return getSiteUrl();
}

export default function GoogleOAuthButton({
  errorLabel,
  hint,
  label,
  nextPath = "/panel",
  onError,
}: GoogleOAuthButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleGoogleSignIn() {
    setIsSubmitting(true);
    onError("");

    const redirectTo = `${getOAuthOrigin()}/auth/callback?next=${encodeURIComponent(
      getSafeNextPath(nextPath, "/panel")
    )}`;
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      onError(errorLabel);
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isSubmitting}
      className="group flex w-full items-center gap-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-left shadow-sm transition hover:border-[#1a5f3c]/60 hover:bg-[#1a5f3c]/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200/80">
        <GoogleIcon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-slate-800 transition group-hover:text-[#1a5f3c]">
          {label}
        </span>
        {hint ? (
          <span className="mt-0.5 block text-xs font-medium text-slate-500">
            {hint}
          </span>
        ) : null}
      </span>
    </button>
  );
}

"use client";

import { useState } from "react";
import { getSiteUrl } from "@/lib/seo";
import { getSafeNextPath } from "@/lib/safeNextPath";
import { createClient } from "@/lib/supabase/client";

type GoogleOAuthButtonProps = {
  errorLabel: string;
  label: string;
  nextPath?: string;
  onError: (message: string) => void;
};

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
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#1a5f3c] hover:text-[#1a5f3c] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <i className="fab fa-google text-base"></i>
      {label}
    </button>
  );
}

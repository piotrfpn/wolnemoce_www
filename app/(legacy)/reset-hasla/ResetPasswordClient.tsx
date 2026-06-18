"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import type { Dictionary } from "@/lib/i18n/types";
import { getSafeNextPath } from "@/lib/safeNextPath";
import { createClient } from "@/lib/supabase/client";

type ResetPasswordClientProps = {
  labels: Dictionary["auth"]["passwordRecovery"]["reset"];
  loginHref: string;
  updatePasswordPath: string;
};

export default function ResetPasswordClient({
  labels,
  loginHref,
  updatePasswordPath,
}: ResetPasswordClientProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);
    const supabase = createClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set(
      "next",
      getSafeNextPath(updatePasswordPath, "/ustaw-nowe-haslo")
    );

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callbackUrl.toString(),
    });

    if (resetError) {
      setError(resetError.message);
      setIsSubmitting(false);
      return;
    }

    setMessage(labels.success);
    setIsSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
          <i className="fas fa-key text-xl"></i>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">{labels.title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {labels.subtitle}
        </p>
      </div>

      {error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <label className="block min-w-0">
        <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          <i className="fas fa-envelope text-[#1a5f3c]"></i>
          {labels.email}
        </span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="min-w-0 max-w-full w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? labels.submitting : labels.submit}
      </button>

      <p className="mt-6 text-center text-sm text-slate-500">
        {labels.rememberPassword}{" "}
        <Link href={loginHref} className="font-semibold text-[#1a5f3c] no-underline">
          {labels.loginLink}
        </Link>
      </p>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import GoogleOAuthButton from "@/components/auth/GoogleOAuthButton";
import {
  defaultLocale,
  getLocalizedPath,
  isSupportedLocale,
} from "@/lib/i18n/config";
import { getSafeNextPath } from "@/lib/safeNextPath";
import { createClient } from "@/lib/supabase/client";
import {
  appendUtmToUrl,
  hasAnyUtm,
  readUtmFromBrowser,
  type UtmParams,
} from "@/lib/utm";
import type { Dictionary } from "@/lib/i18n/types";

type LoginFormClientProps = {
  labels: Dictionary["auth"]["login"];
  nextPath?: string;
  oauthError?: boolean;
  registerHref: string;
};

export default function LoginFormClient({
  labels,
  nextPath,
  oauthError = false,
  registerHref,
}: LoginFormClientProps) {
  const params = useParams();
  const router = useRouter();
  const localeParam = params?.locale;
  const locale =
    typeof localeParam === "string" && isSupportedLocale(localeParam)
      ? localeParam
      : defaultLocale;
  const resetPasswordHref = getLocalizedPath("/reset-hasla", locale);
  const safeNextPath = getSafeNextPath(nextPath);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(oauthError ? labels.oauthError : "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [utm, setUtm] = useState<UtmParams | null>(null);

  useEffect(() => {
    setUtm(readUtmFromBrowser());
  }, []);

  const registerHrefWithUtm = appendUtmToUrl(registerHref, utm);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const supabase = createClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      const isInvalidCredentials = signInError?.message
        ?.toLowerCase()
        .includes("invalid login credentials");
      setError(
        isInvalidCredentials
          ? labels.invalidCredentialsError
          : signInError?.message ?? labels.errorFallback
      );
      setIsSubmitting(false);
      return;
    }

    const activeUtm = readUtmFromBrowser() ?? utm;
    if (hasAnyUtm(activeUtm)) {
      try {
        await supabase.rpc("save_own_profile_utm", {
          p_utm_source: activeUtm.utm_source ?? null,
          p_utm_medium: activeUtm.utm_medium ?? null,
          p_utm_campaign: activeUtm.utm_campaign ?? null,
          p_utm_content: activeUtm.utm_content ?? null,
        });
      } catch {
        // non-blocking attribution fallback
      }
    }

    router.push(safeNextPath || "/panel");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
          <i className="fas fa-right-to-bracket text-xl"></i>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">{labels.title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {labels.subtitle}
        </p>
      </div>

      {error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{error}</p>
          <p className="mt-1.5 text-xs text-red-700/90">
            {labels.noAccount}{" "}
            <Link
              href={registerHrefWithUtm}
              className="font-bold text-red-800 underline underline-offset-2 hover:text-red-950"
            >
              {labels.createAccount}
            </Link>
          </p>
        </div>
      ) : null}

      <GoogleOAuthButton
        errorLabel={labels.oauthError}
        hint={labels.googleHint}
        label={labels.googleSubmit}
        nextPath={safeNextPath || "/panel"}
        onError={setError}
      />

      <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-slate-400">
        <span className="h-px flex-1 bg-slate-200"></span>
        <span>{labels.separator}</span>
        <span className="h-px flex-1 bg-slate-200"></span>
      </div>

      <div className="space-y-5">
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

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-lock text-[#1a5f3c]"></i>
            {labels.password}
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="min-w-0 max-w-full w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
        </label>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-xl border-2 border-transparent bg-gradient-to-br from-[#1a5f3c] to-[#2d8a5e] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#1a5f3c]/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? labels.submitting : labels.submit}
        </button>

        <Link
          href={registerHrefWithUtm}
          className="inline-flex w-full items-center justify-center rounded-xl border-2 border-[#1a5f3c] bg-white px-4 py-3 text-center text-sm font-bold text-[#1a5f3c] no-underline transition hover:-translate-y-0.5 hover:bg-[#1a5f3c] hover:text-white hover:shadow-md"
        >
          {labels.createAccount}
        </Link>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-3.5 py-2.5 text-xs leading-5 text-slate-600">
        <i className="fas fa-circle-info mt-0.5 shrink-0 text-[#1a5f3c]"></i>
        <span>{labels.newUserHint}</span>
      </div>

      <div className="mt-5 text-center text-sm text-slate-500">
        <Link
          href={resetPasswordHref}
          className="font-semibold text-[#1a5f3c] no-underline hover:underline"
        >
          {labels.forgotPassword}
        </Link>
      </div>
    </form>
  );
}

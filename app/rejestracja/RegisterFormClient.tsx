"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import GoogleOAuthButton from "@/components/auth/GoogleOAuthButton";
import { getSafeNextPath } from "@/lib/safeNextPath";
import { registerUser } from "./actions";
import type { Dictionary } from "@/lib/i18n/types";

type RegisterFormClientProps = {
  labels: Dictionary["auth"]["register"];
  loginHref: string;
  nextPath?: string;
  privacyHref: string;
  termsHref: string;
};

export default function RegisterFormClient({
  labels,
  loginHref,
  nextPath,
  privacyHref,
  termsHref,
}: RegisterFormClientProps) {
  const router = useRouter();
  const safeNextPath = getSafeNextPath(nextPath);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!acceptedTerms) {
      setError(labels.termsRequired);
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    if (result.redirectTo) {
      router.push(result.redirectTo);
      router.refresh();
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
      <input type="hidden" name="nextPath" value={safeNextPath} />

      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
          <i className="fas fa-user-plus text-xl"></i>
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
          {safeNextPath ? (
            <Link
              href={safeNextPath}
              className="mt-2 block font-semibold text-[#1a5f3c] no-underline"
            >
              {labels.continue}
            </Link>
          ) : null}
        </div>
      ) : null}

      <GoogleOAuthButton
        errorLabel={labels.oauthError}
        label={labels.googleSubmit}
        nextPath="/panel"
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
            <i className="fas fa-user text-[#1a5f3c]"></i>
            {labels.fullName}
          </span>
          <input
            name="fullName"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-envelope text-[#1a5f3c]"></i>
            {labels.email}
          </span>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-lock text-[#1a5f3c]"></i>
            {labels.password}
          </span>
          <input
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
        </label>

        <label className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          <input
            type="checkbox"
            name="termsAccepted"
            value="accepted"
            required
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#1a5f3c]"
          />
          <span className="min-w-0">
            {labels.termsPrefix}{" "}
            <Link
              href={termsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#1a5f3c] no-underline"
            >
              {labels.termsLink}
            </Link>{" "}
            {labels.privacyPrefix}{" "}
            <Link
              href={privacyHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#1a5f3c] no-underline"
            >
              {labels.privacyLink}
            </Link>
            {labels.termsSuffix}
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? labels.submitting : labels.submit}
      </button>

      <p className="mt-6 text-center text-sm text-slate-500">
        {labels.alreadyHaveAccount}{" "}
        <Link href={loginHref} className="font-semibold text-[#1a5f3c] no-underline">
          {labels.loginLink}
        </Link>
      </p>
    </form>
  );
}

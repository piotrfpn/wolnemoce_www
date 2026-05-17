"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type RegisterFormClientProps = {
  nextPath?: string;
};

function getSafeNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "";
  }

  return nextPath;
}

export default function RegisterFormClient({ nextPath }: RegisterFormClientProps) {
  const router = useRouter();
  const safeNextPath = getSafeNextPath(nextPath);
  const redirectAfterAuth = safeNextPath || "/panel";
  const loginHref = safeNextPath
    ? `/logowanie?next=${encodeURIComponent(safeNextPath)}`
    : "/logowanie";
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
    setIsSubmitting(true);
    const supabase = createClient();

    if (!acceptedTerms) {
      setError("Zaakceptuj regulamin, aby utworzyć konto.");
      setIsSubmitting(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          redirectAfterAuth
        )}`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    if (data.session) {
      router.push(redirectAfterAuth);
      router.refresh();
      return;
    }

    setMessage("Konto zostało utworzone. Możesz się zalogować.");
    setIsSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
          <i className="fas fa-user-plus text-xl"></i>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Utwórz konto</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Załóż konto firmowe. Profil firmy zostanie dodany w kolejnym etapie.
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
              Przejdź dalej
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-5">
        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-user text-[#1a5f3c]"></i>
            Imię i nazwisko
          </span>
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            className="min-w-0 max-w-full w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-envelope text-[#1a5f3c]"></i>
            Email
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
            Hasło
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            className="min-w-0 max-w-full w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
        </label>

        <label className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#1a5f3c]"
          />
          <span>
            Akceptuję{" "}
            <Link href="/regulamin" className="font-semibold text-[#1a5f3c] no-underline">
              regulamin
            </Link>
            {" "}oraz zapoznałem się z{" "}
            <Link
              href="/polityka-prywatnosci"
              className="font-semibold text-[#1a5f3c] no-underline"
            >
              polityką prywatności
            </Link>
            .
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Tworzenie konta..." : "Utwórz konto"}
      </button>

      <p className="mt-6 text-center text-sm text-slate-500">
        Masz konto?{" "}
        <Link href={loginHref} className="font-semibold text-[#1a5f3c] no-underline">
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}

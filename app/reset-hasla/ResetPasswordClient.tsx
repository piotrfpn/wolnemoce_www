"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordClient() {
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

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/ustaw-nowe-haslo`,
    });

    if (resetError) {
      setError(resetError.message);
      setIsSubmitting(false);
      return;
    }

    setMessage("Jeżeli konto istnieje, wysłaliśmy link do resetu hasła.");
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
        <h1 className="text-2xl font-extrabold text-slate-900">Reset hasła</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Podaj email konta, a wyślemy link do ustawienia nowego hasła.
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Wysyłanie..." : "Wyślij link resetujący"}
      </button>

      <p className="mt-6 text-center text-sm text-slate-500">
        Pamiętasz hasło?{" "}
        <Link href="/logowanie" className="font-semibold text-[#1a5f3c] no-underline">
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}

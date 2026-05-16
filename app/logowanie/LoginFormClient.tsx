"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginFormClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setError(signInError?.message ?? "Nie udało się zalogować.");
      setIsSubmitting(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    router.push(profile?.role === "admin" ? "/admin" : "/panel");
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
        <h1 className="text-2xl font-extrabold text-slate-900">Zaloguj się</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Wejdź do panelu firmy lub panelu administratora.
        </p>
      </div>

      {error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-5">
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
            className="min-w-0 max-w-full w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Logowanie..." : "Zaloguj się"}
      </button>

      <div className="mt-6 flex flex-col gap-2 text-center text-sm text-slate-500">
        <Link href="/reset-hasla" className="font-semibold text-[#1a5f3c] no-underline">
          Nie pamiętasz hasła?
        </Link>
        <span>
          Nie masz konta?{" "}
          <Link href="/rejestracja" className="font-semibold text-[#1a5f3c] no-underline">
            Utwórz konto
          </Link>
        </span>
      </div>
    </form>
  );
}

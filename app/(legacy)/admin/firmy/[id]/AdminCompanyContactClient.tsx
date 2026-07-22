"use client";

import { useState } from "react";
import { updateCompanyContactEmailAction } from "../actions";

type AdminCompanyContactClientProps = {
  companyId: string;
  initialContactEmail: string | null;
  initialLoadError: string | null;
};

export default function AdminCompanyContactClient({
  companyId,
  initialContactEmail,
  initialLoadError,
}: AdminCompanyContactClientProps) {
  const [email, setEmail] = useState(initialContactEmail ?? "");
  const [currentEmail, setCurrentEmail] = useState<string | null>(
    initialContactEmail ?? null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(initialLoadError);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isFormDisabled = isSubmitting || initialLoadError !== null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (isFormDisabled) return;

    setError(null);
    setSuccessMessage(null);

    const trimmed = email.trim();
    if (trimmed.length > 254) {
      setError("Adres e-mail nie może być dłuższy niż 254 znaki.");
      return;
    }

    if (
      trimmed &&
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmed)
    ) {
      setError("Podaj poprawny format adresu e-mail.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateCompanyContactEmailAction(
        companyId,
        trimmed || null
      );

      if (!result.success) {
        setError(result.error);
      } else {
        setCurrentEmail(result.contactEmail);
        setEmail(result.contactEmail ?? "");
        setSuccessMessage(
          result.contactEmail
            ? "Adres e-mail odbiorcy został pomyślnie zapisany."
            : "Adres e-mail odbiorcy został wyczyszczony."
        );
      }
    } catch {
      setError("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleClear() {
    if (isFormDisabled || currentEmail === null) return;

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const result = await updateCompanyContactEmailAction(companyId, null);

      if (!result.success) {
        setError(result.error);
      } else {
        setCurrentEmail(null);
        setEmail("");
        setSuccessMessage("Adres e-mail odbiorcy został wyczyszczony.");
      }
    } catch {
      setError("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[24px] border-2 border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">
        <i className="fas fa-envelope text-slate-400 mr-2"></i>
        Kontakt do zapytań publicznych
      </h2>
      <p className="mb-4 text-xs text-slate-500">
        Na ten adres będą wysyłane zapytania przesłane z publicznego profilu firmy.
      </p>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          <i className="fas fa-check-circle mr-2"></i>
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label
            htmlFor="company-contact-email"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Adres e-mail odbiorcy
          </label>
          <input
            id="company-contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={254}
            autoComplete="email"
            placeholder="np. kontakt@firma.pl"
            disabled={isFormDisabled}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-2 focus:ring-[#1a5f3c]/20 disabled:opacity-50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isFormDisabled}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#14492e] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin text-xs"></i>
                Zapisywanie...
              </>
            ) : (
              <>
                <i className="fas fa-save text-xs"></i>
                Zapisz
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={isFormDisabled || currentEmail === null}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="fas fa-trash-alt text-xs"></i>
            Wyczyść adres
          </button>
        </div>
      </form>
    </div>
  );
}

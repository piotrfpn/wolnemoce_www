"use client";

import { useState } from "react";
import { updateCompanyVerificationStatus } from "../actions";

type AdminCompanyVerificationClientProps = {
  companyId: string;
  isVerified: boolean;
  latestNote: string | null;
  latestVerifiedAt: string | null;
};

export default function AdminCompanyVerificationClient({
  companyId,
  isVerified,
  latestNote,
  latestVerifiedAt,
}: AdminCompanyVerificationClientProps) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleVerification(nextStatus: boolean) {
    if (nextStatus === isVerified) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const result = await updateCompanyVerificationStatus(
      companyId,
      nextStatus,
      note.trim() || "Brak notatki."
    );

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccessMessage(
        nextStatus
          ? "Firma została oznaczona jako zweryfikowana."
          : "Weryfikacja firmy została cofnięta."
      );
      setNote(""); // clear note after successful submit
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-slate-700">
          Aktualny status:
        </span>
        <span
          className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            isVerified
              ? "bg-[#1a5f3c]/10 text-[#1a5f3c]"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          <i
            className={`fas ${
              isVerified ? "fa-circle-check" : "fa-clock"
            }`}
          ></i>
          {isVerified ? "Firma zweryfikowana" : "Niezweryfikowana"}
        </span>
      </div>

      {latestVerifiedAt && (
        <div className="text-sm text-slate-500">
          Ostatnia zmiana statusu:{" "}
          {new Date(latestVerifiedAt).toLocaleString("pl-PL")}
        </div>
      )}
      {latestNote && (
        <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 border border-slate-200">
          <p className="font-bold mb-1">Ostatnia notatka weryfikacyjna:</p>
          <p className="whitespace-pre-wrap">{latestNote}</p>
        </div>
      )}

      <div className="mt-4">
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Notatka admina (tylko do wglądu administracji)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isSubmitting}
          className="min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1a5f3c] focus:ring-4 focus:ring-[#1a5f3c]/10 disabled:bg-slate-50"
          placeholder="Podaj powód nadania lub cofnięcia weryfikacji..."
        />
      </div>

      <div className="flex gap-4 mt-2">
        {!isVerified ? (
          <button
            onClick={() => handleVerification(true)}
            disabled={isSubmitting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#13482d] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-check"></i>
            Nadaj weryfikację
          </button>
        ) : (
          <button
            onClick={() => handleVerification(false)}
            disabled={isSubmitting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-times"></i>
            Cofnij weryfikację
          </button>
        )}
      </div>
    </div>
  );
}

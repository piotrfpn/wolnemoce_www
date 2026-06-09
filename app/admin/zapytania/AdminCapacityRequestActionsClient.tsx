"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateAdminCapacityRequest,
  type AdminCapacityRequestActionResult,
} from "./actions";

type AdminCapacityRequestActionsClientProps = {
  requestId: string;
  status: string | null;
  adminNote: string | null;
  rejectionReason: string | null;
};

export default function AdminCapacityRequestActionsClient({
  requestId,
  status,
  adminNote,
  rejectionReason,
}: AdminCapacityRequestActionsClientProps) {
  const router = useRouter();
  const [note, setNote] = useState(adminNote ?? "");
  const [feedback, setFeedback] = useState(rejectionReason ?? "");
  const [result, setResult] = useState<AdminCapacityRequestActionResult>({});
  const [isPending, startTransition] = useTransition();

  function submitStatus(nextStatus: string) {
    setResult({});
    const formData = new FormData();
    formData.set("requestId", requestId);
    formData.set("status", nextStatus);
    formData.set("admin_note", note);
    formData.set("rejection_reason", feedback);

    startTransition(async () => {
      const nextResult = await updateAdminCapacityRequest(formData);
      setResult(nextResult);
      if (nextResult.success) {
        router.refresh();
      }
    });
  }

  function handleNoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitStatus(status ?? "pending");
  }

  return (
    <div className="space-y-4">
      {result.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error}
        </div>
      ) : null}
      {result.success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {result.success}
        </div>
      ) : null}

      <form onSubmit={handleNoteSubmit}>
        <label className="block min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Notatka admina
          </span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="min-w-0 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
            placeholder="Notatka widoczna tylko dla administracji"
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-[#1a5f3c] hover:text-[#1a5f3c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <i className="fas fa-floppy-disk"></i>
          Zapisz notatkę
        </button>
      </form>

      <label className="block min-w-0">
        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Powód odrzucenia dla użytkownika
        </span>
        <textarea
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          rows={4}
          className="min-w-0 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          placeholder="Np. Uzupełnij szczegóły techniczne, minimalną ilość, materiał lub termin realizacji."
        />
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Ten tekst zobaczy właściciel zapytania, gdy zlecenie zostanie odrzucone.
        </p>
      </label>

      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
        <button
          type="button"
          onClick={() => submitStatus("active")}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0d3d26] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <i className="fas fa-circle-check"></i>
          Publikuj
        </button>
        <button
          type="button"
          onClick={() => submitStatus("rejected")}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <i className="fas fa-ban"></i>
          Odrzuć
        </button>
        <button
          type="button"
          onClick={() => submitStatus("archived")}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <i className="fas fa-box-archive"></i>
          Archiwizuj
        </button>
      </div>
    </div>
  );
}

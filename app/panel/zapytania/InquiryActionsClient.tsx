"use client";

import { useState, useTransition } from "react";
import { archiveInquiry, markInquiryRead } from "./actions";

export default function InquiryActionsClient({
  inquiryId,
  status,
}: {
  inquiryId: string;
  status: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function runAction(action: (id: string) => Promise<void>) {
    setError("");
    startTransition(async () => {
      try {
        await action(inquiryId);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Nie udało się zmienić statusu."
        );
      }
    });
  }

  return (
    <div className="mt-5 space-y-3">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        {status !== "read" && status !== "archived" ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => runAction(markInquiryRead)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0d3d26] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i className="fas fa-envelope-open"></i>
            Oznacz jako przeczytane
          </button>
        ) : null}

        {status !== "archived" ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => runAction(archiveInquiry)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-[#1a5f3c] hover:text-[#1a5f3c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i className="fas fa-box-archive"></i>
            Archiwizuj
          </button>
        ) : null}
      </div>
    </div>
  );
}

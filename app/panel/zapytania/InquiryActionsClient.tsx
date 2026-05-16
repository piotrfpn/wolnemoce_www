"use client";

import { useState, useTransition } from "react";
import {
  archiveInquiry,
  createAttachmentDownloadUrl,
  markInquiryRead,
} from "./actions";

export type InquiryAttachment = {
  id: string;
  original_file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
};

export default function InquiryActionsClient({
  inquiryId,
  status,
  attachments = [],
}: {
  inquiryId: string;
  status: string | null;
  attachments?: InquiryAttachment[];
}) {
  const [isPending, startTransition] = useTransition();
  const [downloadPendingId, setDownloadPendingId] = useState("");
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

  function formatFileSize(size: number | null) {
    if (!size) {
      return "Brak rozmiaru";
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  function downloadAttachment(attachmentId: string) {
    setError("");
    setDownloadPendingId(attachmentId);

    startTransition(async () => {
      try {
        const signedUrl = await createAttachmentDownloadUrl(attachmentId);
        window.open(signedUrl, "_blank", "noopener,noreferrer");
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Nie udało się przygotować pobierania załącznika."
        );
      } finally {
        setDownloadPendingId("");
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

      {attachments.length > 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            Załączniki
          </p>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex min-w-0 flex-col gap-3 rounded-xl bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {attachment.original_file_name ?? "Załącznik"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(attachment.size_bytes)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isPending || downloadPendingId === attachment.id}
                  onClick={() => downloadAttachment(attachment.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-4 py-2 text-sm font-bold text-[#1a5f3c] transition hover:bg-[#1a5f3c] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <i className="fas fa-download"></i>
                  {downloadPendingId === attachment.id ? "Przygotowanie..." : "Pobierz"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import {
  markContactMessageHandled,
  markContactMessageRead,
} from "./actions";
import {
  buildContactMessageReplyBody,
  buildContactMessageReplySubject,
  buildMailtoHref,
} from "@/lib/adminReplyMailto";

export default function ContactMessageActionsClient({
  messageId,
  status,
  email,
  topic,
}: {
  messageId: string;
  status: string | null;
  email: string | null;
  topic: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const hasActions = status !== "handled" && status !== "archived";
  const replyHref = buildMailtoHref({
    to: email,
    subject: buildContactMessageReplySubject(topic),
    body: buildContactMessageReplyBody(),
  });

  function runAction(action: (id: string) => Promise<void>) {
    setError("");
    startTransition(async () => {
      try {
        await action(messageId);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Nie udało się zmienić statusu wiadomości."
        );
      }
    });
  }

  if (!hasActions && !error && !replyHref) {
    return null;
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {hasActions ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          {replyHref ? (
            <a
              href={replyHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white no-underline transition hover:bg-slate-700"
            >
              <i className="fas fa-reply"></i>
              Odpowiedz
            </a>
          ) : (
            <button
              type="button"
              disabled
              title="Brak adresu e-mail w wiadomości."
              className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-500 opacity-80"
            >
              <i className="fas fa-reply"></i>
              Odpowiedz
            </button>
          )}

          {status !== "read" && status !== "handled" && status !== "archived" ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => runAction(markContactMessageRead)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0d3d26] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i className="fas fa-envelope-open"></i>
              Oznacz jako przeczytane
            </button>
          ) : null}

          {status !== "handled" && status !== "archived" ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => runAction(markContactMessageHandled)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-4 py-3 text-sm font-bold text-[#1a5f3c] transition hover:bg-[#1a5f3c] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i className="fas fa-circle-check"></i>
              Oznacz jako obsłużone
            </button>
          ) : null}
        </div>
      ) : replyHref ? (
        <a
          href={replyHref}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white no-underline transition hover:bg-slate-700"
        >
          <i className="fas fa-reply"></i>
          Odpowiedz
        </a>
      ) : null}
    </div>
  );
}

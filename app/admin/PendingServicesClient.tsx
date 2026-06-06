"use client";

import { useState, useTransition } from "react";
import {
  approveServiceRequest,
  markServiceRequestHandled,
  rejectServiceRequest,
} from "./actions";

export type PendingServiceRequest = {
  id: string;
  user_id: string | null;
  company_id: string | null;
  industry: string | null;
  proposed_service: string | null;
  reason: string | null;
  status: string | null;
  created_at: string | null;
  admin_handled_at: string | null;
  admin_response_note: string | null;
  submitter_name: string | null;
  reply_email: string | null;
  reply_email_source: string | null;
  reply_href: string | null;
  companies: {
    name: string | null;
  } | null;
};

const missingEmailMessage =
  "Brak adresu e-mail w zgłoszeniu lub profilu — sprawdź użytkownika/firmę ręcznie.";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Zatwierdzone",
  rejected: "Odrzucone",
};

const statusClasses: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Brak daty";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function PendingServicesClient({
  requests,
}: {
  requests: PendingServiceRequest[];
}) {
  const [isPending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState("");
  const [error, setError] = useState("");

  function runAction(requestId: string, action: (id: string) => Promise<void>) {
    setError("");
    setActiveId(requestId);
    startTransition(async () => {
      try {
        await action(requestId);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Nie udało się wykonać akcji."
        );
      } finally {
        setActiveId("");
      }
    });
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        Brak zgłoszeń usług w ostatniej historii.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {requests.map((request) => {
        const isCurrentPending = isPending && activeId === request.id;
        const status = request.status ?? "pending";
        const isHandled = Boolean(request.admin_handled_at);
        const canDecide = status === "pending";

        return (
          <article
            key={request.id}
            className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      statusClasses[status] ?? statusClasses.pending
                    }`}
                  >
                    {statusLabels[status] ?? status}
                  </span>
                  {isHandled ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      Odpowiedziano
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      Nieobsłużone
                    </span>
                  )}
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {request.industry ?? "Branża"}
                  </span>
                </div>

                <h3 className="break-words text-xl font-extrabold text-slate-900">
                  {request.proposed_service ?? "Zgłoszona usługa"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {request.companies?.name ?? "Firma niepowiązana"} ·{" "}
                  {formatDate(request.created_at)}
                </p>

                <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
                  <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Osoba / profil
                    </p>
                    <p className="break-words text-sm font-bold text-slate-900">
                      {request.submitter_name ?? "Brak nazwy profilu"}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                      E-mail kontaktowy
                    </p>
                    <p className="break-words text-sm font-bold text-slate-900">
                      {request.reply_email ?? "Brak"}
                    </p>
                    {request.reply_email_source ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Źródło: {request.reply_email_source}
                      </p>
                    ) : null}
                  </div>
                </div>

                {request.reason ? (
                  <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {request.reason}
                  </p>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    Brak dodatkowego uzasadnienia.
                  </p>
                )}

                {!request.reply_email ? (
                  <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                    {missingEmailMessage}
                  </p>
                ) : null}

                {isHandled ? (
                  <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Obsłużone: {formatDate(request.admin_handled_at)}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                {request.reply_href ? (
                  <a
                    href={request.reply_href}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white no-underline transition hover:bg-slate-700"
                  >
                    <i className="fas fa-reply"></i>
                    Odpowiedz
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    title={missingEmailMessage}
                    className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-500 opacity-80"
                  >
                    <i className="fas fa-reply"></i>
                    Odpowiedz
                  </button>
                )}

                {!isHandled ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => runAction(request.id, markServiceRequestHandled)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-4 py-3 text-sm font-bold text-[#1a5f3c] transition hover:bg-[#1a5f3c] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <i className="fas fa-circle-check"></i>
                    {isCurrentPending ? "Przetwarzanie..." : "Oznacz jako obsłużone"}
                  </button>
                ) : null}

                {canDecide ? (
                  <>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => runAction(request.id, approveServiceRequest)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0d3d26] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <i className="fas fa-check"></i>
                      {isCurrentPending ? "Przetwarzanie..." : "Zatwierdź"}
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => runAction(request.id, rejectServiceRequest)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 px-4 py-3 text-sm font-bold text-red-700 transition hover:border-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <i className="fas fa-xmark"></i>
                      Odrzuć
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

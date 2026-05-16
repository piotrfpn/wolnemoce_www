"use client";

import { useState, useTransition } from "react";
import { approveServiceRequest, rejectServiceRequest } from "./actions";

export type PendingServiceRequest = {
  id: string;
  industry: string | null;
  proposed_service: string | null;
  reason: string | null;
  status: string | null;
  created_at: string | null;
  companies: {
    name: string | null;
  } | null;
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
        Brak zgłoszeń nowych usług.
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

        return (
          <article
            key={request.id}
            className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                    Pending
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {request.industry ?? "Branża"}
                  </span>
                </div>

                <h3 className="break-words text-xl font-extrabold text-slate-900">
                  {request.proposed_service}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {request.companies?.name ?? "Firma niepowiązana"} ·{" "}
                  {formatDate(request.created_at)}
                </p>

                {request.reason ? (
                  <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {request.reason}
                  </p>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    Brak dodatkowego uzasadnienia.
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
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
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

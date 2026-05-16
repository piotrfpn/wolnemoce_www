"use client";

import { useState, useTransition } from "react";
import { approveOffer, rejectOffer } from "./actions";

export type PendingOffer = {
  id: string;
  title: string | null;
  slug: string | null;
  branch: string | null;
  service_type: string | null;
  description: string | null;
  power_available: string | null;
  min_order: string | null;
  lead_time: string | null;
  status: string | null;
  created_at: string | null;
  companies: {
    name: string | null;
    location_voivodeship: string | null;
    location_city: string | null;
    is_verified: boolean | null;
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

export default function PendingOffersClient({
  offers,
}: {
  offers: PendingOffer[];
}) {
  const [isPending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState("");
  const [error, setError] = useState("");

  function runAction(offerId: string, action: (id: string) => Promise<void>) {
    setError("");
    setActiveId(offerId);
    startTransition(async () => {
      try {
        await action(offerId);
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

  if (offers.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        Brak ofert oczekujących na weryfikację. Dobra robota!
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

      {offers.map((offer) => {
        const company = offer.companies;
        const location = [company?.location_city, company?.location_voivodeship]
          .filter(Boolean)
          .join(", ");
        const isCurrentPending = isPending && activeId === offer.id;

        return (
          <article
            key={offer.id}
            className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                    Oczekuje na zatwierdzenie
                  </span>
                  {company?.is_verified ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      Firma zweryfikowana
                    </span>
                  ) : null}
                </div>

                <h3 className="break-words text-xl font-extrabold text-slate-900">
                  {offer.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {company?.name ?? "Firma bez nazwy"}
                  {location ? ` · ${location}` : ""}
                </p>

                {offer.description ? (
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                    {offer.description}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => runAction(offer.id, approveOffer)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0d3d26] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <i className="fas fa-check"></i>
                  {isCurrentPending ? "Przetwarzanie..." : "Zatwierdź"}
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => runAction(offer.id, rejectOffer)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 px-4 py-3 text-sm font-bold text-red-700 transition hover:border-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <i className="fas fa-xmark"></i>
                  Odrzuć
                </button>
              </div>
            </div>

            <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Branża", offer.branch, "fas fa-industry"],
                ["Rodzaj usługi", offer.service_type, "fas fa-cogs"],
                ["Dostępna moc", offer.power_available, "fas fa-chart-bar"],
                ["Minimalne zamówienie", offer.min_order, "fas fa-boxes-stacked"],
                ["Termin realizacji", offer.lead_time, "fas fa-clock"],
                ["Data dodania", formatDate(offer.created_at), "fas fa-calendar"],
              ].map(([label, value, icon]) => (
                <div
                  key={label}
                  className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <i className={`${icon} text-[#1a5f3c]`}></i>
                    {label}
                  </p>
                  <p className="break-words text-sm font-bold text-slate-900">
                    {value || "Do ustalenia"}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-400">
              Podgląd publiczny będzie dostępny po zatwierdzeniu oferty.
            </p>
          </article>
        );
      })}
    </div>
  );
}

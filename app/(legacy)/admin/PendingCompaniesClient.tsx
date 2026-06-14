"use client";

import { useState, useTransition } from "react";
import { verifyCompany } from "./actions";

export type PendingCompany = {
  id: string;
  name: string | null;
  nip: string | null;
  industry: string | null;
  industries: string[] | null;
  service_types: string[] | null;
  location_voivodeship: string | null;
  location_city: string | null;
  website_url: string | null;
  is_verified: boolean | null;
  created_at: string | null;
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

export default function PendingCompaniesClient({
  companies,
}: {
  companies: PendingCompany[];
}) {
  const [isPending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState("");
  const [error, setError] = useState("");

  function handleVerify(companyId: string) {
    setError("");
    setActiveId(companyId);
    startTransition(async () => {
      try {
        await verifyCompany(companyId);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Nie udało się zweryfikować firmy."
        );
      } finally {
        setActiveId("");
      }
    });
  }

  if (companies.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        Brak firm oczekujących na weryfikację.
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

      {companies.map((company) => {
        const location = [company.location_city, company.location_voivodeship]
          .filter(Boolean)
          .join(", ");
        const isCurrentPending = isPending && activeId === company.id;

        return (
          <article
            key={company.id}
            className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                    Oczekuje na weryfikację
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {company.industry ?? "Branża główna niepodana"}
                  </span>
                </div>

                <h3 className="break-words text-xl font-extrabold text-slate-900">
                  {company.name ?? "Firma bez nazwy"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  NIP: {company.nip ?? "Brak"} · {location || "Lokalizacja niepodana"} ·{" "}
                  {formatDate(company.created_at)}
                </p>

                {company.website_url ? (
                  <a
                    href={company.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex min-w-0 items-center gap-2 break-words text-sm font-bold text-[#1a5f3c]"
                  >
                    <i className="fas fa-globe"></i>
                    Strona WWW firmy
                  </a>
                ) : null}
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={() => handleVerify(company.id)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0d3d26] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <i className="fas fa-check-circle"></i>
                {isCurrentPending ? "Weryfikowanie..." : "Zweryfikuj firmę"}
              </button>
            </div>

            <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2">
              <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Branże działalności
                </p>
                <div className="flex flex-wrap gap-2">
                  {company.industries && company.industries.length > 0 ? (
                    company.industries.map((industry) => (
                      <span
                        key={industry}
                        className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700"
                      >
                        {industry}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Brak danych.</span>
                  )}
                </div>
              </div>

              <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Usługi
                </p>
                <div className="flex flex-wrap gap-2">
                  {company.service_types && company.service_types.length > 0 ? (
                    company.service_types.map((serviceType) => (
                      <span
                        key={serviceType}
                        className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                      >
                        {serviceType}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Brak danych.</span>
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

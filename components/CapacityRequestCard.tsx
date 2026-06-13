import Link from "next/link";
import {
  formatCapacityRequestBudget,
  formatCapacityRequestDate,
  formatCapacityRequestVolume,
  type PublicCapacityRequest,
} from "@/lib/capacityRequests";
import { getLocalizedPath, type Locale } from "@/lib/i18n/config";

type CapacityRequestCardProps = {
  request: PublicCapacityRequest;
  locale: Locale;
  variant?: "public" | "compact";
};

export default function CapacityRequestCard({
  request,
  locale,
  variant = "public",
}: CapacityRequestCardProps) {
  const location =
    request.preferred_region || request.location || "Cała Polska / do ustalenia";
  const requestPath = getLocalizedPath(`/zapytania/${request.slug}`, locale);

  return (
    <article className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:p-6">
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          <i className="fas fa-circle-check"></i>
          Aktywne zlecenie
        </span>
        {request.technical_documentation_available ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            <i className="fas fa-file-lines"></i>
            Dokumentacja dostępna
          </span>
        ) : null}
        {request.is_featured ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#fbbf24]/20 px-3 py-1 text-xs font-bold text-[#8a5a00]">
            <i className="fas fa-star"></i>
            Wyróżnione
          </span>
        ) : null}
      </div>

      <h2 className="break-words text-xl font-extrabold leading-tight text-slate-900">
        <Link href={requestPath} className="transition hover:text-[#1a5f3c]">
          {request.title}
        </Link>
      </h2>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
        {request.description}
      </p>

      <div className="mt-5 grid min-w-0 gap-3 text-sm sm:grid-cols-2">
        <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
            Branża / usługa
          </p>
          <p className="break-words font-bold text-slate-900">
            {request.branch} · {request.service_type}
          </p>
        </div>
        <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
            Lokalizacja
          </p>
          <p className="break-words font-bold text-slate-900">{location}</p>
        </div>
        <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
            Wolumen
          </p>
          <p className="break-words font-bold text-slate-900">
            {formatCapacityRequestVolume(request)}
          </p>
        </div>
        <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
            Termin
          </p>
          <p className="break-words font-bold text-slate-900">
            {formatCapacityRequestDate(request.deadline)}
          </p>
        </div>
      </div>

      {variant === "public" ? (
        <div className="mt-5 flex min-w-0 flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-sm text-slate-500">
            <span className="font-bold text-slate-900">
              Budżet: {formatCapacityRequestBudget(request)}
            </span>
            <span className="mt-1 block">
              Ważne do: {formatCapacityRequestDate(request.expires_at)}
            </span>
          </div>
          <Link
            href={requestPath}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-[#0d3d26]"
          >
            Zobacz szczegóły
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>
      ) : null}
    </article>
  );
}

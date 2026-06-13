import Link from "next/link";
import {
  type PublicCapacityRequest,
} from "@/lib/capacityRequests";
import { getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type CapacityRequestCardProps = {
  request: PublicCapacityRequest;
  locale: Locale;
  variant?: "public" | "compact";
};

const intlLocales: Record<Locale, string> = {
  pl: "pl-PL",
  en: "en-US",
  de: "de-DE",
  uk: "uk-UA",
  es: "es-ES",
  fr: "fr-FR",
};

function formatRequestDate(value: string | null, locale: Locale, fallback: string) {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat(intlLocales[locale], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function formatRequestVolume(
  request: Pick<PublicCapacityRequest, "quantity" | "unit">,
  locale: Locale,
  fallback: string
) {
  if (request.quantity === null) {
    return fallback;
  }

  return `${request.quantity.toLocaleString(intlLocales[locale])} ${request.unit ?? ""}`.trim();
}

function formatRequestBudget(
  request: Pick<PublicCapacityRequest, "budget_type" | "budget_min" | "budget_max">,
  locale: Locale,
  labels: {
    budgetIndicative: string;
    notProvided: string;
  }
) {
  if (
    request.budget_type === "range" &&
    request.budget_min !== null &&
    request.budget_max !== null
  ) {
    return `${request.budget_min.toLocaleString(intlLocales[locale])} - ${request.budget_max.toLocaleString(intlLocales[locale])} PLN`;
  }

  if (request.budget_type === "indicative") {
    return labels.budgetIndicative;
  }

  return labels.notProvided;
}

export default function CapacityRequestCard({
  request,
  locale,
  variant = "public",
}: CapacityRequestCardProps) {
  const labels = getDictionary(locale).publicCapacityRequests.card;
  const location =
    request.preferred_region ||
    request.location ||
    `${labels.wholePoland} / ${labels.toBeAgreed}`;
  const requestPath = getLocalizedPath(`/zapytania/${request.slug}`, locale);

  return (
    <article className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:p-6">
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          <i className="fas fa-circle-check"></i>
          {labels.active}
        </span>
        {request.technical_documentation_available ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            <i className="fas fa-file-lines"></i>
            {labels.technicalDocumentationAvailable}
          </span>
        ) : null}
        {request.is_featured ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#fbbf24]/20 px-3 py-1 text-xs font-bold text-[#8a5a00]">
            <i className="fas fa-star"></i>
            {labels.featured}
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
            {labels.industryService}
          </p>
          <p className="break-words font-bold text-slate-900">
            {request.branch} · {request.service_type}
          </p>
        </div>
        <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
            {labels.location}
          </p>
          <p className="break-words font-bold text-slate-900">{location}</p>
        </div>
        <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
            {labels.volume}
          </p>
          <p className="break-words font-bold text-slate-900">
            {formatRequestVolume(request, locale, labels.toBeAgreed)}
          </p>
        </div>
        <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
            {labels.deadline}
          </p>
          <p className="break-words font-bold text-slate-900">
            {formatRequestDate(request.deadline, locale, labels.notProvided)}
          </p>
        </div>
      </div>

      {variant === "public" ? (
        <div className="mt-5 flex min-w-0 flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-sm text-slate-500">
            <span className="font-bold text-slate-900">
              {labels.budget}: {formatRequestBudget(request, locale, labels)}
            </span>
            <span className="mt-1 block">
              {labels.validUntil}: {formatRequestDate(request.expires_at, locale, labels.notProvided)}
            </span>
          </div>
          <Link
            href={requestPath}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-[#0d3d26]"
          >
            {labels.details}
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>
      ) : null}
    </article>
  );
}

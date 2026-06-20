import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CapacityRequestCard from "@/components/CapacityRequestCard";
import CapacityRequestInterestClient from "@/components/CapacityRequestInterestClient";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import StructuredData from "@/components/StructuredData";
import {
  getPublicCapacityRequestBySlug,
  getSimilarCapacityRequests,
  type PublicCapacityRequest,
} from "@/lib/capacityRequests";
import { getLocalizedPath, supportedLocales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getAbsoluteUrl } from "@/lib/seo";

type CapacityRequestDetailViewProps = {
  slug: string;
  locale: Locale;
};

type TemplateValues = {
  title: string;
  branch: string;
  service: string;
};

const intlLocales: Record<Locale, string> = {
  pl: "pl-PL",
  en: "en-US",
  de: "de-DE",
  uk: "uk-UA",
  es: "es-ES",
  fr: "fr-FR",
};

const openGraphLocales: Record<Locale, string> = {
  pl: "pl_PL",
  en: "en_US",
  de: "de_DE",
  uk: "uk_UA",
  es: "es_ES",
  fr: "fr_FR",
};

function formatTemplate(template: string, values: TemplateValues) {
  return template
    .split("{title}")
    .join(values.title)
    .split("{branch}")
    .join(values.branch)
    .split("{service}")
    .join(values.service);
}

function getLanguageAlternates(slug: string) {
  const path = `/zapytania/${slug}`;

  return {
    ...Object.fromEntries(
      supportedLocales.map((item) => [item, getLocalizedPath(path, item)])
    ),
    "x-default": getLocalizedPath(path, "pl"),
  };
}

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

export async function generateCapacityRequestMetadata({
  slug,
  locale,
}: CapacityRequestDetailViewProps): Promise<Metadata> {
  const request = await getPublicCapacityRequestBySlug(slug);

  if (!request) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const seoCopy = dictionary.publicCapacityRequests.seo;
  const templateValues = {
    title: request.title,
    branch: request.branch,
    service: request.service_type,
  };
  const socialTitle = formatTemplate(
    seoCopy.detailTitleTemplate,
    templateValues
  );
  const title = socialTitle.replace(/\s*\|\s*WolneMoce$/, "");
  const description = formatTemplate(
    seoCopy.detailDescriptionTemplate,
    templateValues
  );
  const requestPath = getLocalizedPath(`/zapytania/${request.slug}`, locale);
  const imageUrl = getAbsoluteUrl("/og/wolnemoce-og.png");

  return {
    title,
    description,
    alternates: {
      canonical: requestPath,
      languages: getLanguageAlternates(request.slug),
    },
    openGraph: {
      title: socialTitle,
      description,
      url: requestPath,
      siteName: "WolneMoce",
      locale: openGraphLocales[locale],
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: socialTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [imageUrl],
    },
  };
}

export default async function CapacityRequestDetailView({
  slug,
  locale,
}: CapacityRequestDetailViewProps) {
  const request = await getPublicCapacityRequestBySlug(slug);

  if (!request) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const detailCopy = dictionary.publicCapacityRequests.detail;
  const interestCopy = dictionary.publicCapacityRequests.interest;
  const listCopy = dictionary.publicCapacityRequests.list;
  const similarRequests = await getSimilarCapacityRequests(request);
  const location =
    request.preferred_region ||
    request.location ||
    `${detailCopy.wholePoland} / ${detailCopy.toBeAgreed}`;
  const requestsPath = getLocalizedPath("/zapytania", locale);
  const homePath = getLocalizedPath("/", locale);
  const requestPath = getLocalizedPath(`/zapytania/${request.slug}`, locale);
  const canonicalUrl = getAbsoluteUrl(requestPath);
  const interestLabels = {
    title: interestCopy.title,
    description: interestCopy.description,
    submit: interestCopy.submit,
    submitting: interestCopy.submitting,
    successTitle: interestCopy.successTitle,
    successDescription: interestCopy.successDescription,
    genericError: interestCopy.genericError,
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "WolneMoce",
        item: getAbsoluteUrl(homePath),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: listCopy.title,
        item: getAbsoluteUrl(requestsPath),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: request.title,
        item: canonicalUrl,
      },
    ],
  };

  const parameters = [
    [detailCopy.industry, request.branch, "fas fa-industry"],
    [detailCopy.service, request.service_type, "fas fa-screwdriver-wrench"],
    [detailCopy.location, location, "fas fa-location-dot"],
    [detailCopy.volume, formatRequestVolume(request, locale, detailCopy.toBeAgreed), "fas fa-boxes-stacked"],
    [detailCopy.deadline, formatRequestDate(request.deadline, locale, detailCopy.notProvided), "fas fa-calendar-day"],
    [
      detailCopy.budget,
      formatRequestBudget(request, locale, detailCopy),
      "fas fa-wallet",
    ],
    [
      detailCopy.technicalDocumentation,
      request.technical_documentation_available
        ? detailCopy.technicalDocumentationAvailable
        : detailCopy.technicalDocumentationUnavailable,
      "fas fa-file-lines",
    ],
    [detailCopy.validUntil, formatRequestDate(request.expires_at, locale, detailCopy.notProvided), "fas fa-hourglass-half"],
    [detailCopy.publishedAt, formatRequestDate(request.created_at, locale, detailCopy.notProvided), "fas fa-clock"],
  ];

  return (
    <>
      <StructuredData data={jsonLd} />
      <Navbar locale={locale} />
      <main className="bg-white pb-24 lg:pb-0">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3d26] via-[#1a5f3c] to-[#2d8a5e] px-6 pb-16 pt-36 text-white md:pb-20">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_20%_50%,white_2px,transparent_2px),radial-gradient(circle_at_80%_20%,white_1px,transparent_1px),radial-gradient(circle_at_40%_80%,white_1.5px,transparent_1.5px)] [background-size:60px_60px,40px_40px,80px_80px]" />
          <div className="relative z-10 mx-auto max-w-[1400px] min-w-0">
            <Link
              href={requestsPath}
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80 no-underline transition hover:text-white"
            >
              <i className="fas fa-arrow-left text-xs"></i>
              {detailCopy.backToRequests}
            </Link>
            <div className="mb-5 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                <i className="fas fa-circle-check"></i>
                {detailCopy.active}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                <i className="fas fa-shield-halved text-[#fbbf24]"></i>
                {detailCopy.publicRequestBadge}
              </span>
              {request.is_featured ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fbbf24]/20 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                  <i className="fas fa-star text-[#fbbf24]"></i>
                  {detailCopy.featured}
                </span>
              ) : null}
            </div>
            <h1 className="max-w-5xl break-words text-3xl font-black leading-tight tracking-[-1px] md:text-5xl">
              {request.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">
              {detailCopy.heroDescription}
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1400px] min-w-0 gap-8 px-6 py-16 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0 space-y-8">
            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#1a5f3c]">
                  <i className="fas fa-list-check"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    {detailCopy.parametersTitle}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {detailCopy.parametersDescription}
                  </p>
                </div>
              </div>
              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                {parameters.map(([label, value, icon]) => (
                  <div key={label} className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <i className={`${icon} text-[#1a5f3c]`}></i>
                      {label}
                    </div>
                    <p className="break-words text-sm font-extrabold text-slate-900">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-4">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {detailCopy.descriptionTitle}
                </h2>
              </div>
              <p className="whitespace-pre-line text-base leading-8 text-slate-600">
                {request.description}
              </p>
            </section>
          </div>

          <aside className="min-w-0">
            <div className="sticky top-24 space-y-6">
              <CapacityRequestInterestClient
                capacityRequestId={request.id}
                returnTo={requestPath}
                labels={interestLabels}
              />
              <div className="rounded-[24px] border border-amber-100 bg-amber-50 p-5">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-amber-900">
                  <i className="fas fa-eye-slash text-amber-600"></i>
                  {detailCopy.requesterPrivacyTitle}
                </h3>
                <p className="text-sm leading-6 text-amber-800">
                  {detailCopy.requesterPrivacyDescription}
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="bg-slate-50 px-6 py-16">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="section-label">{detailCopy.similarRequestsTitle}</div>
                <h2 className="section-title">{detailCopy.similarRequestsDescription}</h2>
              </div>
              <Link href={requestsPath} className="btn btn-outline">
                {detailCopy.allRequests}
              </Link>
            </div>
            {similarRequests.length > 0 ? (
              <div className="grid min-w-0 gap-6 lg:grid-cols-3">
                {similarRequests.map((item) => (
                  <CapacityRequestCard key={item.id} request={item} locale={locale} variant="compact" />
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                {detailCopy.noSimilarRequests}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}

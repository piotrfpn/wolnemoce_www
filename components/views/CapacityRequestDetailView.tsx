import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CapacityRequestCard from "@/components/CapacityRequestCard";
import CapacityRequestInterestClient from "@/components/CapacityRequestInterestClient";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import StructuredData from "@/components/StructuredData";
import {
  formatCapacityRequestBudget,
  formatCapacityRequestDate,
  formatCapacityRequestVolume,
  getPublicCapacityRequestBySlug,
  getSimilarCapacityRequests,
} from "@/lib/capacityRequests";
import { getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getAbsoluteUrl } from "@/lib/seo";

type CapacityRequestDetailViewProps = {
  slug: string;
  locale: Locale;
};

export async function generateCapacityRequestMetadata({
  slug,
  locale,
}: CapacityRequestDetailViewProps): Promise<Metadata> {
  const request = await getPublicCapacityRequestBySlug(slug);

  if (!request) {
    const title = "Zapytanie nie znalezione | WolneMoce";
    const description = "Zapytanie produkcyjne nie istnieje albo nie jest aktywne.";
    const requestPath = getLocalizedPath(`/zapytania/${slug}`, locale);

    return {
      title,
      description,
      alternates: {
        canonical: requestPath,
      },
      openGraph: {
        title,
        description,
        url: requestPath,
        siteName: "WolneMoce",
        type: "website",
      },
    };
  }

  const title = `${request.title} | Zapytanie produkcyjne | WolneMoce`;
  const description = `Zapytanie produkcyjne z branży ${request.branch} / ${request.service_type}. Sprawdź szczegóły i zgłoś zainteresowanie jako wykonawca.`;
  const requestPath = getLocalizedPath(`/zapytania/${request.slug}`, locale);

  return {
    title,
    description,
    alternates: {
      canonical: requestPath,
    },
    openGraph: {
      title,
      description,
      url: requestPath,
      siteName: "WolneMoce",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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

  const similarRequests = await getSimilarCapacityRequests(request);
  const location =
    request.preferred_region || request.location || "Cała Polska / do ustalenia";
  const requestsPath = getLocalizedPath("/zapytania", locale);
  const requestPath = getLocalizedPath(`/zapytania/${request.slug}`, locale);
  const canonicalUrl = getAbsoluteUrl(requestPath);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "WolneMoce",
        item: getAbsoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Zapytania produkcyjne",
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
    ["Branża", request.branch, "fas fa-industry"],
    ["Rodzaj usługi", request.service_type, "fas fa-screwdriver-wrench"],
    ["Preferowana lokalizacja", location, "fas fa-location-dot"],
    ["Wolumen", formatCapacityRequestVolume(request), "fas fa-boxes-stacked"],
    ["Termin", formatCapacityRequestDate(request.deadline), "fas fa-calendar-day"],
    ["Budżet", formatCapacityRequestBudget(request), "fas fa-wallet"],
    [
      "Dokumentacja techniczna",
      request.technical_documentation_available ? "Dostępna u zlecającego" : "Nie zadeklarowano",
      "fas fa-file-lines",
    ],
    ["Ważne do", formatCapacityRequestDate(request.expires_at), "fas fa-hourglass-half"],
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
              Wróć do zapytań
            </Link>
            <div className="mb-5 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                <i className="fas fa-circle-check"></i>
                Aktywne zlecenie
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                <i className="fas fa-shield-halved text-[#fbbf24]"></i>
                Kontakt ukryty publicznie
              </span>
            </div>
            <h1 className="max-w-5xl break-words text-3xl font-black leading-tight tracking-[-1px] md:text-5xl">
              {request.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">
              Firma szuka wykonawcy lub podwykonawcy. Dane kontaktowe zlecającego
              nie są publicznie widoczne.
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
                    Parametry zlecenia
                  </h2>
                  <p className="text-sm text-slate-500">
                    Informacje udostępnione publicznie po moderacji.
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
              <h2 className="mb-4 text-2xl font-extrabold text-slate-900">
                Opis potrzeby
              </h2>
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
              />
              <div className="rounded-[24px] border border-amber-100 bg-amber-50 p-5">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-amber-900">
                  <i className="fas fa-eye-slash text-amber-600"></i>
                  Dane zlecającego są ukryte
                </h3>
                <p className="text-sm leading-6 text-amber-800">
                  Publiczny widok nie pokazuje nazwy firmy, NIP, emaila,
                  telefonu ani osoby kontaktowej.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="bg-slate-50 px-6 py-16">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="section-label">Podobne zapytania</div>
                <h2 className="section-title">Zlecenia z tej samej branży</h2>
              </div>
              <Link href={requestsPath} className="btn btn-outline">
                Wszystkie zapytania
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
                Brak podobnych aktywnych zapytań.
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

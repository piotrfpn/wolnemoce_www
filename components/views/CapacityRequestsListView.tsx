import Link from "next/link";
import { Suspense } from "react";
import CapacityRequestCard from "@/components/CapacityRequestCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import StructuredData from "@/components/StructuredData";
import CapacityRequestsFiltersClient from "@/app/zapytania/CapacityRequestsFiltersClient";
import { categories, getServicesForIndustry } from "@/lib/mockData";
import { getPublicCapacityRequests } from "@/lib/capacityRequests";
import { getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getAbsoluteUrl } from "@/lib/seo";

type CapacityRequestsListViewProps = {
  locale: Locale;
  searchParams?: Record<string, string | string[] | undefined>;
};

function getSingleParam(
  searchParams: CapacityRequestsListViewProps["searchParams"],
  key: string
) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function normalizeParamValue(value: string) {
  return value
    .replace(/[łŁ]/g, (match) => (match === "Ł" ? "L" : "l"))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getOptionFromParam(value: string, options: string[]) {
  if (!value) {
    return "";
  }

  const normalized = normalizeParamValue(value);
  return options.find((option) => option === value || normalizeParamValue(option) === normalized) ?? "";
}

export default async function CapacityRequestsListView({
  locale,
  searchParams,
}: CapacityRequestsListViewProps) {
  const branch = getOptionFromParam(getSingleParam(searchParams, "branza"), categories);
  const serviceOptions = getServicesForIndustry(branch);
  const serviceType = getOptionFromParam(
    getSingleParam(searchParams, "usluga"),
    serviceOptions
  );
  const q = getSingleParam(searchParams, "q").trim();
  const requests = await getPublicCapacityRequests({
    branch,
    serviceType,
    q,
  });
  const requestsPath = getLocalizedPath("/zapytania", locale);
  const homePath = getLocalizedPath("/", locale);
  const addOfferPath = getLocalizedPath("/dodaj-oferte", locale);
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
        name: "Zapytania produkcyjne",
        item: getAbsoluteUrl(requestsPath),
      },
    ],
  };

  return (
    <>
      <StructuredData data={jsonLd} />
      <Navbar locale={locale} />
      <main className="bg-white">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3d26] via-[#1a5f3c] to-[#2d8a5e] px-6 pb-24 pt-36 text-white">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_20%_50%,white_2px,transparent_2px),radial-gradient(circle_at_80%_20%,white_1px,transparent_1px),radial-gradient(circle_at_40%_80%,white_1.5px,transparent_1.5px)] [background-size:60px_60px,40px_40px,80px_80px]" />
          <div className="relative z-10 mx-auto grid max-w-[1400px] min-w-0 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="min-w-0">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-5 py-2 text-sm font-medium backdrop-blur">
                <i className="fas fa-clipboard-list text-[#fbbf24]"></i>
                Publiczne zlecenia B2B
              </div>
              <h1 className="mb-5 max-w-4xl text-4xl font-black leading-tight tracking-[-1px] md:text-5xl lg:text-[56px]">
                Zapytania produkcyjne
              </h1>
              <p className="mb-8 max-w-2xl text-lg leading-8 text-white/85">
                Firmy szukające wykonawców, podwykonawców i dostępnych mocy
                produkcyjnych.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/dodaj-zapytanie" className="btn btn-accent">
                  <i className="fas fa-plus"></i>
                  Dodaj zapytanie
                </Link>
                <Link href={addOfferPath} className="btn btn-outline bg-white text-[#1a5f3c]">
                  Mam wolne moce - dodaj ofertę
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="rounded-[24px] border border-white/20 bg-white/10 p-7 shadow-2xl backdrop-blur">
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#fbbf24] text-xl font-black text-[#1a5f3c]">
                    WM
                  </div>
                  <div>
                    <h2 className="font-bold">Aktualny popyt</h2>
                    <p className="text-sm text-white/65">
                      Dane kontaktowe zlecających pozostają ukryte publicznie.
                    </p>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    <p className="text-3xl font-extrabold">{requests.length}</p>
                    <p className="text-xs text-white/70">aktywnych zapytań</p>
                  </div>
                  {categories.slice(0, 3).map((item) => (
                    <div key={item} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1400px] min-w-0 gap-8 px-6 py-16 lg:grid-cols-[310px_1fr]">
          <aside className="h-fit min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <div className="mb-6">
              <h2 className="text-lg font-extrabold text-slate-900">
                Filtry zapytań
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Zawęź listę po branży, usłudze albo frazie z opisu.
              </p>
            </div>
            <Suspense fallback={<div className="text-sm text-slate-500">Ładowanie filtrów...</div>}>
              <CapacityRequestsFiltersClient
                categories={categories}
                services={serviceOptions}
              />
            </Suspense>
            <div className="mt-7 rounded-2xl bg-gradient-to-br from-[#0d3d26] to-[#1a5f3c] p-5 text-white">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <i className="fas fa-bullhorn"></i>
              </div>
              <h3 className="mb-2 font-bold">Szukasz wykonawcy?</h3>
              <p className="mb-4 text-sm leading-6 text-white/75">
                Dodaj zlecenie, a po moderacji pokażemy je firmom produkcyjnym.
              </p>
              <Link
                href="/dodaj-zapytanie"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#1a5f3c]"
              >
                Dodaj zapytanie
                <i className="fas fa-arrow-right text-xs"></i>
              </Link>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-6 flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">Wyniki</p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {requests.length} {requests.length === 1 ? "zapytanie" : "zapytań"}
                </h2>
              </div>
              <Link
                href={requestsPath}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-5 py-3 text-sm font-bold text-[#1a5f3c] transition hover:bg-[#1a5f3c] hover:text-white"
              >
                Wyczyść filtry
              </Link>
            </div>

            {requests.length > 0 ? (
              <div className="grid min-w-0 gap-6 xl:grid-cols-2">
                {requests.map((request) => (
                  <CapacityRequestCard key={request.id} request={request} locale={locale} />
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1a5f3c] shadow-sm">
                  <i className="fas fa-circle-info text-xl"></i>
                </div>
                <h3 className="mb-2 text-xl font-extrabold text-slate-900">
                  Bądź pierwszą firmą, która doda zapytanie w tej kategorii.
                </h3>
                <p className="mx-auto mb-6 max-w-2xl text-sm leading-6 text-slate-500">
                  Zleć produkcję lub znajdź podwykonawcę wśród sprawdzonych firm
                  na WolneMoce.
                </p>
                <Link href="/dodaj-zapytanie" className="btn btn-primary">
                  Dodaj zapytanie
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

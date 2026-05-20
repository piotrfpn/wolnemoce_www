import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AddOfferLinkClient from "@/components/AddOfferLinkClient";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PublicOfferCard, { type PublicOffer } from "@/components/PublicOfferCard";
import { cityToSlug, createCityOptions, type CityOption } from "@/lib/location";
import { categories, industryServiceTypes, provinces, services } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/server";
import OffersFiltersClient from "./OffersFiltersClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Oferty wolnych mocy produkcyjnych",
  description:
    "Przeglądaj aktywne oferty wolnych mocy produkcyjnych, magazynowych, logistycznych i technicznych w Polsce.",
};

type OffersPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function getSingleParam(
  searchParams: OffersPageProps["searchParams"],
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

function getLegacyParam(
  searchParams: OffersPageProps["searchParams"],
  primaryKey: string,
  legacyKey: string
) {
  return (
    getSingleParam(searchParams, primaryKey).trim() ||
    getSingleParam(searchParams, legacyKey).trim()
  );
}

function getOptionFromParam(value: string, options: string[]) {
  if (!value) {
    return "";
  }

  const normalizedValue = normalizeParamValue(value);

  return (
    options.find(
      (option) =>
        option === value || normalizeParamValue(option) === normalizedValue
    ) ?? value
  );
}

function sanitizeSearchTerm(value: string) {
  return value.replace(/[(),%]/g, " ").replace(/\s+/g, " ").trim();
}

function getFilterState(
  searchParams: OffersPageProps["searchParams"],
  cityOptions: CityOption[]
) {
  const sort = getSingleParam(searchParams, "sort").trim();
  const cityParam = getSingleParam(searchParams, "miasto").trim();
  const city = cityParam
    ? cityOptions.find(
        (option) =>
          option.slug === cityToSlug(cityParam) || option.label === cityParam
      ) ?? null
    : null;

  return {
    q: getSingleParam(searchParams, "q").trim(),
    industry: getOptionFromParam(
      getLegacyParam(searchParams, "branza", "industry"),
      categories
    ),
    serviceType: getOptionFromParam(
      getLegacyParam(searchParams, "usluga", "service_type"),
      services
    ),
    voivodeship: getOptionFromParam(
      getLegacyParam(searchParams, "wojewodztwo", "voivodeship"),
      provinces
    ),
    city,
    verified: getSingleParam(searchParams, "verified") === "true",
    sort: ["newest", "featured", "popular", "az"].includes(sort)
      ? sort
      : "newest",
  };
}

async function getCompanyIdsByName(query: string) {
  if (!query) {
    return [];
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("companies")
    .select("id")
    .ilike("name", `%${query}%`)
    .limit(50);

  return data?.map((company) => company.id as string) ?? [];
}

async function getFilterCities() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("companies!inner(location_city)")
    .eq("status", "active")
    .limit(200);

  if (error) {
    console.error("Offer city options query failed", error);
    return [];
  }

  const rawCities = (data ?? [])
    .map((offer) => {
      const companies = offer.companies as
        | { location_city: string | null }
        | { location_city: string | null }[]
        | null;
      const company = Array.isArray(companies) ? companies[0] : companies;

      return company?.location_city?.trim() ?? "";
    })
    .filter(Boolean);

  return createCityOptions(rawCities);
}

async function getPublicOffers(
  filters: ReturnType<typeof getFilterState>
): Promise<PublicOffer[]> {
  const supabase = createClient();
  const searchTerm = sanitizeSearchTerm(filters.q);
  const companyIds = await getCompanyIdsByName(searchTerm);

  let query = supabase
    .from("offers")
    .select(
      "id, title, slug, branch, service_type, description, power_available, min_order, lead_time, status, is_featured, featured_until, featured_priority, created_at, companies!inner(name, slug, description, location_voivodeship, location_city, is_verified, website_url), offer_images(id, path, alt, sort_order)"
    )
    .eq("status", "active");

  if (searchTerm) {
    const searchFilters = [
      `title.ilike.%${searchTerm}%`,
      `description.ilike.%${searchTerm}%`,
      `branch.ilike.%${searchTerm}%`,
      `service_type.ilike.%${searchTerm}%`,
    ];

    if (companyIds.length > 0) {
      searchFilters.push(`company_id.in.(${companyIds.join(",")})`);
    }

    query = query.or(searchFilters.join(","));
  }

  if (filters.industry) {
    query = query.eq("branch", filters.industry);
  }

  if (filters.serviceType) {
    query = query.eq("service_type", filters.serviceType);
  }

  if (filters.voivodeship) {
    query = query.eq("companies.location_voivodeship", filters.voivodeship);
  }

  if (filters.city) {
    query = query.in("companies.location_city", filters.city.values);
  }

  if (filters.verified) {
    query = query.eq("companies.is_verified", true);
  }

  if (filters.sort === "az") {
    query = query.order("title", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Public offers query failed", error);
    return [];
  }

  const offers = (data ?? []) as unknown as PublicOffer[];

  if (filters.sort === "featured") {
    const now = Date.now();

    return [...offers].sort((first, second) => {
      const firstFeatured =
        first.is_featured &&
        (!first.featured_until || new Date(first.featured_until).getTime() > now)
          ? 1
          : 0;
      const secondFeatured =
        second.is_featured &&
        (!second.featured_until || new Date(second.featured_until).getTime() > now)
          ? 1
          : 0;

      if (firstFeatured !== secondFeatured) {
        return secondFeatured - firstFeatured;
      }

      const priorityDiff =
        (second.featured_priority ?? 0) - (first.featured_priority ?? 0);

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return (
        new Date(second.created_at ?? 0).getTime() -
        new Date(first.created_at ?? 0).getTime()
      );
    });
  }

  return offers;
}

export default async function OffersPage({ searchParams }: OffersPageProps) {
  const cityOptions = await getFilterCities();
  const filters = getFilterState(searchParams, cityOptions);
  const publicOffers = await getPublicOffers(filters);
  const serviceOptions = filters.industry
    ? industryServiceTypes[filters.industry] ?? services
    : services;

  return (
    <>
      <Navbar />

      <main className="bg-white">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3d26] via-[#1a5f3c] to-[#2d8a5e] px-6 pb-24 pt-36 text-white">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_20%_50%,white_2px,transparent_2px),radial-gradient(circle_at_80%_20%,white_1px,transparent_1px),radial-gradient(circle_at_40%_80%,white_1.5px,transparent_1.5px)] [background-size:60px_60px,40px_40px,80px_80px]" />

          <div className="relative z-10 mx-auto grid max-w-[1400px] min-w-0 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="min-w-0">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-5 py-2 text-sm font-medium backdrop-blur">
                <i className="fas fa-list-check text-[#fbbf24]"></i>
                Aktywne oferty z firm
              </div>

              <h1 className="mb-5 max-w-3xl text-4xl font-black leading-tight tracking-[-1px] md:text-5xl lg:text-[56px]">
                Znajdź dostępne moce produkcyjne w Polsce
              </h1>

              <p className="mb-8 max-w-2xl text-lg leading-8 text-white/85">
                Przeglądaj aktywne oferty firm produkcyjnych, magazynowych,
                logistycznych i technicznych. Publicznie pokazujemy tylko oferty
                zatwierdzone jako aktywne.
              </p>

              <div className="grid max-w-2xl grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <div className="text-3xl font-extrabold">{publicOffers.length}</div>
                  <div className="mt-1 text-xs text-white/70">
                    Wyników dla filtrów
                  </div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <div className="text-3xl font-extrabold">{categories.length}</div>
                  <div className="mt-1 text-xs text-white/70">Branż B2B</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <div className="text-3xl font-extrabold">active</div>
                  <div className="mt-1 text-xs text-white/70">
                    Status widoczny publicznie
                  </div>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="rounded-[24px] border border-white/20 bg-white/10 p-7 shadow-2xl backdrop-blur">
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#fbbf24] text-xl font-black">
                    WM
                  </div>
                  <div>
                    <h2 className="font-bold">Szybki podgląd rynku</h2>
                    <p className="text-sm text-white/65">
                      Oferty według branż i lokalizacji
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {categories.slice(0, 4).map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"
                    >
                      <span className="text-sm font-semibold">{item}</span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#1a5f3c]">
                        Filtr
                      </span>
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
              <h2 className="text-lg font-extrabold text-slate-900">Filtry</h2>
              <p className="mt-1 text-sm text-slate-500">
                Źródłem prawdy jest adres URL.
              </p>
            </div>

            <Suspense
              fallback={
                <div className="text-sm text-slate-500">Ładowanie filtrów...</div>
              }
            >
              <OffersFiltersClient
                categories={categories}
                services={serviceOptions}
                provinces={provinces}
                cities={cityOptions}
              />
            </Suspense>

            <div className="mt-7 rounded-2xl bg-gradient-to-br from-[#0d3d26] to-[#1a5f3c] p-5 text-white">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <i className="fas fa-plus"></i>
              </div>
              <h3 className="mb-2 font-bold">Masz wolne moce?</h3>
              <p className="mb-4 text-sm leading-6 text-white/75">
                Dodaj ofertę w panelu firmy i wyślij ją do zatwierdzenia.
              </p>
              <AddOfferLinkClient
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#1a5f3c]"
              >
                Dodaj ofertę
                <i className="fas fa-arrow-right text-xs"></i>
              </AddOfferLinkClient>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-6 flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">Znaleziono</p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {publicOffers.length}{" "}
                  {publicOffers.length === 1 ? "ofertę" : "ofert"}
                </h2>
              </div>
              <Link
                href="/oferty"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-5 py-3 text-sm font-bold text-[#1a5f3c] transition hover:bg-[#1a5f3c] hover:text-white"
              >
                Wyczyść filtry
              </Link>
            </div>

            {publicOffers.length > 0 ? (
              <div className="grid min-w-0 gap-6 xl:grid-cols-2">
                {publicOffers.map((offer) => (
                  <PublicOfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1a5f3c] shadow-sm">
                  <i className="fas fa-circle-info text-xl"></i>
                </div>
                <h3 className="mb-2 text-xl font-extrabold text-slate-900">
                  Brak ofert dla wybranych filtrów.
                </h3>
                <p className="mx-auto mb-6 max-w-2xl text-sm leading-6 text-slate-500">
                  Publicznie widoczne są tylko oferty ze statusem active.
                  Zmień kryteria albo wyczyść filtry.
                </p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <AddOfferLinkClient className="btn btn-primary">
                    Dodaj ofertę
                  </AddOfferLinkClient>
                  <Link href="/oferty" className="btn btn-outline">
                    Wyczyść filtry
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import AddOfferLinkClient from "@/components/AddOfferLinkClient";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Katalog firm | WolneMoce.pl",
  description:
    "Przeglądaj zweryfikowane firmy oferujące wolne moce produkcyjne, logistyczne i techniczne.",
};

export const revalidate = 3600;

type PublicCompany = {
  id: string;
  slug: string | null;
  name: string | null;
  description: string | null;
  industry: string | null;
  industries: string[] | null;
  service_types: string[] | null;
  location_voivodeship: string | null;
  location_city: string | null;
  website_url: string | null;
  is_verified: boolean | null;
  created_at: string | null;
};

function createPublicSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, supabaseKey);
}

function getInitials(name: string | null) {
  if (!name) {
    return "WM";
  }

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function truncateDescription(description: string | null, maxLength = 150) {
  if (!description) {
    return "Firma nie dodała jeszcze opisu.";
  }

  if (description.length <= maxLength) {
    return description;
  }

  return `${description.slice(0, maxLength - 1).trimEnd()}...`;
}

async function getVerifiedCompanies() {
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("companies")
    .select(
      "id, slug, name, description, industry, industries, service_types, location_voivodeship, location_city, website_url, is_verified, created_at"
    )
    .eq("is_verified", true)
    .not("slug", "is", null)
    .neq("slug", "")
    .order("name", { ascending: true })
    .limit(100);

  if (error) {
    console.error("Verified companies query failed", error);
    return [];
  }

  return (data ?? []) as PublicCompany[];
}

export default async function CompaniesPage() {
  const companies = await getVerifiedCompanies();

  return (
    <>
      <Navbar />
      <main className="bg-white">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3d26] via-[#1a5f3c] to-[#2d8a5e] px-6 pb-20 pt-36 text-white">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_20%_50%,white_2px,transparent_2px),radial-gradient(circle_at_80%_20%,white_1px,transparent_1px),radial-gradient(circle_at_40%_80%,white_1.5px,transparent_1.5px)] [background-size:60px_60px,40px_40px,80px_80px]" />

          <div className="relative z-10 mx-auto max-w-[1400px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-5 py-2 text-sm font-medium backdrop-blur">
              <i className="fas fa-building-circle-check text-[#fbbf24]"></i>
              Zweryfikowane firmy
            </div>
            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-[-1px] md:text-5xl lg:text-[56px]">
              Katalog firm
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/85">
              Przeglądaj zweryfikowane firmy oferujące wolne moce produkcyjne,
              logistyczne i techniczne.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/oferty" className="btn btn-accent">
                Zobacz dostępne oferty
              </Link>
              <AddOfferLinkClient className="btn btn-outline bg-white text-[#1a5f3c]">
                Dodaj firmę i ofertę
              </AddOfferLinkClient>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 py-16">
          <div className="mb-8 flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <div className="section-label">Firmy</div>
              <h2 className="section-title">Zweryfikowani dostawcy B2B</h2>
            </div>
            <p className="text-sm font-semibold text-slate-500">
              {companies.length} firm w katalogu
            </p>
          </div>

          {companies.length > 0 ? (
            <div className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {companies.map((company) => {
                const location = [
                  company.location_city,
                  company.location_voivodeship,
                ]
                  .filter(Boolean)
                  .join(", ");
                const industries =
                  company.industries && company.industries.length > 0
                    ? company.industries
                    : company.industry
                      ? [company.industry]
                      : [];
                const services = company.service_types ?? [];

                return (
                  <article
                    key={company.id}
                    className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#1a5f3c] hover:shadow-md"
                  >
                    <div className="mb-5 flex min-w-0 items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1a5f3c] to-[#2d8a5e] text-lg font-black text-white shadow-sm">
                        {getInitials(company.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            <i className="fas fa-check-circle"></i>
                            Zweryfikowana
                          </span>
                        </div>
                        <h3 className="break-words text-xl font-extrabold text-slate-900">
                          {company.name ?? "Firma"}
                        </h3>
                        {location ? (
                          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                            <i className="fas fa-location-dot text-[#1a5f3c]"></i>
                            {location}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <p className="mb-5 text-sm leading-6 text-slate-600">
                      {truncateDescription(company.description)}
                    </p>

                    <div className="mb-5 space-y-4">
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Branże
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {industries.length > 0 ? (
                            industries.slice(0, 4).map((industry) => (
                              <span
                                key={industry}
                                className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700"
                              >
                                {industry}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-400">Brak danych</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Usługi
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {services.length > 0 ? (
                            services.slice(0, 5).map((service) => (
                              <span
                                key={service}
                                className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                              >
                                {service}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-400">Brak danych</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                      {company.slug ? (
                        <Link
                          href={`/firmy/${company.slug}`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-4 py-3 text-sm font-bold text-white no-underline transition hover:bg-[#0d3d26]"
                        >
                          Zobacz profil
                          <i className="fas fa-arrow-right text-xs"></i>
                        </Link>
                      ) : null}
                      {company.website_url ? (
                        <a
                          href={company.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-4 py-3 text-sm font-bold text-[#1a5f3c] no-underline transition hover:bg-[#1a5f3c] hover:text-white"
                        >
                          <i className="fas fa-globe"></i>
                          WWW
                        </a>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1a5f3c] shadow-sm">
                <i className="fas fa-building text-xl"></i>
              </div>
              <h3 className="mb-2 text-xl font-extrabold text-slate-900">
                Nie ma jeszcze firm do wyświetlenia.
              </h3>
              <p className="mx-auto mb-6 max-w-2xl text-sm leading-6 text-slate-500">
                Katalog pokaże firmy po weryfikacji przez administratora.
              </p>
              <Link href="/oferty" className="btn btn-outline">
                Zobacz dostępne oferty
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

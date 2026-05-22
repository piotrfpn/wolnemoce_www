import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PublicOfferCard, { type PublicOffer } from "@/components/PublicOfferCard";
import { createClient } from "@/lib/supabase/server";

type CompanyProfilePageProps = {
  params: {
    slug: string;
  };
};

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
  presentation_file_name: string | null;
};

export const dynamic = "force-dynamic";

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

function truncateDescription(description: string, maxLength = 155) {
  if (description.length <= maxLength) {
    return description;
  }

  return `${description.slice(0, maxLength - 1).trimEnd()}...`;
}

async function getCompanyBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("companies")
    .select(
      "id, slug, name, description, industry, industries, service_types, location_voivodeship, location_city, website_url, is_verified, presentation_file_name"
    )
    .eq("slug", slug)
    .eq("is_verified", true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as PublicCompany;
}

async function getCompanyActiveOffers(companyId: string, company: PublicCompany) {
  const supabase = createClient();
  const { data } = await supabase
    .from("offers")
    .select(
      "id, title, slug, branch, service_type, description, power_available, min_order, lead_time, status, created_at, offer_images(id, path, alt, sort_order)"
    )
    .eq("company_id", companyId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return ((data ?? []) as Omit<PublicOffer, "companies">[]).map((offer) => ({
    ...offer,
    companies: company,
  }));
}

export async function generateMetadata({
  params,
}: CompanyProfilePageProps): Promise<Metadata> {
  const company = await getCompanyBySlug(params.slug);

  if (!company) {
    return {
      title: "Nie znaleziono firmy | WolneMoce.pl",
      description: "Nie znaleziono profilu firmy w serwisie WolneMoce.pl.",
    };
  }

  const location = [company.location_city, company.location_voivodeship]
    .filter(Boolean)
    .join(", ");
  const description =
    company.description ||
    `${company.industry ?? "Firma B2B"}${location ? ` · ${location}` : ""}`;

  return {
    title: `${company.name} | Profil firmy | WolneMoce.pl`,
    description: truncateDescription(description),
  };
}

export default async function CompanyProfilePage({
  params,
}: CompanyProfilePageProps) {
  const company = await getCompanyBySlug(params.slug);

  if (!company) {
    notFound();
  }

  const activeOffers = await getCompanyActiveOffers(company.id, company);
  const location = [company.location_city, company.location_voivodeship]
    .filter(Boolean)
    .join(", ");
  const industries =
    company.industries && company.industries.length > 0
      ? company.industries
      : company.industry
        ? [company.industry]
        : [];

  return (
    <>
      <Navbar />
      <main className="bg-white">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3d26] via-[#1a5f3c] to-[#2d8a5e] px-6 pb-16 pt-36 text-white md:pb-20">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_20%_50%,white_2px,transparent_2px),radial-gradient(circle_at_80%_20%,white_1px,transparent_1px),radial-gradient(circle_at_40%_80%,white_1.5px,transparent_1.5px)] [background-size:60px_60px,40px_40px,80px_80px]" />

          <div className="relative z-10 mx-auto max-w-[1400px]">
            <Link
              href="/oferty"
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80 no-underline transition hover:text-white"
            >
              <i className="fas fa-arrow-left text-xs"></i>
              Wróć do ofert
            </Link>

            <div className="grid min-w-0 gap-8 lg:grid-cols-[auto_1fr] lg:items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[24px] bg-white text-3xl font-black text-[#1a5f3c] shadow-2xl">
                {getInitials(company.name)}
              </div>

              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap gap-3">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                      company.is_verified
                        ? "bg-emerald-500 text-white"
                        : "bg-white/15 text-white"
                    }`}
                  >
                    <i className={company.is_verified ? "fas fa-check-circle" : "fas fa-clock"}></i>
                    {company.is_verified
                      ? "Firma zweryfikowana"
                      : "Firma oczekuje na weryfikację"}
                  </span>
                  {company.industry ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                      <i className="fas fa-industry text-[#fbbf24]"></i>
                      {company.industry}
                    </span>
                  ) : null}
                </div>

                <h1 className="break-words text-3xl font-black leading-tight tracking-[-1px] md:text-5xl">
                  {company.name}
                </h1>
                <p className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-white/85">
                  {location ? (
                    <span className="inline-flex items-center gap-2">
                      <i className="fas fa-map-marker-alt text-[#fbbf24]"></i>
                      {location}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-2">
                    <i className="fas fa-list-check text-[#fbbf24]"></i>
                    {activeOffers.length} aktywnych ofert
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1400px] min-w-0 gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="min-w-0 space-y-6">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
                Dane firmy
              </h2>
              <div className="space-y-4 text-sm text-slate-600">
                <p className="flex items-start gap-3">
                  <i className="fas fa-location-dot mt-1 text-[#1a5f3c]"></i>
                  <span>{location || "Lokalizacja nie została podana"}</span>
                </p>
                {company.website_url ? (
                  <a
                    href={company.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-start gap-3 font-bold text-[#1a5f3c]"
                  >
                    <i className="fas fa-globe mt-1"></i>
                    <span className="break-words">Strona WWW firmy</span>
                  </a>
                ) : null}
                {company.presentation_file_name ? (
                  <p className="flex min-w-0 items-start gap-3">
                    <i className="fas fa-file-powerpoint mt-1 text-[#1a5f3c]"></i>
                    <span className="break-words">
                      Prezentacja firmy: {company.presentation_file_name}
                    </span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
                Branże i usługi
              </h2>
              <div className="mb-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Branże
                </p>
                <div className="flex flex-wrap gap-2">
                  {industries.length > 0 ? (
                    industries.map((industry) => (
                      <span
                        key={industry}
                        className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700"
                      >
                        {industry}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Brak danych.</span>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Usługi
                </p>
                <div className="flex flex-wrap gap-2">
                  {company.service_types && company.service_types.length > 0 ? (
                    company.service_types.map((serviceType) => (
                      <span
                        key={serviceType}
                        className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
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
          </aside>

          <div className="min-w-0 space-y-8">
            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-4 text-2xl font-extrabold text-slate-900">
                Opis firmy
              </h2>
              <p className="whitespace-pre-line text-base leading-8 text-slate-600">
                {company.description || "Firma nie dodała jeszcze opisu."}
              </p>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                    Aktywne oferty firmy
                  </p>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Dostępne moce i usługi
                  </h2>
                </div>
                <Link href="/oferty" className="btn btn-outline">
                  Zobacz wszystkie oferty
                </Link>
              </div>

              {activeOffers.length > 0 ? (
                <div className="grid min-w-0 gap-6 xl:grid-cols-2">
                  {activeOffers.map((offer) => (
                    <div key={offer.id} className="min-w-0">
                      <PublicOfferCard offer={offer} />
                      {offer.slug ? (
                        <Link
                          href={`/zapytanie-ofertowe?oferta=${offer.slug}`}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-4 py-3 text-sm font-bold text-[#1a5f3c] transition hover:bg-[#1a5f3c] hover:text-white"
                        >
                          Zapytaj o ofertę
                          <i className="fas fa-arrow-right text-xs"></i>
                        </Link>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Ta firma nie ma jeszcze aktywnych ofert.
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

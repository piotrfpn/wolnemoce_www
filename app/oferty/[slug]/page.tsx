import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddOfferLinkClient from "@/components/AddOfferLinkClient";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PublicOfferCard, { type PublicOffer } from "@/components/PublicOfferCard";
import RfqInlineFormClient from "@/components/RfqInlineFormClient";
import { getOfferImageByIndustry } from "@/lib/offerImages";
import { createClient } from "@/lib/supabase/server";

type OfferDetailsPageProps = {
  params: {
    slug: string;
  };
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

  const trimmed = description.slice(0, maxLength - 1).trimEnd();
  return `${trimmed}...`;
}

async function getPublicOfferBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("offers")
    .select(
      "id, title, slug, branch, service_type, description, power_available, min_order, lead_time, status, created_at, companies!inner(name, slug, description, location_voivodeship, location_city, is_verified, website_url)"
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !data) {
    return null;
  }

  return data as unknown as PublicOffer;
}

async function getSimilarOffers(offer: PublicOffer) {
  const supabase = createClient();
  const sameBranchQuery = supabase
    .from("offers")
    .select(
      "id, title, slug, branch, service_type, description, power_available, min_order, lead_time, status, created_at, companies!inner(name, slug, description, location_voivodeship, location_city, is_verified, website_url)"
    )
    .eq("status", "active")
    .neq("id", offer.id)
    .limit(3);

  const { data: sameBranch } = offer.branch
    ? await sameBranchQuery.eq("branch", offer.branch)
    : await sameBranchQuery;

  const collected = (sameBranch ?? []) as unknown as PublicOffer[];

  if (collected.length >= 3) {
    return collected.slice(0, 3);
  }

  const { data: otherOffers } = await supabase
    .from("offers")
    .select(
      "id, title, slug, branch, service_type, description, power_available, min_order, lead_time, status, created_at, companies!inner(name, slug, description, location_voivodeship, location_city, is_verified, website_url)"
    )
    .eq("status", "active")
    .neq("id", offer.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const byId = new Map<string, PublicOffer>();
  [...collected, ...((otherOffers ?? []) as unknown as PublicOffer[])].forEach((item) => {
    byId.set(item.id, item);
  });

  return Array.from(byId.values()).slice(0, 3);
}

export async function generateMetadata({
  params,
}: OfferDetailsPageProps): Promise<Metadata> {
  const offer = await getPublicOfferBySlug(params.slug);

  if (!offer) {
    return {
      title: "Oferta nie znaleziona | WolneMoce.pl",
      description: "Oferta nie istnieje albo nie jest aktywna publicznie.",
    };
  }

  const companyName = offer.companies?.name ?? "Firma";
  const descriptionSource =
    offer.description ||
    `${offer.branch ?? "Oferta"} - ${offer.service_type ?? "wolne moce"}`;

  return {
    title: `${offer.title} | ${companyName} | WolneMoce.pl`,
    description: truncateDescription(descriptionSource),
  };
}

export default async function OfferDetailsPage({
  params,
}: OfferDetailsPageProps) {
  const offer = await getPublicOfferBySlug(params.slug);

  if (!offer) {
    notFound();
  }

  const similarOffers = await getSimilarOffers(offer);
  const company = offer.companies;
  const companyName = company?.name ?? "Firma";
  const location = [company?.location_city, company?.location_voivodeship]
    .filter(Boolean)
    .join(", ");
  const imageSrc = getOfferImageByIndustry(offer.branch);
  const imageAlt = `${offer.title ?? "Oferta WolneMoce.pl"} - ${
    offer.branch ?? "wolne moce"
  }`;

  const parameters = [
    ["Firma", companyName, "fas fa-building"],
    ["Lokalizacja", location || "Polska", "fas fa-location-dot"],
    ["Województwo", company?.location_voivodeship ?? "Do ustalenia", "fas fa-map"],
    ["Branża", offer.branch ?? "Do ustalenia", "fas fa-industry"],
    ["Rodzaj usługi", offer.service_type ?? "Do ustalenia", "fas fa-cogs"],
    ["Dostępna moc", offer.power_available ?? "Do ustalenia", "fas fa-chart-bar"],
    ["Termin realizacji", offer.lead_time ?? "Do ustalenia", "fas fa-clock"],
    ["Minimalne zamówienie", offer.min_order ?? "Do ustalenia", "fas fa-boxes-stacked"],
  ];

  return (
    <>
      <Navbar />

      <main className="bg-white">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3d26] via-[#1a5f3c] to-[#2d8a5e] px-6 pb-16 pt-36 text-white md:pb-20">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_20%_50%,white_2px,transparent_2px),radial-gradient(circle_at_80%_20%,white_1px,transparent_1px),radial-gradient(circle_at_40%_80%,white_1.5px,transparent_1.5px)] [background-size:60px_60px,40px_40px,80px_80px]" />

          <div className="relative z-10 mx-auto grid max-w-[1400px] min-w-0 gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="min-w-0">
              <Link
                href="/oferty"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80 no-underline transition hover:text-white"
              >
                <i className="fas fa-arrow-left text-xs"></i>
                Wróć do ofert
              </Link>

              <div className="mb-5 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                  <i className="fas fa-circle-check"></i>
                  Aktywna oferta
                </span>
                {company?.is_verified ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                    <i className="fas fa-check-circle text-[#fbbf24]"></i>
                    Zweryfikowana firma
                  </span>
                ) : null}
              </div>

              <h1 className="max-w-4xl break-words text-3xl font-black leading-tight tracking-[-1px] md:text-5xl">
                {offer.title}
              </h1>

              <div className="mt-6 flex flex-col gap-4 text-white/85 sm:flex-row sm:flex-wrap sm:items-center">
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <i className="fas fa-building text-[#fbbf24]"></i>
                  {company?.slug ? (
                    <Link href={`/firmy/${company.slug}`} className="hover:text-white">
                      {companyName}
                    </Link>
                  ) : (
                    companyName
                  )}
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <i className="fas fa-map-marker-alt text-[#fbbf24]"></i>
                  {location || "Polska"}
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <i className="fas fa-industry text-[#fbbf24]"></i>
                  {offer.branch ?? "Branża"}
                </span>
              </div>
            </div>

            <div className="min-w-0 overflow-hidden rounded-[24px] border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur">
              <img
                src={imageSrc}
                alt={imageAlt}
                className="h-[260px] w-full max-w-full rounded-[18px] object-cover md:h-[360px]"
              />
            </div>
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
                    Parametry oferty
                  </h2>
                  <p className="text-sm text-slate-500">
                    Najważniejsze informacje do wstępnej kwalifikacji.
                  </p>
                </div>
              </div>

              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                {parameters.map(([label, value, icon]) => (
                  <div
                    key={label}
                    className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
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
                Opis możliwości produkcyjnych
              </h2>
              <p className="whitespace-pre-line text-base leading-8 text-slate-600">
                {offer.description}
              </p>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
                Certyfikaty i weryfikacja
              </h2>
              <div className="flex flex-wrap gap-3">
                {company?.is_verified ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                    <i className="fas fa-check-circle"></i>
                    Firma zweryfikowana
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                    <i className="fas fa-clock text-[#1a5f3c]"></i>
                    Profil firmy
                  </span>
                )}
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
                O firmie
              </h2>
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1a5f3c] to-[#2d8a5e] text-xl font-black text-white shadow-sm">
                  {getInitials(companyName)}
                </div>
                <div className="min-w-0">
                  {company?.slug ? (
                    <Link
                      href={`/firmy/${company.slug}`}
                      className="break-words text-xl font-extrabold text-slate-900 transition hover:text-[#1a5f3c]"
                    >
                      {companyName}
                    </Link>
                  ) : (
                    <h3 className="break-words text-xl font-extrabold text-slate-900">
                      {companyName}
                    </h3>
                  )}
                  <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-500">
                    {company?.description ||
                      `Firma prezentuje dostępne moce w kategorii ${offer.branch ?? "B2B"} i obsługuje zapytania B2B przez WolneMoce.pl.`}
                  </p>
                  {company?.website_url ? (
                    <a
                      href={company.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c]"
                    >
                      <i className="fas fa-globe"></i>
                      Strona WWW firmy
                    </a>
                  ) : null}
                </div>
              </div>
            </section>
          </div>

          <aside className="min-w-0">
            <div className="sticky top-24 rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl">
              <RfqInlineFormClient
                offerId={offer.id}
                offerSlug={offer.slug}
                offerTitle={offer.title}
                companyName={companyName}
              />
            </div>
          </aside>
        </section>

        <section className="bg-slate-50 px-6 py-16">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="section-label">Podobne oferty</div>
                <h2 className="section-title">Sprawdź też inne moce</h2>
              </div>
              <Link href="/oferty" className="btn btn-outline">
                Wszystkie oferty
              </Link>
            </div>

            {similarOffers.length > 0 ? (
              <div className="grid min-w-0 gap-6 lg:grid-cols-3">
                {similarOffers.map((similarOffer) => (
                  <PublicOfferCard key={similarOffer.id} offer={similarOffer} />
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                Brak podobnych aktywnych ofert.
              </div>
            )}
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1400px] rounded-[24px] bg-gradient-to-br from-[#0d3d26] to-[#1a5f3c] p-8 text-center text-white md:p-12">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              Masz podobne wolne moce?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/80">
              Dodaj ofertę w panelu firmy i wyślij ją do zatwierdzenia.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <AddOfferLinkClient className="btn btn-accent">
                Dodaj ofertę
              </AddOfferLinkClient>
              <Link href="/kontakt" className="btn btn-outline bg-white text-[#1a5f3c]">
                Kontakt
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

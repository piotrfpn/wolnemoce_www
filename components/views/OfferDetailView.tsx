import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddOfferLinkClient from "@/components/AddOfferLinkClient";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PublicOfferCard, { type PublicOffer } from "@/components/PublicOfferCard";
import RfqInlineFormClient from "@/components/RfqInlineFormClient";
import VerifiedCompanyBadge from "@/components/VerifiedCompanyBadge";
import { getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getOfferImageByIndustry, getPublicOfferImageUrl } from "@/lib/offerImages";
import { getInitialRfqBuyerData } from "@/lib/rfqBuyerData";
import { createClient } from "@/lib/supabase/server";

type OfferDetailViewProps = {
  slug: string;
  locale: Locale;
};

type OfferImage = {
  id: string;
  path: string | null;
  alt: string | null;
  sort_order: number | null;
  created_at: string | null;
};

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
      "id, title, slug, branch, service_type, description, power_available, min_order, lead_time, status, is_featured, featured_until, featured_priority, created_at, companies!inner(name, slug, description, location_voivodeship, location_city, is_verified, website_url), offer_images(id, path, alt, sort_order)"
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
      "id, title, slug, branch, service_type, description, power_available, min_order, lead_time, status, is_featured, featured_until, featured_priority, created_at, companies!inner(name, slug, description, location_voivodeship, location_city, is_verified, website_url), offer_images(id, path, alt, sort_order)"
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
      "id, title, slug, branch, service_type, description, power_available, min_order, lead_time, status, is_featured, featured_until, featured_priority, created_at, companies!inner(name, slug, description, location_voivodeship, location_city, is_verified, website_url), offer_images(id, path, alt, sort_order)"
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

async function getPublicOfferImages(offerId: string): Promise<OfferImage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("offer_images")
    .select("id, path, alt, sort_order, created_at")
    .eq("offer_id", offerId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Offer images query failed", error);
    return [];
  }

  return (data ?? []) as OfferImage[];
}

export async function generateOfferDetailMetadata({
  slug,
  locale,
}: OfferDetailViewProps): Promise<Metadata> {
  const t = getDictionary(locale).offerDetail;
  const offer = await getPublicOfferBySlug(slug);

  if (!offer) {
    return {
      title: t.notFoundTitle,
      description: t.notFoundDescription,
      alternates: {
        canonical: `/oferty/${slug}`,
      },
    };
  }

  const companyName = offer.companies?.name ?? t.companyFallback;
  const descriptionSource =
    offer.description ||
    `${offer.branch ?? t.offerFallback} - ${offer.service_type ?? t.capacityFallback}`;

  return {
    title: `${offer.title} | ${companyName} | WolneMoce.pl`,
    description: truncateDescription(descriptionSource),
    alternates: {
      canonical: `/oferty/${slug}`,
    },
  };
}

export default async function OfferDetailView({
  slug,
  locale,
}: OfferDetailViewProps) {
  const t = getDictionary(locale).offerDetail;
  const offer = await getPublicOfferBySlug(slug);

  if (!offer) {
    notFound();
  }

  const [similarOffers, offerImages, initialBuyerData] = await Promise.all([
    getSimilarOffers(offer),
    getPublicOfferImages(offer.id),
    getInitialRfqBuyerData(),
  ]);
  const company = offer.companies;
  const companyName = company?.name ?? t.companyFallback;
  const location = [company?.location_city, company?.location_voivodeship]
    .filter(Boolean)
    .join(", ");
  const mainImage = offerImages[0];
  const imageSrc =
    getPublicOfferImageUrl(mainImage?.path) ?? getOfferImageByIndustry(offer.branch);
  const imageAlt =
    mainImage?.alt ||
    `${offer.title ?? t.imageAltFallback} - ${offer.branch ?? t.capacityFallback}`;

  const parameters = [
    [t.company, companyName, "fas fa-building"],
    [t.location, location || t.countryFallback, "fas fa-location-dot"],
    [t.voivodeship, company?.location_voivodeship ?? t.toBeAgreed, "fas fa-map"],
    [t.industry, offer.branch ?? t.toBeAgreed, "fas fa-industry"],
    [t.serviceType, offer.service_type ?? t.toBeAgreed, "fas fa-cogs"],
    [t.capacity, offer.power_available ?? t.toBeAgreed, "fas fa-chart-bar"],
    [t.leadTime, offer.lead_time ?? t.toBeAgreed, "fas fa-clock"],
    [t.minimumOrder, offer.min_order ?? t.toBeAgreed, "fas fa-boxes-stacked"],
  ];

  return (
    <>
      <Navbar locale={locale} />

      <main className="bg-white">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3d26] via-[#1a5f3c] to-[#2d8a5e] px-6 pb-16 pt-36 text-white md:pb-20">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_20%_50%,white_2px,transparent_2px),radial-gradient(circle_at_80%_20%,white_1px,transparent_1px),radial-gradient(circle_at_40%_80%,white_1.5px,transparent_1.5px)] [background-size:60px_60px,40px_40px,80px_80px]" />

          <div className="relative z-10 mx-auto grid max-w-[1400px] min-w-0 gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="min-w-0">
              <Link
                href={getLocalizedPath("/oferty", locale)}
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80 no-underline transition hover:text-white"
              >
                <i className="fas fa-arrow-left text-xs"></i>
                {t.backToOffers}
              </Link>

              <div className="mb-5 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                  <i className="fas fa-circle-check"></i>
                  {t.activeOffer}
                </span>
                <VerifiedCompanyBadge
                  isVerified={company?.is_verified}
                  className="bg-white/15 !text-white !px-4 !py-2 uppercase tracking-wide border border-transparent hover:border-white/20 transition-colors"
                />
              </div>

              <h1 className="max-w-4xl break-words text-3xl font-black leading-tight tracking-[-1px] md:text-5xl">
                {offer.title}
              </h1>

              <div className="mt-6 flex flex-col gap-4 text-white/85 sm:flex-row sm:flex-wrap sm:items-center">
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <i className="fas fa-building text-[#fbbf24]"></i>
                  {company?.slug ? (
                    <Link
                      href={getLocalizedPath(`/firmy/${company.slug}`, locale)}
                      className="hover:text-white"
                    >
                      {companyName}
                    </Link>
                  ) : (
                    companyName
                  )}
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <i className="fas fa-map-marker-alt text-[#fbbf24]"></i>
                  {location || t.countryFallback}
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <i className="fas fa-industry text-[#fbbf24]"></i>
                  {offer.branch ?? t.industry}
                </span>
              </div>
            </div>

            <div className="min-w-0 overflow-hidden rounded-[24px] border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur">
              <img
                src={imageSrc}
                alt={imageAlt}
                loading="lazy"
                decoding="async"
                className="h-[260px] w-full max-w-full rounded-[18px] object-cover md:h-[360px]"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1400px] min-w-0 gap-8 px-6 py-16 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0 space-y-8">
            <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
              <div className="overflow-hidden rounded-[20px] bg-slate-100">
                <div className="aspect-video">
                  <img
                    src={imageSrc}
                    alt={imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {offerImages.length > 1 ? (
                <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {offerImages.slice(1).map((image) => {
                    const galleryImageSrc = getPublicOfferImageUrl(image.path);

                    if (!galleryImageSrc) {
                      return null;
                    }

                    return (
                      <div
                        key={image.id}
                        className="min-w-0 overflow-hidden rounded-2xl bg-slate-100"
                      >
                        <div className="aspect-video">
                          <img
                            src={galleryImageSrc}
                            alt={image.alt || offer.title || t.galleryImageAltFallback}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#1a5f3c]">
                  <i className="fas fa-list-check"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    {t.parametersTitle}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {t.parametersDescription}
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
                {t.descriptionTitle}
              </h2>
              <p className="whitespace-pre-line text-base leading-8 text-slate-600">
                {offer.description}
              </p>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
                {t.certificatesTitle}
              </h2>
              <div className="flex flex-wrap gap-3">
                <VerifiedCompanyBadge
                  isVerified={company?.is_verified}
                  showUnverified={true}
                  className="!px-4 !py-2 !text-sm"
                />
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
                {t.aboutCompany}
              </h2>
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1a5f3c] to-[#2d8a5e] text-xl font-black text-white shadow-sm">
                  {getInitials(companyName)}
                </div>
                <div className="min-w-0">
                  {company?.slug ? (
                    <Link
                      href={getLocalizedPath(`/firmy/${company.slug}`, locale)}
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
                    {company?.description || t.companyDescriptionFallback}
                  </p>
                  {company?.website_url ? (
                    <a
                      href={company.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c]"
                    >
                      <i className="fas fa-globe"></i>
                      {t.companyWebsite}
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
                initialBuyerData={initialBuyerData}
              />
            </div>
          </aside>
        </section>

        <section className="bg-slate-50 px-6 py-16">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="section-label">{t.similarLabel}</div>
                <h2 className="section-title">{t.similarTitle}</h2>
              </div>
              <Link href={getLocalizedPath("/oferty", locale)} className="btn btn-outline">
                {t.allOffers}
              </Link>
            </div>

            {similarOffers.length > 0 ? (
              <div className="grid min-w-0 gap-6 lg:grid-cols-3">
                {similarOffers.map((similarOffer) => (
                  <PublicOfferCard
                    key={similarOffer.id}
                    offer={similarOffer}
                    locale={locale}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                {t.noSimilarOffers}
              </div>
            )}
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1400px] rounded-[24px] bg-gradient-to-br from-[#0d3d26] to-[#1a5f3c] p-8 text-center text-white md:p-12">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              {t.ctaTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/80">
              {t.ctaDescription}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <AddOfferLinkClient locale={locale} className="btn btn-accent">
                {t.addOffer}
              </AddOfferLinkClient>
              <Link
                href={getLocalizedPath("/kontakt", locale)}
                className="btn btn-outline bg-white text-[#1a5f3c]"
              >
                {t.contact}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </>
  );
}

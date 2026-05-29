import Link from "next/link";
import { getOfferImageByIndustry, getPublicOfferImageUrl } from "@/lib/offerImages";
import VerifiedCompanyBadge from "@/components/VerifiedCompanyBadge";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";

export type PublicOfferCompany = {
  name: string | null;
  slug?: string | null;
  description?: string | null;
  location_voivodeship: string | null;
  location_city: string | null;
  is_verified: boolean | null;
  website_url?: string | null;
};

export type PublicOffer = {
  id: string;
  title: string | null;
  slug: string | null;
  branch: string | null;
  service_type: string | null;
  description: string | null;
  power_available: string | null;
  min_order: string | null;
  lead_time: string | null;
  status: string | null;
  is_featured?: boolean | null;
  featured_until?: string | null;
  featured_priority?: number | null;
  created_at: string | null;
  companies: PublicOfferCompany | null;
  offer_images?: {
    id: string;
    path: string | null;
    alt: string | null;
    sort_order: number | null;
  }[];
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

function isActiveFeatured(offer: PublicOffer) {
  if (!offer.is_featured) {
    return false;
  }

  return !offer.featured_until || new Date(offer.featured_until).getTime() > Date.now();
}

export default function PublicOfferCard({
  offer,
  locale = defaultLocale,
}: {
  offer: PublicOffer;
  locale?: Locale;
}) {
  const labels = getDictionary(locale).offerCard;
  const company = offer.companies;
  const companyName = company?.name ?? labels.companyFallback;
  const location = [company?.location_city, company?.location_voivodeship]
    .filter(Boolean)
    .join(", ");
  const mainImage = [...(offer.offer_images ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  )[0];
  const imageSrc =
    getPublicOfferImageUrl(mainImage?.path) ?? getOfferImageByIndustry(offer.branch);
  const imageAlt =
    mainImage?.alt ||
    `${offer.title ?? labels.offerFallback} - ${offer.branch ?? labels.capacityFallback}`;
  const featured = isActiveFeatured(offer);

  return (
    <article className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl">
      {company?.is_verified ? (
        <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-2">
          {featured ? (
            <span className="flex items-center gap-1 rounded-full bg-[#fbbf24] px-3 py-1.5 text-[11px] font-bold text-slate-900 shadow-sm">
              <i className="fas fa-star"></i>
              {labels.featured}
            </span>
          ) : null}
          <VerifiedCompanyBadge
            isVerified={company.is_verified}
            className="!bg-white/95 !text-[11px] !py-1 backdrop-blur"
            verifiedLabel={labels.verifiedCompanyLabel}
            unverifiedLabel={labels.publicProfileLabel}
            verifiedTitle={labels.verifiedTitle}
            unverifiedTitle={labels.publicProfileTitle}
          />
        </div>
      ) : featured ? (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-[#fbbf24] px-3 py-1.5 text-[11px] font-bold text-slate-900 shadow-sm">
          <i className="fas fa-star"></i>
          {labels.featured}
        </div>
      ) : null}

      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          className="h-full w-full max-w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 text-white">
          <span className="flex items-center gap-2 text-xs font-medium">
            <i className="fas fa-map-marker-alt"></i>
            {location || labels.countryFallback}
          </span>
        </div>
      </div>

      <div className="min-w-0 p-5">
        <div className="mb-3 flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a5f3c] to-[#2d8a5e] text-sm font-bold text-white shadow-sm">
            {getInitials(companyName)}
          </div>
          <div className="min-w-0">
            {company?.slug ? (
              <Link
                href={getLocalizedPath(`/firmy/${company.slug}`, locale)}
                className="block truncate text-sm font-bold text-slate-900 transition hover:text-[#1a5f3c]"
              >
                {companyName}
              </Link>
            ) : (
              <h3 className="truncate text-sm font-bold text-slate-900">
                {companyName}
              </h3>
            )}
            <p className="truncate text-[11px] text-slate-400">
              {offer.branch ?? labels.industryFallback} · {company?.is_verified ? labels.verified : labels.publicProfile}
            </p>
          </div>
        </div>

        <h2 className="mb-2 break-words text-[17px] font-bold leading-snug text-slate-900">
          {offer.title}
        </h2>

        <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-500">
          {offer.description}
        </p>

        <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-100 pb-5">
          {offer.branch ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <i className="fas fa-industry text-[#1a5f3c]"></i>
              {offer.branch}
            </span>
          ) : null}
          {offer.service_type ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <i className="fas fa-cogs text-[#1a5f3c]"></i>
              {offer.service_type}
            </span>
          ) : null}
          {offer.power_available ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <i className="fas fa-chart-bar text-[#1a5f3c]"></i>
              {offer.power_available}
            </span>
          ) : null}
          {offer.lead_time ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <i className="fas fa-clock text-[#1a5f3c]"></i>
              {offer.lead_time}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            <i className="fas fa-circle-check"></i>
            {labels.active}
          </span>

          {offer.slug ? (
            <Link
              href={getLocalizedPath(`/oferty/${offer.slug}`, locale)}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] transition hover:text-[#0d3d26]"
            >
              {labels.details}
              <i className="fas fa-arrow-right text-xs"></i>
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

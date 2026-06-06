import Link from "next/link";
import { OFFER_IMAGE_PLACEHOLDER, getPublicOfferImageUrl } from "@/lib/offerImages";
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
  return Boolean(
    offer.is_featured &&
    offer.featured_until &&
    new Date(offer.featured_until).getTime() > Date.now()
  );
}

export default function PublicOfferCard({
  offer,
  locale = defaultLocale,
  variant = "standard",
}: {
  offer: PublicOffer;
  locale?: Locale;
  variant?: "standard" | "catalog";
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
  const uploadedImageSrc = getPublicOfferImageUrl(mainImage?.path);
  const hasUploadedImage = Boolean(uploadedImageSrc);
  const imageSrc = uploadedImageSrc ?? OFFER_IMAGE_PLACEHOLDER;
  const imageAlt = hasUploadedImage
    ? mainImage?.alt ||
      `${offer.title ?? labels.offerFallback} - ${offer.branch ?? labels.capacityFallback}`
    : labels.imagePlaceholderAlt;
  const featured = isActiveFeatured(offer);
  const isCatalog = variant === "catalog";
  const offerHref = offer.slug ? getLocalizedPath(`/oferty/${offer.slug}`, locale) : "";
  const rfqHref = offer.slug
    ? getLocalizedPath(`/zapytanie-ofertowe?oferta=${offer.slug}`, locale)
    : "";

  return (
    <article
      className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl ${
        isCatalog ? "min-h-[520px]" : ""
      }`}
    >
      {featured ? (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-[#fbbf24] px-3 py-1.5 text-[11px] font-bold text-slate-900 shadow-sm">
          <i className="fas fa-star"></i>
          {labels.featured}
        </div>
      ) : null}

      <div className="relative aspect-video overflow-hidden bg-slate-100 flex items-center justify-center">
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          className={`h-full w-full max-w-full transition duration-500 ${
            hasUploadedImage
              ? "object-cover group-hover:scale-105"
              : "bg-slate-50 object-contain p-4"
          }`}
        />
        {location ? (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 text-white">
            <span className="flex items-center gap-2 text-xs font-medium">
              <i className="fas fa-map-marker-alt"></i>
              <span className="truncate">{location}</span>
            </span>
          </div>
        ) : null}
      </div>

      <div className="min-w-0 p-5 flex flex-col flex-grow">
        {companyName && companyName !== "Firma" ? (
          <div className="mb-3 flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a5f3c] to-[#2d8a5e] text-sm font-bold text-white shadow-sm">
              {getInitials(companyName)}
            </div>
            <div className="min-w-0">
              {company?.slug ? (
                <Link
                  href={getLocalizedPath(`/firmy/${company.slug}`, locale)}
                  className="block truncate text-sm font-bold text-slate-900 transition hover:text-[#1a5f3c]"
                  title={companyName}
                >
                  {companyName}
                </Link>
              ) : (
                <h3 className="truncate text-sm font-bold text-slate-900" title={companyName}>
                  {companyName}
                </h3>
              )}
              {company?.is_verified ? (
                <div className="mt-1">
                  <VerifiedCompanyBadge
                    isVerified={company.is_verified}
                    className="!px-2 !py-0.5 !text-[10px] w-fit"
                    verifiedLabel={labels.verifiedCompanyLabel}
                    unverifiedLabel={labels.publicProfileLabel}
                    verifiedTitle={labels.verifiedTitle}
                    unverifiedTitle={labels.publicProfileTitle}
                  />
                </div>
              ) : (
                <p className="truncate text-[11px] text-slate-400 mt-0.5">
                  {labels.publicProfile}
                </p>
              )}
            </div>
          </div>
        ) : null}

        <h2
          className={`mb-2 line-clamp-2 break-words font-bold leading-snug text-slate-900 ${
            isCatalog ? "text-[19px]" : "text-[17px]"
          }`}
          title={offer.title ?? ""}
        >
          {offer.title || labels.offerFallback}
        </h2>

        {offer.description ? (
          <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-500">
            {offer.description}
          </p>
        ) : isCatalog ? (
          <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-500">
            {labels.capacityFallback}
          </p>
        ) : null}

        <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-100 pb-5">
          {isCatalog && location ? (
            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <i className="fas fa-map-marker-alt opacity-80"></i>
              <span className="truncate">{location}</span>
            </span>
          ) : null}
          {offer.branch ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <i className="fas fa-industry text-[#1a5f3c] opacity-80"></i>
              {offer.branch}
            </span>
          ) : null}
          {offer.service_type ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <i className="fas fa-cogs text-[#1a5f3c] opacity-80"></i>
              {offer.service_type}
            </span>
          ) : null}
          {offer.power_available ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <i className="fas fa-chart-bar text-[#1a5f3c] opacity-80"></i>
              {offer.power_available}
            </span>
          ) : null}
          {offer.lead_time ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <i className="fas fa-clock text-[#1a5f3c] opacity-80"></i>
              {offer.lead_time}
            </span>
          ) : null}
        </div>

        {isCatalog ? (
          <div className="mb-4 grid gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 sm:grid-cols-2">
            <span className="flex min-w-0 items-center gap-2">
              <i className="fas fa-building text-[#1a5f3c]"></i>
              <span className="truncate">{companyName}</span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <i className="fas fa-shield-alt text-[#1a5f3c]"></i>
              <span className="truncate">
                {company?.is_verified ? labels.verifiedCompanyLabel : labels.publicProfileLabel}
              </span>
            </span>
          </div>
        ) : null}

        <div className="mt-auto flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          {offer.slug ? (
            <div className={`flex w-full gap-2 ${isCatalog ? "flex-col sm:flex-row" : "items-center"}`}>
              <Link
                href={offerHref}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 bg-emerald-700 hover:bg-emerald-800 ${
                  isCatalog ? "py-3.5 shadow-sm" : "py-2.5"
                }`}
              >
                {labels.viewOffer}
                <i className="fas fa-arrow-right text-xs opacity-80"></i>
              </Link>
              <Link
                href={rfqHref}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 ${
                  isCatalog ? "py-3.5" : "py-2.5"
                }`}
              >
                <i className="fas fa-paper-plane text-xs opacity-75"></i>
                {labels.askAboutOffer}
              </Link>
            </div>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 w-fit">
              <i className="fas fa-circle-check"></i>
              {labels.active}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

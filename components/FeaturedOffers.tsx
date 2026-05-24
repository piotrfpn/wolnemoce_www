import Link from "next/link";
import AddOfferLinkClient from "@/components/AddOfferLinkClient";
import PublicOfferCard, { type PublicOffer } from "@/components/PublicOfferCard";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createClient } from "@/lib/supabase/server";

function isActiveFeatured(offer: PublicOffer) {
  if (!offer.is_featured) {
    return false;
  }

  return !offer.featured_until || new Date(offer.featured_until).getTime() > Date.now();
}

async function getHomepageOffers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("offers")
    .select(
      "id, title, slug, branch, service_type, description, power_available, min_order, lead_time, status, is_featured, featured_until, featured_priority, created_at, companies!inner(name, slug, description, location_voivodeship, location_city, is_verified, website_url), offer_images(id, path, alt, sort_order)"
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Homepage offers query failed", error);
    return { offers: [], mode: "empty" as const };
  }

  const activeOffers = (data ?? []) as unknown as PublicOffer[];
  const featuredOffers = activeOffers
    .filter(isActiveFeatured)
    .sort((first, second) => {
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

  if (featuredOffers.length > 0) {
    return { offers: featuredOffers.slice(0, 3), mode: "featured" as const };
  }

  if (activeOffers.length > 0) {
    return { offers: activeOffers.slice(0, 3), mode: "latest" as const };
  }

  return { offers: [], mode: "empty" as const };
}

export default async function FeaturedOffers({
  locale = defaultLocale,
}: {
  locale?: Locale;
}) {
  const { offers, mode } = await getHomepageOffers();
  const isLatestFallback = mode === "latest";
  const t = getDictionary(locale).offers;
  const offersHref = getLocalizedPath("/oferty", locale);

  return (
    <section
      className="section"
      id="oferty"
      style={{
        background: "var(--bg-light)",
        margin: 0,
        maxWidth: "100%",
        padding: "80px 24px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div className="section-header fade-in visible">
          <div className="section-label">{t.label}</div>
          <h2 className="section-title">
            {isLatestFallback ? t.latestTitle : t.featuredTitle}
          </h2>
          <p className="section-desc">
            {isLatestFallback ? t.latestDescription : t.featuredDescription}
          </p>
        </div>

        {offers.length > 0 ? (
          <div className="grid min-w-0 gap-6 lg:grid-cols-3">
            {offers.map((offer) => (
              <PublicOfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-3xl rounded-[24px] border border-dashed border-emerald-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#1a5f3c]">
              <i className="fas fa-industry text-xl"></i>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {t.emptyTitle}
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              {t.emptyDescription}
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <AddOfferLinkClient className="btn btn-primary">
                {t.addOffer}
              </AddOfferLinkClient>
              <Link href={offersHref} className="btn btn-outline">
                {t.goToCatalog}
              </Link>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <Link
            href={offersHref}
            className="btn btn-outline"
            style={{ padding: "14px 40px" }}
          >
            {t.viewAll} <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getPublicOfferImageUrl } from "@/lib/offerImages";
import { createClient } from "@/lib/supabase/server";
import AdminOfferFormClient from "../AdminOfferFormClient";

type AdminOfferDetailsPageProps = {
  params: {
    id: string;
  };
};

type AdminOfferDetails = {
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
  is_featured: boolean | null;
  featured_until: string | null;
  featured_priority: number | null;
  created_at: string | null;
  companies: {
    id: string;
    name: string | null;
    slug: string | null;
    plan: string | null;
    location_city: string | null;
    location_voivodeship: string | null;
    is_verified: boolean | null;
    website_url: string | null;
  } | null;
  offer_images?: {
    id: string;
    path: string | null;
    alt: string | null;
    sort_order: number | null;
    created_at: string | null;
  }[];
};

export const metadata: Metadata = {
  title: "Zarządzanie ofertą | Panel administratora",
  description: "Szczegóły i moderacja oferty w panelu administratora.",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Brak daty";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function isActiveFeatured(offer: AdminOfferDetails) {
  if (!offer.is_featured) {
    return false;
  }

  return !offer.featured_until || new Date(offer.featured_until).getTime() > Date.now();
}

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logowanie");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/panel");
  }

  return supabase;
}

export default async function AdminOfferDetailsPage({
  params,
}: AdminOfferDetailsPageProps) {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("offers")
    .select(
      "id, title, slug, branch, service_type, description, power_available, min_order, lead_time, status, is_featured, featured_until, featured_priority, created_at, companies!inner(id, name, slug, plan, location_city, location_voivodeship, is_verified, website_url), offer_images(id, path, alt, sort_order, created_at)"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const offer = data as unknown as AdminOfferDetails;
  const company = offer.companies;
  const { data: countedOffersData } = company?.id
    ? await supabase
        .from("offers")
        .select("id, title, status")
        .eq("company_id", company.id)
        .in("status", ["active", "pending"])
        .order("created_at", { ascending: false })
    : { data: [] };
  const countedOffers = (countedOffersData ?? []) as {
    id: string;
    title: string | null;
    status: string | null;
  }[];
  const isFreePlan = company?.plan === "free";
  const freeLimitCount = countedOffers.length;
  const isFreeOverLimit = isFreePlan && freeLimitCount > 1;
  const location = [company?.location_city, company?.location_voivodeship]
    .filter(Boolean)
    .join(", ");
  const images = [...(offer.offer_images ?? [])].sort((first, second) => {
    const orderDiff = (first.sort_order ?? 0) - (second.sort_order ?? 0);

    if (orderDiff !== 0) {
      return orderDiff;
    }

    return (first.created_at ?? "").localeCompare(second.created_at ?? "");
  });
  const mainImage = images[0];
  const mainImageUrl = getPublicOfferImageUrl(mainImage?.path);
  const featured = isActiveFeatured(offer);

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[1400px] px-6 py-16">
          <div className="mb-8 flex min-w-0 flex-col gap-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between md:p-8">
            <div className="min-w-0">
              <Link
                href="/admin/oferty"
                className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline"
              >
                <i className="fas fa-arrow-left text-xs"></i>
                Wróć do listy ofert
              </Link>
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                Panel administratora
              </p>
              <h1 className="break-words text-3xl font-extrabold text-slate-900">
                {offer.title ?? "Oferta bez tytułu"}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {company?.name ?? "Firma bez nazwy"}
                {location ? ` · ${location}` : ""}
              </p>
            </div>
            {offer.slug && offer.status === "active" ? (
              <Link href={`/oferty/${offer.slug}`} className="btn btn-outline">
                Podgląd publiczny
              </Link>
            ) : null}
          </div>

          <div className="grid min-w-0 gap-8 lg:grid-cols-[1fr_420px]">
            <div className="min-w-0 space-y-8">
              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    Status: {offer.status ?? "pending"}
                  </span>
                  {featured ? (
                    <span className="rounded-full bg-[#fbbf24]/20 px-3 py-1 text-xs font-bold text-[#8a5a00]">
                      Aktywnie wyróżniona
                    </span>
                  ) : null}
                  {company?.is_verified ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      Firma zweryfikowana
                    </span>
                  ) : null}
                  {isFreeOverLimit ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      Przekroczony limit FREE: {freeLimitCount}/1
                    </span>
                  ) : null}
                </div>

                <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                  {[
                    ["Firma", company?.name ?? "Brak nazwy"],
                    ["Lokalizacja", location || "Polska"],
                    ["Branża", offer.branch ?? "Do ustalenia"],
                    ["Rodzaj usługi", offer.service_type ?? "Do ustalenia"],
                    ["Dostępna moc", offer.power_available ?? "Do ustalenia"],
                    ["Minimalne zamówienie", offer.min_order ?? "Do ustalenia"],
                    ["Termin realizacji", offer.lead_time ?? "Do ustalenia"],
                    ["Data dodania", formatDate(offer.created_at)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        {label}
                      </p>
                      <p className="mt-1 break-words text-sm font-bold text-slate-900">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section
                className={`rounded-[24px] border p-5 shadow-sm md:p-6 ${
                  isFreeOverLimit
                    ? "border-amber-200 bg-amber-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                      Limit ofert firmy
                    </p>
                    <h2 className="text-2xl font-extrabold text-slate-900">
                      {isFreePlan
                        ? `Plan FREE: ${freeLimitCount}/1 ofert aktywnych lub w moderacji`
                        : "Plan firmy bez limitu FREE"}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {isFreeOverLimit
                        ? "Legacy: firma ma więcej ofert niż aktualny limit FREE. Nie wykonujemy zmian automatycznie."
                        : "Do limitu liczą się tylko oferty active i pending."}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      isFreeOverLimit
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {company?.plan?.toUpperCase() ?? "FREE"}
                  </span>
                </div>

                {countedOffers.length > 0 ? (
                  <div className="grid min-w-0 gap-3">
                    {countedOffers.map((countedOffer) => (
                      <div
                        key={countedOffer.id}
                        className="flex min-w-0 flex-col gap-2 rounded-2xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="break-words text-sm font-bold text-slate-900">
                            {countedOffer.title ?? "Oferta bez tytułu"}
                          </p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status: {countedOffer.status ?? "pending"}
                          </p>
                        </div>
                        <Link
                          href={`/admin/oferty/${countedOffer.id}`}
                          className="inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline"
                        >
                          Otwórz
                          <i className="fas fa-arrow-right text-xs"></i>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl bg-white px-4 py-3 text-sm text-slate-500">
                    Firma nie ma ofert wliczanych do limitu FREE.
                  </p>
                )}
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <h2 className="mb-4 text-2xl font-extrabold text-slate-900">
                  Opis oferty
                </h2>
                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                  {offer.description || "Brak opisu."}
                </p>
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Zdjęcia oferty
                  </h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {images.length === 1 ? "1 zdjęcie" : `${images.length} zdjęć`}
                  </span>
                </div>

                {images.length > 0 && mainImageUrl ? (
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl bg-slate-100">
                      <div className="aspect-video">
                        <img
                          src={mainImageUrl}
                          alt={mainImage?.alt || offer.title || "Zdjęcie oferty"}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>

                    {images.length > 1 ? (
                      <div className="grid min-w-0 gap-3 sm:grid-cols-3">
                        {images.slice(1).map((image) => {
                          const imageUrl = getPublicOfferImageUrl(image.path);

                          if (!imageUrl) {
                            return null;
                          }

                          return (
                            <div
                              key={image.id}
                              className="min-w-0 overflow-hidden rounded-xl bg-slate-100"
                            >
                              <div className="aspect-video">
                                <img
                                  src={imageUrl}
                                  alt={image.alt || offer.title || "Zdjęcie oferty"}
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
                  </div>
                ) : (
                  <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    Brak zdjęć dodanych do oferty.
                  </p>
                )}
              </section>
            </div>

            <aside className="min-w-0">
              <div className="sticky top-24 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  Moderacja
                </p>
                <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
                  Status i wyróżnienie
                </h2>
                <AdminOfferFormClient offer={offer} />
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

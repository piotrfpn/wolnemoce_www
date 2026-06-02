import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { createClient } from "@/lib/supabase/server";
import AdminOffersFiltersClient from "./AdminOffersFiltersClient";

export const metadata: Metadata = {
  title: "Oferty | Panel administratora",
  description: "Administracyjne zarządzanie ofertami w WolneMoce.pl.",
};

type AdminOfferListItem = {
  id: string;
  title: string | null;
  slug: string | null;
  branch: string | null;
  service_type: string | null;
  status: string | null;
  is_featured: boolean | null;
  featured_until: string | null;
  featured_priority: number | null;
  created_at: string | null;
  companies: {
    id: string;
    name: string | null;
    plan: string | null;
    location_city: string | null;
    location_voivodeship: string | null;
    is_verified: boolean | null;
  } | null;
};

const statusLabels: Record<string, string> = {
  draft: "Szkic",
  pending: "Oczekuje",
  active: "Aktywna",
  rejected: "Odrzucona",
  archived: "Zarchiwizowana",
};

const statusClasses: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending: "bg-amber-50 text-amber-700",
  active: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  archived: "bg-slate-200 text-slate-700",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Brak daty";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function isActiveFeatured(offer: AdminOfferListItem) {
  return Boolean(
    offer.is_featured &&
    offer.featured_until &&
    new Date(offer.featured_until).getTime() > Date.now()
  );
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

export default async function AdminOffersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await requireAdmin();

  // URL Params parsing & sanitization
  const qRaw = typeof searchParams.q === "string" ? searchParams.q : "";
  const q = qRaw
    .trim()
    .replace(/[,%(){}[\]]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);

  const statusFilter =
    typeof searchParams.status === "string" ? searchParams.status : "all";
  const planFilter =
    typeof searchParams.plan === "string" ? searchParams.plan : "all";
  const verifiedFilter =
    typeof searchParams.verified === "string" ? searchParams.verified : "all";
  const featuredFilter =
    typeof searchParams.featured === "string" ? searchParams.featured : "all";
  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : "newest";

  const pageStr =
    typeof searchParams.page === "string" ? searchParams.page : "1";
  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const pageSize = 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Step 1: Text search fallback for companies
  let companyIdsFromSearch: string[] = [];
  if (q) {
    // Only search companies if there's a valid string left
    const { data: cData } = await supabase
      .from("companies")
      .select("id")
      .or(`name.ilike.%${q}%,location_city.ilike.%${q}%`)
      .limit(100);
    companyIdsFromSearch = cData?.map((c) => c.id) || [];
  }

  // Step 2: Build main query
  let query = supabase
    .from("offers")
    .select(
      "id, title, slug, branch, service_type, status, is_featured, featured_until, featured_priority, created_at, companies!inner(id, name, plan, location_city, location_voivodeship, is_verified)",
      { count: "exact" },
    );

  // Apply basic filters
  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  if (planFilter !== "all") {
    query = query.eq("companies.plan", planFilter);
  }

  if (verifiedFilter !== "all") {
    query = query.eq("companies.is_verified", verifiedFilter === "verified");
  }

  if (featuredFilter === "featured") {
    query = query
      .eq("is_featured", true)
      .not("featured_until", "is", null)
      .gt("featured_until", new Date().toISOString());
  } else if (featuredFilter === "not_featured") {
    query = query.or(
      `is_featured.is.null,is_featured.eq.false,and(is_featured.eq.true,featured_until.lt.${new Date().toISOString()}),and(is_featured.eq.true,featured_until.is.null)`,
    );
  }

  // Apply search filter
  if (q) {
    if (companyIdsFromSearch.length > 0) {
      const cIds = companyIdsFromSearch.join(",");
      query = query.or(
        `title.ilike.%${q}%,branch.ilike.%${q}%,service_type.ilike.%${q}%,company_id.in.(${cIds})`,
      );
    } else {
      query = query.or(
        `title.ilike.%${q}%,branch.ilike.%${q}%,service_type.ilike.%${q}%`,
      );
    }
  }

  // Apply sorting
  switch (sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "title_az":
      query = query.order("title", { ascending: true });
      break;
    case "status":
      query = query
        .order("status", { ascending: true })
        .order("created_at", { ascending: false });
      break;
    case "featured":
      query = query
        .order("featured_priority", { ascending: false, nullsFirst: false })
        .order("featured_until", { ascending: true, nullsFirst: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;
  const offers = (data ?? []) as unknown as AdminOfferListItem[];
  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Pagination URLs
  const createPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", qRaw);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (planFilter !== "all") params.set("plan", planFilter);
    if (verifiedFilter !== "all") params.set("verified", verifiedFilter);
    if (featuredFilter !== "all") params.set("featured", featuredFilter);
    if (sort !== "newest") params.set("sort", sort);
    params.set("page", targetPage.toString());
    return `/admin/oferty?${params.toString()}`;
  };

  return (
    <>
      <PanelNavbar />
      <main className="bg-slate-50 pt-[72px] min-h-screen">
        <section className="mx-auto max-w-[1400px] px-6 py-16">
          <div className="mb-8 flex min-w-0 flex-col gap-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between md:p-8">
            <div className="min-w-0">
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                Panel administratora
              </p>
              <h1 className="text-3xl font-extrabold text-slate-900">
                Zarządzanie ofertami
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                Przeglądaj oferty, zmieniaj status moderacji i ustawiaj ręczne
                wyróżnienia widoczne w publicznym katalogu.
              </p>
            </div>
            <Link href="/admin" className="btn btn-outline">
              Wróć do admina
            </Link>
          </div>

          <Suspense
            fallback={
              <div className="mb-8 h-[200px] rounded-[24px] border border-slate-200 bg-white shadow-sm" />
            }
          >
            <AdminOffersFiltersClient />
          </Suspense>

          {error ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Nie udało się pobrać ofert: {error.message}
            </div>
          ) : null}

          {offers.length > 0 ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-600">
                  Pokazano {from + 1}–{Math.min(to + 1, totalCount)} z{" "}
                  {totalCount} ofert
                </p>
              </div>
              <div className="grid min-w-0 gap-5">
                {offers.map((offer) => {
                  const company = offer.companies;
                  const location = [
                    company?.location_city,
                    company?.location_voivodeship,
                  ]
                    .filter(Boolean)
                    .join(", ");
                  const status = offer.status ?? "pending";
                  const featuredIndicator = isActiveFeatured(offer);

                  return (
                    <article
                      key={offer.id}
                      className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6"
                    >
                      <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="mb-3 flex flex-wrap gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                statusClasses[status] ?? statusClasses.pending
                              }`}
                            >
                              {statusLabels[status] ?? status}
                            </span>
                            {featuredIndicator ? (
                              <span className="rounded-full bg-[#fbbf24]/20 px-3 py-1 text-xs font-bold text-[#8a5a00]">
                                Wyróżniona
                              </span>
                            ) : offer.is_featured ? (
                              offer.featured_until ? (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                                  Wygasłe
                                </span>
                              ) : (
                                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                                  Błąd: brak daty
                                </span>
                              )
                            ) : null}
                            {company?.is_verified ? (
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                Firma zweryfikowana
                              </span>
                            ) : null}
                            {company?.plan ? (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">
                                {company.plan}
                              </span>
                            ) : null}
                          </div>

                          <h2 className="break-words text-xl font-extrabold text-slate-900">
                            {offer.title ?? "Oferta bez tytułu"}
                          </h2>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {company?.name ?? "Firma bez nazwy"}
                            {location ? ` · ${location}` : ""}
                          </p>
                          <p className="mt-2 text-sm text-slate-500">
                            {offer.branch ?? "Branża"} ·{" "}
                            {offer.service_type ?? "Rodzaj usługi"}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                          <Link
                            href={`/admin/oferty/${offer.id}`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-4 py-3 text-sm font-bold text-white no-underline transition hover:bg-[#0d3d26]"
                          >
                            Zarządzaj
                            <i className="fas fa-arrow-right text-xs"></i>
                          </Link>
                          {offer.slug && status === "active" ? (
                            <Link
                              href={`/oferty/${offer.slug}`}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 no-underline transition hover:border-[#1a5f3c] hover:text-[#1a5f3c]"
                            >
                              Podgląd publiczny
                            </Link>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Data dodania
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {formatDate(offer.created_at)}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Wyróżnienie do
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {offer.featured_until
                              ? formatDate(offer.featured_until)
                              : "Brak daty"}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Priorytet
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {offer.featured_priority ?? 0}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  {page > 1 ? (
                    <Link
                      href={createPageUrl(page - 1)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <i className="fas fa-chevron-left text-xs"></i>
                      Poprzednia
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-400 opacity-60"
                    >
                      <i className="fas fa-chevron-left text-xs"></i>
                      Poprzednia
                    </button>
                  )}

                  <span className="text-sm font-medium text-slate-600">
                    Strona {page} z {totalPages}
                  </span>

                  {page < totalPages ? (
                    <Link
                      href={createPageUrl(page + 1)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Następna
                      <i className="fas fa-chevron-right text-xs"></i>
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-400 opacity-60"
                    >
                      Następna
                      <i className="fas fa-chevron-right text-xs"></i>
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              <p className="mb-4">
                Brak ofert do wyświetlenia dla podanych kryteriów.
              </p>
              <Link
                href="/admin/oferty"
                className="inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Wyczyść filtry
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

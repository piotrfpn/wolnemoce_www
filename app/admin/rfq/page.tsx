import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Monitoring RFQ | Panel administratora",
  description: "Podstawowy monitoring zapytań ofertowych RFQ w panelu administratora WolneMoce.pl.",
};

export const dynamic = "force-dynamic";

type AdminRfqInquiry = {
  id: string;
  status: string | null;
  lead_status: string | null;
  created_at: string | null;
  recipient_read_at: string | null;
  branch: string | null;
  service_type: string | null;
  quantity_scope: string | null;
  expected_deadline: string | null;
  budget: string | null;
  companies: {
    id: string;
    name: string | null;
    slug: string | null;
    is_verified: boolean | null;
  } | null;
  offers: {
    id: string;
    title: string | null;
    slug: string | null;
    status: string | null;
    branch: string | null;
    service_type: string | null;
  } | null;
};

type CompanyReactionSummary = {
  companyId: string;
  companyName: string;
  companySlug: string | null;
  isVerified: boolean;
  total: number;
  unread: number;
  open: number;
  stale: number;
  newestAt: string | null;
};

type OfferRfqSummary = {
  offerId: string;
  offerTitle: string;
  offerSlug: string | null;
  offerStatus: string | null;
  companyName: string;
  total: number;
  unread: number;
  newestAt: string | null;
};

const leadStatusLabels: Record<string, string> = {
  new: "Nowe",
  in_progress: "W toku",
  answered_outside_portal: "Obsłużone poza portalem",
};

const leadStatusClasses: Record<string, string> = {
  new: "bg-red-50 text-red-700",
  in_progress: "bg-amber-50 text-amber-700",
  answered_outside_portal: "bg-emerald-50 text-emerald-700",
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

function isUnreadInquiry(inquiry: Pick<AdminRfqInquiry, "recipient_read_at" | "status">) {
  return !inquiry.recipient_read_at && inquiry.status !== "archived";
}

function isOpenLead(inquiry: Pick<AdminRfqInquiry, "lead_status" | "status">) {
  return (
    inquiry.status !== "archived" &&
    (inquiry.lead_status === "new" || inquiry.lead_status === "in_progress")
  );
}

function isStaleInquiry(inquiry: Pick<AdminRfqInquiry, "created_at" | "status" | "lead_status" | "recipient_read_at">) {
  if (!inquiry.created_at || inquiry.status === "archived") {
    return false;
  }

  const staleThreshold = Date.now() - 3 * 24 * 60 * 60 * 1000;
  return (
    new Date(inquiry.created_at).getTime() < staleThreshold &&
    (isUnreadInquiry(inquiry) || isOpenLead(inquiry))
  );
}

function getLeadStatusLabel(status: string | null) {
  return leadStatusLabels[status ?? "new"] ?? status ?? "Nowe";
}

function getLeadStatusClass(status: string | null) {
  return leadStatusClasses[status ?? "new"] ?? "bg-slate-100 text-slate-600";
}

function countResultValue(result: { count: number | null }) {
  return result.count ?? 0;
}

function buildCompanySummaries(inquiries: AdminRfqInquiry[]) {
  const summaries = new Map<string, CompanyReactionSummary>();

  for (const inquiry of inquiries) {
    const company = inquiry.companies;

    if (!company?.id) {
      continue;
    }

    const current = summaries.get(company.id) ?? {
      companyId: company.id,
      companyName: company.name ?? "Firma bez nazwy",
      companySlug: company.slug,
      isVerified: Boolean(company.is_verified),
      total: 0,
      unread: 0,
      open: 0,
      stale: 0,
      newestAt: null,
    };

    current.total += 1;
    if (isUnreadInquiry(inquiry)) current.unread += 1;
    if (isOpenLead(inquiry)) current.open += 1;
    if (isStaleInquiry(inquiry)) current.stale += 1;
    if (
      inquiry.created_at &&
      (!current.newestAt || new Date(inquiry.created_at) > new Date(current.newestAt))
    ) {
      current.newestAt = inquiry.created_at;
    }

    summaries.set(company.id, current);
  }

  return Array.from(summaries.values())
    .filter((company) => company.unread > 0 || company.open > 0 || company.stale > 0)
    .sort(
      (first, second) =>
        second.stale - first.stale ||
        second.unread - first.unread ||
        second.open - first.open ||
        second.total - first.total
    )
    .slice(0, 10);
}

function buildOfferSummaries(inquiries: AdminRfqInquiry[]) {
  const summaries = new Map<string, OfferRfqSummary>();

  for (const inquiry of inquiries) {
    const offer = inquiry.offers;

    if (!offer?.id) {
      continue;
    }

    const current = summaries.get(offer.id) ?? {
      offerId: offer.id,
      offerTitle: offer.title ?? "Oferta bez tytułu",
      offerSlug: offer.slug,
      offerStatus: offer.status,
      companyName: inquiry.companies?.name ?? "Firma bez nazwy",
      total: 0,
      unread: 0,
      newestAt: null,
    };

    current.total += 1;
    if (isUnreadInquiry(inquiry)) current.unread += 1;
    if (
      inquiry.created_at &&
      (!current.newestAt || new Date(inquiry.created_at) > new Date(current.newestAt))
    ) {
      current.newestAt = inquiry.created_at;
    }

    summaries.set(offer.id, current);
  }

  return Array.from(summaries.values())
    .sort(
      (first, second) =>
        second.total - first.total ||
        second.unread - first.unread ||
        new Date(second.newestAt ?? 0).getTime() - new Date(first.newestAt ?? 0).getTime()
    )
    .slice(0, 10);
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

export default async function AdminRfqMonitoringPage() {
  const supabase = await requireAdmin();
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  const inquirySelect =
    "id, status, lead_status, created_at, recipient_read_at, branch, service_type, quantity_scope, expected_deadline, budget, companies(id, name, slug, is_verified), offers(id, title, slug, status, branch, service_type)";

  const [
    totalResult,
    unreadResult,
    inProgressResult,
    answeredOutsideResult,
    archivedResult,
    last7DaysResult,
    last30DaysResult,
    recentResult,
    analysisResult,
  ] = await Promise.all([
    supabase.from("inquiries").select("id", { count: "exact", head: true }),
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .neq("status", "archived")
      .is("recipient_read_at", null),
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("lead_status", "in_progress"),
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("lead_status", "answered_outside_portal"),
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "archived"),
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo),
    supabase
      .from("inquiries")
      .select(inquirySelect)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("inquiries")
      .select(inquirySelect)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const recentInquiries = (recentResult.data ?? []) as unknown as AdminRfqInquiry[];
  const analysisInquiries = (analysisResult.data ?? []) as unknown as AdminRfqInquiry[];
  const companySummaries = buildCompanySummaries(analysisInquiries);
  const offerSummaries = buildOfferSummaries(analysisInquiries);
  const queryErrors = [
    totalResult.error,
    unreadResult.error,
    inProgressResult.error,
    answeredOutsideResult.error,
    archivedResult.error,
    last7DaysResult.error,
    last30DaysResult.error,
    recentResult.error,
    analysisResult.error,
  ].filter(Boolean);

  const kpis = [
    {
      label: "RFQ ogółem",
      value: countResultValue(totalResult),
      icon: "fa-inbox",
      tone: "bg-slate-100 text-slate-700",
    },
    {
      label: "Nowe / nieprzeczytane",
      value: countResultValue(unreadResult),
      icon: "fa-bell",
      tone: "bg-red-50 text-red-700",
    },
    {
      label: "W toku",
      value: countResultValue(inProgressResult),
      icon: "fa-spinner",
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Obsłużone poza portalem",
      value: countResultValue(answeredOutsideResult),
      icon: "fa-check-double",
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Archiwalne",
      value: countResultValue(archivedResult),
      icon: "fa-box-archive",
      tone: "bg-slate-100 text-slate-500",
    },
    {
      label: "RFQ z ostatnich 7 dni",
      value: countResultValue(last7DaysResult),
      icon: "fa-calendar-week",
      tone: "bg-[#1a5f3c]/10 text-[#1a5f3c]",
    },
    {
      label: "RFQ z ostatnich 30 dni",
      value: countResultValue(last30DaysResult),
      icon: "fa-calendar-days",
      tone: "bg-[#1a5f3c]/10 text-[#1a5f3c]",
    },
  ];

  return (
    <>
      <PanelNavbar />
      <main className="min-h-screen bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[1400px] px-6 py-16">
          <div className="mb-8 flex min-w-0 flex-col gap-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between md:p-8">
            <div className="min-w-0">
              <Link
                href="/admin"
                className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline"
              >
                <i className="fas fa-arrow-left text-xs"></i>
                Wróć do admina
              </Link>
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                Panel administratora
              </p>
              <h1 className="text-3xl font-extrabold text-slate-900">
                Monitoring RFQ
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                Podstawowy podgląd aktywności zapytań ofertowych w portalu. Widok służy
                do monitoringu procesu, bez obsługi pełnej treści zapytań.
              </p>
            </div>
          </div>

          {queryErrors.length > 0 ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Nie udało się pobrać części danych monitoringu RFQ. Sprawdź uprawnienia
              administratora i połączenie z Supabase.
            </div>
          ) : null}

          <section className="mb-10">
            <div className="mb-5">
              <h2 className="text-2xl font-extrabold text-slate-900">KPI RFQ</h2>
              <p className="mt-2 text-sm text-slate-500">
                Liczniki globalne pobierane zapytaniami count-only.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {kpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${kpi.tone}`}
                  >
                    <i className={`fas ${kpi.icon}`}></i>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    {kpi.label}
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-slate-900">
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-6 flex min-w-0 flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  Ostatnie zapytania
                </p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Ostatnie RFQ
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Maksymalnie 20 najnowszych rekordow. Dashboard nie pokazuje maili,
                  telefonów, załączników ani pełnej treści RFQ.
                </p>
              </div>
            </div>

            {recentInquiries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-3 font-bold">Data</th>
                      <th className="pb-3 font-bold">Oferta</th>
                      <th className="pb-3 font-bold">Firma odbiorca</th>
                      <th className="pb-3 font-bold">Lead status</th>
                      <th className="pb-3 font-bold">Read</th>
                      <th className="pb-3 font-bold">Zakres</th>
                      <th className="pb-3 font-bold text-right">Linki</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentInquiries.map((inquiry) => (
                      <tr key={inquiry.id}>
                        <td className="py-4 align-top text-slate-600">
                          {formatDate(inquiry.created_at)}
                        </td>
                        <td className="py-4 align-top">
                          <p className="font-bold text-slate-900">
                            {inquiry.offers?.title ?? "Oferta bez tytułu"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {inquiry.offers?.branch ?? inquiry.branch ?? "-"} /{" "}
                            {inquiry.offers?.service_type ?? inquiry.service_type ?? "-"}
                          </p>
                        </td>
                        <td className="py-4 align-top">
                          <p className="font-bold text-slate-900">
                            {inquiry.companies?.name ?? "Firma bez nazwy"}
                          </p>
                          {inquiry.companies?.is_verified ? (
                            <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              Zweryfikowana
                            </span>
                          ) : null}
                        </td>
                        <td className="py-4 align-top">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getLeadStatusClass(
                              inquiry.lead_status
                            )}`}
                          >
                            {getLeadStatusLabel(inquiry.lead_status)}
                          </span>
                        </td>
                        <td className="py-4 align-top">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              isUnreadInquiry(inquiry)
                                ? "bg-red-50 text-red-700"
                                : inquiry.status === "archived"
                                  ? "bg-slate-100 text-slate-500"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {inquiry.status === "archived"
                              ? "Archiwalne"
                              : isUnreadInquiry(inquiry)
                                ? "Nieprzeczytane"
                                : "Przeczytane"}
                          </span>
                        </td>
                        <td className="py-4 align-top text-slate-600">
                          <div>{inquiry.quantity_scope || "Brak zakresu"}</div>
                          <div className="text-xs text-slate-500">
                            Termin: {inquiry.expected_deadline || "-"}
                          </div>
                          <div className="text-xs text-slate-500">
                            Budżet: {inquiry.budget || "-"}
                          </div>
                        </td>
                        <td className="py-4 align-top text-right">
                          <div className="flex justify-end gap-2">
                            {inquiry.offers?.id ? (
                              <Link
                                href={`/admin/oferty/${inquiry.offers.id}`}
                                className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 no-underline transition hover:bg-slate-200"
                              >
                                Oferta
                              </Link>
                            ) : null}
                            {inquiry.companies?.id ? (
                              <Link
                                href={`/admin/firmy/${inquiry.companies.id}`}
                                className="rounded-lg bg-[#1a5f3c] px-3 py-2 text-xs font-bold text-white no-underline transition hover:bg-[#0d3d26]"
                              >
                                Firma
                              </Link>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400">
                  <i className="fas fa-inbox text-xl"></i>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Brak zapytań RFQ.
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Gdy kupujący zaczną wysyłać zapytania, zobaczysz tutaj aktywność
                  marketplace.
                </p>
              </div>
            )}
          </section>

          <div className="grid min-w-0 gap-8 xl:grid-cols-2">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-6">
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  Reakcja firm
                </p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Firmy wymagające reakcji
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Liczone na ograniczonym zbiorze ostatnich 200 RFQ: nowe, w toku,
                  nieprzeczytane lub starsze niż 3 dni.
                </p>
              </div>

              {companySummaries.length > 0 ? (
                <div className="space-y-4">
                  {companySummaries.map((company) => (
                    <article
                      key={company.companyId}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="break-words text-sm font-extrabold text-slate-900">
                            {company.companyName}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            Ostatnie RFQ: {formatDate(company.newestAt)}
                          </p>
                        </div>
                        <Link
                          href={`/admin/firmy/${company.companyId}`}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 no-underline transition hover:border-[#1a5f3c] hover:text-[#1a5f3c]"
                        >
                          Firma
                          <i className="fas fa-arrow-right text-[10px]"></i>
                        </Link>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[
                          ["Nieprzeczytane", company.unread],
                          ["Otwarte", company.open],
                          ["Stare", company.stale],
                          ["Razem", company.total],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl bg-white p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                              {label}
                            </p>
                            <p className="mt-1 text-lg font-extrabold text-slate-900">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  Brak firm wymagających reakcji.
                </div>
              )}
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-6">
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  Konwersja ofert
                </p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Oferty generujące RFQ
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Top lista liczona po stronie serwera na ograniczonym zbiorze
                  ostatnich 200 RFQ.
                </p>
              </div>

              {offerSummaries.length > 0 ? (
                <div className="space-y-4">
                  {offerSummaries.map((offer) => (
                    <article
                      key={offer.offerId}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="break-words text-sm font-extrabold text-slate-900">
                            {offer.offerTitle}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {offer.companyName} / ostatnie RFQ: {formatDate(offer.newestAt)}
                          </p>
                        </div>
                        <Link
                          href={`/admin/oferty/${offer.offerId}`}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 no-underline transition hover:border-[#1a5f3c] hover:text-[#1a5f3c]"
                        >
                          Oferta
                          <i className="fas fa-arrow-right text-[10px]"></i>
                        </Link>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {[
                          ["RFQ", offer.total],
                          ["Unread", offer.unread],
                          ["Status", offer.offerStatus ?? "-"],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl bg-white p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                              {label}
                            </p>
                            <p className="mt-1 break-words text-sm font-extrabold text-slate-900">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  Brak ofert z zapytaniami w wybranym zakresie.
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

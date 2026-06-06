import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { createClient } from "@/lib/supabase/server";
import PendingServicesClient from "../PendingServicesClient";
import {
  enrichServiceRequestsWithReplyContext,
  serviceRequestsAdminSelect,
  type ServiceRequestRecord,
} from "../serviceRequestsData";

export const metadata: Metadata = {
  title: "Zgłoszenia usług | Panel administratora",
  description: "Historia zgłoszeń brakujących usług w panelu administratora.",
};

type AdminServiceRequestsPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const statusFilters = [
  { label: "Wszystkie", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Zatwierdzone", value: "approved" },
  { label: "Odrzucone", value: "rejected" },
];

const handledFilters = [
  { label: "Wszystkie", value: "all" },
  { label: "Obsłużone", value: "yes" },
  { label: "Nieobsłużone", value: "no" },
];

function getSingleParam(
  searchParams: AdminServiceRequestsPageProps["searchParams"],
  key: string
) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function buildServiceRequestsHref(params: { status?: string; handled?: string }) {
  const query = new URLSearchParams();

  if (params.status && params.status !== "all") {
    query.set("status", params.status);
  }

  if (params.handled && params.handled !== "all") {
    query.set("handled", params.handled);
  }

  const queryString = query.toString();
  return queryString
    ? `/admin/service-requests?${queryString}`
    : "/admin/service-requests";
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

export default async function AdminServiceRequestsPage({
  searchParams,
}: AdminServiceRequestsPageProps) {
  const supabase = await requireAdmin();
  const requestedStatus = getSingleParam(searchParams, "status");
  const requestedHandled = getSingleParam(searchParams, "handled");
  const activeStatus = statusFilters.some(
    (filter) => filter.value === requestedStatus
  )
    ? requestedStatus
    : "all";
  const activeHandled = handledFilters.some(
    (filter) => filter.value === requestedHandled
  )
    ? requestedHandled
    : "all";
  let serviceRequestsQuery = supabase
    .from("service_requests")
    .select(serviceRequestsAdminSelect);

  if (activeStatus !== "all") {
    serviceRequestsQuery = serviceRequestsQuery.eq("status", activeStatus);
  }

  if (activeHandled === "yes") {
    serviceRequestsQuery = serviceRequestsQuery.not("admin_handled_at", "is", null);
  } else if (activeHandled === "no") {
    serviceRequestsQuery = serviceRequestsQuery.is("admin_handled_at", null);
  }

  const { data, error } = await serviceRequestsQuery
    .order("created_at", { ascending: false })
    .limit(200);
  const serviceRequests = (data ?? []) as unknown as ServiceRequestRecord[];
  const {
    requests: serviceRequestsWithReplyContext,
    contactContextError,
  } = await enrichServiceRequestsWithReplyContext(supabase, serviceRequests);

  return (
    <>
      <PanelNavbar />
      <main className="min-h-screen bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[1400px] px-6 py-12 md:py-16">
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
                Zgłoszenia brakujących usług
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                Pełna historia zgłoszeń usług z formularzy użytkowników. Widok
                jest dostępny wyłącznie dla administratora.
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid min-w-0 gap-5 lg:grid-cols-2">
              <div className="min-w-0">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status decyzji
                </p>
                <div className="flex flex-wrap gap-2">
                  {statusFilters.map((filter) => (
                    <Link
                      key={filter.value}
                      href={buildServiceRequestsHref({
                        status: filter.value,
                        handled: activeHandled,
                      })}
                      className={`rounded-full px-3 py-2 text-xs font-bold no-underline transition ${
                        activeStatus === filter.value
                          ? "bg-[#1a5f3c] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-[#1a5f3c]/10 hover:text-[#1a5f3c]"
                      }`}
                    >
                      {filter.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="min-w-0">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status obsługi
                </p>
                <div className="flex flex-wrap gap-2">
                  {handledFilters.map((filter) => (
                    <Link
                      key={filter.value}
                      href={buildServiceRequestsHref({
                        status: activeStatus,
                        handled: filter.value,
                      })}
                      className={`rounded-full px-3 py-2 text-xs font-bold no-underline transition ${
                        activeHandled === filter.value
                          ? "bg-[#1a5f3c] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-[#1a5f3c]/10 hover:text-[#1a5f3c]"
                      }`}
                    >
                      {filter.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Nie udało się pobrać zgłoszeń usług: {error.message}
            </div>
          ) : null}

          {contactContextError ? (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {contactContextError} Odpowiedź mailowa może być niedostępna do
              ręcznej weryfikacji profilu użytkownika lub firmy.
            </div>
          ) : null}

          <section className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-6">
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                Historia zgłoszeń
              </p>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Wszystkie zgłoszenia usług
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Najnowsze zgłoszenia są na górze. Decyzja merytoryczna i status
                obsługi odpowiedzi są pokazywane osobno.
              </p>
            </div>

            <PendingServicesClient
              requests={serviceRequestsWithReplyContext}
              emptyMessage="Brak zgłoszeń usług dla wybranych filtrów."
              showAdminNote
            />
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  formatCapacityRequestBudget,
  formatCapacityRequestDate,
  formatCapacityRequestVolume,
  getCapacityRequestStatusClass,
  getCapacityRequestStatusLabel,
} from "@/lib/capacityRequests";
import AdminCapacityRequestActionsClient from "./AdminCapacityRequestActionsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Zapytania produkcyjne | Panel administratora",
  description: "Minimalna moderacja zapytań produkcyjnych w WolneMoce.",
};

type AdminCapacityRequest = {
  id: string;
  company_id: string;
  title: string;
  slug: string;
  branch: string;
  service_type: string;
  location: string | null;
  preferred_region: string | null;
  quantity: number | null;
  unit: string | null;
  deadline: string;
  budget_type: string;
  budget_min: number | null;
  budget_max: number | null;
  description: string;
  technical_documentation_available: boolean;
  status: string | null;
  is_featured: boolean | null;
  interest_count: number | null;
  admin_note: string | null;
  rejection_reason: string | null;
  expires_at: string;
  created_at: string;
  companies: {
    id: string;
    name: string | null;
    slug: string | null;
  } | null;
};

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

  return createAdminClient();
}

type AdminCapacityRequestStatusFilter =
  | "all"
  | "pending"
  | "active"
  | "rejected"
  | "expired"
  | "archived";

function getStatusFilter(
  value: string | string[] | undefined
): AdminCapacityRequestStatusFilter {
  const status = Array.isArray(value) ? value[0] : value;

  switch (status) {
    case "pending":
    case "active":
    case "rejected":
    case "expired":
    case "archived":
      return status;
    default:
      return "all";
  }
}

export default async function AdminCapacityRequestsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const admin = await requireAdmin();
  const statusFilter = getStatusFilter(searchParams?.status);
  let query = admin
    .from("capacity_requests")
    .select(
      "id, company_id, title, slug, branch, service_type, location, preferred_region, quantity, unit, deadline, budget_type, budget_min, budget_max, description, technical_documentation_available, status, is_featured, interest_count, admin_note, rejection_reason, expires_at, created_at, companies!inner(id, name, slug)"
    );

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(100);
  const requests = ((data ?? []) as unknown as AdminCapacityRequest[]).sort(
    (first, second) => {
      if (first.status === "pending" && second.status !== "pending") {
        return -1;
      }
      if (first.status !== "pending" && second.status === "pending") {
        return 1;
      }
      return (
        new Date(second.created_at).getTime() -
        new Date(first.created_at).getTime()
      );
    }
  );
  const filters = [
    ["all", "Wszystkie"],
    ["pending", "W moderacji"],
    ["active", "Aktywne"],
    ["rejected", "Odrzucone"],
    ["archived", "Zarchiwizowane"],
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
                Zapytania produkcyjne
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                Minimalna moderacja zleceń dodanych przez firmy szukające
                wykonawców. Dane kontaktowe pozostają poza publicznym widokiem.
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {filters.map(([value, label]) => (
                <Link
                  key={value}
                  href={value === "all" ? "/admin/zapytania" : `/admin/zapytania?status=${value}`}
                  className={`rounded-full px-3 py-2 text-xs font-bold no-underline transition ${
                    statusFilter === value
                      ? "bg-[#1a5f3c] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-[#1a5f3c]/10 hover:text-[#1a5f3c]"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {error ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Nie udało się pobrać zapytań: {error.message}
            </div>
          ) : null}

          {requests.length > 0 ? (
            <div className="grid min-w-0 gap-5">
              {requests.map((request) => (
                <article
                  key={request.id}
                  className="grid min-w-0 gap-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_360px] md:p-6"
                >
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${getCapacityRequestStatusClass(request.status)}`}>
                        {getCapacityRequestStatusLabel(request.status)}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {request.interest_count ?? 0} zainteresowanych
                      </span>
                      {request.technical_documentation_available ? (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                          Dokumentacja dostępna
                        </span>
                      ) : null}
                    </div>
                    <h2 className="break-words text-xl font-extrabold text-slate-900">
                      {request.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {request.companies?.name ?? "Firma bez nazwy"} · {request.branch} · {request.service_type}
                    </p>
                    <p className="mt-4 whitespace-pre-line rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                      {request.description}
                    </p>
                    <div className="mt-5 grid min-w-0 gap-3 text-sm text-slate-600 md:grid-cols-4">
                      <p>
                        <strong className="block text-slate-900">Wolumen</strong>
                        {formatCapacityRequestVolume(request)}
                      </p>
                      <p>
                        <strong className="block text-slate-900">Termin</strong>
                        {formatCapacityRequestDate(request.deadline)}
                      </p>
                      <p>
                        <strong className="block text-slate-900">Budżet</strong>
                        {formatCapacityRequestBudget(request)}
                      </p>
                      <p>
                        <strong className="block text-slate-900">Wygasa</strong>
                        {formatCapacityRequestDate(request.expires_at)}
                      </p>
                    </div>
                    {request.status === "active" ? (
                      <Link
                        href={`/zapytania/${request.slug}`}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c]"
                      >
                        Podgląd publiczny
                        <i className="fas fa-arrow-right text-xs"></i>
                      </Link>
                    ) : null}
                  </div>
                  <aside className="min-w-0 rounded-2xl bg-slate-50 p-4">
                    <AdminCapacityRequestActionsClient
                      requestId={request.id}
                      status={request.status}
                      adminNote={request.admin_note}
                      rejectionReason={request.rejection_reason}
                    />
                  </aside>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              Brak zapytań dla wybranego filtra.
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

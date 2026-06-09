import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import {
  formatCapacityRequestBudget,
  formatCapacityRequestDate,
  formatCapacityRequestVolume,
  getCapacityRequestStatusClass,
  getCapacityRequestStatusLabel,
  type CapacityRequestStatus,
} from "@/lib/capacityRequests";
import { createClient } from "@/lib/supabase/server";
import { archiveOwnerCapacityRequest } from "./capacityRequestActions";

type OwnerCapacityRequest = {
  id: string;
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
  status: CapacityRequestStatus;
  interest_count: number;
  rejection_reason: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

type OwnerCapacityRequestRpcRow = Omit<OwnerCapacityRequest, "status"> & {
  status: string;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Moje zlecenia | Panel firmy",
  description: "Lista zapytań produkcyjnych dodanych przez Twoją firmę.",
};

export default async function PanelMyCapacityRequestsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logowanie");
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: requests } = company
    ? await supabase
        .rpc("get_my_capacity_requests", { p_company_id: company.id })
    : { data: [] };

  const ownerRequestRows = (requests ?? []) as OwnerCapacityRequestRpcRow[];
  const ownerRequests = ownerRequestRows.map((request) => ({
    ...request,
    status: request.status as CapacityRequestStatus,
  }));

  return (
    <>
      <PanelNavbar />
      <main className="bg-slate-50 pt-[128px]">
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="mb-8 flex min-w-0 flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                Moje zlecenia — szukam wykonawcy
              </p>
              <h1 className="text-3xl font-extrabold text-slate-900">
                Moje zlecenia
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                Tu zarządzasz zapytaniami produkcyjnymi dodanymi przez Twoją firmę
                jako zlecającego. Otrzymane wiadomości do ofert pozostają osobno
                w sekcji „Otrzymane zapytania”.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/panel/zapytania" className="btn btn-outline">
                Otrzymane zapytania
              </Link>
              {company ? (
                <Link href="/panel/moje-zapytania/nowe" className="btn btn-primary">
                  Dodaj zapytanie
                </Link>
              ) : null}
            </div>
          </div>

          {!company ? (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-6 shadow-sm md:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#1a5f3c]">
                <i className="fas fa-building"></i>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Najpierw uzupełnij profil firmy.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Zapytania produkcyjne muszą być przypisane do firmy. Dane
                kontaktowe nie będą publicznie widoczne.
              </p>
              <Link
                href={`/panel/profil?return_to=${encodeURIComponent("/panel/moje-zapytania/nowe")}`}
                className="mt-6 btn btn-primary"
              >
                Uzupełnij profil firmy
              </Link>
            </div>
          ) : ownerRequests.length > 0 ? (
            <div className="grid min-w-0 gap-5">
              {ownerRequests.map((request) => {
                const statusClass = getCapacityRequestStatusClass(request.status);
                const canPreview = request.status === "active";
                const canArchive = request.status !== "archived";

                return (
                  <article
                    key={request.id}
                    className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${statusClass}`}>
                            <i className="fas fa-circle"></i>
                            {getCapacityRequestStatusLabel(request.status)}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            Utworzono: {formatCapacityRequestDate(request.created_at)}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            {request.interest_count} zainteresowanych
                          </span>
                        </div>
                        <h2 className="break-words text-xl font-extrabold text-slate-900">
                          {request.title}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {request.branch} · {request.service_type}
                        </p>
                        <div className="mt-5 grid min-w-0 gap-3 text-sm text-slate-600 md:grid-cols-4">
                          <p className="min-w-0">
                            <strong className="block text-slate-900">Wolumen</strong>
                            {formatCapacityRequestVolume(request)}
                          </p>
                          <p className="min-w-0">
                            <strong className="block text-slate-900">Termin</strong>
                            {formatCapacityRequestDate(request.deadline)}
                          </p>
                          <p className="min-w-0">
                            <strong className="block text-slate-900">Budżet</strong>
                            {formatCapacityRequestBudget(request)}
                          </p>
                          <p className="min-w-0">
                            <strong className="block text-slate-900">Ważne do</strong>
                            {formatCapacityRequestDate(request.expires_at)}
                          </p>
                        </div>
                        {request.status === "rejected" && request.rejection_reason ? (
                          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-800">
                            <strong className="mb-1 block text-red-900">
                              Powód odrzucenia:
                            </strong>
                            {request.rejection_reason}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row lg:flex-col">
                        {canPreview ? (
                          <Link
                            href={`/zapytania/${request.slug}`}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-4 py-2.5 text-sm font-bold text-white no-underline transition hover:bg-[#164f32] sm:w-auto"
                          >
                            <i className="fas fa-eye"></i>
                            Podgląd
                          </Link>
                        ) : null}
                        {canArchive ? (
                          <form action={archiveOwnerCapacityRequest}>
                            <input type="hidden" name="requestId" value={request.id} />
                            <button
                              type="submit"
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:text-red-600 sm:w-auto"
                            >
                              <i className="fas fa-box-archive"></i>
                              Archiwizuj
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                <i className="fas fa-clipboard-list text-xl"></i>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Nie masz jeszcze zleceń.
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Dodaj pierwsze zapytanie produkcyjne, jeśli szukasz wykonawcy,
                podwykonawcy lub firmy z odpowiednimi mocami.
              </p>
              <Link href="/panel/moje-zapytania/nowe" className="mt-6 btn btn-primary">
                Dodaj zapytanie
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

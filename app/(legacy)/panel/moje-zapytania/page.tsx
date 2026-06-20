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
import { getEffectiveCapacityRequestStatus } from "@/lib/capacityRequestStatus";
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

type CapacityRequestInterestSummary = {
  company_name: string;
  company_slug: string | null;
  city: string | null;
  region: string | null;
  branch: string | null;
  is_verified: boolean;
  interested_at: string;
};

function formatInterestLocation(interest: CapacityRequestInterestSummary) {
  return [interest.city, interest.region].filter(Boolean).join(", ");
}

function CapacityRequestInterestsList({
  count,
  interests,
}: {
  count: number;
  interests: CapacityRequestInterestSummary[];
}) {
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-slate-900">
            Zainteresowane firmy
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {count > 0
              ? `${count} ${count === 1 ? "firma zgłosiła" : "firmy zgłosiły"} zainteresowanie tym zapytaniem.`
              : "Na razie brak zgłoszeń zainteresowania."}
          </p>
        </div>
      </div>

      {interests.length > 0 ? (
        <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
          {interests.map((interest) => {
            const location = formatInterestLocation(interest);

            return (
              <div
                key={`${interest.company_name}-${interest.interested_at}`}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    {interest.company_slug ? (
                      <Link
                        href={`/firmy/${interest.company_slug}`}
                        className="break-words text-sm font-extrabold text-slate-900 transition hover:text-[#1a5f3c]"
                      >
                        {interest.company_name}
                      </Link>
                    ) : (
                      <p className="break-words text-sm font-extrabold text-slate-900">
                        {interest.company_name}
                      </p>
                    )}
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {[location, interest.branch].filter(Boolean).join(" · ") ||
                        "Brak danych lokalizacji"}
                    </p>
                  </div>
                  {interest.is_verified ? (
                    <span className="inline-flex shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      Zweryfikowana firma
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-400">
                  Zgłoszono: {formatCapacityRequestDate(interest.interested_at)}
                </p>
                {interest.company_slug ? (
                  <Link
                    href={`/firmy/${interest.company_slug}`}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#1a5f3c]"
                  >
                    Zobacz profil firmy
                    <i className="fas fa-arrow-right text-[10px]"></i>
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Moje zapytania produkcyjne | Panel firmy",
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
  const now = new Date();
  const interestEntries =
    ownerRequests.length > 0
      ? await Promise.all(
          ownerRequests.map(async (request) => {
            const { data } = await supabase.rpc(
              "get_capacity_request_interests_for_owner",
              { p_capacity_request_id: request.id }
            );

            return [
              request.id,
              (data ?? []) as CapacityRequestInterestSummary[],
            ] as const;
          })
        )
      : [];
  const interestsByRequestId = new Map(interestEntries);

  return (
    <>
      <PanelNavbar />
      <main className="bg-slate-50 pt-[128px]">
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="mb-8 flex min-w-0 flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                Moje zapytania produkcyjne — szukam wykonawcy
              </p>
              <h1 className="text-3xl font-extrabold text-slate-900">
                Moje zapytania produkcyjne
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
                const effectiveStatus = getEffectiveCapacityRequestStatus({
                  status: request.status,
                  expiresAt: request.expires_at,
                  now,
                });
                const statusClass = getCapacityRequestStatusClass(effectiveStatus);
                const canPreview = effectiveStatus === "active";
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
                            {getCapacityRequestStatusLabel(effectiveStatus)}
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
                        <CapacityRequestInterestsList
                          count={request.interest_count}
                          interests={interestsByRequestId.get(request.id) ?? []}
                        />
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
                Nie masz jeszcze zapytań produkcyjnych.
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

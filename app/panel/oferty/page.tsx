import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import OfferActionsClient from "./OfferActionsClient";

export const metadata: Metadata = {
  title: "Moje oferty",
  description: "Zarządzaj ofertami swojej firmy w panelu WolneMoce.pl.",
};

type OfferStatus = "draft" | "pending" | "active" | "rejected";

const statusLabels: Record<OfferStatus, string> = {
  draft: "Szkic",
  pending: "Oczekuje na zatwierdzenie",
  active: "Aktywna",
  rejected: "Odrzucona",
};

const statusClasses: Record<OfferStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending: "bg-amber-50 text-amber-700",
  active: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Brak daty";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export default async function PanelOffersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logowanie");
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, industry, service_types")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: offers } = company
    ? await supabase
        .from("offers")
        .select(
          "id, title, branch, service_type, power_available, min_order, lead_time, status, created_at"
        )
        .eq("company_id", company.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="mb-8 flex min-w-0 flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                Panel firmy
              </p>
              <h1 className="text-3xl font-extrabold text-slate-900">
                Moje oferty
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Zarządzaj ofertami swojej firmy.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/panel" className="btn btn-outline">
                Wróć do panelu
              </Link>
              {company ? (
                <Link href="/panel/oferty/nowa" className="btn btn-primary">
                  Dodaj ofertę
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
                Oferty są powiązane z firmą, dlatego przed dodaniem pierwszej
                oferty uzupełnij dane rejestrowe, branżę i rodzaje usług.
              </p>
              <Link href="/panel/profil" className="mt-6 btn btn-primary">
                Uzupełnij profil firmy
              </Link>
            </div>
          ) : offers && offers.length > 0 ? (
            <div className="grid min-w-0 gap-5">
              {offers.map((offer) => {
                const status = (offer.status ?? "pending") as OfferStatus;

                return (
                  <article
                    key={offer.id}
                    className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClasses[status]}`}
                          >
                            {statusLabels[status]}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            Utworzono: {formatDate(offer.created_at)}
                          </span>
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900">
                          {offer.title}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {offer.branch} · {offer.service_type}
                        </p>
                        <div className="mt-5 grid min-w-0 gap-3 text-sm text-slate-600 md:grid-cols-3">
                          <p className="min-w-0">
                            <strong className="block text-slate-900">
                              Dostępna moc
                            </strong>
                            {offer.power_available ?? "Nie podano"}
                          </p>
                          <p className="min-w-0">
                            <strong className="block text-slate-900">
                              Minimalne zamówienie
                            </strong>
                            {offer.min_order ?? "Nie podano"}
                          </p>
                          <p className="min-w-0">
                            <strong className="block text-slate-900">
                              Termin realizacji
                            </strong>
                            {offer.lead_time ?? "Nie podano"}
                          </p>
                        </div>
                      </div>

                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row lg:flex-col">
                        <Link
                          href={`/panel/oferty/${offer.id}/edytuj`}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-4 py-2.5 text-sm font-bold text-white no-underline transition hover:bg-[#164f32] sm:w-auto"
                        >
                          <i className="fas fa-pen"></i>
                          Edytuj
                        </Link>
                        <OfferActionsClient offerId={offer.id} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 text-center shadow-sm md:p-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                <i className="fas fa-list-check text-xl"></i>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Nie masz jeszcze ofert
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Dodaj pierwszą ofertę wolnych mocy, aby rozpocząć pracę w
                panelu firmy.
              </p>
              <Link href="/panel/oferty/nowa" className="mt-6 btn btn-primary">
                Dodaj ofertę
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

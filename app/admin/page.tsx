import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import LogoutButton from "@/components/LogoutButton";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import PendingOffersClient, { type PendingOffer } from "./PendingOffersClient";
import PendingServicesClient, {
  type PendingServiceRequest,
} from "./PendingServicesClient";

export const metadata: Metadata = {
  title: "Panel administratora",
  description: "Panel administratora WolneMoce.pl.",
};

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logowanie");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/panel");
  }

  const [offersResult, serviceRequestsResult] = await Promise.all([
    supabase
      .from("offers")
      .select(
        "*, companies!inner(name, location_voivodeship, location_city, is_verified)"
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("service_requests")
      .select("*, companies(name)")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const pendingOffers = (offersResult.data ?? []) as PendingOffer[];
  const pendingServiceRequests = (serviceRequestsResult.data ??
    []) as PendingServiceRequest[];

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[1400px] px-6 py-16">
          <div className="mb-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex min-w-0 flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  Panel administratora
                </p>
                <h1 className="text-3xl font-extrabold text-slate-900">
                  Panel administratora
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                  Moderuj oferty i zgłoszenia usług w WolneMoce.pl. Zalogowano
                  jako admin: {user.email}
                </p>
              </div>
              <LogoutButton />
            </div>
          </div>

          <div className="mb-8 grid min-w-0 gap-5 md:grid-cols-2">
            <div className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                <i className="fas fa-clipboard-check"></i>
              </div>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Oferty pending
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {pendingOffers.length}
              </p>
            </div>

            <div className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                <i className="fas fa-screwdriver-wrench"></i>
              </div>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Zgłoszenia usług pending
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {pendingServiceRequests.length}
              </p>
            </div>
          </div>

          {offersResult.error ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Nie udało się pobrać ofert: {offersResult.error.message}
            </div>
          ) : null}

          {serviceRequestsResult.error ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Nie udało się pobrać zgłoszeń usług:{" "}
              {serviceRequestsResult.error.message}
            </div>
          ) : null}

          <div className="grid min-w-0 gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-6">
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  Moderacja ofert
                </p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Oferty oczekujące na zatwierdzenie
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Zatwierdzenie zmienia status oferty na active i pokaże ją
                  publicznie w `/oferty`.
                </p>
              </div>
              <PendingOffersClient offers={pendingOffers} />
            </section>

            <section className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-6">
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  Słownik usług
                </p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Zgłoszenia brakujących usług
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Akceptacja zmienia tylko status zgłoszenia. Słownik usług nie
                  jest jeszcze aktualizowany automatycznie.
                </p>
              </div>
              <PendingServicesClient requests={pendingServiceRequests} />
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

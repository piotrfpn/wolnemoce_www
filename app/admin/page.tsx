import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import LogoutButton from "@/components/LogoutButton";
import PanelNavbar from "@/components/PanelNavbar";
import { createClient } from "@/lib/supabase/server";
import PendingCompaniesClient, {
  type PendingCompany,
} from "./PendingCompaniesClient";
import PendingOffersClient, { type PendingOffer } from "./PendingOffersClient";
import PendingServicesClient, {
  type PendingServiceRequest,
} from "./PendingServicesClient";

type FreeLimitOffer = {
  id: string;
  title: string | null;
  status: string | null;
  company_id: string | null;
  companies: {
    id: string;
    name: string | null;
    plan: string | null;
  } | null;
};

type FreeLimitCompanySummary = {
  companyId: string;
  companyName: string;
  count: number;
  offers: {
    id: string;
    title: string;
    status: string;
  }[];
};

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

  const [
    companiesResult,
    offersResult,
    serviceRequestsResult,
    contactMessagesResult,
    freeLimitOffersResult,
  ] = await Promise.all([
    supabase
      .from("companies")
      .select(
        "id, name, nip, industry, industries, service_types, location_voivodeship, location_city, website_url, is_verified, created_at"
      )
      .eq("is_verified", false)
      .order("created_at", { ascending: false }),
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
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("offers")
      .select("id, title, status, company_id, companies!inner(id, name, plan)")
      .in("status", ["active", "pending"])
      .eq("companies.plan", "free"),
  ]);

  const pendingCompanies = (companiesResult.data ?? []) as PendingCompany[];
  const pendingOffers = (offersResult.data ?? []) as PendingOffer[];
  const pendingServiceRequests = (serviceRequestsResult.data ??
    []) as PendingServiceRequest[];
  const newContactMessagesCount = contactMessagesResult.count ?? 0;
  const freeLimitOffers = (freeLimitOffersResult.data ?? []) as unknown as FreeLimitOffer[];
  const freeLimitCompanies = new Map<string, FreeLimitCompanySummary>();

  for (const offer of freeLimitOffers) {
    const companyId = offer.companies?.id ?? offer.company_id;

    if (!companyId) {
      continue;
    }

    const current = freeLimitCompanies.get(companyId) ?? {
      companyId,
      companyName: offer.companies?.name ?? "Firma bez nazwy",
      count: 0,
      offers: [],
    };

    current.count += 1;
    current.offers.push({
      id: offer.id,
      title: offer.title ?? "Oferta bez tytułu",
      status: offer.status ?? "pending",
    });
    freeLimitCompanies.set(companyId, current);
  }

  const freeLimitOverages = Array.from(freeLimitCompanies.values())
    .filter((company) => company.count > 1)
    .sort((first, second) => second.count - first.count);
  const pendingOfferIds = pendingOffers.map((offer) => offer.id);
  const { data: offerImages } =
    pendingOfferIds.length > 0
      ? await supabase
          .from("offer_images")
          .select("id, offer_id, path, alt, sort_order, created_at")
          .in("offer_id", pendingOfferIds)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true })
      : { data: [] };
  const offerImagesByOfferId = new Map<string, PendingOffer["offer_images"]>();

  for (const image of (offerImages ?? []) as NonNullable<
    PendingOffer["offer_images"]
  >) {
    const current = offerImagesByOfferId.get(image.offer_id) ?? [];
    current.push(image);
    offerImagesByOfferId.set(image.offer_id, current);
  }

  const pendingOffersWithImages = pendingOffers.map((offer) => ({
    ...offer,
    offer_images: offerImagesByOfferId.get(offer.id) ?? [],
  }));

  return (
    <>
      <PanelNavbar />
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

          <div className="mb-8 grid min-w-0 gap-5 md:grid-cols-4">
            <div className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                <i className="fas fa-building-circle-check"></i>
              </div>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Firmy do weryfikacji
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {pendingCompanies.length}
              </p>
            </div>

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

            <div className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                <i className="fas fa-envelope-open-text"></i>
              </div>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Nowe wiadomości
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {newContactMessagesCount}
              </p>
            </div>
          </div>

          <section className="mb-8 min-w-0 rounded-[24px] border border-amber-200 bg-amber-50 p-5 shadow-sm md:p-6">
            <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-amber-700">
                  <i className="fas fa-scale-balanced"></i>
                </div>
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-amber-700">
                  Sanity-check limitu FREE
                </p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {freeLimitOverages.length > 0
                    ? "Firmy FREE z przekroczonym limitem"
                    : "Brak firm FREE ponad limitem"}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
                  Limit liczy oferty aktywne i oczekujące na moderację. To
                  kontrola danych legacy - żadna oferta nie jest archiwizowana
                  automatycznie.
                </p>
              </div>
              <Link
                href="/admin/oferty?freeLimit=over"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-amber-700 px-5 py-3 text-sm font-bold text-amber-800 no-underline transition hover:bg-amber-700 hover:text-white"
              >
                Pokaż oferty over limit
                <i className="fas fa-arrow-right text-xs"></i>
              </Link>
            </div>

            {freeLimitOffersResult.error ? (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Nie udało się pobrać sanity-checku FREE:{" "}
                {freeLimitOffersResult.error.message}
              </div>
            ) : freeLimitOverages.length > 0 ? (
              <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-2">
                {freeLimitOverages.slice(0, 6).map((company) => (
                  <div
                    key={company.companyId}
                    className="min-w-0 rounded-2xl border border-amber-200 bg-white p-4"
                  >
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="break-words text-sm font-extrabold text-slate-900">
                          {company.companyName}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-amber-800">
                          Przekroczony limit FREE: {company.count}/1 ofert
                          aktywnych lub w moderacji
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                        Legacy
                      </span>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {company.offers.slice(0, 3).map((offer) => (
                        <li key={offer.id} className="flex min-w-0 gap-2">
                          <span className="font-bold text-slate-900">
                            {offer.status}
                          </span>
                          <span className="min-w-0 break-words">
                            {offer.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="mb-8 min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex min-w-0 flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                  <i className="fas fa-list-check"></i>
                </div>
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  Oferty
                </p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Zarządzanie ofertami
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Przeglądaj wszystkie oferty, zmieniaj statusy i ustawiaj ręczne
                  wyróżnienia.
                </p>
              </div>
              <Link
                href="/admin/oferty"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-5 py-3 text-sm font-bold text-[#1a5f3c] no-underline transition hover:bg-[#1a5f3c] hover:text-white"
              >
                Zarządzaj ofertami
                <i className="fas fa-arrow-right text-xs"></i>
              </Link>
            </div>
          </section>

          <section className="mb-8 min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex min-w-0 flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                  <i className="fas fa-certificate"></i>
                </div>
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  Certyfikaty
                </p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Certyfikaty firm
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Przeglądaj i moderuj certyfikaty dodane przez firmy.
                </p>
              </div>
              <Link
                href="/admin/certyfikaty"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-5 py-3 text-sm font-bold text-[#1a5f3c] no-underline transition hover:bg-[#1a5f3c] hover:text-white"
              >
                Zarządzaj certyfikatami
                <i className="fas fa-arrow-right text-xs"></i>
              </Link>
            </div>
          </section>

          <section className="mb-8 min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex min-w-0 flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                  <i className="fas fa-envelope-open-text"></i>
                </div>
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  Kontakt
                </p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Wiadomości z formularza
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Przeglądaj wiadomości zapisane z formularza kontaktowego i
                  oznaczaj je jako przeczytane albo obsłużone.
                </p>
              </div>
              <Link
                href="/admin/contact-messages"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-5 py-3 text-sm font-bold text-[#1a5f3c] no-underline transition hover:bg-[#1a5f3c] hover:text-white"
              >
                Otwórz inbox
                <i className="fas fa-arrow-right text-xs"></i>
              </Link>
            </div>
          </section>

          <section className="mb-8 min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex min-w-0 flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                  <i className="fas fa-newspaper"></i>
                </div>
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  Blog
                </p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Zarządzanie blogiem
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Zarządzaj artykułami, poradnikami i aktualnościami.
                </p>
              </div>
              <Link
                href="/admin/blog"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-5 py-3 text-sm font-bold text-[#1a5f3c] no-underline transition hover:bg-[#1a5f3c] hover:text-white"
              >
                Zarządzaj blogiem
                <i className="fas fa-arrow-right text-xs"></i>
              </Link>
            </div>
          </section>

          {companiesResult.error ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Nie udało się pobrać firm: {companiesResult.error.message}
            </div>
          ) : null}

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

          <section className="mb-8 min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-6">
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                Weryfikacja firm
              </p>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Firmy oczekujące na weryfikację
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Oznaczenie firmy jako zweryfikowanej pokaże badge w panelu
                użytkownika, na kartach ofert i profilu firmy.
              </p>
              <div className="mt-4">
                <Link
                  href="/admin/firmy"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-5 py-3 text-sm font-bold text-[#1a5f3c] no-underline transition hover:bg-[#1a5f3c] hover:text-white"
                >
                  Zarządzaj firmami
                  <i className="fas fa-arrow-right text-xs"></i>
                </Link>
              </div>
            </div>
            <PendingCompaniesClient companies={pendingCompanies} />
          </section>

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
              <PendingOffersClient offers={pendingOffersWithImages} />
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

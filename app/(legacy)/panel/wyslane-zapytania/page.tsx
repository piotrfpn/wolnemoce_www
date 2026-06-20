import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { createClient } from "@/lib/supabase/server";
import { getPanelLocale } from "@/lib/i18n/panelLocale";
import { getLocalizedPath } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Wysłane zapytania ofertowe | Panel firmy",
  description: "Podgląd wysłanych zapytań ofertowych w portalu WolneMoce.",
};

export const dynamic = "force-dynamic";

type LocalizedCopy = {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyDescription: string;
  backToDashboard: string;
  statusSent: string;
  statusRead: string;
  statusArchived: string;
  offer: string;
  recipient: string;
  date: string;
  message: string;
  statusLabel: string;
  back: string;
  companyPanel: string;
  viewOffer: string;
  recipientProfile: string;
  branchService: string;
  fallbackOfferTitle: string;
  fallbackCompanyName: string;
  historyNotice: string;
  browseOffers: string;
};

const LOCALIZED: Record<string, LocalizedCopy> = {
  pl: {
    title: "Wysłane zapytania",
    subtitle: "Zapytania ofertowe wysłane przez Ciebie do innych firm.",
    emptyTitle: "Brak wysłanych zapytań",
    emptyDescription: "Nie wysłałeś jeszcze żadnych zapytań ofertowych do firm w portalu.",
    backToDashboard: "Wróć do panelu",
    statusSent: "wysłane",
    statusRead: "odczytane",
    statusArchived: "archiwalne",
    offer: "Oferta",
    recipient: "Odbiorca",
    date: "Data wysłania",
    message: "Treść zapytania",
    statusLabel: "Status",
    back: "Wróć",
    companyPanel: "Panel firmy",
    viewOffer: "Zobacz ofertę",
    recipientProfile: "Profil odbiorcy",
    branchService: "Branża / Usługa",
    fallbackOfferTitle: "Zapytanie ofertowe",
    fallbackCompanyName: "Nieznana firma",
    historyNotice: "Starsze zapytania wysłane przed włączeniem historii mogą nie być widoczne.",
    browseOffers: "Przeglądaj oferty",
  },
  en: {
    title: "Sent inquiries",
    subtitle: "Inquiries sent by you to other companies.",
    emptyTitle: "No sent inquiries",
    emptyDescription: "You haven't sent any inquiries to companies in the portal yet.",
    backToDashboard: "Back to dashboard",
    statusSent: "sent",
    statusRead: "read",
    statusArchived: "archived",
    offer: "Offer",
    recipient: "Recipient",
    date: "Sent date",
    message: "Inquiry message",
    statusLabel: "Status",
    back: "Back",
    companyPanel: "Company panel",
    viewOffer: "View offer",
    recipientProfile: "Recipient profile",
    branchService: "Industry / Service",
    fallbackOfferTitle: "Inquiry",
    fallbackCompanyName: "Unknown company",
    historyNotice: "Older inquiries sent before history tracking was enabled may not be visible.",
    browseOffers: "Browse offers",
  },
  de: {
    title: "Gesendete Anfragen",
    subtitle: "Von Ihnen an andere Unternehmen gesendete Anfragen.",
    emptyTitle: "Keine gesendeten Anfragen",
    emptyDescription: "Sie haben noch keine Anfragen an Unternehmen im Portal gesendet.",
    backToDashboard: "Zurück zum Dashboard",
    statusSent: "gesendet",
    statusRead: "gelesen",
    statusArchived: "archiviert",
    offer: "Angebot",
    recipient: "Empfänger",
    date: "Sendedatum",
    message: "Anfragenachricht",
    statusLabel: "Status",
    back: "Zurück",
    companyPanel: "Firmenpanel",
    viewOffer: "Angebot anzeigen",
    recipientProfile: "Empfängerprofil",
    branchService: "Branche / Dienstleistung",
    fallbackOfferTitle: "Anfrage",
    fallbackCompanyName: "Unbekanntes Unternehmen",
    historyNotice: "Ältere Anfragen, die vor der Aktivierung des Verlaufs gesendet wurden, sind möglicherweise nicht sichtbar.",
    browseOffers: "Angebote durchsuchen",
  },
  es: {
    title: "Consultas enviadas",
    subtitle: "Consultas enviadas por usted a otras empresas.",
    emptyTitle: "No hay consultas enviadas",
    emptyDescription: "Aún no ha enviado ninguna consulta a empresas en el portal.",
    backToDashboard: "Volver al panel",
    statusSent: "enviada",
    statusRead: "leída",
    statusArchived: "archivada",
    offer: "Oferta",
    recipient: "Destinatario",
    date: "Fecha de envío",
    message: "Mensaje de consulta",
    statusLabel: "Estado",
    back: "Volver",
    companyPanel: "Panel de empresa",
    viewOffer: "Ver oferta",
    recipientProfile: "Perfil del destinatario",
    branchService: "Sector / Servicio",
    fallbackOfferTitle: "Consulta",
    fallbackCompanyName: "Empresa desconocida",
    historyNotice: "Es posible que las consultas más antiguas enviadas antes de habilitar el historial no sean visibles.",
    browseOffers: "Buscar ofertas",
  },
  fr: {
    title: "Demandes envoyées",
    subtitle: "Demandes envoyées par vous à d'autres entreprises.",
    emptyTitle: "Aucune demande envoyée",
    emptyDescription: "Vous n'avez pas encore envoyé de demande à des entreprises sur le portail.",
    backToDashboard: "Retour au tableau de bord",
    statusSent: "envoyée",
    statusRead: "lue",
    statusArchived: "archivée",
    offer: "Offre",
    recipient: "Destinataire",
    date: "Date d'envoi",
    message: "Message de demande",
    statusLabel: "Statut",
    back: "Retour",
    companyPanel: "Panel entreprise",
    viewOffer: "Voir l'offre",
    recipientProfile: "Profil du destinataire",
    branchService: "Secteur / Service",
    fallbackOfferTitle: "Demande",
    fallbackCompanyName: "Entreprise inconnue",
    historyNotice: "Les demandes plus anciennes envoyées avant l'activation de l'historique peuvent ne pas être visibles.",
    browseOffers: "Parcourir les offres",
  },
  uk: {
    title: "Надіслані запити",
    subtitle: "Запити пропозицій, надіслані вами іншим компаніям.",
    emptyTitle: "Немає надісланих запитів",
    emptyDescription: "Ви ще не надсилали жодних запитів пропозицій компаніям на порталі.",
    backToDashboard: "Назад до панелі",
    statusSent: "надіслано",
    statusRead: "прочитано",
    statusArchived: "архівовано",
    offer: "Пропозиція",
    recipient: "Отримувач",
    date: "Дата надсилання",
    message: "Текст запиту",
    statusLabel: "Статус",
    back: "Назад",
    companyPanel: "Панель компанії",
    viewOffer: "Переглянути пропозицію",
    recipientProfile: "Профіль отримувача",
    branchService: "Галузь / Послуга",
    fallbackOfferTitle: "Запит пропозиції",
    fallbackCompanyName: "Невідома компанія",
    historyNotice: "Старіші запити, надіслані до ввімкнення історії, можуть бути невидимими.",
    browseOffers: "Переглянути пропозиції",
  },
};

function formatDate(value: string | null, locale: string) {
  if (!value) {
    return "";
  }

  const localeCode = locale === "pl" ? "pl-PL" : "en-US";
  return new Intl.DateTimeFormat(localeCode, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusLabel(recipientReadAt: string | null, status: string, t: LocalizedCopy) {
  if (status === "archived") {
    return t.statusArchived;
  }
  if (recipientReadAt) {
    return t.statusRead;
  }
  return t.statusSent;
}

function getStatusBadgeClass(recipientReadAt: string | null, status: string) {
  if (status === "archived") {
    return "bg-slate-100 text-slate-500";
  }
  if (recipientReadAt) {
    return "bg-slate-100 text-slate-600";
  }
  return "bg-red-50 text-red-700";
}

export default async function SentInquiriesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const locale = getPanelLocale();
  const t = LOCALIZED[locale] || LOCALIZED.pl;

  if (!user) {
    redirect("/logowanie");
  }

  // 1. Fetch inquiries where sender_id = user.id, limit 50, order by created_at desc
  const { data: inquiries, error: inquiriesError } = await supabase
    .from("inquiries")
    .select("id, created_at, status, recipient_read_at, message, offer_id, company_id")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (inquiriesError) {
    console.error("Error fetching sent inquiries:", inquiriesError);
  }

  const items = inquiries ?? [];

  // 2. Extract unique offer_ids and company_ids for parallel fetch
  const offerIds = Array.from(new Set(items.map((i) => i.offer_id).filter(Boolean))) as string[];
  const companyIds = Array.from(new Set(items.map((i) => i.company_id).filter(Boolean))) as string[];

  // 3. Fetch public details in parallel
  const [offersResult, companiesResult] = await Promise.all([
    offerIds.length > 0
      ? supabase
          .from("offers")
          .select("id, title, slug, branch, service_type, status")
          .in("id", offerIds)
      : { data: null, error: null },
    companyIds.length > 0
      ? supabase
          .from("companies")
          .select("id, name, slug")
          .in("id", companyIds)
      : { data: null, error: null },
  ]);

  if (offersResult.error) {
    console.error("Error fetching offers details:", offersResult.error);
  }
  if (companiesResult.error) {
    console.error("Error fetching companies details:", companiesResult.error);
  }

  const offersMap = new Map(offersResult.data?.map((o) => [o.id, o]) ?? []);
  const companiesMap = new Map(companiesResult.data?.map((c) => [c.id, c]) ?? []);

  // 4. Map the components
  const mappedInquiries = items.map((inquiry) => {
    const offer = inquiry.offer_id ? offersMap.get(inquiry.offer_id) : null;
    const company = inquiry.company_id ? companiesMap.get(inquiry.company_id) : null;

    return {
      ...inquiry,
      offer,
      company,
    };
  });

  return (
    <>
      <PanelNavbar />
      <main className="bg-slate-50 pt-[128px]">
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          {/* Header */}
          <div className="mb-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
              {t.companyPanel}
            </p>
            <h1 className="text-3xl font-extrabold text-slate-900">
              {t.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              {t.subtitle}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {t.historyNotice}
            </p>
            <Link
              href="/panel"
              className="mt-5 inline-flex text-sm font-bold text-[#1a5f3c] no-underline hover:underline"
            >
              <i className="fas fa-arrow-left mr-2 mt-1 text-xs"></i>
              {t.back}
            </Link>
          </div>

          {/* List or Empty State */}
          {mappedInquiries.length > 0 ? (
            <div className="space-y-5">
              {mappedInquiries.map((inquiry) => {
                const offerPath =
                  inquiry.offer?.status === "active" && inquiry.offer?.slug
                    ? getLocalizedPath(`/oferty/${inquiry.offer.slug}`, locale)
                    : null;

                const companyPath = inquiry.company?.slug
                  ? getLocalizedPath(`/firmy/${inquiry.company.slug}`, locale)
                  : null;

                return (
                  <article
                    key={inquiry.id}
                    className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    {/* Header line of the item */}
                    <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusBadgeClass(
                              inquiry.recipient_read_at,
                              inquiry.status
                            )}`}
                          >
                            {getStatusLabel(inquiry.recipient_read_at, inquiry.status, t)}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            {formatDate(inquiry.created_at, locale)}
                          </span>
                        </div>

                        <h2 className="break-words text-xl font-extrabold text-slate-900">
                          {inquiry.offer?.title || t.fallbackOfferTitle}
                        </h2>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        {offerPath && (
                          <Link
                            href={offerPath}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-[#1a5f3c] no-underline transition hover:bg-slate-50"
                          >
                            <i className="fas fa-eye text-[10px]"></i>
                            {t.viewOffer}
                          </Link>
                        )}
                        {companyPath && (
                          <Link
                            href={companyPath}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-[#1a5f3c] no-underline transition hover:bg-slate-50"
                          >
                            <i className="fas fa-building text-[10px]"></i>
                            {t.recipientProfile}
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Metadata fields */}
                    <div className="mt-6 grid min-w-0 gap-4 md:grid-cols-2">
                      <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                          {t.recipient}
                        </p>
                        {companyPath ? (
                          <Link
                            href={companyPath}
                            className="break-words text-sm font-bold text-[#1a5f3c] no-underline hover:underline"
                          >
                            {inquiry.company?.name || t.fallbackCompanyName}
                          </Link>
                        ) : (
                          <p className="break-words text-sm font-bold text-slate-900">
                            {inquiry.company?.name || t.fallbackCompanyName}
                          </p>
                        )}
                      </div>

                      <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                          {t.branchService}
                        </p>
                        <p className="break-words text-sm font-bold text-slate-900">
                          {inquiry.offer?.branch || "-"} / {inquiry.offer?.service_type || "-"}
                        </p>
                      </div>
                    </div>

                    {/* Message content */}
                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        {t.message}
                      </p>
                      <p className="whitespace-pre-line break-words text-sm leading-7 text-slate-700">
                        {inquiry.message}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <i className="fas fa-paper-plane text-2xl"></i>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {t.emptyTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {t.emptyDescription}
              </p>
              <div className="mt-6">
                <Link
                  href={getLocalizedPath("/oferty", locale)}
                  className="inline-flex items-center justify-center rounded-xl bg-[#1a5f3c] px-4 py-2.5 text-sm font-bold text-white no-underline transition hover:bg-[#164f32]"
                >
                  {t.browseOffers}
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

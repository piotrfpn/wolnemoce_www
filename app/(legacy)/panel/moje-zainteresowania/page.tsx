import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { createClient } from "@/lib/supabase/server";
import { getPanelLocale } from "@/lib/i18n/panelLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getEffectiveCapacityRequestStatus } from "@/lib/capacityRequestStatus";
import { getCapacityRequestStatusClass } from "@/lib/capacityRequests";

export const metadata: Metadata = {
  title: "Moje zainteresowania | WolneMoce",
};

type MyCapacityRequestInterest = {
  interest_id: string;
  capacity_request_id: string;
  interested_at: string;
  interest_status: string;
  request_title: string;
  request_slug: string;
  request_branch: string;
  request_service_type: string;
  request_location: string | null;
  request_preferred_region: string | null;
  request_status: string;
  request_expires_at: string;
};

const getStatusLabel = (status: string, t: any) => {
  switch (status) {
    case "draft": return t.statusDraft;
    case "pending": return t.statusPending;
    case "active": return t.statusActive;
    case "rejected": return t.statusRejected;
    case "expired": return t.statusExpired;
    case "archived": return t.statusArchived;
    default: return status;
  }
};

const formatDate = (dateString: string, loc: string) => {
  const date = new Date(dateString);
  const localeMap: Record<string, string> = {
    pl: "pl-PL",
    en: "en-GB",
    de: "de-DE",
    uk: "uk-UA",
    es: "es-ES",
    fr: "fr-FR",
  };
  const intlLocale = localeMap[loc] || "pl-PL";
  return new Intl.DateTimeFormat(intlLocale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

export default async function MyInterestsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logowanie");
  }

  const { data: interestsData, error } = await supabase.rpc("get_my_capacity_request_interests");

  if (error) {
    console.error("Failed to load user capacity request interests.", error);
  }

  const interests = (interestsData ?? []) as MyCapacityRequestInterest[];
  const now = new Date();
  const locale = getPanelLocale();
  const dict = getDictionary(locale);
  const t = dict.panel.myInterests;

  return (
    <>
      <PanelNavbar />
      <main className="bg-slate-50 pt-[128px] min-h-screen">
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="mb-8 flex min-w-0 flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold text-slate-900">
                {t.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                {t.description}
              </p>
            </div>
          </div>

          {error ? (
             <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8 text-center">
              <h2 className="text-xl font-extrabold text-slate-900">
                {t.loadError}
              </h2>
            </div>
          ) : interests.length === 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <i className="fas fa-handshake text-2xl"></i>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {t.emptyStateTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t.emptyStateDescription}
              </p>
            </div>
          ) : (
            <div className="grid min-w-0 gap-5">
              {interests.map((interest) => {
                const effectiveStatus = getEffectiveCapacityRequestStatus({
                  status: interest.request_status,
                  expiresAt: interest.request_expires_at,
                  now,
                });
                const statusClass = getCapacityRequestStatusClass(effectiveStatus);
                const isActive = effectiveStatus === "active";

                return (
                  <article
                    key={interest.interest_id}
                    className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${statusClass}`}>
                            <i className="fas fa-circle"></i>
                            {getStatusLabel(effectiveStatus, t)}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            {t.interestedAt}: {formatDate(interest.interested_at, locale)}
                          </span>
                        </div>
                        <h2 className="break-words text-lg font-extrabold text-slate-900">
                          {interest.request_title}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {interest.request_branch} · {interest.request_service_type}
                          {interest.request_location ? ` · ${interest.request_location}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0">
                        {isActive ? (
                          <Link href={`/zapytania/${interest.request_slug}`} className="btn btn-primary whitespace-nowrap w-full sm:w-auto text-center">
                            {t.viewRequest}
                          </Link>
                        ) : (
                          <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500 text-center w-full sm:w-auto">
                            {t.requestNotActive}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}

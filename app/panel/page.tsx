import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import LogoutButton from "@/components/LogoutButton";
import PanelNavbar from "@/components/PanelNavbar";
import { createClient } from "@/lib/supabase/server";
import { getOfferLimitDisplay } from "@/lib/planEntitlements";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getPanelLocale } from "@/lib/i18n/panelLocale";

export const metadata: Metadata = {
  title: "Panel firmy",
  description: "Panel użytkownika WolneMoce.",
};

type InterestPluralLabels = {
  myRequestsInterestSingular: string;
  myRequestsInterestFew: string;
  myRequestsInterestMany: string;
};

function getPolishInterestLabel(count: number): string {
  const absolute = Math.abs(count);
  const lastDigit = absolute % 10;
  const lastTwoDigits = absolute % 100;

  if (absolute === 1) {
    return "zainteresowanie";
  }

  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)) {
    return "zainteresowania";
  }

  return "zainteresowań";
}

function getInterestLabel(count: number, locale: string, labels: InterestPluralLabels): string {
  if (locale === "pl") {
    return getPolishInterestLabel(count);
  }

  return count === 1
    ? labels.myRequestsInterestSingular
    : labels.myRequestsInterestMany;
}

export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const locale = getPanelLocale();
  const dictionary = getDictionary(locale);
  const t = dictionary.panel.dashboard;
  const tc = dictionary.panel.common;

  const panelItems = [
    {
      title: dictionary.panel.profile.title,
      description: dictionary.panel.profile.subtitle,
      icon: "fas fa-building",
      href: "/panel/profil",
      cta: t.goToProfile,
    },
    {
      title: dictionary.panel.offers.title,
      description: dictionary.panel.offers.subtitle,
      icon: "fas fa-list-check",
      href: "/panel/oferty",
      cta: t.goToOffers,
    },
    {
      title: "Przykłady realizacji",
      description: "Zarządzaj przykładami wykonanych projektów swojej firmy.",
      icon: "fas fa-briefcase",
      href: "/panel/realizacje",
      cta: "Przejdź do realizacji",
    },
    {
      title: dictionary.panel.inquiries.title,
      description: dictionary.panel.inquiries.subtitle,
      icon: "fas fa-inbox",
      href: "/panel/zapytania",
      cta: t.goToInquiries,
    },
    {
      title: dictionary.panel.settings.title,
      description: dictionary.panel.settings.subtitle,
      icon: "fas fa-gear",
      href: "/panel/ustawienia",
      cta: t.settings,
    },
  ];

  const adminPanelItem = {
    title: "ADMIN",
    description: t.adminCard,
    icon: "fas fa-user-shield",
    href: "/admin",
    cta: "Przejdź do admina",
  };

  const offerStatusCards = [
    {
      key: "active",
      title: t.activeOffers,
      description: "Widoczne publicznie",
      icon: "fas fa-circle-check",
      className: "bg-emerald-50 text-emerald-700",
    },
    {
      key: "pending",
      title: t.pendingOffers,
      description: "Czekają na akceptację",
      icon: "fas fa-clock",
      className: "bg-amber-50 text-amber-700",
    },
    {
      key: "rejected",
      title: t.rejectedOffers,
      description: "Wymagają poprawek",
      icon: "fas fa-triangle-exclamation",
      className: "bg-red-50 text-red-700",
    },
    {
      key: "archived",
      title: t.archivedOffers,
      description: "Niewidoczne publicznie",
      icon: "fas fa-box-archive",
      className: "bg-slate-100 text-slate-600",
    },
  ] as const;

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

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, plan, custom_active_pending_offer_limit, is_verified, regon, location_city, location_voivodeship, plan_config(*)")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: offers } = company?.id
    ? await supabase.from("offers").select("status").eq("company_id", company.id)
    : { data: [] };

  const { count: newInquiriesCount } = company?.id
    ? await supabase
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .eq("company_id", company.id)
        .neq("status", "archived")
        .is("recipient_read_at", null)
    : { count: 0 };

  const { data: capacityRequestStatusCounts } = company?.id
    ? await supabase.rpc("count_my_capacity_requests_by_status", {
        p_company_id: company.id,
      })
    : { data: [] };

  const {
    data: activeCapacityRequestInterestsCountResult,
    error: activeCapacityRequestInterestsCountError,
  } = company?.id
    ? await supabase.rpc("count_my_active_capacity_request_interests")
    : { data: 0, error: null };

  if (activeCapacityRequestInterestsCountError) {
    console.warn("Failed to count active capacity request interests for panel.", {
      code: activeCapacityRequestInterestsCountError.code,
    });
  }

  const offerCounts = {
    draft: 0,
    pending: 0,
    active: 0,
    rejected: 0,
    archived: 0,
  };

  (offers ?? []).forEach((offer) => {
    const status = offer.status as keyof typeof offerCounts;
    if (status in offerCounts) {
      offerCounts[status] += 1;
    }
  });

  const capacityRequestStatusCount = capacityRequestStatusCounts?.[0];
  const capacityRequestCounts = {
    pending: Number(capacityRequestStatusCount?.pending_count ?? 0),
    rejected: Number(capacityRequestStatusCount?.rejected_count ?? 0),
  };
  const activeCapacityRequestInterestsCount = Number(
    activeCapacityRequestInterestsCountResult ?? 0
  );
  const activeCapacityRequestInterestsLabel = `${activeCapacityRequestInterestsCount} ${getInterestLabel(
    activeCapacityRequestInterestsCount,
    locale,
    t
  )}`;

  const plan = company?.plan ?? "free";
  const activePendingCount = offerCounts.active + offerCounts.pending;

  // Zależnie od tego, czy Supabase zagnieździ plan_config jako tablicę, czy obiekt:
  const planConfigObj = Array.isArray(company?.plan_config)
    ? company.plan_config[0]
    : company?.plan_config;
  const planLimit = planConfigObj?.max_active_pending_offers;

  const { limit, source, isUnlimited, normalizedPlan } = getOfferLimitDisplay({
    plan,
    customLimit: company?.custom_active_pending_offer_limit,
    planLimit,
    activePendingCount
  });

  const limitPercent = isUnlimited || !limit ? 0 : Math.min(100, Math.round((activePendingCount / limit) * 100));
  const isLimitExceeded = !isUnlimited && limit !== null && activePendingCount >= limit;

  const profileStatus = !company
    ? {
        label: dictionary.panel.dashboard.notVerifiedCompany,
        description: dictionary.panel.profile.subtitle,
        className: "bg-amber-50 text-amber-700",
      }
    : company.is_verified
      ? {
          label: t.verifiedCompany,
          description: t.verifiedCompanyDescription,
          className: "bg-emerald-50 text-emerald-700",
        }
      : company.regon || company.location_city || company.location_voivodeship
        ? {
            label: dictionary.panel.profile.submittedForModeration,
            description: t.submittedForModerationDescription,
            className: "bg-slate-100 text-slate-700",
          }
        : {
            label: dictionary.panel.dashboard.notVerifiedCompany,
            description: dictionary.panel.profile.subtitle,
            className: "bg-amber-50 text-amber-700",
          };

  const visiblePanelItems =
    profile?.role === "admin" ? [...panelItems, adminPanelItem] : panelItems;

  return (
    <>
      <PanelNavbar />
      <main className="bg-slate-50 pt-[128px]">
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="mb-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex min-w-0 flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  {dictionary.nav.panel}
                </p>
                <h1 className="text-3xl font-extrabold text-slate-900">
                  {t.title}
                </h1>
                <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <p className="min-w-0 break-words">
                    <strong className="text-slate-900">{t.email}:</strong>{" "}
                    {user.email}
                  </p>
                  <p className="min-w-0">
                    <strong className="text-slate-900">{t.role}:</strong>{" "}
                    {profile?.role ?? "user"}
                  </p>
                  <p className="min-w-0">
                    <strong className="text-slate-900">{t.plan}:</strong>{" "}
                    {normalizedPlan}
                  </p>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>

          <div className="mb-6 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {offerStatusCards.map((item) => (
              <div
                key={item.key}
                className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.className}`}
                  >
                    <i className={item.icon}></i>
                  </span>
                  <strong className="text-2xl font-extrabold text-slate-900">
                    {offerCounts[item.key]}
                  </strong>
                </div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  {item.title}
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {item.description}
                </p>
              </div>
            ))}

            <div className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    (newInquiriesCount ?? 0) > 0
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <i className="fas fa-envelope-open-text"></i>
                </span>
                <strong className="text-2xl font-extrabold text-slate-900">
                  {newInquiriesCount ?? 0}
                </strong>
              </div>
              <h2 className="text-sm font-extrabold text-slate-900">
                {t.unreadInquiries}
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                RFQ oczekujące na odpowiedź
              </p>
            </div>
          </div>

          <div className="mb-8 grid min-w-0 gap-5 lg:grid-cols-3">
            <div className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                  <i className="fas fa-gauge-high"></i>
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {t.offerLimit}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {isUnlimited ? (
                      <>
                        Brak globalnego limitu ofert w Twoim planie
                      </>
                    ) : (
                      <>
                        {activePendingCount} / {limit} ofert aktywnych lub oczekujących
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              {!isUnlimited && limit !== null && (
                <div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLimitExceeded ? "bg-amber-500" : "bg-[#1a5f3c]"
                      }`}
                      style={{ width: `${limitPercent}%` }}
                    />
                  </div>
                  
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    {source === "custom" 
                      ? "Indywidualny limit ustawiony dla Twojej firmy."
                      : `Limit planu ${normalizedPlan}. Do limitu liczą się oferty aktywne i oczekujące.`}
                  </p>
                  
                  {isLimitExceeded ? (
                    <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                      Przekroczono aktualny limit. Zarchiwizuj część ofert albo skontaktuj się z administratorem.
                    </p>
                  ) : null}
                </div>
              )}
              {isUnlimited && (
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Plan {normalizedPlan}
                </p>
              )}
            </div>

            <Link
              href="/panel/profil"
              className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-6 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-[#1a5f3c] hover:shadow-md"
            >
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                  <i className="fas fa-id-card"></i>
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {t.companyProfile}
                  </h2>
                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${profileStatus.className}`}
                  >
                    {profileStatus.label}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-500">
                {profileStatus.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c]">
                Zaktualizuj dane rejestrowe
                <i className="fas fa-arrow-right text-xs"></i>
              </span>
            </Link>

            <Link
              href="/panel/moje-zapytania"
              className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-6 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-[#1a5f3c] hover:shadow-md"
            >
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                  <i className="fas fa-clipboard-list"></i>
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {t.myRequestsTitle}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {t.myRequestsDescription}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-amber-50 px-3 py-2.5">
                  <span className="min-w-0 text-xs font-semibold leading-tight text-amber-800">
                    w moderacji
                  </span>
                  <strong className="shrink-0 text-lg font-extrabold leading-none tabular-nums text-amber-800">
                    {capacityRequestCounts.pending}
                  </strong>
                </div>
                <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-red-50 px-3 py-2.5">
                  <span className="min-w-0 text-xs font-semibold leading-tight text-red-700">
                    odrzucone
                  </span>
                  <strong className="shrink-0 text-lg font-extrabold leading-none tabular-nums text-red-700">
                    {capacityRequestCounts.rejected}
                  </strong>
                </div>
                <div
                  className={`flex min-w-0 items-center justify-between gap-3 rounded-xl px-3 py-2.5 ${
                    activeCapacityRequestInterestsCount > 0
                      ? "bg-emerald-50"
                      : "bg-slate-100"
                  }`}
                >
                  <span
                    className={`min-w-0 text-xs font-semibold leading-tight ${
                      activeCapacityRequestInterestsCount > 0
                        ? "text-emerald-700"
                        : "text-slate-600"
                    }`}
                  >
                    {t.myRequestsActiveInterests}
                  </span>
                  <strong
                    className={`shrink-0 text-lg font-extrabold leading-none tabular-nums ${
                      activeCapacityRequestInterestsCount > 0
                        ? "text-emerald-700"
                        : "text-slate-600"
                    }`}
                  >
                    {activeCapacityRequestInterestsCount}
                  </strong>
                </div>
              </div>

              {capacityRequestCounts.rejected > 0 ? (
                <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
                  Masz odrzucone zapytanie produkcyjne wymagające poprawy.
                </p>
              ) : null}

              {activeCapacityRequestInterestsCount > 0 ? (
                <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                  {t.myRequestsInterestNotice}{" "}
                  <span className="font-bold">
                    {activeCapacityRequestInterestsLabel}
                  </span>
                  .
                </p>
              ) : null}

              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c]">
                {t.goToMyRequests}
                <i className="fas fa-arrow-right text-xs"></i>
              </span>
            </Link>
          </div>

          <div className="grid min-w-0 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visiblePanelItems.map((item) => {
              const isInquiriesCard = item.href === "/panel/zapytania";
              const inquiryBadge =
                (newInquiriesCount ?? 0) > 0
                  ? `${newInquiriesCount} nowych`
                  : "Brak nowych zapytań";
              const card = (
                <>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                      <i className={item.icon}></i>
                    </div>
                    {isInquiriesCard ? (
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                          (newInquiriesCount ?? 0) > 0
                            ? "bg-red-50 text-red-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {inquiryBadge}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {item.href ? item.title : `${item.title} — wkrótce`}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                  {item.href ? (
                    <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-[#1a5f3c]">
                      {item.cta}
                      <i className="fas fa-arrow-right text-xs"></i>
                    </span>
                  ) : null}
                </>
              );

              return item.href ? (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex h-full min-w-0 flex-col rounded-[20px] border border-slate-200 bg-white p-6 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-[#1a5f3c] hover:shadow-md"
                >
                  {card}
                </Link>
              ) : (
                <div
                  key={item.title}
                  className="flex h-full min-w-0 flex-col rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm"
                >
                  {card}
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

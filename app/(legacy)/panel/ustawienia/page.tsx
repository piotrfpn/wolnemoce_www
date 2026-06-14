import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import LogoutButton from "@/components/LogoutButton";
import PanelNavbar from "@/components/PanelNavbar";
import { contactInfo } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getPanelLocale } from "@/lib/i18n/panelLocale";
import AccountSettingsForm from "./AccountSettingsForm";

export const metadata: Metadata = {
  title: "Ustawienia konta",
  description: "Ustawienia konta użytkownika WolneMoce.",
};

export const dynamic = "force-dynamic";

export default async function AccountSettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logowanie");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, phone, contact_email")
    .eq("id", user.id)
    .maybeSingle();

  const locale = getPanelLocale();
  const dictionary = getDictionary(locale);
  const t = dictionary.panel.settings;
  const tc = dictionary.panel.common;
  const tProfile = dictionary.panel.profile;
  const accountDeletionMailto = `mailto:${contactInfo.email}?subject=${encodeURIComponent(
    t.accountDeletionMailSubject,
  )}`;

  return (
    <>
      <PanelNavbar />
      <main className="bg-slate-50 pt-[128px]">
        <section className="mx-auto max-w-[1100px] px-6 py-16">
          <div className="mb-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <Link
              href="/panel"
              className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline"
            >
              <i className="fas fa-arrow-left text-xs"></i>
              {tc.back}
            </Link>
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
              {tc.companyPanel}
            </p>
            <h1 className="text-3xl font-extrabold text-slate-900">
              {t.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              {t.subtitle}
            </p>
          </div>

          <div className="grid min-w-0 gap-6 lg:grid-cols-[1fr_0.9fr]">
            <AccountSettingsForm
              initialFullName={profile?.full_name ?? ""}
              initialPhone={profile?.phone ?? ""}
              initialContactEmail={profile?.contact_email ?? ""}
              email={user.email ?? ""}
              t={t}
            />

            <div className="min-w-0 space-y-6">
              <section className="min-w-0 rounded-[24px] border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                    <i className="fas fa-circle-check"></i>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                    <i className="fas fa-check-circle text-[11px]"></i>
                    Zalogowany
                  </span>
                </div>
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  Status konta
                </p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Aktywna sesja
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Twoje konto jest aktywne i masz dostęp do panelu użytkownika.
                </p>
                <dl className="mt-5 grid min-w-0 gap-3">
                  <div className="min-w-0 rounded-2xl bg-emerald-50/80 p-4">
                    <dt className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                      Status konta
                    </dt>
                    <dd className="text-sm font-bold text-slate-900">
                      Aktywne
                    </dd>
                  </div>
                  <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
                    <dt className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Zalogowany jako
                    </dt>
                    <dd className="break-words text-sm font-bold text-slate-900">
                      {user.email ?? "Brak e-maila"}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                  <i className="fas fa-shield-halved"></i>
                </div>
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  Bezpieczeństwo
                </p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {t.passwordSettings}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Hasło i logowanie obsługiwane są przez Supabase Auth.
                </p>
                <Link href="/panel/ustawienia/haslo" className="btn btn-outline mt-6">
                  {t.changePassword}
                </Link>
              </section>

              <section className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                  <i className="fas fa-right-from-bracket"></i>
                </div>
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  Sesja
                </p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Aktywna sesja
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Wylogowanie zakończy bieżącą sesję i przeniesie Cię na stronę
                  główną.
                </p>
                <div className="mt-6">
                  <LogoutButton />
                </div>
              </section>
            </div>
          </div>

          <div className="mt-6 grid min-w-0 gap-6 md:grid-cols-2">
            <section className="min-w-0 rounded-[24px] border border-slate-200 bg-slate-100/70 p-6 opacity-75 shadow-sm md:p-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-500">
                  <i className="fas fa-bell"></i>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Wkrótce
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-700">
                Powiadomienia
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Wkrótce dodamy ustawienia powiadomień e-mail, m.in.
                powiadomienia o nowych RFQ i statusach ofert.
              </p>
            </section>

            <section className="min-w-0 rounded-[24px] border border-amber-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <i className="fas fa-user-xmark"></i>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
                  {t.accountDeletionStatus}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {t.accountDeletionTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {t.accountDeletionDescription}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {t.accountDeletionContactInstruction}{" "}
                <a
                  href={accountDeletionMailto}
                  className="font-bold text-[#1a5f3c] no-underline hover:underline"
                >
                  {contactInfo.email}
                </a>
                .
              </p>
              <p className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
                {t.accountDeletionTimeframe}
              </p>
              <a href={accountDeletionMailto} className="btn btn-outline mt-6">
                {t.accountDeletionCta}
              </a>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

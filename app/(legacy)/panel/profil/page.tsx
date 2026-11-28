import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPanelLocale } from "@/lib/i18n/panelLocale";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import type { Database } from "@/lib/database.types";
import { getSafeNextPath } from "@/lib/safeNextPath";
import { createClient } from "@/lib/supabase/server";
import CompanyCertificatesSection from "./CompanyCertificatesSection";
import CompanyProfileFormClient from "./CompanyProfileFormClient";
import { getDictionary } from "@/lib/i18n/getDictionary";

type CompanyCertificate =
  Database["public"]["Tables"]["company_certificates"]["Row"];

type CompanyProfilePageProps = {
  searchParams?: {
    next?: string | string[];
  };
};

export const metadata: Metadata = {
  title: "Profil firmy",
  description: "Uzupełnij profil firmy w panelu WolneMoce.",
};

export const dynamic = "force-dynamic";

export default async function CompanyProfilePage({
  searchParams,
}: CompanyProfilePageProps) {
  const locale = getPanelLocale();
  const dictionary = getDictionary(locale);
  const t = dictionary.panel.profile;
  const tc = dictionary.panel.common;
  const rawNext = Array.isArray(searchParams?.next)
    ? searchParams?.next[0]
    : searchParams?.next;
  const safeNextPath = getSafeNextPath(rawNext, "");

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

  const { data: companyData } = await supabase
    .from("companies")
    .select(
      "id, slug, nip, name, description, industry, industries, service_types, location_voivodeship, location_city, location_postal_code, location_street, location_full_address, regon, krs, legal_form, business_status, primary_pkd, pkd_codes, is_verified, website_url, presentation_path, presentation_file_name, presentation_mime_type, presentation_size_bytes, presentation_uploaded_at, country_code, tax_id, registration_number, registered_address, company_contact_settings(contact_email)"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const company = companyData
    ? {
        ...companyData,
        contact_email: Array.isArray((companyData as any).company_contact_settings)
          ? (companyData as any).company_contact_settings[0]?.contact_email ?? null
          : (companyData as any).company_contact_settings?.contact_email ?? null,
      }
    : null;

  let certificates: CompanyCertificate[] = [];

  if (company?.id) {
    const { data: certificatesData } = await supabase
      .from("company_certificates")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    certificates = (certificatesData ?? []) as CompanyCertificate[];
  }

  const showOnboardingSteps = !company || safeNextPath === "/panel/oferty/nowa";

  return (
    <>
      <PanelNavbar />
      <main className="bg-slate-50 pt-[128px]">
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="mb-8">
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
              {dictionary.panel.dashboard.title}
            </p>
            <h1 className="text-3xl font-extrabold text-slate-900">
              {t.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              {t.subtitle}
            </p>

            {showOnboardingSteps ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl border border-[#1a5f3c]/30 bg-emerald-50 px-4 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a5f3c] text-xs font-extrabold text-white">
                      1
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[#1a5f3c]">
                        {t.onboardingStep1Badge}
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {t.onboardingStep1Title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-extrabold text-slate-600">
                      2
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {t.onboardingStep2Badge}
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {t.onboardingStep2Title}
                      </p>
                    </div>
                  </div>
                </div>

                {safeNextPath === "/panel/oferty/nowa" ? (
                  <p className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-800">
                    <i className="fas fa-arrow-right text-[#1a5f3c]"></i>
                    <span>{t.onboardingRedirectHint}</span>
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <CompanyProfileFormClient
            userId={user.id}
            userEmail={user.email ?? null}
            profile={profile}
            company={company}
            dict={t}
            dictCommon={tc}
            nextPath={safeNextPath}
          />

          {company?.id ? (
            <CompanyCertificatesSection
              companyId={company.id}
              initialCertificates={certificates}
              dict={t}
            />
          ) : (
            <section className="mt-8 rounded-[24px] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 shadow-sm md:p-8">
              {t.certificatesSaveFirst}
            </section>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

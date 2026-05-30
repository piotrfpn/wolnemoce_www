import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPanelLocale } from "@/lib/i18n/panelLocale";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import CompanyCertificatesSection from "./CompanyCertificatesSection";
import CompanyProfileFormClient from "./CompanyProfileFormClient";
import { getDictionary } from "@/lib/i18n/getDictionary";

type CompanyCertificate =
  Database["public"]["Tables"]["company_certificates"]["Row"];

export const metadata: Metadata = {
  title: "Profil firmy",
  description: "Uzupełnij profil firmy w panelu WolneMoce.pl.",
};

export const dynamic = "force-dynamic";

export default async function CompanyProfilePage() {
  const locale = getPanelLocale();
  const dictionary = getDictionary(locale);
  const t = dictionary.panel.profile;
  const tc = dictionary.panel.common;

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
      "id, slug, nip, name, description, industry, industries, service_types, location_voivodeship, location_city, location_postal_code, location_street, location_full_address, regon, krs, legal_form, business_status, primary_pkd, pkd_codes, is_verified, website_url, presentation_path, presentation_file_name, presentation_mime_type, presentation_size_bytes, presentation_uploaded_at, company_contact_settings(contact_email)"
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

  return (
    <>
      <PanelNavbar />
      <main className="bg-slate-50 pt-[72px]">
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
          </div>

          <CompanyProfileFormClient
            userId={user.id}
            userEmail={user.email ?? null}
            profile={profile}
            company={company}
            dict={t}
            dictCommon={tc}
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

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";
import AdminCompanyVerificationClient from "./AdminCompanyVerificationClient";
import AdminCompanyPlanClient from "./AdminCompanyPlanClient";
import AdminCompanyOfferLimitClient from "./AdminCompanyOfferLimitClient";

export const metadata: Metadata = {
  title: "Szczegóły firmy - Admin",
  description: "Weryfikacja firmy w panelu admina WolneMoce.pl.",
};

type PkdCodesValue = Database["public"]["Tables"]["companies"]["Row"]["pkd_codes"];

type PkdCode = {
  code: string;
  name: string;
};

function isPkdCode(value: unknown): value is PkdCode {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.code === "string" && typeof candidate.name === "string";
}

function getPkdCodes(value: PkdCodesValue) {
  return Array.isArray(value) ? value.filter(isPkdCode) : [];
}

export default async function AdminCompanyDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logowanie");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/panel");
  }

  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !company) {
    return (
      <div className="p-8 text-center text-red-600">
        Nie udało się załadować firmy.
      </div>
    );
  }

  const { data: reviews } = await supabase
    .from("company_verification_reviews")
    .select("verification_note, verified_at")
    .eq("company_id", company.id)
    .order("verified_at", { ascending: false })
    .limit(1);

  const latestReview = reviews && reviews.length > 0 ? reviews[0] : null;
  const pkdCodes = getPkdCodes(company.pkd_codes);

  const { data: planHistory } = await supabase
    .from("company_plan_changes")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: limitHistory } = await supabase
    .from("company_entitlement_changes")
    .select("*")
    .eq("company_id", company.id)
    .eq("field_name", "custom_active_pending_offer_limit")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <>
      <PanelNavbar />
      <main className="bg-slate-50 pt-[72px] min-h-screen">
        <section className="mx-auto max-w-[1000px] px-6 py-16">
          <Link
            href="/admin/firmy"
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#1a5f3c]"
          >
            <i className="fas fa-arrow-left"></i>
            Wróć do listy firm
          </Link>

          <h1 className="mb-8 text-3xl font-extrabold text-slate-900">
            {company.name}
          </h1>

          <div className="grid gap-8 md:grid-cols-2 mb-8">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                <i className="fas fa-building text-slate-400 mr-2"></i>
                Dane rejestrowe
              </h2>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <strong className="text-slate-900">NIP:</strong> {company.nip || "-"}
                </li>
                <li>
                  <strong className="text-slate-900">REGON:</strong> {company.regon || "-"}
                </li>
                <li>
                  <strong className="text-slate-900">KRS:</strong> {company.krs || "-"}
                </li>
                <li>
                  <strong className="text-slate-900">Forma prawna:</strong>{" "}
                  {company.legal_form || "-"}
                </li>
                <li>
                  <strong className="text-slate-900">Status w GUS:</strong>{" "}
                  {company.business_status || "-"}
                </li>
                <li>
                  <strong className="text-slate-900">Adres siedziby:</strong>{" "}
                  {company.location_full_address || "-"}
                </li>
              </ul>

              <h3 className="mt-6 mb-3 font-bold text-slate-900 text-sm uppercase tracking-wide">
                Kody PKD
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <strong className="text-slate-900">Główny PKD:</strong>{" "}
                  {company.primary_pkd || "-"}
                </li>
                {pkdCodes.length > 0 && (
                  <li>
                    <strong className="text-slate-900">Wszystkie kody:</strong>
                    <div className="mt-1 max-h-32 overflow-y-auto rounded-md bg-slate-50 p-2 text-xs border border-slate-200">
                      {pkdCodes.map((pkd) => (
                        <div key={pkd.code}>
                          {pkd.code} - {pkd.name}
                        </div>
                      ))}
                    </div>
                  </li>
                )}
              </ul>
            </div>

            <div className="flex flex-col gap-8">
              <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  <i className="fas fa-address-card text-slate-400 mr-2"></i>
                  Dane profilowe (użytkownika)
                </h2>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li>
                    <strong className="text-slate-900">Branża główna:</strong>{" "}
                    {company.industry || "-"}
                  </li>
                  <li>
                    <strong className="text-slate-900">Wszystkie branże:</strong>{" "}
                    {company.industries?.join(", ") || "-"}
                  </li>
                  <li>
                    <strong className="text-slate-900">Miasto / Woj.:</strong>{" "}
                    {company.location_city || "-"} ({company.location_voivodeship || "-"})
                  </li>
                  <li>
                    <strong className="text-slate-900">WWW:</strong>{" "}
                    {company.website_url ? (
                      <a href={company.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {company.website_url}
                      </a>
                    ) : "-"}
                  </li>
                </ul>
                <div className="mt-4">
                  <strong className="text-slate-900 block mb-1 text-sm">Opis firmy:</strong>
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 whitespace-pre-wrap max-h-[150px] overflow-y-auto">
                    {company.description || "Brak opisu."}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border-2 border-[#1a5f3c] bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-extrabold text-[#1a5f3c] border-b border-slate-100 pb-3">
                  <i className="fas fa-shield-halved mr-2"></i>
                  Panel weryfikacyjny
                </h2>
                <AdminCompanyVerificationClient
                  companyId={company.id}
                  isVerified={Boolean(company.is_verified)}
                  latestNote={latestReview?.verification_note || null}
                  latestVerifiedAt={latestReview?.verified_at || null}
                />
              </div>

              <div className="rounded-[24px] border-2 border-slate-200 bg-white p-6 shadow-sm">
                <AdminCompanyPlanClient
                  companyId={company.id}
                  currentPlan={company.plan}
                  planHistory={planHistory || []}
                />
              </div>

              <AdminCompanyOfferLimitClient
                companyId={company.id}
                customLimit={company.custom_active_pending_offer_limit}
                limitHistory={limitHistory || []}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

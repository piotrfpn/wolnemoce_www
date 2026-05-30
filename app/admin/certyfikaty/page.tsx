import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { createClient } from "@/lib/supabase/server";
import CertificateAdminFiltersClient from "./CertificateAdminFiltersClient";
import CertificateAdminListClient from "./CertificateAdminListClient";
import type {
  AdminCertificateCompany,
  AdminCertificateListItem,
  AdminCertificateRecord,
  CertificateVerificationStatus,
  CertificateVisibility,
} from "./types";

export const metadata: Metadata = {
  title: "Certyfikaty firm | Panel administratora",
  description: "Moderacja certyfikatów firm w panelu administratora WolneMoce.pl.",
};

type AdminCertificatesPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

const allowedStatuses = new Set(["all", "declared", "admin_verified", "rejected"]);
const allowedVisibilities = new Set(["all", "public", "private"]);

async function requireAdmin() {
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

  return supabase;
}

function getSingleParam(
  searchParams: AdminCertificatesPageProps["searchParams"],
  key: string
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function sanitizeSearchTerm(value: string) {
  return value
    .trim()
    .replace(/[,%(){}[\]]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

function normalizeStatus(value: string): CertificateVerificationStatus | "all" {
  return allowedStatuses.has(value)
    ? (value as CertificateVerificationStatus | "all")
    : "declared";
}

function normalizeVisibility(value: string): CertificateVisibility | "all" {
  return allowedVisibilities.has(value)
    ? (value as CertificateVisibility | "all")
    : "all";
}

function mapCertificate(row: AdminCertificateRecord) {
  return row;
}

function mapCompany(row: AdminCertificateCompany) {
  return row;
}

function buildCertificateSearchFilter(q: string, companyIds: string[]) {
  const filters = [
    `name.ilike.%${q}%`,
    `issuer.ilike.%${q}%`,
    `certificate_number.ilike.%${q}%`,
  ];

  if (companyIds.length > 0) {
    filters.push(`company_id.in.(${companyIds.join(",")})`);
  }

  return filters.join(",");
}

export default async function AdminCertificatesPage({
  searchParams,
}: AdminCertificatesPageProps) {
  const supabase = await requireAdmin();
  const qRaw = getSingleParam(searchParams, "q");
  const q = sanitizeSearchTerm(qRaw);
  const status = normalizeStatus(getSingleParam(searchParams, "status"));
  const visibility = normalizeVisibility(getSingleParam(searchParams, "visibility"));

  let companyIdsFromSearch: string[] = [];

  if (q) {
    const { data: companySearchData } = await supabase
      .from("companies")
      .select("id")
      .or(`name.ilike.%${q}%,nip.ilike.%${q}%`)
      .limit(200);

    companyIdsFromSearch = (companySearchData ?? []).map(
      (company: { id: string }) => company.id
    );
  }

  let certificateQuery = supabase
    .from("company_certificates")
    .select(
      "id, company_id, name, issuer, certificate_number, issued_at, expires_at, visibility, verification_status, file_bucket, file_path, file_name, mime_type, size_bytes, verified_by, verified_at, admin_note, created_at, updated_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (status !== "all") {
    certificateQuery = certificateQuery.eq("verification_status", status);
  }

  if (visibility !== "all") {
    certificateQuery = certificateQuery.eq("visibility", visibility);
  }

  if (q) {
    certificateQuery = certificateQuery.or(
      buildCertificateSearchFilter(q, companyIdsFromSearch)
    );
  }

  const { data: certificateData, error, count } = await certificateQuery;
  const certificateRows = (certificateData ?? []).map(mapCertificate);
  const companyIds = Array.from(
    new Set(certificateRows.map((certificate) => certificate.company_id))
  );

  const { data: companyData } =
    companyIds.length > 0
      ? await supabase
          .from("companies")
          .select(
            "id, name, slug, nip, regon, is_verified, location_city, location_voivodeship"
          )
          .in("id", companyIds)
      : { data: [] };

  const companies = (companyData ?? []).map(mapCompany);
  const companiesById = new Map(companies.map((company) => [company.id, company]));
  const certificates: AdminCertificateListItem[] = certificateRows.map(
    (certificate) => ({
      ...certificate,
      company: companiesById.get(certificate.company_id) ?? null,
    })
  );
  const totalCount = count ?? certificates.length;

  return (
    <>
      <PanelNavbar />
      <main className="min-h-screen bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[1400px] px-6 py-16">
          <div className="mb-8 flex min-w-0 flex-col gap-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between md:p-8">
            <div className="min-w-0">
              <Link
                href="/admin"
                className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#1a5f3c]"
              >
                <i className="fas fa-arrow-left"></i>
                Wróć do panelu
              </Link>
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                Panel administratora
              </p>
              <h1 className="text-3xl font-extrabold text-slate-900">
                Certyfikaty firm
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                Przeglądaj i moderuj certyfikaty dodane przez firmy. Domyślnie
                pokazujemy certyfikaty deklarowane, które najczęściej wymagają
                decyzji administratora.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Wyniki
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">
                {totalCount}
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="mb-8 h-[180px] rounded-[24px] border border-slate-200 bg-white shadow-sm" />
            }
          >
            <CertificateAdminFiltersClient />
          </Suspense>

          {error ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Nie udało się pobrać certyfikatów: {error.message}
            </div>
          ) : null}

          {certificates.length === 100 ? (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Pokazujemy maksymalnie 100 wyników. Doprecyzuj filtry lub
              wyszukiwanie, aby zawęzić listę.
            </div>
          ) : null}

          <CertificateAdminListClient certificates={certificates} />
        </section>
      </main>
      <Footer />
    </>
  );
}

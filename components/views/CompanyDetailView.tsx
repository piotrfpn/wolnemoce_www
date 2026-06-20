import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PublicOfferCard, { type PublicOffer } from "@/components/PublicOfferCard";
import StructuredData from "@/components/StructuredData";
import VerifiedCompanyBadge from "@/components/VerifiedCompanyBadge";
import { getCompanyProjectImagePublicUrl } from "@/lib/companyProjectImageUploads";
import { getLocalizedHref, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getAbsoluteUrl, truncateSeoDescription } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

type CompanyDetailViewProps = {
  slug: string;
  locale: Locale;
};

type PublicCompany = {
  id: string;
  slug: string | null;
  name: string | null;
  description: string | null;
  industry: string | null;
  industries: string[] | null;
  service_types: string[] | null;
  location_voivodeship: string | null;
  location_city: string | null;
  website_url: string | null;
  is_verified: boolean | null;
  presentation_file_name: string | null;
  nip: string | null;
  regon: string | null;
  krs: string | null;
  legal_form: string | null;
  business_status: string | null;
  primary_pkd: string | null;
  location_full_address: string | null;
};

type PublicCompanyCertificate = {
  id: string;
  name: string;
  issuer: string | null;
  certificate_number: string | null;
  issued_at: string | null;
  expires_at: string | null;
  verification_status: string;
  file_bucket: string | null;
  file_path: string | null;
  file_name: string | null;
  created_at: string;
};

type PublicCompanyProjectImage = {
  id: string;
  project_id: string;
  company_id: string;
  storage_path: string;
  display_order: number;
  created_at: string;
};

type PublicCompanyProject = {
  id: string;
  company_id: string;
  title: string;
  slug: string;
  technology: string[];
  industry: string[];
  description: string;
  nda_confirmation: boolean;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  images: PublicCompanyProjectImage[];
};

const publicCertificatesBucket = "company-certificates-public";

function getInitials(name: string | null) {
  if (!name) {
    return "WM";
  }

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

async function getCompanyBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("companies")
    .select(
      "id, slug, name, description, industry, industries, service_types, location_voivodeship, location_city, website_url, is_verified, presentation_file_name, nip, regon, krs, legal_form, business_status, primary_pkd, location_full_address"
    )
    .eq("slug", slug)
    .eq("is_verified", true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as PublicCompany;
}

async function getCompanyActiveOffers(companyId: string, company: PublicCompany) {
  const supabase = createClient();
  const { data } = await supabase
    .from("offers")
    .select(
      "id, title, slug, branch, service_type, description, power_available, min_order, lead_time, status, created_at, offer_images(id, path, alt, sort_order)"
    )
    .eq("company_id", companyId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return ((data ?? []) as Omit<PublicOffer, "companies">[]).map((offer) => ({
    ...offer,
    companies: company,
  }));
}

async function getPublicCompanyCertificates(companyId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("company_certificates")
    .select(
      "id, name, issuer, certificate_number, issued_at, expires_at, verification_status, file_bucket, file_path, file_name, created_at"
    )
    .eq("company_id", companyId)
    .eq("visibility", "public")
    .neq("verification_status", "rejected")
    .order("created_at", { ascending: false });

  return (data ?? []) as PublicCompanyCertificate[];
}

async function getCompanyPublishedProjects(companyId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("company_projects")
    .select(
      "id, company_id, title, slug, technology, industry, description, nda_confirmation, status, published_at, created_at, updated_at, archived_at"
    )
    .eq("company_id", companyId)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(6);
  const projects = (data ?? []) as Omit<PublicCompanyProject, "images">[];
  const projectIds = projects.map((project) => project.id);

  if (projectIds.length === 0) {
    return [];
  }

  const { data: imageData } = await supabase
    .from("company_project_images")
    .select("id, project_id, company_id, storage_path, display_order, created_at")
    .in("project_id", projectIds)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  const imagesByProjectId = new Map<string, PublicCompanyProjectImage[]>();

  for (const image of (imageData ?? []) as PublicCompanyProjectImage[]) {
    const current = imagesByProjectId.get(image.project_id) ?? [];
    current.push(image);
    imagesByProjectId.set(image.project_id, current);
  }

  return projects.map((project) => ({
    ...project,
    images: (imagesByProjectId.get(project.id) ?? []).slice(0, 3),
  }));
}

function formatCertificateDate(value: string | null, locale: Locale) {
  if (!value) {
    return null;
  }

  const dateLocales: Record<Locale, string> = {
    pl: "pl-PL",
    en: "en-US",
    de: "de-DE",
    uk: "uk-UA",
    es: "es-ES",
    fr: "fr-FR",
  };

  return new Intl.DateTimeFormat(dateLocales[locale]).format(new Date(value));
}

function getCertificateStatus(
  status: string,
  labels: ReturnType<typeof getDictionary>["companyDetail"]
) {
  if (status === "admin_verified") {
    return {
      label: labels.certificateVerifiedLabel,
      description: labels.certificateVerifiedDescription,
      isVerified: true,
    };
  }

  return {
    label: labels.certificateDeclaredLabel,
    description: labels.certificateDeclaredDescription,
    isVerified: false,
  };
}

function getCertificateDownloadUrl(certificate: PublicCompanyCertificate) {
  if (
    certificate.file_bucket !== publicCertificatesBucket ||
    !certificate.file_path
  ) {
    return null;
  }

  const supabase = createClient();
  const { data } = supabase.storage
    .from(publicCertificatesBucket)
    .getPublicUrl(certificate.file_path);
  const separator = data.publicUrl.includes("?") ? "&download=" : "?download=";
  const fileName = certificate.file_name ?? "certyfikat";

  return `${data.publicUrl}${separator}${encodeURIComponent(fileName)}`;
}

function getCompanyProjectReportHref(
  projectId: string,
  companySlug: string,
  locale: Locale
) {
  const params = new URLSearchParams({
    temat: "naruszenie",
    project_id: projectId,
    firma: companySlug,
  });

  return getLocalizedHref("/kontakt", locale, params.toString());
}

function getCompanyDetailPath(slug: string, locale: Locale) {
  return getLocalizedPath(`/firmy/${slug}`, locale);
}

export async function generateCompanyDetailMetadata({
  slug,
  locale,
}: CompanyDetailViewProps): Promise<Metadata> {
  const t = getDictionary(locale).companyDetail;
  const company = await getCompanyBySlug(slug);
  const canonicalPath = getCompanyDetailPath(slug, locale);

  if (!company) {
    return {
      title: t.notFoundTitle,
      description: t.notFoundDescription,
      alternates: {
        canonical: canonicalPath,
      },
    };
  }

  const location = [company.location_city, company.location_voivodeship]
    .filter(Boolean)
    .join(", ");
  const industries =
    company.industries && company.industries.length > 0
      ? company.industries.join(", ")
      : company.industry;
  const description =
    company.description ||
    [industries, location, t.publicProfile].filter(Boolean).join(" - ");
  const title = `${company.name} | ${t.publicProfile}`;
  const socialTitle = `${title} | WolneMoce`;
  const seoDescription = truncateSeoDescription(description);

  return {
    title,
    description: seoDescription,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: socialTitle,
      description: seoDescription,
      url: canonicalPath,
      siteName: "WolneMoce",
      type: "profile",
      images: [
        {
          url: getAbsoluteUrl("/images/offers/automation.jpg"),
          width: 1200,
          height: 630,
          alt: `${company.name} - profil firmy w WolneMoce`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: seoDescription,
      images: [getAbsoluteUrl("/images/offers/automation.jpg")],
    },
  };
}

export default async function CompanyDetailView({
  slug,
  locale,
}: CompanyDetailViewProps) {
  const t = getDictionary(locale).companyDetail;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const [activeOffers, certificates, projects] = await Promise.all([
    getCompanyActiveOffers(company.id, company),
    getPublicCompanyCertificates(company.id),
    getCompanyPublishedProjects(company.id),
  ]);
  const location = [company.location_city, company.location_voivodeship]
    .filter(Boolean)
    .join(", ");
  const industries =
    company.industries && company.industries.length > 0
      ? company.industries
      : company.industry
        ? [company.industry]
        : [];
  const serviceTypes = company.service_types ?? [];
  const companySlug = company.slug ?? slug;
  const companyOffersHref = getLocalizedHref(
    "/oferty",
    locale,
    company.name ? `q=${encodeURIComponent(company.name)}` : ""
  );
  const homeUrl = getAbsoluteUrl(getLocalizedPath("/", locale));
  const companiesUrl = getAbsoluteUrl(getLocalizedPath("/firmy", locale));
  const canonicalUrl = getAbsoluteUrl(
    getCompanyDetailPath(companySlug, locale)
  );
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: company.name,
        url: canonicalUrl,
        description: company.description ?? undefined,
        address: location
          ? {
              "@type": "PostalAddress",
              addressLocality: company.location_city ?? undefined,
              addressRegion: company.location_voivodeship ?? undefined,
              addressCountry: "PL",
            }
          : undefined,
        sameAs: company.website_url ? [company.website_url] : undefined,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "WolneMoce",
            item: homeUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: t.backToCompanies,
            item: companiesUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: company.name,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <StructuredData data={jsonLd} />
      <Navbar locale={locale} />
      <main className="bg-white">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3d26] via-[#1a5f3c] to-[#2d8a5e] px-6 pb-16 pt-36 text-white md:pb-20">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_20%_50%,white_2px,transparent_2px),radial-gradient(circle_at_80%_20%,white_1px,transparent_1px),radial-gradient(circle_at_40%_80%,white_1.5px,transparent_1.5px)] [background-size:60px_60px,40px_40px,80px_80px]" />

          <div className="relative z-10 mx-auto max-w-[1400px]">
            <Link
              href={getLocalizedPath("/firmy", locale)}
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80 no-underline transition hover:text-white"
            >
              <i className="fas fa-arrow-left text-xs"></i>
              {t.backToCompanies}
            </Link>

            <div className="grid min-w-0 gap-8 xl:grid-cols-[1fr_380px] xl:items-end">
              <div className="grid min-w-0 gap-8 lg:grid-cols-[auto_1fr] lg:items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-[24px] bg-white text-3xl font-black text-[#1a5f3c] shadow-2xl">
                  {getInitials(company.name)}
                </div>

              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap gap-3">
                  <VerifiedCompanyBadge
                    isVerified={company.is_verified}
                    className="!px-4 !py-2 !uppercase !tracking-wide"
                    verifiedLabel={t.trustCompanyVerifiedTitle}
                    verifiedTitle={t.trustCompanyVerifiedDescription}
                  />
                  {company.industry ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                      <i className="fas fa-industry text-[#fbbf24]"></i>
                      {company.industry}
                    </span>
                  ) : null}
                </div>

                <h1 className="break-words text-3xl font-black leading-tight tracking-[-1px] md:text-5xl">
                  {company.name || t.companyFallback}
                </h1>
                <p className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-white/85">
                  {location ? (
                    <span className="inline-flex items-center gap-2">
                      <i className="fas fa-map-marker-alt text-[#fbbf24]"></i>
                      {location}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-2">
                    <i className="fas fa-list-check text-[#fbbf24]"></i>
                    {activeOffers.length} {t.activeOffers}
                  </span>
                </p>
                {(industries.length > 0 || serviceTypes.length > 0) ? (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {industries.slice(0, 3).map((industry) => (
                      <span
                        key={industry}
                        className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white"
                      >
                        <i className="fas fa-industry text-[#fbbf24]"></i>
                        {industry}
                      </span>
                    ))}
                    {serviceTypes.slice(0, 3).map((serviceType) => (
                      <span
                        key={serviceType}
                        className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white"
                      >
                        <i className="fas fa-cogs text-[#fbbf24]"></i>
                        {serviceType}
                      </span>
                    ))}
                  </div>
                ) : null}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur">
                <div className="mb-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <div className="text-2xl font-black">{activeOffers.length}</div>
                    <div className="mt-1 text-[11px] font-semibold text-white/70">
                      {t.activeOffers}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <div className="text-2xl font-black">{industries.length}</div>
                    <div className="mt-1 text-[11px] font-semibold text-white/70">
                      {t.industries}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <div className="text-2xl font-black">{certificates.length}</div>
                    <div className="mt-1 text-[11px] font-semibold text-white/70">
                      {t.certificatesTitle}
                    </div>
                  </div>
                </div>

                <p className="mb-5 text-sm leading-6 text-white/80">
                  {t.verifiedNotice}
                </p>
                <div className="flex flex-col gap-3">
                  <a
                    href="#company-offers"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#1a5f3c] transition hover:bg-emerald-50"
                  >
                    {t.viewOffers}
                    <i className="fas fa-arrow-down text-xs"></i>
                  </a>
                  <Link
                    href={companyOffersHref}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    {t.activeCompanyOffers}
                    <i className="fas fa-arrow-right text-xs"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1400px] min-w-0 gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="min-w-0 space-y-6">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
                {t.companyData}
              </h2>
              <div className="space-y-4 text-sm text-slate-600">
                <p className="flex items-start gap-3">
                  <i className="fas fa-location-dot mt-1 text-[#1a5f3c]"></i>
                  <span>{location || t.locationMissing}</span>
                </p>
                {company.website_url ? (
                  <a
                    href={company.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-start gap-3 font-bold text-[#1a5f3c]"
                  >
                    <i className="fas fa-globe mt-1"></i>
                    <span className="break-words">{t.website}</span>
                  </a>
                ) : null}
                {company.presentation_file_name ? (
                  <p className="flex min-w-0 items-start gap-3">
                    <i className="fas fa-file-powerpoint mt-1 text-[#1a5f3c]"></i>
                    <span className="break-words">
                      {t.companyPresentation}: {company.presentation_file_name}
                    </span>
                  </p>
                ) : null}
              </div>
            </div>

            {company.is_verified && (
              <div className="rounded-[24px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
                    <i className="fas fa-check-circle text-lg"></i>
                  </div>
                  <h2 className="text-xl font-extrabold text-emerald-900">
                    {t.trustCompanyVerifiedTitle}
                  </h2>
                </div>
                <p className="mb-3 text-sm font-medium text-emerald-800 leading-relaxed">
                  {t.trustCompanyVerifiedDescription}
                </p>
                <p className="text-xs text-emerald-600/80 font-medium">
                  {t.trustCompanyVerifiedDisclaimer}
                </p>
              </div>
            )}

            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
                {t.registrationData}
              </h2>
              <p className="mb-4 text-xs leading-5 text-slate-500">
                {t.registrationNotice}
              </p>
              <div className="space-y-3 text-sm text-slate-600">
                {company.nip && (
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">NIP</span>
                    <span className="font-bold text-slate-900">{company.nip}</span>
                  </div>
                )}
                {company.regon && (
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">REGON</span>
                    <span className="font-bold text-slate-900">{company.regon}</span>
                  </div>
                )}
                {company.krs && (
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">KRS</span>
                    <span className="font-bold text-slate-900">{company.krs}</span>
                  </div>
                )}
                {company.legal_form && (
                  <div className="flex justify-between border-b border-slate-100 pb-2 gap-4">
                    <span className="text-slate-500 shrink-0">{t.legalForm}</span>
                    <span className="font-bold text-slate-900 text-right">{company.legal_form}</span>
                  </div>
                )}
                {company.business_status && (
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">{t.businessStatus}</span>
                    <span className="font-bold text-slate-900">{company.business_status}</span>
                  </div>
                )}
                {company.primary_pkd && (
                  <div className="flex justify-between border-b border-slate-100 pb-2 gap-4">
                    <span className="text-slate-500 shrink-0">{t.primaryPkd}</span>
                    <span className="font-bold text-slate-900 text-right">{company.primary_pkd}</span>
                  </div>
                )}
                {location && (
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">{t.location}</span>
                    <span className="font-bold text-slate-900">{location}</span>
                  </div>
                )}
                {company.location_full_address && (
                  <div className="flex justify-between border-b border-slate-100 pb-2 gap-4">
                    <span className="text-slate-500 shrink-0">{t.fullAddress}</span>
                    <span className="font-bold text-slate-900 text-right">{company.location_full_address}</span>
                  </div>
                )}
                {!company.nip && !company.regon && !company.krs && !company.legal_form && !company.business_status && !company.primary_pkd && !company.location_full_address && (
                  <div className="text-slate-500 italic">{t.noRegistrationData}</div>
                )}
              </div>
            </div>

            {industries.length > 0 || serviceTypes.length > 0 ? (
              <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
                  {t.industriesAndServices}
                </h2>
                {industries.length > 0 && (
                  <div className="mb-6">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      {t.industries}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {industries.map((industry) => (
                        <span
                          key={industry}
                          className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {serviceTypes.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      {t.services}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {serviceTypes.map((serviceType) => (
                        <span
                          key={serviceType}
                          className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                        >
                          {serviceType}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {certificates.length > 0 ? (
              <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-3 text-2xl font-extrabold text-slate-900">
                  {t.certificatesTitle}
                </h2>
                <p className="mb-5 text-sm leading-6 text-slate-500">
                  {t.certificatesDescription}
                </p>

                <div className="space-y-4">
                  {certificates.map((certificate) => {
                    const issuedAt = formatCertificateDate(
                      certificate.issued_at,
                      locale
                    );
                    const expiresAt = formatCertificateDate(
                      certificate.expires_at,
                      locale
                    );
                    const downloadUrl = getCertificateDownloadUrl(certificate);
                    const status = getCertificateStatus(certificate.verification_status, t);

                    return (
                      <article
                        key={certificate.id}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                            <i className="fas fa-certificate"></i>
                          </div>
                          <div className="min-w-0">
                            <h3 className="break-words text-sm font-extrabold text-slate-900">
                              {certificate.name}
                            </h3>
                            <div className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
                              {certificate.issuer ? (
                                <p>
                                  <span className="font-bold text-slate-700">
                                    {t.certificateIssuer}:
                                  </span>{" "}
                                  {certificate.issuer}
                                </p>
                              ) : null}
                              {certificate.certificate_number ? (
                                <p>
                                  <span className="font-bold text-slate-700">
                                    {t.certificateNumber}:
                                  </span>{" "}
                                  {certificate.certificate_number}
                                </p>
                              ) : null}
                              {issuedAt ? (
                                <p>
                                  <span className="font-bold text-slate-700">
                                    {t.issuedAt}:
                                  </span>{" "}
                                  {issuedAt}
                                </p>
                              ) : null}
                              {expiresAt ? (
                                <p>
                                  <span className="font-bold text-slate-700">
                                    {t.expiresAt}:
                                  </span>{" "}
                                  {expiresAt}
                                </p>
                              ) : null}
                              {certificate.file_name ? (
                                <p className="break-words">
                                  <span className="font-bold text-slate-700">
                                    {t.certificateFile}:
                                  </span>{" "}
                                  {certificate.file_name}
                                </p>
                              ) : null}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${status.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}
                                title={status.description}
                              >
                                {status.isVerified && (
                                  <i className="fas fa-check-circle mr-1.5"></i>
                                )}
                                {status.label}
                              </span>
                              {downloadUrl ? (
                                <a
                                  href={downloadUrl}
                                  download={certificate.file_name ?? "certyfikat"}
                                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#1a5f3c] transition hover:bg-[#1a5f3c] hover:text-white"
                                >
                                  <i className="fas fa-download"></i>
                                  {t.downloadCertificate}
                                </a>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </aside>

          <div className="min-w-0 space-y-8">
            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-4 text-2xl font-extrabold text-slate-900">
                {t.companyDescription}
              </h2>
              <p className="whitespace-pre-line text-base leading-8 text-slate-600">
                {company.description || t.emptyCompanyDescription}
              </p>
            </section>

            {projects.length > 0 ? (
              <section
                id="realizacje"
                className="scroll-mt-24 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
              >
                <div className="mb-6">
                  <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                    {t.projectsTitle}
                  </p>
                  <p className="max-w-3xl text-sm leading-6 text-slate-500">
                    {t.projectsDescription}
                  </p>
                </div>

                <div className="grid min-w-0 items-stretch gap-6 xl:grid-cols-2">
                  {projects.map((project) => (
                    <article
                      key={project.id}
                      className="flex h-full min-w-0 flex-col rounded-[20px] border border-slate-200 bg-slate-50 p-5"
                    >
                      {project.images.length > 0 ? (
                        <div className="mb-5 grid min-w-0 gap-3">
                          <div className="overflow-hidden rounded-2xl bg-white">
                            <div className="aspect-video">
                              <img
                                src={getCompanyProjectImagePublicUrl(
                                  project.images[0].storage_path
                                )}
                                alt={project.title}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <a
                              href={getCompanyProjectImagePublicUrl(
                                project.images[0].storage_path
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 no-underline transition hover:text-[#1a5f3c]"
                            >
                              <i className="fas fa-up-right-from-square text-[10px]"></i>
                              {t.projectOpenImage}
                            </a>
                          </div>
                          {project.images.length > 1 ? (
                            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                              {project.images.slice(1, 3).map((image) => (
                                <div
                                  key={image.id}
                                  className="overflow-hidden rounded-xl bg-white"
                                >
                                  <div className="aspect-video">
                                    <img
                                      src={getCompanyProjectImagePublicUrl(
                                        image.storage_path
                                      )}
                                      alt={project.title}
                                      loading="lazy"
                                      decoding="async"
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <a
                                    href={getCompanyProjectImagePublicUrl(
                                      image.storage_path
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 no-underline transition hover:text-[#1a5f3c]"
                                  >
                                    <i className="fas fa-up-right-from-square text-[10px]"></i>
                                    {t.projectOpenImage}
                                  </a>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="mb-5 flex aspect-video items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm font-bold text-slate-400">
                          {t.projectNoImages}
                        </div>
                      )}

                      <div className="mb-4 flex flex-wrap gap-2">
                        <span
                          className="rounded-full bg-[#1a5f3c]/10 px-3 py-1 text-xs font-bold text-[#1a5f3c]"
                          title={t.projectDeclarationDescription}
                        >
                          {t.projectDeclarationLabel}
                        </span>
                      </div>

                      <h3 className="break-words text-lg font-extrabold text-slate-900">
                        {project.title}
                      </h3>
                      <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">
                        {project.description}
                      </p>

                      <div className="mt-auto pt-5">
                        {project.technology.length > 0 ? (
                          <div className="mb-4">
                            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                              {t.projectTechnologyLabel}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {project.technology.slice(0, 5).map((technology) => (
                                <span
                                  key={technology}
                                  className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700"
                                >
                                  {technology}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {project.industry.length > 0 ? (
                          <div>
                            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                              {t.projectIndustryLabel}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {project.industry.slice(0, 5).map((industry) => (
                                <span
                                  key={industry}
                                  className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                                >
                                  {industry}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <div className="mt-5 border-t border-slate-200 pt-4">
                          <Link
                            href={getCompanyProjectReportHref(
                              project.id,
                              companySlug,
                              locale
                            )}
                            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 no-underline transition hover:text-[#1a5f3c]"
                          >
                            <i className="fas fa-flag text-[11px]"></i>
                            {t.projectReportViolation}
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

              <section
                id="company-offers"
                className="scroll-mt-24 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
              >
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                      {t.activeCompanyOffers}
                    </p>
                    <h2 className="text-2xl font-extrabold text-slate-900">
                      {t.availableCapacity}
                    </h2>
                  </div>
                  <Link href={companyOffersHref} className="btn btn-outline">
                    {t.viewOffers}
                  </Link>
                </div>

                {activeOffers.length > 0 ? (
                <div className="grid min-w-0 gap-6 xl:grid-cols-2">
                  {activeOffers.map((offer) => (
                    <div key={offer.id} className="min-w-0">
                      <PublicOfferCard
                        offer={offer}
                        locale={locale}
                        variant="catalog"
                      />
                    </div>
                  ))}
                </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#1a5f3c] shadow-sm">
                      <i className="fas fa-circle-info"></i>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {t.noActiveOffers}
                    </h3>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                      {t.noDescription}
                    </p>
                  </div>
                )}
              </section>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export type DirectoryCompany = {
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
  created_at: string | null;
  has_public_certificates?: boolean;
  has_admin_verified_certificate?: boolean;
};

type CertificatesFilter = "all" | "yes" | "no";

const inputClass =
  "min-w-0 max-w-full w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10";

function normalize(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function uniqueSorted(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])
  ).sort((a, b) => a.localeCompare(b, "pl"));
}

function getCompanyIndustries(company: DirectoryCompany) {
  if (company.industries && company.industries.length > 0) {
    return company.industries.filter(Boolean);
  }

  return company.industry ? [company.industry] : [];
}

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

function truncateDescription(
  description: string | null,
  fallback: string,
  maxLength = 150
) {
  if (!description) {
    return fallback;
  }

  if (description.length <= maxLength) {
    return description;
  }

  return `${description.slice(0, maxLength - 1).trimEnd()}...`;
}

export default function CompanyDirectoryClient({
  companies,
  initialCertificatesFilter = "all",
  locale = defaultLocale,
}: {
  companies: DirectoryCompany[];
  initialCertificatesFilter?: CertificatesFilter;
  locale?: Locale;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const labels = getDictionary(locale).companiesList;
  const [query, setQuery] = useState("");
  const [voivodeship, setVoivodeship] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [sort, setSort] = useState<"az" | "newest">("az");
  const [certificates, setCertificates] = useState<CertificatesFilter>(
    initialCertificatesFilter
  );

  const options = useMemo(
    () => ({
      voivodeships: uniqueSorted(
        companies.map((company) => company.location_voivodeship)
      ),
      cities: uniqueSorted(companies.map((company) => company.location_city)),
      industries: uniqueSorted(companies.flatMap(getCompanyIndustries)),
      services: uniqueSorted(
        companies.flatMap((company) => company.service_types ?? [])
      ),
    }),
    [companies]
  );

  const filteredCompanies = useMemo(() => {
    const normalizedQuery = normalize(query);

    return companies
      .filter((company) => {
        const industries = getCompanyIndustries(company);
        const services = company.service_types ?? [];
        const matchesQuery =
          !normalizedQuery ||
          normalize(company.name).includes(normalizedQuery) ||
          normalize(company.description).includes(normalizedQuery);
        const matchesVoivodeship =
          !voivodeship || company.location_voivodeship === voivodeship;
        const matchesCity = !city || company.location_city === city;
        const matchesIndustry = !industry || industries.includes(industry);
        const matchesService =
          !serviceType || services.includes(serviceType);
        const matchesCertificates =
          certificates === "all" ||
          (certificates === "yes" && Boolean(company.has_public_certificates)) ||
          (certificates === "no" && !company.has_public_certificates);

        return (
          matchesQuery &&
          matchesVoivodeship &&
          matchesCity &&
          matchesIndustry &&
          matchesService &&
          matchesCertificates
        );
      })
      .sort((a, b) => {
        if (sort === "newest") {
          return (
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime()
          );
        }

        return (a.name ?? "").localeCompare(b.name ?? "", "pl");
      });
  }, [
    certificates,
    companies,
    query,
    voivodeship,
    city,
    industry,
    serviceType,
    sort,
  ]);

  function updateCertificatesFilter(value: CertificatesFilter) {
    setCertificates(value);

    const params = new URLSearchParams(
      typeof window === "undefined" ? "" : window.location.search
    );

    if (value === "all") {
      params.delete("certificates");
    } else {
      params.set("certificates", value);
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  function clearFilters() {
    setQuery("");
    setVoivodeship("");
    setCity("");
    setIndustry("");
    setServiceType("");
    updateCertificatesFilter("all");
    setSort("az");
  }

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16">
      <div className="mb-8 flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <div className="section-label">{labels.sectionLabel}</div>
          <h2 className="section-title">{labels.sectionTitle}</h2>
        </div>
        <p className="text-sm font-semibold text-slate-500">
          {labels.found} {filteredCompanies.length} {labels.of} {companies.length} {labels.companies}
        </p>
      </div>

      <div className="mb-8 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex min-w-0 flex-col gap-2">
          <h3 className="text-xl font-extrabold text-slate-900">
            {labels.filtersTitle}
          </h3>
          <p className="text-sm leading-6 text-slate-500">
            {labels.filtersDescription}
          </p>
        </div>

        <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              {labels.searchCompany}
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={inputClass}
              placeholder={labels.searchPlaceholder}
            />
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              {labels.voivodeship}
            </span>
            <select
              value={voivodeship}
              onChange={(event) => setVoivodeship(event.target.value)}
              className={inputClass}
            >
              <option value="">{labels.allVoivodeships}</option>
              {options.voivodeships.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              {labels.city}
            </span>
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className={inputClass}
            >
              <option value="">{labels.allCities}</option>
              {options.cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              {labels.industry}
            </span>
            <select
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
              className={inputClass}
            >
              <option value="">{labels.allIndustries}</option>
              {options.industries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              {labels.serviceType}
            </span>
            <select
              value={serviceType}
              onChange={(event) => setServiceType(event.target.value)}
              className={inputClass}
            >
              <option value="">{labels.allServices}</option>
              {options.services.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              {labels.sort}
            </span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as "az" | "newest")}
              className={inputClass}
            >
              <option value="az">{labels.sortAz}</option>
              <option value="newest">{labels.sortNewest}</option>
            </select>
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              {labels.certificatesLabel}
            </span>
            <select
              value={certificates}
              onChange={(event) =>
                updateCertificatesFilter(
                  event.target.value as CertificatesFilter
                )
              }
              className={inputClass}
            >
              <option value="all">{labels.certificatesAll}</option>
              <option value="yes">{labels.certificatesYes}</option>
              <option value="no">{labels.certificatesNo}</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-5 py-3 text-sm font-bold text-[#1a5f3c] transition hover:bg-[#1a5f3c] hover:text-white"
        >
          <i className="fas fa-rotate-left"></i>
          {labels.clearFilters}
        </button>
      </div>

      {filteredCompanies.length > 0 ? (
        <div className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCompanies.map((company) => {
            const location = [
              company.location_city,
              company.location_voivodeship,
            ]
              .filter(Boolean)
              .join(", ");
            const industries = getCompanyIndustries(company);
            const services = company.service_types ?? [];

            return (
              <article
                key={company.id}
                className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#1a5f3c] hover:shadow-md"
              >
                <div className="mb-5 flex min-w-0 items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1a5f3c] to-[#2d8a5e] text-lg font-black text-white shadow-sm">
                    {getInitials(company.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      {company.is_verified && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                          {labels.companyVerifiedBadge}
                        </span>
                      )}
                      {company.has_admin_verified_certificate ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                          <i className="fas fa-check-circle text-[10px]"></i>
                          {labels.verifiedCertificateBadge}
                        </span>
                      ) : company.has_public_certificates ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 border border-slate-200">
                          <i className="fas fa-file-contract text-[10px] text-slate-400"></i>
                          {labels.declaredCertificatesBadge}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="break-words text-xl font-extrabold text-slate-900">
                      {company.name ?? labels.companyFallback}
                    </h3>
                    {location ? (
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        <i className="fas fa-location-dot text-[#1a5f3c]"></i>
                        {location}
                      </p>
                    ) : null}
                  </div>
                </div>

                <p className="mb-5 text-sm leading-6 text-slate-600">
                  {truncateDescription(company.description, labels.noDescription)}
                </p>

                <div className="mb-5 space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      {labels.industriesLabel}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {industries.length > 0 ? (
                        industries.slice(0, 4).map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400">{labels.noData}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      {labels.servicesLabel}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {services.length > 0 ? (
                        services.slice(0, 5).map((service) => (
                          <span
                            key={service}
                            className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                          >
                            {service}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400">{labels.noData}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                  {company.slug ? (
                    <Link
                      href={`/firmy/${company.slug}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-4 py-3 text-sm font-bold text-white no-underline transition hover:bg-[#0d3d26]"
                    >
                      {labels.viewProfile}
                      <i className="fas fa-arrow-right text-xs"></i>
                    </Link>
                  ) : null}
                  {company.website_url ? (
                    <a
                      href={company.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-4 py-3 text-sm font-bold text-[#1a5f3c] no-underline transition hover:bg-[#1a5f3c] hover:text-white"
                    >
                      <i className="fas fa-globe"></i>
                      WWW
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1a5f3c] shadow-sm">
            <i className="fas fa-building text-xl"></i>
          </div>
          <h3 className="mb-2 text-xl font-extrabold text-slate-900">
            {companies.length > 0
              ? labels.emptyFilteredTitle
              : labels.emptyTitle}
          </h3>
          <p className="mx-auto mb-6 max-w-2xl text-sm leading-6 text-slate-500">
            {companies.length > 0
              ? labels.emptyFilteredDescription
              : labels.emptyDescription}
          </p>
          {companies.length > 0 ? (
            <button type="button" onClick={clearFilters} className="btn btn-outline">
              {labels.clearFilters}
            </button>
          ) : (
            <Link href="/oferty" className="btn btn-outline">
              {labels.viewOffers}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

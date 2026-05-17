"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
};

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

function truncateDescription(description: string | null, maxLength = 150) {
  if (!description) {
    return "Firma nie dodała jeszcze opisu.";
  }

  if (description.length <= maxLength) {
    return description;
  }

  return `${description.slice(0, maxLength - 1).trimEnd()}...`;
}

export default function CompanyDirectoryClient({
  companies,
}: {
  companies: DirectoryCompany[];
}) {
  const [query, setQuery] = useState("");
  const [voivodeship, setVoivodeship] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [sort, setSort] = useState<"az" | "newest">("az");

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

        return (
          matchesQuery &&
          matchesVoivodeship &&
          matchesCity &&
          matchesIndustry &&
          matchesService
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
  }, [companies, query, voivodeship, city, industry, serviceType, sort]);

  function clearFilters() {
    setQuery("");
    setVoivodeship("");
    setCity("");
    setIndustry("");
    setServiceType("");
    setSort("az");
  }

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16">
      <div className="mb-8 flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <div className="section-label">Firmy</div>
          <h2 className="section-title">Zweryfikowani dostawcy B2B</h2>
        </div>
        <p className="text-sm font-semibold text-slate-500">
          Znaleziono {filteredCompanies.length} z {companies.length} firm
        </p>
      </div>

      <div className="mb-8 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex min-w-0 flex-col gap-2">
          <h3 className="text-xl font-extrabold text-slate-900">
            Filtry katalogu
          </h3>
          <p className="text-sm leading-6 text-slate-500">
            Zawęź listę firm po lokalizacji, branży i rodzaju usługi.
          </p>
        </div>

        <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Szukaj firmy
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={inputClass}
              placeholder="Nazwa firmy lub opis"
            />
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Województwo
            </span>
            <select
              value={voivodeship}
              onChange={(event) => setVoivodeship(event.target.value)}
              className={inputClass}
            >
              <option value="">Wszystkie województwa</option>
              {options.voivodeships.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Miasto
            </span>
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className={inputClass}
            >
              <option value="">Wszystkie miasta</option>
              {options.cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Branża
            </span>
            <select
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
              className={inputClass}
            >
              <option value="">Wszystkie branże</option>
              {options.industries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Rodzaj usługi
            </span>
            <select
              value={serviceType}
              onChange={(event) => setServiceType(event.target.value)}
              className={inputClass}
            >
              <option value="">Wszystkie usługi</option>
              {options.services.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Sortowanie
            </span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as "az" | "newest")}
              className={inputClass}
            >
              <option value="az">Alfabetycznie A-Z</option>
              <option value="newest">Najnowsze</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-5 py-3 text-sm font-bold text-[#1a5f3c] transition hover:bg-[#1a5f3c] hover:text-white"
        >
          <i className="fas fa-rotate-left"></i>
          Wyczyść filtry
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
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        <i className="fas fa-check-circle"></i>
                        Zweryfikowana
                      </span>
                    </div>
                    <h3 className="break-words text-xl font-extrabold text-slate-900">
                      {company.name ?? "Firma"}
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
                  {truncateDescription(company.description)}
                </p>

                <div className="mb-5 space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Branże
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
                        <span className="text-sm text-slate-400">Brak danych</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Usługi
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
                        <span className="text-sm text-slate-400">Brak danych</span>
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
                      Zobacz profil
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
              ? "Nie znaleziono firm spełniających wybrane kryteria."
              : "Nie ma jeszcze firm do wyświetlenia."}
          </h3>
          <p className="mx-auto mb-6 max-w-2xl text-sm leading-6 text-slate-500">
            {companies.length > 0
              ? "Zmień filtry albo wyczyść kryteria wyszukiwania."
              : "Katalog pokaże firmy po weryfikacji przez administratora."}
          </p>
          {companies.length > 0 ? (
            <button type="button" onClick={clearFilters} className="btn btn-outline">
              Wyczyść filtry
            </button>
          ) : (
            <Link href="/oferty" className="btn btn-outline">
              Zobacz dostępne oferty
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cityToSlug, type CityOption } from "@/lib/location";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { defaultLocale, type Locale } from "@/lib/i18n/config";

type OffersFiltersClientProps = {
  categories: string[];
  services: string[];
  provinces: string[];
  cities: CityOption[];
  locale?: Locale;
};

function getParam(searchParams: { get: (key: string) => string | null }, key: string) {
  return searchParams.get(key) ?? "";
}

function getLegacyParam(
  searchParams: { get: (key: string) => string | null },
  primaryKey: string,
  legacyKey: string
) {
  return getParam(searchParams, primaryKey) || getParam(searchParams, legacyKey);
}

function getQueryValue(value: string) {
  return value
    .replace(/[łŁ]/g, (match) => (match === "Ł" ? "L" : "l"))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getOptionValue(value: string, options: string[]) {
  if (!value) {
    return "";
  }

  const normalizedValue = getQueryValue(value);

  return (
    options.find(
      (option) =>
        option === value || getQueryValue(option) === normalizedValue
    ) ?? value
  );
}

function getCityValue(value: string, options: CityOption[]) {
  if (!value) {
    return "";
  }

  const slug = cityToSlug(value);
  return options.find((option) => option.slug === slug)?.slug ?? "";
}

export default function OffersFiltersClient({
  categories,
  services,
  provinces,
  cities,
  locale = defaultLocale,
}: OffersFiltersClientProps) {
  const labels = getDictionary(locale).offersList.filters;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(getParam(searchParams, "q"));

  useEffect(() => {
    setQuery(getParam(searchParams, "q"));
  }, [searchParams]);

  const current = useMemo(
    () => ({
      industry: getOptionValue(
        getLegacyParam(searchParams, "branza", "industry"),
        categories
      ),
      serviceType: getOptionValue(
        getLegacyParam(searchParams, "usluga", "service_type"),
        services
      ),
      voivodeship: getOptionValue(
        getLegacyParam(searchParams, "wojewodztwo", "voivodeship"),
        provinces
      ),
      city: getCityValue(getParam(searchParams, "miasto"), cities),
      verified: getParam(searchParams, "verified") === "true",
      sort: getParam(searchParams, "sort") || "newest",
    }),
    [categories, cities, provinces, searchParams, services]
  );

  function updateUrl(nextValues: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());

    ["industry", "service_type", "voivodeship"].forEach((legacyKey) =>
      params.delete(legacyKey)
    );

    Object.entries(nextValues).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateUrl({ q: query.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
          {labels.search}
        </label>
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
            className="h-12 min-w-0 w-full max-w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
          {labels.industry}
        </label>
        <select
          value={current.industry}
          onChange={(event) =>
            updateUrl({
              branza: getQueryValue(event.target.value),
              usluga: "",
            })
          }
          className="h-12 min-w-0 w-full max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
        >
          <option value="">{labels.allIndustries}</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
          {labels.serviceType}
        </label>
        <select
          value={current.serviceType}
          onChange={(event) =>
            updateUrl({ usluga: getQueryValue(event.target.value) })
          }
          className="h-12 min-w-0 w-full max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
        >
          <option value="">{labels.allServices}</option>
          {services.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
          {labels.voivodeship}
        </label>
        <select
          value={current.voivodeship}
          onChange={(event) =>
            updateUrl({ wojewodztwo: getQueryValue(event.target.value) })
          }
          className="h-12 min-w-0 w-full max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
        >
          <option value="">{labels.allPoland}</option>
          {provinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
          {labels.city}
        </label>
        <select
          value={current.city}
          onChange={(event) =>
            updateUrl({ miasto: event.target.value })
          }
          className="h-12 min-w-0 w-full max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
        >
          <option value="">{labels.allCities}</option>
          {cities.map((city) => (
            <option key={city.slug} value={city.slug}>
              {city.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={current.verified}
          onChange={(event) =>
            updateUrl({ verified: event.target.checked ? "true" : "" })
          }
          className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-[#1a5f3c]"
        />
        <span className="min-w-0">
          <span className="block font-bold text-slate-900">
            {labels.verifiedOnly}
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            {labels.verifiedDescription}
          </span>
        </span>
      </label>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
          {labels.sort}
        </label>
        <select
          value={current.sort}
          onChange={(event) => updateUrl({ sort: event.target.value })}
          className="h-12 min-w-0 w-full max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
        >
          <option value="newest">{labels.newest}</option>
          <option value="az">{labels.alphabetical}</option>
          <option value="featured">{labels.featured}</option>
        </select>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <button type="submit" className="btn btn-primary w-full">
          <i className="fas fa-search"></i>
          {labels.submit}
        </button>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            router.push(pathname);
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-4 py-3 text-sm font-bold text-[#1a5f3c] transition hover:bg-[#1a5f3c] hover:text-white"
        >
          {labels.clear}
        </button>
      </div>
    </form>
  );
}

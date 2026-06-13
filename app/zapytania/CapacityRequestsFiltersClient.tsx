"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type CapacityRequestsFiltersClientProps = {
  categories: string[];
  services: string[];
  labels: {
    searchLabel: string;
    searchPlaceholder: string;
    industryLabel: string;
    serviceLabel: string;
    allIndustries: string;
    allServices: string;
    submitFilters: string;
    clearFilters: string;
  };
};

function getParam(searchParams: { get: (key: string) => string | null }, key: string) {
  return searchParams.get(key) ?? "";
}

function normalizeParam(value: string) {
  return value
    .replace(/[łŁ]/g, (match) => (match === "Ł" ? "L" : "l"))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getOptionFromParam(value: string, options: string[]) {
  if (!value) {
    return "";
  }

  const normalized = normalizeParam(value);
  return options.find((option) => option === value || normalizeParam(option) === normalized) ?? "";
}

export default function CapacityRequestsFiltersClient({
  categories,
  services,
  labels,
}: CapacityRequestsFiltersClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(getParam(searchParams, "q"));
  const current = useMemo(
    () => ({
      branch: getOptionFromParam(getParam(searchParams, "branza"), categories),
      serviceType: getOptionFromParam(getParam(searchParams, "usluga"), services),
    }),
    [categories, searchParams, services]
  );

  useEffect(() => {
    setQuery(getParam(searchParams, "q"));
  }, [searchParams]);

  function updateUrl(values: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(values).forEach(([key, value]) => {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
          {labels.searchLabel}
        </label>
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
            className="h-12 min-w-0 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
          {labels.industryLabel}
        </label>
        <select
          value={current.branch}
          onChange={(event) =>
            updateUrl({
              branza: event.target.value
                ? normalizeParam(event.target.value)
                : "",
              usluga: "",
            })
          }
          className="h-12 min-w-0 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
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
          {labels.serviceLabel}
        </label>
        <select
          value={current.serviceType}
          onChange={(event) =>
            updateUrl({
              usluga: event.target.value
                ? normalizeParam(event.target.value)
                : "",
            })
          }
          className="h-12 min-w-0 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
        >
          <option value="">{labels.allServices}</option>
          {services.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3">
        <button type="submit" className="btn btn-primary w-full">
          <i className="fas fa-search"></i>
          {labels.submitFilters}
        </button>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            router.push(pathname);
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-4 py-3 text-sm font-bold text-[#1a5f3c] transition hover:bg-[#1a5f3c] hover:text-white"
        >
          {labels.clearFilters}
        </button>
      </div>
    </form>
  );
}

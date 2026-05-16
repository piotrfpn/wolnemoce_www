"use client";

import { type FormEvent, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type OffersFiltersClientProps = {
  categories: string[];
  services: string[];
  provinces: string[];
};

function getParam(searchParams: { get: (key: string) => string | null }, key: string) {
  return searchParams.get(key) ?? "";
}

export default function OffersFiltersClient({
  categories,
  services,
  provinces,
}: OffersFiltersClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(getParam(searchParams, "q"));

  const current = useMemo(
    () => ({
      industry: getParam(searchParams, "industry"),
      serviceType: getParam(searchParams, "service_type"),
      voivodeship: getParam(searchParams, "voivodeship"),
      sort: getParam(searchParams, "sort") || "newest",
    }),
    [searchParams]
  );

  function updateUrl(nextValues: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());

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
          Szukaj
        </label>
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Np. spawanie, CNC, Kataforeza"
            className="h-12 min-w-0 w-full max-w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Branża
        </label>
        <select
          value={current.industry}
          onChange={(event) =>
            updateUrl({ industry: event.target.value, service_type: "" })
          }
          className="h-12 min-w-0 w-full max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
        >
          <option value="">Wszystkie branże</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Rodzaj usługi
        </label>
        <select
          value={current.serviceType}
          onChange={(event) => updateUrl({ service_type: event.target.value })}
          className="h-12 min-w-0 w-full max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
        >
          <option value="">Wszystkie usługi</option>
          {services.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Województwo
        </label>
        <select
          value={current.voivodeship}
          onChange={(event) => updateUrl({ voivodeship: event.target.value })}
          className="h-12 min-w-0 w-full max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
        >
          <option value="">Cała Polska</option>
          {provinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Sortowanie
        </label>
        <select
          value={current.sort}
          onChange={(event) => updateUrl({ sort: event.target.value })}
          className="h-12 min-w-0 w-full max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
        >
          <option value="newest">Najnowsze</option>
          <option value="oldest">Najstarsze</option>
        </select>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <button type="submit" className="btn btn-primary w-full">
          <i className="fas fa-search"></i>
          Szukaj
        </button>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            router.push(pathname);
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-4 py-3 text-sm font-bold text-[#1a5f3c] transition hover:bg-[#1a5f3c] hover:text-white"
        >
          Wyczyść filtry
        </button>
      </div>
    </form>
  );
}

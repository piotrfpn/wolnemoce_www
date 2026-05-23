"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

export default function AdminCompaniesFiltersClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") || "";
  const currentVerified = searchParams.get("verified") || "all";
  const currentGus = searchParams.get("gus") || "all";
  const currentPlan = searchParams.get("plan") || "all";
  const currentSort = searchParams.get("sort") || "newest";

  const [q, setQ] = useState(currentQ);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    router.replace(`${pathname}?${createQueryString(name, value)}`);
  };

  // Debounce for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (q !== currentQ) {
        handleFilterChange("q", q);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [q, currentQ]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearFilters = () => {
    setQ("");
    router.replace(pathname);
  };

  const hasFilters =
    currentQ !== "" ||
    currentVerified !== "all" ||
    currentGus !== "all" ||
    currentPlan !== "all" ||
    currentSort !== "newest";

  return (
    <div className="mb-6 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-bold text-slate-700">
            Wyszukiwanie
          </label>
          <div className="relative">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Szukaj po nazwie, NIP, REGON lub KRS"
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#1a5f3c] focus:outline-none focus:ring-1 focus:ring-[#1a5f3c]"
            />
          </div>
        </div>

        <div className="w-full md:w-40">
          <label className="mb-1.5 block text-xs font-bold text-slate-700">
            Weryfikacja
          </label>
          <select
            value={currentVerified}
            onChange={(e) => handleFilterChange("verified", e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-3 pr-8 text-sm focus:border-[#1a5f3c] focus:outline-none focus:ring-1 focus:ring-[#1a5f3c]"
          >
            <option value="all">Wszystkie</option>
            <option value="true">Zweryfikowane</option>
            <option value="false">Niezweryfikowane</option>
          </select>
        </div>

        <div className="w-full md:w-40">
          <label className="mb-1.5 block text-xs font-bold text-slate-700">
            Status GUS
          </label>
          <select
            value={currentGus}
            onChange={(e) => handleFilterChange("gus", e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-3 pr-8 text-sm focus:border-[#1a5f3c] focus:outline-none focus:ring-1 focus:ring-[#1a5f3c]"
          >
            <option value="all">Wszystkie</option>
            <option value="Aktywny">Aktywna</option>
            <option value="Zawieszony">Zawieszona</option>
            <option value="Wykreślony">Wykreślona</option>
            <option value="none">Brak danych</option>
          </select>
        </div>

        <div className="w-full md:w-40">
          <label className="mb-1.5 block text-xs font-bold text-slate-700">
            Plan
          </label>
          <select
            value={currentPlan}
            onChange={(e) => handleFilterChange("plan", e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-3 pr-8 text-sm focus:border-[#1a5f3c] focus:outline-none focus:ring-1 focus:ring-[#1a5f3c]"
          >
            <option value="all">Wszystkie plany</option>
            <option value="free">FREE</option>
            <option value="pro">PRO</option>
            <option value="enterprise">ENTERPRISE</option>
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="mb-1.5 block text-xs font-bold text-slate-700">
            Sortowanie
          </label>
          <select
            value={currentSort}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-3 pr-8 text-sm focus:border-[#1a5f3c] focus:outline-none focus:ring-1 focus:ring-[#1a5f3c]"
          >
            <option value="newest">Najnowsze</option>
            <option value="oldest">Najstarsze</option>
            <option value="az">A-Z</option>
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={handleClearFilters}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 md:w-auto"
          >
            Wyczyść
          </button>
        )}
      </div>
    </div>
  );
}

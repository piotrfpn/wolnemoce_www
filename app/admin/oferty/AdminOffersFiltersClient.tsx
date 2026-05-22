"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export default function AdminOffersFiltersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") ?? "";
  const currentStatus = searchParams.get("status") ?? "all";
  const currentFeatured = searchParams.get("featured") ?? "all";
  const currentCompanyVerified = searchParams.get("companyVerified") ?? "all";
  const currentSort = searchParams.get("sort") ?? "newest";

  const [q, setQ] = useState(currentQ);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    startTransition(() => {
      router.push(`/admin/oferty?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ q });
  }

  function clearFilters() {
    setQ("");
    startTransition(() => {
      router.push("/admin/oferty");
    });
  }

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj (tytuł, firma, miasto...)"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1a5f3c] focus:outline-none focus:ring-1 focus:ring-[#1a5f3c]"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
          disabled={isPending}
        >
          Szukaj
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <select
          value={currentStatus}
          onChange={(e) => updateParams({ status: e.target.value })}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#1a5f3c] focus:outline-none focus:ring-1 focus:ring-[#1a5f3c]"
          disabled={isPending}
        >
          <option value="all">Wszystkie statusy</option>
          <option value="pending">Oczekuje (pending)</option>
          <option value="active">Aktywne (active)</option>
          <option value="rejected">Odrzucone (rejected)</option>
          <option value="archived">Archiwalne (archived)</option>
          <option value="draft">Szkice (draft)</option>
        </select>

        <select
          value={currentFeatured}
          onChange={(e) => updateParams({ featured: e.target.value })}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#1a5f3c] focus:outline-none focus:ring-1 focus:ring-[#1a5f3c]"
          disabled={isPending}
        >
          <option value="all">Wszystkie wyróżnienia</option>
          <option value="true">Tylko wyróżnione</option>
          <option value="false">Tylko niewyróżnione</option>
        </select>

        <select
          value={currentCompanyVerified}
          onChange={(e) => updateParams({ companyVerified: e.target.value })}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#1a5f3c] focus:outline-none focus:ring-1 focus:ring-[#1a5f3c]"
          disabled={isPending}
        >
          <option value="all">Wszystkie firmy</option>
          <option value="true">Firma zweryfikowana</option>
          <option value="false">Firma niezweryfikowana</option>
        </select>

        <select
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#1a5f3c] focus:outline-none focus:ring-1 focus:ring-[#1a5f3c]"
          disabled={isPending}
        >
          <option value="newest">Najnowsze</option>
          <option value="oldest">Najstarsze</option>
          <option value="alpha">Alfabetycznie</option>
          <option value="status">Status</option>
          <option value="priority">Priorytet wyróżnienia</option>
          <option value="featured_until">Wyróżnienie do</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm font-medium text-slate-500 hover:text-slate-900 disabled:opacity-50"
          disabled={isPending}
        >
          Wyczyść filtry
        </button>
      </div>
    </div>
  );
}

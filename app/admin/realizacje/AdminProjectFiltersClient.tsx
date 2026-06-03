"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState, useTransition } from "react";

export default function AdminProjectFiltersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentQ = searchParams.get("q") ?? "";
  const currentStatus = searchParams.get("status") ?? "all";
  const [q, setQ] = useState(currentQ);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (q !== currentQ) {
        updateParams({ q });
      }
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [q, currentQ]);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/admin/realizacje?${query}` : "/admin/realizacje");
    });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParams({ q });
  }

  function clearFilters() {
    setQ("");
    startTransition(() => {
      router.push("/admin/realizacje");
    });
  }

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <form onSubmit={handleSearchSubmit} className="flex min-w-0 gap-2">
        <input
          type="text"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Szukaj po tytule, opisie lub firmie"
          className="h-12 min-w-0 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:ring-4 focus:ring-[#1a5f3c]/10"
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Szukaj
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <select
          value={currentStatus}
          onChange={(event) => updateParams({ status: event.target.value })}
          disabled={isPending}
          className="h-12 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#1a5f3c] focus:ring-4 focus:ring-[#1a5f3c]/10"
        >
          <option value="all">Wszystkie</option>
          <option value="pending">W moderacji</option>
          <option value="published">Opublikowane</option>
          <option value="rejected">Odrzucone</option>
          <option value="archived">Zarchiwizowane</option>
          <option value="draft">Szkice</option>
        </select>

        <button
          type="button"
          onClick={clearFilters}
          disabled={isPending}
          className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:border-[#1a5f3c] hover:text-[#1a5f3c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Wyczyść filtry
        </button>
      </div>
    </div>
  );
}

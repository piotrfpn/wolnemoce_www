"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState, useTransition } from "react";

export default function CertificateAdminFiltersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentQ = searchParams.get("q") ?? "";
  const currentStatus = searchParams.get("status") ?? "declared";
  const currentVisibility = searchParams.get("visibility") ?? "all";
  const [q, setQ] = useState(currentQ);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (q !== currentQ) {
        updateParams({ q, status: currentStatus });
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [q, currentQ, currentStatus]);

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (key === "status") {
        params.set(key, value);
        continue;
      }

      if (value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    startTransition(() => {
      const query = params.toString();
      router.push(query ? `/admin/certyfikaty?${query}` : "/admin/certyfikaty");
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParams({ q, status: currentStatus });
  }

  function clearFilters() {
    setQ("");
    startTransition(() => {
      router.push("/admin/certyfikaty");
    });
  }

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Szukaj po certyfikacie, firmie, NIP, numerze lub organie"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1a5f3c] focus:outline-none focus:ring-1 focus:ring-[#1a5f3c]"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          Szukaj
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Status
          </span>
          <select
            value={currentStatus}
            onChange={(event) => updateParams({ status: event.target.value })}
            disabled={isPending}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#1a5f3c] focus:outline-none focus:ring-1 focus:ring-[#1a5f3c]"
          >
            <option value="declared">Deklarowane</option>
            <option value="admin_verified">Zweryfikowane</option>
            <option value="rejected">Odrzucone</option>
            <option value="all">Wszystkie</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Widoczność
          </span>
          <select
            value={currentVisibility}
            onChange={(event) =>
              updateParams({ visibility: event.target.value, status: currentStatus })
            }
            disabled={isPending}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#1a5f3c] focus:outline-none focus:ring-1 focus:ring-[#1a5f3c]"
          >
            <option value="all">Wszystkie</option>
            <option value="public">Publiczne</option>
            <option value="private">Prywatne</option>
          </select>
        </label>

        <div className="flex items-end justify-end gap-3">
          {isPending ? (
            <span className="pb-2 text-sm text-slate-400">Ładowanie...</span>
          ) : null}
          <button
            type="button"
            onClick={clearFilters}
            disabled={isPending}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Wyczyść
          </button>
        </div>
      </div>
    </div>
  );
}

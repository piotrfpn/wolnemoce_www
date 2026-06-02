"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { updateAdminOffer, type AdminOfferActionResult } from "./actions";

type AdminOfferFormClientProps = {
  offer: {
    id: string;
    slug: string | null;
    status: string | null;
    is_featured: boolean | null;
    featured_until: string | null;
    featured_priority: number | null;
  };
};

function toDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}

export default function AdminOfferFormClient({
  offer,
}: AdminOfferFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AdminOfferActionResult>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult({});
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const nextResult = await updateAdminOffer(formData);
      setResult(nextResult);

      if (nextResult.success) {
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="offerId" value={offer.id} />

      {result.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error}
        </div>
      ) : null}

      {result.success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {result.success}
        </div>
      ) : null}

      <label className="block min-w-0">
        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Status oferty
        </span>
        <select
          name="status"
          defaultValue={offer.status ?? "pending"}
          className="h-12 min-w-0 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
        >
          <option value="draft">Szkic</option>
          <option value="pending">Oczekuje na moderację</option>
          <option value="active">Aktywna/publiczna</option>
          <option value="rejected">Odrzucona</option>
          <option value="archived">Zarchiwizowana</option>
        </select>
      </label>

      <label className="flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <input
          type="checkbox"
          name="is_featured"
          defaultChecked={Boolean(offer.is_featured)}
          onChange={(e) => {
            if (e.target.checked) {
              const dateInput = document.querySelector<HTMLInputElement>('input[name="featured_until"]');
              if (dateInput && !dateInput.value) {
                const date = new Date();
                date.setDate(date.getDate() + 7);
                dateInput.value = date.toISOString().slice(0, 16);
              }
            }
          }}
          className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-[#1a5f3c]"
        />
        <span className="min-w-0">
          <span className="block text-sm font-bold text-slate-900">
            Wyróżnij ofertę ręcznie
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            Oferta będzie traktowana jako wyróżniona wyłącznie do podanej daty ważności.
          </span>
        </span>
      </label>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <label className="block min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Ważne do
          </span>
          <input
            type="datetime-local"
            name="featured_until"
            defaultValue={toDateTimeLocal(offer.featured_until)}
            className="h-12 min-w-0 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Pole wymagane, jeśli oferta jest oznaczona jako wyróżniona.
          </p>
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Priorytet
          </span>
          <input
            type="number"
            name="featured_priority"
            min={0}
            defaultValue={offer.featured_priority ?? 0}
            className="h-12 min-w-0 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Większa liczba oznacza wyższe miejsce przy sortowaniu wyróżnionych.
          </p>
        </label>
      </div>

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0d3d26] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <i className="fas fa-floppy-disk"></i>
          {isPending ? "Zapisywanie..." : "Zapisz zmiany"}
        </button>
        <Link
          href="/admin/oferty"
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-5 py-3 text-sm font-bold text-[#1a5f3c] no-underline transition hover:bg-[#1a5f3c] hover:text-white"
        >
          Wróć do listy ofert
        </Link>
      </div>
    </form>
  );
}

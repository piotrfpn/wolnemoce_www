"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import Link from "next/link";
import StaticFormField from "@/components/StaticFormField";
import { submitInquiry } from "./actions";

export type RfqOffer = {
  id: string;
  title: string | null;
  slug: string | null;
  branch: string | null;
  service_type: string | null;
  power_available: string | null;
  lead_time: string | null;
  status: string | null;
  companies: {
    id: string;
    name: string | null;
    slug: string | null;
    location_voivodeship: string | null;
    location_city: string | null;
    is_verified: boolean | null;
  } | null;
};

export default function RfqRequestClient({
  offer,
  requestedSlug,
}: {
  offer: RfqOffer | null;
  requestedSlug: string;
}) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const company = offer?.companies;
  const location = [company?.location_city, company?.location_voivodeship]
    .filter(Boolean)
    .join(", ");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await submitInquiry(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3d26] via-[#1a5f3c] to-[#2d8a5e] px-6 pb-16 pt-36 text-white md:pb-20">
        <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_20%_50%,white_2px,transparent_2px),radial-gradient(circle_at_80%_20%,white_1px,transparent_1px),radial-gradient(circle_at_40%_80%,white_1.5px,transparent_1.5px)] [background-size:60px_60px,40px_40px,80px_80px]" />

        <div className="relative z-10 mx-auto max-w-[1400px] min-w-0">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-5 py-2 text-sm font-medium backdrop-blur">
            <i className="fas fa-file-signature text-[#fbbf24]"></i>
            Zapytanie ofertowe RFQ
          </div>

          <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-[-1px] md:text-5xl">
            Wyślij zapytanie do firmy
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
            Zapytanie zostanie zapisane i przekazane do firmy w panelu
            WolneMoce.pl.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] min-w-0 gap-8 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="min-w-0">
          {offer ? (
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Aktywna oferta
                </span>
                {company?.is_verified ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    <i className="fas fa-check-circle mr-1"></i>
                    Zweryfikowana firma
                  </span>
                ) : null}
              </div>

              <h2 className="text-2xl font-extrabold leading-tight text-slate-900">
                {offer.title}
              </h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {company?.name ?? "Firma"}
              </p>

              <div className="mt-6 grid gap-3 text-sm text-slate-600">
                <span className="flex min-w-0 items-center gap-2">
                  <i className="fas fa-location-dot text-[#1a5f3c]"></i>
                  {location || "Polska"}
                </span>
                <span className="flex min-w-0 items-center gap-2">
                  <i className="fas fa-industry text-[#1a5f3c]"></i>
                  {offer.branch ?? "Branża"}
                </span>
                <span className="flex min-w-0 items-center gap-2">
                  <i className="fas fa-cogs text-[#1a5f3c]"></i>
                  {offer.service_type ?? "Usługa"}
                </span>
                {offer.power_available ? (
                  <span className="flex min-w-0 items-center gap-2">
                    <i className="fas fa-chart-bar text-[#1a5f3c]"></i>
                    {offer.power_available}
                  </span>
                ) : null}
                {offer.lead_time ? (
                  <span className="flex min-w-0 items-center gap-2">
                    <i className="fas fa-clock text-[#1a5f3c]"></i>
                    {offer.lead_time}
                  </span>
                ) : null}
              </div>

              {offer.slug ? (
                <Link
                  href={`/oferty/${offer.slug}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline"
                >
                  Wróć do oferty
                  <i className="fas fa-arrow-right text-xs"></i>
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1a5f3c] shadow-sm">
                <i className="fas fa-circle-info text-xl"></i>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Oferta nie jest dostępna
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {requestedSlug
                  ? "Nie znaleziono aktywnej oferty dla podanego adresu."
                  : "Wybierz aktywną ofertę, aby wysłać zapytanie do firmy."}
              </p>
              <Link href="/oferty" className="mt-6 inline-flex text-sm font-bold text-[#1a5f3c]">
                Przeglądaj oferty
              </Link>
            </div>
          )}
        </aside>

        {offer ? (
          <form
            onSubmit={handleSubmit}
            className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl md:p-8"
          >
            <input type="hidden" name="offer_id" value={offer.id} />
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Formularz zapytania
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Zapytanie zostanie zapisane i przekazane do firmy w panelu
                WolneMoce.pl.
              </p>
            </div>

            {error ? (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="grid min-w-0 gap-5 md:grid-cols-2">
              <StaticFormField label="Imię i nazwisko" name="buyer_name" icon="fas fa-user" />
              <StaticFormField label="Firma" name="buyer_company" icon="fas fa-building" />
              <StaticFormField label="Email" name="buyer_email" type="email" icon="fas fa-envelope" />
              <StaticFormField label="Telefon" name="buyer_phone" type="tel" icon="fas fa-phone" />
            </div>

            <div className="mt-10 border-t border-slate-200 pt-8">
              <h3 className="mb-5 text-xl font-extrabold text-slate-900">
                Szczegóły zapytania
              </h3>
              <div className="grid min-w-0 gap-5 md:grid-cols-2">
                <StaticFormField label="Ilość / zakres zamówienia" name="quantity_scope" icon="fas fa-boxes-stacked" />
                <StaticFormField label="Termin realizacji" name="expected_deadline" icon="fas fa-clock" />
                <StaticFormField label="Budżet orientacyjny" name="budget" icon="fas fa-wallet" />
                <div className="md:col-span-2">
                  <StaticFormField
                    label="Wiadomość / opis zapotrzebowania"
                    name="message"
                    textarea
                    rows={6}
                    placeholder="Opisz produkt, materiał, ilości, wymagania jakościowe i oczekiwany termin."
                    icon="fas fa-message"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-8 w-full btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Wysyłanie..." : "Wyślij zapytanie"}
            </button>
          </form>
        ) : (
          <div className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Formularz niedostępny
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Zapytania można wysyłać tylko do aktywnych ofert.
            </p>
            <Link href="/oferty" className="mt-6 btn btn-primary">
              Przeglądaj oferty
            </Link>
          </div>
        )}
      </section>
    </>
  );
}

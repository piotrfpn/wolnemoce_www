"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import StaticFormField from "@/components/StaticFormField";
import { categories, offers, services } from "@/lib/mockData";

const categoryOptions = categories.map((category) => ({
  label: category,
  value: category,
}));

const serviceOptions = services.map((service) => ({
  label: service,
  value: service,
}));

export default function RfqRequestClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const offerSlug = searchParams.get("oferta");
  const selectedOffer = offers.find((offer) => offer.slug === offerSlug);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/zapytanie-wyslane");
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
            Opisz zapotrzebowanie i przygotuj zapytanie
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
            Formularz jest demonstracyjny. W wersji MVP nie wysyła danych, ale
            pokazuje docelowy przepływ zapytania do wykonawcy.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] min-w-0 gap-8 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="min-w-0">
          {selectedOffer ? (
            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
              <img
                src={selectedOffer.image}
                alt={selectedOffer.imageAlt}
                className="h-56 w-full max-w-full object-cover"
              />
              <div className="p-6">
                <div className="mb-4 flex flex-wrap gap-2">
                  {selectedOffer.isPremium && (
                    <span className="rounded-full bg-[#f59e0b] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                      Premium
                    </span>
                  )}
                  {selectedOffer.isVerified && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      <i className="fas fa-check-circle mr-1"></i>
                      Zweryfikowana
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-extrabold leading-tight text-slate-900">
                  {selectedOffer.title}
                </h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {selectedOffer.company}
                </p>

                <div className="mt-6 grid gap-3 text-sm text-slate-600">
                  <span className="flex min-w-0 items-center gap-2">
                    <i className="fas fa-location-dot text-[#1a5f3c]"></i>
                    {selectedOffer.location}, {selectedOffer.province}
                  </span>
                  <span className="flex min-w-0 items-center gap-2">
                    <i className="fas fa-industry text-[#1a5f3c]"></i>
                    {selectedOffer.category}
                  </span>
                  <span className="flex min-w-0 items-center gap-2">
                    <i className="fas fa-cogs text-[#1a5f3c]"></i>
                    {selectedOffer.service}
                  </span>
                  <span className="flex min-w-0 items-center gap-2">
                    <i className="fas fa-chart-bar text-[#1a5f3c]"></i>
                    {selectedOffer.capacity}
                  </span>
                  <span className="flex min-w-0 items-center gap-2">
                    <i className="fas fa-clock text-[#1a5f3c]"></i>
                    {selectedOffer.leadTime}
                  </span>
                </div>

                <Link
                  href={`/oferty/${selectedOffer.slug}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline"
                >
                  Wróć do oferty
                  <i className="fas fa-arrow-right text-xs"></i>
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1a5f3c] shadow-sm">
                <i className="fas fa-circle-info text-xl"></i>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Ogólne zapytanie RFQ
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Wypełnij zapytanie, a nasz zespół pomoże dopasować właściwego
                wykonawcę.
              </p>
              <Link href="/oferty" className="mt-6 inline-flex text-sm font-bold text-[#1a5f3c]">
                Przeglądaj oferty
              </Link>
            </div>
          )}
        </aside>

        <form
          onSubmit={handleSubmit}
          className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl md:p-8"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Formularz zapytania
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Po kliknięciu formularz przejdzie do ekranu sukcesu bez wysyłki
              danych.
            </p>
          </div>

          <div className="grid min-w-0 gap-5 md:grid-cols-2">
            <StaticFormField label="Imię i nazwisko" name="name" icon="fas fa-user" />
            <StaticFormField label="Firma" name="company" icon="fas fa-building" />
            <StaticFormField label="Email" name="email" type="email" icon="fas fa-envelope" />
            <StaticFormField label="Telefon" name="phone" type="tel" icon="fas fa-phone" />
          </div>

          <div className="mt-10 border-t border-slate-200 pt-8">
            <h3 className="mb-5 text-xl font-extrabold text-slate-900">
              Szczegóły zapytania
            </h3>
            <div className="grid min-w-0 gap-5 md:grid-cols-2">
              <StaticFormField
                label="Branża"
                name="category"
                options={categoryOptions}
                placeholder={selectedOffer?.category ?? "Wybierz branżę"}
                icon="fas fa-industry"
              />
              <StaticFormField
                label="Rodzaj usługi"
                name="service"
                options={serviceOptions}
                placeholder={selectedOffer?.service ?? "Wybierz usługę"}
                icon="fas fa-cogs"
              />
              <StaticFormField label="Ilość / zakres zamówienia" name="quantity" icon="fas fa-boxes-stacked" />
              <StaticFormField label="Termin realizacji" name="deadline" icon="fas fa-clock" />
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

          <div className="mt-8 space-y-3 rounded-2xl bg-slate-50 p-5">
            <label className="flex min-w-0 items-start gap-3 text-sm leading-6 text-slate-600">
              <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[#1a5f3c]" />
              <span>
                Akceptuję{" "}
                <Link href="/regulamin" className="font-bold text-[#1a5f3c]">
                  regulamin
                </Link>
                .
              </span>
            </label>
            <label className="flex min-w-0 items-start gap-3 text-sm leading-6 text-slate-600">
              <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[#1a5f3c]" />
              <span>Wyrażam zgodę na kontakt w sprawie zapytania.</span>
            </label>
          </div>

          <button type="submit" className="mt-8 w-full btn btn-primary">
            Wyślij zapytanie
          </button>
        </form>
      </section>
    </>
  );
}

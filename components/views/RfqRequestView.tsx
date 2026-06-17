"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getLocalizedPath } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import StaticFormField from "@/components/StaticFormField";
import {
  formatRfqAttachmentSize,
  validateRfqAttachmentFiles,
} from "@/lib/rfqAttachments";
import type { RfqBuyerData } from "@/lib/rfqBuyerData";
import { submitInquiry } from "@/app/(legacy)/zapytanie-ofertowe/actions";

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

type RfqDraftValues = RfqBuyerData & {
  quantity_scope: string;
  expected_deadline: string;
  budget: string;
  message: string;
};

function getInitialFormValues(initialBuyerData?: RfqBuyerData): RfqDraftValues {
  return {
    buyer_name: initialBuyerData?.buyer_name ?? "",
    buyer_company: initialBuyerData?.buyer_company ?? "",
    buyer_email: initialBuyerData?.buyer_email ?? "",
    buyer_phone: initialBuyerData?.buyer_phone ?? "",
    quantity_scope: "",
    expected_deadline: "",
    budget: "",
    message: "",
  };
}

export default function RfqRequestView({
  offer,
  requestedSlug,
  initialBuyerData,
  locale = "pl",
}: {
  offer: RfqOffer | null;
  requestedSlug: string;
  initialBuyerData?: RfqBuyerData;
  locale?: Locale;
}) {
  const [error, setError] = useState("");
  const [partialSuccess, setPartialSuccess] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formValues, setFormValues] = useState<RfqDraftValues>(() =>
    getInitialFormValues(initialBuyerData)
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const company = offer?.companies;
  const location = [company?.location_city, company?.location_voivodeship]
    .filter(Boolean)
    .join(", ");
  const draftKey = offer ? `rfq_draft_${offer.id}` : "";

  useEffect(() => {
    if (!draftKey) {
      return;
    }

    try {
      const rawDraft = sessionStorage.getItem(draftKey);
      if (!rawDraft) {
        return;
      }

      const draft = JSON.parse(rawDraft) as Partial<RfqDraftValues>;
      setFormValues((currentValues) => ({
        ...currentValues,
        ...Object.fromEntries(
          Object.entries(draft).filter(([, value]) => typeof value === "string")
        ),
      }));
    } catch {
      sessionStorage.removeItem(draftKey);
    }
  }, [draftKey]);

  function getFileKey(file: File) {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }

  function mergeSelectedFiles(currentFiles: File[], newFiles: File[]) {
    const existingKeys = new Set(currentFiles.map(getFileKey));
    const uniqueNewFiles = newFiles.filter((file) => {
      const fileKey = getFileKey(file);
      if (existingKeys.has(fileKey)) {
        return false;
      }
      existingKeys.add(fileKey);
      return true;
    });

    return [...currentFiles, ...uniqueNewFiles];
  }

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(event.currentTarget.files ?? []);
    const mergedFiles = mergeSelectedFiles(selectedFiles, newFiles);
    const validationError = validateRfqAttachmentFiles(mergedFiles);
    event.currentTarget.value = "";
    setPartialSuccess("");

    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFiles(mergedFiles);
    setError("");
  }

  function removeSelectedFile(fileIndex: number) {
    const nextFiles = selectedFiles.filter((_, index) => index !== fileIndex);
    const validationError = validateRfqAttachmentFiles(nextFiles);
    setSelectedFiles(nextFiles);
    setError(validationError);
    setPartialSuccess("");
  }

  function handleFieldChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.currentTarget;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
    setPartialSuccess("");
    setIsSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) {
      return;
    }

    setError("");
    setPartialSuccess("");

    const validationError = validateRfqAttachmentFiles(selectedFiles);
    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.delete("attachments");
    selectedFiles.forEach((file) => {
      formData.append("attachments", file);
    });

    startTransition(async () => {
      const result = await submitInquiry(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.partialSuccess) {
        setPartialSuccess(result.partialSuccess);
      }

      if (result?.success) {
        if (draftKey) {
          sessionStorage.removeItem(draftKey);
        }
        setSelectedFiles([]);
        setFormValues(getInitialFormValues(initialBuyerData));
        setIsSubmitted(true);
      }
    });
  }

  function renderSuccessState() {
    return (
      <div className="min-w-0 rounded-[24px] border border-emerald-200 bg-emerald-50 p-6 shadow-sm md:p-8">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1a5f3c] shadow-sm">
          <i className="fas fa-circle-check text-2xl"></i>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">
          Zapytanie zostało wysłane
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Dziękujemy. Zapytanie zostało zapisane i przekazane firmie w panelu
          WolneMoce. Odpowiedź zależy od firmy obsługującej ofertę.
        </p>
        {partialSuccess ? (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {partialSuccess}
          </p>
        ) : null}
        <Link href={getLocalizedPath("/oferty", locale)} className="mt-6 inline-flex text-sm font-bold text-[#1a5f3c]">
          Wróć do ofert
        </Link>
      </div>
    );
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
            WolneMoce.
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
                  href={getLocalizedPath(`/oferty/${offer.slug}`, locale)}
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
              <Link href={getLocalizedPath("/oferty", locale)} className="mt-6 inline-flex text-sm font-bold text-[#1a5f3c]">
                Przeglądaj oferty
              </Link>
            </div>
          )}
        </aside>

        {offer ? (
          isSubmitted ? (
            renderSuccessState()
          ) : (
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
                  WolneMoce.
                </p>
              </div>

              {error ? (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {partialSuccess ? (
                <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {partialSuccess}
                </div>
              ) : null}

              <div className="mb-6">
                <h3 className="mb-5 text-xl font-extrabold text-slate-900">
                  1. Dane kontaktowe
                </h3>
                <div className="grid min-w-0 gap-5 md:grid-cols-2">
                  <StaticFormField
                    label="Imię i nazwisko"
                    name="buyer_name"
                    icon="fas fa-user"
                    value={formValues.buyer_name}
                    onChange={handleFieldChange}
                    required
                  />
                  <StaticFormField
                    label="Firma"
                    name="buyer_company"
                    icon="fas fa-building"
                    value={formValues.buyer_company}
                    onChange={handleFieldChange}
                    required
                  />
                  <StaticFormField
                    label="Email"
                    name="buyer_email"
                    type="email"
                    icon="fas fa-envelope"
                    placeholder="jan.kowalski@firma.pl"
                    value={formValues.buyer_email}
                    onChange={handleFieldChange}
                    required
                  />
                  <StaticFormField
                    label="Telefon"
                    name="buyer_phone"
                    type="tel"
                    icon="fas fa-phone"
                    placeholder="np. 500 123 456"
                    value={formValues.buyer_phone}
                    onChange={handleFieldChange}
                    required
                  />
                </div>
              </div>

              <div className="mt-10 border-t border-slate-200 pt-8">
                <h3 className="mb-5 text-xl font-extrabold text-slate-900">
                  2. Szczegóły zapytania
                </h3>
                <div className="grid min-w-0 gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <StaticFormField
                      label="Wiadomość / opis zapotrzebowania"
                      name="message"
                      textarea
                      rows={6}
                      placeholder="Przykład: Szukamy wykonawcy 200 szt. detalu CNC z aluminium (stop 7075), termin do końca miesiąca. Rysunek techniczny przesyłam w załączniku."
                      icon="fas fa-message"
                      value={formValues.message}
                      onChange={handleFieldChange}
                      required
                    />
                    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-blue-900">
                        <i className="fas fa-lightbulb text-blue-500"></i>
                        Co warto dopisać w zapytaniu?
                      </h4>
                      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">
                        <li>materiał / technologia,</li>
                        <li>oczekiwana ilość lub zakres prac,</li>
                        <li>wymagania jakościowe (np. tolerancje),</li>
                        <li>informacje o załącznikach (np. rysunek techniczny).</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 border-t border-slate-200 pt-8">
                <h3 className="mb-5 text-xl font-extrabold text-slate-900">
                  3. Termin / ilość / budżet
                </h3>
                <div className="grid min-w-0 gap-5 md:grid-cols-2">
                  <StaticFormField
                    label="Ilość / zakres zamówienia"
                    name="quantity_scope"
                    icon="fas fa-boxes-stacked"
                    placeholder="np. 200 sztuk, 500h"
                    value={formValues.quantity_scope}
                    onChange={handleFieldChange}
                    optional
                  />
                  <StaticFormField
                    label="Termin realizacji"
                    name="expected_deadline"
                    icon="fas fa-clock"
                    placeholder="np. do końca miesiąca"
                    value={formValues.expected_deadline}
                    onChange={handleFieldChange}
                    optional
                  />
                  <StaticFormField
                    label="Budżet orientacyjny"
                    name="budget"
                    icon="fas fa-wallet"
                    placeholder="np. 5000 PLN, do negocjacji"
                    value={formValues.budget}
                    onChange={handleFieldChange}
                    optional
                  />
                </div>
              </div>

              <div className="mt-10 border-t border-slate-200 pt-8">
                <h3 className="text-xl font-extrabold text-slate-900">
                  4. Załączniki techniczne <span className="ml-1 text-sm font-normal lowercase text-slate-400">(opcjonalnie)</span>
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Załącz rysunek techniczny, specyfikację lub zdjęcie detalu, jeśli pomoże to firmie szybciej przygotować odpowiedź.
                </p>
                <label className="mt-5 block min-w-0">
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <i className="fas fa-paperclip text-[#1a5f3c]"></i>
                    Załączniki
                  </span>
                  <input
                    type="file"
                    name="attachments"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    onChange={handleAttachmentChange}
                    className="sr-only"
                  />
                  <span className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-bold text-[#1a5f3c] transition hover:border-[#1a5f3c] hover:bg-[#1a5f3c]/5">
                    <i className="fas fa-paperclip"></i>
                    Dodaj załączniki
                  </span>
                </label>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Możesz dodać maksymalnie 3 pliki: PDF, Word, Excel, JPG lub PNG.
                  Maksymalnie 10 MB na plik.
                  <br />
                  Pliki zostaną wysłane razem z zapytaniem.
                </p>

                {selectedFiles.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      Załączniki są gotowe do wysłania. Zostaną przesłane po kliknięciu
                      „Wyślij zapytanie”.
                    </div>
                    {selectedFiles.map((file, index) => (
                      <div
                        key={getFileKey(file)}
                        className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <span className="block min-w-0 truncate font-semibold text-slate-800">
                            {file.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatRfqAttachmentSize(file.size)}
                          </span>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                            Gotowy do wysłania
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSelectedFile(index)}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:text-red-600"
                          >
                            Usuń
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="mt-10 border-t border-slate-200 pt-8">
                <h3 className="mb-5 text-xl font-extrabold text-slate-900">
                  5. Podsumowanie i wysyłka
                </h3>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Wysyłanie zapytania i załączników...
                    </>
                  ) : (
                    "Wyślij zapytanie"
                  )}
                </button>
              </div>
            </form>
          )
        ) : (
          <div className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Formularz niedostępny
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Zapytania można wysyłać tylko do aktywnych ofert.
            </p>
            <Link href={getLocalizedPath("/oferty", locale)} className="mt-6 btn btn-primary">
              Przeglądaj oferty
            </Link>
          </div>
        )}
      </section>
    </>
  );
}

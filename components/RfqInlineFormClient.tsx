"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState, useTransition } from "react";
import Link from "next/link";
import StaticFormField from "@/components/StaticFormField";
import {
  formatRfqAttachmentSize,
  validateRfqAttachmentFiles,
} from "@/lib/rfqAttachments";
import { submitInquiry } from "@/app/zapytanie-ofertowe/actions";

type RfqInlineFormClientProps = {
  offerId: string;
  offerSlug: string | null;
};

export default function RfqInlineFormClient({
  offerId,
  offerSlug,
}: RfqInlineFormClientProps) {
  const [error, setError] = useState("");
  const [partialSuccess, setPartialSuccess] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();

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
      }
      if (result?.partialSuccess) {
        setPartialSuccess(result.partialSuccess);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="min-w-0">
      <input type="hidden" name="offer_id" value={offerId} />

      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900">
          Zapytaj o ofertę
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

      {partialSuccess ? (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {partialSuccess}
        </div>
      ) : null}

      <div className="space-y-4">
        <StaticFormField label="Imię i nazwisko" name="buyer_name" icon="fas fa-user" />
        <StaticFormField label="Firma" name="buyer_company" icon="fas fa-building" />
        <StaticFormField label="Email" name="buyer_email" type="email" icon="fas fa-envelope" />
        <StaticFormField label="Telefon" name="buyer_phone" type="tel" icon="fas fa-phone" />
        <StaticFormField
          label="Ilość / zakres zamówienia"
          name="quantity_scope"
          icon="fas fa-boxes-stacked"
        />
        <StaticFormField label="Termin realizacji" name="expected_deadline" icon="fas fa-clock" />
        <StaticFormField label="Budżet orientacyjny" name="budget" icon="fas fa-wallet" />
        <StaticFormField
          label="Wiadomość"
          name="message"
          textarea
          rows={5}
          placeholder="Opisz krótko zapotrzebowanie, materiał, ilość i oczekiwany termin."
          icon="fas fa-message"
        />
      </div>

      <div className="mt-6 border-t border-slate-200 pt-6">
        <h3 className="text-lg font-extrabold text-slate-900">Załączniki</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Dodaj rysunek, specyfikację, zdjęcie detalu lub plik z wymaganiami.
        </p>
        <label className="mt-4 block min-w-0">
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

      <button
        type="submit"
        disabled={isPending}
        className="mt-8 w-full btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
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

      {offerSlug ? (
        <Link
          href={`/zapytanie-ofertowe?oferta=${offerSlug}`}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline"
        >
          Otwórz pełny formularz zapytania
          <i className="fas fa-arrow-right text-xs"></i>
        </Link>
      ) : null}
    </form>
  );
}

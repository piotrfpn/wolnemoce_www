"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import StaticFormField from "@/components/StaticFormField";
import {
  formatRfqAttachmentSize,
  validateRfqAttachmentFiles,
} from "@/lib/rfqAttachments";
import { submitInquiry } from "@/app/(legacy)/zapytanie-ofertowe/actions";
import type { RfqBuyerData } from "@/lib/rfqBuyerData";
import type { Dictionary } from "@/lib/i18n/types";

type RfqRuntimeMessageKey =
  | "errorMissingActiveOffer"
  | "errorNameRequired"
  | "errorCompanyRequired"
  | "errorInvalidEmail"
  | "errorInvalidPhone"
  | "errorMessageTooShort"
  | "errorTooManyAttachments"
  | "errorAttachmentTooLarge"
  | "errorAttachmentUnsupportedType"
  | "errorOfferUnavailable"
  | "errorSubmitFailed"
  | "partialAttachmentsUploadFailed";

const RFQ_RUNTIME_MESSAGE_KEYS: Record<string, RfqRuntimeMessageKey> = {
  "Brak aktywnej oferty dla zapytania.": "errorMissingActiveOffer",
  "Podaj imię i nazwisko.": "errorNameRequired",
  "Podaj nazwę firmy.": "errorCompanyRequired",
  "Podaj poprawny adres email.": "errorInvalidEmail",
  "Podaj poprawny numer telefonu.": "errorInvalidPhone",
  "Wiadomość musi mieć co najmniej 10 znaków.": "errorMessageTooShort",
  "Możesz dodać maksymalnie 3 załączniki.": "errorTooManyAttachments",
  "Pojedynczy załącznik może mieć maksymalnie 10 MB.":
    "errorAttachmentTooLarge",
  "Dozwolone formaty załączników to PDF, Word, Excel, JPG lub PNG.":
    "errorAttachmentUnsupportedType",
  "Oferta nie jest dostępna albo nie jest aktywna.":
    "errorOfferUnavailable",
  "Nie udało się wysłać zapytania. Spróbuj ponownie za chwilę.":
    "errorSubmitFailed",
  "Zapytanie zostało wysłane, ale nie wszystkie załączniki udało się wgrać.":
    "partialAttachmentsUploadFailed",
};

function localizeRfqRuntimeMessage(
  message: string,
  t: Dictionary["rfqInlineForm"],
  fallback: "unexpectedError" | "partialSuccessFallback" = "unexpectedError"
) {
  if (!message) {
    return "";
  }

  const messageKey = RFQ_RUNTIME_MESSAGE_KEYS[message];

  return messageKey ? t[messageKey] : t[fallback];
}

type RfqInlineFormClientProps = {
  offerId: string;
  offerSlug: string | null;
  offerTitle?: string | null;
  companyName?: string | null;
  initialBuyerData?: RfqBuyerData;
  t: Dictionary["rfqInlineForm"];
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

export default function RfqInlineFormClient({
  offerId,
  offerSlug,
  offerTitle,
  companyName,
  initialBuyerData,
  t,
}: RfqInlineFormClientProps) {
  const [error, setError] = useState("");
  const [partialSuccess, setPartialSuccess] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formValues, setFormValues] = useState<RfqDraftValues>(() =>
    getInitialFormValues(initialBuyerData)
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const draftKey = `rfq_draft_${offerId}`;

  useEffect(() => {
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
      setError(localizeRfqRuntimeMessage(validationError, t));
      return;
    }

    setSelectedFiles(mergedFiles);
    setError("");
  }

  function removeSelectedFile(fileIndex: number) {
    const nextFiles = selectedFiles.filter((_, index) => index !== fileIndex);
    const validationError = validateRfqAttachmentFiles(nextFiles);
    setSelectedFiles(nextFiles);
    setError(localizeRfqRuntimeMessage(validationError, t));
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

  function saveDraftToSession() {
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(formValues));
    } catch {
      // Session storage is only a client-side handoff between RFQ screens.
    }
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
      setError(localizeRfqRuntimeMessage(validationError, t));
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
        setError(localizeRfqRuntimeMessage(result.error, t));
        return;
      }

      if (result?.partialSuccess) {
        setPartialSuccess(
          localizeRfqRuntimeMessage(
            result.partialSuccess,
            t,
            "partialSuccessFallback"
          )
        );
      }

      if (result?.success) {
        sessionStorage.removeItem(draftKey);
        setSelectedFiles([]);
        setIsSubmitted(true);
      }
    });
  }

  if (isSubmitted) {
    return (
      <div className="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#1a5f3c] shadow-sm">
          <i className="fas fa-circle-check text-xl"></i>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">
          {t.formSuccessTitle}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {t.formSuccessDescription}
        </p>
        {partialSuccess ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {partialSuccess}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="min-w-0">
      <input type="hidden" name="offer_id" value={offerId} />
      <input type="hidden" name="offer_title" value={offerTitle ?? ""} />
      <input type="hidden" name="company_name" value={companyName ?? ""} />

      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900">
          {t.formTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {t.formDescription}
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
        <StaticFormField
          label={t.fieldName}
          name="buyer_name"
          icon="fas fa-user"
          value={formValues.buyer_name}
          onChange={handleFieldChange}
        />
        <StaticFormField
          label={t.fieldCompany}
          name="buyer_company"
          icon="fas fa-building"
          value={formValues.buyer_company}
          onChange={handleFieldChange}
        />
        <StaticFormField
          label={t.fieldEmail}
          name="buyer_email"
          type="email"
          icon="fas fa-envelope"
          value={formValues.buyer_email}
          onChange={handleFieldChange}
        />
        <StaticFormField
          label={t.fieldPhone}
          name="buyer_phone"
          type="tel"
          icon="fas fa-phone"
          value={formValues.buyer_phone}
          onChange={handleFieldChange}
        />
        <StaticFormField
          label={t.fieldQuantityScope}
          name="quantity_scope"
          icon="fas fa-boxes-stacked"
          value={formValues.quantity_scope}
          onChange={handleFieldChange}
        />
        <StaticFormField
          label={t.fieldDeadline}
          name="expected_deadline"
          icon="fas fa-clock"
          value={formValues.expected_deadline}
          onChange={handleFieldChange}
        />
        <StaticFormField
          label={t.fieldBudget}
          name="budget"
          icon="fas fa-wallet"
          value={formValues.budget}
          onChange={handleFieldChange}
        />
        <StaticFormField
          label={t.fieldMessage}
          name="message"
          textarea
          rows={5}
          placeholder={t.fieldMessagePlaceholder}
          icon="fas fa-message"
          value={formValues.message}
          onChange={handleFieldChange}
        />
      </div>

      <div className="mt-6 border-t border-slate-200 pt-6">
        <h3 className="text-lg font-extrabold text-slate-900">{t.attachmentsTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {t.attachmentsDescription}
        </p>
        <label className="mt-4 block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-paperclip text-[#1a5f3c]"></i>
            {t.attachmentsTitle}
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
            {t.addAttachments}
          </span>
        </label>
        <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-500">
          {t.attachmentsLimits}
        </p>

        {selectedFiles.length > 0 ? (
          <div className="mt-4 space-y-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {t.attachmentsReady}
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
                    {t.attachmentReadyBadge}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(index)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:text-red-600"
                  >
                    {t.attachmentRemove}
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
            {t.formSubmitting}
          </>
        ) : (
          t.formSubmit
        )}
      </button>

      {offerSlug ? (
        <Link
          href={`/zapytanie-ofertowe?oferta=${offerSlug}`}
          onClick={saveDraftToSession}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline"
        >
          {t.openFullForm}
          <i className="fas fa-arrow-right text-xs"></i>
        </Link>
      ) : null}
    </form>
  );
}

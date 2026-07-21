"use client";

import { type FormEvent, useEffect, useRef, useState, useId } from "react";
import { createPortal } from "react-dom";
import { type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";

export type CompanyInquiryTranslations = Dictionary["companyInquiry"];

type CompanyInquiryModalClientProps = {
  companyId: string;
  companyName: string;
  locale: Locale;
  translations: CompanyInquiryTranslations;
};

const inputClass =
  "min-w-0 max-w-full w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10 disabled:cursor-not-allowed disabled:bg-slate-100";

export default function CompanyInquiryModalClient({
  companyId,
  companyName,
  locale,
  translations,
}: CompanyInquiryModalClientProps) {
  const honeypotId = useId();
  const honeypotDomName = `wm_check_${honeypotId.replace(/:/g, "")}`;

  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);
  const [senderName, setSenderName] = useState("");
  const [senderCompanyName, setSenderCompanyName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypotNote, setHoneypotNote] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  function resetForm() {
    setSenderName("");
    setSenderCompanyName("");
    setSenderEmail("");
    setSenderPhone("");
    setSubject("");
    setMessage("");
    setHoneypotNote("");
    setErrorMsg(null);
  }

  function openModal() {
    setErrorMsg(null);
    setIsSuccess(false);
    setIsOpen(true);
  }

  function closeModal() {
    if (isSubmitting) return;
    setIsOpen(false);
    if (isSuccess) {
      resetForm();
      setIsSuccess(false);
    }
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, isSubmitting]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      setErrorMsg(translations.validationError);
      return;
    }

    const trimmedName = senderName.trim();
    const trimmedCompanyName = senderCompanyName.trim();
    const trimmedEmail = senderEmail.trim();
    const trimmedPhone = senderPhone.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    // Client-side length checks after trim (relying on HTML5 constraints for format mismatch)
    if (
      trimmedName.length < 2 ||
      trimmedName.length > 120 ||
      trimmedCompanyName.length < 2 ||
      trimmedCompanyName.length > 160 ||
      !trimmedEmail ||
      trimmedEmail.length > 254 ||
      trimmedSubject.length < 3 ||
      trimmedSubject.length > 200 ||
      trimmedMessage.length < 20 ||
      trimmedMessage.length > 3000 ||
      trimmedPhone.length > 50
    ) {
      setErrorMsg(translations.validationError);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/company-inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId,
          senderName: trimmedName,
          senderCompanyName: trimmedCompanyName,
          senderEmail: trimmedEmail,
          senderPhone: trimmedPhone || null,
          subject: trimmedSubject,
          message: trimmedMessage,
          locale,
          company_registration_note: honeypotNote,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        resetForm();
      } else {
        if (response.status === 400) {
          setErrorMsg(translations.validationError);
        } else if (response.status === 429) {
          setErrorMsg(translations.rateLimitError);
        } else if (response.status === 500 || response.status === 503) {
          setErrorMsg(translations.temporaryError);
        } else {
          setErrorMsg(translations.genericError);
        }
      }
    } catch {
      setErrorMsg(translations.networkError);
    } finally {
      setIsSubmitting(false);
    }
  }

  const companyContextText = translations.companyContext.replace(
    "{companyName}",
    companyName
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openModal}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#14492e]"
      >
        <i className="fas fa-paper-plane text-xs"></i>
        {translations.trigger}
      </button>

      {isMounted && isOpen ? createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-3 sm:p-6 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="company-inquiry-modal-title"
            aria-describedby="company-inquiry-modal-desc"
            className="relative w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl"
          >
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              aria-label={translations.close}
              className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50"
            >
              <i className="fas fa-times"></i>
            </button>

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center p-6 md:p-8 py-12 text-center overflow-y-auto">
                <div className="mx-auto mb-4 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <i className="fas fa-check text-2xl"></i>
                </div>
                <h3
                  id="company-inquiry-modal-title"
                  className="text-2xl font-extrabold text-slate-900"
                >
                  {translations.successTitle}
                </h3>
                <p
                  id="company-inquiry-modal-desc"
                  className="mt-3 text-sm leading-6 text-slate-600"
                >
                  {translations.successMessage}
                </p>
                <div className="mt-8 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    {translations.close}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Header (shrink-0) */}
                <div className="shrink-0 p-6 md:p-8 pb-4 border-b border-slate-100 pr-16">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#1a5f3c]">
                    <i className="fas fa-[#1a5f3c] fa-building"></i>
                    {companyContextText}
                  </div>
                  <h2
                    id="company-inquiry-modal-title"
                    className="text-2xl font-extrabold text-slate-900"
                  >
                    {translations.title}
                  </h2>
                  <p
                    id="company-inquiry-modal-desc"
                    className="mt-2 text-sm leading-6 text-slate-500"
                  >
                    {translations.description}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
                  {/* Scrollable body */}
                  <div className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8 space-y-5">
                    {errorMsg ? (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <i className="fas fa-exclamation-circle mr-2"></i>
                        {errorMsg}
                      </div>
                    ) : null}

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <label className="block min-w-0">
                        <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                          <i className="fas fa-user text-[#1a5f3c]"></i>
                          {translations.senderNameLabel} *
                        </span>
                        <input
                          ref={firstInputRef}
                          type="text"
                          name="senderName"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          required
                          minLength={2}
                          maxLength={120}
                          autoComplete="name"
                          placeholder={translations.senderNamePlaceholder}
                          disabled={isSubmitting}
                          className={inputClass}
                        />
                      </label>

                      <label className="block min-w-0">
                        <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                          <i className="fas fa-building text-[#1a5f3c]"></i>
                          {translations.senderCompanyNameLabel} *
                        </span>
                        <input
                          type="text"
                          name="senderCompanyName"
                          value={senderCompanyName}
                          onChange={(e) => setSenderCompanyName(e.target.value)}
                          required
                          minLength={2}
                          maxLength={160}
                          autoComplete="organization"
                          placeholder={translations.senderCompanyNamePlaceholder}
                          disabled={isSubmitting}
                          className={inputClass}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <label className="block min-w-0">
                        <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                          <i className="fas fa-envelope text-[#1a5f3c]"></i>
                          {translations.senderEmailLabel} *
                        </span>
                        <input
                          type="email"
                          name="senderEmail"
                          value={senderEmail}
                          onChange={(e) => setSenderEmail(e.target.value)}
                          required
                          maxLength={254}
                          autoComplete="email"
                          placeholder={translations.senderEmailPlaceholder}
                          disabled={isSubmitting}
                          className={inputClass}
                        />
                      </label>

                      <label className="block min-w-0">
                        <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                          <i className="fas fa-phone text-[#1a5f3c]"></i>
                          {translations.senderPhoneLabel}{" "}
                          <span className="text-slate-400 font-normal">
                            {translations.senderPhoneOptional}
                          </span>
                        </span>
                        <input
                          type="tel"
                          name="senderPhone"
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value)}
                          maxLength={50}
                          autoComplete="tel"
                          placeholder={translations.senderPhonePlaceholder}
                          disabled={isSubmitting}
                          className={inputClass}
                        />
                      </label>
                    </div>

                    <label className="block min-w-0">
                      <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <i className="fas fa-tag text-[#1a5f3c]"></i>
                        {translations.subjectLabel} *
                      </span>
                      <input
                        type="text"
                        name="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        minLength={3}
                        maxLength={200}
                        placeholder={translations.subjectPlaceholder}
                        disabled={isSubmitting}
                        className={inputClass}
                      />
                    </label>

                    <label className="block min-w-0">
                      <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <i className="fas fa-message text-[#1a5f3c]"></i>
                        {translations.messageLabel} *
                      </span>
                      <textarea
                        name="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        minLength={20}
                        maxLength={3000}
                        rows={4}
                        placeholder={translations.messagePlaceholder}
                        disabled={isSubmitting}
                        className={inputClass}
                      />
                    </label>

                    {/* Keep the DOM field name neutral to prevent browser/password-manager autofill. */}
                    {/* The backend contract still receives it as company_registration_note. */}
                    <input
                      type="text"
                      name={honeypotDomName}
                      value={honeypotNote}
                      onChange={(e) => setHoneypotNote(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      data-1p-ignore="true"
                      data-lpignore="true"
                      data-bwignore="true"
                      data-form-type="other"
                      inputMode="none"
                      className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
                    />
                  </div>

                  {/* Footer (shrink-0) */}
                  <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-6 py-4 md:px-8">
                    <div className="flex flex-col gap-4">
                      {/* Privacy Note Row */}
                      <div className="flex items-start gap-2 text-xs leading-relaxed text-slate-500 text-left w-full">
                        <i className="fas fa-shield-halved mt-0.5 shrink-0 text-[#1a5f3c]"></i>
                        <span>{translations.privacyNote}</span>
                      </div>

                      {/* Buttons Row */}
                      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={closeModal}
                          disabled={isSubmitting}
                          className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                          {translations.cancel}
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#14492e] disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                        >
                          {isSubmitting ? (
                            <>
                              <i className="fas fa-spinner fa-spin text-xs"></i>
                              {translations.submitting}
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane text-xs"></i>
                              {translations.submit}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}

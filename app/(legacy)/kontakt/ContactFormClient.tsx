"use client";

import { type FormEvent, useState } from "react";
import { submitContactMessage } from "./actions";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type ContactFormClientProps = {
  initialTopic?: string;
  initialName?: string;
  initialCompanyName?: string;
  initialEmail?: string;
  initialPhone?: string;
  initialMessage?: string;
  source?: string;
  locale?: Locale;
};

const inputClass =
  "min-w-0 max-w-full w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10 disabled:cursor-not-allowed disabled:bg-slate-100";

function Field({
  label,
  name,
  icon,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  textarea = false,
}: {
  label: string;
  name: string;
  icon: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        <i className={`${icon} text-[#1a5f3c]`}></i>
        {label}
      </span>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          rows={5}
          placeholder={placeholder}
          className={inputClass}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </label>
  );
}

export default function ContactFormClient({
  initialTopic = "",
  initialName = "",
  initialCompanyName = "",
  initialEmail = "",
  initialPhone = "",
  initialMessage = "",
  source = "contact",
  locale = defaultLocale,
}: ContactFormClientProps) {
  const labels = getDictionary(locale).contactPage.form;
  const [name, setName] = useState(initialName);
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [topic, setTopic] = useState(initialTopic);
  const [message, setMessage] = useState(initialMessage);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const result = await submitContactMessage(formData);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setSuccess(result.success ?? labels.success);
    form.reset();
    setName(initialName);
    setCompanyName(initialCompanyName);
    setEmail(initialEmail);
    setPhone(initialPhone);
    setTopic(initialTopic);
    setMessage(initialMessage);
    setIsSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
    >
      <input type="hidden" name="source" value={source} />
      <input
        type="text"
        name="company_registration_note"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
      />

      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900">
          {labels.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {labels.description}
        </p>
      </div>

      {error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label={labels.name}
          name="name"
          icon="fas fa-user"
          value={name}
          onChange={setName}
          required
        />
        <Field
          label={labels.company}
          name="company_name"
          icon="fas fa-building"
          value={companyName}
          onChange={setCompanyName}
        />
        <Field
          label={labels.email}
          name="email"
          type="email"
          icon="fas fa-envelope"
          value={email}
          onChange={setEmail}
          required
        />
        <Field
          label={labels.phone}
          name="phone"
          type="tel"
          icon="fas fa-phone"
          value={phone}
          onChange={setPhone}
        />
        <div className="md:col-span-2">
          <Field
            label={labels.topic}
            name="topic"
            placeholder={labels.topicPlaceholder}
            icon="fas fa-tag"
            value={topic}
            onChange={setTopic}
          />
        </div>
        <div className="md:col-span-2">
          <Field
            label={labels.message}
            name="message"
            textarea
            placeholder={labels.messagePlaceholder}
            icon="fas fa-message"
            value={message}
            onChange={setMessage}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}

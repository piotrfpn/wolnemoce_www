"use client";

import { useState, useTransition } from "react";
import { updateAccountDetails } from "./actions";

type AccountSettingsFormProps = {
  initialFullName: string;
  initialPhone: string;
  email: string;
  t: {
    accountDetailsTitle: string;
    accountDetailsDescription: string;
    fullNameLabel: string;
    phoneLabel: string;
    emailReadonlyDisclaimer: string;
    saveAccountDetails: string;
    accountDetailsSaved: string;
    accountDetailsError: string;
    email: string;
  };
};

export default function AccountSettingsForm({
  initialFullName,
  initialPhone,
  email,
  t,
}: AccountSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateAccountDetails(formData);
      if (result.success) {
        setMessage({ type: "success", text: t.accountDetailsSaved });
      } else {
        setMessage({ type: "error", text: t.accountDetailsError });
      }
    });
  }

  return (
    <section className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
          <i className="fas fa-user-pen"></i>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
            {t.accountDetailsTitle}
          </p>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {t.accountDetailsTitle}
          </h2>
        </div>
      </div>
      <p className="mb-6 text-sm leading-6 text-slate-500">
        {t.accountDetailsDescription}
      </p>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">
            {t.fullNameLabel}
          </label>
          <input
            type="text"
            name="fullName"
            defaultValue={initialFullName}
            maxLength={120}
            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#1a5f3c] focus:ring-[#1a5f3c]"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">
            {t.phoneLabel}
          </label>
          <input
            type="text"
            name="phone"
            defaultValue={initialPhone}
            maxLength={30}
            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#1a5f3c] focus:ring-[#1a5f3c]"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">
            {t.email}
          </label>
          <input
            type="email"
            defaultValue={email}
            readOnly
            className="w-full rounded-xl border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 opacity-70 cursor-not-allowed"
          />
          <p className="mt-2 text-xs text-slate-500">
            {t.emailReadonlyDisclaimer}
          </p>
        </div>

        {message && (
          <div
            className={`rounded-xl p-4 text-sm font-bold ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary mt-6 w-full md:w-auto"
        >
          {isPending ? <i className="fas fa-spinner fa-spin mr-2" /> : null}
          {t.saveAccountDetails}
        </button>
      </form>
    </section>
  );
}

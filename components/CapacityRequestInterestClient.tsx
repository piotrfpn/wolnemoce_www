"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitCapacityRequestInterest } from "@/app/(legacy)/zapytania/actions";

type CapacityRequestInterestClientProps = {
  capacityRequestId: string;
  returnTo: string;
  labels: {
    title: string;
    description: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successDescription: string;
    genericError: string;
  };
};

export default function CapacityRequestInterestClient({
  capacityRequestId,
  returnTo,
  labels,
}: CapacityRequestInterestClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleSubmit() {
    setError("");

    startTransition(async () => {
      try {
        const result = await submitCapacityRequestInterest(capacityRequestId, returnTo);

        if (result.redirectTo) {
          router.push(result.redirectTo);
          return;
        }

        if (result.error) {
          setError(labels.genericError);
          return;
        }

        if (result.success) {
          setIsSubmitted(true);
          router.refresh();
        }
      } catch {
        setError(labels.genericError);
      }
    });
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
        <i className="fas fa-handshake"></i>
      </div>
      <h2 className="text-2xl font-extrabold text-slate-900">
        {labels.title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        {labels.description}
      </p>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isSubmitted ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
          <p className="font-bold">{labels.successTitle}</p>
          <p className="mt-1">{labels.successDescription}</p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending || isSubmitted}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0d3d26] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <i className={isPending ? "fas fa-spinner fa-spin" : "fas fa-paper-plane"}></i>
        {isPending ? labels.submitting : labels.submit}
      </button>
    </div>
  );
}

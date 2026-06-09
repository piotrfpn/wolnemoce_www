"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitCapacityRequestInterest } from "@/app/zapytania/actions";

type CapacityRequestInterestClientProps = {
  capacityRequestId: string;
  returnTo: string;
};

export default function CapacityRequestInterestClient({
  capacityRequestId,
  returnTo,
}: CapacityRequestInterestClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    setError("");
    setMessage("");

    startTransition(async () => {
      const result = await submitCapacityRequestInterest(capacityRequestId, returnTo);

      if (result.redirectTo) {
        router.push(result.redirectTo);
        return;
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.success) {
        setMessage(result.success);
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
        <i className="fas fa-handshake"></i>
      </div>
      <h2 className="text-2xl font-extrabold text-slate-900">
        Chcesz wykonać to zlecenie?
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Zapisz zainteresowanie. Dane kontaktowe zlecającego pozostają ukryte i
        nie są automatycznie ujawniane.
      </p>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
          {message}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending || Boolean(message)}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0d3d26] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <i className={isPending ? "fas fa-spinner fa-spin" : "fas fa-paper-plane"}></i>
        {isPending ? "Zapisywanie..." : "Jestem zainteresowany"}
      </button>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { updateCompanyOfferLimitAction } from "../actions";
import { useRouter } from "next/navigation";

interface EntitlementHistoryItem {
  id: string;
  created_at: string;
  old_value: string | null;
  new_value: string | null;
  reason: string;
  admin_email: string | null;
  changed_by: string;
}

interface AdminCompanyOfferLimitClientProps {
  companyId: string;
  customLimit: number | null;
  limitHistory: EntitlementHistoryItem[];
}

export default function AdminCompanyOfferLimitClient({
  companyId,
  customLimit,
  limitHistory,
}: AdminCompanyOfferLimitClientProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [inputLimit, setInputLimit] = useState(customLimit !== null ? String(customLimit) : "");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdateLimit = () => {
    const parsedLimit = inputLimit.trim() === "" ? null : parseInt(inputLimit, 10);

    if (parsedLimit !== null && (isNaN(parsedLimit) || parsedLimit < 0)) {
      setError("Limit musi być liczbą nieujemną.");
      return;
    }

    if (parsedLimit === customLimit) {
      setError("Firma ma już ustawiony ten limit.");
      return;
    }
    
    if (reason.trim().length < 3) {
      setError("Podaj powód zmiany limitu (minimum 3 znaki).");
      return;
    }

    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateCompanyOfferLimitAction(companyId, parsedLimit, reason);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setReason("");
        // Update the current state to reflect the new saved value locally without needing full reload immediately for visual feedback
        router.refresh();
      }
    });
  };

  const handleClearLimit = () => {
    setInputLimit("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-6 mt-8">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">
          <i className="fas fa-sliders text-slate-400 mr-2"></i>
          Indywidualny limit ofert
        </h2>
        
        <div className="mb-6">
          <p className="text-sm text-slate-600 mb-1">Obecny limit:</p>
          <div className="font-bold text-lg text-slate-900">
            {customLimit !== null ? (
              <span className="text-[#1a5f3c]">Indywidualny limit: {customLimit}</span>
            ) : (
              <span className="text-slate-500">Brak indywidualnego limitu — używany jest limit z planu</span>
            )}
          </div>
        </div>

        <div className="mb-4 text-sm text-slate-600">
          <p className="mb-2">Indywidualny limit nadpisuje limit wynikający z planu. Pusta wartość oznacza powrót do domyślnego limitu planu.</p>
          <p className="text-xs text-slate-500 italic">Najczęściej używane dla firm ENTERPRISE.</p>
        </div>

        <div className="grid gap-4 mb-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Nowy limit
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={inputLimit}
                onChange={(e) => setInputLimit(e.target.value)}
                disabled={isPending}
                placeholder="np. 20"
                className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-[#1a5f3c] focus:outline-none focus:ring-1 focus:ring-[#1a5f3c] disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleClearLimit}
                disabled={isPending || inputLimit === ""}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap"
                title="Wyczyść indywidualny limit"
              >
                Wyczyść
              </button>
            </div>
          </div>
          
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Powód zmiany limitu
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isPending}
              placeholder="Napisz dlaczego limit jest zmieniany..."
              className="w-full min-h-[80px] rounded-xl border border-slate-200 py-2.5 px-3 text-sm focus:border-[#1a5f3c] focus:outline-none focus:ring-1 focus:ring-[#1a5f3c] disabled:opacity-50 resize-y"
            ></textarea>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Pomyślnie zmieniono limit firmy.
          </div>
        )}

        <button
          onClick={handleUpdateLimit}
          disabled={
            isPending ||
            (inputLimit.trim() === "" ? null : parseInt(inputLimit, 10)) === customLimit ||
            reason.trim().length < 3
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] py-3 text-sm font-bold text-white transition hover:bg-[#13482d] disabled:opacity-50 disabled:cursor-not-allowed md:w-auto md:px-6"
        >
          {isPending ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Zapisywanie...
            </>
          ) : (
            <>
              <i className="fas fa-save"></i>
              Zmień limit
            </>
          )}
        </button>
      </div>

      {limitHistory.length > 0 && (
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            <i className="fas fa-history text-slate-400 mr-2"></i>
            Historia zmian limitu
          </h2>
          <div className="space-y-4">
            {limitHistory.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <span className="text-slate-500">{item.old_value ?? "Domyślna planu"}</span>
                    <i className="fas fa-arrow-right text-slate-300"></i>
                    <span className="text-[#1a5f3c]">
                      {item.new_value ?? (item.old_value !== null ? "Wyczyszczono" : "Domyślna planu")}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {formatDate(item.created_at)}
                  </span>
                </div>
                <div className="text-sm text-slate-700 mb-2">
                  <strong>Powód:</strong> {item.reason}
                </div>
                <div className="text-xs text-slate-500">
                  Przez: {item.admin_email || item.changed_by}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

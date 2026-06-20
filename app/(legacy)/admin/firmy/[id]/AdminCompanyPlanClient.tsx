"use client";

import { useState, useTransition } from "react";
import { updateCompanyPlanAction } from "../actions";
import { useRouter } from "next/navigation";

interface PlanHistoryItem {
  id: string;
  created_at: string;
  old_plan: string | null;
  new_plan: string;
  reason: string;
  admin_email: string | null;
  changed_by: string;
}

interface AdminCompanyPlanClientProps {
  companyId: string;
  currentPlan: string | null;
  planHistory: PlanHistoryItem[];
}

export default function AdminCompanyPlanClient({
  companyId,
  currentPlan,
  planHistory,
}: AdminCompanyPlanClientProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] = useState(currentPlan || "free");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdatePlan = () => {
    if (selectedPlan === currentPlan) {
      setError("Firma ma już wybrany ten plan.");
      return;
    }
    
    if (reason.trim().length < 3) {
      setError("Podaj powód zmiany planu (minimum 3 znaki).");
      return;
    }

    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateCompanyPlanAction(companyId, selectedPlan, reason);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setReason("");
        router.refresh();
      }
    });
  };

  const getPlanDescription = (plan: string) => {
    switch (plan) {
      case "free":
        return "1 oferta aktywna/oczekująca";
      case "pro":
        return "5 ofert aktywnych/oczekujących";
      case "enterprise":
        return "Limit indywidualny";
      default:
        return "Nieznany plan";
    }
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
    <div className="flex flex-col gap-6">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">
          <i className="fas fa-crown text-slate-400 mr-2"></i>
          Plan firmy
        </h2>
        
        <div className="mb-6">
          <p className="text-sm text-slate-600 mb-1">Aktualny plan:</p>
          <div className="font-bold text-lg text-slate-900 uppercase">
            {currentPlan || "free"}
            <span className="ml-2 text-xs font-normal normal-case text-slate-500">
              ({getPlanDescription(currentPlan || "free")})
            </span>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 flex items-start gap-3">
          <i className="fas fa-circle-info mt-0.5 text-blue-500"></i>
          <div>
            <strong>Ostrzeżenie:</strong> Zmiana planu nie archiwizuje automatycznie istniejących ofert. Limity będą egzekwowane przy dodawaniu lub publikowaniu kolejnych ofert.
          </div>
        </div>

        <div className="grid gap-4 mb-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Nowy plan
            </label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              disabled={isPending}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-3 pr-8 text-sm focus:border-[#1a5f3c] focus:outline-none focus:ring-1 focus:ring-[#1a5f3c] disabled:opacity-50"
            >
              <option value="free">FREE ({getPlanDescription("free")})</option>
              <option value="pro">PRO ({getPlanDescription("pro")})</option>
              <option value="enterprise">ENTERPRISE ({getPlanDescription("enterprise")})</option>
            </select>
          </div>
          
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Powód zmiany planu
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isPending}
              placeholder="Napisz dlaczego plan jest zmieniany..."
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
            Pomyślnie zmieniono plan firmy.
          </div>
        )}

        <button
          onClick={handleUpdatePlan}
          disabled={isPending || selectedPlan === (currentPlan || "free") || reason.trim().length < 3}
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
              Zmień plan
            </>
          )}
        </button>
      </div>

      {planHistory.length > 0 && (
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            <i className="fas fa-history text-slate-400 mr-2"></i>
            Historia zmian planu
          </h2>
          <div className="space-y-4">
            {planHistory.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <span className="uppercase text-slate-500">{item.old_plan || "free"}</span>
                    <i className="fas fa-arrow-right text-slate-300"></i>
                    <span className="uppercase text-[#1a5f3c]">{item.new_plan}</span>
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

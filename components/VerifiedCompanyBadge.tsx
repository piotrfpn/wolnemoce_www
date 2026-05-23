import React from "react";

type VerifiedCompanyBadgeProps = {
  isVerified: boolean | null | undefined;
  className?: string;
  showUnverified?: boolean;
};

export default function VerifiedCompanyBadge({
  isVerified,
  className = "",
  showUnverified = false,
}: VerifiedCompanyBadgeProps) {
  if (isVerified) {
    return (
      <span
        title="Podstawowa weryfikacja danych rejestrowych firmy. Nie stanowi gwarancji wykonania usługi."
        className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm cursor-help ${className}`}
      >
        <i className="fas fa-check-circle"></i>
        Firma zweryfikowana
      </span>
    );
  }

  if (showUnverified) {
    return (
      <span
        title="Firma zarejestrowana w systemie, oczekuje na weryfikację."
        className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm ${className}`}
      >
        <i className="fas fa-clock"></i>
        Profil publiczny
      </span>
    );
  }

  return null;
}

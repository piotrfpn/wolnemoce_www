export type CompanyPlan = "free" | "pro" | "enterprise";

/**
 * Zwraca maksymalną liczbę ofert (aktywnych + oczekujących), na jaką pozwala dany plan.
 * UWAGA: Ten helper służy wyłącznie do celów UI (np. wyświetlanie pasków limitu). 
 * Twarde bezpieczeństwo (enforcement) musi być i jest egzekwowane w bazie danych (np. trigger `tr_enforce_free_plan_offer_limits`).
 */
export function getMaxActivePendingOffers(plan: CompanyPlan | string | null | undefined): number {
  const normalizedPlan = (plan ?? "free").toLowerCase() as CompanyPlan;
  
  switch (normalizedPlan) {
    case "free":
      return 1;
    case "pro":
      // Docelowe założenie dla PRO w B2B MVP (do ewentualnej zmiany z bazą w sprincie 8C)
      return 5; 
    case "enterprise":
      // Reprezentuje "brak limitów" lub indywidualne limity
      return 9999; 
    default:
      return 1;
  }
}

/**
 * Sprawdza, czy firma może dodać kolejną ofertę na podstawie swojego planu i obecnej liczby ofert.
 */
export function canCreateOffer(plan: CompanyPlan | string | null | undefined, currentActivePendingCount: number): boolean {
  const limit = getMaxActivePendingOffers(plan);
  return currentActivePendingCount < limit;
}

/**
 * Sprawdza, czy plan firmy obsługuje dodatkowe statystyki, wyróżnienia i priorytet (PRO+).
 */
export function hasPremiumFeatures(plan: CompanyPlan | string | null | undefined): boolean {
  const normalizedPlan = (plan ?? "free").toLowerCase() as CompanyPlan;
  return normalizedPlan === "pro" || normalizedPlan === "enterprise";
}

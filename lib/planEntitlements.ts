export type CompanyPlan = "free" | "pro" | "enterprise";

/**
 * Zwraca maksymalną liczbę ofert (aktywnych + oczekujących), na jaką pozwala dany plan i indywidualny limit.
 * UWAGA: Ten helper służy wyłącznie do celów UI (np. wyświetlanie pasków limitu).
 * Twarde bezpieczeństwo (enforcement) musi być i jest egzekwowane w bazie danych (np. trigger `tr_enforce_plan_offer_limits`).
 * Zwraca `null`, jeśli nie ma limitu (nielimitowane).
 */
export function getMaxActivePendingOffers(
  plan: CompanyPlan | string | null | undefined,
  customLimit?: number | null,
  planLimit?: number | null
): number | null {
  if (typeof customLimit === "number") {
    return customLimit;
  }

  if (typeof planLimit === "number") {
    return planLimit;
  }

  if (planLimit === null) {
    return null;
  }

  const normalizedPlan = (plan ?? "free").toLowerCase() as CompanyPlan;
  
  switch (normalizedPlan) {
    case "free":
      return 1;
    case "pro":
      return 5;
    case "enterprise":
      return null;
    default:
      return 1;
  }
}

/**
 * Sprawdza, czy firma może dodać kolejną ofertę na podstawie swojego planu, indywidualnego limitu, ustawień plan_config i obecnej liczby ofert.
 */
export function canCreateOffer(
  plan: CompanyPlan | string | null | undefined,
  customLimit: number | null | undefined,
  currentActivePendingCount: number,
  planLimit?: number | null
): boolean {
  const limit = getMaxActivePendingOffers(plan, customLimit, planLimit);
  if (limit === null) {
    return true; // Brak limitu
  }
  return currentActivePendingCount < limit;
}

/**
 * Zwraca informacje o limicie do wyświetlenia w UI.
 */
export function getOfferLimitDisplay({
  plan,
  customLimit,
  planLimit,
  activePendingCount,
}: {
  plan: string | null | undefined;
  customLimit: number | null | undefined;
  planLimit: number | null | undefined;
  activePendingCount: number;
}) {
  const normalizedPlan = (plan ?? "free").toUpperCase();
  let limit: number | null = null;
  let source: "custom" | "plan" = "plan";
  let isUnlimited = false;

  if (typeof customLimit === "number") {
    limit = customLimit;
    source = "custom";
    isUnlimited = false;
  } else if (planLimit === null || planLimit === undefined) {
    // Jeżeli baza w zapytaniu JOIN do plan_config zwróciła planLimit jako null
    // lub jeśli fallbackowo go nie mamy dla planu
    const fallbackLimit = getMaxActivePendingOffers(plan);
    limit = fallbackLimit;
    source = "plan";
    isUnlimited = fallbackLimit === null;
  } else {
    limit = planLimit;
    source = "plan";
    isUnlimited = false;
  }

  return {
    limit,
    source,
    isUnlimited,
    normalizedPlan,
    activePendingCount,
  };
}

/**
 * Sprawdza, czy plan firmy obsługuje dodatkowe statystyki, wyróżnienia i priorytet (PRO+).
 */
export function hasPremiumFeatures(plan: CompanyPlan | string | null | undefined): boolean {
  const normalizedPlan = (plan ?? "free").toLowerCase() as CompanyPlan;
  return normalizedPlan === "pro" || normalizedPlan === "enterprise";
}

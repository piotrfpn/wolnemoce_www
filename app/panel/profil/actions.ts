"use server";

import { searchGusByNip, GusApiError, GusConfigError } from "@/lib/gus/regonClient";
import type { GusCompany } from "@/lib/gus/regonClient";
import { isValidNip, normalizeNip } from "@/lib/validators/nip";
import { createClient } from "@/lib/supabase/server";

export type GusLookupResult = {
  company?: GusCompany;
  error?: string;
};

export async function lookupCompanyInGus(nipInput: string): Promise<GusLookupResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Zaloguj się, aby pobrać dane firmy z GUS." };
  }

  const nip = normalizeNip(nipInput);

  if (!isValidNip(nip)) {
    return { error: "Podaj poprawny NIP." };
  }

  try {
    const company = await searchGusByNip(nip);

    if (!company) {
      return { error: "Nie znaleziono firmy w rejestrze GUS." };
    }

    return { company };
  } catch (error) {
    if (error instanceof GusConfigError) {
      return { error: "Integracja GUS nie jest jeszcze skonfigurowana." };
    }

    if (error instanceof GusApiError) {
      return {
        error: "Nie udało się pobrać danych z GUS. Spróbuj ponownie później.",
      };
    }

    return {
      error: "Nie udało się pobrać danych z GUS. Spróbuj ponownie później.",
    };
  }
}

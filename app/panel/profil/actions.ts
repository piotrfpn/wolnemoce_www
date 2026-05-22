"use server";

import {
  searchGusByNip,
  GusApiError,
  GusConfigError,
  isGusMockLookupAllowed,
} from "@/lib/gus/regonClient";
import type { GusCompany } from "@/lib/gus/regonClient";
import { isValidNip, normalizeNip } from "@/lib/validators/nip";
import { createClient } from "@/lib/supabase/server";

export type GusLookupResult = {
  company?: GusCompany;
  error?: string;
};

const invalidNipMessage = "Podaj prawidłowy NIP składający się z 10 cyfr.";
const gusFallbackMessage =
  "Nie udało się pobrać danych z GUS. Możesz uzupełnić dane ręcznie.";

export async function lookupCompanyInGus(nipInput: string): Promise<GusLookupResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Zaloguj się, aby pobrać dane firmy z GUS." };
  }

  const nip = normalizeNip(nipInput);
  const canUseMockNip = isGusMockLookupAllowed(nip);

  if (!isValidNip(nip) && !canUseMockNip) {
    return { error: invalidNipMessage };
  }

  const existingCompanyResult = await supabase
    .from("companies")
    .select("id, user_id")
    .eq("nip", nip)
    .maybeSingle();

  if (existingCompanyResult.error) {
    return { error: gusFallbackMessage };
  }

  if (
    existingCompanyResult.data &&
    existingCompanyResult.data.user_id !== user.id
  ) {
    return { error: "Firma z tym NIP jest już zarejestrowana w systemie." };
  }

  try {
    const company = await searchGusByNip(nip);

    if (!company) {
      return { error: gusFallbackMessage };
    }

    return { company };
  } catch (error) {
    if (error instanceof GusConfigError) {
      return { error: gusFallbackMessage };
    }

    if (error instanceof GusApiError) {
      return { error: gusFallbackMessage };
    }

    return { error: gusFallbackMessage };
  }
}

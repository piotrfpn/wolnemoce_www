"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateCompanyVerificationStatus(
  companyId: string,
  isVerified: boolean,
  verificationNote: string
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Zaloguj się, aby kontynuować." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { error: "Brak uprawnień. Operacja tylko dla administratorów." };
  }

  try {
    const { error } = await supabase.rpc("admin_set_company_verification", {
      p_company_id: companyId,
      p_is_verified: isVerified,
      p_verification_note: verificationNote,
    });

    if (error) {
      console.error("Error updating company verification:", error);
      return { error: "Wystąpił błąd podczas weryfikacji firmy." };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/firmy");
    revalidatePath(`/admin/firmy/${companyId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update company verification status:", error);
    return { error: "Wystąpił nieoczekiwany błąd podczas zapisywania zmian." };
  }
}

export async function updateCompanyPlanAction(
  companyId: string,
  newPlan: string,
  reason: string
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Zaloguj się, aby kontynuować." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { error: "Brak uprawnień. Operacja tylko dla administratorów." };
  }

  if (!["free", "pro", "enterprise"].includes(newPlan)) {
    return { error: "Nieprawidłowy plan." };
  }

  if (!reason || reason.trim().length < 3) {
    return { error: "Podaj powód zmiany planu (minimum 3 znaki)." };
  }

  try {
    const { error } = await supabase.rpc("admin_change_company_plan", {
      p_company_id: companyId,
      p_new_plan: newPlan,
      p_reason: reason.trim(),
    });

    if (error) {
      console.error("Error updating company plan:", error);
      if (error.message.includes("ADMIN_REQUIRED")) {
        return { error: "Brak uprawnień administratora." };
      }
      if (error.message.includes("INVALID_PLAN")) {
        return { error: "Nieprawidłowy plan." };
      }
      if (error.message.includes("PLAN_CHANGE_REASON_REQUIRED")) {
        return { error: "Podaj powód zmiany planu." };
      }
      if (error.message.includes("COMPANY_NOT_FOUND")) {
        return { error: "Nie znaleziono firmy." };
      }
      if (error.message.includes("PLAN_ALREADY_SET")) {
        return { error: "Firma ma już wybrany ten plan." };
      }
      return { error: "Nie udało się zmienić planu firmy." };
    }

    revalidatePath("/admin/firmy");
    revalidatePath(`/admin/firmy/${companyId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update company plan:", error);
    return { error: "Wystąpił nieoczekiwany błąd podczas zmiany planu." };
  }
}

export async function updateCompanyOfferLimitAction(
  companyId: string,
  customLimit: number | null,
  reason: string
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Zaloguj się, aby kontynuować." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { error: "Brak uprawnień. Operacja tylko dla administratorów." };
  }

  if (customLimit !== null && (isNaN(customLimit) || customLimit < 0)) {
    return { error: "Limit musi być liczbą nieujemną." };
  }

  if (!reason || reason.trim().length < 3) {
    return { error: "Podaj powód zmiany limitu (minimum 3 znaki)." };
  }

  try {
    const { error } = await supabase.rpc("admin_change_company_offer_limit", {
      p_company_id: companyId,
      p_custom_limit: customLimit,
      p_reason: reason.trim(),
    });

    if (error) {
      console.error("Error updating company custom limit:", error);
      if (error.message.includes("ADMIN_REQUIRED")) {
        return { error: "Brak uprawnień administratora." };
      }
      if (error.message.includes("INVALID_OFFER_LIMIT")) {
        return { error: "Limit musi być liczbą nieujemną." };
      }
      if (error.message.includes("ENTITLEMENT_CHANGE_REASON_REQUIRED")) {
        return { error: "Podaj powód zmiany limitu." };
      }
      if (error.message.includes("COMPANY_NOT_FOUND")) {
        return { error: "Nie znaleziono firmy." };
      }
      if (error.message.includes("OFFER_LIMIT_ALREADY_SET")) {
        return { error: "Firma ma już ustawiony taki limit ofert." };
      }
      return { error: "Nie udało się zmienić limitu firmy." };
    }

    revalidatePath("/admin/firmy");
    revalidatePath(`/admin/firmy/${companyId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update company custom limit:", error);
    return { error: "Wystąpił nieoczekiwany błąd podczas zmiany limitu." };
  }
}

export type UpdateCompanyContactEmailResult =
  | {
      success: true;
      contactEmail: string | null;
    }
  | {
      success: false;
      error: string;
    };

export async function updateCompanyContactEmailAction(
  companyId: unknown,
  contactEmail: unknown
): Promise<UpdateCompanyContactEmailResult> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Zaloguj się, aby kontynuować." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Failed to verify admin profile.");
    return {
      success: false,
      error: "Nie udało się zweryfikować uprawnień administratora.",
    };
  }

  if (!profile || profile.role !== "admin") {
    return {
      success: false,
      error: "Brak uprawnień. Operacja tylko dla administratorów.",
    };
  }

  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (
    typeof companyId !== "string" ||
    !companyId ||
    !uuidRegex.test(companyId)
  ) {
    return { success: false, error: "Nieprawidłowy identyfikator firmy." };
  }

  if (contactEmail !== null && typeof contactEmail !== "string") {
    return { success: false, error: "Nieprawidłowa wartość adresu e-mail." };
  }

  let normalizedEmail: string | null = null;
  if (typeof contactEmail === "string") {
    if (/[\r\n]/.test(contactEmail)) {
      return {
        success: false,
        error: "Adres e-mail nie może zawierać znaków nowej linii.",
      };
    }

    const trimmed = contactEmail.trim();
    if (trimmed !== "") {
      if (trimmed.length > 254) {
        return {
          success: false,
          error: "Adres e-mail nie może być dłuższy niż 254 znaki.",
        };
      }

      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(trimmed)) {
        return { success: false, error: "Niepoprawny format adresu e-mail." };
      }

      normalizedEmail = trimmed;
    }
  }

  try {
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("id", companyId)
      .maybeSingle();

    if (companyError) {
      console.error("Failed to verify company.");
      return { success: false, error: "Nie udało się zweryfikować firmy." };
    }

    if (!company) {
      return {
        success: false,
        error: "Nie znaleziono firmy w bazie danych.",
      };
    }

    // UPDATE-first pattern
    const { data: updated, error: updateError } = await supabase
      .from("company_contact_settings")
      .update({ contact_email: normalizedEmail })
      .eq("company_id", companyId)
      .select("company_id")
      .maybeSingle();

    if (updateError) {
      console.error("Failed to update company contact settings.");
      return {
        success: false,
        error: "Nie udało się zaktualizować adresu e-mail.",
      };
    }

    if (updated) {
      revalidatePath("/admin/firmy");
      revalidatePath(`/admin/firmy/${companyId}`);
      return { success: true, contactEmail: normalizedEmail };
    }

    // UPDATE did not match any record -> try INSERT
    const { data: inserted, error: insertError } = await supabase
      .from("company_contact_settings")
      .insert({
        company_id: companyId,
        contact_email: normalizedEmail,
      })
      .select("company_id")
      .single();

    if (insertError) {
      console.error("Failed to insert company contact settings.");
      if (insertError.code === "23505") {
        // Unique constraint conflict -> retry UPDATE once
        const { data: retryUpdated, error: retryError } = await supabase
          .from("company_contact_settings")
          .update({ contact_email: normalizedEmail })
          .eq("company_id", companyId)
          .select("company_id")
          .maybeSingle();

        if (retryError || !retryUpdated) {
          console.error("Failed to resolve insert conflict.");
          return {
            success: false,
            error:
              "Wystąpił konflikt zapisu. Odśwież stronę i spróbuj ponownie.",
          };
        }

        revalidatePath("/admin/firmy");
        revalidatePath(`/admin/firmy/${companyId}`);
        return { success: true, contactEmail: normalizedEmail };
      }

      return {
        success: false,
        error: "Nie udało się zapisać nowego adresu e-mail.",
      };
    }

    if (inserted) {
      revalidatePath("/admin/firmy");
      revalidatePath(`/admin/firmy/${companyId}`);
      return { success: true, contactEmail: normalizedEmail };
    }

    return {
      success: false,
      error: "Nie udało się zapisać ustawień kontaktu.",
    };
  } catch {
    console.error("Failed to update company contact email.");
    return {
      success: false,
      error: "Wystąpił nieoczekiwany błąd podczas zapisywania zmian.",
    };
  }
}

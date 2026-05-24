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

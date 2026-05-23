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

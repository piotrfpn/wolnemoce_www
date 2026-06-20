"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function normalizeOptionalEmail(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim().toLowerCase().slice(0, 160) : "";
  if (!text) {
    return { value: null, error: null };
  }

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);

  if (!isValid) {
    return { value: null, error: "Niepoprawny format adresu e-mail kontaktowego." };
  }

  return { value: text, error: null };
}

export async function updateAccountDetails(formData: FormData) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const fullNameRaw = formData.get("fullName");
    const phoneRaw = formData.get("phone");
    const contactEmailRaw = formData.get("contactEmail");

    const fullName = typeof fullNameRaw === "string" ? fullNameRaw.trim().slice(0, 120) : null;
    let phone = typeof phoneRaw === "string" ? phoneRaw.trim().slice(0, 30) : null;

    if (phone === "") {
      phone = null;
    }

    const contactEmailResult = normalizeOptionalEmail(contactEmailRaw);
    if (contactEmailResult.error) {
      return { success: false, error: contactEmailResult.error };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone,
        contact_email: contactEmailResult.value,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating account details:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/panel/ustawienia");
    return { success: true };
  } catch (error) {
    console.error("Unexpected error updating account details", error);
    return { success: false, error: "Unexpected error" };
  }
}

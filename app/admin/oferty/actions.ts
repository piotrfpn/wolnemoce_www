"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = new Set(["draft", "pending", "active", "rejected", "archived"]);

export type AdminOfferActionResult = {
  error?: string;
  success?: string;
};

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Nie udało się sprawdzić roli administratora: ${error.message}`);
  }

  if (profile?.role !== "admin") {
    throw new Error("Forbidden");
  }

  return supabase;
}

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseFeaturedUntil(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "invalid";
  }

  return parsed.toISOString();
}

export async function updateAdminOffer(
  formData: FormData
): Promise<AdminOfferActionResult> {
  let supabase;

  try {
    supabase = await requireAdmin();
  } catch {
    return { error: "Nie masz uprawnień do tej sekcji." };
  }

  const offerId = getValue(formData, "offerId");
  const status = getValue(formData, "status");
  const isFeatured = formData.get("is_featured") === "on";
  const featuredUntilRaw = getValue(formData, "featured_until");
  const featuredPriorityRaw = getValue(formData, "featured_priority");
  const featuredUntil = parseFeaturedUntil(featuredUntilRaw);
  const featuredPriority = Number.parseInt(featuredPriorityRaw || "0", 10);

  if (!offerId) {
    return { error: "Nie udało się zapisać zmian." };
  }

  if (!allowedStatuses.has(status)) {
    return { error: "Nieprawidłowy status oferty." };
  }

  if (featuredUntil === "invalid") {
    return { error: "Podaj poprawną datę ważności wyróżnienia albo zostaw pole puste." };
  }

  if (isFeatured && !featuredUntil) {
    return { error: "Podaj datę końca wyróżnienia oferty." };
  }

  if (!Number.isInteger(featuredPriority) || featuredPriority < 0) {
    return { error: "Priorytet wyróżnienia musi być liczbą nieujemną." };
  }

  const { data, error } = await supabase
    .from("offers")
    .update({
      status,
      is_featured: isFeatured,
      featured_until: featuredUntil,
      featured_priority: featuredPriority,
    })
    .eq("id", offerId)
    .select("slug")
    .single();

  if (error) {
    return { error: "Nie udało się zapisać zmian." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/oferty");
  revalidatePath(`/admin/oferty/${offerId}`);
  revalidatePath("/oferty");

  if (data?.slug) {
    revalidatePath(`/oferty/${data.slug}`);
  }

  return { success: "Zapisano zmiany." };
}

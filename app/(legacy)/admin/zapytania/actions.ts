"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AdminCapacityRequestActionResult = {
  error?: string;
  success?: string;
};

const allowedStatuses = new Set(["pending", "active", "rejected", "archived"]);

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return null;
  }

  return createAdminClient();
}

export async function updateAdminCapacityRequest(
  formData: FormData
): Promise<AdminCapacityRequestActionResult> {
  const admin = await requireAdmin();

  if (!admin) {
    return { error: "Brak uprawnień administratora." };
  }

  const requestId = getValue(formData, "requestId");
  const status = getValue(formData, "status");
  const adminNote = getValue(formData, "admin_note") || null;
  const rejectionReason = getValue(formData, "rejection_reason") || null;

  if (!requestId || !allowedStatuses.has(status)) {
    return { error: "Nieprawidłowe dane moderacji." };
  }

  const updatePayload: {
    status: string;
    admin_note: string | null;
    rejection_reason?: string | null;
  } = {
    status,
    admin_note: adminNote,
  };

  if (status === "rejected") {
    updatePayload.rejection_reason = rejectionReason;
  }

  if (status === "active") {
    updatePayload.rejection_reason = null;
  }

  const { data, error } = await admin
    .from("capacity_requests")
    .update(updatePayload)
    .eq("id", requestId)
    .select("slug")
    .single();

  if (error) {
    return { error: "Nie udało się zapisać zmian." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/zapytania");
  revalidatePath("/zapytania");

  if (data?.slug) {
    revalidatePath(`/zapytania/${data.slug}`);
  }

  return { success: "Zapisano zmiany." };
}

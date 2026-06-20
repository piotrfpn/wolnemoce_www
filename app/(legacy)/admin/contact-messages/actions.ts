"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
    throw new Error("Nie udało się sprawdzić uprawnień administratora.");
  }

  if (profile?.role !== "admin") {
    throw new Error("Nie masz uprawnień do tej sekcji.");
  }

  return supabase;
}

async function updateContactMessageStatus(
  messageId: string,
  status: "read" | "handled" | "archived"
) {
  const supabase = await requireAdmin();
  const now = new Date().toISOString();
  const payload: Record<string, string> = { status };

  if (status === "read") {
    payload.read_at = now;
  }

  if (status === "handled") {
    payload.read_at = now;
    payload.handled_at = now;
  }

  if (status === "archived") {
    payload.read_at = now;
  }

  const { error } = await supabase
    .from("contact_messages")
    .update(payload)
    .eq("id", messageId);

  if (error) {
    throw new Error("Nie udało się zmienić statusu wiadomości.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/contact-messages");
}

export async function markContactMessageRead(messageId: string) {
  await updateContactMessageStatus(messageId, "read");
}

export async function markContactMessageHandled(messageId: string) {
  await updateContactMessageStatus(messageId, "handled");
}

export async function archiveContactMessage(messageId: string) {
  await updateContactMessageStatus(messageId, "archived");
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUserCompany() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: company, error } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Nie udało się pobrać firmy: ${error.message}`);
  }

  if (!company) {
    throw new Error("Najpierw uzupełnij profil firmy.");
  }

  return { supabase, companyId: company.id as string };
}

async function updateInquiryStatus(inquiryId: string, status: "read" | "archived") {
  const { supabase, companyId } = await requireUserCompany();
  const { data: inquiry, error: inquiryError } = await supabase
    .from("inquiries")
    .select("id, company_id")
    .eq("id", inquiryId)
    .eq("company_id", companyId)
    .single();

  if (inquiryError || !inquiry) {
    throw new Error("Nie znaleziono zapytania dla Twojej firmy.");
  }

  const { error } = await supabase
    .from("inquiries")
    .update({ status })
    .eq("id", inquiryId)
    .eq("company_id", companyId);

  if (error) {
    throw new Error(`Nie udało się zmienić statusu zapytania: ${error.message}`);
  }

  revalidatePath("/panel/zapytania");
}

export async function markInquiryRead(inquiryId: string) {
  await updateInquiryStatus(inquiryId, "read");
}

export async function archiveInquiry(inquiryId: string) {
  await updateInquiryStatus(inquiryId, "archived");
}

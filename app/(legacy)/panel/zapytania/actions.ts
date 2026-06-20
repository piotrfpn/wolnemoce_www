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
    .update({ status, recipient_read_at: new Date().toISOString() })
    .eq("id", inquiryId)
    .eq("company_id", companyId);

  if (error) {
    throw new Error(`Nie udało się zmienić statusu zapytania: ${error.message}`);
  }

  revalidatePath("/panel", "layout");
  revalidatePath("/panel/zapytania");
}

export async function markInquiryRead(inquiryId: string) {
  await updateInquiryStatus(inquiryId, "read");
}

export async function archiveInquiry(inquiryId: string) {
  await updateInquiryStatus(inquiryId, "archived");
}

type LeadStatus = "new" | "in_progress" | "answered_outside_portal";

const ALLOWED_LEAD_STATUSES: LeadStatus[] = [
  "new",
  "in_progress",
  "answered_outside_portal",
];

function isLeadStatus(value: string): value is LeadStatus {
  return ALLOWED_LEAD_STATUSES.includes(value as LeadStatus);
}

export async function updateInquiryLeadStatus(
  inquiryId: string,
  newStatus: string
) {
  if (!isLeadStatus(newStatus)) {
    return { error: "leadStatusUpdateError" };
  }

  const { supabase, companyId } = await requireUserCompany();

  const { error } = await supabase
    .from("inquiries")
    .update({ lead_status: newStatus })
    .eq("id", inquiryId)
    .eq("company_id", companyId);

  if (error) {
    return { error: "leadStatusUpdateError" };
  }

  revalidatePath("/panel", "layout");
  revalidatePath("/panel/zapytania");
  return { success: true };
}

export async function createAttachmentDownloadUrl(attachmentId: string) {
  const { supabase, companyId } = await requireUserCompany();
  const { data: attachment, error: attachmentError } = await supabase
    .from("inquiry_attachments")
    .select("id, company_id, storage_bucket, storage_path")
    .eq("id", attachmentId)
    .single();

  if (attachmentError || !attachment) {
    throw new Error("Nie znaleziono załącznika.");
  }

  if (attachment.company_id !== companyId) {
    throw new Error("Forbidden");
  }

  if (attachment.storage_bucket !== "inquiry-attachments") {
    throw new Error("Nieprawidłowy bucket załącznika.");
  }

  const { data, error } = await supabase.storage
    .from("inquiry-attachments")
    .createSignedUrl(attachment.storage_path, 60);

  if (error || !data?.signedUrl) {
    throw new Error("Nie udało się przygotować linku do pobrania.");
  }

  return data.signedUrl;
}

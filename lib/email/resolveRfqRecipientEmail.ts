import "server-only";

import { isValidEmailAddress } from "@/lib/email/sendEmail";
import { createAdminClient } from "@/lib/supabase/admin";

export async function resolveRfqRecipientEmail(
  inquiryId: string
): Promise<string | null> {
  if (!inquiryId) {
    return null;
  }

  try {
    const supabase = createAdminClient();
    const { data: inquiry, error: inquiryError } = await supabase
      .from("inquiries")
      .select("id, company_id, offer_id")
      .eq("id", inquiryId)
      .maybeSingle();

    if (inquiryError || !inquiry?.company_id || !inquiry.offer_id) {
      return null;
    }

    const { data: activeOffer, error: offerError } = await supabase
      .from("offers")
      .select("id")
      .eq("id", inquiry.offer_id)
      .eq("company_id", inquiry.company_id)
      .eq("status", "active")
      .maybeSingle();

    if (offerError || !activeOffer) {
      return null;
    }

    const { data: contactSettings, error: settingsError } = await supabase
      .from("company_contact_settings")
      .select("contact_email")
      .eq("company_id", inquiry.company_id)
      .maybeSingle();

    const contactEmail = contactSettings?.contact_email?.trim() ?? "";

    if (settingsError || !isValidEmailAddress(contactEmail)) {
      return null;
    }

    return contactEmail;
  } catch (error) {
    console.error("RFQ recipient resolver failed", {
      error: error instanceof Error ? error.message : "Unknown resolver error",
    });
    return null;
  }
}

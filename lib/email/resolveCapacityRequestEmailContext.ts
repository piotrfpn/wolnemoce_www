import "server-only";

import { isValidEmailAddress } from "@/lib/email/sendEmail";
import { createAdminClient } from "@/lib/supabase/admin";

export type CapacityRequestInterestEmailContext = {
  recipientEmail: string;
  requestTitle: string;
  interestedCompanyName: string;
};

function isFutureDate(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) && timestamp > Date.now();
}

export async function resolveCapacityRequestInterestEmailContext(
  interestId: string
): Promise<CapacityRequestInterestEmailContext | null> {
  if (!interestId.trim()) {
    return null;
  }

  try {
    const supabase = createAdminClient();
    const { data: interest, error: interestError } = await supabase
      .from("capacity_request_interests")
      .select("id, capacity_request_id, company_id, status")
      .eq("id", interestId)
      .maybeSingle();

    if (
      interestError ||
      !interest?.id ||
      !interest.capacity_request_id ||
      !interest.company_id ||
      interest.status !== "new"
    ) {
      return null;
    }

    const { data: request, error: requestError } = await supabase
      .from("capacity_requests")
      .select("id, company_id, title, status, expires_at")
      .eq("id", interest.capacity_request_id)
      .maybeSingle();

    if (
      requestError ||
      !request?.id ||
      !request.company_id ||
      !request.title ||
      request.status !== "active" ||
      !isFutureDate(request.expires_at)
    ) {
      return null;
    }

    const { data: interestedCompany, error: interestedCompanyError } =
      await supabase
        .from("companies")
        .select("name")
        .eq("id", interest.company_id)
        .maybeSingle();

    if (interestedCompanyError || !interestedCompany?.name) {
      return null;
    }

    const { data: contactSettings, error: contactSettingsError } = await supabase
      .from("company_contact_settings")
      .select("contact_email")
      .eq("company_id", request.company_id)
      .maybeSingle();

    const recipientEmail = contactSettings?.contact_email?.trim() ?? "";

    if (contactSettingsError || !isValidEmailAddress(recipientEmail)) {
      return null;
    }

    return {
      recipientEmail,
      requestTitle: request.title,
      interestedCompanyName: interestedCompany.name,
    };
  } catch {
    return null;
  }
}

"use server";

import { revalidatePath } from "next/cache";
import {
  isCapacityRequestEmailNotificationEnabled,
  sendCapacityRequestEmail,
} from "@/lib/email/capacityRequestEmailDelivery";
import { buildCapacityRequestInterestCreatedEmail } from "@/lib/email/capacityRequestEmails";
import { resolveCapacityRequestInterestEmailContext } from "@/lib/email/resolveCapacityRequestEmailContext";
import { getAppBaseUrl } from "@/lib/email/sendEmail";
import { createClient } from "@/lib/supabase/server";

export type CapacityRequestInterestResult = {
  error?: string;
  success?: string;
  redirectTo?: string;
};

function loginRedirect(returnTo: string) {
  const encoded = encodeURIComponent(returnTo);
  return `/logowanie?next=${encoded}&return_to=${encoded}`;
}

const capacityRequestInterestCreatedEventKey = "capacity_request.interest.created";

type CapacityRequestEmailLogParams = {
  interestId: string;
  outcome: "sent" | "skipped" | "failed";
  reason?:
    | "disabled"
    | "log_only"
    | "invalid_recipient"
    | "recipient_unavailable"
    | "domain_not_allowed"
    | "missing_config"
    | "provider_error"
    | "unexpected_error";
};

function logCapacityRequestInterestEmail(params: CapacityRequestEmailLogParams) {
  const logPayload: {
    eventKey: string;
    interestId: string;
    outcome: CapacityRequestEmailLogParams["outcome"];
    reason?: NonNullable<CapacityRequestEmailLogParams["reason"]>;
  } = {
    eventKey: capacityRequestInterestCreatedEventKey,
    interestId: params.interestId,
    outcome: params.outcome,
  };

  if (params.reason) {
    logPayload.reason = params.reason;
  }

  console.info(logPayload);
}

async function notifyCapacityRequestOwnerAboutInterest(
  interestId: string
): Promise<void> {
  try {
    if (!isCapacityRequestEmailNotificationEnabled()) {
      logCapacityRequestInterestEmail({
        interestId,
        outcome: "skipped",
        reason: "disabled",
      });
      return;
    }

    const context = await resolveCapacityRequestInterestEmailContext(interestId);

    if (!context) {
      logCapacityRequestInterestEmail({
        interestId,
        outcome: "skipped",
        reason: "recipient_unavailable",
      });
      return;
    }

    const email = buildCapacityRequestInterestCreatedEmail({
      appBaseUrl: getAppBaseUrl(),
      requestTitle: context.requestTitle,
      interestedCompanyName: context.interestedCompanyName,
    });
    const emailResult = await sendCapacityRequestEmail({
      to: context.recipientEmail,
      ...email,
      idempotencyKey: `capacity-request-interest:${interestId}:owner`,
    });

    if (emailResult.ok) {
      logCapacityRequestInterestEmail({
        interestId,
        outcome: "sent",
      });
      return;
    }

    if ("skipped" in emailResult) {
      logCapacityRequestInterestEmail({
        interestId,
        outcome: "skipped",
        reason: emailResult.reason,
      });
      return;
    }

    logCapacityRequestInterestEmail({
      interestId,
      outcome: "failed",
      reason: "provider_error",
    });
  } catch {
    logCapacityRequestInterestEmail({
      interestId,
      outcome: "failed",
      reason: "unexpected_error",
    });
    return;
  }
}

export async function submitCapacityRequestInterest(
  capacityRequestId: string,
  returnTo: string
): Promise<CapacityRequestInterestResult> {
  const safeReturnTo = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/zapytania";
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { redirectTo: loginRedirect(safeReturnTo) };
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (companyError) {
    return { error: "Nie udało się sprawdzić profilu firmy." };
  }

  if (!company) {
    return {
      redirectTo: `/panel/profil?return_to=${encodeURIComponent(safeReturnTo)}`,
    };
  }

  const { data: request, error: requestError } = await supabase
    .from("capacity_requests")
    .select("id, status, expires_at")
    .eq("id", capacityRequestId)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (requestError || !request) {
    return { error: "To zlecenie nie jest już aktywne." };
  }

  const interestId = crypto.randomUUID();
  const { error } = await supabase.from("capacity_request_interests").insert({
    id: interestId,
    capacity_request_id: capacityRequestId,
    company_id: company.id,
    user_id: user.id,
    status: "new",
  });

  if (error) {
    if (error.code === "23505" || error.message.includes("duplicate")) {
      return { error: "Twoja firma już zgłosiła zainteresowanie tym zleceniem." };
    }

    if (error.message.includes("own capacity request")) {
      return { error: "Nie możesz zgłosić zainteresowania własnym zleceniem." };
    }

    if (
      error.message.includes("not active") ||
      error.message.includes("expired") ||
      error.message.includes("row-level security")
    ) {
      return { error: "To zlecenie nie jest już aktywne." };
    }

    return { error: "Nie udało się zapisać zainteresowania. Spróbuj ponownie za chwilę." };
  }

  revalidatePath("/zapytania");
  revalidatePath(safeReturnTo);
  await notifyCapacityRequestOwnerAboutInterest(interestId);

  return {
    success:
      "Zgłoszenie zainteresowania zostało zapisane. Administrator może wykorzystać je do ręcznej obsługi zapytania. Dane kontaktowe zlecającego nie są automatycznie ujawniane na tym etapie.",
  };
}

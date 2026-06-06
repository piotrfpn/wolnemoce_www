import {
  buildMailtoHref,
  buildServiceRequestReplyBody,
  buildServiceRequestReplySubject,
} from "@/lib/adminReplyMailto";
import type { createClient } from "@/lib/supabase/server";
import type { PendingServiceRequest } from "./PendingServicesClient";

type SupabaseServerClient = ReturnType<typeof createClient>;

export type ServiceRequestRecord = {
  id: string;
  user_id: string | null;
  company_id: string | null;
  industry: string | null;
  proposed_service: string | null;
  reason: string | null;
  status: string | null;
  created_at: string | null;
  admin_handled_at: string | null;
  admin_response_note: string | null;
  companies: {
    name: string | null;
  } | null;
};

type ServiceRequestProfile = {
  id: string;
  contact_email: string | null;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
};

type ServiceRequestCompanyContact = {
  company_id: string;
  contact_email: string | null;
};

export const serviceRequestsAdminSelect =
  "id, user_id, company_id, industry, proposed_service, reason, status, created_at, admin_handled_at, admin_response_note, companies(name)";

export async function enrichServiceRequestsWithReplyContext(
  supabase: SupabaseServerClient,
  serviceRequests: ServiceRequestRecord[]
): Promise<{
  requests: PendingServiceRequest[];
  contactContextError: string | null;
}> {
  const serviceRequestUserIds = Array.from(
    new Set(
      serviceRequests
        .map((request) => request.user_id)
        .filter((value): value is string => Boolean(value))
    )
  );
  const serviceRequestCompanyIds = Array.from(
    new Set(
      serviceRequests
        .map((request) => request.company_id)
        .filter((value): value is string => Boolean(value))
    )
  );
  const [profilesResult, companyContactsResult] = await Promise.all([
    serviceRequestUserIds.length > 0
      ? supabase
          .from("profiles")
          .select("id, contact_email, email, full_name, display_name")
          .in("id", serviceRequestUserIds)
      : Promise.resolve({ data: [] as ServiceRequestProfile[], error: null }),
    serviceRequestCompanyIds.length > 0
      ? supabase
          .from("company_contact_settings")
          .select("company_id, contact_email")
          .in("company_id", serviceRequestCompanyIds)
      : Promise.resolve({
          data: [] as ServiceRequestCompanyContact[],
          error: null,
        }),
  ]);
  const profiles = new Map(
    ((profilesResult.data ?? []) as ServiceRequestProfile[]).map((profile) => [
      profile.id,
      profile,
    ])
  );
  const companyContacts = new Map(
    ((companyContactsResult.data ?? []) as ServiceRequestCompanyContact[]).map(
      (settings) => [settings.company_id, settings]
    )
  );
  const serviceRequestReplyBody = buildServiceRequestReplyBody();
  const contactContextError =
    profilesResult.error || companyContactsResult.error
      ? "Nie udało się pobrać pełnych danych kontaktowych dla części zgłoszeń."
      : null;

  return {
    contactContextError,
    requests: serviceRequests.map((request) => {
      const profile = request.user_id ? profiles.get(request.user_id) : null;
      const companyContact = request.company_id
        ? companyContacts.get(request.company_id)
        : null;
      const profileContactEmail = profile?.contact_email?.trim() || "";
      const profileAccountEmail = profile?.email?.trim() || "";
      const companyContactEmail = companyContact?.contact_email?.trim() || "";
      const replyEmail =
        profileContactEmail || profileAccountEmail || companyContactEmail || null;
      const replyEmailSource = profileContactEmail
        ? "profil użytkownika"
        : profileAccountEmail
          ? "konto użytkownika"
          : companyContactEmail
            ? "profil firmy"
            : null;

      return {
        ...request,
        submitter_name: profile?.full_name || profile?.display_name || null,
        reply_email: replyEmail,
        reply_email_source: replyEmailSource,
        reply_href: replyEmail
          ? buildMailtoHref({
              to: replyEmail,
              subject: buildServiceRequestReplySubject(request.proposed_service),
              body: serviceRequestReplyBody,
            })
          : null,
      };
    }),
  };
}

import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function resolveCapacityRequestRecipientUserId(
  capacityRequestId: string
): Promise<string | null> {
  if (!capacityRequestId.trim()) {
    return null;
  }

  const supabase = createAdminClient();
  const { data: request, error: requestError } = await supabase
    .from("capacity_requests")
    .select("company_id")
    .eq("id", capacityRequestId)
    .maybeSingle();

  if (requestError || !request?.company_id) {
    return null;
  }

  const { data: ownerCompany, error: ownerCompanyError } = await supabase
    .from("companies")
    .select("user_id")
    .eq("id", request.company_id)
    .maybeSingle();

  if (ownerCompanyError || !ownerCompany?.user_id) {
    return null;
  }

  return ownerCompany.user_id;
}

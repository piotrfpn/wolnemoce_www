import "server-only";

import type { Locale } from "@/lib/i18n/config";

type LogCapacityRequestInterestNotificationParams = {
  capacityRequestId: string;
  recipientUserId: string | null;
};

export type CapacityRequestInterestNotificationLog = {
  mode: "LOG_ONLY";
  event_type: "capacity_request_interest_created";
  capacity_request_id: string;
  recipient_user_id: string | null;
  recipient_locale: Locale;
  created_at: string;
};

export function logCapacityRequestInterestNotification({
  capacityRequestId,
  recipientUserId,
}: LogCapacityRequestInterestNotificationParams): void {
  // The owner model has no stored locale preference yet. Replace this fallback
  // with the recipient's profile preference when that field is introduced.
  const recipientLocale: Locale = "pl";
  const payload: CapacityRequestInterestNotificationLog = {
    mode: "LOG_ONLY",
    event_type: "capacity_request_interest_created",
    capacity_request_id: capacityRequestId,
    recipient_user_id: recipientUserId,
    recipient_locale: recipientLocale,
    created_at: new Date().toISOString(),
  };

  console.info(payload);
}

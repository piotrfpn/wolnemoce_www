import "server-only";

import {
  sendEmailWithConfig,
  type SendEmailParams,
  type SendEmailResult,
} from "@/lib/email/sendEmail";

export function isCapacityRequestEmailNotificationEnabled() {
  return process.env.CAPACITY_REQUEST_EMAIL_NOTIFICATIONS_ENABLED === "true";
}

function getCapacityRequestEmailDeliveryConfig() {
  return {
    enabled: isCapacityRequestEmailNotificationEnabled(),
    logOnly: process.env.CAPACITY_REQUEST_EMAIL_LOG_ONLY !== "false",
    testRecipient: process.env.CAPACITY_REQUEST_EMAIL_TEST_RECIPIENT,
    allowedRecipientDomain: process.env.CAPACITY_REQUEST_EMAIL_ALLOWED_RECIPIENT_DOMAIN,
  };
}

export async function sendCapacityRequestEmail(
  params: SendEmailParams
): Promise<SendEmailResult> {
  return sendEmailWithConfig(params, getCapacityRequestEmailDeliveryConfig());
}

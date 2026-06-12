import "server-only";

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
};

type SkippedReason =
  | "missing_config"
  | "invalid_recipient"
  | "disabled"
  | "log_only"
  | "domain_not_allowed";

export type EmailDeliveryConfig = {
  enabled: boolean;
  logOnly: boolean;
  testRecipient?: string | null;
  allowedRecipientDomain?: string | null;
};

export type SendEmailResult =
  | { ok: true }
  | { ok: false; skipped: true; reason: SkippedReason }
  | { ok: false; error: string };

export function getAppBaseUrl() {
  return (process.env.APP_BASE_URL || "https://www.wolnemoce.com").replace(/\/+$/, "");
}

export function isValidEmailAddress(value: string | null | undefined) {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()));
}

export function isRfqEmailNotificationEnabled() {
  return process.env.RFQ_EMAIL_NOTIFICATIONS_ENABLED === "true";
}

function getRfqEmailDeliveryConfig(): EmailDeliveryConfig {
  return {
    enabled: isRfqEmailNotificationEnabled(),
    logOnly: process.env.RFQ_EMAIL_LOG_ONLY === "true",
    testRecipient: process.env.RFQ_EMAIL_TEST_RECIPIENT,
    allowedRecipientDomain: process.env.RFQ_EMAIL_ALLOWED_RECIPIENT_DOMAIN,
  };
}

function getResolvedRecipient(to: string, config: EmailDeliveryConfig) {
  const testRecipient = config.testRecipient?.trim();

  return testRecipient || to;
}

function isAllowedRecipientDomain(to: string, config: EmailDeliveryConfig) {
  const allowedDomain = config.allowedRecipientDomain
    ?.trim()
    .replace(/^@/, "")
    .toLowerCase();

  if (!allowedDomain) {
    return true;
  }

  const recipientDomain = to.trim().toLowerCase().split("@").pop();

  return (
    recipientDomain === allowedDomain ||
    Boolean(recipientDomain?.endsWith(`.${allowedDomain}`))
  );
}

export async function sendEmailWithConfig(
  {
    to,
    subject,
    html,
    text,
    idempotencyKey,
  }: SendEmailParams,
  config: EmailDeliveryConfig
): Promise<SendEmailResult> {
  if (!config.enabled) {
    return { ok: false, skipped: true, reason: "disabled" };
  }

  const resolvedRecipient = getResolvedRecipient(to, config);

  if (!isValidEmailAddress(resolvedRecipient)) {
    return { ok: false, skipped: true, reason: "invalid_recipient" };
  }

  if (!isAllowedRecipientDomain(resolvedRecipient, config)) {
    return { ok: false, skipped: true, reason: "domain_not_allowed" };
  }

  if (config.logOnly) {
    return { ok: false, skipped: true, reason: "log_only" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { ok: false, skipped: true, reason: "missing_config" };
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers,
      body: JSON.stringify({
        from,
        to: resolvedRecipient,
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      return {
        ok: false,
        error: `Resend returned ${response.status}: ${responseText.slice(0, 180)}`,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  idempotencyKey,
}: SendEmailParams): Promise<SendEmailResult> {
  return sendEmailWithConfig(
    {
      to,
      subject,
      html,
      text,
      idempotencyKey,
    },
    getRfqEmailDeliveryConfig()
  );
}

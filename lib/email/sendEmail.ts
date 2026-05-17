type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
};

export type SendEmailResult =
  | { ok: true }
  | { ok: false; skipped: true; reason: "missing_config" | "invalid_recipient" }
  | { ok: false; error: string };

export function getAppBaseUrl() {
  return (process.env.APP_BASE_URL || "https://wolnemoce.pl").replace(/\/+$/, "");
}

export function isValidEmailAddress(value: string | null | undefined) {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()));
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  idempotencyKey,
}: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { ok: false, skipped: true, reason: "missing_config" };
  }

  if (!isValidEmailAddress(to)) {
    return { ok: false, skipped: true, reason: "invalid_recipient" };
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
        to,
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

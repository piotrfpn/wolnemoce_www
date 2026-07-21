import "server-only";

import nodemailer from "nodemailer";

export type SmtpSkippedReason =
  | "disabled"
  | "log_only"
  | "missing_config"
  | "invalid_config"
  | "domain_not_allowed";

export type SmtpFailureCategory =
  | "provider_rejected"
  | "provider_unavailable";

export type SendSmtpEmailResult =
  | {
      ok: true;
      providerMessageId: string | null;
    }
  | {
      ok: false;
      skipped: true;
      reason: SmtpSkippedReason;
    }
  | {
      ok: false;
      skipped: false;
      category: SmtpFailureCategory;
    };

export type SendSmtpEmailParams = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string | null;
  messageRecordId: string;
};

export type SmtpDeliveryConfig = {
  enabled: boolean;
  logOnly: boolean;
  testRecipient?: string;
  allowedRecipientDomain?: string;
};

function isValidEmail(email: string) {
  return typeof email === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email); // CRLF checked separately before trim
}

function containsCrlf(value: string | undefined | null) {
  if (typeof value !== "string") return false;
  return /[\r\n]/.test(value);
}

function isAllowedDomain(email: string, allowedDomain: string) {
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1].toLowerCase();
  const target = allowedDomain.toLowerCase();
  return domain === target || domain.endsWith("." + target);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getOptionalStringProperty(value: unknown, property: string): string | null {
  if (!isRecord(value)) return null;
  const candidate = value[property];
  return typeof candidate === "string" ? candidate : null;
}

function getOptionalNumberProperty(value: unknown, property: string): number | null {
  if (!isRecord(value)) return null;
  const candidate = value[property];
  return typeof candidate === "number" && Number.isFinite(candidate) ? candidate : null;
}

export async function sendSmtpEmail(
  { to, subject, html, text, replyTo, messageRecordId }: SendSmtpEmailParams,
  config: SmtpDeliveryConfig
): Promise<SendSmtpEmailResult> {
  // 1. Check enabled
  if (!config.enabled) {
    return { ok: false, skipped: true, reason: "disabled" };
  }

  // 2. Validate CRLF on raw inputs before any trim
  if (
    containsCrlf(messageRecordId) ||
    containsCrlf(subject) ||
    containsCrlf(to) ||
    containsCrlf(config.testRecipient) ||
    containsCrlf(replyTo) ||
    containsCrlf(config.allowedRecipientDomain)
  ) {
    return { ok: false, skipped: true, reason: "invalid_config" };
  }


  // 4. Validate UUID messageRecordId
  if (!messageRecordId || typeof messageRecordId !== "string") {
    return { ok: false, skipped: true, reason: "invalid_config" };
  }
  const trimmedMessageRecordId = messageRecordId.trim();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(trimmedMessageRecordId)) {
    return { ok: false, skipped: true, reason: "invalid_config" };
  }

  // 5. Validate Subject
  const trimmedSubject = subject?.trim() || "";
  if (!trimmedSubject) {
    return { ok: false, skipped: true, reason: "invalid_config" };
  }

  // 6. Resolve recipient
  const trimmedTo = to?.trim() || "";
  const trimmedTestRecipient = config.testRecipient?.trim();
  const resolvedRecipient = trimmedTestRecipient || trimmedTo;

  // 7. Format validation
  if (!isValidEmail(resolvedRecipient)) {
    return { ok: false, skipped: true, reason: "invalid_config" };
  }

  const trimmedReplyTo = replyTo?.trim();
  if (trimmedReplyTo && !isValidEmail(trimmedReplyTo)) {
    return { ok: false, skipped: true, reason: "invalid_config" };
  }

  if (trimmedTestRecipient && !isValidEmail(trimmedTestRecipient)) {
    return { ok: false, skipped: true, reason: "invalid_config" };
  }

  // 8. Domain allowed validation
  if (config.allowedRecipientDomain) {
    const trimmedAllowed = config.allowedRecipientDomain.trim().toLowerCase();
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/.test(trimmedAllowed)) {
      return { ok: false, skipped: true, reason: "domain_not_allowed" };
    }
    if (!isAllowedDomain(resolvedRecipient, trimmedAllowed)) {
      return { ok: false, skipped: true, reason: "domain_not_allowed" };
    }
  }

  // 9. Log only
  if (config.logOnly) {
    return { ok: false, skipped: true, reason: "log_only" };
  }

  // 10. SMTP config verification part 2
  const hostStr = process.env.SMTP_HOST;
  const portStr = process.env.SMTP_PORT;
  const secureStr = process.env.SMTP_SECURE;
  const userStr = process.env.SMTP_USER;
  const passStr = process.env.SMTP_PASSWORD;
  const fromEmailStr = process.env.SMTP_FROM_EMAIL;
  const fromNameStr = process.env.SMTP_FROM_NAME;

  if (
    containsCrlf(hostStr) ||
    containsCrlf(userStr) ||
    containsCrlf(fromEmailStr) ||
    containsCrlf(fromNameStr)
  ) {
    return { ok: false, skipped: true, reason: "invalid_config" };
  }
  if (!hostStr || !portStr || !secureStr || !userStr || !passStr || !fromEmailStr || !fromNameStr) {
    return { ok: false, skipped: true, reason: "missing_config" };
  }

  const trimmedHost = hostStr.trim();
  const trimmedPortStr = portStr.trim();
  const trimmedSecureStr = secureStr.trim();
  const trimmedUser = userStr.trim();
  const trimmedFromEmail = fromEmailStr.trim();
  const trimmedFromName = fromNameStr.trim();
  const pass = passStr; // Do not trim password

  if (!trimmedHost || !trimmedUser || !trimmedFromName) {
    return { ok: false, skipped: true, reason: "invalid_config" };
  }

  if (!/^\d+$/.test(trimmedPortStr)) {
    return { ok: false, skipped: true, reason: "invalid_config" };
  }

  const port = Number(trimmedPortStr);
  if (!Number.isInteger(port) || port < 1 || port > 65535 || port === 25) {
    return { ok: false, skipped: true, reason: "invalid_config" };
  }

  if (trimmedSecureStr !== "true" && trimmedSecureStr !== "false") {
    return { ok: false, skipped: true, reason: "invalid_config" };
  }
  const secure = trimmedSecureStr === "true";

  if (!isValidEmail(trimmedFromEmail)) {
    return { ok: false, skipped: true, reason: "invalid_config" };
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: trimmedHost,
    port,
    secure,
    auth: {
      user: trimmedUser,
      pass,
    },
    requireTLS: !secure,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });

  const mailOptions: nodemailer.SendMailOptions = {
    from: {
      name: trimmedFromName,
      address: trimmedFromEmail,
    },
    to: resolvedRecipient,
    subject: trimmedSubject,
    html,
    text,
    headers: {
      "X-WolneMoce-Message-Id": trimmedMessageRecordId,
    },
  };

  if (trimmedReplyTo) {
    mailOptions.replyTo = {
      name: "",
      address: trimmedReplyTo,
    };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    let providerMessageId: string | null = null;
    if (typeof info.messageId === "string") {
      const trimmedId = info.messageId.trim();
      providerMessageId = trimmedId || null;
    }

    return {
      ok: true,
      providerMessageId,
    };
  } catch (error: unknown) {
    let category: SmtpFailureCategory = "provider_unavailable";

    const code = getOptionalStringProperty(error, "code");
    const responseCode = getOptionalNumberProperty(error, "responseCode");

    if (code === "EAUTH" || code === "EENVELOPE" || code === "EMESSAGE") {
      category = "provider_rejected";
    } else if (responseCode !== null && responseCode >= 500 && responseCode < 600) {
      category = "provider_rejected";
    }

    return { ok: false, skipped: false, category };
  }
}

import "server-only";

import type { SmtpMail } from "./smtpClient";

const CONTACT_NOTIFICATION_SUBJECT =
  "WolneMoce — nowa wiadomość z formularza kontaktowego";
const DEFAULT_APP_BASE_URL = "https://www.wolnemoce.com";

type ContactNotificationInput = {
  name: string | null;
  companyName: string | null;
  topic: string | null;
  source: string;
  createdAt: Date;
};

type ContactNotificationEmailInput = ContactNotificationInput & {
  appBaseUrl: string;
};

type ContactNotificationDependencies = {
  env?: Record<string, string | undefined>;
  sendMail?: (message: SmtpMail) => Promise<unknown>;
  log?: (event: ContactNotificationLogEvent) => void;
};

type ContactNotificationLogEvent = {
  event: "contact_email_notification_log_only";
  timestamp: string;
  source: string;
  wouldSend: true;
};

export type ContactNotificationResult = "disabled" | "log_only" | "sent";

function normalizeSingleLine(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value: string | null | undefined) {
  return normalizeSingleLine(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getSafeAppBaseUrl(value: string | undefined) {
  try {
    const url = new URL(value || DEFAULT_APP_BASE_URL);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return DEFAULT_APP_BASE_URL;
    }

    return url.toString().replace(/\/+$/, "");
  } catch {
    return DEFAULT_APP_BASE_URL;
  }
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Warsaw",
  }).format(value);
}

function htmlRow(label: string, value: string) {
  return `<p style="margin:0 0 10px;line-height:1.6"><strong>${label}:</strong> ${value}</p>`;
}

export function buildContactNotificationEmail(
  input: ContactNotificationEmailInput
) {
  const panelUrl = `${getSafeAppBaseUrl(input.appBaseUrl)}/admin/contact-messages`;
  const name = normalizeSingleLine(input.name);
  const companyName = normalizeSingleLine(input.companyName);
  const topic = normalizeSingleLine(input.topic) || "Bez tematu";
  const source = normalizeSingleLine(input.source) || "contact";
  const createdAt = formatDate(input.createdAt);

  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:24px">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:24px">
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#0f172a">WolneMoce</h1>
        <p style="margin:0 0 18px;line-height:1.6">W panelu admina pojawiła się nowa wiadomość kontaktowa.</p>
        ${htmlRow("Temat wiadomości", escapeHtml(topic))}
        ${name ? htmlRow("Nadawca", escapeHtml(name)) : ""}
        ${companyName ? htmlRow("Firma", escapeHtml(companyName)) : ""}
        ${htmlRow("Źródło formularza", escapeHtml(source))}
        ${htmlRow("Data i godzina", escapeHtml(createdAt))}
        <p style="margin:22px 0">
          <a href="${escapeHtml(panelUrl)}" style="display:inline-block;background:#1a5f3c;color:#ffffff;text-decoration:none;font-weight:700;border-radius:12px;padding:12px 18px">Otwórz wiadomości w panelu admina</a>
        </p>
        <p style="margin:18px 0 0;color:#64748b;font-size:13px;line-height:1.6">kontakt@wolnemoce.com</p>
      </div>
    </div>
  `;

  const text = [
    "WolneMoce",
    "",
    "W panelu admina pojawiła się nowa wiadomość kontaktowa.",
    `Temat wiadomości: ${topic}`,
    name ? `Nadawca: ${name}` : "",
    companyName ? `Firma: ${companyName}` : "",
    `Źródło formularza: ${source}`,
    `Data i godzina: ${createdAt}`,
    "",
    `Otwórz wiadomości w panelu admina: ${panelUrl}`,
    "",
    "kontakt@wolnemoce.com",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: CONTACT_NOTIFICATION_SUBJECT,
    html,
    text,
  };
}

async function defaultSendMail(message: SmtpMail) {
  const { sendSmtpMail } = await import("./smtpClient");
  await sendSmtpMail(message);
}

export async function sendContactNotification(
  input: ContactNotificationInput,
  dependencies: ContactNotificationDependencies = {}
): Promise<ContactNotificationResult> {
  const env = dependencies.env ?? process.env;

  if (env.CONTACT_EMAIL_NOTIFICATIONS_ENABLED !== "true") {
    return "disabled";
  }

  if (env.CONTACT_EMAIL_LOG_ONLY === "true") {
    const log = dependencies.log ?? console.info;
    log({
      event: "contact_email_notification_log_only",
      timestamp: input.createdAt.toISOString(),
      source: normalizeSingleLine(input.source) || "contact",
      wouldSend: true,
    });
    return "log_only";
  }

  const email = buildContactNotificationEmail({
    ...input,
    appBaseUrl: env.APP_BASE_URL || DEFAULT_APP_BASE_URL,
  });
  const sendMail = dependencies.sendMail ?? defaultSendMail;

  await sendMail({
    to: normalizeSingleLine(env.CONTACT_EMAIL_TO),
    ...email,
  });

  return "sent";
}

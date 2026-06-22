import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

export type SmtpMail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

let transporter: Transporter | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required SMTP configuration: ${name}`);
  }

  return value;
}

function getSmtpPort() {
  const value = getRequiredEnv("SMTP_PORT");
  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0 || port > 65535 || port === 25) {
    throw new Error("SMTP_PORT must be a valid port other than 25");
  }

  return port;
}

function getSmtpSecure() {
  const value = getRequiredEnv("SMTP_SECURE");

  if (value !== "true" && value !== "false") {
    throw new Error("SMTP_SECURE must be either true or false");
  }

  return value === "true";
}

function isValidEmailAddress(value: string) {
  return (
    !/[\r\n]/.test(value) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

function getEmailAddress(name: "CONTACT_EMAIL_FROM" | "SMTP_USER") {
  const value = getRequiredEnv(name);

  if (!isValidEmailAddress(value)) {
    throw new Error(`${name} must be a valid email address`);
  }

  return value;
}

function getFromName() {
  return (process.env.CONTACT_EMAIL_FROM_NAME || "WolneMoce")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getSmtpTransporter() {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: getRequiredEnv("SMTP_HOST"),
    port: getSmtpPort(),
    secure: getSmtpSecure(),
    auth: {
      user: getEmailAddress("SMTP_USER"),
      pass: getRequiredEnv("SMTP_PASSWORD"),
    },
    pool: true,
    maxConnections: 1,
    maxMessages: 20,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  return transporter;
}

export async function sendSmtpMail(message: SmtpMail) {
  if (!isValidEmailAddress(message.to)) {
    throw new Error("CONTACT_EMAIL_TO must be a valid email address");
  }

  if (/[\r\n]/.test(message.subject)) {
    throw new Error("Email subject must not contain line breaks");
  }

  await getSmtpTransporter().sendMail({
    from: {
      name: getFromName(),
      address: getEmailAddress("CONTACT_EMAIL_FROM"),
    },
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });
}

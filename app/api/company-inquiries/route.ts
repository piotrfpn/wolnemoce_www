import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { submitCompanyInquiry } from "@/lib/company-inquiries/submitCompanyInquiry";
import { getAppBaseUrl } from "@/lib/email/sendEmail";

function isOriginAllowed(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const appBaseUrl = getAppBaseUrl();
  let url;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  if (origin === appBaseUrl) return true;

  if (process.env.NODE_ENV !== "production" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
    return true;
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && origin === `https://${vercelUrl}`) {
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  if (!isOriginAllowed(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot check
  if (body.company_registration_note || body.honeypot) {
    return NextResponse.json({ success: true });
  }

  const {
    companyId,
    senderName,
    senderCompanyName,
    senderEmail,
    senderPhone,
    subject,
    message,
    locale,
  } = body;

  // Validation
  if (!companyId || typeof companyId !== "string" || companyId.length !== 36) {
    return NextResponse.json({ error: "Invalid companyId" }, { status: 400 });
  }

  if (
    !senderName || typeof senderName !== "string" || senderName.length < 2 || senderName.length > 120 ||
    !senderCompanyName || typeof senderCompanyName !== "string" || senderCompanyName.length < 2 || senderCompanyName.length > 160 ||
    !senderEmail || typeof senderEmail !== "string" || senderEmail.length > 254 ||
    !subject || typeof subject !== "string" || subject.length < 3 || subject.length > 200 ||
    !message || typeof message !== "string" || message.length < 20 || message.length > 3000
  ) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  if (senderPhone && (typeof senderPhone !== "string" || senderPhone.length > 50)) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const allowedLocales = ["pl", "en", "de", "uk", "es", "fr"];
  const sourceLocale = allowedLocales.includes(locale) ? locale : "pl";

  const requestIp = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  const result = await submitCompanyInquiry({
    companyId,
    senderName,
    senderCompanyName,
    senderEmail,
    senderPhone,
    subject,
    message,
    sourceLocale,
    requestIp,
    userAgent,
  });

  if (!result.success) {
    if (result.status >= 500) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: result.status });
    }
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}

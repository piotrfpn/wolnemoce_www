import "server-only";

import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSmtpEmail } from "@/lib/email/sendSmtpEmail";
import { buildCompanyInquiryEmail } from "@/lib/email/companyInquiryEmails";
import type { Database } from "@/lib/database.types";

export type SubmitCompanyInquiryParams = {
  companyId: string;
  senderName: string;
  senderCompanyName: string;
  senderEmail: string;
  senderPhone?: string | null;
  subject: string;
  message: string;
  sourceLocale?: string;
  requestIp: string;
  userAgent: string;
};

export type SubmitCompanyInquiryResult =
  | { success: true }
  | { success: false; error: string; status: number };

export async function submitCompanyInquiry({
  companyId,
  senderName,
  senderCompanyName,
  senderEmail,
  senderPhone,
  subject,
  message,
  sourceLocale = "pl",
  requestIp,
  userAgent,
}: SubmitCompanyInquiryParams): Promise<SubmitCompanyInquiryResult> {
  const adminClient = createAdminClient();

  // 1. Verify company is public and get snapshot name + slug
  const { data: company, error: companyError } = await adminClient
    .from("companies")
    .select("id, name, slug, is_verified")
    .eq("id", companyId)
    .eq("is_verified", true)
    .not("slug", "is", null)
    .neq("slug", "")
    .single();

  if (companyError || !company) {
    return { success: false, error: "Company not found or not public", status: 400 };
  }

  // 2. Resolve recipient email
  const { data: contactSettings } = await adminClient
    .from("company_contact_settings")
    .select("contact_email")
    .eq("company_id", companyId)
    .single();

  const recipientEmail = contactSettings?.contact_email?.trim() || null;

  // We do not fail publicly if there's no email, to prevent exposing company settings.
  // We will fail the delivery silently from the user's perspective if it's missing,
  // but let's handle rate limit first.

  // 3. Rate limiting (MVP: count-before-insert)
  // Residual concurrency race note: multiple rapid concurrent requests might bypass this count.
  const rateLimitSecret = process.env.COMPANY_CONTACT_RATE_LIMIT_SECRET;
  if (!rateLimitSecret) {
    console.error("Missing COMPANY_CONTACT_RATE_LIMIT_SECRET");
    return { success: false, error: "Configuration error", status: 503 };
  }

  const fingerprintSource = `${requestIp}|${userAgent}`;
  const fingerprint = crypto
    .createHmac("sha256", rateLimitSecret)
    .update(fingerprintSource)
    .digest("hex");

  const normalizedEmail = senderEmail.trim().toLowerCase();
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  // Check fingerprint rate limit
  const { count: fpCount, error: fpError } = await adminClient
    .from("company_contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("request_fingerprint", fingerprint)
    .gte("created_at", fifteenMinsAgo);

  if (fpError || fpCount === null) {
    console.error("Company inquiry rate limit check failed", {
      stage: "fingerprint",
    });
    return { success: false, error: "Service temporarily unavailable", status: 503 };
  }

  if (fpCount >= 3) {
    return { success: false, error: "Rate limit exceeded", status: 429 };
  }

  // Check email rate limit
  const { count: emailCount, error: emailError } = await adminClient
    .from("company_contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("sender_email", normalizedEmail)
    .gte("created_at", fifteenMinsAgo);

  if (emailError || emailCount === null) {
    console.error("Company inquiry rate limit check failed", {
      stage: "email",
    });
    return { success: false, error: "Service temporarily unavailable", status: 503 };
  }

  if (emailCount >= 3) {
    return { success: false, error: "Rate limit exceeded", status: 429 };
  }

  // 4. Insert pending message
  const { data: insertedMessage, error: insertError } = await adminClient
    .from("company_contact_messages")
    .insert({
      company_id: companyId,
      company_name_snapshot: company.name,
      message_type: "public_company_inquiry",
      sender_name: senderName.trim(),
      sender_company_name: senderCompanyName.trim(),
      sender_email: normalizedEmail,
      sender_phone: senderPhone?.trim() || null,
      subject: subject.trim(),
      message: message.trim(),
      source_locale: sourceLocale,
      delivery_status: "pending",
      request_fingerprint: fingerprint,
    })
    .select("id")
    .single();

  if (insertError || !insertedMessage) {
    console.error("Failed to insert company contact message", {
      stage: "insert",
    });
    return { success: false, error: "Database error", status: 500 };
  }

  const messageId = insertedMessage.id;

  // 5. Send email
  type FailureCode = "configuration_error" | "provider_rejected" | "provider_unavailable" | "recipient_unavailable";

  let deliveryStatus: "sent" | "failed" = "failed";
  let failureCode: FailureCode | null = null;
  let providerMessageId: string | null = null;

  if (recipientEmail) {
    const { html, text } = buildCompanyInquiryEmail({
      companyName: company.name,
      senderName: senderName.trim(),
      senderCompanyName: senderCompanyName.trim(),
      senderEmail: normalizedEmail,
      senderPhone: senderPhone?.trim() || null,
      subject: subject.trim(),
      message: message.trim(),
      companySlug: company.slug!,
    });

    const sendResult = await sendSmtpEmail(
      {
        to: recipientEmail,
        subject: `Nowe zapytanie dotyczące profilu firmy: ${company.name}`,
        html,
        text,
        replyTo: normalizedEmail,
        messageRecordId: messageId,
      },
      {
        enabled: process.env.COMPANY_INQUIRY_EMAIL_ENABLED === "true",
        logOnly: process.env.COMPANY_INQUIRY_EMAIL_LOG_ONLY === "true",
        testRecipient: process.env.COMPANY_INQUIRY_EMAIL_TEST_RECIPIENT,
        allowedRecipientDomain: process.env.COMPANY_INQUIRY_EMAIL_ALLOWED_RECIPIENT_DOMAIN,
      }
    );

    if (sendResult.ok) {
      deliveryStatus = "sent";
      providerMessageId = sendResult.providerMessageId ?? null;
    } else if (sendResult.skipped) {
      deliveryStatus = "failed";
      failureCode = "configuration_error";
      console.info(`Email delivery skipped for inquiry ${messageId}. Reason: ${sendResult.reason}`);
    } else {
      deliveryStatus = "failed";
      failureCode = sendResult.category;
      console.warn(`Email delivery failed for inquiry ${messageId}. Category: ${sendResult.category}`);
    }
  } else {
    deliveryStatus = "failed";
    failureCode = "recipient_unavailable";
  }

  // 6. Update status
  type UpdatePayload = Database["public"]["Tables"]["company_contact_messages"]["Update"];
  const updatePayload: UpdatePayload = {
    delivery_status: deliveryStatus,
  };

  if (deliveryStatus === "sent") {
    updatePayload.sent_at = new Date().toISOString();
    updatePayload.provider_message_id = providerMessageId;
  } else {
    updatePayload.failed_at = new Date().toISOString();
    updatePayload.failure_code = failureCode;
  }

  const { error: updateError } = await adminClient
    .from("company_contact_messages")
    .update(updatePayload)
    .eq("id", messageId);

  if (updateError) {
    console.error("Failed to update company inquiry delivery status", { messageId });
  }

  return { success: true };
}

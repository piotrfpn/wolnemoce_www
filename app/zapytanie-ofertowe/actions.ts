"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getRfqAttachmentExtension,
  validateRfqAttachmentFiles,
} from "@/lib/rfqAttachments";

export type InquiryActionResult = {
  error?: string;
  partialSuccess?: string;
};

const attachmentsBucket = "inquiry-attachments";

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function isFileLike(value: FormDataEntryValue): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "size" in value &&
    "type" in value &&
    typeof value.name === "string" &&
    typeof value.size === "number"
  );
}

function getAttachmentFiles(formData: FormData) {
  return formData
    .getAll("attachments")
    .filter((value): value is File => isFileLike(value) && value.size > 0);
}

function validateInquiry(formData: FormData) {
  const offerId = getValue(formData, "offer_id");
  const buyerName = getValue(formData, "buyer_name");
  const buyerCompany = getValue(formData, "buyer_company");
  const buyerEmail = getValue(formData, "buyer_email");
  const buyerPhone = getValue(formData, "buyer_phone");
  const message = getValue(formData, "message");

  if (!offerId) {
    return "Brak aktywnej oferty dla zapytania.";
  }

  if (!buyerName) {
    return "Podaj imię i nazwisko.";
  }

  if (!buyerCompany) {
    return "Podaj nazwę firmy.";
  }

  if (!buyerEmail || !buyerEmail.includes("@")) {
    return "Podaj poprawny adres email.";
  }

  if (buyerPhone.length < 6) {
    return "Podaj poprawny numer telefonu.";
  }

  if (message.length < 10) {
    return "Wiadomość musi mieć co najmniej 10 znaków.";
  }

  return "";
}

function removePolishChars(value: string) {
  return value
    .replace(/[ąĄ]/g, "a")
    .replace(/[ćĆ]/g, "c")
    .replace(/[ęĘ]/g, "e")
    .replace(/[łŁ]/g, "l")
    .replace(/[ńŃ]/g, "n")
    .replace(/[óÓ]/g, "o")
    .replace(/[śŚ]/g, "s")
    .replace(/[źŹżŻ]/g, "z");
}

function safeFileName(fileName: string, index: number) {
  const extension = getRfqAttachmentExtension(fileName);
  const baseName = extension ? fileName.slice(0, -(extension.length + 1)) : fileName;
  const safeBase =
    removePolishChars(baseName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80) || "zalacznik";
  const suffix = `${Date.now()}-${index + 1}`;

  return extension ? `${suffix}-${safeBase}.${extension}` : `${suffix}-${safeBase}`;
}

async function saveAttachments(params: {
  files: File[];
  inquiryId: string;
  companyId: string;
  offerId: string;
}) {
  const supabase = createClient();
  let hasUploadError = false;

  for (let index = 0; index < params.files.length; index += 1) {
    const file = params.files[index];
    const storagePath = `inquiries/${params.inquiryId}/${safeFileName(file.name, index)}`;
    const { error: uploadError } = await supabase.storage
      .from(attachmentsBucket)
      .upload(storagePath, file, {
        contentType: file.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      hasUploadError = true;
      continue;
    }

    const { error: metadataError } = await supabase.from("inquiry_attachments").insert({
      inquiry_id: params.inquiryId,
      company_id: params.companyId,
      offer_id: params.offerId,
      storage_bucket: attachmentsBucket,
      storage_path: storagePath,
      original_file_name: file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
    });

    if (metadataError) {
      hasUploadError = true;
    }
  }

  return hasUploadError;
}

export async function submitInquiry(
  formData: FormData
): Promise<InquiryActionResult> {
  const validationError = validateInquiry(formData);
  if (validationError) {
    return { error: validationError };
  }

  const attachments = getAttachmentFiles(formData);
  const attachmentValidationError = validateRfqAttachmentFiles(attachments);
  if (attachmentValidationError) {
    return { error: attachmentValidationError };
  }

  const offerId = getValue(formData, "offer_id");
  const supabase = createClient();
  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .select("id, company_id, branch, service_type, status")
    .eq("id", offerId)
    .eq("status", "active")
    .single();

  if (offerError || !offer) {
    return { error: "Oferta nie jest dostępna albo nie jest aktywna." };
  }

  const inquiryId = crypto.randomUUID();
  const { error: insertError } = await supabase.from("inquiries").insert({
    id: inquiryId,
    offer_id: offer.id,
    company_id: offer.company_id,
    branch: offer.branch,
    service_type: offer.service_type,
    buyer_name: getValue(formData, "buyer_name"),
    buyer_company: getValue(formData, "buyer_company"),
    buyer_email: getValue(formData, "buyer_email"),
    buyer_phone: getValue(formData, "buyer_phone"),
    quantity_scope: getValue(formData, "quantity_scope") || null,
    expected_deadline: getValue(formData, "expected_deadline") || null,
    budget: getValue(formData, "budget") || null,
    message: getValue(formData, "message"),
    status: "new",
    source: "offer",
  });

  if (insertError) {
    return { error: "Nie udało się wysłać zapytania. Spróbuj ponownie za chwilę." };
  }

  if (attachments.length > 0) {
    const hasUploadError = await saveAttachments({
      files: attachments,
      inquiryId,
      companyId: offer.company_id,
      offerId: offer.id,
    });

    if (hasUploadError) {
      return {
        partialSuccess:
          "Zapytanie zostało wysłane, ale nie wszystkie załączniki udało się wgrać.",
      };
    }
  }

  redirect("/zapytanie-wyslane");
}

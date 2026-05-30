"use server";


import { createClient } from "@/lib/supabase/server";
import type {
  CertificateActionResult,
  CertificateDownloadResult,
  CertificateVerificationStatus,
} from "./types";
import { isRedirectError } from "next/dist/client/components/redirect";
import type { Database } from "@/lib/database.types";
import { revalidateCertificateViews } from "@/lib/revalidateCertificateViews";

const publicBucket = "company-certificates-public";
const privateBucket = "company-certificates-private";
const allowedStatuses = new Set<CertificateVerificationStatus>([
  "declared",
  "admin_verified",
  "rejected",
]);

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Nie udało się sprawdzić roli administratora: ${error.message}`);
  }

  if (profile?.role !== "admin") {
    throw new Error("Forbidden");
  }

  return { supabase, userId: user.id };
}

function normalizeNote(note: string) {
  const trimmed = note.trim();
  return trimmed === "" ? null : trimmed;
}

function appendDownloadParam(url: string, fileName: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}download=${encodeURIComponent(fileName)}`;
}

export async function updateCertificateModeration(
  certificateId: string,
  status: CertificateVerificationStatus,
  note: string
): Promise<CertificateActionResult> {
  if (!certificateId || !allowedStatuses.has(status)) {
    return { error: "Nieprawidłowe dane certyfikatu." };
  }

  let admin;

  try {
    admin = await requireAdmin();
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { error: "Brak uprawnień administratora." };
  }

  const { data: certificate, error: fetchError } = await admin.supabase
    .from("company_certificates")
    .select("id, company_id, admin_note")
    .eq("id", certificateId)
    .single();

  if (fetchError || !certificate) {
    return { error: "Nie znaleziono certyfikatu." };
  }

  const nextNote = normalizeNote(note);
  const updatePayload: Database["public"]["Tables"]["company_certificates"]["Update"] =
    status === "declared"
      ? {
          verification_status: "declared",
          verified_by: null,
          verified_at: null,
          admin_note: nextNote,
        }
      : {
          verification_status: status,
          verified_by: admin.userId,
          verified_at: new Date().toISOString(),
          admin_note: nextNote ?? certificate.admin_note ?? null,
        };

  const { error: updateError } = await admin.supabase
    .from("company_certificates")
    .update(updatePayload)
    .eq("id", certificateId);

  if (updateError) {
    return { error: "Nie udało się zapisać moderacji certyfikatu." };
  }

  const { data: company } = await admin.supabase
    .from("companies")
    .select("slug")
    .eq("id", certificate.company_id)
    .maybeSingle();

  try {
    revalidateCertificateViews(company?.slug);
  } catch (error) {
    console.error("[certificate-moderation] Revalidation failed", {
      certificateId,
      status,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }

  return { success: "Zapisano status certyfikatu." };
}

export async function createCertificateDownloadUrl(
  certificateId: string
): Promise<CertificateDownloadResult> {
  if (!certificateId) {
    return { error: "Nieprawidłowy certyfikat." };
  }

  let admin;

  try {
    admin = await requireAdmin();
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { error: "Brak uprawnień administratora." };
  }

  const { data: certificate, error } = await admin.supabase
    .from("company_certificates")
    .select("id, file_bucket, file_path, file_name")
    .eq("id", certificateId)
    .single();

  if (error || !certificate) {
    return { error: "Nie znaleziono certyfikatu." };
  }

  if (!certificate.file_bucket || !certificate.file_path) {
    return { error: "Ten certyfikat nie ma pliku do pobrania." };
  }

  const fileName = certificate.file_name || "certyfikat";

  if (certificate.file_bucket === publicBucket) {
    const { data } = admin.supabase.storage
      .from(publicBucket)
      .getPublicUrl(certificate.file_path);

    return {
      url: appendDownloadParam(data.publicUrl, fileName),
      fileName,
    };
  }

  if (certificate.file_bucket !== privateBucket) {
    return { error: "Nieprawidłowy bucket certyfikatu." };
  }

  const { data, error: signedUrlError } = await admin.supabase.storage
    .from(privateBucket)
    .createSignedUrl(certificate.file_path, 60);

  if (signedUrlError || !data?.signedUrl) {
    return { error: "Nie udało się przygotować linku do pobrania." };
  }

  return {
    url: data.signedUrl,
    fileName,
  };
}

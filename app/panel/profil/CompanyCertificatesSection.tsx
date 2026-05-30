"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

type CompanyCertificate =
  Database["public"]["Tables"]["company_certificates"]["Row"];

type CertificateVisibility = "public" | "private";

type CompanyCertificatesSectionProps = {
  companyId: string;
  initialCertificates: CompanyCertificate[];
};

const publicBucket = "company-certificates-public";
const privateBucket = "company-certificates-private";
const maxCertificateFileSize = 5 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);
const allowedExtensions = new Set(["pdf", "jpg", "jpeg", "png"]);

const inputClass =
  "min-w-0 max-w-full w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10";

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function getSafeFileName(fileName: string) {
  const extension = getFileExtension(fileName);
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  const safeBaseName =
    baseName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "certyfikat";

  return extension ? `${safeBaseName}.${extension}` : safeBaseName;
}

function validateCertificateFile(file: File) {
  const extension = getFileExtension(file.name);

  if (file.size > maxCertificateFileSize) {
    return "Plik certyfikatu może mieć maksymalnie 5 MB.";
  }

  if (!allowedMimeTypes.has(file.type)) {
    return "Dozwolone formaty pliku to PDF, JPG i PNG.";
  }

  if (!allowedExtensions.has(extension)) {
    return "Dozwolone rozszerzenia pliku to .pdf, .jpg, .jpeg i .png.";
  }

  return "";
}

function normalizeOptionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Nie podano";
  }

  return new Intl.DateTimeFormat("pl-PL").format(new Date(value));
}

function formatFileSize(size: number | null) {
  if (!size) {
    return "";
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getVisibilityLabel(visibility: string) {
  return visibility === "public" ? "Publiczny" : "Prywatny";
}

function getVerificationLabel(status: string) {
  if (status === "admin_verified") {
    return "Zweryfikowany przez administratora";
  }

  if (status === "rejected") {
    return "Odrzucony";
  }

  return "Deklarowany przez firmę";
}

function getBucketForVisibility(visibility: CertificateVisibility) {
  return visibility === "public" ? publicBucket : privateBucket;
}

function triggerDownload(url: string, fileName: string | null) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "certyfikat";
  link.rel = "noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function CompanyCertificatesSection({
  companyId,
  initialCertificates,
}: CompanyCertificatesSectionProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [certificates, setCertificates] = useState(initialCertificates);
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [visibility, setVisibility] = useState<CertificateVisibility>("public");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyCertificateId, setBusyCertificateId] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setIssuer("");
    setCertificateNumber("");
    setIssuedAt("");
    setExpiresAt("");
    setVisibility("public");
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setError("");

    if (nextFile) {
      const validationError = validateCertificateFile(nextFile);

      if (validationError) {
        setFile(null);
        event.target.value = "";
        setError(validationError);
        return;
      }
    }

    setFile(nextFile);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Podaj nazwę certyfikatu.");
      return;
    }

    if (file) {
      const validationError = validateCertificateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const certificateId = crypto.randomUUID();
    const issuedAtValue = issuedAt.trim() === "" ? null : issuedAt;
    const expiresAtValue = expiresAt.trim() === "" ? null : expiresAt;
    let fileBucket: string | null = null;
    let filePath: string | null = null;
    let fileName: string | null = null;
    let mimeType: string | null = null;
    let sizeBytes: number | null = null;

    if (file) {
      fileBucket = getBucketForVisibility(visibility);
      fileName = file.name;
      mimeType = file.type;
      sizeBytes = file.size;
      filePath = `companies/${companyId}/certificates/${certificateId}/${getSafeFileName(file.name)}`;

      const uploadResult = await supabase.storage
        .from(fileBucket)
        .upload(filePath, file);

      if (uploadResult.error) {
        setError(uploadResult.error.message);
        setIsSubmitting(false);
        return;
      }
    }

    const insertPayload = {
      id: certificateId,
      company_id: companyId,
      name: trimmedName,
      issuer: normalizeOptionalValue(issuer),
      certificate_number: normalizeOptionalValue(certificateNumber),
      issued_at: issuedAtValue,
      expires_at: expiresAtValue,
      visibility,
      verification_status: "declared",
      file_bucket: fileBucket,
      file_path: filePath,
      file_name: fileName,
      mime_type: mimeType,
      size_bytes: sizeBytes,
    };

    const { data, error: insertError } = await supabase
      .from("company_certificates")
      .insert(insertPayload)
      .select("*")
      .single();

    if (insertError) {
      if (fileBucket && filePath) {
        const cleanupResult = await supabase.storage
          .from(fileBucket)
          .remove([filePath]);

        // TODO: If cleanup fails, admin cleanup may be required for the orphaned file.
        if (cleanupResult.error) {
          setError(
            `Nie zapisano certyfikatu. Plik został wgrany, ale nie udało się go wyczyścić automatycznie: ${cleanupResult.error.message}`
          );
          setIsSubmitting(false);
          return;
        }
      }

      setError(insertError.message);
      setIsSubmitting(false);
      return;
    }

    setCertificates((current) => [data as CompanyCertificate, ...current]);
    resetForm();
    setMessage("Certyfikat został dodany.");
    setIsSubmitting(false);
    router.refresh();
  }

  async function handleDelete(certificate: CompanyCertificate) {
    setError("");
    setMessage("");

    const confirmed = window.confirm("Czy na pewno usunąć certyfikat?");
    if (!confirmed) {
      return;
    }

    setBusyCertificateId(certificate.id);
    const supabase = createClient();

    if (certificate.file_bucket && certificate.file_path) {
      const removeResult = await supabase.storage
        .from(certificate.file_bucket)
        .remove([certificate.file_path]);

      if (removeResult.error) {
        setError(removeResult.error.message);
        setBusyCertificateId(null);
        return;
      }
    }

    const { error: deleteError } = await supabase
      .from("company_certificates")
      .delete()
      .eq("id", certificate.id)
      .eq("company_id", companyId);

    if (deleteError) {
      setError(
        `Plik został usunięty, ale nie udało się usunąć rekordu certyfikatu: ${deleteError.message}`
      );
      setBusyCertificateId(null);
      return;
    }

    setCertificates((current) =>
      current.filter((item) => item.id !== certificate.id)
    );
    setMessage("Certyfikat został usunięty.");
    setBusyCertificateId(null);
    router.refresh();
  }

  async function handleDownload(certificate: CompanyCertificate) {
    setError("");
    setMessage("");

    if (!certificate.file_bucket || !certificate.file_path) {
      setError("Ten certyfikat nie ma pliku do pobrania.");
      return;
    }

    setBusyCertificateId(certificate.id);
    const supabase = createClient();

    if (certificate.file_bucket === publicBucket) {
      const { data } = supabase.storage
        .from(publicBucket)
        .getPublicUrl(certificate.file_path);
      const separator = data.publicUrl.includes("?") ? "&" : "?";
      triggerDownload(
        `${data.publicUrl}${separator}download=${encodeURIComponent(
          certificate.file_name || "certyfikat"
        )}`,
        certificate.file_name
      );
      setBusyCertificateId(null);
      return;
    }

    const { data, error: signedUrlError } = await supabase.storage
      .from(certificate.file_bucket)
      .createSignedUrl(certificate.file_path, 60);

    if (signedUrlError || !data?.signedUrl) {
      setError(signedUrlError?.message || "Nie udało się wygenerować linku pobierania.");
      setBusyCertificateId(null);
      return;
    }

    triggerDownload(data.signedUrl, certificate.file_name);
    setBusyCertificateId(null);
  }

  return (
    <section className="mt-8 min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6">
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
          Certyfikaty firmy
        </p>
        <h2 className="text-2xl font-extrabold text-slate-900">
          Zarządzanie certyfikatami
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Dodaj certyfikaty jakości, zgodności lub branżowe. Certyfikaty
          publiczne będą mogły być pokazane w profilu firmy po kolejnym etapie
          wdrożenia.
        </p>
      </div>

      {error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid min-w-0 gap-4 md:grid-cols-2">
        <label className="block min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Nazwa certyfikatu
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Np. ISO 9001"
            className={inputClass}
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Organ wydający
          </span>
          <input
            value={issuer}
            onChange={(event) => setIssuer(event.target.value)}
            placeholder="Np. TÜV, UDT, jednostka certyfikująca"
            className={inputClass}
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Numer certyfikatu
          </span>
          <input
            value={certificateNumber}
            onChange={(event) => setCertificateNumber(event.target.value)}
            placeholder="Opcjonalnie"
            className={inputClass}
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Widoczność
          </span>
          <select
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as CertificateVisibility)
            }
            className={inputClass}
          >
            <option value="public">Publiczny</option>
            <option value="private">Prywatny</option>
          </select>
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Data wydania
          </span>
          <input
            type="date"
            value={issuedAt}
            onChange={(event) => setIssuedAt(event.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Data ważności
          </span>
          <input
            type="date"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block min-w-0 md:col-span-2">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Plik certyfikatu
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={handleFileChange}
            className="min-w-0 max-w-full w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#1a5f3c] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
          />
          <span className="mt-2 block text-xs leading-5 text-slate-500">
            PDF, JPG lub PNG, maksymalnie 5 MB. Widoczności certyfikatu z
            plikiem nie można zmienić po dodaniu. Aby zmienić widoczność, usuń
            certyfikat i dodaj go ponownie.
          </span>
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Dodawanie..." : "Dodaj certyfikat"}
          </button>
        </div>
      </form>

      <div className="mt-8 space-y-4">
        {certificates.length > 0 ? (
          certificates.map((certificate) => (
            <article
              key={certificate.id}
              className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <h3 className="break-words text-lg font-extrabold text-slate-900">
                    {certificate.name}
                  </h3>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    <p>
                      <span className="font-bold text-slate-800">Organ:</span>{" "}
                      {certificate.issuer || "Nie podano"}
                    </p>
                    <p>
                      <span className="font-bold text-slate-800">Numer:</span>{" "}
                      {certificate.certificate_number || "Nie podano"}
                    </p>
                    <p>
                      <span className="font-bold text-slate-800">Wydany:</span>{" "}
                      {formatDate(certificate.issued_at)}
                    </p>
                    <p>
                      <span className="font-bold text-slate-800">Ważny do:</span>{" "}
                      {formatDate(certificate.expires_at)}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                      {getVisibilityLabel(certificate.visibility)}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      {getVerificationLabel(certificate.verification_status)}
                    </span>
                    {certificate.file_name ? (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                        {certificate.file_name}
                        {formatFileSize(certificate.size_bytes)
                          ? ` · ${formatFileSize(certificate.size_bytes)}`
                          : ""}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                  {certificate.file_bucket && certificate.file_path ? (
                    <button
                      type="button"
                      onClick={() => handleDownload(certificate)}
                      disabled={busyCertificateId === certificate.id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-4 py-2 text-sm font-bold text-[#1a5f3c] transition hover:bg-[#1a5f3c] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <i className="fas fa-download"></i>
                      Pobierz plik
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleDelete(certificate)}
                    disabled={busyCertificateId === certificate.id}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:border-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <i className="fas fa-trash"></i>
                    Usuń
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            Nie dodano jeszcze certyfikatów firmy.
          </div>
        )}
      </div>
    </section>
  );
}

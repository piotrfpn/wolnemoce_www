"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createCertificateDownloadUrl,
  updateCertificateModeration,
} from "./actions";
import type {
  AdminCertificateListItem,
  CertificateActionResult,
  CertificateVerificationStatus,
} from "./types";

type CertificateAdminListClientProps = {
  certificates: AdminCertificateListItem[];
};

const statusLabels: Record<string, string> = {
  declared: "Deklarowany",
  admin_verified: "Zweryfikowany",
  rejected: "Odrzucony",
};

const statusClasses: Record<string, string> = {
  declared: "bg-amber-50 text-amber-700",
  admin_verified: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

const visibilityLabels: Record<string, string> = {
  public: "Publiczny",
  private: "Prywatny",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Nie podano";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Nie podano";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Nie podano";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Nie podano";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatFileSize(size: number | null) {
  if (!size) {
    return "";
  }

  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function triggerDownload(url: string, fileName: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function CertificateAdminListClient({
  certificates,
}: CertificateAdminListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyCertificateId, setBusyCertificateId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      certificates.map((certificate) => [
        certificate.id,
        certificate.admin_note ?? "",
      ])
    )
  );
  const [result, setResult] = useState<CertificateActionResult>({});

  function updateNote(certificateId: string, value: string) {
    setNotes((current) => ({
      ...current,
      [certificateId]: value,
    }));
  }

  function handleModeration(
    certificateId: string,
    status: CertificateVerificationStatus
  ) {
    setResult({});
    setBusyCertificateId(certificateId);

    startTransition(async () => {
      const nextResult = await updateCertificateModeration(
        certificateId,
        status,
        notes[certificateId] ?? ""
      );
      setResult(nextResult);
      setBusyCertificateId(null);

      if (nextResult.success) {
        router.refresh();
      }
    });
  }

  function handleDownload(certificateId: string) {
    setResult({});
    setBusyCertificateId(certificateId);

    startTransition(async () => {
      const downloadResult = await createCertificateDownloadUrl(certificateId);
      setBusyCertificateId(null);

      if (downloadResult.error || !downloadResult.url) {
        setResult({
          error: downloadResult.error ?? "Nie udało się pobrać pliku.",
        });
        return;
      }

      triggerDownload(downloadResult.url, downloadResult.fileName ?? "certyfikat");
    });
  }

  if (certificates.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        Brak certyfikatów dla podanych kryteriów.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {result.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error}
        </div>
      ) : null}

      {result.success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {result.success}
        </div>
      ) : null}

      {certificates.map((certificate) => {
        const company = certificate.company;
        const status = certificate.verification_status;
        const fileSize = formatFileSize(certificate.size_bytes);
        const isBusy = busyCertificateId === certificate.id || isPending;

        return (
          <article
            key={certificate.id}
            className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6"
          >
            <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      statusClasses[status] ?? statusClasses.declared
                    }`}
                  >
                    {statusLabels[status] ?? status}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {visibilityLabels[certificate.visibility] ??
                      certificate.visibility}
                  </span>
                  {company?.is_verified ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      Firma zweryfikowana
                    </span>
                  ) : null}
                </div>

                <h2 className="break-words text-xl font-extrabold text-slate-900">
                  {certificate.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {company?.name ?? "Firma bez nazwy"}
                  {company?.nip ? ` · NIP: ${company.nip}` : ""}
                  {company?.regon ? ` · REGON: ${company.regon}` : ""}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {[company?.location_city, company?.location_voivodeship]
                    .filter(Boolean)
                    .join(", ") || "Brak lokalizacji"}
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:flex-col">
                {company?.slug ? (
                  <Link
                    href={`/firmy/${company.slug}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 no-underline transition hover:border-[#1a5f3c] hover:text-[#1a5f3c]"
                  >
                    Profil firmy
                  </Link>
                ) : null}
                {certificate.file_bucket && certificate.file_path ? (
                  <button
                    type="button"
                    onClick={() => handleDownload(certificate.id)}
                    disabled={isBusy}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-4 py-2.5 text-sm font-bold text-[#1a5f3c] transition hover:bg-[#1a5f3c] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <i className="fas fa-download"></i>
                    Pobierz plik
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-5 grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <InfoTile label="Organ wydający" value={certificate.issuer} />
              <InfoTile
                label="Numer certyfikatu"
                value={certificate.certificate_number}
              />
              <InfoTile
                label="Data wydania"
                value={formatDate(certificate.issued_at)}
              />
              <InfoTile
                label="Ważny do"
                value={formatDate(certificate.expires_at)}
              />
              <InfoTile
                label="Plik"
                value={
                  certificate.file_name
                    ? `${certificate.file_name}${fileSize ? ` · ${fileSize}` : ""}`
                    : "Brak pliku"
                }
              />
              <InfoTile
                label="Dodano"
                value={formatDateTime(certificate.created_at)}
              />
              <InfoTile
                label="Ostatnia zmiana"
                value={formatDateTime(certificate.updated_at)}
              />
              <InfoTile
                label="Weryfikacja"
                value={formatDateTime(certificate.verified_at)}
              />
            </div>

            <div className="mt-5 grid min-w-0 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <label className="block min-w-0">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Notatka admina
                </span>
                <textarea
                  value={notes[certificate.id] ?? ""}
                  onChange={(event) =>
                    updateNote(certificate.id, event.target.value)
                  }
                  rows={3}
                  className="min-w-0 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
                  placeholder="Opcjonalna notatka widoczna tylko dla administracji"
                />
              </label>

              <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[520px]">
                <button
                  type="button"
                  onClick={() =>
                    handleModeration(certificate.id, "admin_verified")
                  }
                  disabled={isBusy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0d3d26] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Zatwierdź
                </button>
                <button
                  type="button"
                  onClick={() => handleModeration(certificate.id, "rejected")}
                  disabled={isBusy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 px-4 py-3 text-sm font-bold text-red-700 transition hover:border-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Odrzuć
                </button>
                <button
                  type="button"
                  onClick={() => handleModeration(certificate.id, "declared")}
                  disabled={isBusy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Przywróć
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-900">
        {value || "Nie podano"}
      </p>
    </div>
  );
}

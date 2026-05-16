"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { industryServiceTypes } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/client";

type CompanyData = {
  id: string;
  name: string | null;
  industry: string | null;
  industries: string[] | null;
  service_types: string[] | null;
};

type OfferStatus = "draft" | "pending" | "active" | "rejected";

type OfferData = {
  id: string;
  title: string | null;
  branch?: string | null;
  service_type: string | null;
  description: string | null;
  power_available: string | null;
  min_order: string | null;
  lead_time: string | null;
  status: OfferStatus;
};

type OfferFormClientProps = {
  company: CompanyData;
  offer?: OfferData;
  mode: "new" | "edit";
};

const inputClass =
  "min-w-0 max-w-full w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

const statusLabels: Record<OfferStatus, string> = {
  draft: "Szkic",
  pending: "Oczekuje na zatwierdzenie",
  active: "Aktywna",
  rejected: "Odrzucona",
};

function slugify(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/ł/g, "l")
    .replace(/Ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return `${normalized || "oferta"}-${Date.now().toString(36)}`;
}

function getCompanyIndustries(company: CompanyData) {
  if (company.industries && company.industries.length > 0) {
    return company.industries;
  }

  return company.industry ? [company.industry] : [];
}

function getServicesForBranch(branch: string, companyServices: string[]) {
  const dictionaryServices = industryServiceTypes[branch] ?? [];
  return dictionaryServices.filter((service) => companyServices.includes(service));
}

export default function OfferFormClient({
  company,
  offer,
  mode,
}: OfferFormClientProps) {
  const router = useRouter();
  const companyIndustries = getCompanyIndustries(company);
  const companyServices = company.service_types ?? [];
  const currentStatus = offer?.status ?? "draft";
  const canChooseStatus = mode === "new" || currentStatus === "draft";
  const isLockedModerationStatus =
    currentStatus === "active" || currentStatus === "rejected";
  const initialBranch =
    offer?.branch && companyIndustries.includes(offer.branch)
      ? offer.branch
      : companyIndustries[0] ?? "";

  const [title, setTitle] = useState(offer?.title ?? "");
  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const [serviceType, setServiceType] = useState(offer?.service_type ?? "");
  const [description, setDescription] = useState(offer?.description ?? "");
  const [powerAvailable, setPowerAvailable] = useState(
    offer?.power_available ?? ""
  );
  const [minOrder, setMinOrder] = useState(offer?.min_order ?? "");
  const [leadTime, setLeadTime] = useState(offer?.lead_time ?? "");
  const [saveMode, setSaveMode] = useState<"draft" | "pending">(
    currentStatus === "pending" ? "pending" : "draft"
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const branchServices = useMemo(
    () => getServicesForBranch(selectedBranch, companyServices),
    [selectedBranch, companyServices]
  );

  const hasProfileSetup =
    companyIndustries.length > 0 && companyServices.length > 0;
  const canSaveOffer =
    hasProfileSetup &&
    Boolean(selectedBranch) &&
    branchServices.length > 0 &&
    !isSubmitting;

  function validateForm() {
    if (!title.trim()) {
      return "Podaj tytuł oferty.";
    }

    if (!selectedBranch) {
      return "Wybierz branżę oferty.";
    }

    if (!serviceType || !branchServices.includes(serviceType)) {
      return "Wybierz rodzaj usługi zgodny z branżą oferty.";
    }

    if (!description.trim()) {
      return "Podaj opis możliwości produkcyjnych.";
    }

    if (!powerAvailable.trim()) {
      return "Podaj dostępną moc.";
    }

    if (!leadTime.trim()) {
      return "Podaj termin realizacji.";
    }

    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!canSaveOffer) {
      setError("Najpierw uzupełnij branże i usługi w zakładce Profil firmy.");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const basePayload = {
      title: title.trim(),
      branch: selectedBranch,
      service_type: serviceType,
      description: description.trim(),
      power_available: powerAvailable.trim(),
      min_order: minOrder.trim() || null,
      lead_time: leadTime.trim(),
    };

    const query =
      mode === "new"
        ? supabase.from("offers").insert({
            ...basePayload,
            company_id: company.id,
            slug: slugify(title),
            status: saveMode,
          })
        : supabase
            .from("offers")
            .update({
              ...basePayload,
              ...(currentStatus === "draft" ? { status: saveMode } : {}),
            })
            .eq("id", offer?.id ?? "");

    const { error: saveError } = await query;

    if (saveError) {
      setError(saveError.message);
      setIsSubmitting(false);
      return;
    }

    router.push("/panel/oferty");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
          {mode === "new" ? "Nowa oferta" : "Edycja oferty"}
        </p>
        <h1 className="text-2xl font-extrabold text-slate-900">
          {mode === "new" ? "Dodaj ofertę" : "Edytuj ofertę"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Każda oferta ma jedną konkretną branżę i jedną usługę wybraną z
          profilu firmy.
        </p>
      </div>

      {!hasProfileSetup ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="font-bold">
            Musisz najpierw uzupełnić branże i usługi w zakładce Profil firmy.
          </p>
          <p className="mt-2 leading-6">
            Bez branż i usług nie można dodać oferty powiązanej z firmą.
          </p>
          <Link
            href="/panel/profil"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#1a5f3c] no-underline"
          >
            Uzupełnij profil firmy
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>
      ) : null}

      {hasProfileSetup && selectedBranch && branchServices.length === 0 ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="font-bold">
            Dla tej branży nie wybrano usług w profilu firmy.
          </p>
          <Link
            href="/panel/profil"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#1a5f3c] no-underline"
          >
            Uzupełnij profil firmy
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>
      ) : null}

      {isLockedModerationStatus ? (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
          Zmiana treści aktywnej lub odrzuconej oferty może wymagać ponownej
          moderacji w kolejnym sprincie. W tym sprincie status pozostaje bez
          zmian: <strong>{statusLabels[currentStatus]}</strong>.
        </div>
      ) : null}

      {error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid min-w-0 gap-5 md:grid-cols-2">
        <label className="block min-w-0 md:col-span-2">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-heading text-[#1a5f3c]"></i>
            Tytuł oferty
          </span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={inputClass}
            placeholder="Np. Obróbka CNC - wolne moce 500 szt/miesiąc"
            disabled={!hasProfileSetup}
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-industry text-[#1a5f3c]"></i>
            Branża oferty
          </span>
          <select
            value={selectedBranch}
            onChange={(event) => {
              setSelectedBranch(event.target.value);
              setServiceType("");
            }}
            className={inputClass}
            disabled={!hasProfileSetup}
          >
            <option value="">Wybierz branżę oferty</option>
            {companyIndustries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-screwdriver-wrench text-[#1a5f3c]"></i>
            Rodzaj usługi
          </span>
          <select
            value={serviceType}
            onChange={(event) => setServiceType(event.target.value)}
            className={inputClass}
            disabled={!canSaveOffer}
          >
            <option value="">Wybierz rodzaj usługi</option>
            {branchServices.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-0 md:col-span-2">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-align-left text-[#1a5f3c]"></i>
            Opis możliwości produkcyjnych
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={6}
            className={inputClass}
            placeholder="Opisz technologię, zakres prac, materiały, serie i dostępność."
            disabled={!hasProfileSetup}
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-chart-bar text-[#1a5f3c]"></i>
            Dostępna moc
          </span>
          <input
            value={powerAvailable}
            onChange={(event) => setPowerAvailable(event.target.value)}
            className={inputClass}
            placeholder="Np. 500 szt/mies."
            disabled={!hasProfileSetup}
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-boxes-stacked text-[#1a5f3c]"></i>
            Minimalne zamówienie
          </span>
          <input
            value={minOrder}
            onChange={(event) => setMinOrder(event.target.value)}
            className={inputClass}
            placeholder="Np. 50 szt."
            disabled={!hasProfileSetup}
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-clock text-[#1a5f3c]"></i>
            Termin realizacji
          </span>
          <input
            value={leadTime}
            onChange={(event) => setLeadTime(event.target.value)}
            className={inputClass}
            placeholder="Np. 2 tygodnie"
            disabled={!hasProfileSetup}
          />
        </label>

        {canChooseStatus ? (
          <fieldset className="min-w-0 md:col-span-2">
            <legend className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <i className="fas fa-floppy-disk text-[#1a5f3c]"></i>
              Tryb zapisu
            </legend>
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              {[
                {
                  value: "draft" as const,
                  title: "Szkic",
                  description: "Zapisz ofertę roboczo bez wysyłania do moderacji.",
                },
                {
                  value: "pending" as const,
                  title: "Wyślij do zatwierdzenia",
                  description: "Przekaż ofertę do późniejszej moderacji.",
                },
              ].map((item) => (
                <label
                  key={item.value}
                  className={`min-w-0 cursor-pointer rounded-xl border p-4 transition ${
                    saveMode === item.value
                      ? "border-[#1a5f3c] bg-[#f4fbf7]"
                      : "border-slate-200 bg-white hover:border-[#1a5f3c]/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="saveMode"
                    value={item.value}
                    checked={saveMode === item.value}
                    onChange={() => setSaveMode(item.value)}
                    className="sr-only"
                    disabled={!canSaveOffer}
                  />
                  <span className="block font-bold text-slate-900">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-500">
                    {item.description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <div className="min-w-0 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            Status po zapisie pozostanie bez zmian:{" "}
            <strong>{statusLabels[currentStatus]}</strong>.
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={!canSaveOffer}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Zapisywanie..." : "Zapisz ofertę"}
        </button>
        <Link href="/panel/oferty" className="btn btn-outline">
          Anuluj
        </Link>
      </div>
    </form>
  );
}

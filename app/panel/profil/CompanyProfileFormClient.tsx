"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { categories, industryServiceTypes, provinces } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/client";

type ProfileData = {
  role: string | null;
  full_name: string | null;
};

type CompanyData = {
  id: string;
  nip: string | null;
  name: string | null;
  description: string | null;
  industry: string | null;
  service_types: string[] | null;
  location_voivodeship: string | null;
  location_city: string | null;
  is_verified: boolean | null;
};

type CompanyProfileFormClientProps = {
  userId: string;
  userEmail: string | null;
  profile: ProfileData | null;
  company: CompanyData | null;
};

const inputClass =
  "min-w-0 max-w-full w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10";

const sortedCategories = [...categories].sort((first, second) =>
  first.localeCompare(second, "pl")
);

export default function CompanyProfileFormClient({
  userId,
  userEmail,
  profile,
  company,
}: CompanyProfileFormClientProps) {
  const router = useRouter();
  const [companyId, setCompanyId] = useState(company?.id ?? "");
  const [isVerified, setIsVerified] = useState(Boolean(company?.is_verified));
  const [nip, setNip] = useState(company?.nip ?? "");
  const [name, setName] = useState(company?.name ?? "");
  const [industry, setIndustry] = useState(company?.industry ?? "");
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>(
    company?.service_types ?? []
  );
  const [voivodeship, setVoivodeship] = useState(
    company?.location_voivodeship ?? ""
  );
  const [city, setCity] = useState(company?.location_city ?? "");
  const [description, setDescription] = useState(company?.description ?? "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm() {
    const normalizedNip = nip.replace(/[\s-]/g, "");

    if (!normalizedNip || normalizedNip.length < 10) {
      return "Podaj poprawny NIP. Minimum 10 znaków po usunięciu spacji i myślników.";
    }

    if (!name.trim()) {
      return "Podaj nazwę firmy.";
    }

    if (!industry) {
      return "Wybierz branżę.";
    }

    if (selectedServiceTypes.length === 0) {
      return "Wybierz co najmniej jeden rodzaj usługi.";
    }

    if (!voivodeship) {
      return "Wybierz województwo.";
    }

    if (!city.trim()) {
      return "Podaj miasto.";
    }

    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const payload = {
      nip: nip.replace(/[\s-]/g, ""),
      name: name.trim(),
      description: description.trim() || null,
      industry,
      service_types: selectedServiceTypes,
      location_voivodeship: voivodeship,
      location_city: city.trim(),
    };

    const query = companyId
      ? supabase
          .from("companies")
          .update(payload)
          .eq("id", companyId)
          .select(
            "id, nip, name, description, industry, service_types, location_voivodeship, location_city, is_verified"
          )
          .single()
      : supabase
          .from("companies")
          .insert({
            ...payload,
            user_id: userId,
          })
          .select(
            "id, nip, name, description, industry, service_types, location_voivodeship, location_city, is_verified"
          )
          .single();

    const { data, error: saveError } = await query;

    if (saveError) {
      setError(saveError.message);
      setIsSubmitting(false);
      return;
    }

    if (data) {
      setCompanyId(data.id);
      setIsVerified(Boolean(data.is_verified));
      setNip(data.nip ?? "");
      setName(data.name ?? "");
      setDescription(data.description ?? "");
      setIndustry(data.industry ?? "");
      setSelectedServiceTypes(data.service_types ?? []);
      setVoivodeship(data.location_voivodeship ?? "");
      setCity(data.location_city ?? "");
    }

    setMessage("Profil firmy został zapisany.");
    setIsSubmitting(false);
    router.refresh();
  }

  const availableServiceTypes = industry
    ? industryServiceTypes[industry] ?? []
    : [];

  function toggleServiceType(serviceType: string) {
    setSelectedServiceTypes((current) =>
      current.includes(serviceType)
        ? current.filter((item) => item !== serviceType)
        : [...current, serviceType]
    );
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <aside className="min-w-0 space-y-6">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
            Użytkownik
          </p>
          <h2 className="text-xl font-extrabold text-slate-900">
            Dane konta
          </h2>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <p className="min-w-0 break-words">
              <strong className="text-slate-900">Email:</strong>{" "}
              {userEmail ?? "Brak emaila"}
            </p>
            <p>
              <strong className="text-slate-900">Rola:</strong>{" "}
              {profile?.role ?? "user"}
            </p>
            {profile?.full_name ? (
              <p>
                <strong className="text-slate-900">Imię i nazwisko:</strong>{" "}
                {profile.full_name}
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
            Status firmy
          </p>
          <div
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
              isVerified
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <i className={isVerified ? "fas fa-circle-check" : "fas fa-clock"}></i>
            {isVerified ? "Firma zweryfikowana" : "Oczekuje na weryfikację"}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Weryfikacja firmy będzie wykonywana przez administratora
            WolneMoce.pl.
          </p>
        </div>

        <Link
          href="/panel"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-5 py-3 text-sm font-bold text-[#1a5f3c] no-underline transition hover:bg-[#1a5f3c] hover:text-white"
        >
          <i className="fas fa-arrow-left"></i>
          Wróć do panelu
        </Link>
      </aside>

      <form
        onSubmit={handleSubmit}
        className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
      >
        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
            Profil firmy
          </p>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Dane firmy
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Uzupełnij dane firmy, które będą wykorzystywane przy ofertach i
            zapytaniach.
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

        <div className="grid min-w-0 gap-5 md:grid-cols-2">
          <label className="block min-w-0">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <i className="fas fa-id-card text-[#1a5f3c]"></i>
              NIP
            </span>
            <input
              value={nip}
              onChange={(event) => setNip(event.target.value)}
              placeholder="Np. 1234567890"
              className={inputClass}
            />
          </label>

          <label className="block min-w-0">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <i className="fas fa-building text-[#1a5f3c]"></i>
              Nazwa firmy
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Np. MetalPol Sp. z o.o."
              className={inputClass}
            />
          </label>

          <label className="block min-w-0">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <i className="fas fa-industry text-[#1a5f3c]"></i>
              Branża
            </span>
            <select
              value={industry}
              onChange={(event) => {
                setIndustry(event.target.value);
                setSelectedServiceTypes([]);
              }}
              className={inputClass}
            >
              <option value="">Wybierz branżę</option>
              {sortedCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <div className="min-w-0 md:col-span-2">
            <div className="mb-3">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <i className="fas fa-screwdriver-wrench text-[#1a5f3c]"></i>
                Rodzaje usług
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Wybierz usługi, które najlepiej opisują możliwości Twojej firmy.
                Możesz zaznaczyć kilka pozycji.
              </p>
            </div>

            {!industry ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                Najpierw wybierz branżę, aby zobaczyć dostępne rodzaje usług.
              </div>
            ) : (
              <div className="grid min-w-0 gap-3 md:grid-cols-2">
                {availableServiceTypes.map((serviceType) => {
                  const isChecked = selectedServiceTypes.includes(serviceType);

                  return (
                    <label
                      key={serviceType}
                      className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                        isChecked
                          ? "border-[#1a5f3c] bg-[#f4fbf7] text-slate-900"
                          : "border-slate-200 bg-white text-slate-600 hover:border-[#1a5f3c]/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleServiceType(serviceType)}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-[#1a5f3c]"
                      />
                      <span className="min-w-0 leading-6">{serviceType}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <label className="block min-w-0">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <i className="fas fa-map text-[#1a5f3c]"></i>
              Województwo
            </span>
            <select
              value={voivodeship}
              onChange={(event) => setVoivodeship(event.target.value)}
              className={inputClass}
            >
              <option value="">Wybierz województwo</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-0 md:col-span-2">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <i className="fas fa-location-dot text-[#1a5f3c]"></i>
              Miasto
            </span>
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Np. Poznań, Kalisz, Leszno"
              className={inputClass}
            />
          </label>

          <label className="block min-w-0 md:col-span-2">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <i className="fas fa-align-left text-[#1a5f3c]"></i>
              Opis firmy
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={6}
              placeholder="Opisz specjalizację, park maszynowy, doświadczenie lub typ klientów."
              className={inputClass}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-8 btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Zapisywanie..." : "Zapisz profil firmy"}
        </button>
      </form>
    </div>
  );
}

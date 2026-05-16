"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import StaticFormField from "@/components/StaticFormField";
import { industryServiceTypes, provinces } from "@/lib/mockData";

type LocationMode = "profile" | "custom";

const industryOptions = Object.keys(industryServiceTypes);
const provinceOptions = provinces.map((province) => ({
  label: province,
  value: province,
}));

const inputClass =
  "min-w-0 max-w-full w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

function FieldLabel({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        <i className={`${icon} text-[#1a5f3c]`}></i>
        {label}
      </span>
      {children}
    </label>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-extrabold text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

export default function AddOfferFormClient() {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [locationMode, setLocationMode] = useState<LocationMode>("profile");

  const serviceOptions = selectedIndustry
    ? industryServiceTypes[selectedIndustry] ?? []
    : [];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/zapytanie-wyslane");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="min-w-0 max-w-full rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900">
          Dodaj ofertę wolnych mocy
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Formularz jest UI-only. Dane firmy są pokazane jako symulacja
          przyszłego profilu zalogowanej firmy.
        </p>
      </div>

      <section className="min-w-0 border-b border-slate-200 pb-8">
        <SectionHeader title="Profil firmy" />
        <div className="rounded-2xl border border-[#1a5f3c]/15 bg-[#f4fbf7] p-5">
          <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                Dodajesz ofertę jako
              </p>
              <h3 className="mt-2 text-xl font-extrabold text-slate-900">
                MetalPol Sp. z o.o.
              </h3>
              <div className="mt-3 grid min-w-0 gap-2 text-sm text-slate-600 md:grid-cols-2">
                <p className="min-w-0">
                  <strong className="text-slate-900">NIP:</strong> 1234567890
                </p>
                <p className="min-w-0">
                  <strong className="text-slate-900">Profil firmowy:</strong>{" "}
                  Warszawa, Mazowieckie
                </p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#1a5f3c] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
              <i className="fas fa-circle-check"></i>
              Zweryfikowana firma
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            W wersji produkcyjnej te dane będą pobierane automatycznie z
            profilu zalogowanej firmy.
          </p>
        </div>
      </section>

      <section className="min-w-0 border-b border-slate-200 py-8">
        <SectionHeader title="Miejsce realizacji usługi" />
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          {[
            {
              value: "profile" as const,
              title: "Zgodne z profilem firmy",
              description: "Użyj lokalizacji zapisanej w profilu firmowym.",
              icon: "fas fa-building-circle-check",
            },
            {
              value: "custom" as const,
              title: "Inna lokalizacja realizacji usługi",
              description: "Podaj inne miasto lub województwo dla tej oferty.",
              icon: "fas fa-location-dot",
            },
          ].map((option) => (
            <label
              key={option.value}
              className={`block min-w-0 cursor-pointer rounded-2xl border p-5 transition ${
                locationMode === option.value
                  ? "border-[#1a5f3c] bg-[#f4fbf7] shadow-sm"
                  : "border-slate-200 bg-white hover:border-[#1a5f3c]/40"
              }`}
            >
              <input
                type="radio"
                name="locationMode"
                value={option.value}
                checked={locationMode === option.value}
                onChange={() => setLocationMode(option.value)}
                className="sr-only"
              />
              <span className="flex min-w-0 items-start gap-3">
                <i className={`${option.icon} mt-1 text-[#1a5f3c]`}></i>
                <span className="min-w-0">
                  <span className="block font-bold text-slate-900">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-500">
                    {option.description}
                  </span>
                </span>
              </span>
            </label>
          ))}
        </div>

        {locationMode === "profile" ? (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            Lokalizacja z profilu: Warszawa, Mazowieckie
          </div>
        ) : (
          <div className="mt-5 grid min-w-0 gap-5 md:grid-cols-2">
            <StaticFormField
              label="Województwo"
              name="province"
              options={provinceOptions}
              icon="fas fa-map"
            />
            <StaticFormField
              label="Miasto"
              name="city"
              icon="fas fa-location-dot"
            />
          </div>
        )}
      </section>

      <section className="min-w-0 border-b border-slate-200 py-8">
        <SectionHeader title="Zakres oferty" />
        <div className="grid min-w-0 gap-5 md:grid-cols-2">
          <FieldLabel label="Branża" icon="fas fa-industry">
            <select
              name="industry"
              value={selectedIndustry}
              onChange={(event) => {
                setSelectedIndustry(event.target.value);
                setSelectedServiceType("");
              }}
              className={inputClass}
            >
              <option value="">Wybierz branżę</option>
              {industryOptions.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </FieldLabel>

          <div className="min-w-0 md:col-span-2">
            <FieldLabel label="Rodzaj usługi" icon="fas fa-cogs">
              <select
                name="serviceType"
                value={selectedServiceType}
                onChange={(event) => setSelectedServiceType(event.target.value)}
                disabled={!selectedIndustry}
                className={inputClass}
              >
                <option value="">
                  {selectedIndustry ? "Wybierz rodzaj usługi" : "Najpierw wybierz branżę"}
                </option>
                {serviceOptions.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </FieldLabel>
          </div>

          <StaticFormField
            label="Tytuł oferty"
            name="title"
            icon="fas fa-heading"
          />

          <div className="min-w-0 md:col-span-2">
            <StaticFormField
              label="Opis możliwości produkcyjnych"
              name="description"
              textarea
              rows={5}
              placeholder="Opisz park maszynowy, technologie, materiały, typowe serie i dostępność."
              icon="fas fa-align-left"
            />
          </div>
        </div>
      </section>

      <section className="min-w-0 border-b border-slate-200 py-8">
        <SectionHeader title="Parametry produkcyjne" />
        <div className="grid min-w-0 gap-5 md:grid-cols-2">
          <StaticFormField
            label="Dostępna moc"
            name="capacity"
            icon="fas fa-chart-bar"
          />
          <StaticFormField
            label="Jednostka mocy"
            name="capacityUnit"
            placeholder="Np. szt/mies., tony/mies."
            icon="fas fa-ruler"
          />
          <StaticFormField
            label="Minimalne zamówienie"
            name="minimumOrder"
            icon="fas fa-boxes-stacked"
          />
          <StaticFormField
            label="Termin realizacji"
            name="leadTime"
            icon="fas fa-clock"
          />
          <div className="min-w-0 md:col-span-2">
            <StaticFormField
              label="Certyfikaty"
              name="certificates"
              placeholder="Np. ISO 9001, CE, GMP"
              icon="fas fa-certificate"
            />
          </div>
        </div>
      </section>

      <section className="min-w-0 pt-8">
        <SectionHeader title="Kontakt do oferty" />
        <div className="grid min-w-0 gap-5 md:grid-cols-3">
          <StaticFormField
            label="Osoba kontaktowa"
            name="contactPerson"
            icon="fas fa-user-tie"
          />
          <StaticFormField
            label="Email"
            name="email"
            type="email"
            icon="fas fa-envelope"
          />
          <StaticFormField
            label="Telefon"
            name="phone"
            type="tel"
            icon="fas fa-phone"
          />
        </div>
      </section>

      <button type="submit" className="mt-8 btn btn-primary">
        Wyślij do weryfikacji
      </button>
    </form>
  );
}

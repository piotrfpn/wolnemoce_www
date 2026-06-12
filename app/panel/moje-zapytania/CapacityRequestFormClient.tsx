"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useMemo, useState, useTransition } from "react";
import {
  createCapacityRequest,
  type CapacityRequestActionResult,
} from "./capacityRequestActions";
import {
  capacityRequestBudgetTypes,
  capacityRequestUnits,
  categories,
  getServicesForIndustry,
  provinces,
} from "@/lib/mockData";

const inputClass =
  "min-w-0 max-w-full w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

function getTomorrowInputValue() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function getMaxDeadlineInputValue() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

export default function CapacityRequestFormClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [budgetType, setBudgetType] = useState("not_provided");
  const [result, setResult] = useState<CapacityRequestActionResult>({});
  const serviceOptions = useMemo(
    () => getServicesForIndustry(selectedBranch),
    [selectedBranch]
  );

  function handleBranchChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextBranch = event.target.value;
    const nextServices = getServicesForIndustry(nextBranch);
    setSelectedBranch(nextBranch);
    setSelectedServiceType((currentServiceType) =>
      nextServices.includes(currentServiceType) ? currentServiceType : ""
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult({});
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const nextResult = await createCapacityRequest(formData);
      setResult(nextResult);

      if (nextResult.success) {
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
          Moje zlecenia
        </p>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Dodaj zapytanie produkcyjne
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Opisz, jakiego wykonawcy szukasz. Po moderacji zapytanie pojawi się
          publicznie bez danych kontaktowych Twojej firmy.
        </p>
      </div>

      {result.error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error}
        </div>
      ) : null}

      {result.success ? (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
          {result.success}
          <Link href="/panel/moje-zapytania" className="mt-3 block font-bold text-[#1a5f3c]">
            Przejdź do listy moich zleceń
          </Link>
        </div>
      ) : null}

      <div className="grid min-w-0 gap-5 md:grid-cols-2">
        <label className="block min-w-0 md:col-span-2">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-heading text-[#1a5f3c]"></i>
            Tytuł zapytania
          </span>
          <input
            name="title"
            minLength={10}
            required
            className={inputClass}
            placeholder="np. Zlecę frezowanie 200 detali aluminiowych"
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-industry text-[#1a5f3c]"></i>
            Branża
          </span>
          <select
            name="branch"
            value={selectedBranch}
            onChange={handleBranchChange}
            required
            className={inputClass}
          >
            <option value="">Wybierz branżę</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
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
            name="service_type"
            value={selectedServiceType}
            onChange={(event) => setSelectedServiceType(event.target.value)}
            disabled={!selectedBranch}
            required
            className={inputClass}
          >
            <option value="">
              {selectedBranch ? "Wybierz usługę" : "Najpierw wybierz branżę"}
            </option>
            {serviceOptions.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-0 md:col-span-2">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-align-left text-[#1a5f3c]"></i>
            Opis potrzeby
          </span>
          <textarea
            name="description"
            rows={7}
            minLength={150}
            required
            className={inputClass}
            placeholder="Opisz materiał, technologię, oczekiwaną jakość, zakres prac, tolerancje, wymagania produkcyjne i informacje, które pomogą wykonawcy ocenić zlecenie."
          />
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Minimum 150 znaków. Nie dodawaj publicznie danych kontaktowych.
          </p>
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-boxes-stacked text-[#1a5f3c]"></i>
            Ilość / wolumen
          </span>
          <input name="quantity" type="number" min={0} step="any" className={inputClass} />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-ruler text-[#1a5f3c]"></i>
            Jednostka
          </span>
          <select name="unit" className={inputClass}>
            <option value="">Do ustalenia</option>
            {capacityRequestUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-calendar-day text-[#1a5f3c]"></i>
            Oczekiwany termin
          </span>
          <input
            name="deadline"
            type="date"
            min={getTomorrowInputValue()}
            max={getMaxDeadlineInputValue()}
            required
            className={inputClass}
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-map text-[#1a5f3c]"></i>
            Preferowane województwo
          </span>
          <select name="preferred_region" className={inputClass}>
            <option value="">Cała Polska / do ustalenia</option>
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
            Preferowana lokalizacja
          </span>
          <input
            name="location"
            className={inputClass}
            placeholder="np. okolice Poznania, odbiór własny, wysyłka kurierem"
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-wallet text-[#1a5f3c]"></i>
            Budżet
          </span>
          <select
            name="budget_type"
            value={budgetType}
            onChange={(event) => setBudgetType(event.target.value)}
            required
            className={inputClass}
          >
            {capacityRequestBudgetTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Min
            </span>
            <input
              name="budget_min"
              type="number"
              min={0}
              step="any"
              disabled={budgetType !== "range"}
              required={budgetType === "range"}
              className={inputClass}
            />
          </label>
          <label className="block min-w-0">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Max
            </span>
            <input
              name="budget_max"
              type="number"
              min={0}
              step="any"
              disabled={budgetType !== "range"}
              required={budgetType === "range"}
              className={inputClass}
            />
          </label>
        </div>

        <label className="flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
          <input
            type="checkbox"
            name="technical_documentation_available"
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-[#1a5f3c]"
          />
          <span className="min-w-0">
            <span className="block text-sm font-bold text-slate-900">
              Posiadam dokumentację techniczną
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Dodatkową dokumentację możesz przekazać na dalszym etapie kontaktu
              z wykonawcą.
            </span>
          </span>
        </label>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isPending || Boolean(result.success)}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Zapisywanie..." : "Przekaż do moderacji"}
        </button>
        <Link href="/panel/moje-zapytania" className="btn btn-outline">
          Anuluj
        </Link>
      </div>
    </form>
  );
}

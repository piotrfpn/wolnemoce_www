"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useMemo, useState, useTransition } from "react";
import {
  createCapacityRequest,
  type CapacityRequestActionErrorCode,
  type CapacityRequestActionResult,
  type CapacityRequestActionSuccessCode,
} from "./capacityRequestActions";
import type {
  CapacityRequestBudgetTypeValue,
  CapacityRequestIndustryValue,
  CapacityRequestOption,
  CapacityRequestProvinceValue,
  CapacityRequestUnitValue,
} from "@/lib/i18n/capacityRequestTaxonomy";
import type { CapacityRequestServiceValue } from "@/lib/i18n/capacityRequestServiceTaxonomy";
import type { PanelCapacityRequestFormDictionary } from "@/lib/i18n/types";

type CapacityRequestServiceOptionGroup = {
  industry: CapacityRequestIndustryValue;
  options: Array<CapacityRequestOption<CapacityRequestServiceValue>>;
};

type CapacityRequestFormClientProps = {
  dict: PanelCapacityRequestFormDictionary;
  industryOptions: Array<CapacityRequestOption<CapacityRequestIndustryValue>>;
  serviceOptionsByIndustry: CapacityRequestServiceOptionGroup[];
  provinceOptions: Array<CapacityRequestOption<CapacityRequestProvinceValue>>;
  unitOptions: Array<CapacityRequestOption<CapacityRequestUnitValue>>;
  budgetTypeOptions: Array<CapacityRequestOption<CapacityRequestBudgetTypeValue>>;
};

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

export default function CapacityRequestFormClient({
  dict,
  industryOptions,
  serviceOptionsByIndustry,
  provinceOptions,
  unitOptions,
  budgetTypeOptions,
}: CapacityRequestFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [budgetType, setBudgetType] = useState("not_provided");
  const [result, setResult] = useState<CapacityRequestActionResult>({});

  const errorMessages = {
    AUTH_REQUIRED: dict.messages.errors.authRequired,
    COMPANY_LOAD_FAILED: dict.messages.errors.companyLoadFailed,
    COMPANY_REQUIRED: dict.messages.errors.companyRequired,
    VALIDATION_FAILED: dict.messages.errors.validationFailed,
    TITLE_TOO_SHORT: dict.messages.errors.titleTooShort,
    BRANCH_REQUIRED: dict.messages.errors.branchRequired,
    SERVICE_TYPE_REQUIRED: dict.messages.errors.serviceTypeRequired,
    SERVICE_NOT_ALLOWED_FOR_BRANCH: dict.messages.errors.serviceNotAllowedForBranch,
    DESCRIPTION_TOO_SHORT: dict.messages.errors.descriptionTooShort,
    DEADLINE_INVALID: dict.messages.errors.deadlineInvalid,
    DEADLINE_TOO_SOON: dict.messages.errors.deadlineTooSoon,
    DEADLINE_TOO_LATE: dict.messages.errors.deadlineTooLate,
    BUDGET_TYPE_INVALID: dict.messages.errors.budgetTypeInvalid,
    QUANTITY_INVALID: dict.messages.errors.quantityInvalid,
    BUDGET_RANGE_REQUIRED: dict.messages.errors.budgetRangeRequired,
    BUDGET_RANGE_INVALID: dict.messages.errors.budgetRangeInvalid,
    REQUEST_LIMIT_CHECK_FAILED: dict.messages.errors.requestLimitCheckFailed,
    REQUEST_LIMIT_REACHED: dict.messages.errors.requestLimitReached,
    REQUEST_SAVE_FAILED: dict.messages.errors.requestSaveFailed,
  } satisfies Record<CapacityRequestActionErrorCode, string>;

  const successMessages = {
    REQUEST_SUBMITTED: dict.messages.success.submitted,
  } satisfies Record<CapacityRequestActionSuccessCode, string>;

  const errorMessage = result.errorCode ? errorMessages[result.errorCode] : null;
  const successMessage = result.successCode ? successMessages[result.successCode] : null;

  const serviceOptions = useMemo(() => {
    if (!selectedBranch) {
      return [];
    }

    return (
      serviceOptionsByIndustry.find(({ industry }) => industry === selectedBranch)
        ?.options ?? []
    );
  }, [selectedBranch, serviceOptionsByIndustry]);

  function handleBranchChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextBranch = event.target.value;

    const nextServices =
      serviceOptionsByIndustry.find(({ industry }) => industry === nextBranch)
        ?.options ?? [];

    setSelectedBranch(nextBranch);

    setSelectedServiceType((currentServiceType) =>
      nextServices.some(({ value }) => value === currentServiceType)
        ? currentServiceType
        : ""
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult({});
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const nextResult = await createCapacityRequest(formData);

        setResult(nextResult);

        if (nextResult.successCode) {
          router.refresh();
        }
      } catch {
        setResult({
          errorCode: "REQUEST_SAVE_FAILED",
        });
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
          {dict.eyebrow}
        </p>
        <h1 className="text-2xl font-extrabold text-slate-900">
          {dict.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {dict.description}
        </p>
      </div>

      {errorMessage ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
          {successMessage}
          <Link href="/panel/moje-zapytania" className="mt-3 block font-bold text-[#1a5f3c]">
            {dict.successLink}
          </Link>
        </div>
      ) : null}

      <div className="grid min-w-0 gap-5 md:grid-cols-2">
        <label className="block min-w-0 md:col-span-2">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-heading text-[#1a5f3c]"></i>
            {dict.fields.title.label}
          </span>
          <input
            name="title"
            minLength={10}
            required
            className={inputClass}
            placeholder={dict.fields.title.placeholder}
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-industry text-[#1a5f3c]"></i>
            {dict.fields.branch.label}
          </span>
          <select
            name="branch"
            value={selectedBranch}
            onChange={handleBranchChange}
            required
            className={inputClass}
          >
            <option value="">{dict.fields.branch.placeholder}</option>
            {industryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-screwdriver-wrench text-[#1a5f3c]"></i>
            {dict.fields.serviceType.label}
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
              {selectedBranch ? dict.fields.serviceType.placeholder : dict.fields.serviceType.selectBranchFirst}
            </option>
            {serviceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-0 md:col-span-2">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-align-left text-[#1a5f3c]"></i>
            {dict.fields.description.label}
          </span>
          <textarea
            name="description"
            rows={7}
            minLength={150}
            required
            className={inputClass}
            placeholder={dict.fields.description.placeholder}
          />
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {dict.fields.description.help}
          </p>
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-boxes-stacked text-[#1a5f3c]"></i>
            {dict.fields.quantity.label}
          </span>
          <input name="quantity" type="number" min={0} step="any" className={inputClass} />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-ruler text-[#1a5f3c]"></i>
            {dict.fields.unit.label}
          </span>
          <select name="unit" className={inputClass}>
            <option value="">{dict.fields.unit.placeholder}</option>
            {unitOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-calendar-day text-[#1a5f3c]"></i>
            {dict.fields.deadline.label}
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
            {dict.fields.preferredRegion.label}
          </span>
          <select name="preferred_region" className={inputClass}>
            <option value="">{dict.fields.preferredRegion.placeholder}</option>
            {provinceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-0 md:col-span-2">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-location-dot text-[#1a5f3c]"></i>
            {dict.fields.location.label}
          </span>
          <input
            name="location"
            className={inputClass}
            placeholder={dict.fields.location.placeholder}
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-wallet text-[#1a5f3c]"></i>
            {dict.fields.budget.label}
          </span>
          <select
            name="budget_type"
            value={budgetType}
            onChange={(event) => setBudgetType(event.target.value)}
            required
            className={inputClass}
          >
            {budgetTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              {dict.fields.budgetMin.label}
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
              {dict.fields.budgetMax.label}
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
              {dict.fields.technicalDocumentation.label}
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              {dict.fields.technicalDocumentation.description}
            </span>
          </span>
        </label>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isPending || Boolean(result.successCode)}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? dict.submit.submitting : dict.submit.submit}
        </button>
        <Link href="/panel/moje-zapytania" className="btn btn-outline">
          {dict.submit.cancel}
        </Link>
      </div>
    </form>
  );
}

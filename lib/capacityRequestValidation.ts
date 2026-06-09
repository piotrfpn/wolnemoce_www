import { getServicesForIndustry } from "@/lib/mockData";

export type CapacityRequestBudgetType = "not_provided" | "indicative" | "range";

export type CapacityRequestFormValues = {
  title: string;
  branch: string;
  service_type: string;
  description: string;
  quantity: string;
  unit: string;
  deadline: string;
  budget_type: string;
  budget_min: string;
  budget_max: string;
  preferred_region: string;
  location: string;
  technical_documentation_available: boolean;
};

export type ParsedCapacityRequestValues = {
  title: string;
  branch: string;
  service_type: string;
  description: string;
  quantity: number | null;
  unit: string | null;
  deadline: string;
  budget_type: CapacityRequestBudgetType;
  budget_min: number | null;
  budget_max: number | null;
  preferred_region: string | null;
  location: string | null;
  technical_documentation_available: boolean;
};

export type CapacityRequestValidationResult =
  | { ok: true; values: ParsedCapacityRequestValues }
  | { ok: false; error: string };

const allowedBudgetTypes = new Set(["not_provided", "indicative", "range"]);

function parseDateOnly(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function startOfToday(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) {
    return null;
  }

  const normalized = value.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function validateCapacityRequestForm(
  values: CapacityRequestFormValues,
  now = new Date()
): CapacityRequestValidationResult {
  const title = values.title.trim();
  const branch = values.branch.trim();
  const serviceType = values.service_type.trim();
  const description = values.description.trim();
  const budgetType = values.budget_type.trim();
  const quantity = parseOptionalNumber(values.quantity);
  const budgetMin = parseOptionalNumber(values.budget_min);
  const budgetMax = parseOptionalNumber(values.budget_max);
  const deadlineDate = parseDateOnly(values.deadline.trim());
  const today = startOfToday(now);
  const minDeadline = new Date(today);
  minDeadline.setDate(minDeadline.getDate() + 1);
  const maxDeadline = new Date(today);
  maxDeadline.setFullYear(maxDeadline.getFullYear() + 1);

  if (title.length < 10) {
    return { ok: false, error: "Tytuł zapytania musi mieć co najmniej 10 znaków." };
  }

  if (!branch) {
    return { ok: false, error: "Wybierz branżę." };
  }

  if (!serviceType) {
    return { ok: false, error: "Wybierz rodzaj usługi." };
  }

  if (!getServicesForIndustry(branch).includes(serviceType)) {
    return { ok: false, error: "Wybierz usługę pasującą do branży." };
  }

  if (description.length < 150) {
    return { ok: false, error: "Opis potrzeby musi mieć co najmniej 150 znaków." };
  }

  if (!deadlineDate) {
    return { ok: false, error: "Podaj poprawny oczekiwany termin." };
  }

  if (deadlineDate < minDeadline) {
    return { ok: false, error: "Oczekiwany termin musi być najwcześniej jutro." };
  }

  if (deadlineDate > maxDeadline) {
    return { ok: false, error: "Oczekiwany termin nie może być dalszy niż 12 miesięcy." };
  }

  if (!allowedBudgetTypes.has(budgetType)) {
    return { ok: false, error: "Wybierz typ budżetu." };
  }

  if (quantity !== null && (!Number.isFinite(quantity) || quantity < 0)) {
    return { ok: false, error: "Ilość musi być liczbą nieujemną." };
  }

  if (budgetType === "range") {
    if (
      budgetMin === null ||
      budgetMax === null ||
      !Number.isFinite(budgetMin) ||
      !Number.isFinite(budgetMax)
    ) {
      return { ok: false, error: "Dla budżetu zakresowego podaj budżet minimalny i maksymalny." };
    }

    if (budgetMin < 0 || budgetMax < budgetMin) {
      return { ok: false, error: "Budżet maksymalny musi być większy lub równy minimalnemu." };
    }
  }

  return {
    ok: true,
    values: {
      title,
      branch,
      service_type: serviceType,
      description,
      quantity,
      unit: values.unit.trim() || null,
      deadline: values.deadline.trim(),
      budget_type: budgetType as CapacityRequestBudgetType,
      budget_min: budgetType === "range" ? budgetMin : null,
      budget_max: budgetType === "range" ? budgetMax : null,
      preferred_region: values.preferred_region.trim() || null,
      location: values.location.trim() || null,
      technical_documentation_available: values.technical_documentation_available,
    },
  };
}

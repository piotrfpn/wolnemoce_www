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

export type CapacityRequestValidationErrorCode =
  | "TITLE_TOO_SHORT"
  | "BRANCH_REQUIRED"
  | "SERVICE_TYPE_REQUIRED"
  | "SERVICE_NOT_ALLOWED_FOR_BRANCH"
  | "DESCRIPTION_TOO_SHORT"
  | "DEADLINE_INVALID"
  | "DEADLINE_TOO_SOON"
  | "DEADLINE_TOO_LATE"
  | "BUDGET_TYPE_INVALID"
  | "QUANTITY_INVALID"
  | "BUDGET_RANGE_REQUIRED"
  | "BUDGET_RANGE_INVALID"
  | "VALIDATION_FAILED";

export type CapacityRequestValidationResult =
  | {
      ok: true;
      values: ParsedCapacityRequestValues;
    }
  | {
      ok: false;
      errorCode: CapacityRequestValidationErrorCode;
    };

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
    return { ok: false, errorCode: "TITLE_TOO_SHORT" };
  }

  if (!branch) {
    return { ok: false, errorCode: "BRANCH_REQUIRED" };
  }

  if (!serviceType) {
    return { ok: false, errorCode: "SERVICE_TYPE_REQUIRED" };
  }

  if (!getServicesForIndustry(branch).includes(serviceType)) {
    return { ok: false, errorCode: "SERVICE_NOT_ALLOWED_FOR_BRANCH" };
  }

  if (description.length < 150) {
    return { ok: false, errorCode: "DESCRIPTION_TOO_SHORT" };
  }

  if (!deadlineDate) {
    return { ok: false, errorCode: "DEADLINE_INVALID" };
  }

  if (deadlineDate < minDeadline) {
    return { ok: false, errorCode: "DEADLINE_TOO_SOON" };
  }

  if (deadlineDate > maxDeadline) {
    return { ok: false, errorCode: "DEADLINE_TOO_LATE" };
  }

  if (!allowedBudgetTypes.has(budgetType)) {
    return { ok: false, errorCode: "BUDGET_TYPE_INVALID" };
  }

  if (quantity !== null && (!Number.isFinite(quantity) || quantity < 0)) {
    return { ok: false, errorCode: "QUANTITY_INVALID" };
  }

  if (budgetType === "range") {
    if (
      budgetMin === null ||
      budgetMax === null ||
      !Number.isFinite(budgetMin) ||
      !Number.isFinite(budgetMax)
    ) {
      return { ok: false, errorCode: "BUDGET_RANGE_REQUIRED" };
    }

    if (budgetMin < 0 || budgetMax < budgetMin) {
      return { ok: false, errorCode: "BUDGET_RANGE_INVALID" };
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

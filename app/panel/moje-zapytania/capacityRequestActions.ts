"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  slugifyCapacityRequestTitle,
} from "@/lib/capacityRequests";
import {
  type CapacityRequestFormValues,
  validateCapacityRequestForm,
} from "@/lib/capacityRequestValidation";

export type CapacityRequestActionResult = {
  error?: string;
  success?: string;
};

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getFormValues(formData: FormData): CapacityRequestFormValues {
  return {
    title: getValue(formData, "title"),
    branch: getValue(formData, "branch"),
    service_type: getValue(formData, "service_type"),
    description: getValue(formData, "description"),
    quantity: getValue(formData, "quantity"),
    unit: getValue(formData, "unit"),
    deadline: getValue(formData, "deadline"),
    budget_type: getValue(formData, "budget_type"),
    budget_min: getValue(formData, "budget_min"),
    budget_max: getValue(formData, "budget_max"),
    preferred_region: getValue(formData, "preferred_region"),
    location: getValue(formData, "location"),
    technical_documentation_available:
      formData.get("technical_documentation_available") === "on",
  };
}

async function requireUserCompany() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Musisz się zalogować.", supabase, company: null, userId: "" };
  }

  const { data: company, error } = await supabase
    .from("companies")
    .select("id, name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { error: "Nie udało się pobrać profilu firmy.", supabase, company: null, userId: user.id };
  }

  if (!company) {
    return { error: "Najpierw uzupełnij profil firmy.", supabase, company: null, userId: user.id };
  }

  return { supabase, company, userId: user.id, error: "" };
}

export async function createCapacityRequest(
  formData: FormData
): Promise<CapacityRequestActionResult> {
  const context = await requireUserCompany();

  if (context.error || !context.company) {
    return { error: context.error || "Brak profilu firmy." };
  }

  const validation = validateCapacityRequestForm(getFormValues(formData));

  if (!validation.ok) {
    return { error: validation.error };
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: recentRequestCount, error: countError } = await context.supabase.rpc(
    "count_my_recent_capacity_requests",
    {
      p_company_id: context.company.id,
      p_since: weekAgo.toISOString(),
    }
  );

  if (countError) {
    return { error: "Nie udało się sprawdzić limitu zapytań." };
  }

  if ((recentRequestCount ?? 0) >= 3) {
    return {
      error:
        "Limit 3 zapytań na firmę w ciągu 7 dni został wykorzystany. Spróbuj ponownie później.",
    };
  }

  const { error } = await context.supabase.from("capacity_requests").insert({
    company_id: context.company.id,
    title: validation.values.title,
    slug: slugifyCapacityRequestTitle(validation.values.title),
    branch: validation.values.branch,
    service_type: validation.values.service_type,
    location: validation.values.location,
    preferred_region: validation.values.preferred_region,
    quantity: validation.values.quantity,
    unit: validation.values.unit,
    deadline: validation.values.deadline,
    budget_type: validation.values.budget_type,
    budget_min: validation.values.budget_min,
    budget_max: validation.values.budget_max,
    description: validation.values.description,
    technical_documentation_available:
      validation.values.technical_documentation_available,
    status: "pending",
    contact_visibility: "hidden",
    is_featured: false,
  });

  if (error) {
    return { error: "Nie udało się zapisać zapytania. Sprawdź dane i spróbuj ponownie." };
  }

  revalidatePath("/panel/moje-zapytania");
  revalidatePath("/admin/zapytania");

  return {
    success:
      "Twoje zapytanie zostało zapisane i przekazane do moderacji. Po weryfikacji przez administratora pojawi się publicznie w sekcji zapytań produkcyjnych. Dane kontaktowe Twojej firmy nie będą publicznie widoczne. Zwykle weryfikujemy zapytania w ciągu 1-2 dni roboczych.",
  };
}

export async function archiveOwnerCapacityRequest(formData: FormData) {
  const requestId = getValue(formData, "requestId");
  const context = await requireUserCompany();

  if (!requestId || context.error || !context.company) {
    return;
  }

  await context.supabase
    .from("capacity_requests")
    .update({ status: "archived" })
    .eq("id", requestId)
    .eq("company_id", context.company.id);

  revalidatePath("/panel/moje-zapytania");
  revalidatePath("/zapytania");
}

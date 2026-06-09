import "server-only";

import { createClient } from "@/lib/supabase/server";

export const PUBLIC_CAPACITY_REQUEST_SELECT =
  "id, title, slug, branch, service_type, location, preferred_region, quantity, unit, deadline, budget_type, budget_min, budget_max, description, technical_documentation_available, status, is_featured, views_count, interest_count, expires_at, created_at";

export type CapacityRequestStatus =
  | "draft"
  | "pending"
  | "active"
  | "rejected"
  | "expired"
  | "archived";

export type PublicCapacityRequest = {
  id: string;
  title: string;
  slug: string;
  branch: string;
  service_type: string;
  location: string | null;
  preferred_region: string | null;
  quantity: number | null;
  unit: string | null;
  deadline: string;
  budget_type: string;
  budget_min: number | null;
  budget_max: number | null;
  description: string;
  technical_documentation_available: boolean;
  status: CapacityRequestStatus;
  is_featured: boolean;
  views_count: number;
  interest_count: number;
  expires_at: string;
  created_at: string;
};

export type OwnerCapacityRequest = PublicCapacityRequest & {
  admin_note?: string | null;
};

export type CapacityRequestFilters = {
  branch?: string;
  serviceType?: string;
  q?: string;
};

function sanitizeSearchTerm(value: string) {
  return value.replace(/[(),%{}[\]]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export function slugifyCapacityRequestTitle(value: string) {
  const normalized =
    value
      .toLowerCase()
      .replace(/[ąĄ]/g, "a")
      .replace(/[ćĆ]/g, "c")
      .replace(/[ęĘ]/g, "e")
      .replace(/[łŁ]/g, "l")
      .replace(/[ńŃ]/g, "n")
      .replace(/[óÓ]/g, "o")
      .replace(/[śŚ]/g, "s")
      .replace(/[źŹżŻ]/g, "z")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-")
      .slice(0, 80) || "zapytanie";

  return `${normalized}-${Date.now().toString(36)}`;
}

export function formatCapacityRequestDate(value: string | null) {
  if (!value) {
    return "Nie podano";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function formatCapacityRequestBudget(request: Pick<PublicCapacityRequest, "budget_type" | "budget_min" | "budget_max">) {
  if (request.budget_type === "range" && request.budget_min !== null && request.budget_max !== null) {
    return `${request.budget_min.toLocaleString("pl-PL")} - ${request.budget_max.toLocaleString("pl-PL")} PLN`;
  }

  if (request.budget_type === "indicative") {
    return "Budżet orientacyjny";
  }

  return "Nie podano";
}

export function formatCapacityRequestVolume(request: Pick<PublicCapacityRequest, "quantity" | "unit">) {
  if (request.quantity === null) {
    return "Do ustalenia";
  }

  return `${request.quantity.toLocaleString("pl-PL")} ${request.unit ?? ""}`.trim();
}

export function getCapacityRequestStatusLabel(status: string | null) {
  if (status === "draft") return "Szkic";
  if (status === "active") return "Aktywne";
  if (status === "rejected") return "Odrzucone";
  if (status === "expired") return "Wygasłe";
  if (status === "archived") return "Zarchiwizowane";
  return "W moderacji";
}

export function getCapacityRequestStatusClass(status: string | null) {
  if (status === "active") return "bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "bg-red-50 text-red-700";
  if (status === "expired" || status === "archived") return "bg-slate-100 text-slate-600";
  if (status === "draft") return "bg-slate-100 text-slate-700";
  return "bg-amber-50 text-amber-700";
}

export async function getPublicCapacityRequests(filters: CapacityRequestFilters = {}) {
  const supabase = createClient();
  const searchTerm = sanitizeSearchTerm(filters.q ?? "");
  let query = supabase
    .from("capacity_requests")
    .select(PUBLIC_CAPACITY_REQUEST_SELECT)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString());

  if (filters.branch) {
    query = query.eq("branch", filters.branch);
  }

  if (filters.serviceType) {
    query = query.eq("service_type", filters.serviceType);
  }

  if (searchTerm) {
    query = query.or(
      `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,branch.ilike.%${searchTerm}%,service_type.ilike.%${searchTerm}%`
    );
  }

  const { data, error } = await query
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Public capacity requests query failed", error);
    return [];
  }

  return (data ?? []) as PublicCapacityRequest[];
}

export async function getPublicCapacityRequestBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("capacity_requests")
    .select(PUBLIC_CAPACITY_REQUEST_SELECT)
    .eq("slug", slug)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as PublicCapacityRequest;
}

export async function getSimilarCapacityRequests(request: PublicCapacityRequest) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("capacity_requests")
    .select(PUBLIC_CAPACITY_REQUEST_SELECT)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .eq("branch", request.branch)
    .neq("id", request.id)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    return [];
  }

  return (data ?? []) as PublicCapacityRequest[];
}

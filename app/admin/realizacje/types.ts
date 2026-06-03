export type CompanyProjectStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  | "archived";

export type AdminProjectCompany = {
  id: string;
  name: string | null;
  slug: string | null;
  is_verified: boolean | null;
  location_city: string | null;
  location_voivodeship: string | null;
};

export type AdminProjectImage = {
  id: string;
  project_id: string;
  company_id: string;
  storage_path: string;
  display_order: number;
  created_at: string;
};

export type AdminProjectRecord = {
  id: string;
  company_id: string;
  created_by: string | null;
  title: string;
  slug: string;
  technology: string[];
  industry: string[];
  description: string;
  nda_confirmation: boolean;
  status: CompanyProjectStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  rejected_at: string | null;
  admin_notes: string | null;
  companies: AdminProjectCompany | null;
};

export type AdminProjectListItem = AdminProjectRecord & {
  image_count: number;
};

export const projectStatusLabels: Record<CompanyProjectStatus, string> = {
  draft: "Szkic",
  pending: "W moderacji",
  published: "Opublikowana",
  rejected: "Odrzucona",
  archived: "Zarchiwizowana",
};

export const projectStatusClasses: Record<CompanyProjectStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending: "bg-amber-50 text-amber-700",
  published: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  archived: "bg-slate-200 text-slate-700",
};

export const projectStatuses: CompanyProjectStatus[] = [
  "pending",
  "published",
  "rejected",
  "archived",
  "draft",
];

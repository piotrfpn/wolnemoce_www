"use server";

import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/database.types";
import { requireCompanyProjectsAdminAction } from "./adminAccess";

export type ProjectModerationActionResult = {
  error?: string;
  success?: string;
};

type CompanyProjectUpdate =
  Database["public"]["Tables"]["company_projects"]["Update"];

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNote(value: string) {
  const note = value.trim();
  return note ? note.slice(0, 2000) : null;
}

async function runProjectUpdate(
  projectId: string,
  payload: CompanyProjectUpdate
): Promise<ProjectModerationActionResult> {
  if (!projectId) {
    return { error: "Brakuje identyfikatora realizacji." };
  }

  let adminContext;

  try {
    adminContext = await requireCompanyProjectsAdminAction();
  } catch {
    return { error: "Nie masz uprawnień do moderowania realizacji." };
  }

  const { error } = await adminContext.adminClient
    .from("company_projects")
    .update(payload)
    .eq("id", projectId);

  if (error) {
    return { error: `Nie udało się zapisać zmian: ${error.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/realizacje");
  revalidatePath(`/admin/realizacje/${projectId}`);

  return { success: "Zapisano zmiany." };
}

export async function publishCompanyProject(
  projectId: string
): Promise<ProjectModerationActionResult> {
  let adminContext;

  try {
    adminContext = await requireCompanyProjectsAdminAction();
  } catch {
    return { error: "Nie masz uprawnień do moderowania realizacji." };
  }

  const { error } = await adminContext.adminClient
    .from("company_projects")
    .update({
      status: "published",
      moderated_by: adminContext.adminUserId,
    })
    .eq("id", projectId);

  if (error) {
    return { error: `Nie udało się opublikować realizacji: ${error.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/realizacje");
  revalidatePath(`/admin/realizacje/${projectId}`);

  return { success: "Realizacja została opublikowana." };
}

export async function rejectCompanyProject(
  formData: FormData
): Promise<ProjectModerationActionResult> {
  const projectId = getString(formData, "projectId");
  const adminNotes = normalizeNote(getString(formData, "adminNotes"));

  if (!projectId) {
    return { error: "Brakuje identyfikatora realizacji." };
  }

  let adminContext;

  try {
    adminContext = await requireCompanyProjectsAdminAction();
  } catch {
    return { error: "Nie masz uprawnień do moderowania realizacji." };
  }

  const { error } = await adminContext.adminClient
    .from("company_projects")
    .update({
      status: "rejected",
      admin_notes: adminNotes,
      moderated_by: adminContext.adminUserId,
    })
    .eq("id", projectId);

  if (error) {
    return { error: `Nie udało się odrzucić realizacji: ${error.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/realizacje");
  revalidatePath(`/admin/realizacje/${projectId}`);

  return { success: "Realizacja została odrzucona." };
}

export async function archiveCompanyProject(
  projectId: string
): Promise<ProjectModerationActionResult> {
  return runProjectUpdate(projectId, { status: "archived" });
}

export async function updateCompanyProjectAdminNote(
  formData: FormData
): Promise<ProjectModerationActionResult> {
  const projectId = getString(formData, "projectId");
  const adminNotes = normalizeNote(getString(formData, "adminNotes"));

  return runProjectUpdate(projectId, { admin_notes: adminNotes });
}

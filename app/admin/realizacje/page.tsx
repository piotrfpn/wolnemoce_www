import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { requireCompanyProjectsAdminPage } from "./adminAccess";
import AdminProjectFiltersClient from "./AdminProjectFiltersClient";
import ProjectModerationActionsClient from "./ProjectModerationActionsClient";
import {
  projectStatusClasses,
  projectStatusLabels,
  projectStatuses,
  type AdminProjectListItem,
  type AdminProjectRecord,
  type CompanyProjectStatus,
} from "./types";

type AdminProjectsPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export const metadata: Metadata = {
  title: "Przykłady realizacji | Panel administratora",
  description: "Moderacja przykładów realizacji w panelu administratora.",
};

const allowedStatuses = new Set<CompanyProjectStatus | "all">([
  "all",
  ...projectStatuses,
]);

function getSingleParam(
  searchParams: AdminProjectsPageProps["searchParams"],
  key: string
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function sanitizeSearchTerm(value: string) {
  return value
    .trim()
    .replace(/[,%(){}[\]]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

function normalizeStatus(value: string): CompanyProjectStatus | "all" {
  return allowedStatuses.has(value as CompanyProjectStatus | "all")
    ? (value as CompanyProjectStatus | "all")
    : "all";
}

function formatDate(value: string | null) {
  if (!value) {
    return "Brak daty";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTags(values: string[]) {
  return values.length > 0 ? values.join(", ") : "Brak";
}

function buildProjectSearchFilter(q: string, companyIds: string[]) {
  const filters = [`title.ilike.%${q}%`, `description.ilike.%${q}%`];

  if (companyIds.length > 0) {
    filters.push(`company_id.in.(${companyIds.join(",")})`);
  }

  return filters.join(",");
}

export default async function AdminProjectsPage({
  searchParams,
}: AdminProjectsPageProps) {
  const { adminClient } = await requireCompanyProjectsAdminPage();
  const qRaw = getSingleParam(searchParams, "q");
  const q = sanitizeSearchTerm(qRaw);
  const status = normalizeStatus(getSingleParam(searchParams, "status"));

  let companyIdsFromSearch: string[] = [];

  if (q) {
    const { data: companySearchData } = await adminClient
      .from("companies")
      .select("id")
      .or(`name.ilike.%${q}%,nip.ilike.%${q}%`)
      .limit(200);

    companyIdsFromSearch = (companySearchData ?? []).map(
      (company: { id: string }) => company.id
    );
  }

  let projectsQuery = adminClient
    .from("company_projects")
    .select(
      "id, company_id, created_by, title, slug, technology, industry, description, nda_confirmation, status, published_at, created_at, updated_at, archived_at, moderated_by, moderated_at, rejected_at, admin_notes, companies!inner(id, name, slug, is_verified, location_city, location_voivodeship)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (status !== "all") {
    projectsQuery = projectsQuery.eq("status", status);
  }

  if (q) {
    projectsQuery = projectsQuery.or(buildProjectSearchFilter(q, companyIdsFromSearch));
  }

  const { data, error, count } = await projectsQuery;
  const projectRows = (data ?? []) as unknown as AdminProjectRecord[];
  const projectIds = projectRows.map((project) => project.id);
  const { data: imageRows } =
    projectIds.length > 0
      ? await adminClient
          .from("company_project_images")
          .select("id, project_id, company_id, storage_path, display_order, created_at")
          .in("project_id", projectIds)
      : { data: [] };
  const imageCounts = new Map<string, number>();

  for (const image of imageRows ?? []) {
    imageCounts.set(image.project_id, (imageCounts.get(image.project_id) ?? 0) + 1);
  }

  const projects: AdminProjectListItem[] = projectRows.map((project) => ({
    ...project,
    image_count: imageCounts.get(project.id) ?? 0,
  }));
  const totalCount = count ?? projects.length;

  return (
    <>
      <PanelNavbar />
      <main className="min-h-screen bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[1400px] px-6 py-16">
          <div className="mb-8 flex min-w-0 flex-col gap-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between md:p-8">
            <div className="min-w-0">
              <Link
                href="/admin"
                className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#1a5f3c]"
              >
                <i className="fas fa-arrow-left"></i>
                Wróć do panelu
              </Link>
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                Panel administratora
              </p>
              <h1 className="text-3xl font-extrabold text-slate-900">
                Przykłady realizacji
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                Moderuj przykłady realizacji dodane przez firmy. Publikuj tylko
                treści, które nie naruszają NDA, nie zawierają danych klienta
                bez zgody i nie wyglądają na spam.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Wyniki
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">
                {totalCount}
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="mb-8 h-[160px] rounded-[24px] border border-slate-200 bg-white shadow-sm" />
            }
          >
            <AdminProjectFiltersClient />
          </Suspense>

          {error ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Nie udało się pobrać realizacji: {error.message}
            </div>
          ) : null}

          {projects.length === 100 ? (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Pokazujemy maksymalnie 100 wyników. Doprecyzuj filtry lub
              wyszukiwanie, aby zawęzić listę.
            </div>
          ) : null}

          {projects.length > 0 ? (
            <div className="grid min-w-0 gap-5">
              {projects.map((project) => {
                const statusValue = project.status;
                const company = project.companies;
                const location = [
                  company?.location_city,
                  company?.location_voivodeship,
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <article
                    key={project.id}
                    className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6"
                  >
                    <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              projectStatusClasses[statusValue]
                            }`}
                          >
                            {projectStatusLabels[statusValue]}
                          </span>
                          {project.nda_confirmation ? (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                              NDA potwierdzone
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                              Brak NDA
                            </span>
                          )}
                          {company?.is_verified ? (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                              Firma publiczna
                            </span>
                          ) : null}
                        </div>

                        <h2 className="break-words text-xl font-extrabold text-slate-900">
                          {project.title}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {company?.name ?? "Firma bez nazwy"}
                          {location ? ` · ${location}` : ""}
                        </p>
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                          {project.description}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                        <Link
                          href={`/admin/realizacje/${project.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white no-underline transition hover:bg-slate-800"
                        >
                          Podgląd
                          <i className="fas fa-arrow-right text-xs"></i>
                        </Link>
                        <ProjectModerationActionsClient
                          projectId={project.id}
                          status={statusValue}
                          adminNotes={project.admin_notes}
                          compact
                        />
                      </div>
                    </div>

                    <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        ["Technologia", formatTags(project.technology), "fas fa-gears"],
                        ["Branża", formatTags(project.industry), "fas fa-industry"],
                        [
                          "Utworzono",
                          formatDate(project.created_at),
                          "fas fa-calendar-plus",
                        ],
                        [
                          "Zaktualizowano",
                          formatDate(project.updated_at),
                          "fas fa-calendar-check",
                        ],
                        [
                          "Zdjęcia",
                          project.image_count === 1
                            ? "1 zdjęcie"
                            : `${project.image_count} zdjęcia`,
                          "fas fa-images",
                        ],
                      ].map(([label, value, icon]) => (
                        <div
                          key={label}
                          className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                        >
                          <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                            <i className={`${icon} text-[#1a5f3c]`}></i>
                            {label}
                          </p>
                          <p className="break-words text-sm font-bold text-slate-900">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              Brak realizacji dla wybranych kryteriów.
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

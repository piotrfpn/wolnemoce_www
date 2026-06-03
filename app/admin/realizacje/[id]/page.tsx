import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { getCompanyProjectImagePublicUrl } from "@/lib/companyProjectImageUploads";
import { requireCompanyProjectsAdminPage } from "../adminAccess";
import ProjectModerationActionsClient from "../ProjectModerationActionsClient";
import {
  projectStatusClasses,
  projectStatusLabels,
  type AdminProjectImage,
  type AdminProjectRecord,
} from "../types";

type AdminProjectDetailsPageProps = {
  params: {
    id: string;
  };
};

export const metadata: Metadata = {
  title: "Moderacja realizacji | Panel administratora",
  description: "Szczegóły i moderacja przykładu realizacji.",
};

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

export default async function AdminProjectDetailsPage({
  params,
}: AdminProjectDetailsPageProps) {
  const { adminClient } = await requireCompanyProjectsAdminPage();
  const { data, error } = await adminClient
    .from("company_projects")
    .select(
      "id, company_id, created_by, title, slug, technology, industry, description, nda_confirmation, status, published_at, created_at, updated_at, archived_at, moderated_by, moderated_at, rejected_at, admin_notes, companies!inner(id, name, slug, is_verified, location_city, location_voivodeship)"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const project = data as unknown as AdminProjectRecord;
  const { data: imageData } = await adminClient
    .from("company_project_images")
    .select("id, project_id, company_id, storage_path, display_order, created_at")
    .eq("project_id", project.id)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  const images = (imageData ?? []) as AdminProjectImage[];
  const company = project.companies;
  const location = [company?.location_city, company?.location_voivodeship]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <PanelNavbar />
      <main className="min-h-screen bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[1400px] px-6 py-16">
          <div className="mb-8 flex min-w-0 flex-col gap-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between md:p-8">
            <div className="min-w-0">
              <Link
                href="/admin/realizacje"
                className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline"
              >
                <i className="fas fa-arrow-left text-xs"></i>
                Wróć do listy realizacji
              </Link>
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                Panel administratora
              </p>
              <h1 className="break-words text-3xl font-extrabold text-slate-900">
                {project.title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {company?.name ?? "Firma bez nazwy"}
                {location ? ` · ${location}` : ""}
              </p>
            </div>
            <span
              className={`inline-flex shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
                projectStatusClasses[project.status]
              }`}
            >
              {projectStatusLabels[project.status]}
            </span>
          </div>

          <div className="grid min-w-0 gap-8 lg:grid-cols-[1fr_420px]">
            <div className="min-w-0 space-y-8">
              <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 shadow-sm md:p-6">
                <p className="text-sm leading-6 text-amber-900">
                  Sprawdź, czy opis i zdjęcia nie zawierają danych klienta, logo
                  klienta, numerów części, dokumentacji technicznej ani
                  materiałów objętych NDA.
                </p>
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-5 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      projectStatusClasses[project.status]
                    }`}
                  >
                    {projectStatusLabels[project.status]}
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

                <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                  {[
                    ["Firma", company?.name ?? "Brak nazwy"],
                    ["Lokalizacja", location || "Brak"],
                    ["Technologia", formatTags(project.technology)],
                    ["Branża", formatTags(project.industry)],
                    ["Utworzono", formatDate(project.created_at)],
                    ["Zaktualizowano", formatDate(project.updated_at)],
                    ["Opublikowano", formatDate(project.published_at)],
                    ["Moderowano", formatDate(project.moderated_at)],
                    ["Odrzucono", formatDate(project.rejected_at)],
                    ["Zarchiwizowano", formatDate(project.archived_at)],
                    ["Moderował", project.moderated_by ?? "Brak"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        {label}
                      </p>
                      <p className="mt-1 break-words text-sm font-bold text-slate-900">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <h2 className="mb-4 text-2xl font-extrabold text-slate-900">
                  Opis realizacji
                </h2>
                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                  {project.description}
                </p>
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Zdjęcia realizacji
                  </h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {images.length === 1 ? "1 zdjęcie" : `${images.length} zdjęcia`}
                  </span>
                </div>

                {images.length > 0 ? (
                  <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                    {images.map((image) => {
                      const imageUrl = getCompanyProjectImagePublicUrl(
                        image.storage_path
                      );

                      if (!imageUrl) {
                        return null;
                      }

                      return (
                        <div
                          key={image.id}
                          className="min-w-0 overflow-hidden rounded-2xl bg-slate-100"
                        >
                          <div className="aspect-video">
                            <img
                              src={imageUrl}
                              alt={project.title}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="border-t border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-500">
                            Kolejność: {image.display_order}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    Brak zdjęć dodanych do realizacji.
                  </p>
                )}
              </section>
            </div>

            <aside className="min-w-0">
              <div className="sticky top-24 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  Moderacja
                </p>
                <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
                  Decyzja admina
                </h2>
                <ProjectModerationActionsClient
                  projectId={project.id}
                  status={project.status}
                  adminNotes={project.admin_notes}
                />
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { createClient } from "@/lib/supabase/server";
import ProjectActionsClient from "./ProjectActionsClient";

export const metadata: Metadata = {
  title: "Przykłady realizacji",
  description: "Zarządzaj przykładami realizacji swojej firmy w panelu WolneMoce.",
};

export const dynamic = "force-dynamic";

type ProjectStatus = "draft" | "pending" | "published" | "rejected" | "archived";

const statusLabels: Record<ProjectStatus, string> = {
  draft: "Szkic",
  pending: "W moderacji",
  published: "Opublikowana",
  rejected: "Odrzucona",
  archived: "Zarchiwizowana",
};

const statusDescriptions: Record<ProjectStatus, string> = {
  draft: "Realizacja robocza. Nie została wysłana do moderacji.",
  pending: "Realizacja czeka na akceptację administratora.",
  published: "Realizacja jest widoczna publicznie po stronie profilu firmy.",
  rejected:
    "Realizacja została odrzucona. Możesz poprawić opis lub zdjęcia i ponownie wysłać ją do moderacji.",
  archived: "Realizacja jest zarchiwizowana i nie jest widoczna publicznie.",
};

const statusIcons: Record<ProjectStatus, string> = {
  draft: "fas fa-pen-ruler",
  pending: "fas fa-clock",
  published: "fas fa-circle-check",
  rejected: "fas fa-triangle-exclamation",
  archived: "fas fa-box-archive",
};

const statusClasses: Record<ProjectStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending: "bg-amber-50 text-amber-700",
  published: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  archived: "bg-slate-100 text-slate-700",
};

function normalizeProjectStatus(value: string | null): ProjectStatus {
  if (
    value === "draft" ||
    value === "pending" ||
    value === "published" ||
    value === "rejected" ||
    value === "archived"
  ) {
    return value;
  }

  return "draft";
}

function formatDate(value: string | null) {
  if (!value) {
    return "Brak daty";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export default async function PanelProjectsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logowanie");
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: projects } = company
    ? await supabase
        .from("company_projects")
        .select(
          "id, company_id, created_by, title, slug, technology, industry, description, nda_confirmation, status, published_at, created_at, updated_at, archived_at"
        )
        .eq("company_id", company.id)
        .order("updated_at", { ascending: false })
    : { data: [] };

  return (
    <>
      <PanelNavbar />
      <main className="bg-slate-50 pt-[128px]">
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          {searchParams?.draft_saved === "1" ? (
            <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Realizacja została zapisana jako szkic.
            </div>
          ) : null}
          {searchParams?.pending_saved === "1" ? (
            <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Realizacja została wysłana do moderacji.
            </div>
          ) : null}
          {searchParams?.saved === "1" ? (
            <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Zmiany zostały zapisane.
            </div>
          ) : null}

          <div className="mb-8 flex min-w-0 flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                Panel firmy
              </p>
              <h1 className="text-3xl font-extrabold text-slate-900">
                Przykłady realizacji
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                Pokaż potencjalnym kontrahentom krótkie przykłady wykonanych
                prac. Każda realizacja przed publikacją przechodzi moderację.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/panel" className="btn btn-outline">
                Powrót do panelu
              </Link>
              {company ? (
                <Link href="/panel/realizacje/nowa" className="btn btn-primary">
                  Dodaj realizację
                </Link>
              ) : null}
            </div>
          </div>

          {!company ? (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-6 shadow-sm md:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#1a5f3c]">
                <i className="fas fa-building"></i>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Najpierw uzupełnij profil firmy.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Przykłady realizacji są powiązane z firmą, dlatego przed
                dodaniem pierwszej realizacji uzupełnij profil firmy.
              </p>
              <Link href="/panel/profil" className="mt-6 btn btn-primary">
                Uzupełnij profil firmy
              </Link>
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid min-w-0 gap-5">
              {projects.map((project) => {
                const status = normalizeProjectStatus(project.status);

                return (
                  <article
                    key={project.id}
                    className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${statusClasses[status]}`}
                          >
                            <i className={statusIcons[status]}></i>
                            {statusLabels[status]}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            Utworzono: {formatDate(project.created_at)}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            Aktualizacja: {formatDate(project.updated_at)}
                          </span>
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900">
                          {project.title}
                        </h2>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {project.technology.map((tag: string) => (
                            <span
                              key={`tech-${project.id}-${tag}`}
                              className="rounded-full bg-[#1a5f3c]/10 px-3 py-1 text-xs font-bold text-[#1a5f3c]"
                            >
                              {tag}
                            </span>
                          ))}
                          {project.industry.map((tag: string) => (
                            <span
                              key={`industry-${project.id}-${tag}`}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
                          {project.description}
                        </p>
                        <p className="mt-3 max-w-2xl rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                          {statusDescriptions[status]}
                        </p>
                        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          <i className="fas fa-circle-info text-[#1a5f3c]"></i>
                          Deklaracja wykonawcy
                        </p>
                      </div>

                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row lg:flex-col">
                        <Link
                          href={`/panel/realizacje/${project.id}/edytuj`}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-4 py-2.5 text-sm font-bold text-white no-underline transition hover:bg-[#164f32] sm:w-auto"
                        >
                          <i className="fas fa-pen"></i>
                          Edytuj
                        </Link>
                        <ProjectActionsClient
                          projectId={project.id}
                          status={project.status}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 text-center shadow-sm md:p-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                <i className="fas fa-briefcase text-xl"></i>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Brak przykładów realizacji
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Dodaj pierwszy przykład wykonanej pracy i wyślij go do
                moderacji, aby wzmocnić wiarygodność profilu firmy.
              </p>
              <Link
                href="/panel/realizacje/nowa"
                className="mt-6 btn btn-primary"
              >
                Dodaj realizację
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

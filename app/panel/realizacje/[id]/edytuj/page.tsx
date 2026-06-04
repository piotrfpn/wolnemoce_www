import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { createClient } from "@/lib/supabase/server";
import ProjectFormClient from "../../ProjectFormClient";

export const metadata: Metadata = {
  title: "Edytuj przykład realizacji",
  description: "Edytuj przykład realizacji firmy w panelu WolneMoce.",
};

export const dynamic = "force-dynamic";

export default async function EditPanelProjectPage({
  params,
}: {
  params: { id: string };
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

  if (!company) {
    redirect("/panel/profil");
  }

  const { data: project } = await supabase
    .from("company_projects")
    .select(
      "id, company_id, created_by, title, slug, technology, industry, description, nda_confirmation, status, published_at, created_at, updated_at, archived_at"
    )
    .eq("id", params.id)
    .eq("company_id", company.id)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const { data: projectImages } = await supabase
    .from("company_project_images")
    .select("id, project_id, company_id, storage_path, display_order, created_at")
    .eq("project_id", project.id)
    .eq("company_id", company.id)
    .order("display_order", { ascending: true });

  return (
    <>
      <PanelNavbar />
      <main className="bg-slate-50 pt-[128px]">
        <section className="mx-auto max-w-[960px] px-6 py-16">
          <div className="mb-8">
            <Link
              href="/panel/realizacje"
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline"
            >
              <i className="fas fa-arrow-left"></i>
              Wróć do realizacji
            </Link>
          </div>
          <ProjectFormClient
            mode="edit"
            company={company}
            project={project}
            projectImages={projectImages ?? []}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}

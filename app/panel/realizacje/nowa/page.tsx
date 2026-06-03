import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { createClient } from "@/lib/supabase/server";
import ProjectFormClient from "../ProjectFormClient";

export const metadata: Metadata = {
  title: "Dodaj przykład realizacji",
  description: "Dodaj przykład realizacji firmy w panelu WolneMoce.pl.",
};

export const dynamic = "force-dynamic";

export default async function NewPanelProjectPage() {
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
          <ProjectFormClient mode="new" company={company} />
        </section>
      </main>
      <Footer />
    </>
  );
}

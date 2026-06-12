import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { createClient } from "@/lib/supabase/server";
import CapacityRequestFormClient from "../CapacityRequestFormClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dodaj zapytanie produkcyjne | Panel firmy",
  description: "Dodaj zlecenie produkcyjne i przekaż je do moderacji.",
};

export default async function NewCapacityRequestPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/logowanie?next=${encodeURIComponent("/panel/moje-zapytania/nowe")}&return_to=${encodeURIComponent("/panel/moje-zapytania/nowe")}`
    );
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!company) {
    redirect(`/panel/profil?return_to=${encodeURIComponent("/panel/moje-zapytania/nowe")}`);
  }

  return (
    <>
      <PanelNavbar />
      <main className="bg-slate-50 pt-[128px]">
        <section className="mx-auto max-w-[960px] px-6 py-16">
          <div className="mb-8">
            <Link
              href="/panel/moje-zapytania"
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline"
            >
              <i className="fas fa-arrow-left"></i>
              Wróć do moich zapytań
            </Link>
          </div>
          <CapacityRequestFormClient />
        </section>
      </main>
      <Footer />
    </>
  );
}

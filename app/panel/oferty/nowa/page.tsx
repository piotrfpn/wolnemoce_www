import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import NewOfferFormClient from "./NewOfferFormClient";

export const metadata: Metadata = {
  title: "Dodaj ofertę",
  description: "Dodaj ofertę firmy w panelu WolneMoce.pl.",
};

export default async function NewPanelOfferPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logowanie");
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, industry, industries, service_types")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!company) {
    redirect("/panel/profil");
  }

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[960px] px-6 py-16">
          <div className="mb-8">
            <Link
              href="/panel/oferty"
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline"
            >
              <i className="fas fa-arrow-left"></i>
              Wróć do ofert
            </Link>
          </div>
          <NewOfferFormClient company={company} />
        </section>
      </main>
      <Footer />
    </>
  );
}

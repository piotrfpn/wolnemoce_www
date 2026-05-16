import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import EditOfferFormClient from "./EditOfferFormClient";

export const metadata: Metadata = {
  title: "Edytuj ofertę",
  description: "Edytuj ofertę firmy w panelu WolneMoce.pl.",
};

export default async function EditPanelOfferPage({
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
    .select("id, name, industry, industries, service_types")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!company) {
    redirect("/panel/profil");
  }

  const { data: offer } = await supabase
    .from("offers")
    .select(
      "id, title, branch, service_type, description, power_available, min_order, lead_time, status"
    )
    .eq("id", params.id)
    .eq("company_id", company.id)
    .maybeSingle();

  if (!offer) {
    notFound();
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
          <EditOfferFormClient company={company} offer={offer} />
        </section>
      </main>
      <Footer />
    </>
  );
}

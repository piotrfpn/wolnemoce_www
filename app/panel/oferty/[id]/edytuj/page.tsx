import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createClient } from "@/lib/supabase/server";
import EditOfferFormClient from "./EditOfferFormClient";

const dictionary = getDictionary("pl");

export const metadata: Metadata = {
  title: dictionary.panel.offerForm.metadata.editTitle,
  description: dictionary.panel.offerForm.metadata.editDescription,
};

export default async function EditPanelOfferPage({
  params,
}: {
  params: { id: string };
}) {
  const dictionary = getDictionary("pl");
  const t = dictionary.panel.offerForm;
  const tc = dictionary.panel.common;
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

  const { data: offerImages } = await supabase
    .from("offer_images")
    .select("id, path, alt, sort_order")
    .eq("offer_id", offer.id)
    .order("sort_order", { ascending: true });

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
              {t.backToOffers}
            </Link>
          </div>
          <EditOfferFormClient
            company={company}
            offer={offer}
            offerImages={offerImages ?? []}
            dict={t}
            dictCommon={tc}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}

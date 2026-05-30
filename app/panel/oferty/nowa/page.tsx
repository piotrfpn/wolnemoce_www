import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createClient } from "@/lib/supabase/server";
import NewOfferFormClient from "./NewOfferFormClient";
import { getPanelLocale } from "@/lib/i18n/panelLocale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = getPanelLocale();
  const dictionary = getDictionary(locale);

  return {
    title: dictionary.panel.offerForm.metadata.newTitle,
    description: dictionary.panel.offerForm.metadata.newDescription,
  };
}

export default async function NewPanelOfferPage() {
  const locale = getPanelLocale();
  const dictionary = getDictionary(locale);
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

  return (
    <>
      <PanelNavbar />
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
          <NewOfferFormClient company={company} dict={t} dictCommon={tc} />
        </section>
      </main>
      <Footer />
    </>
  );
}

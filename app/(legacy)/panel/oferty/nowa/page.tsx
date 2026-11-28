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

export const dynamic = "force-dynamic";

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
    redirect(`/panel/profil?next=${encodeURIComponent("/panel/oferty/nowa")}`);
  }

  const { count: existingOffersCount } = await supabase
    .from("offers")
    .select("id", { count: "exact", head: true })
    .eq("company_id", company.id);

  const isFirstOffer = (existingOffersCount ?? 0) === 0;
  const profileDict = dictionary.panel.profile;

  return (
    <>
      <PanelNavbar />
      <main className="bg-slate-50 pt-[128px]">
        <section className="mx-auto max-w-[960px] px-6 py-16">
          <div className="mb-8">
            <Link
              href="/panel/oferty"
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline"
            >
              <i className="fas fa-arrow-left"></i>
              {t.backToOffers}
            </Link>

            {isFirstOffer ? (
              <div className="mt-2 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl bg-emerald-50/70 px-3.5 py-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1a5f3c] text-xs font-bold text-white">
                      <i className="fas fa-check text-[11px]"></i>
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[#1a5f3c]">
                        {profileDict.onboardingStep1Badge}
                      </p>
                      <p className="truncate text-xs font-semibold text-slate-600">
                        {profileDict.onboardingStep1Title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-[#1a5f3c]/30 bg-emerald-50 px-3.5 py-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1a5f3c] text-xs font-extrabold text-white">
                      2
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[#1a5f3c]">
                        {profileDict.onboardingStep2Badge}
                      </p>
                      <p className="truncate text-xs font-bold text-slate-900">
                        {profileDict.onboardingStep2Title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <NewOfferFormClient company={company} dict={t} dictCommon={tc} />
        </section>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { createClient } from "@/lib/supabase/server";
import CapacityRequestFormClient from "../CapacityRequestFormClient";
import { getPanelLocale } from "@/lib/i18n/panelLocale";
import {
  getCapacityRequestBudgetTypeOptions,
  getCapacityRequestIndustryOptions,
  getCapacityRequestProvinceOptions,
  getCapacityRequestUnitOptions,
} from "@/lib/i18n/capacityRequestTaxonomy";
import { getCapacityRequestServiceOptionsByIndustry } from "@/lib/i18n/capacityRequestServiceTaxonomy";

import { getDictionary } from "@/lib/i18n/getDictionary";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const locale = getPanelLocale();
  const dictionary = getDictionary(locale);
  const t = dictionary.panel.capacityRequestForm;

  return {
    title: t.metadata.title,
    description: t.metadata.description,
  };
}

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

  const locale = getPanelLocale();
  const dictionary = getDictionary(locale);
  const t = dictionary.panel.capacityRequestForm;

  const industryOptions = getCapacityRequestIndustryOptions(locale);
  const provinceOptions = getCapacityRequestProvinceOptions(locale);
  const unitOptions = getCapacityRequestUnitOptions(locale);
  const budgetTypeOptions = getCapacityRequestBudgetTypeOptions(locale);

  const serviceOptionsByIndustry = industryOptions.map(({ value }) => ({
    industry: value,
    options: getCapacityRequestServiceOptionsByIndustry(value, locale),
  }));

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
              {t.backToRequests}
            </Link>
          </div>
          <CapacityRequestFormClient
            dict={t}
            industryOptions={industryOptions}
            serviceOptionsByIndustry={serviceOptionsByIndustry}
            provinceOptions={provinceOptions}
            unitOptions={unitOptions}
            budgetTypeOptions={budgetTypeOptions}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}

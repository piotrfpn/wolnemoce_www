import Link from "next/link";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import AddOfferLinkClient from "@/components/AddOfferLinkClient";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import CompanyDirectoryClient, {
  type DirectoryCompany,
} from "@/app/firmy/CompanyDirectoryClient";

export const revalidate = 3600;

function createPublicSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, supabaseKey);
}

async function getVerifiedCompanies() {
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("companies")
    .select(
      "id, slug, name, description, industry, industries, service_types, location_voivodeship, location_city, website_url, is_verified, created_at"
    )
    .eq("is_verified", true)
    .not("slug", "is", null)
    .neq("slug", "")
    .order("name", { ascending: true })
    .limit(100);

  if (error) {
    console.error("Verified companies query failed", error);
    return [];
  }

  return (data ?? []) as DirectoryCompany[];
}

export default async function CompaniesListView({
  locale = defaultLocale,
}: {
  locale?: Locale;
}) {
  const t = getDictionary(locale).companiesList;
  const companies = await getVerifiedCompanies();

  return (
    <>
      <Navbar locale={locale} />
      <main className="bg-white">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3d26] via-[#1a5f3c] to-[#2d8a5e] px-6 pb-20 pt-36 text-white">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_20%_50%,white_2px,transparent_2px),radial-gradient(circle_at_80%_20%,white_1px,transparent_1px),radial-gradient(circle_at_40%_80%,white_1.5px,transparent_1.5px)] [background-size:60px_60px,40px_40px,80px_80px]" />

          <div className="relative z-10 mx-auto max-w-[1400px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-5 py-2 text-sm font-medium backdrop-blur">
              <i className="fas fa-building-circle-check text-[#fbbf24]"></i>
              {t.heroLabel}
            </div>
            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-[-1px] md:text-5xl lg:text-[56px]">
              {t.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/85">
              {t.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={getLocalizedPath("/oferty", locale)} className="btn btn-accent">
                {t.browseOffers}
              </Link>
              <AddOfferLinkClient locale={locale} className="btn btn-outline bg-white text-[#1a5f3c]">
                {t.addCompanyAndOffer}
              </AddOfferLinkClient>
            </div>
          </div>
        </section>

        <CompanyDirectoryClient companies={companies} locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}

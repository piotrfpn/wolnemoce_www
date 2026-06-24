import Link from "next/link";
import BlogPreview from "@/components/BlogPreview";
import Categories from "@/components/Categories";
import CtaSection from "@/components/CtaSection";
import ExpertSection from "@/components/ExpertSection";
import FeaturedOffers from "@/components/FeaturedOffers";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Navbar from "@/components/Navbar";
import PartnerServices from "@/components/PartnerServices";
import Pricing from "@/components/Pricing";
import SearchBar from "@/components/SearchBar";
import SoftLaunchSection from "@/components/SoftLaunchSection";
import StructuredData from "@/components/StructuredData";
import Testimonials from "@/components/Testimonials";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/seo";

export default function HomeView({
  locale = defaultLocale,
}: {
  locale?: Locale;
}) {
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "WolneMoce",
        url: siteUrl,
        logo: getAbsoluteUrl("/icon.svg"),
        description:
          "Marketplace B2B łączący firmy szukające podwykonawców z firmami posiadającymi wolne moce produkcyjne, magazynowe, logistyczne i techniczne.",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "WolneMoce",
        url: siteUrl,
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/oferty?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <StructuredData data={jsonLd} />
      <Navbar locale={locale} />
      <Hero locale={locale} />
      <SearchBar locale={locale} />
      <section className="bg-white px-6 pb-10">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-5 rounded-[20px] border border-slate-200 bg-slate-50 p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#1a5f3c]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#1a5f3c]">
              <i className="fas fa-clipboard-list"></i>
              Zlecenia produkcyjne
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Szukasz wykonawcy?
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Dodaj zapytanie produkcyjne i pokaż je firmom z wolnymi mocami.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href={getLocalizedPath("/zapytania", locale)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] px-5 py-3 text-sm font-bold text-[#1a5f3c] no-underline transition hover:bg-[#1a5f3c] hover:text-white"
            >
              Przeglądaj zapytania
            </Link>
            <Link
              href={getLocalizedPath("/dodaj-zapytanie", locale)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-[#164f32]"
            >
              <i className="fas fa-plus"></i>
              Dodaj zapytanie
            </Link>
          </div>
        </div>
      </section>
      <Categories locale={locale} />
      <SoftLaunchSection locale={locale} />
      <FeaturedOffers locale={locale} />
      <HowItWorks locale={locale} />
      <Pricing locale={locale} />
      <ExpertSection locale={locale} />
      <PartnerServices locale={locale} />
      <Testimonials locale={locale} />
      <BlogPreview locale={locale} />
      <CtaSection locale={locale} />
      <Footer locale={locale} />
    </>
  );
}

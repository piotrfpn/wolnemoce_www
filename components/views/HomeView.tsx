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
import StructuredData from "@/components/StructuredData";
import Testimonials from "@/components/Testimonials";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
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
      <Categories locale={locale} />
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

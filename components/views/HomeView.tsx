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
import Testimonials from "@/components/Testimonials";
import { defaultLocale, type Locale } from "@/lib/i18n/config";

export default function HomeView({
  locale = defaultLocale,
}: {
  locale?: Locale;
}) {
  return (
    <>
      <Navbar />
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


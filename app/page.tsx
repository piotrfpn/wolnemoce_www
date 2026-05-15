// app/page.tsx

import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import Categories from "@/components/Categories";
import FeaturedOffers from "@/components/FeaturedOffers";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import ExpertSection from "@/components/ExpertSection";
import Testimonials from "@/components/Testimonials";
import BlogPreview from "@/components/BlogPreview";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Portal wolnych mocy produkcyjnych",
  description:
    "WolneMoce.pl łączy firmy szukające podwykonawców z firmami posiadającymi wolne moce produkcyjne, magazynowe, logistyczne i techniczne.",
};

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <SearchBar />
      <Categories />
      <FeaturedOffers />
      <HowItWorks />
      <Pricing />
      <ExpertSection />
      <Testimonials />
      <BlogPreview />
      <CtaSection />
      <Footer />
    </>
  );
}

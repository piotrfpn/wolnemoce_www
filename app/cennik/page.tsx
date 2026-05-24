import type { Metadata } from "next";
import PricingView from "@/components/views/PricingView";
import { getDictionary } from "@/lib/i18n/getDictionary";

const dictionary = getDictionary("pl");

export const metadata: Metadata = {
  title: dictionary.seo.pricing.title,
  description: dictionary.seo.pricing.description,
};

export default function PricingPage() {
  return <PricingView locale="pl" />;
}

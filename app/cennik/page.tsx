import type { Metadata } from "next";
import PricingView from "@/components/views/PricingView";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

const dictionary = getDictionary("pl");

export const metadata: Metadata = createPageMetadata({
  title: dictionary.seo.pricing.title,
  description: dictionary.seo.pricing.description,
  path: "/cennik",
});

export default function PricingPage() {
  return <PricingView locale="pl" />;
}

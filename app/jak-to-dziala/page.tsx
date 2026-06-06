import type { Metadata } from "next";
import HowItWorksView from "@/components/views/HowItWorksView";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

const dictionary = getDictionary("pl");

export const metadata: Metadata = createPageMetadata({
  title: dictionary.seo.howItWorks.title,
  description: dictionary.seo.howItWorks.description,
  path: "/jak-to-dziala",
});

export default function HowItWorksPage() {
  return <HowItWorksView locale="pl" />;
}

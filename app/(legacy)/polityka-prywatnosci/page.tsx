import type { Metadata } from "next";
import PrivacyDocumentView from "@/components/views/PrivacyDocumentView";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

const dictionary = getDictionary("pl");

export const metadata: Metadata = createPageMetadata({
  title: dictionary.legal.privacy.title,
  description: dictionary.legal.privacy.description,
  path: "/polityka-prywatnosci",
});

export default function PrivacyPage() {
  return <PrivacyDocumentView locale="pl" />;
}

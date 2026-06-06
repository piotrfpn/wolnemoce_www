import type { Metadata } from "next";
import TermsDocumentView from "@/components/views/TermsDocumentView";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

const dictionary = getDictionary("pl");

export const metadata: Metadata = createPageMetadata({
  title: dictionary.legal.terms.title,
  description: dictionary.legal.terms.description,
  path: "/regulamin",
});

export default function TermsPage() {
  return <TermsDocumentView locale="pl" />;
}

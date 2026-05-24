import type { Metadata } from "next";
import TermsDocumentView from "@/components/views/TermsDocumentView";
import { getDictionary } from "@/lib/i18n/getDictionary";

const dictionary = getDictionary("pl");

export const metadata: Metadata = {
  title: dictionary.legal.terms.title,
  description: dictionary.legal.terms.description,
};

export default function TermsPage() {
  return <TermsDocumentView locale="pl" />;
}

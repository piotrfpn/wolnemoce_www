import type { Metadata } from "next";
import PrivacyDocumentView from "@/components/views/PrivacyDocumentView";
import { getDictionary } from "@/lib/i18n/getDictionary";

const dictionary = getDictionary("pl");

export const metadata: Metadata = {
  title: dictionary.legal.privacy.title,
  description: dictionary.legal.privacy.description,
};

export default function PrivacyPage() {
  return <PrivacyDocumentView locale="pl" />;
}

import type { Metadata } from "next";
import CookiesDocumentView from "@/components/views/CookiesDocumentView";
import { getDictionary } from "@/lib/i18n/getDictionary";

const dictionary = getDictionary("pl");

export const metadata: Metadata = {
  title: dictionary.legal.cookies.title,
  description: dictionary.legal.cookies.description,
};

export default function CookiesPage() {
  return <CookiesDocumentView locale="pl" />;
}

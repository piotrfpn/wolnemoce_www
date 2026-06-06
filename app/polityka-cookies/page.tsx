import type { Metadata } from "next";
import CookiesDocumentView from "@/components/views/CookiesDocumentView";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

const dictionary = getDictionary("pl");

export const metadata: Metadata = createPageMetadata({
  title: dictionary.legal.cookies.title,
  description: dictionary.legal.cookies.description,
  path: "/polityka-cookies",
});

export default function CookiesPage() {
  return <CookiesDocumentView locale="pl" />;
}

import type { Metadata } from "next";
import ContactView from "@/components/views/ContactView";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

const dictionary = getDictionary("pl");

export const metadata: Metadata = createPageMetadata({
  title: dictionary.seo.contact.title,
  description: dictionary.seo.contact.description,
  path: "/kontakt",
});

type ContactPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function ContactPage({ searchParams }: ContactPageProps) {
  return <ContactView searchParams={searchParams} locale="pl" />;
}

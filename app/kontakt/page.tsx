import type { Metadata } from "next";
import ContactView from "@/components/views/ContactView";
import { getDictionary } from "@/lib/i18n/getDictionary";

const dictionary = getDictionary("pl");

export const metadata: Metadata = {
  title: dictionary.seo.contact.title,
  description: dictionary.seo.contact.description,
};

type ContactPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function ContactPage({ searchParams }: ContactPageProps) {
  return <ContactView searchParams={searchParams} locale="pl" />;
}

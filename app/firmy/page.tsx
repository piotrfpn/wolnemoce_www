import type { Metadata } from "next";
import CompaniesListView from "@/components/views/CompaniesListView";
import { getDictionary } from "@/lib/i18n/getDictionary";

const dictionary = getDictionary("pl");

export const metadata: Metadata = {
  title: dictionary.seo.companies.title,
  description: dictionary.seo.companies.description,
};

export const revalidate = 3600;

export default function CompaniesPage() {
  return <CompaniesListView locale="pl" />;
}

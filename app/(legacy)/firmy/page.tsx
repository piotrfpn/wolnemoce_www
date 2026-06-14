import type { Metadata } from "next";
import CompaniesListView from "@/components/views/CompaniesListView";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

const dictionary = getDictionary("pl");

export const metadata: Metadata = createPageMetadata({
  title: dictionary.seo.companies.title,
  description: dictionary.seo.companies.description,
  path: "/firmy",
});

export const revalidate = 3600;

type CompaniesPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function CompaniesPage({ searchParams }: CompaniesPageProps) {
  return <CompaniesListView locale="pl" searchParams={searchParams} />;
}

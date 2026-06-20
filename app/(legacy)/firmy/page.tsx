import type { Metadata } from "next";
import CompaniesListView from "@/components/views/CompaniesListView";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

const dictionary = getDictionary("pl");
const socialTitle = dictionary.seo.companies.title;
const title = socialTitle.replace(/\s*\|\s*WolneMoce$/, "");
const pageMetadata = createPageMetadata({
  title,
  description: dictionary.seo.companies.description,
  path: "/firmy",
});

export const metadata: Metadata = {
  ...pageMetadata,
  openGraph: {
    ...pageMetadata.openGraph,
    title: socialTitle,
  },
  twitter: {
    ...pageMetadata.twitter,
    title: socialTitle,
  },
};

export const revalidate = 3600;

type CompaniesPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function CompaniesPage({ searchParams }: CompaniesPageProps) {
  return <CompaniesListView locale="pl" searchParams={searchParams} />;
}

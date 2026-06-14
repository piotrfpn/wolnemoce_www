import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CompaniesListView from "@/components/views/CompaniesListView";
import { isSupportedLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

type LocaleCompaniesPageProps = {
  params: {
    locale: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export const revalidate = 3600;

export function generateMetadata({ params }: LocaleCompaniesPageProps): Metadata {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  const dictionary = getDictionary(params.locale);

  return createPageMetadata({
    title: dictionary.seo.companies.title,
    description: dictionary.seo.companies.description,
    path: "/firmy",
    locale: params.locale,
  });
}

export default function LocalizedCompaniesPage({
  params,
  searchParams,
}: LocaleCompaniesPageProps) {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  return <CompaniesListView locale={params.locale} searchParams={searchParams} />;
}

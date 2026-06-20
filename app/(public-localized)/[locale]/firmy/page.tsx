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
  const socialTitle = dictionary.seo.companies.title;
  const title = socialTitle.replace(/\s*\|\s*WolneMoce$/, "");
  const pageMetadata = createPageMetadata({
    title,
    description: dictionary.seo.companies.description,
    path: "/firmy",
    locale: params.locale,
  });

  return {
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

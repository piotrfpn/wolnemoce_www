import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CompaniesListView from "@/components/views/CompaniesListView";
import {
  getLocalizedPath,
  isSupportedLocale,
  prefixedLocales,
  supportedLocales,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type LocaleCompaniesPageProps = {
  params: {
    locale: string;
  };
};

export const revalidate = 3600;

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: LocaleCompaniesPageProps): Metadata {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  const dictionary = getDictionary(params.locale);

  return {
    title: dictionary.seo.companies.title,
    description: dictionary.seo.companies.description,
    alternates: {
      languages: Object.fromEntries(
        supportedLocales.map((locale) => [
          locale,
          getLocalizedPath("/firmy", locale),
        ])
      ),
    },
  };
}

export default function LocalizedCompaniesPage({
  params,
}: LocaleCompaniesPageProps) {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  return <CompaniesListView locale={params.locale} />;
}

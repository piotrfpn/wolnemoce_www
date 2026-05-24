import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OffersPage, {
  dynamic,
} from "@/app/oferty/page";
import {
  getLocalizedPath,
  isSupportedLocale,
  prefixedLocales,
  supportedLocales,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type LocaleOffersPageProps = {
  params: {
    locale: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export { dynamic };

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: LocaleOffersPageProps): Metadata {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  const dictionary = getDictionary(params.locale);

  return {
    title: dictionary.seo.offers.title,
    description: dictionary.seo.offers.description,
    alternates: {
      languages: Object.fromEntries(
        supportedLocales.map((locale) => [
          locale,
          getLocalizedPath("/oferty", locale),
        ])
      ),
    },
  };
}

export default function LocalizedOffersPage({
  params,
  searchParams,
}: LocaleOffersPageProps) {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  return <OffersPage searchParams={searchParams} />;
}


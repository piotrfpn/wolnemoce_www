import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomeView from "@/components/views/HomeView";
import {
  isSupportedLocale,
  prefixedLocales,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

type LocalePageProps = {
  params: {
    locale: string;
  };
};

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: LocalePageProps): Metadata {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  const locale = params.locale;
  const dictionary = getDictionary(locale);

  return createPageMetadata({
    title: dictionary.seo.home.title,
    description: dictionary.seo.home.description,
    path: "/",
    locale,
  });
}

export default function LocalizedHomePage({ params }: LocalePageProps) {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  return <HomeView locale={params.locale as Locale} />;
}

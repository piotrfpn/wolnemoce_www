import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CookiesDocumentView from "@/components/views/CookiesDocumentView";
import { isSupportedLocale, prefixedLocales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type LocaleLegalPageProps = {
  params: {
    locale: string;
  };
};

function getLocale(locale: string) {
  if (!isSupportedLocale(locale) || locale === "pl") {
    notFound();
  }

  return locale;
}

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: LocaleLegalPageProps): Metadata {
  const locale = getLocale(params.locale);
  const dictionary = getDictionary(locale);

  return {
    title: dictionary.legal.cookies.title,
    description: dictionary.legal.cookies.description,
  };
}

export default function LocaleCookiesPage({ params }: LocaleLegalPageProps) {
  const locale = getLocale(params.locale);

  return <CookiesDocumentView locale={locale} />;
}

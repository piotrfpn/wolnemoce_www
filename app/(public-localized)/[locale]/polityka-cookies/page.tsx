import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CookiesDocumentView from "@/components/views/CookiesDocumentView";
import { isSupportedLocale, prefixedLocales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

type LocaleLegalPageProps = {
  params: {
    locale: string;
  };
};

function getLocale(locale: string) {
  if (!isSupportedLocale(locale)) {
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

  return createPageMetadata({
    title: dictionary.legal.cookies.title,
    description: dictionary.legal.cookies.description,
    path: "/polityka-cookies",
    locale,
  });
}

export default function LocaleCookiesPage({ params }: LocaleLegalPageProps) {
  const locale = getLocale(params.locale);

  return <CookiesDocumentView locale={locale} />;
}

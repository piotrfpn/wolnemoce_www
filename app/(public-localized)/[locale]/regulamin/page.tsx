import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TermsDocumentView from "@/components/views/TermsDocumentView";
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
    title: dictionary.legal.terms.title,
    description: dictionary.legal.terms.description,
    path: "/regulamin",
    locale,
  });
}

export default function LocaleTermsPage({ params }: LocaleLegalPageProps) {
  const locale = getLocale(params.locale);

  return <TermsDocumentView locale={locale} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PrivacyDocumentView from "@/components/views/PrivacyDocumentView";
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
    title: dictionary.legal.privacy.title,
    description: dictionary.legal.privacy.description,
  };
}

export default function LocalePrivacyPage({ params }: LocaleLegalPageProps) {
  const locale = getLocale(params.locale);

  return <PrivacyDocumentView locale={locale} />;
}

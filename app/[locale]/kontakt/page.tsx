import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContactView from "@/components/views/ContactView";
import {
  isSupportedLocale,
  prefixedLocales,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

type LocaleContactPageProps = {
  params: {
    locale: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: LocaleContactPageProps): Metadata {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  const dictionary = getDictionary(params.locale);

  return createPageMetadata({
    title: dictionary.seo.contact.title,
    description: dictionary.seo.contact.description,
    path: "/kontakt",
    locale: params.locale,
  });
}

export default function LocalizedContactPage({
  params,
  searchParams,
}: LocaleContactPageProps) {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  return <ContactView searchParams={searchParams} locale={params.locale} />;
}

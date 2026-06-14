import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OffersListView from "@/components/views/OffersListView";
import {
  isSupportedLocale,
  prefixedLocales,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

type LocaleOffersPageProps = {
  params: {
    locale: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: LocaleOffersPageProps): Metadata {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  const dictionary = getDictionary(params.locale);

  return createPageMetadata({
    title: dictionary.seo.offers.title,
    description: dictionary.seo.offers.description,
    path: "/oferty",
    locale: params.locale,
  });
}

export default function LocalizedOffersPage({
  params,
  searchParams,
}: LocaleOffersPageProps) {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  return <OffersListView searchParams={searchParams} locale={params.locale} />;
}

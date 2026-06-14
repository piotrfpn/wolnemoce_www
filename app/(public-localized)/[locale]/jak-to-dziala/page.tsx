import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HowItWorksView from "@/components/views/HowItWorksView";
import {
  isSupportedLocale,
  prefixedLocales,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

type LocaleHowItWorksPageProps = {
  params: {
    locale: string;
  };
};

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: LocaleHowItWorksPageProps): Metadata {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  const dictionary = getDictionary(params.locale);

  return createPageMetadata({
    title: dictionary.seo.howItWorks.title,
    description: dictionary.seo.howItWorks.description,
    path: "/jak-to-dziala",
    locale: params.locale,
  });
}

export default function LocalizedHowItWorksPage({
  params,
}: LocaleHowItWorksPageProps) {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  return <HowItWorksView locale={params.locale} />;
}

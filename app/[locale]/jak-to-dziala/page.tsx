import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HowItWorksPage from "@/app/jak-to-dziala/page";
import {
  getLocalizedPath,
  isSupportedLocale,
  prefixedLocales,
  supportedLocales,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type LocaleHowItWorksPageProps = {
  params: {
    locale: string;
  };
};

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: LocaleHowItWorksPageProps): Metadata {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  const dictionary = getDictionary(params.locale);

  return {
    title: dictionary.seo.howItWorks.title,
    description: dictionary.seo.howItWorks.description,
    alternates: {
      languages: Object.fromEntries(
        supportedLocales.map((locale) => [
          locale,
          getLocalizedPath("/jak-to-dziala", locale),
        ])
      ),
    },
  };
}

export default function LocalizedHowItWorksPage({
  params,
}: LocaleHowItWorksPageProps) {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  return <HowItWorksPage />;
}


import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PricingView from "@/components/views/PricingView";
import {
  getLocalizedPath,
  isSupportedLocale,
  prefixedLocales,
  supportedLocales,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type LocalePricingPageProps = {
  params: {
    locale: string;
  };
};

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: LocalePricingPageProps): Metadata {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  const locale = params.locale;
  const dictionary = getDictionary(locale);

  return {
    title: dictionary.seo.pricing.title,
    description: dictionary.seo.pricing.description,
    alternates: {
      languages: Object.fromEntries(
        supportedLocales.map((item) => [
          item,
          getLocalizedPath("/cennik", item),
        ])
      ),
    },
  };
}

export default function LocalizedPricingPage({
  params,
}: LocalePricingPageProps) {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  return <PricingView locale={params.locale as Locale} />;
}


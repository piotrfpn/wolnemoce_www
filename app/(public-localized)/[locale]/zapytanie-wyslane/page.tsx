// app/(public-localized)/[locale]/zapytanie-wyslane/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RfqSuccessView from "@/components/views/RfqSuccessView";
import { isSupportedLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type LocalizedRfqSentPageProps = {
  params: {
    locale: string;
  };
};

export function generateMetadata({
  params,
}: LocalizedRfqSentPageProps): Metadata {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  const dictionary = getDictionary(params.locale);

  return {
    title: dictionary.rfqSuccess.metadataTitle,
    description: dictionary.rfqSuccess.metadataDescription,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function LocalizedRfqSentPage({
  params,
}: LocalizedRfqSentPageProps) {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  const dictionary = getDictionary(params.locale);

  return (
    <RfqSuccessView
      locale={params.locale}
      t={dictionary.rfqSuccess}
    />
  );
}

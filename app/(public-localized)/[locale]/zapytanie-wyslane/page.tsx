import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RfqSuccessView from "@/components/views/RfqSuccessView";
import { isSupportedLocale, type Locale } from "@/lib/i18n/config";

type LocalizedRfqSentPageProps = {
  params: {
    locale: string;
  };
};

export const metadata: Metadata = {
  title: "Zapytanie wysłane",
  description: "Ekran sukcesu formularza zapytania ofertowego WolneMoce.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LocalizedRfqSentPage({ params }: LocalizedRfqSentPageProps) {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  return <RfqSuccessView locale={params.locale as Locale} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AddCapacityRequestRedirectView from "@/components/views/AddCapacityRequestRedirectView";
import {
  getLocalizedPath,
  isSupportedLocale,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type LocaleAddCapacityRequestPageProps = {
  params: {
    locale: string;
  };
};

export const dynamic = "force-dynamic";

function getLocale(locale: string): Locale {
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return locale;
}

export function generateMetadata({
  params,
}: LocaleAddCapacityRequestPageProps): Metadata {
  const locale = getLocale(params.locale);
  const dictionary = getDictionary(locale);

  return {
    title: dictionary.panel.capacityRequestForm.metadata.title,
    description: dictionary.panel.capacityRequestForm.metadata.description,
  };
}

export default function LocaleAddCapacityRequestPage({
  params,
}: LocaleAddCapacityRequestPageProps) {
  const locale = getLocale(params.locale);

  return (
    <AddCapacityRequestRedirectView
      loginPath={getLocalizedPath("/logowanie", locale)}
    />
  );
}

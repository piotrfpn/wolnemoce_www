import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RegisterView from "@/components/views/RegisterView";
import { isSupportedLocale, prefixedLocales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type LocaleRegisterPageProps = {
  params: {
    locale: string;
  };
  searchParams?: {
    next?: string;
    return_to?: string;
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

export function generateMetadata({ params }: LocaleRegisterPageProps): Metadata {
  const locale = getLocale(params.locale);
  const dictionary = getDictionary(locale);

  return {
    title: dictionary.auth.register.title,
    description: dictionary.auth.register.subtitle,
  };
}

export default function LocaleRegisterPage({
  params,
  searchParams,
}: LocaleRegisterPageProps) {
  const locale = getLocale(params.locale);
  const redirectParamName =
    searchParams?.next !== undefined ? "next" : "return_to";

  return (
    <RegisterView
      locale={locale}
      nextPath={searchParams?.next ?? searchParams?.return_to}
      redirectParamName={redirectParamName}
    />
  );
}

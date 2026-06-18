import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UpdatePasswordView from "@/components/views/UpdatePasswordView";
import { isSupportedLocale, prefixedLocales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type LocaleUpdatePasswordPageProps = {
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

export function generateMetadata({
  params,
}: LocaleUpdatePasswordPageProps): Metadata {
  const locale = getLocale(params.locale);
  const dictionary = getDictionary(locale);

  return {
    title: dictionary.auth.passwordRecovery.update.title,
    description: dictionary.auth.passwordRecovery.update.subtitle,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function LocaleUpdatePasswordPage({
  params,
  searchParams,
}: LocaleUpdatePasswordPageProps) {
  const locale = getLocale(params.locale);
  const redirectParamName =
    searchParams?.next !== undefined ? "next" : "return_to";

  return (
    <UpdatePasswordView
      locale={locale}
      nextPath={searchParams?.next ?? searchParams?.return_to}
      redirectParamName={redirectParamName}
    />
  );
}

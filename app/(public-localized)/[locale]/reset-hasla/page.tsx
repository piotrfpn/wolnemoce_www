import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResetPasswordView from "@/components/views/ResetPasswordView";
import { isSupportedLocale, prefixedLocales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type LocaleResetPasswordPageProps = {
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
}: LocaleResetPasswordPageProps): Metadata {
  const locale = getLocale(params.locale);
  const dictionary = getDictionary(locale);

  return {
    title: dictionary.auth.passwordRecovery.reset.title,
    description: dictionary.auth.passwordRecovery.reset.subtitle,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function LocaleResetPasswordPage({
  params,
  searchParams,
}: LocaleResetPasswordPageProps) {
  const locale = getLocale(params.locale);
  const redirectParamName =
    searchParams?.next !== undefined ? "next" : "return_to";

  return (
    <ResetPasswordView
      locale={locale}
      nextPath={searchParams?.next ?? searchParams?.return_to}
      redirectParamName={redirectParamName}
    />
  );
}

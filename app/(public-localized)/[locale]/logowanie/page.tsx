import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LoginView from "@/components/views/LoginView";
import { isSupportedLocale, prefixedLocales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type LocaleLoginPageProps = {
  params: {
    locale: string;
  };
  searchParams?: {
    error?: string;
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

export function generateMetadata({ params }: LocaleLoginPageProps): Metadata {
  const locale = getLocale(params.locale);
  const dictionary = getDictionary(locale);

  return {
    title: dictionary.auth.login.title,
    description: dictionary.auth.login.subtitle,
  };
}

export default function LocaleLoginPage({
  params,
  searchParams,
}: LocaleLoginPageProps) {
  const locale = getLocale(params.locale);
  const redirectParamName =
    searchParams?.next !== undefined ? "next" : "return_to";

  return (
    <LoginView
      locale={locale}
      nextPath={searchParams?.next ?? searchParams?.return_to}
      oauthError={searchParams?.error === "oauth"}
      redirectParamName={redirectParamName}
    />
  );
}

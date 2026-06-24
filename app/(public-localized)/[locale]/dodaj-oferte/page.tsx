import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getLocalizedPath,
  isSupportedLocale,
  prefixedLocales,
  supportedLocales,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createClient } from "@/lib/supabase/server";

type LocaleAddOfferPageProps = {
  params: {
    locale: string;
  };
};

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export function generateMetadata({
  params,
}: LocaleAddOfferPageProps): Metadata {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  const dictionary = getDictionary(params.locale);

  return {
    title: dictionary.addOfferPage.seoTitle,
    description: dictionary.addOfferPage.seoDescription,
    alternates: {
      languages: Object.fromEntries(
        supportedLocales.map((locale) => [
          locale,
          getLocalizedPath("/dodaj-oferte", locale),
        ])
      ),
    },
  };
}

export default async function LocalizedAddOfferPage({
  params,
}: LocaleAddOfferPageProps) {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/panel/oferty/nowa");
  }

  const loginHref = `${getLocalizedPath(
    "/logowanie",
    params.locale as Locale
  )}?next=${encodeURIComponent("/panel/oferty/nowa")}`;
  redirect(loginHref);
}

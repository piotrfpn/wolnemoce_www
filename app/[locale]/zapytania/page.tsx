import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CapacityRequestsListView from "@/components/views/CapacityRequestsListView";
import {
  isSupportedLocale,
  prefixedLocales,
} from "@/lib/i18n/config";
import { createPageMetadata } from "@/lib/seo";

type LocalizedCapacityRequestsPageProps = {
  params: {
    locale: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export function generateMetadata({
  params,
}: LocalizedCapacityRequestsPageProps): Metadata {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  return createPageMetadata({
    title: "Zapytania produkcyjne i zlecenia B2B",
    description:
      "Przeglądaj zapytania firm szukających wykonawców, podwykonawców i wolnych mocy produkcyjnych w Polsce.",
    path: "/zapytania",
    locale: params.locale,
  });
}

export default function LocalizedCapacityRequestsPage({
  params,
  searchParams,
}: LocalizedCapacityRequestsPageProps) {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  return (
    <CapacityRequestsListView
      locale={params.locale}
      searchParams={searchParams}
    />
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CapacityRequestsListView from "@/components/views/CapacityRequestsListView";
import { isSupportedLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

type LocalizedCapacityRequestsPageProps = {
  params: {
    locale: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: LocalizedCapacityRequestsPageProps): Metadata {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  const dictionary = getDictionary(params.locale);

  return createPageMetadata({
    title: dictionary.publicCapacityRequests.seo.title,
    description: dictionary.publicCapacityRequests.seo.description,
    path: "/zapytania",
    locale: params.locale,
  });
}

export default function LocalizedCapacityRequestsPage({
  params,
  searchParams,
}: LocalizedCapacityRequestsPageProps) {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  return (
    <CapacityRequestsListView
      locale={params.locale}
      searchParams={searchParams}
    />
  );
}

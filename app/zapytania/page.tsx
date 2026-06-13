import type { Metadata } from "next";
import CapacityRequestsListView from "@/components/views/CapacityRequestsListView";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const dictionary = getDictionary("pl");

  return createPageMetadata({
    title: dictionary.publicCapacityRequests.seo.title,
    description: dictionary.publicCapacityRequests.seo.description,
    path: "/zapytania",
    locale: "pl",
  });
}

type CapacityRequestsPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function CapacityRequestsPage({
  searchParams,
}: CapacityRequestsPageProps) {
  return (
    <CapacityRequestsListView
      locale="pl"
      searchParams={searchParams}
    />
  );
}

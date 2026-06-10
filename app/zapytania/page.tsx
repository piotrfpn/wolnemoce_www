import type { Metadata } from "next";
import CapacityRequestsListView from "@/components/views/CapacityRequestsListView";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Zapytania produkcyjne i zlecenia B2B | WolneMoce",
  description:
    "Przeglądaj zapytania firm szukających wykonawców, podwykonawców i wolnych mocy produkcyjnych w Polsce.",
  path: "/zapytania",
});

type CapacityRequestsPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function CapacityRequestsPage({
  searchParams,
}: CapacityRequestsPageProps) {
  return <CapacityRequestsListView searchParams={searchParams} />;
}

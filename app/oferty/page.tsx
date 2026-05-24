import type { Metadata } from "next";
import OffersListView from "@/components/views/OffersListView";
import { getDictionary } from "@/lib/i18n/getDictionary";

export const dynamic = "force-dynamic";

const dictionary = getDictionary("pl");

export const metadata: Metadata = {
  title: dictionary.seo.offers.title,
  description: dictionary.seo.offers.description,
};

type OffersPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function OffersPage({ searchParams }: OffersPageProps) {
  return <OffersListView searchParams={searchParams} locale="pl" />;
}

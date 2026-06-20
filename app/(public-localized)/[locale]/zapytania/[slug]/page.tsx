import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CapacityRequestDetailView, {
  generateCapacityRequestMetadata,
} from "@/components/views/CapacityRequestDetailView";
import { isSupportedLocale } from "@/lib/i18n/config";

type LocalizedCapacityRequestDetailsPageProps = {
  params: {
    locale: string;
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: LocalizedCapacityRequestDetailsPageProps): Promise<Metadata> {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  return generateCapacityRequestMetadata({
    slug: params.slug,
    locale: params.locale,
  });
}

export default function LocalizedCapacityRequestDetailsPage({
  params,
}: LocalizedCapacityRequestDetailsPageProps) {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  return (
    <CapacityRequestDetailView
      slug={params.slug}
      locale={params.locale}
    />
  );
}

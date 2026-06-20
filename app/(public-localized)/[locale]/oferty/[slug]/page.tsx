import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OfferDetailView, {
  generateOfferDetailMetadata,
} from "@/components/views/OfferDetailView";
import { isSupportedLocale } from "@/lib/i18n/config";

type LocalizedOfferDetailsPageProps = {
  params: {
    locale: string;
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: LocalizedOfferDetailsPageProps): Promise<Metadata> {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  return generateOfferDetailMetadata({
    slug: params.slug,
    locale: params.locale,
  });
}

export default function LocalizedOfferDetailsPage({
  params,
}: LocalizedOfferDetailsPageProps) {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  return <OfferDetailView slug={params.slug} locale={params.locale} />;
}

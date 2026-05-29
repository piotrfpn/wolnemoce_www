import type { Metadata } from "next";
import OfferDetailView, {
  generateOfferDetailMetadata,
} from "@/components/views/OfferDetailView";

type OfferDetailsPageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: OfferDetailsPageProps): Promise<Metadata> {
  return generateOfferDetailMetadata({ slug: params.slug, locale: "pl" });
}

export default function OfferDetailsPage({ params }: OfferDetailsPageProps) {
  return <OfferDetailView slug={params.slug} locale="pl" />;
}

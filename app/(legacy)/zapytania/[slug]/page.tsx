import type { Metadata } from "next";
import CapacityRequestDetailView, {
  generateCapacityRequestMetadata,
} from "@/components/views/CapacityRequestDetailView";

type CapacityRequestDetailsPageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: CapacityRequestDetailsPageProps): Promise<Metadata> {
  return generateCapacityRequestMetadata({
    slug: params.slug,
    locale: "pl",
  });
}

export default function CapacityRequestDetailsPage({
  params,
}: CapacityRequestDetailsPageProps) {
  return (
    <CapacityRequestDetailView
      slug={params.slug}
      locale="pl"
    />
  );
}

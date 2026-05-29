import type { Metadata } from "next";
import CompanyDetailView, {
  generateCompanyDetailMetadata,
} from "@/components/views/CompanyDetailView";

type CompanyProfilePageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: CompanyProfilePageProps): Promise<Metadata> {
  return generateCompanyDetailMetadata({ slug: params.slug, locale: "pl" });
}

export default function CompanyProfilePage({ params }: CompanyProfilePageProps) {
  return <CompanyDetailView slug={params.slug} locale="pl" />;
}

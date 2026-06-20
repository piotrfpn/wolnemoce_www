import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CompanyDetailView, {
  generateCompanyDetailMetadata,
} from "@/components/views/CompanyDetailView";
import { isSupportedLocale } from "@/lib/i18n/config";

type LocalizedCompanyProfilePageProps = {
  params: {
    locale: string;
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: LocalizedCompanyProfilePageProps): Promise<Metadata> {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  return generateCompanyDetailMetadata({
    slug: params.slug,
    locale: params.locale,
  });
}

export default function LocalizedCompanyProfilePage({
  params,
}: LocalizedCompanyProfilePageProps) {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  return <CompanyDetailView slug={params.slug} locale={params.locale} />;
}

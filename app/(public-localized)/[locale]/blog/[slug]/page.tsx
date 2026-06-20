import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogDetailView, {
  generateBlogDetailMetadata,
} from "@/components/views/BlogDetailView";
import { isSupportedLocale } from "@/lib/i18n/config";

type LocalizedBlogArticlePageProps = {
  params: {
    locale: string;
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: LocalizedBlogArticlePageProps): Promise<Metadata> {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  return generateBlogDetailMetadata({
    slug: params.slug,
    locale: params.locale,
  });
}

export default function LocalizedBlogArticlePage({
  params,
}: LocalizedBlogArticlePageProps) {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  return <BlogDetailView slug={params.slug} locale={params.locale} />;
}

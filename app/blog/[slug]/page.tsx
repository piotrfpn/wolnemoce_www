import type { Metadata } from "next";
import BlogDetailView, {
  generateBlogDetailMetadata,
} from "@/components/views/BlogDetailView";

type BlogArticlePageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  return generateBlogDetailMetadata({ slug: params.slug, locale: "pl" });
}

export default function BlogArticlePage({ params }: BlogArticlePageProps) {
  return <BlogDetailView slug={params.slug} locale="pl" />;
}

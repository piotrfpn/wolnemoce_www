import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogListView from "@/components/views/BlogListView";
import { isSupportedLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

type LocaleBlogPageProps = {
  params: {
    locale: string;
  };
};

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: LocaleBlogPageProps): Metadata {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  const dictionary = getDictionary(params.locale);

  return createPageMetadata({
    title: dictionary.seo.blog.title,
    description: dictionary.seo.blog.description,
    path: "/blog",
    locale: params.locale,
  });
}

export default function LocalizedBlogPage({ params }: LocaleBlogPageProps) {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  return <BlogListView locale={params.locale} />;
}

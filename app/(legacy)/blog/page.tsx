import type { Metadata } from "next";
import BlogListView from "@/components/views/BlogListView";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const dictionary = getDictionary("pl");

export const metadata: Metadata = createPageMetadata({
  title: dictionary.seo.blog.title,
  description: dictionary.seo.blog.description,
  path: "/blog",
});

export default function BlogPage() {
  return <BlogListView locale="pl" />;
}

import type { Metadata } from "next";
import BlogListView from "@/components/views/BlogListView";
import { getDictionary } from "@/lib/i18n/getDictionary";

export const dynamic = "force-dynamic";

const dictionary = getDictionary("pl");

export const metadata: Metadata = {
  title: dictionary.seo.blog.title,
  description: dictionary.seo.blog.description,
};

export default function BlogPage() {
  return <BlogListView locale="pl" />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPage, {
  dynamic,
} from "@/app/blog/page";
import {
  getLocalizedPath,
  isSupportedLocale,
  prefixedLocales,
  supportedLocales,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

type LocaleBlogPageProps = {
  params: {
    locale: string;
  };
};

export { dynamic };

export function generateStaticParams() {
  return prefixedLocales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: LocaleBlogPageProps): Metadata {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  const dictionary = getDictionary(params.locale);

  return {
    title: dictionary.seo.blog.title,
    description: dictionary.seo.blog.description,
    alternates: {
      languages: Object.fromEntries(
        supportedLocales.map((locale) => [
          locale,
          getLocalizedPath("/blog", locale),
        ])
      ),
    },
  };
}

export default function LocalizedBlogPage({ params }: LocaleBlogPageProps) {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  return <BlogPage />;
}


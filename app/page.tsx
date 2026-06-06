// app/page.tsx

import type { Metadata } from "next";
import HomeView from "@/components/views/HomeView";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createPageMetadata } from "@/lib/seo";

const dictionary = getDictionary("pl");

export const metadata: Metadata = createPageMetadata({
  title: dictionary.seo.home.title,
  description: dictionary.seo.home.description,
  path: "/",
});

export default function Home() {
  return <HomeView locale="pl" />;
}

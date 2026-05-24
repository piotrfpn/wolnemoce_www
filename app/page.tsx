// app/page.tsx

import type { Metadata } from "next";
import HomeView from "@/components/views/HomeView";
import { getDictionary } from "@/lib/i18n/getDictionary";

const dictionary = getDictionary("pl");

export const metadata: Metadata = {
  title: dictionary.seo.home.title,
  description: dictionary.seo.home.description,
};

export default function Home() {
  return <HomeView locale="pl" />;
}

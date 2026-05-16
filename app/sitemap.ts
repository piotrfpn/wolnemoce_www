import type { MetadataRoute } from "next";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { blogArticles } from "@/lib/mockData";

const baseUrl = "https://wolnemoce.pl";

async function getActiveOfferRoutes() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from("offers")
    .select("slug")
    .eq("status", "active")
    .not("slug", "is", null);

  if (error) {
    return [];
  }

  return (data ?? [])
    .map((offer) => offer.slug)
    .filter(Boolean)
    .map((slug) => `/oferty/${slug}`);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/oferty",
    "/blog",
    "/jak-to-dziala",
    "/cennik",
    "/kontakt",
    "/dodaj-oferte",
    "/regulamin",
    "/polityka-prywatnosci",
    "/zapytanie-ofertowe",
    "/zapytanie-wyslane",
  ];

  const offerRoutes = await getActiveOfferRoutes();
  const blogRoutes = blogArticles.map((article) => `/blog/${article.slug}`);

  return [...staticRoutes, ...offerRoutes, ...blogRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}

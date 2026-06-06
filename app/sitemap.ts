import type { MetadataRoute } from "next";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getLocalizedPath, supportedLocales } from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/seo";

const baseUrl = getSiteUrl();
const dynamicRouteLimit = 1000;

function createSitemapSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, supabaseKey);
}

async function getActiveOfferRoutes() {
  const supabase = createSitemapSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("offers")
    .select("slug, companies!inner(slug, is_verified)")
    .eq("status", "active")
    .eq("companies.is_verified", true)
    .not("slug", "is", null)
    .neq("slug", "")
    .not("companies.slug", "is", null)
    .neq("companies.slug", "")
    .limit(dynamicRouteLimit);

  if (error) {
    return [];
  }

  return (data ?? [])
    .map((offer) => offer.slug)
    .filter(Boolean)
    .map((slug) => `/oferty/${slug}`);
}

async function getPublicCompanyRoutes() {
  const supabase = createSitemapSupabaseClient();

  if (!supabase) {
    return [];
  }

  const verifiedCompaniesResult = await supabase
    .from("companies")
    .select("slug")
    .eq("is_verified", true)
    .not("slug", "is", null)
    .neq("slug", "")
    .limit(dynamicRouteLimit);

  const slugs = new Set<string>();

  (verifiedCompaniesResult.data ?? []).forEach((company) => {
    if (company.slug) {
      slugs.add(company.slug);
    }
  });

  if (verifiedCompaniesResult.error) {
    return [];
  }

  return Array.from(slugs).map((slug) => `/firmy/${slug}`);
}

async function getPublishedBlogRoutes() {
  const supabase = createSitemapSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("status", "published")
    .not("slug", "is", null)
    .neq("slug", "")
    .limit(dynamicRouteLimit);

  if (error) {
    return [];
  }

  return (data ?? [])
    .map((post) => post.slug)
    .filter(Boolean)
    .map((slug) => `/blog/${slug}`);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/oferty",
    "/firmy",
    "/blog",
    "/jak-to-dziala",
    "/cennik",
    "/kontakt",
    "/dodaj-oferte",
    "/regulamin",
    "/polityka-prywatnosci",
    "/polityka-cookies",
    "/zapytanie-ofertowe",
  ];
  const localizedStaticRoutes = supportedLocales.flatMap((locale) =>
    staticRoutes.map((route) => getLocalizedPath(route || "/", locale))
  );

  const offerRoutes = await getActiveOfferRoutes();
  const companyRoutes = await getPublicCompanyRoutes();
  const blogRoutes = await getPublishedBlogRoutes();

  return Array.from(
    new Set([
      ...localizedStaticRoutes,
      ...offerRoutes,
      ...companyRoutes,
      ...blogRoutes,
    ])
  ).map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}

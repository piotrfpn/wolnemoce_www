import type { MetadataRoute } from "next";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  getLocalizedPath,
  prefixedLocales,
  supportedLocales,
} from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/seo";

const baseUrl = getSiteUrl();
const dynamicRouteLimit = 1000;

function createAbsoluteSitemapUrl(route: string) {
  return new URL(route, baseUrl).toString();
}

function createLocalizedDetailRoutes(routes: string[]) {
  return [
    ...routes,
    ...prefixedLocales.flatMap((locale) =>
      routes.map((route) => getLocalizedPath(route, locale))
    ),
  ];
}

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

async function getActiveCapacityRequestRoutes() {
  const supabase = createSitemapSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("capacity_requests")
    .select("slug")
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .not("slug", "is", null)
    .neq("slug", "")
    .limit(dynamicRouteLimit);

  if (error) {
    return [];
  }

  return (data ?? [])
    .map((request) => request.slug)
    .filter(Boolean)
    .map((slug) => `/zapytania/${slug}`);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "/",
    "/oferty",
    "/firmy",
    "/blog",
    "/jak-to-dziala",
    "/cennik",
    "/kontakt",
    "/dodaj-oferte",
    "/dodaj-zapytanie",
    "/regulamin",
    "/polityka-prywatnosci",
    "/polityka-cookies",
    "/zapytanie-ofertowe",
    "/zapytania",
  ];
  const localizedStaticRoutes = supportedLocales.flatMap((locale) =>
    staticRoutes.map((route) => getLocalizedPath(route, locale))
  );

  const offerRoutes = await getActiveOfferRoutes();
  const companyRoutes = await getPublicCompanyRoutes();
  const blogRoutes = await getPublishedBlogRoutes();
  const capacityRequestRoutes = await getActiveCapacityRequestRoutes();
  const localizedDetailRoutes = createLocalizedDetailRoutes([
    ...offerRoutes,
    ...companyRoutes,
    ...blogRoutes,
    ...capacityRequestRoutes,
  ]);

  return Array.from(
    new Set([
      ...localizedStaticRoutes,
      ...localizedDetailRoutes,
    ])
  ).map((route) => ({
    url: createAbsoluteSitemapUrl(route),
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}

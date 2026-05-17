import type { MetadataRoute } from "next";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const baseUrl = "https://wolnemoce.pl";

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

async function getPublicCompanyRoutes() {
  const supabase = createSitemapSupabaseClient();

  if (!supabase) {
    return [];
  }

  const [activeOffersResult, verifiedCompaniesResult] = await Promise.all([
    supabase
      .from("offers")
      .select("companies!inner(slug)")
      .eq("status", "active")
      .not("companies.slug", "is", null),
    supabase
      .from("companies")
      .select("slug")
      .eq("is_verified", true)
      .not("slug", "is", null),
  ]);

  const slugs = new Set<string>();

  (
    (activeOffersResult.data ?? []) as unknown as {
      companies: { slug: string | null } | { slug: string | null }[] | null;
    }[]
  ).forEach((row) => {
    const company = Array.isArray(row.companies)
      ? row.companies[0]
      : row.companies;

    if (company?.slug) {
      slugs.add(company.slug);
    }
  });

  (verifiedCompaniesResult.data ?? []).forEach((company) => {
    if (company.slug) {
      slugs.add(company.slug);
    }
  });

  if (activeOffersResult.error || verifiedCompaniesResult.error) {
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
    .not("slug", "is", null);

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
    "/blog",
    "/jak-to-dziala",
    "/cennik",
    "/kontakt",
    "/dodaj-oferte",
    "/regulamin",
    "/polityka-prywatnosci",
    "/polityka-cookies",
    "/zapytanie-ofertowe",
    "/zapytanie-wyslane",
  ];

  const offerRoutes = await getActiveOfferRoutes();
  const companyRoutes = await getPublicCompanyRoutes();
  const blogRoutes = await getPublishedBlogRoutes();

  return [...staticRoutes, ...offerRoutes, ...companyRoutes, ...blogRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}

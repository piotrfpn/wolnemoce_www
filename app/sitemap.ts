import type { MetadataRoute } from "next";
import { blogArticles, offers } from "@/lib/mockData";

const baseUrl = "https://wolnemoce.pl";

export default function sitemap(): MetadataRoute.Sitemap {
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

  const offerRoutes = offers.map((offer) => `/oferty/${offer.slug}`);
  const blogRoutes = blogArticles.map((article) => `/blog/${article.slug}`);

  return [...staticRoutes, ...offerRoutes, ...blogRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}

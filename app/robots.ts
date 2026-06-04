import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/admin/*",
        "/panel",
        "/panel/",
        "/panel/*",
        "/auth/callback",
        "/reset-hasla",
        "/ustaw-nowe-haslo",
      ],
    },
    sitemap: "https://www.wolnemoce.com/sitemap.xml",
  };
}

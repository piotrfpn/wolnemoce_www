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
        "/*/admin",
        "/*/admin/*",
        "/panel",
        "/panel/",
        "/panel/*",
        "/*/panel",
        "/*/panel/*",
        "/auth",
        "/auth/",
        "/auth/*",
        "/auth/callback",
        "/logowanie",
        "/*/logowanie",
        "/rejestracja",
        "/*/rejestracja",
        "/reset-hasla",
        "/ustaw-nowe-haslo",
        "/*/reset-hasla",
        "/*/ustaw-nowe-haslo",
        "/zapytanie-wyslane",
        "/*/zapytanie-wyslane",
      ],
    },
    sitemap: "https://www.wolnemoce.com/sitemap.xml",
  };
}

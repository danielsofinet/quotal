import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "*/dashboard",
          "*/project/",
          "*/settings",
          "*/sign-in",
        ],
      },
    ],
    sitemap: "https://quotal.app/sitemap.xml",
  };
}

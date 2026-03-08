import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const BASE_URL = "https://quotal.app";

function localeUrl(path: string, locale: string): string {
  return locale === routing.defaultLocale
    ? `${BASE_URL}${path}`
    : `${BASE_URL}/${locale}${path}`;
}

function alternates(path: string) {
  const languages: Record<string, string> = {
    "x-default": localeUrl(path, routing.defaultLocale),
  };
  for (const locale of routing.locales) {
    languages[locale] = localeUrl(path, locale);
  }
  return { languages };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Landing page — all locales
  for (const locale of routing.locales) {
    entries.push({
      url: localeUrl("/", locale),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: alternates("/"),
    });
  }

  // Privacy page — all locales
  for (const locale of routing.locales) {
    entries.push({
      url: localeUrl("/privacy", locale),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: alternates("/privacy"),
    });
  }

  return entries;
}

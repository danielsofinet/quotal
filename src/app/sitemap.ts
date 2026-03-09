import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getAllPosts } from "@/lib/blog";

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
      lastModified: new Date("2026-03-08"),
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: alternates("/"),
    });
  }

  // Terms page — all locales
  for (const locale of routing.locales) {
    entries.push({
      url: localeUrl("/terms", locale),
      lastModified: new Date("2026-03-08"),
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: alternates("/terms"),
    });
  }

  // Privacy page — all locales
  for (const locale of routing.locales) {
    entries.push({
      url: localeUrl("/privacy", locale),
      lastModified: new Date("2026-03-08"),
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: alternates("/privacy"),
    });
  }

  // Blog index — all locales
  for (const locale of routing.locales) {
    entries.push({
      url: localeUrl("/blog", locale),
      lastModified: new Date("2026-03-09"),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: alternates("/blog"),
    });
  }

  // Blog posts — all locales
  const posts = getAllPosts();
  for (const post of posts) {
    for (const locale of routing.locales) {
      entries.push({
        url: localeUrl(`/blog/${post.slug}`, locale),
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: alternates(`/blog/${post.slug}`),
      });
    }
  }

  return entries;
}

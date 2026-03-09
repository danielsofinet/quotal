import { marked } from "marked";
import { blogPosts, type BlogPost } from "./blog-data";

export type { BlogPost };

type SupportedLocale = "en" | "fr" | "es" | "de" | "sv";

const translationImports: Record<
  Exclude<SupportedLocale, "en">,
  () => Promise<{ default: BlogPost[] } | { [key: string]: BlogPost[] }>
> = {
  fr: () => import("./blog-data-fr").then((m) => ({ default: m.blogPostsFr })),
  es: () => import("./blog-data-es").then((m) => ({ default: m.blogPostsEs })),
  de: () => import("./blog-data-de").then((m) => ({ default: m.blogPostsDe })),
  sv: () => import("./blog-data-sv").then((m) => ({ default: m.blogPostsSv })),
};

const sortedEnglish = [...blogPosts].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

// Cache sorted posts per locale
const cache = new Map<string, BlogPost[]>();
cache.set("en", sortedEnglish);

async function getPostsForLocale(locale: string): Promise<BlogPost[]> {
  const cached = cache.get(locale);
  if (cached) return cached;

  const key = locale as Exclude<SupportedLocale, "en">;
  if (!translationImports[key]) return sortedEnglish;

  try {
    const mod = await translationImports[key]();
    const posts = (mod as { default: BlogPost[] }).default;
    const sorted = [...posts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    cache.set(locale, sorted);
    return sorted;
  } catch {
    return sortedEnglish;
  }
}

export function getAllPosts(locale?: string): BlogPost[] {
  // Sync version for English (backwards compatible)
  if (!locale || locale === "en") return sortedEnglish;
  // For other locales, return English as sync fallback
  return cache.get(locale) || sortedEnglish;
}

export async function getAllPostsAsync(locale: string): Promise<BlogPost[]> {
  return getPostsForLocale(locale);
}

export function getPostBySlug(slug: string, locale?: string): BlogPost | null {
  const posts = getAllPosts(locale);
  return posts.find((p) => p.slug === slug) || null;
}

export async function getPostBySlugAsync(
  slug: string,
  locale: string,
): Promise<BlogPost | null> {
  const posts = await getPostsForLocale(locale);
  return posts.find((p) => p.slug === slug) || null;
}

export function renderMarkdown(content: string): string {
  return marked.parse(content, { async: false }) as string;
}

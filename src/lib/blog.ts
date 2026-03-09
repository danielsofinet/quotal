import { marked } from "marked";
import { blogPosts, type BlogPost } from "./blog-data";

export type { BlogPost };

const sortedPosts = [...blogPosts].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

export function getAllPosts(): BlogPost[] {
  return sortedPosts;
}

export function getPostBySlug(slug: string): BlogPost | null {
  return sortedPosts.find((p) => p.slug === slug) || null;
}

export function renderMarkdown(content: string): string {
  return marked.parse(content, { async: false }) as string;
}

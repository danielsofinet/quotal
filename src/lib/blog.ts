import fs from "fs";
import path from "path";
import { marked } from "marked";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  readingTime: string;
  date: string;
  category: string;
  content: string; // raw markdown
}

// Parse frontmatter from our custom format
function parsePost(raw: string): Omit<BlogPost, "slug"> {
  // Normalize line endings and remove wrapper markers
  const cleaned = raw
    .replace(/\r\n/g, "\n")
    .replace(/^=== POST \d+:.*===\n/, "")
    .replace(/\n=== END POST \d+ ===\s*$/, "")
    .trim();

  const lines = cleaned.split("\n");
  const meta: Record<string, string> = {};
  let contentStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(TITLE|DESCRIPTION|READING_TIME|DATE|CATEGORY):\s*(.+)$/);
    if (match) {
      meta[match[1]] = match[2].trim();
    } else if (lines[i].trim() === "") {
      continue;
    } else {
      contentStart = i;
      break;
    }
  }

  const content = lines.slice(contentStart).join("\n").trim();

  return {
    title: meta.TITLE || "",
    description: meta.DESCRIPTION || "",
    readingTime: meta.READING_TIME || "",
    date: meta.DATE || "",
    category: meta.CATEGORY || "",
    content,
  };
}

let postsCache: BlogPost[] | null = null;

export function getAllPosts(): BlogPost[] {
  if (postsCache) return postsCache;

  const blogDir = path.join(process.cwd(), "content", "blog");
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));

  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(blogDir, file), "utf-8");
    return { slug, ...parsePost(raw) };
  });

  // Sort by date descending
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  postsCache = posts;
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | null {
  return getAllPosts().find((p) => p.slug === slug) || null;
}

export function renderMarkdown(content: string): string {
  return marked.parse(content, { async: false }) as string;
}

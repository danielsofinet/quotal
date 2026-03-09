import { marked } from "marked";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  readingTime: string;
  date: string;
  category: string;
  content: string;
}

// Import blog posts as raw strings
import post1 from "../../content/blog/how-to-compare-supplier-quotes.md";
import post2 from "../../content/blog/hidden-fees-vendor-quotes.md";
import post3 from "../../content/blog/vendor-quote-comparison-template.md";
import post4 from "../../content/blog/construction-bid-comparison.md";
import post5 from "../../content/blog/pricing-history-supplier-negotiation.md";

const rawPosts: { slug: string; raw: string }[] = [
  { slug: "how-to-compare-supplier-quotes", raw: post1 },
  { slug: "hidden-fees-vendor-quotes", raw: post2 },
  { slug: "vendor-quote-comparison-template", raw: post3 },
  { slug: "construction-bid-comparison", raw: post4 },
  { slug: "pricing-history-supplier-negotiation", raw: post5 },
];

function parsePost(raw: string): Omit<BlogPost, "slug"> {
  const cleaned = raw
    .replace(/\r\n/g, "\n")
    .replace(/^=== POST \d+:.*===\n/, "")
    .replace(/\n=== END POST \d+ ===\s*$/, "")
    .trim();

  const lines = cleaned.split("\n");
  const meta: Record<string, string> = {};
  let contentStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(
      /^(TITLE|DESCRIPTION|READING_TIME|DATE|CATEGORY):\s*(.+)$/,
    );
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

const posts: BlogPost[] = rawPosts.map(({ slug, raw }) => ({
  slug,
  ...parsePost(raw),
}));

posts.sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

export function getAllPosts(): BlogPost[] {
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | null {
  return posts.find((p) => p.slug === slug) || null;
}

export function renderMarkdown(content: string): string {
  return marked.parse(content, { async: false }) as string;
}

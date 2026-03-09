import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import QuotalLogo from "@/components/QuotalLogo";
import { getAllPosts, getPostBySlug, renderMarkdown } from "@/lib/blog";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} — Quotal`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://quotal.app/blog/${post.slug}`,
      siteName: "Quotal",
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const html = renderMarkdown(post.content);
  const allPosts = getAllPosts().filter((p) => p.slug !== slug).slice(0, 3);

  // Structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "Quotal",
      url: "https://quotal.app",
    },
    publisher: {
      "@type": "Organization",
      name: "Quotal",
      url: "https://quotal.app",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://quotal.app/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/">
            <QuotalLogo className="h-5 w-auto" />
          </a>
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              Blog
            </Link>
            <a
              href="/sign-in"
              className="text-sm font-medium bg-accent hover:bg-accent-light text-white px-5 py-2 rounded-lg transition-all duration-150"
            >
              Try Quotal free
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent/15 text-accent-light">
              {post.category}
            </span>
            <span className="text-xs text-text-dim">{post.readingTime}</span>
            <span className="text-xs text-text-dim">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
            {post.title}
          </h1>
        </div>

        <article
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* CTA */}
        <div className="mt-16 p-8 rounded-2xl border border-border bg-surface text-center">
          <h3 className="text-xl font-semibold mb-2">
            Stop comparing quotes in spreadsheets
          </h3>
          <p className="text-sm text-text-muted mb-5 max-w-md mx-auto">
            Upload vendor quotes in any format and get an AI-powered side-by-side
            comparison in seconds. Free to start.
          </p>
          <a
            href="/sign-in"
            className="inline-flex items-center text-sm font-medium bg-accent hover:bg-accent-light text-white px-6 py-2.5 rounded-lg transition-all duration-150"
          >
            Try Quotal free
          </a>
        </div>

        {/* Related posts */}
        {allPosts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-border">
            <h3 className="text-lg font-semibold mb-6">Keep reading</h3>
            <div className="grid gap-4">
              {allPosts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-surface transition-all duration-200"
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold group-hover:text-accent-light transition-colors">
                      {p.title}
                    </h4>
                    <p className="text-xs text-text-dim mt-1">
                      {p.readingTime}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <QuotalLogo className="h-4 w-auto" />
            <span className="text-xs text-text-dim">
              {new Date().getFullYear()} Quotal. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="/terms"
              className="text-xs text-text-dim hover:text-text-muted transition-colors"
            >
              Terms
            </a>
            <a
              href="/privacy"
              className="text-xs text-text-dim hover:text-text-muted transition-colors"
            >
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

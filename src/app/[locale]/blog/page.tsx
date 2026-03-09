import { Metadata } from "next";
import Link from "next/link";
import QuotalLogo from "@/components/QuotalLogo";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Quotal | Procurement Tips, Quote Comparison Guides",
  description:
    "Practical guides on comparing vendor quotes, detecting hidden fees, negotiating better deals, and streamlining procurement. From the team at Quotal.",
  openGraph: {
    title: "Quotal Blog — Procurement Tips & Quote Comparison Guides",
    description:
      "Practical guides on comparing vendor quotes, detecting hidden fees, and negotiating better supplier deals.",
    url: "https://quotal.app/blog",
    siteName: "Quotal",
    type: "website",
  },
};

const categoryColors: Record<string, string> = {
  "Procurement Guides": "bg-accent/15 text-accent-light",
  "Cost Management": "bg-danger/15 text-danger",
  "Tools & Templates": "bg-success/15 text-success",
  "Industry Guides": "bg-warning/15 text-warning",
  "Negotiation Strategy": "bg-accent/15 text-accent-light",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/">
            <QuotalLogo className="h-5 w-auto" />
          </a>
          <a
            href="/sign-in"
            className="text-sm font-medium bg-accent hover:bg-accent-light text-white px-5 py-2 rounded-lg transition-all duration-150"
          >
            Try Quotal free
          </a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Blog
          </h1>
          <p className="text-text-muted text-lg">
            Practical guides on comparing quotes, catching hidden fees, and
            getting better deals from suppliers.
          </p>
        </div>

        <div className="grid gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block p-6 rounded-xl border border-border bg-surface hover:bg-surface-hover transition-all duration-200 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    categoryColors[post.category] ||
                    "bg-accent/15 text-accent-light"
                  }`}
                >
                  {post.category}
                </span>
                <span className="text-xs text-text-dim">
                  {post.readingTime}
                </span>
              </div>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-accent-light transition-colors duration-150">
                {post.title}
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
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
            <a
              href="mailto:contact@quotal.app"
              className="text-xs text-text-dim hover:text-text-muted transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

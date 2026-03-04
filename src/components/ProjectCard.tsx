"use client";

import Link from "next/link";

interface Quote {
  id: string;
  vendorName: string | null;
  grandTotal: number | null;
  processingStatus: string;
}

interface ProjectCardProps {
  id: string;
  name: string;
  quoteCount: number;
  createdAt: string;
  quotes?: Quote[];
}

export default function ProjectCard({
  id,
  name,
  quoteCount,
  createdAt,
  quotes = [],
}: ProjectCardProps) {
  const processedQuotes = quotes.filter((q) => q.processingStatus === "DONE");
  const cheapest = processedQuotes.length
    ? processedQuotes.reduce(
        (min, q) =>
          q.grandTotal !== null && (min === null || q.grandTotal < min.grandTotal!)
            ? q
            : min,
        null as Quote | null
      )
    : null;

  const date = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/project/${id}`}
      className="block p-5 bg-surface border border-border rounded-lg hover:border-border-light hover:bg-surface-hover transition-all duration-150 group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-[15px] text-text-primary group-hover:text-accent-light transition-colors">
          {name}
        </h3>
        <span className="text-xs text-text-dim">{date}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            className="text-text-dim"
          >
            <path
              d="M13 2H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V3C14 2.44772 13.5523 2 13 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M5 6H11M5 9H9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-sm text-text-muted">
            {quoteCount} {quoteCount === 1 ? "quote" : "quotes"}
          </span>
        </div>

        {cheapest && cheapest.grandTotal !== null && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-sm text-text-muted">
              Best:{" "}
              <span className="font-mono text-success">
                €{cheapest.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>{" "}
              <span className="text-text-dim">({cheapest.vendorName})</span>
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

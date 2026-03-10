"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { authFetch } from "@/lib/api";

interface QuoteSource {
  id: string;
  vendorName: string | null;
  fileName: string | null;
  processingStatus: string;
}

interface QuoteSourcesProps {
  quotes: QuoteSource[];
  projectId: string;
}

export default function QuoteSources({ quotes, projectId }: QuoteSourcesProps) {
  const t = useTranslations("Project");
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [deleting, setDeleting] = useState<string | null>(null);

  if (quotes.length === 0) return null;

  async function handleDelete(quoteId: string) {
    if (!confirm(t("confirmDelete"))) return;
    setDeleting(quoteId);
    try {
      const res = await authFetch(`/api/projects/${projectId}/quotes/${quoteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        startTransition(() => {
          router.refresh();
        });
      }
    } finally {
      setDeleting(null);
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <span className="w-2 h-2 rounded-full bg-success shrink-0" />;
      case "PENDING":
      case "PROCESSING":
        return <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />;
      case "ERROR":
        return <span className="w-2 h-2 rounded-full bg-danger shrink-0" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-text-dim shrink-0" />;
    }
  };

  return (
    <div className="mt-4 border border-border rounded-lg divide-y divide-border">
      {quotes.map((q) => (
        <div
          key={q.id}
          className="flex items-center gap-3 px-4 py-2.5 text-sm"
        >
          {statusIcon(q.processingStatus)}
          <div className="flex-1 min-w-0">
            <span className="text-text-primary font-medium truncate block">
              {q.vendorName || q.fileName || t("unknownSource")}
            </span>
            {q.vendorName && q.fileName && (
              <span className="text-[11px] text-text-dim truncate block">
                {q.fileName}
              </span>
            )}
          </div>
          <button
            onClick={() => handleDelete(q.id)}
            disabled={deleting === q.id}
            className="p-1.5 rounded-md text-text-dim hover:text-danger hover:bg-danger-dim transition-colors shrink-0 disabled:opacity-50"
            aria-label={t("removeQuote")}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

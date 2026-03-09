"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { authFetch } from "@/lib/api";

interface VendorQuote {
  id: string;
  grandTotal: number | null;
  createdAt: string;
  projectId: string;
  projectName: string;
}

interface Vendor {
  name: string;
  quotes: VendorQuote[];
}

interface VendorsClientProps {
  userPlan?: string;
}

export default function VendorsClient({ userPlan = "free" }: VendorsClientProps) {
  const t = useTranslations("Vendors");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);

  useEffect(() => {
    if (userPlan !== "pro") {
      setLoading(false);
      return;
    }
    authFetch("/api/vendors")
      .then((res) => (res.ok ? res.json() : []))
      .then(setVendors)
      .finally(() => setLoading(false));
  }, [userPlan]);

  // Gated empty state for free users
  if (userPlan !== "pro") {
    return (
      <div className="text-center py-16 border border-border rounded-lg bg-surface">
        <div className="w-12 h-12 rounded-xl bg-accent-dim border border-accent/20 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent-light">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="font-semibold text-text-primary mb-1">{t("proFeature")}</h3>
        <p className="text-sm text-text-muted max-w-sm mx-auto">{t("proDescription")}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 rounded-lg bg-surface border border-border animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="text-center py-16 border border-border rounded-lg bg-surface">
        <p className="text-text-muted text-sm">{t("noVendors")}</p>
      </div>
    );
  }

  function getTrend(quotes: VendorQuote[]): "up" | "down" | "stable" | null {
    const withTotals = quotes.filter((q) => q.grandTotal !== null);
    if (withTotals.length < 2) return null;
    const latest = withTotals[0].grandTotal!;
    const previous = withTotals[1].grandTotal!;
    if (latest > previous * 1.01) return "up";
    if (latest < previous * 0.99) return "down";
    return "stable";
  }

  return (
    <div className="space-y-2">
      {vendors.map((vendor) => {
        const isExpanded = expandedVendor === vendor.name;
        const latestTotal = vendor.quotes.find((q) => q.grandTotal !== null)?.grandTotal;
        const trend = getTrend(vendor.quotes);

        return (
          <div
            key={vendor.name}
            className="border border-border rounded-lg bg-surface overflow-hidden"
          >
            <button
              onClick={() => setExpandedVendor(isExpanded ? null : vendor.name)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-accent-dim text-accent-light flex items-center justify-center text-xs font-semibold shrink-0">
                  {vendor.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-text-primary text-sm truncate">
                    {vendor.name}
                  </div>
                  <div className="text-[11px] text-text-dim">
                    {t("quoteCount", { count: vendor.quotes.length })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {latestTotal !== null && latestTotal !== undefined && (
                  <div className="text-right">
                    <div className="font-mono text-sm text-text-primary">
                      {`€${latestTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </div>
                    {trend && (
                      <div className={`text-[11px] font-medium ${
                        trend === "down" ? "text-success" : trend === "up" ? "text-danger" : "text-text-dim"
                      }`}>
                        {trend === "down" ? t("trendDown") : trend === "up" ? t("trendUp") : t("trendStable")}
                      </div>
                    )}
                  </div>
                )}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`text-text-dim transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                >
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-border animate-slide-up">
                <div className="px-4 py-2 bg-bg">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">
                    {t("quoteHistory")}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {vendor.quotes.map((q) => (
                    <Link
                      key={q.id}
                      href={`/project/${q.projectId}?quote=${q.id}`}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-surface-hover transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-sm text-text-primary truncate">
                          {q.projectName}
                        </div>
                        <div className="text-[11px] text-text-dim">
                          {new Date(q.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      <div className="font-mono text-sm text-text-muted shrink-0 ml-4">
                        {q.grandTotal !== null
                          ? `€${q.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : "—"}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

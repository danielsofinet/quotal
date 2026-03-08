"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { authFetch } from "@/lib/api";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  limitType: "projects" | "quotes";
  max: number;
}

export default function UpgradeModal({
  open,
  onClose,
  limitType,
  max,
}: UpgradeModalProps) {
  const t = useTranslations("Upgrade");
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await authFetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval: yearly ? "yearly" : "monthly" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        className="animate-slide-up relative z-10 w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl mx-4"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-surface-hover hover:text-text-muted"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-accent-dim border border-accent/20 flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent-light">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 id="upgrade-title" className="text-lg font-semibold text-text-primary mb-1">
          {t("title")}
        </h2>
        <p className="text-sm text-text-muted mb-5">
          {limitType === "projects"
            ? t("projectLimit", { max })
            : t("quoteLimit", { max })}
          {" "}
          {t("subtitle")}
        </p>

        {/* Free vs Pro comparison */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-lg border border-border bg-bg p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">{t("free")}</span>
            <div className="mt-2 space-y-1.5">
              <div className="text-sm text-text-muted">
                <span className="font-mono font-medium text-text-primary">{t("freeProjects")}</span>{" "}
                {t("projects")}
              </div>
              <div className="text-sm text-text-muted">
                <span className="font-mono font-medium text-text-primary">{t("freeQuotes")}</span>{" "}
                {t("quotesPerProject")}
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-accent/30 bg-accent-dim p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-accent-light">{t("pro")}</span>
            <div className="mt-2 space-y-1.5">
              <div className="text-sm text-text-muted">
                <span className="font-mono font-medium text-accent-light">{t("proProjects")}</span>{" "}
                {t("projects")}
              </div>
              <div className="text-sm text-text-muted">
                <span className="font-mono font-medium text-accent-light">{t("proQuotes")}</span>{" "}
                {t("quotesPerProject")}
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-text-dim mb-5">{t("features")}</p>

        {/* Monthly / Yearly toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-bg border border-border mb-5">
          <button
            onClick={() => setYearly(false)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
              !yearly
                ? "bg-accent text-white"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {t("monthlyPrice")}
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
              yearly
                ? "bg-accent text-white"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {t("yearlyPrice")}
            {yearly && (
              <span className="ml-1 text-[9px] font-semibold uppercase tracking-wider opacity-80">
                {t("yearlySavings")}
              </span>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-light disabled:opacity-50 text-white font-medium px-6 py-3 rounded-lg transition-all duration-150 text-sm"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {t("upgrade")}
          </button>
          <button
            onClick={onClose}
            className="w-full text-sm text-text-muted hover:text-text-primary py-2 transition-colors"
          >
            {t("maybeLater")}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("Landing.hero");
  const ht = useTranslations("Landing.heroTable");

  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6 overflow-hidden">
      <div className="relative max-w-6xl mx-auto">
        {/* Text */}
        <motion.div
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-dim border border-accent/20 text-xs font-medium tracking-widest uppercase text-accent-light mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-light" />
            {t("badge")}
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight mb-6 text-text-primary">
            {t("title")}
          </h1>

          <p className="text-lg md:text-xl text-text-muted leading-relaxed max-w-2xl mx-auto mb-10">
            {t("subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#signup"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white font-medium px-6 py-3 rounded-lg transition-all duration-150 text-base"
            >
              {t("cta")}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M10 5L13 8L10 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary font-medium px-6 py-3 rounded-lg border border-border-light bg-transparent hover:bg-surface transition-all duration-150 text-base"
            >
              {t("ctaSecondary")}
            </a>
          </div>
        </motion.div>

        {/* Hero comparison table */}
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          <HeroTable ht={ht} />
        </motion.div>
      </div>
    </section>
  );
}

function HeroTable({ ht }: { ht: ReturnType<typeof useTranslations> }) {
  const vendors = [
    { name: ht("vendor1"), id: "v1" },
    { name: ht("vendor2"), id: "v2" },
    { name: ht("vendor3"), id: "v3" },
  ];

  const rows: {
    label: string;
    prices: { value: string; state: "best" | "worst" | "neutral" }[];
  }[] = [
    {
      label: ht("item1"),
      prices: [
        { value: "€0.82", state: "neutral" },
        { value: "€0.74", state: "best" },
        { value: "€0.78", state: "neutral" },
      ],
    },
    {
      label: ht("item2"),
      prices: [
        { value: "€12.50", state: "neutral" },
        { value: "€14.20", state: "worst" },
        { value: "€11.80", state: "best" },
      ],
    },
    {
      label: ht("item3"),
      prices: [
        { value: "€2.10", state: "neutral" },
        { value: "€1.95", state: "best" },
        { value: "€2.35", state: "worst" },
      ],
    },
    {
      label: ht("item4"),
      prices: [
        { value: "€380", state: "neutral" },
        { value: "€620", state: "worst" },
        { value: "€290", state: "best" },
      ],
    },
  ];

  return (
    <div className="rounded-xl landing-card bg-surface overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-bg/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-border-light" />
          <div className="w-3 h-3 rounded-full bg-border-light" />
          <div className="w-3 h-3 rounded-full bg-border-light" />
        </div>
        <div className="flex-1 text-center text-[11px] text-text-dim font-mono">quotal.app</div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface">
              <th className="text-left px-5 py-3.5 font-medium text-text-muted border-b border-border w-[200px] min-w-[180px]">
                <span className="text-[10px] uppercase tracking-widest">{ht("lineItem")}</span>
              </th>
              {vendors.map((v) => (
                <th key={v.id} className="text-left px-5 py-3.5 border-b border-border border-l min-w-[160px]">
                  <span className="font-semibold text-text-primary text-[13px]">{v.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-bg" : "bg-surface/50"}>
                <td className="px-5 py-3.5 text-[13px] text-text-muted font-medium">
                  {row.label}
                </td>
                {row.prices.map((p, j) => (
                  <td
                    key={j}
                    className={`px-5 py-3.5 border-l border-border font-mono text-[13px] font-medium ${
                      p.state === "best"
                        ? "text-success bg-success-dim"
                        : p.state === "worst"
                          ? "text-danger bg-danger-dim"
                          : "text-text-primary"
                    }`}
                  >
                    {p.value}
                    {p.state === "best" && (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="inline ml-1.5 -mt-0.5">
                        <path d="M5.5 8L7 9.5L10.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </td>
                ))}
              </tr>
            ))}

            {/* Fuel surcharge — hidden fee row */}
            <tr className="bg-bg">
              <td className="px-5 py-3.5 text-[13px] text-text-muted font-medium">
                {ht("item5")}
              </td>
              <td className="px-5 py-3.5 border-l border-border">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] font-medium text-text-primary">€529</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning-dim text-[10px] font-medium uppercase tracking-wider text-warning">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2L14.5 13.5H1.5L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M8 6.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
                    </svg>
                    {ht("hidden")}
                  </span>
                </div>
              </td>
              <td className="px-5 py-3.5 border-l border-border text-text-dim text-[13px]">—</td>
              <td className="px-5 py-3.5 border-l border-border text-text-dim text-[13px]">—</td>
            </tr>

            {/* Grand total */}
            <tr className="border-t-2 border-border-light bg-surface">
              <td className="px-5 py-4 font-semibold text-text-primary">{ht("grandTotal")}</td>
              <td className="px-5 py-4 border-l border-border font-mono font-semibold text-base text-text-primary">
                €12,659
              </td>
              <td className="px-5 py-4 border-l border-border font-mono font-semibold text-base text-success bg-success-dim">
                <div className="flex items-center gap-2">
                  €11,835
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/15 text-[10px] font-semibold uppercase tracking-wider text-success">
                    {ht("bestDeal")}
                  </span>
                </div>
              </td>
              <td className="px-5 py-4 border-l border-border font-mono font-semibold text-base text-text-primary">
                €11,975
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

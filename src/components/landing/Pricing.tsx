"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Pricing() {
  const t = useTranslations("Landing.pricing");
  const [yearly, setYearly] = useState(false);

  const freeFeatures = ["f1", "f2", "f3", "f4"] as const;
  const proFeatures = ["f1", "f2", "f3", "f4", "f5"] as const;

  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="text-xs uppercase tracking-widest font-medium text-accent-light mb-3 block">
            {t("label")}
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-8">
            {t("title")}
          </h2>

          {/* Monthly / Yearly toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-surface border border-border">
            <button
              onClick={() => setYearly(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                !yearly
                  ? "bg-accent text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {t("monthly")}
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                yearly
                  ? "bg-accent text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {t("yearly")}
            </button>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {/* Free tier */}
          <motion.div
            variants={fadeUp}
            className="p-8 bg-surface rounded-xl flex flex-col landing-card"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-1">{t("free.name")}</h3>
            <p className="text-sm text-text-dim mb-6">{t("free.subtitle")}</p>
            <div className="mb-6">
              <span className="text-4xl font-semibold text-text-primary font-mono">{t("free.price")}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-text-muted">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-dim shrink-0">
                    <path d="M5.5 8L7 9.5L10.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t(`free.features.${f}`)}
                </li>
              ))}
            </ul>
            <a
              href="/sign-in"
              className="inline-flex items-center justify-center text-sm font-medium border border-border-light bg-transparent hover:bg-surface-hover text-text-primary px-6 py-3 rounded-lg transition-all duration-150"
            >
              {t("free.cta")}
            </a>
          </motion.div>

          {/* Pro tier */}
          <motion.div
            variants={fadeUp}
            className="p-8 bg-surface rounded-xl flex flex-col relative landing-card ring-2 ring-accent/20"
          >
            <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-accent text-white text-[10px] font-semibold uppercase tracking-wider">
              {t("pro.popular")}
            </span>
            <h3 className="text-lg font-semibold text-text-primary mb-1">{t("pro.name")}</h3>
            <p className="text-sm text-text-dim mb-6">{t("pro.subtitle")}</p>

            {/* Animated price */}
            <div className="mb-6 h-12 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={yearly ? "yearly" : "monthly"}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-0 flex items-baseline gap-1"
                >
                  <span className="text-4xl font-semibold text-text-primary font-mono">
                    {yearly ? t("pro.yearlyPrice") : t("pro.price")}
                  </span>
                  <span className="text-text-dim text-sm">
                    {yearly ? t("pro.yearlyPeriod") : t("pro.period")}
                  </span>
                  {yearly && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                      className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full bg-success-dim text-success text-[10px] font-semibold uppercase tracking-wider"
                    >
                      {t("pro.yearlySavings")}
                    </motion.span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-text-muted">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-accent-light shrink-0">
                    <path d="M5.5 8L7 9.5L10.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t(`pro.features.${f}`)}
                </li>
              ))}
            </ul>
            <a
              href="/sign-in"
              className="inline-flex items-center justify-center text-sm font-medium bg-accent hover:bg-accent-light text-white px-6 py-3 rounded-lg transition-all duration-150"
            >
              {t("pro.cta")}
            </a>
          </motion.div>
        </motion.div>

        <p className="text-center text-xs text-text-dim mt-8">{t("note")}</p>
      </div>
    </section>
  );
}

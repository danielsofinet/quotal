"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function CTA() {
  const t = useTranslations("Landing.cta");

  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-text-muted mb-10 max-w-lg mx-auto">
            {t("subtitle")}
          </p>

          <a
            href="/sign-in"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white font-medium px-8 py-3.5 rounded-lg transition-all duration-150 text-base"
          >
            {t("button")}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M10 5L13 8L10 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          <p className="text-xs text-text-dim mt-4">{t("note")}</p>
        </motion.div>
      </div>
    </section>
  );
}

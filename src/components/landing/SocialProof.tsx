"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function SocialProof() {
  const t = useTranslations("Landing.socialProof");

  return (
    <section className="py-24 md:py-32 px-6 bg-surface border-y border-border">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto mb-8 text-accent/30">
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5 3.871 3.871 0 01-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5 3.871 3.871 0 01-2.748-1.179z" fill="currentColor" />
          </svg>

          <blockquote className="text-xl md:text-2xl text-text-primary font-medium leading-relaxed italic mb-6 max-w-3xl mx-auto">
            &ldquo;{t("quote")}&rdquo;
          </blockquote>

          <p className="text-sm text-text-dim mb-8">{t("attribution")}</p>

          <p className="text-sm text-text-muted font-medium">{t("tagline")}</p>
        </motion.div>
      </div>
    </section>
  );
}

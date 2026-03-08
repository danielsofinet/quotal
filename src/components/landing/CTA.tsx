"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function CTA() {
  const t = useTranslations("Landing.cta");
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    /* TODO: Replace with actual form endpoint (Formspree, Formspark, or custom API) */
    window.location.href = `mailto:daniel@quotal.app?subject=Early Access Request&body=I'd like early access to Quotal. My email: ${encodeURIComponent(email)}`;
  }

  return (
    <section id="signup" className="py-24 md:py-32 px-6">
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

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("placeholder")}
              required
              className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all duration-150"
            />
            <button
              type="submit"
              className="bg-accent hover:bg-accent-light text-white font-medium px-6 py-3 rounded-lg transition-all duration-150 text-sm whitespace-nowrap"
            >
              {t("button")}
            </button>
          </form>

          <p className="text-xs text-text-dim mt-4">{t("note")}</p>
        </motion.div>
      </div>
    </section>
  );
}

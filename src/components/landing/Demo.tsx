"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function Demo() {
  const t = useTranslations("Landing.demo");

  return (
    <section id="demo" className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="text-xs uppercase tracking-widest font-medium text-accent-light mb-3 block">
            {t("label")}
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
            {t("title")}
          </h2>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        >
          {/* Video placeholder — replace with actual Loom embed */}
          {/* <iframe src="https://www.loom.com/embed/YOUR_VIDEO_ID" frameBorder="0" allowFullScreen className="w-full aspect-video rounded-xl" /> */}
          <div className="relative aspect-video rounded-xl bg-surface landing-card overflow-hidden group cursor-pointer">
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: "radial-gradient(circle, #E8E8ED 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }} />

            {/* Play button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center group-hover:bg-accent/30 group-hover:scale-105 transition-all duration-200">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-accent-light ml-1">
                  <path d="M8 5.14v13.72a1 1 0 001.5.86l11.14-6.86a1 1 0 000-1.72L9.5 4.28a1 1 0 00-1.5.86z" fill="currentColor" />
                </svg>
              </div>
              <span className="text-sm text-text-muted font-medium">{t("watchDemo")}</span>
            </div>
          </div>

          <p className="text-center text-xs text-text-dim mt-4">{t("noSignup")}</p>
        </motion.div>
      </div>
    </section>
  );
}

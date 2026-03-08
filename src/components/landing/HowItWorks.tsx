"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function HowItWorks() {
  const t = useTranslations("Landing.howItWorks");

  const steps = ["step1", "step2", "step3"] as const;

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
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
            {t("title")}
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {/* Connecting line between steps */}
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px border-t border-dashed border-border-light" />

          {steps.map((step) => (
            <motion.div key={step} variants={fadeUp} className="relative text-center md:text-left">
              <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-dim border border-accent/15 mb-5 mx-auto md:mx-0">
                <span className="text-sm font-semibold text-accent-light font-mono">
                  {t(`${step}.number`)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {t(`${step}.title`)}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {t(`${step}.description`)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

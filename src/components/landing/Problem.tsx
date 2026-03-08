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

export default function Problem() {
  const t = useTranslations("Landing.problem");

  const cards = [
    { key: "card1" as const },
    { key: "card2" as const },
    { key: "card3" as const },
  ];

  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-16"
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
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {cards.map((card) => (
            <motion.div
              key={card.key}
              variants={fadeUp}
              className="p-6 bg-surface rounded-xl landing-card"
            >
              <span className="text-2xl mb-4 block">{t(`${card.key}.emoji`)}</span>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {t(`${card.key}.title`)}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {t(`${card.key}.description`)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

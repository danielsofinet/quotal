"use client";

import { useTranslations } from "next-intl";
import QuotalLogo from "@/components/QuotalLogo";

export default function Footer() {
  const t = useTranslations("Landing.footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <QuotalLogo className="h-4 w-auto" />
          <span className="text-xs text-text-dim">
            {t("copyright", { year })}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <a href="/terms" className="text-xs text-text-dim hover:text-text-muted transition-colors">
            {t("terms")}
          </a>
          <a href="/privacy" className="text-xs text-text-dim hover:text-text-muted transition-colors">
            {t("privacy")}
          </a>
          <a href="mailto:contact@quotal.app" className="text-xs text-text-dim hover:text-text-muted transition-colors">
            {t("contact")}
          </a>
        </div>
      </div>
    </footer>
  );
}

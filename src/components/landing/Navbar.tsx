"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import QuotalLogo from "@/components/QuotalLogo";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function Navbar() {
  const t = useTranslations("Landing.nav");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-bg/35 backdrop-blur-[10px] shadow-sm border-b border-border/30"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="text-text-primary">
          <QuotalLogo className="h-6 w-auto" />
        </a>

        <div className="flex items-center gap-3">
          <a
            href="#demo"
            className="hidden sm:inline-flex items-center text-sm text-text-muted hover:text-text-primary transition-all duration-150 border border-border-light bg-transparent hover:bg-surface px-6 py-2.5 rounded-lg"
          >
            {t("watchDemo")}
          </a>
          <a
            href="/sign-in"
            className="text-sm font-medium bg-accent hover:bg-accent-light text-white px-6 py-2.5 rounded-lg transition-all duration-150"
          >
            {t("earlyAccess")}
          </a>
          <LocaleSwitcher />
        </div>
      </div>
    </nav>
  );
}

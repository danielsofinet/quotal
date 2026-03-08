"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useState, useRef, useEffect } from "react";

const locales: Record<string, { flag: string; name: string }> = {
  en: { flag: "/flags/gb.svg", name: "English" },
  sv: { flag: "/flags/se.svg", name: "Svenska" },
  de: { flag: "/flags/de.svg", name: "Deutsch" },
  fr: { flag: "/flags/fr.svg", name: "Français" },
  es: { flag: "/flags/es.svg", name: "Español" },
};

export default function LocaleSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(newLocale: string) {
    setOpen(false);
    router.replace(pathname, { locale: newLocale });
  }

  const current = locales[locale];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-hover transition-colors duration-150 cursor-pointer"
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="w-[22px] h-[22px] rounded-full overflow-hidden inline-flex shrink-0">
          <img
            src={current?.flag}
            alt={current?.name}
            className="w-full h-full object-cover"
          />
        </span>
      </button>

      <div
        role="listbox"
        aria-label="Select language"
        className={`absolute right-0 top-full mt-2 bg-surface border border-border-light rounded-xl shadow-lg shadow-black/30 overflow-hidden transition-all duration-200 origin-top-right ${
          open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
        }`}
      >
        {routing.locales.map((loc) => {
          const { flag, name } = locales[loc];
          return (
            <button
              key={loc}
              role="option"
              aria-selected={loc === locale}
              onClick={() => handleSelect(loc)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-100 cursor-pointer whitespace-nowrap ${
                loc === locale
                  ? "bg-accent-dim text-text-primary"
                  : "text-text-muted hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              <span className="w-5 h-5 rounded-full overflow-hidden inline-flex shrink-0">
                <img
                  src={flag}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </span>
              <span>{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

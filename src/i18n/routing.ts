import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "sv", "de", "fr", "es"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

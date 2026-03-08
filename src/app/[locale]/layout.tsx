import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import AuthProvider from "@/components/AuthProvider";
import ThemeProvider from "@/components/ThemeProvider";
import type { Metadata } from "next";

const BASE_URL = "https://quotal.app";

const localeToOg: Record<string, string> = {
  en: "en_US",
  sv: "sv_SE",
  de: "de_DE",
  fr: "fr_FR",
  es: "es_ES",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const canonical =
    locale === routing.defaultLocale ? BASE_URL : `${BASE_URL}/${locale}`;

  const languages: Record<string, string> = { "x-default": BASE_URL };
  for (const loc of routing.locales) {
    languages[loc] =
      loc === routing.defaultLocale ? BASE_URL : `${BASE_URL}/${loc}`;
  }

  return {
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      locale: localeToOg[locale] ?? "en_US",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}

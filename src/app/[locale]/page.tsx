import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";
import JsonLd from "@/components/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Landing" });

  return {
    title: `Quotal — ${t("hero.title")}`,
    description: t("hero.subtitle"),
    openGraph: {
      title: `Quotal — ${t("hero.title")}`,
      description: t("hero.subtitle"),
    },
  };
}

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session");

  if (session?.value) {
    redirect("/dashboard");
  }

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Quotal",
    url: "https://quotal.app",
    logo: "https://quotal.app/favicon.svg",
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@quotal.app",
      contactType: "customer support",
    },
  };

  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Quotal",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://quotal.app",
    description:
      "AI-powered tool that extracts and compares supplier quotes from any format. Hidden fees flagged automatically.",
    featureList: [
      "Multi-format quote extraction (PDF, Excel, CSV, email)",
      "AI-normalized side-by-side comparison",
      "Hidden fee detection",
      "Automated supplier quote analysis",
    ],
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "29",
        priceCurrency: "USD",
        billingIncrement: "P1M",
      },
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Quotal",
    url: "https://quotal.app",
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What document formats does Quotal support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Quotal supports PDF, Excel (.xlsx, .xls), CSV, and plain-text email quotes. Upload any format and get a normalized comparison table in seconds.",
        },
      },
      {
        "@type": "Question",
        name: "How does Quotal detect hidden fees?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Quotal uses AI to analyze every line item and footnote in vendor quotes. Fees like fuel surcharges, palletization, and minimum order penalties are flagged automatically so nothing slips through.",
        },
      },
      {
        "@type": "Question",
        name: "Can I forward quotes by email?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Each project has a unique inbox address. Forward vendor emails directly to it and Quotal extracts the quote data automatically.",
        },
      },
      {
        "@type": "Question",
        name: "Is Quotal free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Quotal offers a free tier with up to 2 projects and 3 quotes per project. The Pro plan at $29/month gives you unlimited projects, quotes, and priority processing.",
        },
      },
    ],
  };

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={softwareApp} />
      <JsonLd data={website} />
      <JsonLd data={faq} />
      <LandingPage />
    </>
  );
}

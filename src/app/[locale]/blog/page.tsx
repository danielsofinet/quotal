import { Metadata } from "next";
import Link from "next/link";
import QuotalLogo from "@/components/QuotalLogo";
import { getAllPostsAsync } from "@/lib/blog";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string }>;
}

const blogMeta: Record<string, { title: string; description: string; ogTitle: string; ogDescription: string; heading: string; subheading: string }> = {
  en: {
    title: "Blog — Quotal | Procurement Tips, Quote Comparison Guides",
    description: "Practical guides on comparing vendor quotes, detecting hidden fees, negotiating better deals, and streamlining procurement. From the team at Quotal.",
    ogTitle: "Quotal Blog — Procurement Tips & Quote Comparison Guides",
    ogDescription: "Practical guides on comparing vendor quotes, detecting hidden fees, and negotiating better supplier deals.",
    heading: "Blog",
    subheading: "Practical guides on comparing quotes, catching hidden fees, and getting better deals from suppliers.",
  },
  fr: {
    title: "Blog — Quotal | Conseils Achats, Guides Comparaison de Devis",
    description: "Guides pratiques pour comparer les devis fournisseurs, détecter les frais cachés, négocier de meilleures offres et optimiser vos achats.",
    ogTitle: "Blog Quotal — Conseils Achats & Guides Comparaison de Devis",
    ogDescription: "Guides pratiques pour comparer les devis fournisseurs, détecter les frais cachés et négocier de meilleures offres.",
    heading: "Blog",
    subheading: "Guides pratiques pour comparer les devis, détecter les frais cachés et obtenir de meilleures offres de vos fournisseurs.",
  },
  es: {
    title: "Blog — Quotal | Consejos de Compras, Guías de Comparación de Presupuestos",
    description: "Guías prácticas para comparar presupuestos de proveedores, detectar costes ocultos, negociar mejores acuerdos y optimizar las compras.",
    ogTitle: "Blog Quotal — Consejos de Compras & Guías de Comparación",
    ogDescription: "Guías prácticas para comparar presupuestos de proveedores, detectar costes ocultos y negociar mejores acuerdos.",
    heading: "Blog",
    subheading: "Guías prácticas para comparar presupuestos, detectar costes ocultos y conseguir mejores acuerdos con proveedores.",
  },
  de: {
    title: "Blog — Quotal | Einkaufstipps, Angebotsvergleich-Ratgeber",
    description: "Praktische Ratgeber zum Vergleich von Lieferantenangeboten, zur Erkennung versteckter Kosten und zur Optimierung Ihres Einkaufs.",
    ogTitle: "Quotal Blog — Einkaufstipps & Angebotsvergleich-Ratgeber",
    ogDescription: "Praktische Ratgeber zum Vergleich von Lieferantenangeboten, zur Erkennung versteckter Kosten und besseren Verhandlungen.",
    heading: "Blog",
    subheading: "Praktische Ratgeber zum Angebotsvergleich, zur Erkennung versteckter Kosten und für bessere Lieferantenkonditionen.",
  },
  sv: {
    title: "Blogg — Quotal | Inköpstips, Guider för Offertjämförelse",
    description: "Praktiska guider för att jämföra leverantörsofferter, upptäcka dolda kostnader, förhandla bättre avtal och effektivisera inköp.",
    ogTitle: "Quotal Blogg — Inköpstips & Guider för Offertjämförelse",
    ogDescription: "Praktiska guider för att jämföra leverantörsofferter, upptäcka dolda kostnader och förhandla bättre avtal.",
    heading: "Blogg",
    subheading: "Praktiska guider för att jämföra offerter, upptäcka dolda kostnader och få bättre avtal från leverantörer.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = blogMeta[locale] || blogMeta.en;

  const canonical =
    locale === routing.defaultLocale
      ? "https://quotal.app/blog"
      : `https://quotal.app/${locale}/blog`;

  const alternates: Record<string, string> = {
    "x-default": "https://quotal.app/blog",
  };
  for (const l of routing.locales) {
    alternates[l] =
      l === routing.defaultLocale
        ? "https://quotal.app/blog"
        : `https://quotal.app/${l}/blog`;
  }

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical,
      languages: alternates,
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: canonical,
      siteName: "Quotal",
      type: "website",
      locale: locale,
    },
  };
}

const categoryColors: Record<string, string> = {
  // English
  "Procurement Guides": "bg-accent/15 text-accent-light",
  "Cost Management": "bg-danger/15 text-danger",
  "Tools & Templates": "bg-success/15 text-success",
  "Industry Guides": "bg-warning/15 text-warning",
  "Negotiation Strategy": "bg-accent/15 text-accent-light",
  // French
  "Guides Achats": "bg-accent/15 text-accent-light",
  "Gestion des Coûts": "bg-danger/15 text-danger",
  "Outils & Modèles": "bg-success/15 text-success",
  "Guides Sectoriels": "bg-warning/15 text-warning",
  "Stratégie de Négociation": "bg-accent/15 text-accent-light",
  // Spanish
  "Guías de Compras": "bg-accent/15 text-accent-light",
  "Gestión de Costes": "bg-danger/15 text-danger",
  "Herramientas y Plantillas": "bg-success/15 text-success",
  "Guías Sectoriales": "bg-warning/15 text-warning",
  "Estrategia de Negociación": "bg-accent/15 text-accent-light",
  // German
  "Einkaufsratgeber": "bg-accent/15 text-accent-light",
  "Kostenmanagement": "bg-danger/15 text-danger",
  "Tools & Vorlagen": "bg-success/15 text-success",
  "Branchenratgeber": "bg-warning/15 text-warning",
  "Verhandlungsstrategie": "bg-accent/15 text-accent-light",
  // Swedish
  "Inköpsguider": "bg-accent/15 text-accent-light",
  "Kostnadshantering": "bg-danger/15 text-danger",
  "Verktyg & Mallar": "bg-success/15 text-success",
  "Branschguider": "bg-warning/15 text-warning",
  "Förhandlingsstrategi": "bg-accent/15 text-accent-light",
};

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const posts = await getAllPostsAsync(locale);
  const meta = blogMeta[locale] || blogMeta.en;

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/">
            <QuotalLogo className="h-5 w-auto" />
          </a>
          <a
            href="/sign-in"
            className="text-sm font-medium bg-accent hover:bg-accent-light text-white px-5 py-2 rounded-lg transition-all duration-150"
          >
            Try Quotal free
          </a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            {meta.heading}
          </h1>
          <p className="text-text-muted text-lg">{meta.subheading}</p>
        </div>

        <div className="grid gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block p-6 rounded-xl border border-border bg-surface hover:bg-surface-hover transition-all duration-200 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    categoryColors[post.category] ||
                    "bg-accent/15 text-accent-light"
                  }`}
                >
                  {post.category}
                </span>
                <span className="text-xs text-text-dim">
                  {post.readingTime}
                </span>
              </div>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-accent-light transition-colors duration-150">
                {post.title}
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <QuotalLogo className="h-4 w-auto" />
            <span className="text-xs text-text-dim">
              {new Date().getFullYear()} Quotal. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="/terms"
              className="text-xs text-text-dim hover:text-text-muted transition-colors"
            >
              Terms
            </a>
            <a
              href="/privacy"
              className="text-xs text-text-dim hover:text-text-muted transition-colors"
            >
              Privacy
            </a>
            <a
              href="mailto:contact@quotal.app"
              className="text-xs text-text-dim hover:text-text-muted transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

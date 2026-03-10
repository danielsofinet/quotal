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

const categoryGradients: Record<string, string> = {
  // English
  "Procurement Guides": "bg-gradient-to-br from-accent/20 via-accent/5 to-transparent",
  "Cost Management": "bg-gradient-to-br from-danger/20 via-danger/5 to-transparent",
  "Tools & Templates": "bg-gradient-to-br from-success/20 via-success/5 to-transparent",
  "Industry Guides": "bg-gradient-to-br from-warning/20 via-warning/5 to-transparent",
  "Negotiation Strategy": "bg-gradient-to-br from-accent/15 via-[#8B5CF6]/10 to-transparent",
  // French
  "Guides Achats": "bg-gradient-to-br from-accent/20 via-accent/5 to-transparent",
  "Gestion des Coûts": "bg-gradient-to-br from-danger/20 via-danger/5 to-transparent",
  "Outils & Modèles": "bg-gradient-to-br from-success/20 via-success/5 to-transparent",
  "Guides Sectoriels": "bg-gradient-to-br from-warning/20 via-warning/5 to-transparent",
  "Stratégie de Négociation": "bg-gradient-to-br from-accent/15 via-[#8B5CF6]/10 to-transparent",
  // Spanish
  "Guías de Compras": "bg-gradient-to-br from-accent/20 via-accent/5 to-transparent",
  "Gestión de Costes": "bg-gradient-to-br from-danger/20 via-danger/5 to-transparent",
  "Herramientas y Plantillas": "bg-gradient-to-br from-success/20 via-success/5 to-transparent",
  "Guías Sectoriales": "bg-gradient-to-br from-warning/20 via-warning/5 to-transparent",
  "Estrategia de Negociación": "bg-gradient-to-br from-accent/15 via-[#8B5CF6]/10 to-transparent",
  // German
  "Einkaufsratgeber": "bg-gradient-to-br from-accent/20 via-accent/5 to-transparent",
  "Kostenmanagement": "bg-gradient-to-br from-danger/20 via-danger/5 to-transparent",
  "Tools & Vorlagen": "bg-gradient-to-br from-success/20 via-success/5 to-transparent",
  "Branchenratgeber": "bg-gradient-to-br from-warning/20 via-warning/5 to-transparent",
  "Verhandlungsstrategie": "bg-gradient-to-br from-accent/15 via-[#8B5CF6]/10 to-transparent",
  // Swedish
  "Inköpsguider": "bg-gradient-to-br from-accent/20 via-accent/5 to-transparent",
  "Kostnadshantering": "bg-gradient-to-br from-danger/20 via-danger/5 to-transparent",
  "Verktyg & Mallar": "bg-gradient-to-br from-success/20 via-success/5 to-transparent",
  "Branschguider": "bg-gradient-to-br from-warning/20 via-warning/5 to-transparent",
  "Förhandlingsstrategi": "bg-gradient-to-br from-accent/15 via-[#8B5CF6]/10 to-transparent",
};

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

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-14 text-center">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-accent-light mb-3">
            {meta.heading}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {meta.subheading}
          </h1>
        </div>

        {posts.length > 0 && (
          <>
            {/* Featured post — large hero card */}
            <Link
              href={`/blog/${posts[0].slug}`}
              className="group block mb-8 rounded-2xl border border-border bg-surface overflow-hidden hover:shadow-xl hover:shadow-black/5 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="grid md:grid-cols-2">
                <div className={`aspect-[4/3] md:aspect-auto ${
                  categoryGradients[posts[0].category] || "bg-gradient-to-br from-accent/20 via-accent/10 to-transparent"
                }`} />
                <div className="p-8 flex flex-col justify-center">
                  <span
                    className={`self-start text-xs font-medium px-2.5 py-1 rounded-full mb-4 ${
                      categoryColors[posts[0].category] || "bg-accent/15 text-accent-light"
                    }`}
                  >
                    {posts[0].category}
                  </span>
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-accent-light transition-colors duration-150 leading-tight">
                    {posts[0].title}
                  </h2>
                  <p className="text-sm text-text-muted leading-relaxed mb-4 line-clamp-3">
                    {posts[0].description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-dim">
                    <span>{new Date(posts[0].date).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span className="w-1 h-1 rounded-full bg-text-dim" />
                    <span>{posts[0].readingTime}</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Remaining posts — 2-column grid */}
            {posts.length > 1 && (
              <div className="grid md:grid-cols-2 gap-6">
                {posts.slice(1).map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group block rounded-2xl border border-border bg-surface overflow-hidden hover:shadow-xl hover:shadow-black/5 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className={`h-48 ${
                      categoryGradients[post.category] || "bg-gradient-to-br from-accent/20 via-accent/10 to-transparent"
                    }`} />
                    <div className="p-6">
                      <span
                        className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${
                          categoryColors[post.category] || "bg-accent/15 text-accent-light"
                        }`}
                      >
                        {post.category}
                      </span>
                      <h2 className="text-lg font-semibold mb-2 group-hover:text-accent-light transition-colors duration-150 leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-sm text-text-muted leading-relaxed line-clamp-2 mb-4">
                        {post.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-text-dim">
                          <span>{new Date(post.date).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}</span>
                          <span className="w-1 h-1 rounded-full bg-text-dim" />
                          <span>{post.readingTime}</span>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-dim group-hover:text-accent-light transition-colors">
                          <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
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
              href="mailto:hello@quotal.app"
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

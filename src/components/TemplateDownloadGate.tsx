"use client";

import { useState } from "react";

const i18n: Record<string, {
  title: string;
  subtitle: string;
  placeholder: string;
  button: string;
  downloading: string;
  retry: string;
  error: string;
  scrollCta: string;
}> = {
  en: {
    title: "Download the free template",
    subtitle: "Get the Excel template with all formulas ready to use. Enter your email and it's yours.",
    placeholder: "you@company.com",
    button: "Download",
    downloading: "Downloading now!",
    retry: "Didn't start? Click here to download",
    error: "Something went wrong. Please try again.",
    scrollCta: "Download the template",
  },
  fr: {
    title: "Téléchargez le modèle gratuit",
    subtitle: "Obtenez le modèle Excel avec toutes les formules prêtes à l'emploi. Entrez votre e-mail et il est à vous.",
    placeholder: "vous@entreprise.com",
    button: "Télécharger",
    downloading: "Téléchargement en cours !",
    retry: "Ça n'a pas démarré ? Cliquez ici pour télécharger",
    error: "Une erreur est survenue. Veuillez réessayer.",
    scrollCta: "Télécharger le modèle",
  },
  de: {
    title: "Kostenlose Vorlage herunterladen",
    subtitle: "Holen Sie sich die Excel-Vorlage mit allen fertigen Formeln. Geben Sie Ihre E-Mail ein und sie gehört Ihnen.",
    placeholder: "sie@unternehmen.de",
    button: "Herunterladen",
    downloading: "Download läuft!",
    retry: "Nicht gestartet? Hier klicken zum Herunterladen",
    error: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
    scrollCta: "Vorlage herunterladen",
  },
  es: {
    title: "Descarga la plantilla gratis",
    subtitle: "Obtén la plantilla Excel con todas las fórmulas listas para usar. Ingresa tu correo y es tuya.",
    placeholder: "tu@empresa.com",
    button: "Descargar",
    downloading: "¡Descargando ahora!",
    retry: "¿No empezó? Haz clic aquí para descargar",
    error: "Algo salió mal. Por favor, inténtalo de nuevo.",
    scrollCta: "Descargar la plantilla",
  },
  sv: {
    title: "Ladda ner den gratis mallen",
    subtitle: "Få Excel-mallen med alla formler redo att använda. Ange din e-post så är den din.",
    placeholder: "du@foretag.se",
    button: "Ladda ner",
    downloading: "Laddar ner nu!",
    retry: "Startade inte? Klicka här för att ladda ner",
    error: "Något gick fel. Försök igen.",
    scrollCta: "Ladda ner mallen",
  },
};

export function TemplateScrollButton({ locale }: { locale: string }) {
  const t = i18n[locale] || i18n.en;

  return (
    <div className="my-8 text-center">
      <button
        onClick={() => document.getElementById("template-download")?.scrollIntoView({ behavior: "smooth" })}
        className="inline-flex items-center gap-2 bg-[#635BFF] hover:bg-[#7C6CF7] text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 1v10m0 0L4 7.5M8 11l4-3.5M2 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {t.scrollCta}
      </button>
    </div>
  );
}

export default function TemplateDownloadGate({ locale = "en" }: { locale?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const t = i18n[locale] || i18n.en;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "template-download" }),
      });

      if (!res.ok) throw new Error();

      setStatus("done");

      // Trigger download via API route (static file 404s on Vercel)
      window.open("/api/download-template", "_blank");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div id="template-download" className="my-8 p-6 bg-[#0D3B2E] border border-[#00C48C]/30 rounded-xl text-center">
        <div className="text-2xl mb-2">&#10003;</div>
        <p className="text-[#00C48C] font-semibold text-lg mb-1">{t.downloading}</p>
        <p className="text-[#8BB8A8] text-sm">
          <a
            href="/api/download-template"
            download
            className="text-[#00C48C] underline"
          >
            {t.retry}
          </a>
        </p>
      </div>
    );
  }

  return (
    <div id="template-download" className="my-8 p-6 bg-[#12121A] border border-[#2A2A3E] rounded-xl">
      <p className="text-white font-semibold text-lg mb-1">{t.title}</p>
      <p className="text-[#8888A0] text-sm mb-4">{t.subtitle}</p>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.placeholder}
          required
          className="flex-1 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#5A5A72] focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF]/30"
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="bg-[#635BFF] hover:bg-[#7C6CF7] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {status === "loading" ? "..." : t.button}
        </button>
      </form>
      {status === "error" && (
        <p className="text-[#FF6B6B] text-sm mt-2">{t.error}</p>
      )}
    </div>
  );
}

import { ServerClient } from "postmark";

let client: ServerClient | null = null;

export function getPostmarkClient(): ServerClient {
  if (client) return client;

  const token = process.env.POSTMARK_SERVER_TOKEN;
  if (!token) {
    throw new Error("POSTMARK_SERVER_TOKEN is not configured");
  }

  client = new ServerClient(token);
  return client;
}

const FROM_ADDRESS = process.env.POSTMARK_FROM_ADDRESS || "login@quotal.app";
const WELCOME_FROM = process.env.POSTMARK_WELCOME_FROM || FROM_ADDRESS;

interface MagicLinkStrings {
  subject: string;
  heading: string;
  intro: string;
  cta: string;
  expires: string;
  ignore: string;
  footer: string;
  prefs: string;
}

const magicLinkI18n: Record<string, MagicLinkStrings> = {
  en: {
    subject: "Your Quotal sign-in link",
    heading: "Sign in to Quotal",
    intro: "Click the button below to sign in. This link is valid for 10 minutes.",
    cta: "Sign in to Quotal",
    expires: "This link expires in 10 minutes.",
    ignore: "If you didn't request this, you can safely ignore this email.",
    footer: "Questions? Just reply to this email.",
    prefs: "Email preferences",
  },
  fr: {
    subject: "Votre lien de connexion Quotal",
    heading: "Connectez-vous à Quotal",
    intro: "Cliquez sur le bouton ci-dessous pour vous connecter. Ce lien est valide pendant 10 minutes.",
    cta: "Se connecter à Quotal",
    expires: "Ce lien expire dans 10 minutes.",
    ignore: "Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet e-mail.",
    footer: "Des questions ? Répondez simplement à cet e-mail.",
    prefs: "Préférences e-mail",
  },
  de: {
    subject: "Ihr Quotal-Anmeldelink",
    heading: "Bei Quotal anmelden",
    intro: "Klicken Sie auf die Schaltfläche unten, um sich anzumelden. Dieser Link ist 10 Minuten gültig.",
    cta: "Bei Quotal anmelden",
    expires: "Dieser Link läuft in 10 Minuten ab.",
    ignore: "Falls Sie dies nicht angefordert haben, können Sie diese E-Mail ignorieren.",
    footer: "Fragen? Antworten Sie einfach auf diese E-Mail.",
    prefs: "E-Mail-Einstellungen",
  },
  es: {
    subject: "Tu enlace de inicio de sesión en Quotal",
    heading: "Inicia sesión en Quotal",
    intro: "Haz clic en el botón de abajo para iniciar sesión. Este enlace es válido durante 10 minutos.",
    cta: "Iniciar sesión en Quotal",
    expires: "Este enlace caduca en 10 minutos.",
    ignore: "Si no solicitaste esto, puedes ignorar este correo.",
    footer: "¿Preguntas? Solo responde a este correo.",
    prefs: "Preferencias de correo",
  },
  sv: {
    subject: "Din Quotal-inloggningslänk",
    heading: "Logga in på Quotal",
    intro: "Klicka på knappen nedan för att logga in. Länken är giltig i 10 minuter.",
    cta: "Logga in på Quotal",
    expires: "Länken upphör att gälla om 10 minuter.",
    ignore: "Om du inte begärde detta kan du ignorera detta e-postmeddelande.",
    footer: "Frågor? Svara bara på detta e-postmeddelande.",
    prefs: "E-postinställningar",
  },
};

function buildMagicLinkHtml(t: MagicLinkStrings, signInLink: string, locale: string): string {
  return `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F4F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F4F7;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">

<tr><td style="padding:40px 40px 32px;border-bottom:1px solid #EDEDF0;">
<img src="https://quotal.app/quotal-logo.svg" alt="Quotal" width="120" style="width:120px;display:block;" />
</td></tr>

<tr><td style="padding:36px 40px 20px;">
<h1 style="margin:0 0 16px;color:#0A2540;font-size:24px;font-weight:700;letter-spacing:-0.3px;">${t.heading}</h1>
<p style="margin:0;color:#4A5568;font-size:15px;line-height:1.7;">${t.intro}</p>
</td></tr>

<tr><td style="padding:8px 40px 32px;text-align:center;">
<a href="${signInLink}" style="display:inline-block;background-color:#635BFF;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;padding:13px 36px;border-radius:8px;">${t.cta}</a>
</td></tr>

<tr><td style="padding:0 40px 28px;">
<p style="margin:0 0 8px;color:#64748B;font-size:13px;line-height:1.6;">${t.expires}</p>
<p style="margin:0;color:#64748B;font-size:13px;line-height:1.6;">${t.ignore}</p>
</td></tr>

<tr><td style="padding:0 40px 24px;">
<p style="margin:0;color:#B0B0C0;font-size:12px;line-height:1.5;word-break:break-all;">${signInLink}</p>
</td></tr>

<tr><td style="background-color:#FAFAFA;padding:24px 40px;border-top:1px solid #EDEDF0;">
<p style="margin:0 0 6px;color:#8888A0;font-size:13px;line-height:1.5;text-align:center;">${t.footer}</p>
<p style="margin:0 0 12px;color:#8888A0;font-size:13px;line-height:1.5;text-align:center;"><a href="https://quotal.app" style="color:#635BFF;text-decoration:none;">quotal.app</a></p>
<p style="margin:0;color:#B0B0C0;font-size:11px;line-height:1.5;text-align:center;">Quotal &middot; Stockholm, Sweden<br><a href="https://quotal.app/settings" style="color:#B0B0C0;text-decoration:underline;">${t.prefs}</a></p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function sendMagicLinkEmail(
  to: string,
  signInLink: string,
  locale: string = "en"
) {
  const pm = getPostmarkClient();
  const t = magicLinkI18n[locale] || magicLinkI18n.en;

  const textBody = `${t.heading}\n\n${t.intro}\n\n${signInLink}\n\n${t.expires} ${t.ignore}`;

  await pm.sendEmail({
    From: FROM_ADDRESS,
    To: to,
    Subject: t.subject,
    TextBody: textBody,
    HtmlBody: buildMagicLinkHtml(t, signInLink, locale),
    MessageStream: "outbound",
  });
}

interface WelcomeStrings {
  subject: string;
  heading: string;
  greeting: string;
  intro: string;
  whatYouCanDo: string;
  f1Title: string; f1Desc: string;
  f2Title: string; f2Desc: string;
  f3Title: string; f3Desc: string;
  f4Title: string; f4Desc: string;
  f5Title: string; f5Desc: string;
  getStarted: string;
  s1: string; s1Desc: string;
  s2: string; s2Desc: string;
  s3: string; s3Desc: string;
  cta: string;
  footer: string;
  prefs: string;
}

const welcomeI18n: Record<string, WelcomeStrings> = {
  en: {
    subject: "Welcome to Quotal",
    heading: "Welcome to Quotal",
    greeting: "Hi",
    intro: "you're all set. Quotal helps you stop comparing vendor quotes in spreadsheets — upload any document, and get a clear side-by-side comparison in seconds.",
    whatYouCanDo: "What you can do",
    f1Title: "Upload any format", f1Desc: "PDF, Excel, CSV, images, or plain text. AI extracts every line item automatically.",
    f2Title: "Compare side by side", f2Desc: "All vendors normalized into one clean table. Best price highlighted, differences flagged.",
    f3Title: "Catch hidden fees", f3Desc: "AI reads the fine print. Fuel surcharges, minimum order penalties, nothing slips through.",
    f4Title: "Forward emails", f4Desc: "Send supplier emails to your Quotal inbox. Quotes get extracted and filed automatically.",
    f5Title: "Any language", f5Desc: "Works with quotes in English, German, French, Spanish, Swedish, and Dutch.",
    getStarted: "Get started",
    s1: "Create a project", s1Desc: "name it after what you're sourcing",
    s2: "Upload quotes", s2Desc: "drag & drop files or forward emails",
    s3: "Compare & decide", s3Desc: "see normalized pricing side by side",
    cta: "Go to your dashboard",
    footer: "Questions? Just reply to this email.",
    prefs: "Email preferences",
  },
  fr: {
    subject: "Bienvenue sur Quotal",
    heading: "Bienvenue sur Quotal",
    greeting: "Bonjour",
    intro: "tout est prêt. Quotal vous aide à arrêter de comparer les devis fournisseurs dans des tableurs — importez n'importe quel document et obtenez une comparaison claire en quelques secondes.",
    whatYouCanDo: "Ce que vous pouvez faire",
    f1Title: "Importez n'importe quel format", f1Desc: "PDF, Excel, CSV, images ou texte brut. L'IA extrait automatiquement chaque poste.",
    f2Title: "Comparez côte à côte", f2Desc: "Tous les fournisseurs normalisés dans un tableau clair. Meilleur prix mis en avant, écarts signalés.",
    f3Title: "Détectez les frais cachés", f3Desc: "L'IA lit les petites lignes. Surcharges carburant, pénalités de commande minimum, rien ne passe inaperçu.",
    f4Title: "Transférez vos e-mails", f4Desc: "Envoyez les e-mails fournisseurs vers votre boîte Quotal. Les devis sont extraits et classés automatiquement.",
    f5Title: "Toutes les langues", f5Desc: "Fonctionne avec des devis en anglais, allemand, français, espagnol, suédois et néerlandais.",
    getStarted: "Pour commencer",
    s1: "Créez un projet", s1Desc: "nommez-le d'après ce que vous achetez",
    s2: "Importez des devis", s2Desc: "glissez-déposez ou transférez par e-mail",
    s3: "Comparez et décidez", s3Desc: "visualisez les prix normalisés côte à côte",
    cta: "Accéder au tableau de bord",
    footer: "Des questions ? Répondez simplement à cet e-mail.",
    prefs: "Préférences e-mail",
  },
  de: {
    subject: "Willkommen bei Quotal",
    heading: "Willkommen bei Quotal",
    greeting: "Hallo",
    intro: "alles ist eingerichtet. Quotal hilft Ihnen, Lieferantenangebote nicht mehr in Tabellen vergleichen zu müssen — laden Sie ein beliebiges Dokument hoch und erhalten Sie in Sekunden einen übersichtlichen Vergleich.",
    whatYouCanDo: "Das können Sie tun",
    f1Title: "Beliebiges Format hochladen", f1Desc: "PDF, Excel, CSV, Bilder oder Klartext. Die KI extrahiert automatisch jede Position.",
    f2Title: "Seite an Seite vergleichen", f2Desc: "Alle Anbieter normalisiert in einer übersichtlichen Tabelle. Bester Preis hervorgehoben, Unterschiede markiert.",
    f3Title: "Versteckte Kosten erkennen", f3Desc: "Die KI liest das Kleingedruckte. Treibstoffzuschläge, Mindestbestellstrafen — nichts wird übersehen.",
    f4Title: "E-Mails weiterleiten", f4Desc: "Leiten Sie Lieferanten-E-Mails an Ihren Quotal-Posteingang weiter. Angebote werden automatisch extrahiert und eingeordnet.",
    f5Title: "Jede Sprache", f5Desc: "Funktioniert mit Angeboten auf Englisch, Deutsch, Französisch, Spanisch, Schwedisch und Niederländisch.",
    getStarted: "Erste Schritte",
    s1: "Projekt erstellen", s1Desc: "benennen Sie es nach dem, was Sie beschaffen",
    s2: "Angebote hochladen", s2Desc: "per Drag & Drop oder E-Mail-Weiterleitung",
    s3: "Vergleichen und entscheiden", s3Desc: "normalisierte Preise nebeneinander sehen",
    cta: "Zum Dashboard",
    footer: "Fragen? Antworten Sie einfach auf diese E-Mail.",
    prefs: "E-Mail-Einstellungen",
  },
  es: {
    subject: "Bienvenido a Quotal",
    heading: "Bienvenido a Quotal",
    greeting: "Hola",
    intro: "ya está todo listo. Quotal te ayuda a dejar de comparar cotizaciones de proveedores en hojas de cálculo — sube cualquier documento y obtén una comparación clara en segundos.",
    whatYouCanDo: "Lo que puedes hacer",
    f1Title: "Sube cualquier formato", f1Desc: "PDF, Excel, CSV, imágenes o texto plano. La IA extrae cada partida automáticamente.",
    f2Title: "Compara lado a lado", f2Desc: "Todos los proveedores normalizados en una tabla clara. Mejor precio destacado, diferencias señaladas.",
    f3Title: "Detecta costos ocultos", f3Desc: "La IA lee la letra pequeña. Recargos por combustible, penalidades por pedido mínimo, nada se escapa.",
    f4Title: "Reenvía correos", f4Desc: "Envía los correos de proveedores a tu bandeja Quotal. Las cotizaciones se extraen y organizan automáticamente.",
    f5Title: "Cualquier idioma", f5Desc: "Funciona con cotizaciones en inglés, alemán, francés, español, sueco y neerlandés.",
    getStarted: "Primeros pasos",
    s1: "Crea un proyecto", s1Desc: "ponle el nombre de lo que estás comprando",
    s2: "Sube cotizaciones", s2Desc: "arrastra y suelta archivos o reenvía correos",
    s3: "Compara y decide", s3Desc: "visualiza precios normalizados lado a lado",
    cta: "Ir al panel",
    footer: "¿Preguntas? Solo responde a este correo.",
    prefs: "Preferencias de correo",
  },
  sv: {
    subject: "Välkommen till Quotal",
    heading: "Välkommen till Quotal",
    greeting: "Hej",
    intro: "allt är klart. Quotal hjälper dig sluta jämföra leverantörsofferter i kalkylblad — ladda upp valfritt dokument och få en tydlig jämförelse på sekunder.",
    whatYouCanDo: "Vad du kan göra",
    f1Title: "Ladda upp valfritt format", f1Desc: "PDF, Excel, CSV, bilder eller ren text. AI extraherar varje rad automatiskt.",
    f2Title: "Jämför sida vid sida", f2Desc: "Alla leverantörer normaliserade i en tydlig tabell. Bästa pris markerat, skillnader flaggade.",
    f3Title: "Fånga dolda avgifter", f3Desc: "AI läser det finstilta. Bränsletillägg, minimiorderstraff, inget slinker igenom.",
    f4Title: "Vidarebefordra e-post", f4Desc: "Skicka leverantörsmail till din Quotal-inkorg. Offerter extraheras och sorteras automatiskt.",
    f5Title: "Alla språk", f5Desc: "Fungerar med offerter på engelska, tyska, franska, spanska, svenska och nederländska.",
    getStarted: "Kom igång",
    s1: "Skapa ett projekt", s1Desc: "namnge det efter vad du upphandlar",
    s2: "Ladda upp offerter", s2Desc: "dra och släpp filer eller vidarebefordra e-post",
    s3: "Jämför och besluta", s3Desc: "se normaliserade priser sida vid sida",
    cta: "Gå till instrumentpanelen",
    footer: "Frågor? Svara bara på detta e-postmeddelande.",
    prefs: "E-postinställningar",
  },
};

function buildWelcomeHtml(t: WelcomeStrings, displayName: string, lang: string): string {
  const icon = (emoji: string) =>
    `<div style="width:32px;height:32px;background-color:#F4F4F7;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">${emoji}</div>`;
  const feature = (emoji: string, title: string, desc: string, last = false) =>
    `<tr><td style="padding:0 40px ${last ? "32" : "20"}px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="40" valign="top" style="padding-right:14px;padding-top:1px;">${icon(emoji)}</td>
<td valign="top"><p style="margin:0;color:#0A2540;font-size:14px;line-height:1.6;"><strong>${title}</strong> <span style="color:#64748B;">&mdash; ${desc}</span></p></td>
</tr></table>
</td></tr>`;
  const step = (n: number, title: string, desc: string, last = false) =>
    `<tr>
<td width="36" valign="top" ${last ? "" : 'style="padding-bottom:14px;"'}><div style="width:24px;height:24px;background-color:#0A2540;border-radius:50%;color:#FFFFFF;font-size:12px;font-weight:700;text-align:center;line-height:24px;">${n}</div></td>
<td valign="top" style="${last ? "" : "padding-bottom:14px;"}padding-left:10px;"><p style="margin:0;color:#4A5568;font-size:14px;line-height:24px;"><strong style="color:#0A2540;">${title}</strong> &mdash; ${desc}</p></td>
</tr>`;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F4F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F4F7;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">

<tr><td style="padding:40px 40px 32px;border-bottom:1px solid #EDEDF0;">
<img src="https://quotal.app/quotal-logo.svg" alt="Quotal" width="120" style="width:120px;display:block;" />
</td></tr>

<tr><td style="padding:36px 40px 20px;">
<h1 style="margin:0 0 16px;color:#0A2540;font-size:24px;font-weight:700;letter-spacing:-0.3px;">${t.heading}</h1>
<p style="margin:0;color:#4A5568;font-size:15px;line-height:1.7;">${t.greeting} ${displayName}, ${t.intro}</p>
</td></tr>

<tr><td style="padding:20px 40px 8px;">
<p style="margin:0 0 20px;color:#0A2540;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">${t.whatYouCanDo}</p>
</td></tr>

${feature("&#128196;", t.f1Title, t.f1Desc)}
${feature("&#128202;", t.f2Title, t.f2Desc)}
${feature("&#128270;", t.f3Title, t.f3Desc)}
${feature("&#128231;", t.f4Title, t.f4Desc)}
${feature("&#127760;", t.f5Title, t.f5Desc, true)}

<tr><td style="padding:0 40px;"><div style="height:1px;background-color:#EDEDF0;"></div></td></tr>

<tr><td style="padding:28px 40px 8px;">
<p style="margin:0 0 20px;color:#0A2540;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">${t.getStarted}</p>
</td></tr>

<tr><td style="padding:0 40px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${step(1, t.s1, t.s1Desc)}
${step(2, t.s2, t.s2Desc)}
${step(3, t.s3, t.s3Desc, true)}
</table>
</td></tr>

<tr><td style="padding:0 40px 40px;text-align:center;">
<a href="https://quotal.app/dashboard" style="display:inline-block;background-color:#635BFF;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;padding:13px 36px;border-radius:8px;">${t.cta}</a>
</td></tr>

<tr><td style="background-color:#FAFAFA;padding:24px 40px;border-top:1px solid #EDEDF0;">
<p style="margin:0 0 6px;color:#8888A0;font-size:13px;line-height:1.5;text-align:center;">${t.footer}</p>
<p style="margin:0 0 12px;color:#8888A0;font-size:13px;line-height:1.5;text-align:center;"><a href="https://quotal.app" style="color:#635BFF;text-decoration:none;">quotal.app</a></p>
<p style="margin:0;color:#B0B0C0;font-size:11px;line-height:1.5;text-align:center;">Quotal &middot; Stockholm, Sweden<br><a href="https://quotal.app/settings" style="color:#B0B0C0;text-decoration:underline;">${t.prefs}</a></p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function buildWelcomeText(t: WelcomeStrings, displayName: string): string {
  return `${t.heading}

${t.greeting} ${displayName}, ${t.intro}

${t.whatYouCanDo}:
- ${t.f1Title} — ${t.f1Desc}
- ${t.f2Title} — ${t.f2Desc}
- ${t.f3Title} — ${t.f3Desc}
- ${t.f4Title} — ${t.f4Desc}
- ${t.f5Title} — ${t.f5Desc}

${t.getStarted}:
1. ${t.s1} — ${t.s1Desc}
2. ${t.s2} — ${t.s2Desc}
3. ${t.s3} — ${t.s3Desc}

${t.cta}: https://quotal.app/dashboard

${t.footer}

Quotal · Stockholm, Sweden`;
}

export async function sendWelcomeEmail(to: string, name?: string | null, locale: string = "en") {
  const pm = getPostmarkClient();
  const displayName = name || (locale === "de" ? "dort" : locale === "fr" ? "là" : locale === "sv" ? "där" : locale === "es" ? "ahí" : "there");
  const t = welcomeI18n[locale] || welcomeI18n.en;

  await pm.sendEmail({
    From: WELCOME_FROM,
    To: to,
    Subject: t.subject,
    TextBody: buildWelcomeText(t, displayName),
    HtmlBody: buildWelcomeHtml(t, displayName, locale),
    MessageStream: "outbound",
  });
}

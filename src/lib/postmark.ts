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

export async function sendMagicLinkEmail(
  to: string,
  signInLink: string,
  locale: string = "en"
) {
  const pm = getPostmarkClient();

  const subjects: Record<string, string> = {
    en: "Your Quotal sign-in link",
    fr: "Votre lien de connexion Quotal",
    sv: "Din Quotal-inloggningslänk",
    de: "Ihr Quotal-Anmeldelink",
    es: "Tu enlace de inicio de sesión en Quotal",
  };

  const bodies: Record<string, string> = {
    en: `Click the link below to sign in to Quotal:\n\n${signInLink}\n\nThis link expires in 10 minutes. If you didn't request this, you can safely ignore this email.`,
    fr: `Cliquez sur le lien ci-dessous pour vous connecter à Quotal :\n\n${signInLink}\n\nCe lien expire dans 10 minutes. Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet e-mail.`,
    sv: `Klicka på länken nedan för att logga in på Quotal:\n\n${signInLink}\n\nDen här länken upphör att gälla om 10 minuter. Om du inte begärde detta kan du ignorera detta e-postmeddelande.`,
    de: `Klicken Sie auf den Link unten, um sich bei Quotal anzumelden:\n\n${signInLink}\n\nDieser Link läuft in 10 Minuten ab. Falls Sie dies nicht angefordert haben, können Sie diese E-Mail ignorieren.`,
    es: `Haz clic en el enlace de abajo para iniciar sesión en Quotal:\n\n${signInLink}\n\nEste enlace caduca en 10 minutos. Si no solicitaste esto, puedes ignorar este correo.`,
  };

  await pm.sendEmail({
    From: FROM_ADDRESS,
    To: to,
    Subject: subjects[locale] || subjects.en,
    TextBody: bodies[locale] || bodies.en,
    MessageStream: "outbound",
  });
}

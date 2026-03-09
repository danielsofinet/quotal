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

export async function sendWelcomeEmail(to: string, name?: string | null) {
  const pm = getPostmarkClient();
  const displayName = name || "there";

  const textBody = `Welcome to Quotal, ${displayName}!

You're all set. Quotal helps you stop comparing vendor quotes in spreadsheets — upload any document, and get a clear side-by-side comparison in seconds.

What you can do:
- Upload any format — PDF, Excel, CSV, images, or plain text
- Compare side by side — all vendors normalized into one clean table
- Catch hidden fees — AI reads the fine print for you
- Forward emails — send supplier emails to your Quotal inbox
- Any language — English, German, French, Spanish, Swedish, and Dutch

Get started:
1. Create a project — name it after what you're sourcing
2. Upload quotes — drag & drop files or forward emails
3. Compare & decide — see normalized pricing side by side

Go to your dashboard: https://quotal.app/dashboard

Questions? Just reply to this email.

Quotal · Stockholm, Sweden`;

  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F4F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F4F7;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">

<tr><td style="padding:40px 40px 32px;border-bottom:1px solid #EDEDF0;">
<img src="https://quotal.app/quotal-logo.svg" alt="Quotal" width="120" style="width:120px;display:block;" />
</td></tr>

<tr><td style="padding:36px 40px 20px;">
<h1 style="margin:0 0 16px;color:#0A2540;font-size:24px;font-weight:700;letter-spacing:-0.3px;">Welcome to Quotal</h1>
<p style="margin:0;color:#4A5568;font-size:15px;line-height:1.7;">Hi ${displayName}, you're all set. Quotal helps you stop comparing vendor quotes in spreadsheets &mdash; upload any document, and get a clear side-by-side comparison in seconds.</p>
</td></tr>

<tr><td style="padding:20px 40px 8px;">
<p style="margin:0 0 20px;color:#0A2540;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">What you can do</p>
</td></tr>

<tr><td style="padding:0 40px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="40" valign="top" style="padding-right:14px;padding-top:1px;"><div style="width:32px;height:32px;background-color:#F4F4F7;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">&#128196;</div></td>
<td valign="top"><p style="margin:0;color:#0A2540;font-size:14px;line-height:1.6;"><strong>Upload any format</strong> <span style="color:#64748B;">&mdash; PDF, Excel, CSV, images, or plain text. AI extracts every line item automatically.</span></p></td>
</tr></table>
</td></tr>

<tr><td style="padding:0 40px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="40" valign="top" style="padding-right:14px;padding-top:1px;"><div style="width:32px;height:32px;background-color:#F4F4F7;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">&#128202;</div></td>
<td valign="top"><p style="margin:0;color:#0A2540;font-size:14px;line-height:1.6;"><strong>Compare side by side</strong> <span style="color:#64748B;">&mdash; all vendors normalized into one clean table. Best price highlighted, differences flagged.</span></p></td>
</tr></table>
</td></tr>

<tr><td style="padding:0 40px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="40" valign="top" style="padding-right:14px;padding-top:1px;"><div style="width:32px;height:32px;background-color:#F4F4F7;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">&#128270;</div></td>
<td valign="top"><p style="margin:0;color:#0A2540;font-size:14px;line-height:1.6;"><strong>Catch hidden fees</strong> <span style="color:#64748B;">&mdash; AI reads the fine print. Fuel surcharges, minimum order penalties, nothing slips through.</span></p></td>
</tr></table>
</td></tr>

<tr><td style="padding:0 40px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="40" valign="top" style="padding-right:14px;padding-top:1px;"><div style="width:32px;height:32px;background-color:#F4F4F7;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">&#128231;</div></td>
<td valign="top"><p style="margin:0;color:#0A2540;font-size:14px;line-height:1.6;"><strong>Forward emails</strong> <span style="color:#64748B;">&mdash; send supplier emails to your Quotal inbox. Quotes get extracted and filed automatically.</span></p></td>
</tr></table>
</td></tr>

<tr><td style="padding:0 40px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="40" valign="top" style="padding-right:14px;padding-top:1px;"><div style="width:32px;height:32px;background-color:#F4F4F7;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">&#127760;</div></td>
<td valign="top"><p style="margin:0;color:#0A2540;font-size:14px;line-height:1.6;"><strong>Any language</strong> <span style="color:#64748B;">&mdash; works with quotes in English, German, French, Spanish, Swedish, and Dutch.</span></p></td>
</tr></table>
</td></tr>

<tr><td style="padding:0 40px;"><div style="height:1px;background-color:#EDEDF0;"></div></td></tr>

<tr><td style="padding:28px 40px 8px;">
<p style="margin:0 0 20px;color:#0A2540;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Get started</p>
</td></tr>

<tr><td style="padding:0 40px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td width="36" valign="top" style="padding-bottom:14px;"><div style="width:24px;height:24px;background-color:#0A2540;border-radius:50%;color:#FFFFFF;font-size:12px;font-weight:700;text-align:center;line-height:24px;">1</div></td>
<td valign="top" style="padding-bottom:14px;padding-left:10px;"><p style="margin:0;color:#4A5568;font-size:14px;line-height:24px;"><strong style="color:#0A2540;">Create a project</strong> &mdash; name it after what you're sourcing</p></td>
</tr>
<tr>
<td width="36" valign="top" style="padding-bottom:14px;"><div style="width:24px;height:24px;background-color:#0A2540;border-radius:50%;color:#FFFFFF;font-size:12px;font-weight:700;text-align:center;line-height:24px;">2</div></td>
<td valign="top" style="padding-bottom:14px;padding-left:10px;"><p style="margin:0;color:#4A5568;font-size:14px;line-height:24px;"><strong style="color:#0A2540;">Upload quotes</strong> &mdash; drag &amp; drop files or forward emails</p></td>
</tr>
<tr>
<td width="36" valign="top"><div style="width:24px;height:24px;background-color:#0A2540;border-radius:50%;color:#FFFFFF;font-size:12px;font-weight:700;text-align:center;line-height:24px;">3</div></td>
<td valign="top" style="padding-left:10px;"><p style="margin:0;color:#4A5568;font-size:14px;line-height:24px;"><strong style="color:#0A2540;">Compare &amp; decide</strong> &mdash; see normalized pricing side by side</p></td>
</tr>
</table>
</td></tr>

<tr><td style="padding:0 40px 40px;text-align:center;">
<a href="https://quotal.app/dashboard" style="display:inline-block;background-color:#635BFF;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;padding:13px 36px;border-radius:8px;">Go to your dashboard</a>
</td></tr>

<tr><td style="background-color:#FAFAFA;padding:24px 40px;border-top:1px solid #EDEDF0;">
<p style="margin:0 0 6px;color:#8888A0;font-size:13px;line-height:1.5;text-align:center;">Questions? Just reply to this email.</p>
<p style="margin:0 0 12px;color:#8888A0;font-size:13px;line-height:1.5;text-align:center;"><a href="https://quotal.app" style="color:#635BFF;text-decoration:none;">quotal.app</a></p>
<p style="margin:0;color:#B0B0C0;font-size:11px;line-height:1.5;text-align:center;">Quotal &middot; Stockholm, Sweden<br><a href="https://quotal.app/settings" style="color:#B0B0C0;text-decoration:underline;">Email preferences</a></p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  await pm.sendEmail({
    From: WELCOME_FROM,
    To: to,
    Subject: "Welcome to Quotal",
    TextBody: textBody,
    HtmlBody: htmlBody,
    MessageStream: "outbound",
  });
}

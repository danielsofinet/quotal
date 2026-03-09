import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { sendMagicLinkEmail } from "@/lib/postmark";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(`magic-link:${ip}`, 3, 60_000);
  if (!rl.success) return rateLimitResponse(60_000);

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { email, locale } = body;
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    const adminAuth = getAdminAuth();

    const origin =
      request.headers.get("origin") ||
      request.headers.get("referer")?.replace(/\/[^/]*$/, "") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://quotal.app";

    const signInLink = await adminAuth.generateSignInWithEmailLink(email, {
      url: `${origin}/sign-in?finishSignIn=true`,
      handleCodeInApp: true,
    });

    await sendMagicLinkEmail(email, signInLink, locale || "en");

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Magic link failed:", msg);
    return NextResponse.json(
      { error: "Failed to send sign-in link", debug: msg },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = rateLimit(`portal:${user.id}`, 5, 60_000);
  if (!rl.success) return rateLimitResponse(60_000);

  if (!user.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 400 });
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${request.nextUrl.origin}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}

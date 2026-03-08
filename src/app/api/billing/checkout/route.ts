import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = rateLimit(`checkout:${user.id}`, 5, 60_000);
  if (!rl.success) return rateLimitResponse(60_000);

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { interval } = body; // "monthly" or "yearly"

  const priceId =
    interval === "yearly"
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY
      : process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY;

  if (!priceId) {
    return NextResponse.json({ error: "Price not configured" }, { status: 500 });
  }

  // Reuse existing Stripe customer if we have one
  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${request.nextUrl.origin}/dashboard?upgraded=true`,
    cancel_url: `${request.nextUrl.origin}/dashboard`,
    metadata: { userId: user.id },
  });

  return NextResponse.json({ url: session.url });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function PATCH(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = rateLimit(`profile:${user.id}`, 10, 60_000);
  if (!rl.success) return rateLimitResponse(60_000);

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, inboxPrefix } = body;

  // Handle inbox prefix update (Pro only)
  if (inboxPrefix !== undefined) {
    if (user.plan !== "pro") {
      return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
    }

    if (typeof inboxPrefix !== "string" || !inboxPrefix.trim()) {
      return NextResponse.json({ error: "Inbox prefix is required" }, { status: 400 });
    }

    const clean = inboxPrefix.trim().toLowerCase();

    if (!/^[a-zA-Z0-9._+-]+$/.test(clean)) {
      return NextResponse.json({ error: "Only letters, numbers, dots, hyphens, and plus signs allowed" }, { status: 400 });
    }

    if (clean.length > 40) {
      return NextResponse.json({ error: "Prefix must be 40 characters or less" }, { status: 400 });
    }

    const newAddress = `${clean}@in.quotal.app`;

    // Check uniqueness
    const existing = await prisma.user.findUnique({ where: { inboxAddress: newAddress } });
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: "This address is already taken" }, { status: 409 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { inboxAddress: newAddress },
    });

    return NextResponse.json({ inboxAddress: updated.inboxAddress });
  }

  // Handle name update
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (name.length > 100) {
    return NextResponse.json({ error: "Name must be 100 characters or less" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name: name.trim() },
  });

  return NextResponse.json({ name: updated.name });
}

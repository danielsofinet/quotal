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

  const { name } = body;

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

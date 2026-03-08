import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAdminAuth } from "@/lib/firebase-admin";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = rateLimit(`delete-user:${user.id}`, 3, 600_000);
  if (!rl.success) return rateLimitResponse(600_000);

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { confirmEmail } = body;

  if (!confirmEmail || confirmEmail !== user.email) {
    return NextResponse.json({ error: "Email does not match" }, { status: 400 });
  }

  // Delete all user data (cascades: projects → quotes → lineItems/fees)
  await prisma.user.delete({ where: { id: user.id } });

  // Delete Firebase user
  try {
    const adminAuth = getAdminAuth();
    await adminAuth.deleteUser(user.firebaseUid);
  } catch {
    // User may already be deleted from Firebase — continue
  }

  // Clear session cookie
  const response = NextResponse.json({ deleted: true });
  response.cookies.set("__session", "", { maxAge: 0, path: "/" });
  return response;
}

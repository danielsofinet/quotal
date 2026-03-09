import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const session = request.cookies.get("__session")?.value;

  if (!session) {
    return NextResponse.json({ error: "No __session cookie", cookies: request.cookies.getAll().map(c => c.name) });
  }

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return NextResponse.json({
      status: "valid",
      uid: decoded.uid,
      email: decoded.email,
      cookieLength: session.length,
    });
  } catch (err) {
    return NextResponse.json({
      status: "invalid",
      error: err instanceof Error ? err.message : String(err),
      cookieLength: session.length,
    });
  }
}

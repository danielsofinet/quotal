import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const steps: Record<string, unknown> = {};

  // Step 1: Read cookie
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("__session")?.value;
    steps.cookie = session ? `found (${session.length} chars)` : "MISSING";
    if (!session) return NextResponse.json(steps);

    // Step 2: Verify with Firebase
    try {
      const adminAuth = getAdminAuth();
      const decoded = await adminAuth.verifySessionCookie(session, true);
      steps.firebase = { uid: decoded.uid, email: decoded.email };

      // Step 3: Find user in DB
      try {
        const user = await prisma.user.findUnique({
          where: { firebaseUid: decoded.uid },
        });
        steps.dbUser = user ? { id: user.id, email: user.email } : "NOT_FOUND";

        // Step 4: If no user, show what we'd create
        if (!user) {
          steps.wouldCreate = {
            firebaseUid: decoded.uid,
            email: decoded.email || `${decoded.uid}@firebase.user`,
          };
        }
      } catch (dbErr) {
        steps.dbError = dbErr instanceof Error ? dbErr.message : String(dbErr);
      }
    } catch (fbErr) {
      steps.firebaseError = fbErr instanceof Error ? fbErr.message : String(fbErr);
    }
  } catch (cookieErr) {
    steps.cookieError = cookieErr instanceof Error ? cookieErr.message : String(cookieErr);
  }

  return NextResponse.json(steps);
}

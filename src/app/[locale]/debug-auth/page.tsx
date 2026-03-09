import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DebugAuthPage() {
  const steps: Record<string, unknown> = {};

  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll().map((c) => c.name);
    const session = cookieStore.get("__session")?.value;
    steps.allCookies = allCookies;
    steps.cookie = session ? `found (${session.length} chars)` : "MISSING";

    if (session) {
      try {
        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifySessionCookie(session, true);
        steps.firebase = { uid: decoded.uid, email: decoded.email };

        const user = await prisma.user.findUnique({
          where: { firebaseUid: decoded.uid },
        });
        steps.dbUser = user ? { id: user.id, email: user.email } : "NOT_FOUND";
      } catch (err) {
        steps.error = err instanceof Error ? err.message : String(err);
      }
    }
  } catch (err) {
    steps.cookieError = err instanceof Error ? err.message : String(err);
  }

  return <pre>{JSON.stringify(steps, null, 2)}</pre>;
}

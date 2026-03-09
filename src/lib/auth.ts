import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { getAdminAuth } from "./firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { getLocale } from "next-intl/server";
import { sendWelcomeEmail } from "./postmark";

const NTFY_TOPIC = process.env.NTFY_TOPIC || "quotal-signups-d7x";

function notifyNewUser(email: string, name?: string | null) {
  fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
    method: "POST",
    headers: { Title: "New Quotal signup", Tags: "tada" },
    body: `${name || "Unknown"} (${email})`,
  }).catch(() => {});
}

/**
 * Verify Firebase token from Authorization header and find/create user in DB.
 * Used by API routes.
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const idToken = authHeader.slice(7);
  return verifyAndGetUser(idToken);
}

/**
 * Verify Firebase session cookie and find/create user in DB.
 * Used by server-rendered pages.
 */
export async function getAuthenticatedUserFromCookies() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;
  if (!sessionCookie) return null;

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return findOrCreateUser(decoded.uid, decoded.email, decoded.name);
  } catch {
    return null;
  }
}

/**
 * Get authenticated user with all projects (for server pages).
 * Single DB query — avoids the double-fetch from findOrCreateUser + findUnique.
 */
export async function getUserWithProjects() {
  const cookieStore = await cookies();
  const allCookieNames = cookieStore.getAll().map((c) => c.name);
  const sessionCookie = cookieStore.get("__session")?.value;
  if (!sessionCookie) {
    console.log("[auth] No __session cookie found. All cookies:", allCookieNames);
    return null;
  }

  try {
    console.log("[auth] Verifying session cookie, length:", sessionCookie.length);
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    console.log("[auth] Session verified for uid:", decoded.uid);

    // Try to find user with projects in one query
    let user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: {
        projects: {
          include: {
            _count: { select: { quotes: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { inboxItems: { where: { assignedToProjectId: null } } } },
      },
    });

    // Auto-create if first sign-in
    if (!user) {
      const inboxAddress = `${(decoded.email || "").split("@")[0].replace(/[^a-zA-Z0-9._+-]/g, "").slice(0, 40) || uuidv4().slice(0, 8)}@in.quotal.app`;
      const created = await prisma.user.create({
        data: {
          firebaseUid: decoded.uid,
          email: decoded.email || `${decoded.uid}@firebase.user`,
          name: decoded.name || null,
          inboxAddress,
        },
      });
      user = { ...created, projects: [], _count: { inboxItems: 0 } };
      const locale = await getLocale().catch(() => "en");
      sendWelcomeEmail(created.email, created.name, locale).catch((err) =>
        console.error("[auth] Welcome email failed:", err instanceof Error ? err.message : String(err))
      );
      notifyNewUser(created.email, created.name);
    }

    return user;
  } catch (err) {
    console.error("[auth] Session verify failed:", err instanceof Error ? err.message : String(err));
    return null;
  }
}

async function verifyAndGetUser(idToken: string) {
  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    return findOrCreateUser(decoded.uid, decoded.email, decoded.name);
  } catch {
    return null;
  }
}

export { PLAN_LIMITS, getPlanLimits } from "./plans";

async function findOrCreateUser(
  firebaseUid: string,
  email?: string,
  name?: string,
) {
  let user = await prisma.user.findUnique({ where: { firebaseUid } });

  if (!user) {
    const inboxAddress = `${(email || "").split("@")[0].replace(/[^a-zA-Z0-9._+-]/g, "").slice(0, 40) || uuidv4().slice(0, 8)}@in.quotal.app`;
    user = await prisma.user.create({
      data: {
        firebaseUid,
        email: email || `${firebaseUid}@firebase.user`,
        name: name || null,
        inboxAddress,
      },
    });
    sendWelcomeEmail(user.email, user.name, "en").catch((err) =>
      console.error("[auth] Welcome email failed:", err instanceof Error ? err.message : String(err))
    );
    notifyNewUser(user.email, user.name);
  }

  return user;
}
